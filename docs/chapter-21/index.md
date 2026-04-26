# 第21章：Flask 快速上手

## 本章简介

Flask 是 Python 生态中最经典的轻量级 Web 框架之一。它不像 Django 那样自带完整后台能力，也不像 FastAPI 那样强依赖类型提示和自动文档，而是把核心保持得很小：路由、请求、响应、模板和扩展机制。

如果你来自前端，Flask 很像后端世界里的 “Express.js”：先用很少的代码跑起来，再按业务需要逐步接入数据库、认证、表单、后台任务等能力。

**学习目标**：
- 理解 Flask 的应用对象、路由和请求响应模型
- 掌握模板渲染、静态资源和蓝图拆分
- 学会用 Flask 构建 RESTful API
- 理解 Flask 与 FastAPI、Django 的适用场景
- 完成一个轻量级待办 API 的核心实现

---

## 21.1 为什么学习 Flask

### Flask 的定位

| 框架 | 核心特点 | 适合场景 |
|------|----------|----------|
| Flask | 轻量、灵活、扩展生态丰富 | 小型 API、后台工具、原型验证、微服务 |
| FastAPI | 类型提示、自动文档、异步友好 | 前后端分离 API、高并发服务 |
| Django | 大而全、内置 ORM/Admin/认证 | 内容管理、后台系统、业务平台 |

Flask 的优势不是 “什么都内置”，而是 “你可以清楚地知道每一层是怎么加进来的”。这对学习 Web 框架非常友好。

### 与 Express.js 对比

```javascript
// Express.js
const express = require('express');
const app = express();

app.use(express.json());

app.get('/hello/:name', (req, res) => {
  res.json({ message: `Hello, ${req.params.name}` });
});

app.listen(3000);
```

```python
# Flask
from flask import Flask, jsonify

app = Flask(__name__)

@app.get("/hello/<name>")
def hello(name):
    return jsonify({"message": f"Hello, {name}"})

if __name__ == "__main__":
    app.run(debug=True)
```

---

## 21.2 安装和第一个应用

### 创建项目

```bash
mkdir flask-todo-api
cd flask-todo-api

python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

pip install flask
pip freeze > requirements.txt
```

### 最小应用

```python
# app.py
from flask import Flask

app = Flask(__name__)

@app.get("/")
def index():
    return {"message": "Hello Flask"}

if __name__ == "__main__":
    app.run(debug=True)
```

启动服务：

```bash
python app.py
```

访问：

```txt
http://127.0.0.1:5000
```

### 使用 flask 命令启动

```bash
# macOS / Linux
export FLASK_APP=app.py
export FLASK_DEBUG=1
flask run

# Windows PowerShell
$env:FLASK_APP = "app.py"
$env:FLASK_DEBUG = "1"
flask run
```

---

## 21.3 路由和请求参数

### 路径参数

```python
from flask import Flask

app = Flask(__name__)

@app.get("/users/<int:user_id>")
def get_user(user_id):
    return {
        "id": user_id,
        "name": f"user-{user_id}"
    }
```

常见转换器：

| 转换器 | 说明 | 示例 |
|--------|------|------|
| `string` | 默认字符串 | `/posts/<slug>` |
| `int` | 整数 | `/users/<int:user_id>` |
| `float` | 浮点数 | `/prices/<float:value>` |
| `path` | 可包含斜杠的路径 | `/files/<path:file_path>` |

### 查询参数

```python
from flask import request

@app.get("/search")
def search():
    keyword = request.args.get("keyword", "")
    page = request.args.get("page", default=1, type=int)
    size = request.args.get("size", default=10, type=int)

    return {
        "keyword": keyword,
        "page": page,
        "size": size,
        "items": []
    }
```

访问：

```txt
/search?keyword=python&page=2&size=20
```

### JSON 请求体

```python
from flask import request

@app.post("/posts")
def create_post():
    data = request.get_json()

    title = data.get("title")
    content = data.get("content", "")

    if not title:
        return {"error": "title is required"}, 400

    return {
        "id": 1,
        "title": title,
        "content": content
    }, 201
```

---

## 21.4 响应、错误处理和中间件

### 返回 JSON 和状态码

```python
@app.get("/health")
def health_check():
    return {"status": "ok"}, 200

@app.delete("/posts/<int:post_id>")
def delete_post(post_id):
    return "", 204
```

Flask 会自动把字典转成 JSON 响应。复杂场景也可以显式使用 `jsonify`：

```python
from flask import jsonify

@app.get("/profile")
def profile():
    return jsonify({
        "username": "alice",
        "role": "admin"
    })
```

### 统一错误处理

```python
from werkzeug.exceptions import NotFound, BadRequest

@app.errorhandler(NotFound)
def handle_not_found(error):
    return {"error": "resource not found"}, 404

@app.errorhandler(BadRequest)
def handle_bad_request(error):
    return {"error": "bad request"}, 400
```

### 请求前后钩子

```python
from flask import g, request
import time

@app.before_request
def before_request():
    g.start_time = time.time()

@app.after_request
def after_request(response):
    duration = time.time() - g.start_time
    response.headers["X-Response-Time"] = f"{duration:.4f}s"
    return response
```

这类似 Express 里的中间件，但 Flask 将常见生命周期拆成了更明确的钩子。

---

## 21.5 模板和静态资源

Flask 不只适合写 API，也可以渲染传统服务端页面。

### 项目结构

```
flask-site/
├── app.py
├── templates/
│   ├── base.html
│   └── index.html
└── static/
    └── style.css
```

### 渲染模板

```python
from flask import Flask, render_template

app = Flask(__name__)

@app.get("/")
def index():
    posts = [
        {"title": "Flask 入门", "author": "Alice"},
        {"title": "模板渲染", "author": "Bob"},
    ]
    return render_template("index.html", posts=posts)
```

```html
<!-- templates/index.html -->
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <title>Flask Blog</title>
    <link rel="stylesheet" href="/static/style.css">
  </head>
  <body>
    <h1>文章列表</h1>
    <ul>
      {% for post in posts %}
        <li>{{ post.title }} - {{ post.author }}</li>
      {% endfor %}
    </ul>
  </body>
</html>
```

Jinja2 模板语法和 Vue/React 的 JSX 不同，但核心思想类似：把数据传给视图，再由模板负责展示。

---

## 21.6 蓝图：拆分大型应用

当单文件越来越大时，可以用 Blueprint 拆分路由。

### 推荐结构

```
flask-todo-api/
├── app/
│   ├── __init__.py
│   ├── routes/
│   │   ├── __init__.py
│   │   └── todos.py
│   └── extensions.py
├── run.py
└── requirements.txt
```

### 应用工厂

```python
# app/__init__.py
from flask import Flask
from .routes.todos import todos_bp

def create_app():
    app = Flask(__name__)
    app.config["JSON_AS_ASCII"] = False

    app.register_blueprint(todos_bp, url_prefix="/api/todos")

    @app.get("/health")
    def health_check():
        return {"status": "ok"}

    return app
```

```python
# run.py
from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
```

### 蓝图路由

```python
# app/routes/todos.py
from flask import Blueprint, request

todos_bp = Blueprint("todos", __name__)

todos = [
    {"id": 1, "title": "学习 Flask", "done": False},
]

@todos_bp.get("")
def list_todos():
    return {"items": todos}

@todos_bp.post("")
def create_todo():
    data = request.get_json() or {}
    title = data.get("title")

    if not title:
        return {"error": "title is required"}, 400

    todo = {
        "id": len(todos) + 1,
        "title": title,
        "done": False,
    }
    todos.append(todo)
    return todo, 201
```

---

## 21.7 Flask + 数据库

Flask 不内置 ORM，常见选择是 SQLAlchemy。

```bash
pip install flask-sqlalchemy flask-migrate
```

### 初始化扩展

```python
# app/extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()
```

```python
# app/__init__.py
from flask import Flask
from .extensions import db, migrate

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    migrate.init_app(app, db)

    return app
```

### 定义模型

```python
# app/models.py
from .extensions import db

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    done = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "done": self.done,
        }
```

### 迁移命令

```bash
flask db init
flask db migrate -m "create todos table"
flask db upgrade
```

---

## 21.8 实战：待办事项 API

### API 设计

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/todos` | 获取待办列表 |
| POST | `/api/todos` | 创建待办 |
| PATCH | `/api/todos/<id>` | 更新待办 |
| DELETE | `/api/todos/<id>` | 删除待办 |

### 完整路由示例

```python
from flask import Blueprint, request
from app.extensions import db
from app.models import Todo

todos_bp = Blueprint("todos", __name__)

@todos_bp.get("")
def list_todos():
    keyword = request.args.get("keyword", "")
    query = Todo.query

    if keyword:
        query = query.filter(Todo.title.contains(keyword))

    items = query.order_by(Todo.id.desc()).all()
    return {"items": [item.to_dict() for item in items]}

@todos_bp.post("")
def create_todo():
    data = request.get_json() or {}
    title = data.get("title", "").strip()

    if not title:
        return {"error": "title is required"}, 400

    todo = Todo(title=title)
    db.session.add(todo)
    db.session.commit()

    return todo.to_dict(), 201

@todos_bp.patch("/<int:todo_id>")
def update_todo(todo_id):
    todo = Todo.query.get_or_404(todo_id)
    data = request.get_json() or {}

    if "title" in data:
        todo.title = data["title"].strip()
    if "done" in data:
        todo.done = bool(data["done"])

    db.session.commit()
    return todo.to_dict()

@todos_bp.delete("/<int:todo_id>")
def delete_todo(todo_id):
    todo = Todo.query.get_or_404(todo_id)
    db.session.delete(todo)
    db.session.commit()
    return "", 204
```

---

## 21.9 Flask 项目最佳实践

### 配置分层

```python
# app/config.py
import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///dev.db"

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
```

### 推荐原则

- 使用应用工厂 `create_app()`，方便测试和多环境配置
- 用 Blueprint 按业务模块拆分路由
- 不把数据库连接、认证逻辑、业务逻辑全部写在路由函数里
- API 项目使用统一错误格式
- 生产环境使用 Gunicorn 或 uWSGI 运行 Flask

### 生产运行

```bash
pip install gunicorn
gunicorn "app:create_app()" -w 4 -b 0.0.0.0:8000
```

---

## 练习题

1. 创建一个 Flask 应用，提供 `/health` 接口，返回 `{"status": "ok"}`。
2. 实现 `/api/books` 的 GET 和 POST 接口，数据可以先保存在内存列表中。
3. 给 `/api/books` 增加 `keyword` 查询参数，支持按书名搜索。
4. 使用 Blueprint 拆分 `books` 路由。
5. 尝试接入 Flask-SQLAlchemy，把内存列表改成 SQLite 表。

## 练习答案

### 1. 健康检查接口

```python
from flask import Flask

app = Flask(__name__)

@app.get("/health")
def health():
    return {"status": "ok"}
```

### 2. 图书接口

```python
from flask import Flask, request

app = Flask(__name__)

books = []

@app.get("/api/books")
def list_books():
    return {"items": books}

@app.post("/api/books")
def create_book():
    data = request.get_json() or {}
    title = data.get("title")

    if not title:
        return {"error": "title is required"}, 400

    book = {"id": len(books) + 1, "title": title}
    books.append(book)
    return book, 201
```

### 3. 搜索参数

```python
@app.get("/api/books")
def list_books():
    keyword = request.args.get("keyword", "")
    items = books

    if keyword:
        items = [
            book for book in books
            if keyword.lower() in book["title"].lower()
        ]

    return {"items": items}
```

---

## 小结

Flask 的核心价值是简单、清晰、灵活。它适合你理解 Python Web 框架的底层工作方式，也适合快速搭建轻量服务。下一章我们会学习 Django，它走的是完全不同的路线：内置更多能力，用统一约定支撑大型业务系统。
