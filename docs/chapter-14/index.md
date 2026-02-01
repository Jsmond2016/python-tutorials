# 第14章：身份认证与授权

## 本章简介

认证和授权是 Web 应用的安全基石。本章将学习如何实现用户认证系统，包括密码哈希、JWT Token、权限控制等。

**学习目标**：
- 理解认证和授权的区别
- 掌握密码安全存储（bcrypt）
- 学会实现 JWT 认证
- 理解基于角色的访问控制（RBAC）
- 实现完整的认证流程

---

## 14.1 认证基础

### 认证 vs 授权

```
认证 (Authentication)          授权 (Authorization)
├── 你是谁？                   ├── 你能做什么？
├── 验证身份                   ├── 验证权限
├── 登录/注册                  ├── 角色管理
└── Token, Session             └── 权限控制
```

### Session vs JWT

```
Session 认证                   JWT 认证
├── 服务端存储                 ├── 客户端存储
├── �依赖 Cookie                ├── 不依赖 Cookie
├── 难以扩展                   ├── 易于扩展
└── 传统方式                   └── 现代方式
```

### 认证流程对比

```
Session 认证流程：
客户端                     服务器
  │                          │
  ├──── POST /login ────────>│
  │                          │ 验证用户名密码
  │<──── Set-Cookie ─────────│
  │                          │ 创建 Session
  ├──── GET /api/posts ─────>│
  │   (Cookie: session_id)   │
  │                          │ 验证 Session
  │<──── 返回数据 ───────────│

JWT 认证流程：
客户端                     服务器
  │                          │
  ├──── POST /login ────────>│
  │                          │ 验证用户名密码
  │<──── {access_token} ─────│
  │                          │ 生成 JWT
  ├──── GET /api/posts ─────>│
  │   (Header: Authorization)│
  │                          │ 验证 JWT
  │<──── 返回数据 ───────────│
```

---

## 14.2 密码安全

### 为什么不能存储明文密码

```python
# ❌ 错误：存储明文密码
class User(Base):
    username: str
    password: str  # 危险！数据库泄露=密码泄露

# 数据库泄露示例
# leaked_data.csv: john,123456
# 攻击者可以直接用密码登录！
```

### 密码哈希

哈希是单向转换，无法逆向：

```python
import hashlib

# ❌ 不推荐：MD5/SHA1（已被破解）
hashed = hashlib.md5("password123".encode()).hexdigest()
# 输出: 482c811da5d5b4bc6d497ffa98491e38

# ✅ 推荐：bcrypt（专门为密码设计）
import bcrypt

# 生成哈希
password = "password123".encode('utf-8')
hashed = bcrypt.hashpw(password, bcrypt.gensalt())
# 输出: $2b$12$...

# 验证密码
if bcrypt.checkpw(password, hashed):
    print("密码正确")
```

### 安装 bcrypt

```bash
pip install bcrypt
```

### 密码哈希工具函数

```python
import bcrypt
from typing import str

def hash_password(password: str) -> str:
    """生成密码哈希"""
    # 转为字节
    pwd_bytes = password.encode('utf-8')
    # 生成盐并哈希
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    # 返回字符串
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    pwd_bytes = plain_password.encode('utf-8')
    hash_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hash_bytes)

# 使用示例
hashed = hash_password("mypassword123")
print(hashed)  # $2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW

is_valid = verify_password("mypassword123", hashed)
print(is_valid)  # True
```

### 密码强度验证

```python
import re

def validate_password_strength(password: str) -> tuple[bool, str]:
    """验证密码强度"""
    if len(password) < 8:
        return False, "密码至少需要8个字符"

    if len(password) > 100:
        return False, "密码不能超过100个字符"

    if not re.search(r'[A-Z]', password):
        return False, "密码必须包含至少一个大写字母"

    if not re.search(r'[a-z]', password):
        return False, "密码必须包含至少一个小写字母"

    if not re.search(r'\d', password):
        return False, "密码必须包含至少一个数字"

    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "密码必须包含至少一个特殊字符"

    # 检查常见弱密码
    weak_passwords = ['password', '12345678', 'qwerty', 'abc123']
    if password.lower() in weak_passwords:
        return False, "密码过于常见"

    return True, "密码强度符合要求"

# 使用示例
is_valid, message = validate_password_strength("MyPass123!")
print(is_valid, message)  # True, "密码强度符合要求"
```

### 与前端密码处理对比

```javascript
// 前端：不要只依赖前端验证！
function validatePassword(password) {
  return {
    length: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password)
  };
}

// 重要：前端验证只是用户体验
// 真正的安全必须在后端！
```

```python
# 后端：必须验证
@app.post("/register")
def register(user: UserCreate):
    # 1. 验证密码强度
    is_valid, message = validate_password_strength(user.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)

    # 2. 哈希密码
    hashed_password = hash_password(user.password)

    # 3. 存储哈希（不存储明文）
    db_user = User(
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
```

---

## 14.3 JWT 认证

### JWT 结构

JWT（JSON Web Token）由三部分组成：

```
Header.Payload.Signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VyX2lkIjoxLCJleHAiOjE2OTk5OTk5OTl9.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

| 部分 | 说明 | 示例 |
|------|------|------|
| Header | 算法和类型 | `{"alg": "HS256", "typ": "JWT"}` |
| Payload | 数据（声明） | `{"user_id": 1, "exp": 1700000000}` |
| Signature | 签名 | 防篡改验证 |

### 安装依赖

```bash
pip install python-jose[cryptography]
pip install passlib[bcrypt]
```

### JWT 工具函数

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, status

# JWT 配置
SECRET_KEY = "your-secret-key-here"  # 生产环境使用环境变量
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    """创建 JWT Token"""
    to_encode = data.copy()

    # 设置过期时间
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})

    # 编码 JWT
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    """解码 JWT Token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭据",
            headers={"WWW-Authenticate": "Bearer"},
        )

def verify_token(token: str) -> Optional[str]:
    """验证 Token 并返回用户 ID"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return user_id
    except JWTError:
        return None

# 使用示例
# 创建 Token
token = create_access_token(
    data={"sub": "1", "username": "john"},
    expires_delta=timedelta(hours=1)
)

# 解码 Token
payload = decode_access_token(token)
# {"sub": "1", "username": "john", "exp": 1700000000}
```

### Token 类型

```python
from datetime import timedelta

# Access Token（短期）
access_token = create_access_token(
    data={"sub": str(user.id)},
    expires_delta=timedelta(minutes=30)
)

# Refresh Token（长期）
refresh_token = create_access_token(
    data={"sub": str(user.id), "type": "refresh"},
    expires_delta=timedelta(days=7)
)
```

### 与前端 JWT 处理对比

```javascript
// 前端：存储和发送 Token
import axios from 'axios';

// 存储 Token
localStorage.setItem('access_token', token);

// 发送请求时携带 Token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 处理 Token 过期
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // 尝试刷新 Token
      const newToken = await refreshToken();
      if (newToken) {
        // 重试原请求
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axios(error.config);
      }
    }
    return Promise.reject(error);
  }
);
```

```python
# 后端：验证 Token
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    user_id = verify_token(token)

    if not user_id:
        raise HTTPException(status_code=401, detail="Token 无效")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    return user

# 使用依赖
@app.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
```

---

## 14.4 FastAPI 安全

### OAuth2 密码流

FastAPI 内置安全工具简化认证实现：

```python
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

# OAuth2 配置
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# 登录端点
@app.post("/api/auth/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """OAuth2 密码流登录"""
    # 验证用户
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 创建 Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

# 获取当前用户
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )

    user_id = verify_token(token)
    if not user_id:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise credentials_exception

    return user

# 可选：获取当前活跃用户
async def get_current_active_user(
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="用户未激活")
    return current_user
```

### HTTPBasic 认证

```python
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi import Depends, HTTPException, status

security = HTTPBasic()

async def get_current_user_basic(
    credentials: HTTPBasicCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """HTTP Basic 认证（用于简单场景）"""
    user = authenticate_user(db, credentials.username, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Basic"},
        )
    return user

@app.get("/api/users/me")
async def read_users_me(
    current_user: User = Depends(get_current_user_basic)
):
    return current_user
```

### 完整认证示例

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel

app = FastAPI()

# ============ Pydantic 模型 ============
class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    username: str
    email: Optional[str] = None
    is_active: bool = True

class UserInDB(User):
    hashed_password: str

# ============ 工具函数 ============
def authenticate_user(db: Session, username: str, password: str) -> UserInDB | None:
    """验证用户"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

# ============ 路由 ============
@app.post("/api/auth/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """用户登录"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 创建 Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@app.post("/api/auth/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(
    username: str,
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    """用户注册"""
    # 检查用户是否存在
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="用户名已存在")

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="邮箱已被注册")

    # 验证密码强度
    is_valid, message = validate_password_strength(password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)

    # 创建用户
    hashed_password = hash_password(password)
    db_user = User(
        username=username,
        email=email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

@app.get("/api/auth/me", response_model=User)
async def read_users_me(
    current_user: User = Depends(get_current_active_user)
):
    """获取当前用户信息"""
    return current_user
```

---

## 14.5 权限控制

### 基于角色的访问控制（RBAC）

```python
from enum import Enum
from typing import List

class Role(str, Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    USER = "user"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True)
    role = Column(String(20), default=Role.USER)
    permissions = Column(JSON, default=list)
```

### 权限装饰器

```python
from functools import wraps
from fastapi import HTTPException, status

def require_role(*allowed_roles: Role):
    """角色权限装饰器"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user: User = Depends(get_current_user), **kwargs):
            if current_user.role not in allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="权限不足"
                )
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

# 使用示例
@app.delete("/api/users/{user_id}")
@require_role(Role.ADMIN)
async def delete_user(user_id: int, current_user: User = Depends(get_current_user)):
    """只有管理员可以删除用户"""
    pass

@app.put("/api/posts/{post_id}")
@require_role(Role.ADMIN, Role.EDITOR)
async def update_post(post_id: int, current_user: User = Depends(get_current_user)):
    """管理员和编辑可以修改文章"""
    pass
```

### 资源级权限

```python
def require_ownership(model_class: str, user_field: str = "user_id"):
    """资源所有权验证"""
    async def check_ownership(
        item_id: int,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        # 获取资源
        model = globals()[model_class]
        item = db.query(model).filter(model.id == item_id).first()

        if not item:
            raise HTTPException(status_code=404, detail="资源不存在")

        # 检查所有权
        item_owner_id = getattr(item, user_field)
        if item_owner_id != current_user.id and current_user.role != Role.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权操作此资源"
            )

        return item

    return check_ownership

# 使用示例
@app.put("/api/posts/{post_id}")
async def update_post(
    post: Post = Depends(require_ownership("Post")),
    update_data: PostUpdate
):
    """只能修改自己的文章（管理员除外）"""
    pass
```

### 权限依赖注入

```python
from fastapi import Depends

class PermissionChecker:
    def __init__(self, required_permissions: List[str]):
        self.required_permissions = required_permissions

    def __call__(
        self,
        current_user: User = Depends(get_current_user)
    ) -> User:
        """检查用户权限"""
        user_permissions = set(current_user.permissions or [])

        for permission in self.required_permissions:
            if permission not in user_permissions:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"缺少权限: {permission}"
                )

        return current_user

# 使用示例
@app.post("/api/posts")
async def create_post(
    post: PostCreate,
    current_user: User = Depends(
        PermissionChecker(required_permissions=["posts:create"])
    )
):
    """需要 posts:create 权限"""
    pass
```

---

## 14.6 完整认证流程

### 用户注册

```python
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

app = FastAPI()

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    """用户注册"""
    # 1. 检查用户名是否存在
    existing_user = db.query(User).filter(
        User.username == user_data.username
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="用户名已被使用"
        )

    # 2. 检查邮箱是否存在
    existing_email = db.query(User).filter(
        User.email == user_data.email
    ).first()
    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="邮箱已被注册"
        )

    # 3. 验证密码强度
    is_valid, message = validate_password_strength(user_data.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)

    # 4. 哈希密码
    hashed_password = hash_password(user_data.password)

    # 5. 创建用户
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        role=Role.USER,
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 6. 返回用户信息（不包含密码）
    return {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "role": new_user.role,
        "created_at": new_user.created_at
    }
```

### 用户登录

```python
from pydantic import BaseModel

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """用户登录"""
    # 1. 查找用户
    user = db.query(User).filter(User.username == credentials.username).first()
    if not user:
        raise HTTPException(
            status_code=401,
            detail="用户名或密码错误"
        )

    # 2. 验证密码
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="用户名或密码错误"
        )

    # 3. 检查账户状态
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="账户已被禁用"
        )

    # 4. 创建 Access Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "username": user.username,
            "role": user.role
        },
        expires_delta=access_token_expires
    )

    # 5. 创建 Refresh Token
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_access_token(
        data={"sub": str(user.id), "type": "refresh"},
        expires_delta=refresh_token_expires
    )

    # 6. 保存 Refresh Token（可选）
    user.refresh_token = refresh_token
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }
```

### Token 刷新

```python
class RefreshTokenRequest(BaseModel):
    refresh_token: str

@app.post("/api/auth/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """刷新 Access Token"""
    # 1. 验证 Refresh Token
    user_id = verify_token(request.refresh_token)
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="无效的 Refresh Token"
        )

    # 2. 获取用户
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.refresh_token != request.refresh_token:
        raise HTTPException(
            status_code=401,
            detail="Refresh Token 已失效"
        )

    # 3. 生成新的 Access Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "username": user.username,
            "role": user.role
        },
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "refresh_token": request.refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }
```

### 登出

```python
@app.post("/api/auth/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """用户登出"""
    # 清除 Refresh Token
    current_user.refresh_token = None
    db.commit()

    return {"message": "登出成功"}

# 注意：JWT 是无状态的，无法使 Token 立即失效
# 生产环境可以：
# 1. 使用 Token 黑名单（Redis）
# 2. 设置较短的过期时间
# 3. 使用 Refresh Token 机制
```

### 受保护的路由

```python
from fastapi import Depends

@app.get("/api/users/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """获取当前用户信息"""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "created_at": current_user.created_at
    }

@app.put("/api/users/me")
async def update_current_user(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新当前用户信息"""
    for field, value in update_data.dict(exclude_unset=True).items():
        if field != "password":  # 密码单独处理
            setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user

@app.post("/api/users/me/change-password")
async def change_password(
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """修改密码"""
    # 验证旧密码
    if not verify_password(old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="原密码错误"
        )

    # 验证新密码强度
    is_valid, message = validate_password_strength(new_password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)

    # 更新密码
    current_user.hashed_password = hash_password(new_password)
    db.commit()

    return {"message": "密码修改成功"}
```

---

## 常见问题

### Q1: Token 存储在哪里？

**A**:

```javascript
// 前端 Token 存储方式对比

// 1. localStorage（常用）
localStorage.setItem('token', token);
// 优点：持久化，刷新不丢失
// 缺点：XSS 风险

// 2. sessionStorage
sessionStorage.setItem('token', token);
// 优点：关闭标签页自动清除
// 缺点：多标签不共享

// 3. Cookie（httpOnly）
// 后端设置：Set-Cookie: token=xxx; HttpOnly; Secure
// 优点：防 XSS
// 缺点：需要 CSRF 防护

// 推荐：Access Token 存内存，Refresh Token 存 httpOnly Cookie
```

### Q2: Token 过期后怎么办？

**A**: 实现 Refresh Token 机制

```python
# Access Token（短期，15-30分钟）
# 用于 API 访问，过期后用 Refresh Token 换取新的

# Refresh Token（长期，7-30天）
# 用于获取新的 Access Token

# 流程：
# 1. Access Token 过期 → 返回 401
# 2. 前端调用 /refresh 接口
# 3. 验证 Refresh Token → 返回新的 Access Token
# 4. 重试原请求
```

### Q3: 如何实现"记住我"功能？

**A**:

```python
# 登录时返回有效期更长的 Token
if remember_me:
    access_token_expires = timedelta(days=7)
else:
    access_token_expires = timedelta(minutes=30)
```

### Q4: JWT 安全性如何？

**A**: JWT 的安全要点：

| 安全措施 | 说明 |
|---------|------|
| 使用 HTTPS | 防止中间人攻击 |
| 短期过期 | Access Token 15-30 分钟 |
| 密钥保护 | SECRET_KEY 存环境变量 |
| Refresh Token | 长期 Token 存 httpOnly Cookie |
| Token 撤销 | 实现黑名单机制 |

---

## 本章小结

### 核心知识点回顾

| 知识点 | 说明 |
|--------|------|
| 密码哈希 | bcrypt 单向加密 |
| JWT | JSON Web Token 认证 |
| OAuth2 | 标准认证协议 |
| RBAC | 基于角色的权限控制 |
| Token 刷新 | Refresh Token 机制 |

### 认证流程图

```
注册流程：
客户端 → POST /register
       → 验证输入
       → 哈希密码
       → 存储用户
       → 返回用户信息

登录流程：
客户端 → POST /login (username, password)
       → 验证用户
       → 生成 Access Token
       → 生成 Refresh Token
       → 返回 Tokens

受保护请求：
客户端 → GET /api/posts (Header: Authorization: Bearer xxx)
       → 验证 Token
       → 获取用户信息
       → 检查权限
       → 返回数据
```

---

## 练习题

### 基础题

#### 题目 1：密码哈希

实现密码哈希和验证函数：

```python
def hash_password(password: str) -> str:
    """使用 bcrypt 哈希密码"""
    pass

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    pass
```

#### 题目 2：JWT 生成

创建包含以下信息的 JWT：
- user_id: 用户 ID
- username: 用户名
- role: 用户角色
- 过期时间：30 分钟

#### 题目 3：认证依赖

实现一个获取当前用户的依赖函数：

```python
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """从 Token 获取当前用户"""
    pass
```

### 进阶题

#### 题目 4：角色权限

实现一个权限检查装饰器：

```python
def require_role(*roles: Role):
    """要求指定角色才能访问"""
    pass

# 使用：
@app.delete("/api/users/{id}")
@require_role(Role.ADMIN)
async def delete_user(user_id: int):
    pass
```

#### 题目 5：Token 刷新

实现完整的 Token 刷新流程：

```python
@app.post("/api/auth/refresh")
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """刷新 Access Token"""
    pass
```

### 挑战题

#### 题目 6：完整认证系统

实现包含以下功能的认证系统：
- 用户注册（邮箱验证）
- 用户登录
- Token 刷新
- 修改密码
- 忘记密码（邮件重置）
- 登出

---

## 练习题答案

### 基础题答案

#### 题目 1 答案

```python
import bcrypt

def hash_password(password: str) -> str:
    """使用 bcrypt 哈希密码"""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    pwd_bytes = plain_password.encode('utf-8')
    hash_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hash_bytes)
```

#### 题目 2 答案

```python
from datetime import timedelta
from jose import jwt

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

def create_jwt(user_id: int, username: str, role: str) -> str:
    """创建 JWT Token"""
    payload = {
        "sub": str(user_id),
        "username": username,
        "role": role,
        "exp": datetime.utcnow() + timedelta(minutes=30)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
```

#### 题目 3 答案

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """从 Token 获取当前用户"""
    # 验证 Token
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭据",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # 获取用户
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

    return user
```

### 进阶题答案

#### 题目 4 答案

```python
from functools import wraps
from fastapi import HTTPException, status
from typing import Callable

def require_role(*roles: Role):
    """要求指定角色才能访问"""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(
            *args,
            current_user: User = Depends(get_current_user),
            **kwargs
        ):
            if current_user.role not in roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"需要以下角色之一: {', '.join(roles)}"
                )
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator
```

#### 题目 5 答案

```python
from datetime import timedelta

@app.post("/api/auth/refresh")
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """刷新 Access Token"""
    # 1. 验证 Refresh Token
    payload = decode_access_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=401,
            detail="无效的 Refresh Token"
        )

    # 2. 获取用户
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.refresh_token != refresh_token:
        raise HTTPException(
            status_code=401,
            detail="Refresh Token 已失效"
        )

    # 3. 生成新的 Access Token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "username": user.username,
            "role": user.role
        },
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 1800  # 30 分钟
    }
```

### 挑战题答案

#### 题目 6 答案（略，参考上文完整代码）

---

> 下一章：[第15章：API 测试与文档](/chapter-15/) - 学习测试和文档编写
