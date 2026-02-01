# 第15章：API 测试与文档

## 本章简介

测试是保证代码质量的重要手段，良好的文档能让 API 更易于使用。本章将学习如何使用 pytest 测试 FastAPI 应用，以及如何编写和维护 API 文档。

**学习目标**：
- 理解测试的重要性和类型
- 掌握 pytest 的使用方法
- 学会编写单元测试和集成测试
- 理解 API 文档的最佳实践
- 掌握性能测试的基础

---

## 15.1 测试基础

### 为什么要测试

```
测试的价值：
├── 保证代码质量
├── 防止回归错误
├── 改善设计
├── 作为文档
└── 提高开发效率
```

### 测试类型

| 测试类型 | 范围 | 速度 | 示例 |
|----------|------|------|------|
| 单元测试 | 单个函数/方法 | 快 | 测试密码哈希函数 |
| 集成测试 | 多个组件协作 | 中 | 测试完整的注册流程 |
| 端到端测试 | 整个应用流程 | 慢 | 测试用户注册到登录 |

### 测试金字塔

```
           /\
          /  \        E2E Tests
         /____\       (少量)
        /      \
       /        \     Integration Tests
      /__________\    (适量)
     /            \
    /              \  Unit Tests
   /________________\ (大量)
```

### 与前端测试对比

| Python 后端 | JavaScript 前端 |
|-------------|-----------------|
| pytest | Jest/Vitest |
| unittest | Jasmine/Mocha |
| TestClient | supertest |
| Mock | Mock Service Worker |

---

## 15.2 pytest 基础

### 安装 pytest

```bash
# 安装核心包
pip install pytest

# 安装 FastAPI 测试工具
pip install httpx

# 安装异步支持
pip install pytest-asyncio

# 安装覆盖率工具
pip install pytest-cov
```

### 基本测试

```python
# test_basic.py

def test_addition():
    """简单的加法测试"""
    assert 1 + 1 == 2

def test_string_concatenation():
    """字符串拼接测试"""
    assert "Hello" + " " + "World" == "Hello World"

def test_list_operations():
    """列表操作测试"""
    numbers = [1, 2, 3]
    numbers.append(4)
    assert len(numbers) == 4
    assert numbers[-1] == 4

# 运行测试
# pytest test_basic.py
```

### 断言

```python
import pytest

def test_assertions():
    # 相等性断言
    assert 1 == 1
    assert "hello" == "hello"

    # 不等断言
    assert 1 != 2

    # 真值断言
    assert True
    assert "hello"  # 非空字符串为真
    assert [1, 2, 3]  # 非空列表为真
    assert not []  # 空列表为假

    # 包含断言
    assert 2 in [1, 2, 3]
    assert "key" in {"key": "value"}

    # 类型断言
    assert isinstance(1, int)
    assert isinstance("hello", str)

    # 异常断言
    with pytest.raises(ValueError):
        int("not a number")

    # 近似断言
    assert 0.1 + 0.2 == pytest.approx(0.3)
```

### Fixture

```python
import pytest

# 简单 fixture
@pytest.fixture
def sample_user():
    """返回示例用户"""
    return {
        "id": 1,
        "username": "john",
        "email": "john@example.com"
    }

def test_user_username(sample_user):
    assert sample_user["username"] == "john"

# 带清理的 fixture
@pytest.fixture
def temp_file():
    """创建临时文件"""
    import tempfile
    import os

    fd, path = tempfile.mkstemp()
    yield path  # 提供路径给测试

    # 清理
    os.close(fd)
    os.unlink(path)

def test_temp_file(temp_file):
    import os
    assert os.path.exists(temp_file)
    # 测试结束后文件会被自动删除

# Fixture 作用域
@pytest.fixture(scope="module")
def database():
    """模块级别的 fixture（只创建一次）"""
    print("Setting up database")
    yield {}
    print("Tearing down database")

@pytest.fixture(scope="function")
def session():
    """函数级别的 fixture（每个测试函数都创建）"""
    print("Creating session")
    yield {}
    print("Destroying session")
```

### 参数化测试

```python
@pytest.mark.parametrize("a, b, expected", [
    (1, 1, 2),
    (2, 3, 5),
    (5, 8, 13),
    (0, 0, 0),
    (-1, 1, 0),
])
def test_addition(a, b, expected):
    """参数化的加法测试"""
    assert a + b == expected

@pytest.mark.parametrize("username, is_valid", [
    ("john", True),
    ("john_doe", True),
    ("john-doe", True),
    ("", False),
    ("ab", False),  # 太短
    ("a" * 30, False),  # 太长
    ("john@doe", False),  # 包含特殊字符
])
def test_username_validation(username, is_valid):
    """用户名验证测试"""
    # 假设有验证函数
    assert is_valid_username(username) == is_valid
```

---

## 15.3 FastAPI 测试

### TestClient

FastAPI 提供 `TestClient` 用于测试：

```python
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from database import Base, get_db

# 创建测试数据库
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建测试表
Base.metadata.create_all(bind=engine)

# 覆盖数据库依赖
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# 创建测试客户端
client = TestClient(app)
```

### 测试 CRUD 操作

```python
# test_users.py
import pytest
from fastapi.testclient import TestClient

def test_create_user(client: TestClient):
    """测试创建用户"""
    response = client.post(
        "/api/users",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPass123!"
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "id" in data
    assert "password" not in data  # 密码不应该返回

def test_create_duplicate_user(client: TestClient):
    """测试创建重复用户"""
    # 第一次创建
    client.post(
        "/api/users",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPass123!"
        }
    )

    # 第二次创建（应该失败）
    response = client.post(
        "/api/users",
        json={
            "username": "testuser",
            "email": "another@example.com",
            "password": "TestPass123!"
        }
    )

    assert response.status_code == 400

def test_get_users(client: TestClient):
    """测试获取用户列表"""
    # 创建测试数据
    for i in range(5):
        client.post(
            "/api/users",
            json={
                "username": f"user{i}",
                "email": f"user{i}@example.com",
                "password": "TestPass123!"
            }
        )

    # 获取用户列表
    response = client.get("/api/users")

    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5

def test_get_user_by_id(client: TestClient):
    """测试获取单个用户"""
    # 创建用户
    create_response = client.post(
        "/api/users",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPass123!"
        }
    )
    user_id = create_response.json()["id"]

    # 获取用户
    response = client.get(f"/api/users/{user_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user_id
    assert data["username"] == "testuser"

def test_update_user(client: TestClient):
    """测试更新用户"""
    # 创建用户
    create_response = client.post(
        "/api/users",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPass123!"
        }
    )
    user_id = create_response.json()["id"]

    # 更新用户
    response = client.put(
        f"/api/users/{user_id}",
        json={"email": "newemail@example.com"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newemail@example.com"

def test_delete_user(client: TestClient):
    """测试删除用户"""
    # 创建用户
    create_response = client.post(
        "/api/users",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPass123!"
        }
    )
    user_id = create_response.json()["id"]

    # 删除用户
    response = client.delete(f"/api/users/{user_id}")

    assert response.status_code == 204

    # 验证删除
    get_response = client.get(f"/api/users/{user_id}")
    assert get_response.status_code == 404
```

### 测试认证

```python
# test_auth.py
from fastapi.testclient import TestClient

def test_login_success(client: TestClient):
    """测试登录成功"""
    # 先创建用户
    client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPass123!"
        }
    )

    # 登录
    response = client.post(
        "/api/auth/login",
        data={
            "username": "testuser",
            "password": "TestPass123!"
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client: TestClient):
    """测试登录失败（错误密码）"""
    # 创建用户
    client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPass123!"
        }
    )

    # 错误密码登录
    response = client.post(
        "/api/auth/login",
        data={
            "username": "testuser",
            "password": "WrongPassword123!"
        }
    )

    assert response.status_code == 401

def test_protected_route_without_token(client: TestClient):
    """测试未授权访问受保护路由"""
    response = client.get("/api/auth/me")

    assert response.status_code == 401

def test_protected_route_with_token(client: TestClient):
    """测试带 Token 访问受保护路由"""
    # 创建并登录用户
    client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPass123!"
        }
    )
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": "testuser",
            "password": "TestPass123!"
        }
    )
    token = login_response.json()["access_token"]

    # 访问受保护路由
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
```

### Mock 数据库

```python
from unittest.mock import Mock, patch

def test_with_mock_db():
    """使用 Mock 数据库的测试"""
    # Mock 数据库
    mock_db = Mock()
    mock_user = Mock(id=1, username="test", email="test@example.com")
    mock_db.query.return_value.filter.return_value.first.return_value = mock_user

    # 使用 Mock 数据库
    with patch("app.get_db", return_value=mock_db):
        client = TestClient(app)
        response = client.get("/api/users/1")

    assert response.status_code == 200
    assert response.json()["username"] == "test"
```

---

## 15.4 异步测试

### pytest-asyncio

```python
import pytest

@pytest.mark.asyncio
async def test_async_function():
    """测试异步函数"""
    import asyncio

    async def async_add(a, b):
        await asyncio.sleep(0.1)
        return a + b

    result = await async_add(1, 2)
    assert result == 3

@pytest.mark.asyncio
async def test_async_database_operation():
    """测试异步数据库操作"""
    # 假设有异步数据库操作
    async def get_user_from_db(user_id: int):
        # 模拟异步查询
        await asyncio.sleep(0.1)
        return {"id": user_id, "username": "john"}

    user = await get_user_from_db(1)
    assert user["id"] == 1
    assert user["username"] == "john"
```

---

## 15.5 性能测试

### Locust 基础

```bash
pip install locust
```

### 编写性能测试

```python
# locustfile.py
from locust import HttpUser, task, between

class BlogUser(HttpUser):
    """模拟博客用户行为"""
    wait_time = between(1, 3)  # 请求间隔 1-3 秒

    def on_start(self):
        """用户开始时的行为"""
        # 登录
        response = self.client.post("/api/auth/login", json={
            "username": "testuser",
            "password": "testpass"
        })
        if response.status_code == 200:
            self.token = response.json()["access_token"]

    @task(3)
    def view_posts(self):
        """查看文章列表（权重 3）"""
        self.client.get("/api/posts")

    @task(2)
    def view_post_detail(self):
        """查看文章详情（权重 2）"""
        self.client.get("/api/posts/1")

    @task(1)
    def create_post(self):
        """创建文章（权重 1）"""
        headers = {"Authorization": f"Bearer {self.token}"}
        self.client.post("/api/posts", json={
            "title": "Test Post",
            "content": "Test content"
        }, headers=headers)
```

### 运行性能测试

```bash
# 启动 Locust
locust -f locustfile.py --host=http://localhost:8000

# 访问 http://localhost:8089
# 设置用户数量和生成速率
```

---

## 15.6 API 文档

### 自动文档

FastAPI 自动生成两种文档：

| 文档类型 | URL | 特点 |
|----------|-----|------|
| Swagger UI | `/docs` | 可交互，直接测试 API |
| ReDoc | `/redoc` | 美观，适合展示 |

### 配置文档信息

```python
from fastapi import FastAPI

app = FastAPI(
    title="Blog API",
    description="一个功能完善的博客 API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    contact={
        "name": "API Support",
        "email": "support@example.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    servers=[
        {"url": "http://localhost:8000", "description": "开发环境"},
        {"url": "https://api.example.com", "description": "生产环境"},
    ],
)
```

### 文档注释

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()

class UserCreate(BaseModel):
    """用户创建模型

    Attributes:
        username: 用户名，3-20 个字符
        email: 邮箱地址
        password: 密码，至少 8 个字符
    """
    username: str = Field(
        ...,
        min_length=3,
        max_length=20,
        description="用户名",
        example="john_doe"
    )
    email: str = Field(
        ...,
        description="邮箱地址",
        example="john@example.com"
    )
    password: str = Field(
        ...,
        min_length=8,
        description="密码",
        example="SecurePass123!"
    )

@app.post(
    "/api/users",
    response_model=UserResponse,
    status_code=201,
    summary="创建新用户",
    description="创建一个新用户账号，用户名和邮箱必须唯一",
    response_description="创建成功的用户信息",
    tags=["用户管理"],
)
async def create_user(user: UserCreate):
    """
    创建新用户

    - **username**: 用户名（必填，3-20 字符）
    - **email**: 邮箱地址（必填）
    - **password**: 密码（必填，至少 8 字符）

    返回创建的用户信息（不包含密码）。
    """
    # 实现逻辑...
    pass

@app.get(
    "/api/users/{user_id}",
    response_model=UserResponse,
    summary="获取用户详情",
    description="根据用户 ID 获取用户信息",
    tags=["用户管理"],
)
async def get_user(
    user_id: int = Path(
        ...,
        description="用户 ID",
        gt=0,
        example=1
    )
):
    """
    获取用户详情

    参数：
    - user_id: 用户 ID（必须大于 0）
    """
    # 实现逻辑...
    pass
```

### 分组路由

```python
from fastapi import APIRouter

# 用户路由
users_router = APIRouter(
    prefix="/api/users",
    tags=["用户管理"],
    responses={404: {"description": "未找到"}},
)

# 文章路由
posts_router = APIRouter(
    prefix="/api/posts",
    tags=["文章管理"],
)

app.include_router(users_router)
app.include_router(posts_router)
```

### 自定义文档

```python
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

app = FastAPI()

def custom_openapi():
    """自定义 OpenAPI schema"""
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Blog API",
        version="1.0.0",
        description="## Blog API 文档\n\n### 功能特性\n- 用户认证\n- 文章管理\n- 评论系统",
        routes=app.routes,
    )

    # 添加额外信息
    openapi_schema["info"]["x-logo"] = {
        "url": "https://example.com/logo.png"
    }

    # 添加认证方式
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
```

---

## 常见问题

### Q1: pytest 和 unittest 选哪个？

**A**: 推荐使用 pytest

| 特性 | pytest | unittest |
|------|--------|----------|
| 语法 | 简洁自然 | 冗长 |
| Fixture | 强大灵活 | 有限 |
| 参数化 | 内置支持 | 需要额外库 |
| 插件生态 | 丰富 | 较少 |
| 断言 | 简单 assert | 需要 self.assertXxx |

### Q2: 如何测试异步代码？

**A**: 使用 `pytest-asyncio`

```python
@pytest.mark.asyncio
async def test_async():
    result = await async_function()
    assert result == expected
```

### Q3: TestClient 和真实请求的区别？

**A**:

| TestClient | 真实请求 |
|------------|----------|
| 绕过网络 | 经过网络栈 |
| 更快 | 较慢 |
| 不启动服务器 | 需要运行服务器 |
| 适合单元测试 | 适合端到端测试 |

---

## 本章小结

### 核心知识点回顾

| 知识点 | 说明 |
|--------|------|
| pytest | Python 测试框架 |
| Fixture | 测试数据准备和清理 |
| TestClient | FastAPI 测试客户端 |
| Mock | 模拟依赖 |
| API 文档 | 自动生成 + 注释增强 |

### pytest 常用命令

```bash
# 运行所有测试
pytest

# 运行指定文件
pytest test_users.py

# 显示详细输出
pytest -v

# 显示打印输出
pytest -s

# 运行失败后停止
pytest -x

# 生成覆盖率报告
pytest --cov=app --cov-report=html
```

### 测试最佳实践

```
1. 测试命名清晰
   test_create_user_with_valid_data
   test_create_user_with_duplicate_username

2. 一个测试只验证一件事

3. 使用 Fixture 复用代码

4. 保持测试独立

5. Mock 外部依赖

6. 测试边界情况
```

---

## 练习题

### 基础题

#### 题目 1：编写单元测试

为以下函数编写测试：

```python
def is_valid_email(email: str) -> bool:
    """验证邮箱格式"""
    import re
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return bool(re.match(pattern, email))
```

#### 题目 2：使用 Fixture

创建一个 Fixture 返回测试用户，并编写测试使用它。

#### 题目 3：参数化测试

使用参数化测试验证密码强度函数。

### 进阶题

#### 题目 4：测试 API

为用户 CRUD 操作编写完整的测试套件。

#### 题目 5：Mock 依赖

使用 Mock 测试一个发送邮件的函数，避免实际发送。

### 挑战题

#### 题目 6：完整测试套件

为博客 API 编写完整的测试套件：
- 用户认证流程
- 文章 CRUD 操作
- 权限控制
- 边界情况处理

---

## 练习题答案

### 基础题答案

#### 题目 1 答案

```python
import pytest

def test_is_valid_email_with_valid_emails():
    """测试有效邮箱"""
    valid_emails = [
        "user@example.com",
        "user.name@example.com",
        "user+tag@example.co.uk",
        "user123@test-domain.com"
    ]
    for email in valid_emails:
        assert is_valid_email(email) is True

def test_is_valid_email_with_invalid_emails():
    """测试无效邮箱"""
    invalid_emails = [
        "invalid",
        "@example.com",
        "user@",
        "user@@example.com",
        "user name@example.com"
    ]
    for email in invalid_emails:
        assert is_valid_email(email) is False

def test_is_valid_email_with_empty_string():
    """测试空字符串"""
    assert is_valid_email("") is False
```

#### 题目 2 答案

```python
import pytest

@pytest.fixture
def test_user():
    """返回测试用户"""
    return {
        "id": 1,
        "username": "testuser",
        "email": "test@example.com"
    }

def test_user_username(test_user):
    """测试用户名"""
    assert test_user["username"] == "testuser"

def test_user_email(test_user):
    """测试邮箱"""
    assert test_user["email"] == "test@example.com"
```

#### 题目 3 答案

```python
import pytest

@pytest.mark.parametrize("password, is_valid", [
    ("Secure123!", True),
    ("AnotherPass456", True),
    ("weak", False),
    ("onlylowercase", False),
    ("ONLYUPPERCASE", False),
    ("NoNumbers!", False),
    ("12345678", False),
])
def test_password_strength(password, is_valid):
    """测试密码强度验证"""
    assert is_valid_password(password) == is_valid
```

### 进阶题答案

#### 题目 4 答案

```python
from fastapi.testclient import TestClient

def test_create_user(client: TestClient):
    """测试创建用户"""
    response = client.post(
        "/api/users",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPass123!"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert "id" in data

def test_get_user(client: TestClient):
    """测试获取用户"""
    # 创建用户
    create_response = client.post(
        "/api/users",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPass123!"
        }
    )
    user_id = create_response.json()["id"]

    # 获取用户
    response = client.get(f"/api/users/{user_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user_id

def test_update_user(client: TestClient):
    """测试更新用户"""
    # 创建用户
    create_response = client.post(
        "/api/users",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPass123!"
        }
    )
    user_id = create_response.json()["id"]

    # 更新用户
    response = client.put(
        f"/api/users/{user_id}",
        json={"email": "newemail@example.com"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newemail@example.com"

def test_delete_user(client: TestClient):
    """测试删除用户"""
    # 创建用户
    create_response = client.post(
        "/api/users",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPass123!"
        }
    )
    user_id = create_response.json()["id"]

    # 删除用户
    response = client.delete(f"/api/users/{user_id}")
    assert response.status_code == 204

    # 验证删除
    get_response = client.get(f"/api/users/{user_id}")
    assert get_response.status_code == 404
```

#### 题目 5 答案

```python
from unittest.mock import patch, Mock

def test_send_email_with_mock():
    """测试发送邮件（使用 Mock）"""
    with patch("smtplib.SMTP") as mock_smtp:
        # 配置 Mock
        mock_server = Mock()
        mock_smtp.return_value.__enter__.return_value = mock_server

        # 调用函数
        send_email("test@example.com", "Subject", "Body")

        # 验证调用
        mock_server.sendmail.assert_called_once()
        mock_server.quit.assert_called_once()
```

### 挑战题答案

#### 题目 6 答案（略，根据具体 API 实现）

---

> 下一章：[项目3：博客 API 系统](/project-03/) - 综合运用所学知识
