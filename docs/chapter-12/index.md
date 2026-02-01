# 第12章：FastAPI 快速上手

## 本章简介

本章将带你深入学习 FastAPI 框架，构建生产级的 API 服务。FastAPI 是一个现代、快速（高性能）的 Web 框架，基于 Python 3.8+ 的类型提示，使用异步编程。

**学习目标**：
- 掌握 FastAPI 的项目结构和安装配置
- 理解路径操作、参数处理和请求验证
- 学会使用依赖注入系统
- 实现中间件和异常处理
- 掌握 FastAPI 的异步编程模式

---

## 12.1 FastAPI 简介

### 为什么选择 FastAPI

```python
# FastAPI 的核心优势
1. 快速编码 - 减少 40% 的代码量
2. 减少错误 - 自动数据验证
3. 直观易用 - 对 IDE 友好
4. 简单易学 - 类似前端装饰器风格
5. 健壮可靠 - 自动生成交互式文档
6. 性能优异 - 性能接近 NodeJS 和 Go
```

### 安装和项目结构

**安装依赖**：

```bash
# 核心 FastAPI
pip install fastapi

# ASGI 服务器（开发用）
pip install uvicorn[standard]

# 可选：额外功能
pip install python-multipart  # 表单数据
pip install pydantic[email]    # 邮箱验证
```

**最小项目结构**：

```
my-api/
├── main.py          # 应用入口
└── requirements.txt # 依赖列表
```

**Hello World 示例**：

```python
# main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello, {name}!"}
```

**运行应用**：

```bash
# 开发模式（自动重载）
uvicorn main:app --reload

# 访问地址
# http://127.0.0.1:8000
# API 文档: http://127.0.0.1:8000/docs
```

### 与 Express.js 对比

```javascript
// Express.js
const express = require('express');
const app = express();

// 中间件
app.use(express.json());

// 路由
app.get('/hello/:name', (req, res) => {
  const { name } = req.params;
  res.json({ message: `Hello, ${name}!` });
});

app.listen(3000);
```

```python
# FastAPI（语法非常相似！）
from fastapi import FastAPI

app = FastAPI()

@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello, {name}!"}

# 运行: uvicorn main:app --reload
```

### 自动 API 文档

FastAPI 自动生成交互式文档：

| 文档类型 | URL | 说明 |
|----------|-----|------|
| Swagger UI | `/docs` | 可交互的 API 文档 |
| ReDoc | `/redoc` | 美观的文档 |

这相当于前端使用 Storybook 或后端使用 Postman，但完全自动化！

---

## 12.2 路由和请求

### 路径操作（Path Operations）

FastAPI 使用装饰器定义路由，支持所有 HTTP 方法：

```python
from fastapi import FastAPI, HTTPException
from typing import Optional

app = FastAPI()

# GET - 获取资源
@app.get("/posts")
async def get_posts():
    return [{"id": 1, "title": "Post 1"}]

# POST - 创建资源
@app.post("/posts")
async def create_post(post: dict):
    return {"id": 1, **post}

# PUT - 完整更新
@app.put("/posts/{post_id}")
async def update_post(post_id: int, post: dict):
    return {"id": post_id, **post}

# PATCH - 部分更新
@app.patch("/posts/{post_id}")
async def patch_post(post_id: int, title: Optional[str] = None):
    return {"id": post_id, "title": title}

# DELETE - 删除资源
@app.delete("/posts/{post_id}")
async def delete_post(post_id: int):
    return {"message": f"Deleted post {post_id}"}
```

### 路径参数

路径参数是 URL 路径的一部分：

```python
from fastapi import FastAPI

app = FastAPI()

# 基本路径参数
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}

# 类型转换和验证
@app.get("/users/{user_id}")
async def read_user(user_id: int):
    # 如果 user_id 不是整数，自动返回 422 错误
    return {"user_id": user_id}

# 多个路径参数
@app.get("/users/{user_id}/posts/{post_id}")
async def read_user_post(user_id: int, post_id: int):
    return {"user_id": user_id, "post_id": post_id}

# 预设路径参数
@app.get("/files/{file_path:path}")
async def read_file(file_path: str):
    # :path 匹配包含斜杠的路径
    return {"file_path": file_path}
```

**JavaScript 对比**：

```javascript
// Express.js: 路径参数
app.get('/users/:userId/posts/:postId', (req, res) => {
  const { userId, postId } = req.params;
  res.json({ userId, postId });
});
```

### 查询参数

查询参数是 URL 中 `?` 后面的键值对：

```python
from fastapi import FastAPI
from typing import Optional, List

app = FastAPI()

# 基本查询参数
@app.get("/items")
async def read_item(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

# 访问: /items?skip=20&limit=50

# 可选查询参数
@app.get("/search")
async def search(keyword: Optional[str] = None):
    if keyword:
        return {"results": [f"Result for {keyword}"]}
    return {"results": []}

# 多值查询参数
@app.get("/items/")
async def read_items(ids: List[int] = []):
    # 访问: /items/?ids=1&ids=2&ids=3
    return {"ids": ids}

# 必需查询参数（无默认值）
@app.get("/items/filter")
async def filter_items(category: str, sort: str = "desc"):
    # category 是必需的，sort 有默认值
    return {"category": category, "sort": sort}
```

**JavaScript 对比**：

```javascript
// Express.js: 查询参数
app.get('/items', (req, res) => {
  const { skip = 0, limit = 10 } = req.query;
  res.json({ skip: Number(skip), limit: Number(limit) });
});
```

### 请求体（Request Body）

使用 Pydantic 模型定义请求体：

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field, EmailStr

app = FastAPI()

# 定义请求模型
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=20)
    email: EmailStr
    password: str = Field(..., min_length=8)
    age: Optional[int] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

@app.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate):
    # FastAPI 自动验证：
    # - username 长度 3-20
    # - email 格式正确
    # - password 至少 8 位
    return {
        "id": 1,
        "username": user.username,
        "email": user.email
    }
```

**请求示例**：

```bash
curl -X POST "http://localhost:8000/users" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

### 表单数据和文件上传

```python
from fastapi import FastAPI, File, UploadFile, Form

app = FastAPI()

# 表单数据
@app.post("/login")
async def login(
    username: str = Form(...),
    password: str = Form(...)
):
    return {"username": username}

# 单文件上传
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(contents)
    }

# 多文件上传
@app.post("/upload/multiple")
async def upload_multiple_files(
    files: List[UploadFile] = File(...)
):
    return {
        "filenames": [f.filename for f in files]
    }
```

**JavaScript 对比**（前端上传）：

```javascript
// 前端文件上传
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:8000/upload', {
  method: 'POST',
  body: formData
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 12.3 响应处理

### JSON 响应

FastAPI 默认返回 JSON：

```python
from fastapi import FastAPI, Response
from fastapi.responses import JSONResponse

app = FastAPI()

# 自动转 JSON
@app.get("/items")
async def get_items():
    return [{"id": 1, "name": "Item 1"}]  # 自动序列化

# 显式 JSON 响应
@app.get("/data")
async def get_data():
    return JSONResponse(
        content={"message": "Success"},
        status_code=200
    )
```

### 设置状态码

```python
from fastapi import FastAPI, status

app = FastAPI()

# 默认 200
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    return {"item_id": item_id}

# 设置状态码
@app.post("/items", status_code=status.HTTP_201_CREATED)
async def create_item(item: dict):
    return item

# 不同条件不同状态码
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    if item_id == 0:
        return {"message": "Item not found"}, 404
    return {"item_id": item_id}, 200
```

### 响应头

```python
from fastapi import FastAPI, Response

app = FastAPI()

@app.get("/custom-headers")
async def custom_headers(response: Response):
    response.headers["X-Custom-Header"] = "Custom Value"
    response.headers["Cache-Control"] = "no-cache"
    return {"message": "Headers set"}
```

### HTML 响应

```python
from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()

@app.get("/", response_class=HTMLResponse)
async def read_root():
    html_content = """
    <html>
        <head>
            <title>FastAPI</title>
        </head>
        <body>
            <h1>Hello, FastAPI!</h1>
        </body>
    </html>
    """
    return HTMLResponse(content=html_content)
```

### 响应模型

使用 `response_model` 定义响应结构：

```python
from fastapi import FastAPI
from pydantic import BaseModel, EmailStr

app = FastAPI()

class UserIn(BaseModel):
    username: str
    password: str
    email: EmailStr

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    # 不包含 password！

@app.post("/users", response_model=UserOut)
async def create_user(user: UserIn):
    # 返回时自动过滤 password
    return {
        "id": 1,
        "username": user.username,
        "email": user.email,
        "password": user.password  # 会被自动过滤
    }
```

---

## 12.4 数据验证

### Pydantic 基础

Pydantic 是 FastAPI 数据验证的核心：

```python
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(..., gt=0, description="价格必须大于0")
    tax: Optional[float] = None
    tags: list[str] = []

    # 自定义验证器
    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('名称不能为空')
        return v.strip()

    @validator('price')
    def validate_price(cls, v):
        if v > 1000000:
            raise ValueError('价格不能超过100万')
        return v
```

### 常用验证器

```python
from pydantic import BaseModel, Field, HttpUrl, EmailStr

class UserCreate(BaseModel):
    # 字符串验证
    username: str = Field(
        ...,
        min_length=3,
        max_length=20,
        pattern="^[a-zA-Z0-9_]+$"
    )

    # 邮箱验证
    email: EmailStr

    # URL 验证
    website: Optional[HttpUrl] = None

    # 数字验证
    age: int = Field(..., ge=18, le=120)  # 18-120岁

    # 列表验证
    tags: List[str] = Field(
        ...,
        min_items=1,
        max_items=5
    )

    # 嵌套模型
    address: Optional[Address] = None
```

### 错误处理

```python
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI()

# 自定义验证错误响应
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "code": 422,
            "message": "参数验证失败",
            "errors": exc.errors()
        }
    )
```

**错误响应示例**：

```json
{
  "code": 422,
  "message": "参数验证失败",
  "errors": [
    {
      "loc": ["body", "username"],
      "msg": "ensure this value is greater than or equal to 3",
      "type": "value_error.number.not_ge"
    }
  ]
}
```

---

## 12.5 依赖注入

### 依赖基础

依赖注入是 FastAPI 的核心特性：

```python
from fastapi import FastAPI, Depends, Header, HTTPException, status
from typing import Optional

app = FastAPI()

# 定义依赖函数
async def common_parameters(
    skip: int = 0,
    limit: int = 100
):
    return {"skip": skip, "limit": limit}

# 使用依赖
@app.get("/items")
async def read_items(commons: dict = Depends(common_parameters)):
    return commons

# 多个依赖
@app.get("/users")
async def read_users(
    commons: dict = Depends(common_parameters),
    active: bool = True
):
    return commons
```

### 类作为依赖

```python
from fastapi import FastAPI, Depends
from typing import Optional

app = FastAPI()

class CommonParams:
    def __init__(
        self,
        skip: int = 0,
        limit: int = 100
    ):
        self.skip = skip
        self.limit = limit

@app.get("/items")
async def read_items(commons: CommonParams = Depends()):
    return {
        "skip": commons.skip,
        "limit": commons.limit
    }
```

### 嵌套依赖

```python
async def get_query_extractor(
    query: Optional[str] = None
):
    return query

async def get_query_or_cookie(
    query: str = Depends(get_query_extractor),
    last_query: Optional[str] = None
):
    if not query:
        return last_query
    return query

@app.get("/items")
async def read_query(
    query_or_default: str = Depends(get_query_or_cookie)
):
    return {"query_or_default": query_or_default}
```

### 认证依赖

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

app = FastAPI()
security = HTTPBearer()

async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    if token != "secret-token":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid authentication"
        )
    return token

@app.get("/protected", dependencies=[Depends(verify_token)])
async def protected_route():
    return {"message": "Access granted"}
```

---

## 12.6 中间件

### 中间件基础

中间件在每个请求被特定路径操作处理之前工作：

```python
from fastapi import FastAPI, Request
import time

app = FastAPI()

@app.middleware("http")
async def add_process_time_header(
    request: Request,
    call_next
):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

### CORS 中间件

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 自定义中间件

```python
from fastapi import FastAPI, Request
import time

app = FastAPI()

# 日志中间件
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    # 记录请求
    print(f"{request.method} {request.url.path}")

    response = await call_next(request)

    # 记录响应时间
    process_time = time.time() - start_time
    print(f"Request processed in {process_time:.2f}s")

    return response
```

### 中间件执行顺序

```python
@app.middleware("http")
async def middleware1(request: Request, call_next):
    print("Middleware 1: Before")
    response = await call_next(request)
    print("Middleware 1: After")
    return response

@app.middleware("http")
async def middleware2(request: Request, call_next):
    print("Middleware 2: Before")
    response = await call_next(request)
    print("Middleware 2: After")
    return response

# 执行顺序：
# Middleware 1: Before
# Middleware 2: Before
# Route Handler
# Middleware 2: After
# Middleware 1: After
```

---

## 12.7 异步支持

### 异步路由

```python
import asyncio
from fastapi import FastAPI

app = FastAPI()

# 同步路由（FastAPI 自动在线程池运行）
@app.get("/sync")
def sync_route():
    time.sleep(1)  # 阻塞
    return {"message": "Sync"}

# 异步路由
@app.get("/async")
async def async_route():
    await asyncio.sleep(1)  # 非阻塞
    return {"message": "Async"}
```

### 异步数据库操作

```python
import asyncpg
from fastapi import FastAPI, Depends

app = FastAPI()

async def get_db():
    conn = await asyncpg.connect("postgresql://...")
    try:
        yield conn
    finally:
        await conn.close()

@app.get("/users/{user_id}")
async def get_user(
    user_id: int,
    db = Depends(get_db)
):
    user = await db.fetchrow(
        "SELECT * FROM users WHERE id = $1",
        user_id
    )
    return user
```

### 并发请求

```python
import httpx
from fastapi import FastAPI

app = FastAPI()

@app.get("/aggregate")
async def aggregate_data():
    async with httpx.AsyncClient() as client:
        # 并发执行多个请求
        tasks = [
            client.get("https://api.example.com/data1"),
            client.get("https://api.example.com/data2"),
            client.get("https://api.example.com/data3"),
        ]
        responses = await asyncio.gather(*tasks)

        return {
            "data1": responses[0].json(),
            "data2": responses[1].json(),
            "data3": responses[2].json(),
        }
```

---

## 常见问题

### Q1: 什么时候用 `def`，什么时候用 `async def`？

**A**:

```python
# 使用 async def：有 I/O 操作（数据库、API）
async def route():
    data = await db.fetch(...)  # 异步操作
    return data

# 使用 def：纯计算或没有异步操作
def route():
    result = complex_calculation()  # 同步计算
    return result
```

### Q2: `Depends()` 的参数是什么意思？

**A**:

```python
# 不带括号：FastAPI 自动分析参数
def route(commons: CommonParams = Depends()):
    pass

# 带括号：传入特定的依赖函数
def route(token: str = Depends(verify_token)):
    pass
```

### Q3: 如何处理文件上传大小限制？

**A**:

```python
app = FastAPI()

# 配置上传限制
@app.post("/upload")
async def upload_file(
    file: UploadFile = File(..., size_limit=10 * 1024 * 1024)  # 10MB
):
    ...
```

### Q4: 响应模型中的字段如何排除？

**A**:

```python
class UserOut(BaseModel):
    id: int
    username: str

    class Config:
        # 排除未定义的字段
        extra = "ignore"

# 或使用 response_model_exclude
@app.get("/users", response_model=UserOut, response_model_exclude={"password"})
async def get_user():
    return user_data
```

---

## 本章小结

### 核心知识点回顾

| 知识点 | 说明 |
|--------|------|
| 路径操作 | `@app.get/post/put/delete` |
| 参数类型 | 路径参数、查询参数、请求体 |
| 数据验证 | Pydantic 模型自动验证 |
| 依赖注入 | `Depends()` 实现代码复用 |
| 中间件 | 请求/响应拦截器 |
| 异步支持 | `async/await` 提高性能 |

### FastAPI 项目结构

```
my-project/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI 应用
│   ├── models.py        # Pydantic 模型
│   ├── routes/          # 路由模块
│   │   ├── __init__.py
│   │   ├── users.py
│   │   └── posts.py
│   └── dependencies.py  # 依赖函数
├── tests/
├── requirements.txt
└── run.py               # 启动脚本
```

### 与 Express.js 对比

| Express.js | FastAPI |
|------------|---------|
| `app.get()` | `@app.get()` |
| `req.params` | 路径参数 `/{id}` |
| `req.query` | 查询参数 `?key=val` |
| `req.body` | Pydantic 模型 |
| `next()` | `call_next()` |
| 中间件 `app.use()` | `@app.middleware("http")` |

---

## 练习题

### 基础题

#### 题目 1：路径参数和查询参数

实现一个端点，根据用户 ID 获取该用户的文章列表，支持分页：

```python
@app.get("/users/{user_id}/posts")
async def get_user_posts(user_id: int, page: int = 1, limit: int = 10):
    # TODO: 实现逻辑
    pass
```

#### 题目 2：请求体验证

定义一个文章创建模型，包含以下验证：
- 标题：必填，3-100 字符
- 内容：必填，至少 10 字符
- 分类：可选
- 标签：可选，最多 5 个

#### 题目 3：状态码

为以下操作设置正确的状态码：
- 创建成功
- 资源不存在
- 参数验证失败
- 更新成功
- 删除成功

### 进阶题

#### 题目 4：依赖注入 - 认证

实现一个简单的 Bearer Token 认证依赖：

```python
async def get_current_user(token: str = Depends(...)):
    # 验证 token 并返回用户信息
    pass

@app.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user
```

#### 题目 5：响应模型

定义用户输入和输出模型，确保密码不会在响应中返回：

```python
class UserIn(BaseModel):
    # TODO: 定义输入模型
    pass

class UserOut(BaseModel):
    # TODO: 定义输出模型（不包含密码）
    pass
```

### 挑战题

#### 题目 6：完整的 CRUD API

实现一个完整的 Todo CRUD API：

```
POST   /api/todos          # 创建
GET    /api/todos          # 获取列表（分页、筛选）
GET    /api/todos/{id}     # 获取详情
PUT    /api/todos/{id}     # 更新
DELETE /api/todos/{id}     # 删除
PATCH  /api/todos/{id}     # 标记完成
```

要求：
- 使用 Pydantic 模型
- 实现分页（page, limit）
- 支持按状态筛选（all/active/completed）
- 合适的状态码

---

## 练习题答案

### 基础题答案

#### 题目 1 答案

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/users/{user_id}/posts")
async def get_user_posts(
    user_id: int,
    page: int = 1,
    limit: int = 10
):
    # 验证分页参数
    if page < 1:
        raise HTTPException(status_code=400, detail="页码必须大于0")
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="每页数量在1-100之间")

    # 模拟数据
    posts = [
        {"id": i, "title": f"Post {i}", "user_id": user_id}
        for i in range((page - 1) * limit, page * limit)
    ]

    return {
        "user_id": user_id,
        "page": page,
        "limit": limit,
        "posts": posts,
        "total": 100  # 假设总共100篇
    }
```

#### 题目 2 答案

```python
from pydantic import BaseModel, Field, validator
from typing import Optional, List

class PostCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    content: str = Field(..., min_length=10)
    category: Optional[str] = None
    tags: List[str] = Field(default_factory=list, max_items=5)

    @validator('title')
    def title_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('标题不能为空')
        return v.strip()

    @validator('tags')
    def tags_must_be_unique(cls, v):
        if len(v) != len(set(v)):
            raise ValueError('标签不能重复')
        return v
```

#### 题目 3 答案

```python
from fastapi import FastAPI, status
from fastapi.responses import JSONResponse

app = FastAPI()

@app.post("/posts", status_code=status.HTTP_201_CREATED)
async def create_post(post: dict):
    return post

@app.get("/posts/{post_id}")
async def get_post(post_id: int):
    if post_id == 0:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "文章不存在"}
        )
    return {"id": post_id}

@app.get("/posts")
async def get_posts():
    # 参数验证失败会自动返回 422
    return []

@Put("/posts/{post_id}")
async def update_post(post_id: int, post: dict):
    return {"id": post_id, **post}

@Delete("/posts/{post_id}")
async def delete_post(post_id: int):
    return JSONResponse(
        status_code=status.HTTP_204_NO_CONTENT,
        content=None
    )
```

### 进阶题答案

#### 题目 4 答案

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

app = FastAPI()
security = HTTPBearer()

# 模拟的用户数据库
fake_users = {
    "secret-token-123": {"id": 1, "username": "john"},
    "secret-token-456": {"id": 2, "username": "jane"}
}

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    user = fake_users.get(token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无效的认证凭据",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

@app.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user
```

#### 题目 5 答案

```python
from pydantic import BaseModel, EmailStr, Field

class UserIn(BaseModel):
    username: str = Field(..., min_length=3, max_length=20)
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None

    # 配置类
    class Config:
        # 如果有额外字段，忽略而不是报错
        extra = "ignore"

@app.post("/users", response_model=UserOut)
async def create_user(user: UserIn):
    # 保存到数据库...
    user_id = 1

    # 即使返回包含 password，也会被自动过滤
    return {
        "id": user_id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "password": user.password  # 不会出现在响应中
    }
```

### 挑战题答案

#### 题目 6 答案

```python
from fastapi import FastAPI, HTTPException, Query, status
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

app = FastAPI()

# 数据模型
class TodoStatus(str, Enum):
    active = "active"
    completed = "completed"

class TodoBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[TodoStatus] = None

class Todo(TodoBase):
    id: int
    status: TodoStatus = TodoStatus.active

# 模拟数据库
todos_db = {
    1: {"id": 1, "title": "Learn Python", "description": "Study FastAPI", "status": TodoStatus.active},
    2: {"id": 2, "title": "Build API", "description": "Create REST API", "status": TodoStatus.completed},
}
next_id = 3

# CRUD 端点
@app.post("/api/todos", response_model=Todo, status_code=status.HTTP_201_CREATED)
async def create_todo(todo: TodoCreate):
    global next_id
    new_todo = Todo(
        id=next_id,
        title=todo.title,
        description=todo.description,
        status=TodoStatus.active
    )
    todos_db[next_id] = new_todo.dict()
    next_id += 1
    return new_todo

@app.get("/api/todos", response_model=List[Todo])
async def get_todos(
    status_filter: Optional[TodoStatus] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    filtered_todos = list(todos_db.values())

    if status_filter:
        filtered_todos = [t for t in filtered_todos if t["status"] == status_filter]

    start = (page - 1) * limit
    end = start + limit
    paginated_todos = filtered_todos[start:end]

    return paginated_todos

@app.get("/api/todos/{todo_id}", response_model=Todo)
async def get_todo(todo_id: int):
    if todo_id not in todos_db:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todos_db[todo_id]

@app.put("/api/todos/{todo_id}", response_model=Todo)
async def update_todo(todo_id: int, todo_update: TodoUpdate):
    if todo_id not in todos_db:
        raise HTTPException(status_code=404, detail="Todo not found")

    stored_todo = todos_db[todo_id]

    update_data = todo_update.dict(exclude_unset=True)
    stored_todo.update(update_data)

    return stored_todo

@app.delete("/api/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(todo_id: int):
    if todo_id not in todos_db:
        raise HTTPException(status_code=404, detail="Todo not found")
    del todos_db[todo_id]
    return None

@app.patch("/api/todos/{todo_id}/complete", response_model=Todo)
async def mark_todo_complete(todo_id: int):
    if todo_id not in todos_db:
        raise HTTPException(status_code=404, detail="Todo not found")

    todos_db[todo_id]["status"] = TodoStatus.completed
    return todos_db[todo_id]
```

---

> 下一章：[第13章：数据库操作](/chapter-13/) - 学习 SQLAlchemy 和数据库集成
