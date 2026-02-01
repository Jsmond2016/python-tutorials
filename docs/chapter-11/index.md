# 第11章：Web 开发入门

## 本章简介

欢迎来到 Python Web 开发的世界！作为前端开发者，你已经对 Web 有了相当的了解。本章将帮你：

- 系统理解 HTTP 协议的基础知识
- 了解 Python Web 服务器的工作原理
- 对比主流 Python Web 框架的特点
- 掌握 RESTful API 设计原则
- 理解前后端交互的最佳实践

**学习目标**：
- 理解 HTTP 请求/响应的结构
- 了解 WSGI 和 ASGI 规范的区别
- 能够选择合适的 Web 框架
- 掌握 RESTful API 设计原则

---

## 11.1 HTTP 基础

### 什么是 HTTP

HTTP（HyperText Transfer Protocol，超文本传输协议）是 Web 应用之间通信的基础协议。作为前端开发者，你每天都在与 HTTP 打交道。

### HTTP 请求方法

| 方法 | 说明 | 示例 |
|------|------|------|
| GET | 获取资源 | 获取文章列表 |
| POST | 创建资源 | 创建新文章 |
| PUT | 完整更新资源 | 更新整篇文章 |
| PATCH | 部分更新资源 | 更新文章标题 |
| DELETE | 删除资源 | 删除文章 |

### HTTP 状态码

**常见状态码分类**：

```python
# 状态码分类
1xx  # 信息响应
2xx  # 成功响应
3xx  # 重定向
4xx  # 客户端错误
5xx  # 服务器错误
```

**常用状态码**：

| 状态码 | 说明 | 前端对应场景 |
|--------|------|-------------|
| 200 | 成功 | `response.ok === true` |
| 201 | 已创建 | POST 成功创建资源 |
| 204 | 无内容 | DELETE 成功 |
| 400 | 错误请求 | 参数验证失败 |
| 401 | 未认证 | Token 过期 |
| 403 | 禁止访问 | 权限不足 |
| 404 | 未找到 | 资源不存在 |
| 500 | 服务器错误 | 后端异常 |

### HTTP 请求结构

一个典型的 HTTP 请求包含：

```http
POST /api/posts HTTP/1.1
Host: example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "title": "我的第一篇文章",
  "content": "文章内容..."
}
```

**组成部分**：
- **请求行**：方法 + 路径 + 协议版本
- **请求头**：元数据信息
- **请求体**：POST/PUT 的数据

### HTTP 响应结构

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 123

{
  "id": 1,
  "title": "我的第一篇文章",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### JavaScript vs Python 处理 HTTP

```javascript
// JavaScript: fetch API
fetch('https://api.example.com/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ title: 'Hello' })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

```python
# Python: requests 库（同步）
import requests

response = requests.post(
    'https://api.example.com/posts',
    json={'title': 'Hello'},
    headers={'Content-Type': 'application/json'}
)
data = response.json()
print(data)
```

```python
# Python: httpx 库（异步）
import httpx

async with httpx.AsyncClient() as client:
    response = await client.post(
        'https://api.example.com/posts',
        json={'title': 'Hello'}
    )
    data = response.json()
    print(data)
```

---

## 11.2 Web 服务器

### 静态服务器 vs 动态服务器

```
┌─────────────┐
│   浏览器     │
└──────┬──────┘
       │ HTTP 请求
       ▼
┌─────────────────────────────┐
│      Web 服务器              │
├─────────────────────────────┤
│  静态服务器: Nginx, Apache    │
│  → 返回 HTML, CSS, JS, 图片   │
│                              │
│  动态服务器: Python 应用       │
│  → 执行代码，生成动态内容      │
└─────────────────────────────┘
```

### WSGI 规范（同步）

**WSGI**（Web Server Gateway Interface）是 Python Web 应用与服务器的标准接口。

```python
# 简单的 WSGI 应用
def simple_app(environ, start_response):
    """
    environ: 环境字典（包含请求信息）
    start_response: 响应回调函数
    """
    status = '200 OK'
    headers = [('Content-Type', 'text/plain')]
    start_response(status, headers)
    return [b'Hello WSGI!']

# WSGI 服务器会调用这个函数
```

**WSGI 工作流程**：

```
客户端请求
    ↓
WSGI 服务器 (如 Gunicorn)
    ↓
调用 WSGI 应用
    ↓
应用返回响应
    ↓
WSGI 服务器返回给客户端
```

### ASGI 规范（异步）

**ASGI**（Asynchronous Server Gateway Interface）是支持异步的下一代接口。

```python
# 简单的 ASGI 应用
async def simple_app(scope, receive, send):
    """
    scope: 连接信息
    receive: 接收消息的异步函数
    send: 发送消息的异步函数
    """
    await send({
        'type': 'http.response.start',
        'status': 200,
        'headers': [[b'content-type', b'text/plain']],
    })
    await send({
        'type': 'http.response.body',
        'body': b'Hello ASGI!',
    })
```

### WSGI vs ASGI 对比

| 特性 | WSGI | ASGI |
|------|------|------|
| 同步/异步 | 仅同步 | 支持异步 |
| 性能 | 一般 | 高并发 |
| WebSocket | 不支持 | 原生支持 |
| 代表框架 | Flask, Django | FastAPI, Django 4+ |

### Node.js vs Python Web 服务器

```javascript
// Node.js: Express
const express = require('express');
const app = express();

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello!' });
});

app.listen(3000);
```

```python
# Python: FastAPI (ASGI)
from fastapi import FastAPI

app = FastAPI()

@app.get("/api/hello")
async def hello():
    return {"message": "Hello!"}

# 运行: uvicorn main:app
```

**关键区别**：
- Node.js: 天生异步，单线程事件循环
- Python: ASGI 实现异步，传统 WSGI 是同步的

---

## 11.3 框架对比

### Python Web 框架生态

```python
# 三大主流框架对比

# Flask - 轻量级微框架
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/hello')
def hello():
    return jsonify({'message': 'Hello!'})

# FastAPI - 现代异步框架
from fastapi import FastAPI

app = FastAPI()

@app.get("/api/hello")
async def hello():
    return {"message": "Hello!"}

# Django - 全功能框架
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def hello(request):
    return JsonResponse({'message': 'Hello!'})
```

### 框架对比表

| 框架 | 特点 | 适用场景 | 对比前端框架 | 学习曲线 |
|------|------|----------|-------------|----------|
| **Flask** | 轻量、灵活、自由度高 | 小型项目、微服务、API 原型 | Express.js | ⭐⭐ |
| **FastAPI** | 现代、快速、自动文档 | API 开发、高性能服务 | NestJS | ⭐⭐⭐ |
| **Django** | 全功能、ORM、Admin | 企业应用、内容管理 | Next.js (全栈) | ⭐⭐⭐⭐ |

### Flask vs Express.js

```javascript
// Express.js
const express = require('express');
const app = express();

app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.query;
  res.json({ id, name });
});

app.listen(3000);
```

```python
# Flask
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/users/<int:id>')
def get_user(id):
    name = request.args.get('name')
    return jsonify({'id': id, 'name': name})

# 运行: python app.py
```

### FastAPI vs NestJS

```typescript
// NestJS: 装饰器风格
@Controller('users')
export class UsersController {
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { id };
  }
}
```

```python
# FastAPI: 装饰器风格
from fastapi import FastAPI

app = FastAPI()

@app.get("/users/{id}")
async def find_one(id: int):
    return {"id": id}

# 风格非常相似！
```

### 如何选择框架

```
你的需求是什么？

├── 快速构建 API → FastAPI ⭐ 推荐
│   └── 类型安全、自动文档、异步高性能
│
├── 小型项目/微服务 → Flask
│   └── 简单灵活、学习成本低
│
├── 企业级应用 → Django
│   └── 完整生态、Admin 后台、ORM
│
└── 已有 Node.js 经验
    └── FastAPI 语法最接近（装饰器风格）
```

**本教程选择 FastAPI**，原因：
1. 现代化设计，符合当前开发趋势
2. 类型安全，与前端 TypeScript 思想一致
3. 自动生成 API 文档
4. 原生支持异步
5. 学习曲线对前端开发者友好

---

## 11.4 Web 开发核心概念

### MVC/MVT 架构

**前端对比理解**：

```
前端组件化
├── View (JSX/Template)  → 显示
├── State (useState)     → 数据
└── Logic (useEffect)    → 业务逻辑

后端 MVC/MVT
├── Model (数据库模型)     → 数据
├── View (模板/JSON)      → 展示
└── Controller (视图函数)  → 逻辑
```

### 路由（Routing）

路由定义了 URL 路径与处理函数的映射关系。

```javascript
// Express.js 路由
app.get('/api/posts', getAllPosts);
app.get('/api/posts/:id', getPostById);
app.post('/api/posts', createPost);
app.put('/api/posts/:id', updatePost);
app.delete('/api/posts/:id', deletePost);
```

```python
# FastAPI 路由（非常相似！）
@app.get("/api/posts")
async def get_all_posts():
    pass

@app.get("/api/posts/{id}")
async def get_post_by_id(id: int):
    pass

@app.post("/api/posts")
async def create_post():
    pass

@app.put("/api/posts/{id}")
async def update_post(id: int):
    pass

@app.delete("/api/posts/{id}")
async def delete_post(id: int):
    pass
```

### 中间件（Middleware）

中间件是在请求/响应处理过程中的拦截器。

```javascript
// Express.js 中间件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

```python
# FastAPI 中间件
from fastapi import Request

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"{request.method} {request.url}")
    response = await call_next(request)
    return response
```

### RESTful API 设计

**REST 原则**：
1. 资源由 URL 标识
2. 使用标准 HTTP 方法
3. 无状态通信
4. 统一接口

**API 设计示例**：

| 操作 | HTTP 方法 | URL | 说明 |
|------|-----------|-----|------|
| 获取文章列表 | GET | `/api/posts` | ?page=1&limit=10 |
| 获取文章详情 | GET | `/api/posts/123` | 123 是文章 ID |
| 创建文章 | POST | `/api/posts` | Body 包含文章数据 |
| 更新文章 | PUT | `/api/posts/123` | 完整更新 |
| 部分更新 | PATCH | `/api/posts/123` | 部分字段 |
| 删除文章 | DELETE | `/api/posts/123` | 删除资源 |

**最佳实践**：
- 使用名词而非动词：`/posts` 而非 `/getPosts`
- 使用复数形式：`/users` 而非 `/user`
- 版本控制：`/api/v1/posts`
- 过滤参数：`/posts?status=published&sort=-date`

---

## 11.5 前后端交互

### JSON 数据格式

JSON 是前后端通信的标准格式。

```json
{
  "id": 1,
  "title": "Python Web 开发",
  "author": {
    "id": 10,
    "name": "张三"
  },
  "tags": ["python", "web", "fastapi"],
  "created_at": "2024-01-01T00:00:00Z",
  "views": 1000
}
```

### CORS 跨域问题

**什么是 CORS**？

Cross-Origin Resource Sharing（跨域资源共享）是浏览器安全策略。

```
前端: http://localhost:3000
后端: http://localhost:8000
       ↓ 不同端口 = 跨域
```

**解决方式**：

```python
# FastAPI: 添加 CORS 中间件
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 允许的前端地址
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有请求头
)
```

```javascript
// 前端: fetch 会触发 OPTIONS 预检请求
fetch('http://localhost:8000/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',  // 携带 cookie
  body: JSON.stringify({ title: 'Hello' })
});
```

### API 设计最佳实践

**1. 统一的响应格式**：

```json
// 成功响应
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "title": "文章标题"
  }
}

// 错误响应
{
  "code": 400,
  "message": "参数验证失败",
  "errors": [
    {
      "field": "title",
      "message": "标题不能为空"
    }
  ]
}
```

**2. 分页响应**：

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

**3. HTTP 状态码语义化**：

```python
# 200 OK - 成功获取
# 201 Created - 成功创建
# 204 No Content - 成功删除
# 400 Bad Request - 参数错误
# 401 Unauthorized - 未登录
# 403 Forbidden - 无权限
# 404 Not Found - 资源不存在
# 500 Internal Server Error - 服务器错误
```

---

## 常见问题

### Q1: FastAPI 和 Flask 选哪个？

**A**: 作为前端开发者，推荐 **FastAPI**：

1. **类型安全**：与 TypeScript 思想一致
2. **自动文档**：Swagger/ReDoc 自动生成
3. **异步支持**：处理高并发更轻松
4. **验证自动**：基于 Pydantic 的数据验证
5. **风格相似**：装饰器风格与 NestJS 相似

如果是超小型项目，Flask 也足够简单。

### Q2: WSGI 和 ASGI 的区别？

**A**: 记住这个对比：

```
WSGI (同步)          ASGI (异步)
   ↓                    ↓
一个请求一个线程    事件循环处理多个请求
适合简单应用        适合高并发、WebSocket
Flask, Django 2     FastAPI, Django 4+
```

类比：就像 Node.js 是异步的，ASGI 让 Python 也能异步处理请求。

### Q3: 为什么需要 API 版本控制？

**A**: 前端类比：

```javascript
// npm 包版本
"dependencies": {
  "react": "^18.0.0",  // 主版本
  "lodash": "~4.17.21" // 次版本
}
```

API 版本控制原因：
1. **向后兼容**：老版本 API 继续可用
2. **平滑迁移**：客户端逐步升级
3. **A/B 测试**：同时运行不同版本

实践：`/api/v1/posts` → `/api/v2/posts`

### Q4: REST 和 GraphQL 怎么选？

**A**: 类比前端：

| REST | GraphQL |
|------|---------|
| 固定返回结构 | 按需查询 |
| 多个请求 | 单个请求 |
| 简单直接 | 灵活强大 |
| 大多数场景 | 复杂前端需求 |

**建议**：先掌握 REST，GraphQL 是进阶选择。

### Q5: 开发时 CORS 报错怎么办？

**A**: 后端添加 CORS 中间件（见上文），开发环境允许所有来源：

```python
allow_origins=["*"]  # 仅开发环境！
```

生产环境指定具体域名：
```python
allow_origins=["https://yourdomain.com"]
```

---

## 本章小结

### 核心知识点回顾

| 知识点 | 内容 |
|--------|------|
| HTTP | 请求方法、状态码、请求/响应结构 |
| WSGI/ASGI | 同步 vs 异步，选择合适的接口 |
| 框架选择 | Flask（轻量）、FastAPI（现代）、Django（全功能） |
| RESTful API | 资源导向、标准方法、统一接口 |
| CORS | 跨域问题与解决方案 |

### 与前端知识对比

| 前端 | Python 后端 |
|------|-------------|
| `fetch()` | `requests` / `httpx` |
| Express.js | Flask / FastAPI |
| `req.params` | 路径参数 `/{id}` |
| `req.query` | 查询参数 `?key=value` |
| `res.json()` | `JSONResponse` |
| CORS 配置 | 中间件配置 |

### 下一步

下一章我们将深入学习 **FastAPI**，动手实践：
- 创建第一个 FastAPI 应用
- 实现完整的 CRUD 接口
- 处理请求参数和数据验证
- 实现依赖注入和中间件

---

## 练习题

### 基础题

#### 题目 1：HTTP 状态码匹配

将下列场景匹配到合适的 HTTP 状态码：

1. 用户登录密码错误
2. 文章创建成功
3. 请求的文章不存在
4. 用户 Token 过期
5. 服务器数据库连接失败

选项：A. 201, B. 401, C. 404, D. 401, E. 500

#### 题目 2：RESTful API 设计

为博客系统设计以下操作的 API 端点：

1. 获取所有文章（支持分页）
2. 获取单篇文章详情
3. 创建新文章
4. 更新文章标题
5. 删除文章
6. 获取文章的所有评论

#### 题目 3：CORS 配置

指出以下 CORS 配置的问题：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)
```

### 进阶题

#### 题目 4：选择合适的框架

以下场景应该选择哪个框架（Flask/FastAPI/Django）？

1. 快速开发一个内部工具的 API
2. 需要自动生成 API 文档
3. 构建一个带 Admin 后台的内容管理系统
4. 高并发的 WebSocket 实时应用
5. 微服务架构中的小型服务

#### 题目 5：统一响应格式

设计一个符合 RESTful 规范的错误响应，处理"标题长度不能超过100字"的验证错误。

### 挑战题

#### 题目 6：API 版本迁移策略

假设现有 API `GET /api/v1/posts` 需要升级到 v2，v2 将返回文章的分类信息。设计一个平滑的迁移方案，确保：
- 老客户端继续可用
- 新客户端能获取新功能
- 能监控版本使用情况

---

## 练习题答案

### 基础题答案

#### 题目 1 答案

1. → **401**（未认证，密码错误）
2. → **201**（已创建）
3. → **404**（未找到）
4. → **401**（未认证，Token 过期）
5. → **500**（服务器错误）

#### 题目 2 答案

```python
GET    /api/posts?page=1&limit=10    # 获取文章列表
GET    /api/posts/{id}                # 获取文章详情
POST   /api/posts                     # 创建文章
PATCH  /api/posts/{id}                # 部分更新（标题）
DELETE /api/posts/{id}                # 删除文章
GET    /api/posts/{id}/comments       # 获取文章评论
```

#### 题目 3 答案

**问题**：`allow_credentials=True` 与 `allow_origins=["*"]` 冲突

当允许携带凭证时，不能使用通配符 `*`，必须指定具体域名：

```python
# 正确配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 具体域名
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],
)
```

### 进阶题答案

#### 题目 4 答案

1. **Flask** - 快速开发，简单灵活
2. **FastAPI** - 自动文档是核心特性
3. **Django** - Admin 后台开箱即用
4. **FastAPI** - 原生 WebSocket 支持
5. **Flask** - 轻量级，适合微服务

#### 题目 5 答案

```json
{
  "code": 400,
  "message": "参数验证失败",
  "errors": [
    {
      "field": "title",
      "message": "标题长度不能超过100字",
      "constraint": {
        "max_length": 100,
        "actual_length": 120
      }
    }
  ],
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/posts"
}
```

前端处理示例：

```javascript
try {
  const response = await fetch('/api/posts', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  const result = await response.json();

  if (!response.ok) {
    // 显示具体字段错误
    result.errors.forEach(err => {
      console.log(`${err.field}: ${err.message}`);
    });
  }
} catch (error) {
  console.error('网络错误:', error);
}
```

### 挑战题答案

#### 题目 6 答案

**平滑迁移方案**：

**1. 同时保留两个版本**

```python
# v1: 原有接口
@app.get("/api/v1/posts/{id}")
async def get_post_v1(id: int):
    post = await get_post(id)
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content
    }

# v2: 新增分类
@app.get("/api/v2/posts/{id}")
async def get_post_v2(id: int):
    post = await get_post(id)
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "category": {          # 新增
            "id": post.category_id,
            "name": post.category_name
        }
    }
```

**2. 添加版本警告头**

```python
@app.get("/api/v1/posts/{id}")
async def get_post_v1(id: int):
    response_data = {...}
    return JSONResponse(
        content=response_data,
        headers={
            "X-API-Deprecated": "true",
            "X-API-Version": "v2",
            "X-API-Sunset": "2024-12-31"  # 计划废弃日期
        }
    )
```

**3. 使用监控中间件**

```python
@app.middleware("http")
async def track_api_version(request: Request, call_next):
    response = await call_next(request)
    # 提取版本号
    version = request.path_params.get('version', 'none')
    # 记录使用情况（可接入监控系统）
    await log_api_usage(version, request.url.path)
    return response
```

**4. 前端平滑升级**

```javascript
// 使用版本协商
async function getPost(id) {
  // 优先尝试 v2
  try {
    const res = await fetch(`/api/v2/posts/${id}`);
    if (res.ok) return await res.json();
  } catch (e) {}

  // 降级到 v1
  const res = await fetch(`/api/v1/posts/${id}`);
  return await res.json();
}
```

---

> 下一章：[第12章：FastAPI 快速上手](/chapter-12/) - 开始动手编写 API！
