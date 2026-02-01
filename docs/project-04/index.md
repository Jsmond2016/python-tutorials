# 项目4：全栈实战项目

## 项目概述

这是本教程的最后一个项目，我们将构建一个完整的全栈应用，整合前面学到的所有知识。

**项目目标**：
- 整合 FastAPI、WebSocket、Celery、Redis 等技术
- 实现前后端分离的完整应用
- 完成容器化部署
- 实现完整的 CI/CD 流程

**功能需求**：
- 用户系统（注册/登录/个人中心）
- 实时聊天（WebSocket）
- 任务管理（CRUD + 状态流转）
- 数据可视化
- 文件上传

## 技术栈

### 后端
- FastAPI
- WebSocket
- Celery + Redis
- PostgreSQL
- Docker

### 前端（读者使用熟悉的技术）
- React/Vue
- WebSocket 客户端
- 状态管理

## 项目结构

```
fullstack-project/
├── backend/                    # 后端
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI 应用
│   │   ├── config.py          # 配置
│   │   ├── models/            # 数据库模型
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── message.py
│   │   │   └── task.py
│   │   ├── schemas/           # Pydantic 模型
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── message.py
│   │   │   └── task.py
│   │   ├── api/               # API 路由
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── messages.py
│   │   │   └── tasks.py
│   │   ├── core/              # 核心功能
│   │   │   ├── __init__.py
│   │   │   ├── security.py    # JWT、密码
│   │   │   ├── deps.py        # 依赖注入
│   │   │   └── websocket.py   # WebSocket 连接管理
│   │   ├── tasks/             # Celery 任务
│   │   │   ├── __init__.py
│   │   │   └── email.py
│   │   └── db.py              # 数据库连接
│   ├── tests/
│   ├── alembic/               # 数据库迁移
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                   # 前端
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml          # 编排
├── nginx/                      # Nginx
│   └── nginx.conf
└── .github/                    # CI/CD
    └── workflows/
        └── deploy.yml
```

## 后端实现

### 1. 用户认证系统

```python
# backend/app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from ..core import security
from ..core.deps import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserResponse, Token

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

@router.post("/register", response_model=UserResponse)
async def register(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    """用户注册"""
    # 检查用户是否存在
    existing_user = db.query(User).filter(
        User.email == user_in.email
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已被注册"
        )

    # 创建用户
    user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=security.get_password_hash(user_in.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return user

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """用户登录"""
    # 验证用户
    user = security.authenticate_user(
        db, form_data.username, form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 创建 Token
    access_token_expires = timedelta(minutes=30)
    access_token = security.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """获取当前用户"""
    user = security.get_current_user(token, db)
    return user
```

### 2. WebSocket 聊天系统

```python
# backend/app/core/websocket.py
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import redis

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

class ConnectionManager:
    """WebSocket 连接管理器"""

    def __init__(self):
        # 活跃连接: {user_id: WebSocket}
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        """用户连接"""
        await websocket.accept()
        self.active_connections[user_id] = websocket

        # 通知其他用户
        await self.broadcast({
            "type": "system",
            "content": f"用户 {user_id} 上线了",
            "online_users": list(self.active_connections.keys())
        })

    def disconnect(self, user_id: str):
        """用户断开"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal(self, message: dict, user_id: str):
        """发送私聊消息"""
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            await websocket.send_json(message)

    async def broadcast(self, message: dict):
        """广播消息"""
        for connection in self.active_connections.values():
            await connection.send_json(message)

manager = ConnectionManager()

# backend/app/api/messages.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from ..core.websocket import manager
from ..core.deps import get_current_user_ws

router = APIRouter()

@router.websocket("/ws/chat")
async def websocket_chat(
    websocket: WebSocket,
    token: str
):
    """WebSocket 聊天端点"""
    # 验证 Token
    user = await get_current_user_ws(token)
    if not user:
        await websocket.close(code=1008, reason="认证失败")
        return

    await manager.connect(user.username, websocket)

    try:
        while True:
            data = await websocket.receive_json()

            message = {
                "type": "message",
                "from": user.username,
                "content": data.get("content"),
                "timestamp": datetime.now().isoformat()
            }

            # 私聊
            if data.get("type") == "private":
                target = data.get("target")
                await manager.send_personal(message, target)

            # 群聊
            else:
                await manager.broadcast(message)

    except WebSocketDisconnect:
        manager.disconnect(user.username)
        await manager.broadcast({
            "type": "system",
            "content": f"用户 {user.username} 离线了",
            "online_users": list(manager.active_connections.keys())
        })
```

### 3. 任务管理系统

```python
# backend/app/api/tasks.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..core.deps import get_db, get_current_user
from ..models.task import Task
from ..schemas.task import TaskCreate, TaskUpdate, TaskResponse
from ..tasks.email import send_notification_email

router = APIRouter()

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取任务列表"""
    tasks = db.query(Task)\
        .filter(Task.owner_id == current_user.id)\
        .offset(skip)\
        .limit(limit)\
        .all()
    return tasks

@router.post("/", response_model=TaskResponse)
async def create_task(
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建任务"""
    task = Task(**task_in.dict(), owner_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)

    # 发送通知邮件（异步）
    send_notification_email.delay(
        current_user.email,
        "新任务创建",
        f"任务 '{task.title}' 已创建"
    )

    return task

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_in: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新任务"""
    task = db.query(Task)\
        .filter(Task.id == task_id, Task.owner_id == current_user.id)\
        .first()

    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")

    # 更新字段
    for field, value in task_in.dict(exclude_unset=True).items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除任务"""
    task = db.query(Task)\
        .filter(Task.id == task_id, Task.owner_id == current_user.id)\
        .first()

    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")

    db.delete(task)
    db.commit()

    return {"message": "任务已删除"}
```

## Docker Compose 配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/fullstack
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=fullstack
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  celery-worker:
    build: ./backend
    command: celery -A app.tasks worker --loglevel=info
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/fullstack
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
      - frontend

volumes:
  postgres_data:
```

## 部署流程

### 1. 本地开发

```bash
# 启动所有服务
docker compose up -d

# 查看日志
docker compose logs -f

# 停止服务
docker compose down
```

### 2. CI/CD 流程

```yaml
# .github/workflows/deploy.yml
name: Deploy Fullstack Project

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: |
          cd backend
          pip install -r requirements.txt
          pytest

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker images
        run: |
          docker build -t myapp-backend ./backend
          docker build -t myapp-frontend ./frontend

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        run: |
          # 部署命令
```

## 总结

本项目整合了本教程学到的所有知识：

- **第1-5章**：Python 基础语法、数据结构、函数
- **第6-10章**：面向对象、模块、异常处理、异步编程、装饰器
- **第11-15章**：FastAPI Web 开发、数据库、认证、测试
- **第16-20章**：WebSocket、任务队列、缓存、日志、部署

完成此项目后，你将具备完整的 Python 后端开发能力，可以独立构建生产级的应用。

## 下一步

恭喜你完成了整个教程！接下来可以：

1. 根据自己的需求扩展项目功能
2. 学习更多 Python 生态系统（如 Django、Flask）
3. 深入学习特定领域（数据科学、机器学习等）
4. 参与开源项目，积累实战经验

祝你编码愉快！
