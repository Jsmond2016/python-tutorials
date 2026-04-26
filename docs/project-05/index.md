# 项目5：Flask 轻量任务 API

## 项目简介

本项目使用 Flask 构建一个轻量级任务管理 API。它适合用来练习 Flask 的核心能力：应用工厂、Blueprint、SQLAlchemy、迁移、错误处理和测试。

**项目目标**：
- 使用 Flask 搭建 RESTful API
- 使用 Blueprint 拆分业务模块
- 使用 Flask-SQLAlchemy 持久化数据
- 使用 Flask-Migrate 管理数据库迁移
- 实现统一错误处理和基础测试

**技术栈**：
- Flask - Web 框架
- Flask-SQLAlchemy - ORM 集成
- Flask-Migrate - 数据库迁移
- SQLite - 本地数据库
- pytest - 自动化测试

---

## 功能需求

| 功能 | 接口 | 说明 |
|------|------|------|
| 任务列表 | `GET /api/tasks` | 支持关键词和完成状态筛选 |
| 任务详情 | `GET /api/tasks/<id>` | 获取单个任务 |
| 创建任务 | `POST /api/tasks` | 创建新任务 |
| 更新任务 | `PATCH /api/tasks/<id>` | 修改标题、描述、状态 |
| 删除任务 | `DELETE /api/tasks/<id>` | 删除任务 |
| 健康检查 | `GET /health` | 服务状态检查 |

---

## 项目结构

```
flask-task-api/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── extensions.py
│   ├── models.py
│   ├── routes/
│   │   ├── __init__.py
│   │   └── tasks.py
│   └── errors.py
├── tests/
│   ├── conftest.py
│   └── test_tasks.py
├── migrations/
├── run.py
├── requirements.txt
└── .env.example
```

---

## 第一部分：项目初始化

### 安装依赖

```bash
mkdir flask-task-api
cd flask-task-api

python -m venv .venv
source .venv/bin/activate

pip install flask flask-sqlalchemy flask-migrate python-dotenv pytest
pip freeze > requirements.txt
```

### 配置文件

```python
# app/config.py
import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_AS_ASCII = False

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "sqlite:///task_api.db",
    )

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
```

### 扩展初始化

```python
# app/extensions.py
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
migrate = Migrate()
```

### 应用工厂

```python
# app/__init__.py
from flask import Flask
from .config import DevelopmentConfig
from .errors import register_error_handlers
from .extensions import db, migrate
from .routes.tasks import tasks_bp

def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)

    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
    register_error_handlers(app)

    @app.get("/health")
    def health_check():
        return {"status": "ok"}

    return app
```

### 启动入口

```python
# run.py
from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
```

---

## 第二部分：数据模型

```python
# app/models.py
from datetime import datetime
from .extensions import db

class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, default="")
    is_done = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "is_done": self.is_done,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
```

### 创建数据库

```bash
export FLASK_APP=run.py
flask db init
flask db migrate -m "create tasks table"
flask db upgrade
```

---

## 第三部分：任务接口

```python
# app/routes/tasks.py
from flask import Blueprint, request
from app.extensions import db
from app.models import Task

tasks_bp = Blueprint("tasks", __name__)

@tasks_bp.get("")
def list_tasks():
    keyword = request.args.get("keyword", "").strip()
    is_done = request.args.get("is_done")

    query = Task.query

    if keyword:
        query = query.filter(Task.title.contains(keyword))

    if is_done in ["true", "false"]:
        query = query.filter(Task.is_done == (is_done == "true"))

    tasks = query.order_by(Task.id.desc()).all()
    return {"items": [task.to_dict() for task in tasks]}

@tasks_bp.get("/<int:task_id>")
def get_task(task_id):
    task = Task.query.get_or_404(task_id)
    return task.to_dict()

@tasks_bp.post("")
def create_task():
    data = request.get_json() or {}
    title = data.get("title", "").strip()

    if not title:
        return {"error": "title is required"}, 400

    task = Task(
        title=title,
        description=data.get("description", ""),
    )
    db.session.add(task)
    db.session.commit()

    return task.to_dict(), 201

@tasks_bp.patch("/<int:task_id>")
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json() or {}

    if "title" in data:
        title = data["title"].strip()
        if not title:
            return {"error": "title cannot be empty"}, 400
        task.title = title

    if "description" in data:
        task.description = data["description"]

    if "is_done" in data:
        task.is_done = bool(data["is_done"])

    db.session.commit()
    return task.to_dict()

@tasks_bp.delete("/<int:task_id>")
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return "", 204
```

---

## 第四部分：错误处理

```python
# app/errors.py
from werkzeug.exceptions import HTTPException

def register_error_handlers(app):
    @app.errorhandler(HTTPException)
    def handle_http_error(error):
        return {
            "error": error.name,
            "message": error.description,
        }, error.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        app.logger.exception(error)
        return {
            "error": "Internal Server Error",
            "message": "unexpected server error",
        }, 500
```

---

## 第五部分：接口测试

### 测试配置

```python
# tests/conftest.py
import pytest
from app import create_app
from app.config import TestingConfig
from app.extensions import db

@pytest.fixture()
def app():
    app = create_app(TestingConfig)

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture()
def client(app):
    return app.test_client()
```

### 测试任务接口

```python
# tests/test_tasks.py
def test_create_task(client):
    response = client.post("/api/tasks", json={
        "title": "学习 Flask",
        "description": "完成项目实战",
    })

    assert response.status_code == 201
    data = response.get_json()
    assert data["title"] == "学习 Flask"
    assert data["is_done"] is False

def test_list_tasks(client):
    client.post("/api/tasks", json={"title": "Task A"})
    client.post("/api/tasks", json={"title": "Task B"})

    response = client.get("/api/tasks")

    assert response.status_code == 200
    data = response.get_json()
    assert len(data["items"]) == 2

def test_update_task(client):
    created = client.post("/api/tasks", json={"title": "Task A"})
    task_id = created.get_json()["id"]

    response = client.patch(f"/api/tasks/{task_id}", json={
        "is_done": True,
    })

    assert response.status_code == 200
    assert response.get_json()["is_done"] is True
```

运行测试：

```bash
pytest
```

---

## 第六部分：前端调用示例

```javascript
const API_BASE = 'http://127.0.0.1:5000/api';

export async function fetchTasks() {
  const response = await fetch(`${API_BASE}/tasks`);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
}

export async function createTask(title) {
  const response = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error('Failed to create task');
  return response.json();
}
```

---

## 扩展任务

1. 增加任务优先级：`low`、`medium`、`high`。
2. 增加分页参数：`page` 和 `page_size`。
3. 增加用户登录，只有登录用户可以管理自己的任务。
4. 增加 CORS 支持，让 React/Vue 前端可以调用接口。
5. 使用 Gunicorn 和 Docker 部署这个 API。

## 小结

这个项目覆盖了 Flask API 的基本工程实践。你已经从单文件示例走到了更真实的结构：应用工厂、蓝图、数据库、迁移、统一错误和测试。后续如果要继续扩展，可以加入认证、权限、分页和部署。
