# 第20章：容器化与部署

## 本章简介

开发完成后，下一步就是将应用部署到生产环境。本章将学习如何使用 Docker 容器化应用，并使用 Docker Compose 进行服务编排。

**学习目标**：
- 理解 Docker 容器的基本概念
- 编写优化的 Dockerfile
- 使用 Docker Compose 编排多服务
- 配置 Nginx 反向代理
- 实现 CI/CD 自动部署

---

## 目录

1. [Docker 基础](#docker-基础)
2. [FastAPI 容器化](#fastapi-容器化)
3. [Docker Compose 编排](#docker-compose-编排)
4. [Nginx 配置](#nginx-配置)
5. [CI/CD 部署](#cicd-部署)
6. [练习题](#练习题)
7. [练习答案](#练习答案)

---

## 20.1 Docker 基础

### 什么是 Docker

Docker 是一个开源的容器化平台，可以将应用及其依赖打包到一个轻量级、可移植的容器中。

### Docker vs 虚拟机

```
虚拟机:
┌─────────────────────────────────────┐
│           应用程序                    │
├─────────────────────────────────────┤
│           Guest OS                   │
├─────────────────────────────────────┤
│           Hypervisor                 │
├─────────────────────────────────────┤
│           Host OS                    │
└─────────────────────────────────────┘

Docker:
┌─────────────────────────────────────┐
│           应用程序                    │
├─────────────────────────────────────┤
│           Docker Engine              │
├─────────────────────────────────────┤
│           Host OS                    │
└─────────────────────────────────────┘
```

| 特性 | 虚拟机 | Docker |
|------|--------|--------|
| 启动速度 | 分钟级 | 秒级 |
| 资源占用 | GB 级 | MB 级 |
| 隔离性 | 完全隔离 | 进程级隔离 |
| 可移植性 | 差 | 好 |

### 安装 Docker

```bash
# macOS
brew install --cask docker

# Ubuntu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 验证安装
docker --version
docker compose version
```

### 常用命令

```bash
# 镜像操作
docker pull python:3.11-slim      # 拉取镜像
docker images                      # 查看本地镜像
docker rmi <image_id>              # 删除镜像

# 容器操作
docker run -d -p 8000:8000 python  # 运行容器
docker ps                          # 查看运行中的容器
docker ps -a                       # 查看所有容器
docker stop <container_id>         # 停止容器
docker rm <container_id>           # 删除容器

# 进入容器
docker exec -it <container_id> /bin/bash

# 查看日志
docker logs <container_id>
docker logs -f <container_id>      # 实时查看

# 清理
docker system prune                 # 清理未使用的资源
```

---

## 20.2 FastAPI 容器化

### 项目结构

```
my-api/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── models.py
│   └── routers/
├── tests/
├── requirements.txt
├── Dockerfile
├── .dockerignore
└── .env.example
```

### 基础 Dockerfile

```dockerfile
# Dockerfile
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY requirements.txt .

# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 8000

# 运行应用
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 优化的 Dockerfile

```dockerfile
# Dockerfile
# ========== 构建阶段 ==========
FROM python:3.11-slim as builder

WORKDIR /build

# 安装构建依赖
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖到临时目录
RUN pip install --user --no-cache-dir -r requirements.txt

# ========== 运行阶段 ==========
FROM python:3.11-slim

# 创建非 root 用户
RUN useradd -m -u 1000 appuser

WORKDIR /app

# 从构建阶段复制依赖
COPY --from=builder /root/.local /root/.local

# 复制应用代码
COPY --chown=appuser:appuser . .

# 切换到非 root 用户
USER appuser

# 确保依赖在 PATH 中
ENV PATH=/root/.local/bin:$PATH

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# 运行应用
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### .dockerignore

```txt
# .dockerignore
__pycache__
*.pyc
*.pyo
*.pyd
.Python
*.so
*.egg
*.egg-info
dist
build
.env
.venv
venv/
ENV/
tests/
.pytest_cache
.coverage
htmlcov/
.git
.gitignore
README.md
Dockerfile
.dockerignore
```

### requirements.txt

```txt
# requirements.txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pydantic-settings==2.1.0
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.9
redis==5.0.1
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
```

### 构建和运行

```bash
# 构建镜像
docker build -t my-api:latest .

# 运行容器
docker run -d \
  --name my-api \
  -p 8000:8000 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  my-api:latest

# 查看日志
docker logs -f my-api

# 停止容器
docker stop my-api
docker rm my-api
```

### 环境变量配置

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 应用配置
    app_name: str = "My API"
    debug: bool = False

    # 数据库
    database_url: str

    # Redis
    redis_url: str

    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    class Config:
        env_file = ".env"

settings = Settings()

# app/main.py
from fastapi import FastAPI
from app.config import settings

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug
)

@app.get("/")
async def root():
    return {
        "app": settings.app_name,
        "debug": settings.debug
    }
```

### .env.example

```env
# .env.example
APP_NAME=My API
DEBUG=false

DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379/0

SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## 20.3 Docker Compose 编排

### 什么是 Docker Compose

Docker Compose 是用于定义和运行多容器 Docker 应用程序的工具。

### docker-compose.yml

```yaml
# docker-compose.yml
version: '3.8'

services:
  # FastAPI 应用
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: fastapi-app
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/mydb
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=${SECRET_KEY:-default-secret-key}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./app:/app/app
      - ./uploads:/app/uploads
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s

  # PostgreSQL 数据库
  db:
    image: postgres:15-alpine
    container_name: postgres-db
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis
  redis:
    image: redis:7-alpine
    container_name: redis-cache
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  # Nginx
  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./static:/usr/share/nginx/html:ro
    depends_on:
      - api
    networks:
      - app-network
    restart: unless-stopped

  # Celery Worker
  celery-worker:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: celery-worker
    command: celery -A app.tasks worker --loglevel=info
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/mydb
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    volumes:
      - ./app:/app/app
      - ./uploads:/app/uploads
    networks:
      - app-network
    restart: unless-stopped

  # Celery Beat
  celery-beat:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: celery-beat
    command: celery -A app.tasks beat --loglevel=info
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/mydb
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    volumes:
      - ./app:/app/app
    networks:
      - app-network
    restart: unless-stopped

  # Flower (Celery 监控)
  flower:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: flower-monitor
    command: celery -A app.tasks flower --port=5555
    ports:
      - "5555:5555"
    environment:
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

### Compose 常用命令

```bash
# 构建并启动所有服务
docker compose up -d

# 仅构建镜像
docker compose build

# 查看运行中的服务
docker compose ps

# 查看服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f api

# 重启服务
docker compose restart api

# 停止所有服务
docker compose stop

# 停止并删除所有服务
docker compose down

# 停止并删除所有服务和数据卷
docker compose down -v

# 进入容器
docker compose exec api /bin/bash

# 执行命令
docker compose exec api python -m pytest

# 扩展服务（运行多个实例）
docker compose up -d --scale api=3
```

---

## 20.4 Nginx 配置

### nginx.conf

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream api_backend {
        least_conn;
        server api:8000;
        # 多实例负载均衡
        # server api:8000;
        # server api:8001;
        # server api:8002;
    }

    # 限流配置
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    server {
        listen 80;
        server_name api.example.com;

        # 客户端最大请求体大小
        client_max_body_size 100M;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 日志格式
        log_format main '$remote_addr - $remote_user [$time_local] '
                        '"$request" $status $body_bytes_sent '
                        '"$http_referer" "$http_user_agent" '
                        '$request_time $upstream_response_time';

        access_log /var/log/nginx/access.log main;
        error_log /var/log/nginx/error.log warn;

        # API 路由
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;

            proxy_pass http://api_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # WebSocket 支持
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # WebSocket 路由
        location /ws/ {
            proxy_pass http://api_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_read_timeout 86400;
        }

        # 静态文件
        location /static/ {
            alias /usr/share/nginx/html/;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }

        # 健康检查
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }

    # HTTPS 配置
    server {
        listen 443 ssl http2;
        server_name api.example.com;

        # SSL 证书
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # SSL 配置
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # HSTS
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # 其他配置同上...
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://api_backend;
            # ... 其他 proxy 配置
        }
    }

    # HTTP 重定向到 HTTPS
    server {
        listen 80;
        server_name api.example.com;
        return 301 https://$server_name$request_uri;
    }
}
```

### 生成自签名证书（开发环境）

```bash
# 创建 SSL 目录
mkdir -p nginx/ssl

# 生成自签名证书
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=CN/ST=State/L=City/O=Organization/CN=localhost"
```

### Nginx 配置说明

| 配置项 | 说明 |
|--------|------|
| upstream | 定义后端服务器组 |
| least_conn | 最少连接负载均衡 |
| proxy_pass | 代理转发 |
| proxy_set_header | 设置请求头 |
| limit_req_zone | 限流配置 |
| proxy_http_version 1.1 | WebSocket 需要 |
| ssl_certificate | SSL 证书路径 |

---

## 20.5 CI/CD 部署

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # 测试
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-cov

      - name: Run tests
        run: |
          pytest --cov=app --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml

  # 构建和推送镜像
  build:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # 部署到生产环境
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/my-api
            docker compose pull
            docker compose up -d
            docker image prune -f
```

### 部署脚本

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 开始部署..."

# 拉取最新代码
git pull origin main

# 拉取最新镜像
echo "📦 拉取 Docker 镜像..."
docker compose pull

# 停止旧容器
echo "⏹️  停止旧容器..."
docker compose down

# 启动新容器
echo "▶️  启动新容器..."
docker compose up -d

# 等待健康检查
echo "⏳ 等待服务启动..."
sleep 30

# 健康检查
echo "🏥 健康检查..."
HEALTH_CHECK_URL="http://localhost:8000/health"
MAX_ATTEMPTS=10
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if curl -f $HEALTH_CHECK_URL; then
    echo "✅ 部署成功！"
    exit 0
  fi

  ATTEMPT=$((ATTEMPT + 1))
  echo "尝试 $ATTEMPT/$MAX_ATTEMPTS 失败，等待 5 秒..."
  sleep 5
done

echo "❌ 部署失败！健康检查超时"
exit 1
```

### 回滚脚本

```bash
#!/bin/bash
# rollback.sh

set -e

echo "🔄 开始回滚..."

# 回滚到上一个版本
PREVIOUS_VERSION=$(docker images --format "{{.Tag}}" | grep -E "^[0-9a-f]{7}$" | head -2 | tail -1)

if [ -z "$PREVIOUS_VERSION" ]; then
  echo "❌ 没有找到上一个版本"
  exit 1
fi

echo "回滚到版本: $PREVIOUS_VERSION"

# 更新 docker-compose.yml 中的镜像版本
sed -i "s/image: my-api:.*/image: my-api:$PREVIOUS_VERSION/" docker-compose.yml

# 重启服务
docker compose up -d

echo "✅ 回滚完成"
```

---

## 常见问题

### Q1: Docker 镜像太大怎么办？

**A**: 优化镜像大小：

```dockerfile
# 1. 使用更小的基础镜像
FROM python:3.11-alpine  # 比 slim 更小

# 2. 多阶段构建
FROM python:3.11-slim as builder
# ... 构建阶段

FROM python:3.11-slim
COPY --from=builder /app /app

# 3. 清理缓存
RUN pip install --no-cache-dir -r requirements.txt && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 4. 合并 RUN 指令
RUN apt-get update && apt-get install -y gcc && \
    pip install pandas && \
    apt-get purge -y gcc && apt-get clean
```

### Q2: 如何在 Docker 中调试？

**A**: 几种方法：

1. **查看日志**
```bash
docker logs -f container_name
```

2. **进入容器**
```bash
docker exec -it container_name /bin/bash
docker exec -it container_name /bin/sh  # Alpine 镜像
```

3. **安装调试工具**
```dockerfile
RUN apt-get update && apt-get install -y \
    vim \
    curl \
    iputils-ping \
    net-tools
```

4. **使用调试模式启动**
```bash
docker compose run --rm api python -m pdb app/main.py
```

### Q3: 如何处理敏感信息？

**A**: 不要把敏感信息放在镜像或代码中：

1. **使用环境变量**
```yaml
environment:
  - DATABASE_URL=${DATABASE_URL}
```

2. **使用 Docker Secrets**
```yaml
services:
  api:
    secrets:
      - db_password
secrets:
  db_password:
    file: ./secrets/db_password.txt
```

3. **使用 .env 文件**
```bash
# .env
DATABASE_URL=postgresql://...
SECRET_KEY=...

# docker-compose.yml
env_file:
  - .env
```

### Q4: 容器之间如何通信？

**A**: 使用 Docker 网络：

```yaml
services:
  api:
    networks:
      - app-network

  db:
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

```python
# 使用服务名作为主机名
DATABASE_URL = "postgresql://user:pass@db:5432/mydb"
REDIS_URL = "redis://redis:6379/0"
```

---

## 本章小结

### 核心知识点回顾

| 知识点 | 内容 |
|--------|------|
| Docker | 容器化平台，打包应用和依赖 |
| Dockerfile | 定义镜像构建步骤 |
| Docker Compose | 多容器编排工具 |
| Nginx | 反向代理、负载均衡 |
| CI/CD | 自动化构建和部署 |

### 与前端知识对比

| 前端 | Python 后端 |
|------|-------------|
| Dockerfile | Dockerfile |
| docker-compose.yml | docker-compose.yml |
| Nginx (前端静态) | Nginx (反向代理) |
| GitHub Actions (前端) | GitHub Actions (后端) |
| Vercel/Netlify | 云服务器/K8s |

### 下一步

恭喜你完成了所有章节的学习！接下来可以：
1. 完成项目4：全栈实战项目
2. 阅读附录：JS 对比速查表
3. 开始自己的 Python 项目

---

## 练习题

### 基础题

#### 题目 1：编写 Dockerfile

为 FastAPI 应用编写 Dockerfile：
1. 使用 Python 3.11-slim 基础镜像
2. 安装 requirements.txt 中的依赖
3. 暴露 8000 端口
4. 使用 uvicorn 启动应用

#### 题目 2：Docker Compose

编写 docker-compose.yml：
1. 包含 FastAPI 应用
2. 包含 PostgreSQL 数据库
3. 配置服务依赖关系
4. 持久化数据库数据

#### 题题 3：Nginx 配置

配置 Nginx 反向代理：
1. 监听 80 端口
2. /api/ 转发到后端
3. /static/ 服务静态文件
4. 配置日志格式

### 进阶题

#### 题目 4：多阶段构建

使用多阶段构建优化 Dockerfile：
1. 构建阶段安装依赖
2. 运行阶段只复制必要文件
3. 使用非 root 用户运行
4. 添加健康检查

#### 题目 5：完整部署方案

设计完整的部署方案：
1. 编写优化的 Dockerfile
2. 编写完整的 docker-compose.yml（含 Nginx、Redis、PostgreSQL）
3. 配置 Nginx HTTPS
4. 编写部署和回滚脚本

### 挑战题

#### 题目 6：CI/CD 流程

实现完整的 CI/CD 流程：
1. 自动运行测试
2. 构建并推送 Docker 镜像
3. 自动部署到测试环境
4. 人工确认后部署到生产环境

---

## 练习答案

### 基础题答案

#### 题目 1 答案

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 题目 2 答案

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/mydb
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### 题目 3 答案

```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:8000;
    }

    server {
        listen 80;

        location /api/ {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /static/ {
            alias /usr/share/nginx/html/;
        }
    }
}
```

### 进阶题答案

#### 题目 4 答案

```dockerfile
# 构建阶段
FROM python:3.11-slim as builder

WORKDIR /build

RUN apt-get update && apt-get install -y gcc

COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# 运行阶段
FROM python:3.11-slim

RUN useradd -m -u 1000 appuser

WORKDIR /app

COPY --from=builder /root/.local /root/.local
COPY --chown=appuser:appuser . .

USER appuser

ENV PATH=/root/.local/bin:$PATH

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 题目 5 答案

```dockerfile
# Dockerfile
FROM python:3.11-slim as builder

WORKDIR /build
RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.11-slim
RUN useradd -m -u 1000 appuser
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY --chown=appuser:appuser . .
USER appuser
ENV PATH=/root/.local/bin:$PATH
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/mydb
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - api
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:8000;
    }

    server {
        listen 80;
        server_name localhost;

        client_max_body_size 100M;

        location /api/ {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        location /static/ {
            alias /usr/share/nginx/html/;
            expires 30d;
        }
    }

    server {
        listen 443 ssl http2;
        server_name localhost;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;

        location /api/ {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

```bash
# deploy.sh
#!/bin/bash
set -e

echo "🚀 开始部署..."
git pull origin main
docker compose pull
docker compose down
docker compose up -d

echo "⏳ 等待服务启动..."
sleep 30

for i in {1..10}; do
  if curl -f http://localhost:8000/health; then
    echo "✅ 部署成功！"
    exit 0
  fi
  echo "尝试 $i/10 失败"
  sleep 5
done

echo "❌ 部署失败"
exit 1
```

```bash
# rollback.sh
#!/bin/bash
set -e

echo "🔄 开始回滚..."
PREVIOUS_IMAGE=$(docker images --format "{{.Tag}}" | grep -E "^[0-9a-f]{7}$" | head -2 | tail -1)

if [ -z "$PREVIOUS_IMAGE" ]; then
  echo "❌ 没有找到上一个版本"
  exit 1
fi

sed -i "s/image: my-api:.*/image: my-api:$PREVIOUS_IMAGE/" docker-compose.yml
docker compose up -d

echo "✅ 回滚完成"
```

### 挑战题答案

#### 题目 6 答案

```yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: pip install pytest pytest-cov
      - run: pytest --cov=app --cov-report=xml
      - uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - name: Deploy to staging
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/my-api-staging
            docker compose pull
            docker compose up -d

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Request approval
        uses: trstringer/manual-approval@v1.0.0
        with:
          secret: ${{ secrets.GITHUB_TOKEN }}
          approvers: admin
          minimum-approvals: 1
      - name: Deploy to production
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/my-api
            docker compose pull
            docker compose up -d
            docker image prune -f
```

---

> 恭喜你完成了第四部分的学习！接下来可以尝试 [项目4：全栈实战项目](/project-04/)
