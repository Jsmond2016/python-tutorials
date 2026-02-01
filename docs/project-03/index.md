# 项目3：博客 API 系统

## 项目简介

欢迎来到实战项目！本项目将综合运用前面学到的知识，构建一个完整的博客后端 API 系统。

**项目目标**：
- 实现用户认证系统（注册/登录/JWT）
- 实现文章 CRUD 操作
- 实现评论系统
- 实现权限控制
- 遵循 RESTful API 设计规范

**技术栈**：
- FastAPI - Web 框架
- SQLAlchemy - ORM
- PostgreSQL / SQLite - 数据库
- Pydantic - 数据验证
- JWT - 认证
- pytest - 测试

---

## 项目结构

```
blog-api/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 应用入口
│   ├── config.py            # 配置管理
│   ├── database.py          # 数据库连接
│   ├── models.py            # SQLAlchemy 模型
│   ├── schemas.py           # Pydantic 模型
│   ├── auth.py              # 认证工具函数
│   ├── crud/                # CRUD 操作
│   │   ├── __init__.py
│   │   ├── users.py
│   │   ├── posts.py
│   │   └── comments.py
│   └── api/                 # API 路由
│       ├── __init__.py
│       ├── auth.py
│       ├── users.py
│       ├── posts.py
│       └── comments.py
├── tests/                   # 测试
│   ├── __init__.py
│   ├── conftest.py          # pytest 配置
│   ├── test_auth.py
│   ├── test_users.py
│   ├── test_posts.py
│   └── test_comments.py
├── alembic/                 # 数据库迁移
│   ├── versions/
│   └── env.py
├── requirements.txt         # 依赖列表
├── pyproject.toml          # 项目配置
└── .env                    # 环境变量
```

---

## 第一部分：项目初始化

### 安装依赖

```bash
# 创建项目目录
mkdir blog-api
cd blog-api

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic[email] python-jose[cryptography] passlib[bcrypt] python-multipart pytest pytest-asyncio httpx
```

### requirements.txt

```txt
fastapi==0.115.0
uvicorn[standard]==0.32.0
sqlalchemy==2.0.36
psycopg2-binary==2.9.10
pydantic[email]==2.10.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.17
pytest==8.3.4
pytest-asyncio==0.24.0
httpx==0.28.1
alembic==1.14.0
python-dotenv==1.0.1
```

### config.py

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """应用配置"""
    # 应用信息
    APP_NAME: str = "Blog API"
    APP_VERSION: str = "1.0.0"

    # 数据库配置
    DATABASE_URL: str = "sqlite:///./blog.db"

    # JWT 配置
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # 应用配置
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"

settings = Settings()
```

### database.py

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

# 创建数据库引擎
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# 创建 SessionLocal 类
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基类
Base = declarative_base()

# 依赖注入：获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="一个功能完善的博客 API 系统"
)

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 导入并注册路由
from app.api import auth, users, posts, comments

app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(users.router, prefix="/api/users", tags=["用户"])
app.include_router(posts.router, prefix="/api/posts", tags=["文章"])
app.include_router(comments.router, prefix="/api/comments", tags=["评论"])

@app.get("/")
def read_root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 第二部分：数据模型

### models.py

```python
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from database import Base
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    EDITOR = "editor"
    USER = "user"

class PostStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    full_name = Column(String(100))
    bio = Column(Text)
    avatar_url = Column(String(200))
    role = Column(String(20), default=UserRole.USER)
    is_active = Column(Boolean, default=True)
    refresh_token = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关系
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    slug = Column(String(200), unique=True, index=True)
    content = Column(Text)
    excerpt = Column(String(500))
    featured_image = Column(String(200))
    status = Column(String(20), default=PostStatus.DRAFT)
    view_count = Column(Integer, default=0)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    published_at = Column(DateTime(timezone=True))

    # 关系
    author = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    category = relationship("Category", back_populates="posts")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    slug = Column(String(50), unique=True, index=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关系
    posts = relationship("Post", back_populates="category")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id"))
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关系
    author = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")
    parent = relationship("Comment", remote_side=[id])
    replies = relationship("Comment", cascade="all, delete-orphan")
```

### schemas.py

```python
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime

# ========== 认证相关 ==========
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=8)

# ========== 用户相关 ==========
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: Optional[str] = None
    bio: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserInDB(UserResponse):
    hashed_password: str

# ========== 分类相关 ==========
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    slug: str
    created_at: datetime

    class Config:
        from_attributes = True

# ========== 文章相关 ==========
class PostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: Optional[str] = None
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    status: str = "draft"
    category_id: Optional[int] = None

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = None
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    status: Optional[str] = None
    category_id: Optional[int] = None

class PostResponse(PostBase):
    id: int
    slug: str
    view_count: int
    author_id: int
    author: UserResponse
    category: Optional[CategoryResponse] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PostListResponse(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    view_count: int
    status: str
    author: UserResponse
    category: Optional[CategoryResponse] = None
    created_at: datetime
    comment_count: int = 0

    class Config:
        from_attributes = True

# ========== 评论相关 ==========
class CommentBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    parent_id: Optional[int] = None

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    author: UserResponse
    post_id: int
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True
```

---

## 第三部分：认证系统

### auth.py

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from config import settings
from database import get_db
from models import User

# 密码哈希上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 配置
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# ========== 密码工具 ==========
def hash_password(password: str) -> str:
    """哈希密码"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)

# ========== JWT 工具 ==========
def create_access_token(data: dict) -> str:
    """创建 Access Token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict) -> str:
    """创建 Refresh Token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    """解码 Token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

# ========== 用户认证 ==========
def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """验证用户"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """获取当前用户"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_token(token)
    if not payload:
        raise credentials_exception

    user_id: int = payload.get("sub")
    if not user_id:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise credentials_exception

    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """获取当前活跃用户"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="用户未激活")
    return current_user
```

### api/auth.py

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import TokenResponse, UserCreate, UserResponse
from auth import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    hash_password,
    get_current_active_user
)

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """用户注册"""
    # 检查用户名是否存在
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="用户名已被使用")

    # 检查邮箱是否存在
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="邮箱已被注册")

    # 创建用户
    hashed_password = hash_password(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post("/login", response_model=TokenResponse)
def login(
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

    if not user.is_active:
        raise HTTPException(status_code=403, detail="账户已被禁用")

    # 创建 Token
    access_token = create_access_token({"sub": str(user.id), "username": user.username})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    # 保存 Refresh Token
    user.refresh_token = refresh_token
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": 30 * 60  # 30 分钟
    }

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """刷新 Token"""
    from auth import decode_token

    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="无效的 Refresh Token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()

    if not user or user.refresh_token != refresh_token:
        raise HTTPException(status_code=401, detail="Refresh Token 已失效")

    # 生成新的 Access Token
    access_token = create_access_token({"sub": str(user.id), "username": user.username})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": 30 * 60
    }

@router.post("/logout")
def logout(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """用户登出"""
    current_user.refresh_token = None
    db.commit()
    return {"message": "登出成功"}

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """获取当前用户信息"""
    return current_user
```

---

## 第四部分：用户管理

### crud/users.py

```python
from sqlalchemy.orm import Session
from models import User
from schemas import UserCreate, UserUpdate
from typing import Optional, List
from auth import hash_password

def get_user(db: Session, user_id: int) -> Optional[User]:
    """根据 ID 获取用户"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """根据用户名获取用户"""
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """根据邮箱获取用户"""
    return db.query(User).filter(User.email == email).first()

def get_users(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None
) -> List[User]:
    """获取用户列表"""
    query = db.query(User)

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    return query.offset(skip).limit(limit).all()

def create_user(db: Session, user_data: UserCreate) -> User:
    """创建用户"""
    hashed_password = hash_password(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user: User, user_data: UserUpdate) -> User:
    """更新用户"""
    for field, value in user_data.dict(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user: User) -> None:
    """删除用户"""
    db.delete(user)
    db.commit()
```

### api/users.py

```python
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User
from schemas import UserResponse, UserUpdate
from auth import get_current_active_user
from crud import users as crud

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def get_users(
    skip: int = 0,
    limit: int = 100,
    is_active: bool = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取用户列表（需要认证）"""
    # 只有管理员可以查看所有用户
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="权限不足")

    users = crud.get_users(db, skip=skip, limit=limit, is_active=is_active)
    return users

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """获取用户详情"""
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user

@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新当前用户信息"""
    updated_user = crud.update_user(db, current_user, user_data)
    return updated_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除用户（仅管理员）"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="权限不足")

    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="不能删除自己")

    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    crud.delete_user(db, user)
    return None
```

---

## 第五部分：文章管理

### crud/posts.py

```python
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from models import Post, User, Comment
from schemas import PostCreate, PostUpdate
from typing import Optional, List
import re

def generate_slug(title: str) -> str:
    """生成 URL 友好的 slug"""
    slug = title.lower()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

def get_post(db: Session, post_id: int) -> Optional[Post]:
    """根据 ID 获取文章"""
    return db.query(Post).filter(Post.id == post_id).first()

def get_post_by_slug(db: Session, slug: str) -> Optional[Post]:
    """根据 slug 获取文章"""
    return db.query(Post).filter(Post.slug == slug).first()

def get_posts(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    status: Optional[str] = None,
    author_id: Optional[int] = None,
    category_id: Optional[int] = None,
    search: Optional[str] = None
) -> List[Post]:
    """获取文章列表"""
    query = db.query(Post)

    if status:
        query = query.filter(Post.status == status)

    if author_id:
        query = query.filter(Post.author_id == author_id)

    if category_id:
        query = query.filter(Post.category_id == category_id)

    if search:
        query = query.filter(
            or_(
                Post.title.contains(search),
                Post.content.contains(search)
            )
        )

    return query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()

def create_post(db: Session, post_data: PostCreate, author_id: int) -> Post:
    """创建文章"""
    slug = generate_slug(post_data.title)

    # 确保 slug 唯一
    existing = get_post_by_slug(db, slug)
    if existing:
        slug = f"{slug}-{db.query(func.count(Post.id)).scalar() + 1}"

    db_post = Post(
        title=post_data.title,
        slug=slug,
        content=post_data.content,
        excerpt=post_data.excerpt,
        featured_image=post_data.featured_image,
        status=post_data.status,
        category_id=post_data.category_id,
        author_id=author_id
    )

    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def update_post(db: Session, post: Post, post_data: PostUpdate) -> Post:
    """更新文章"""
    for field, value in post_data.dict(exclude_unset=True).items():
        if field == "title" and value:
            # 更新标题时重新生成 slug
            setattr(post, "slug", generate_slug(value))
        setattr(post, field, value)

    db.commit()
    db.refresh(post)
    return post

def delete_post(db: Session, post: Post) -> None:
    """删除文章"""
    db.delete(post)
    db.commit()

def increment_view_count(db: Session, post: Post) -> None:
    """增加阅读计数"""
    post.view_count += 1
    db.commit()
```

### api/posts.py

```python
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import User, Post
from schemas import PostCreate, PostUpdate, PostResponse, PostListResponse
from auth import get_current_active_user
from crud import posts as crud

router = APIRouter()

@router.get("/", response_model=List[PostListResponse])
def get_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    author_id: Optional[int] = None,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取文章列表"""
    posts = crud.get_posts(
        db,
        skip=skip,
        limit=limit,
        status=status,
        author_id=author_id,
        category_id=category_id,
        search=search
    )
    return posts

@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    """获取文章详情"""
    post = crud.get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")

    # 增加阅读计数
    crud.increment_view_count(db, post)

    return post

@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """创建文章"""
    new_post = crud.create_post(db, post_data, current_user.id)
    return new_post

@router.put("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: int,
    post_data: PostUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新文章"""
    post = crud.get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")

    # 只有作者和管理员可以修改
    if post.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="权限不足")

    updated_post = crud.update_post(db, post, post_data)
    return updated_post

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除文章"""
    post = crud.get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")

    # 只有作者和管理员可以删除
    if post.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="权限不足")

    crud.delete_post(db, post)
    return None
```

---

## 第六部分：评论系统

### crud/comments.py

```python
from sqlalchemy.orm import Session
from models import Comment, User
from schemas import CommentCreate
from typing import List, Optional

def get_comment(db: Session, comment_id: int) -> Optional[Comment]:
    """根据 ID 获取评论"""
    return db.query(Comment).filter(Comment.id == comment_id).first()

def get_post_comments(
    db: Session,
    post_id: int,
    skip: int = 0,
    limit: int = 50,
    only_approved: bool = True
) -> List[Comment]:
    """获取文章评论"""
    query = db.query(Comment).filter(Comment.post_id == post_id, Comment.parent_id.is_(None))

    if only_approved:
        query = query.filter(Comment.is_approved == True)

    return query.order_by(Comment.created_at.desc()).offset(skip).limit(limit).all()

def create_comment(
    db: Session,
    comment_data: CommentCreate,
    author_id: int,
    post_id: int
) -> Comment:
    """创建评论"""
    db_comment = Comment(
        content=comment_data.content,
        author_id=author_id,
        post_id=post_id,
        parent_id=comment_data.parent_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def delete_comment(db: Session, comment: Comment) -> None:
    """删除评论"""
    db.delete(comment)
    db.commit()

def approve_comment(db: Session, comment: Comment) -> Comment:
    """批准评论"""
    comment.is_approved = True
    db.commit()
    db.refresh(comment)
    return comment
```

### api/comments.py

```python
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Comment, Post
from schemas import CommentCreate, CommentResponse
from auth import get_current_active_user
from crud import comments as crud
from crud import posts as post_crud

router = APIRouter()

@router.get("/post/{post_id}", response_model=List[CommentResponse])
def get_post_comments(
    post_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """获取文章评论"""
    # 验证文章存在
    post = post_crud.get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")

    comments = crud.get_post_comments(db, post_id, skip=skip, limit=limit)
    return comments

@router.post("/", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    comment_data: CommentCreate,
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """创建评论"""
    # 验证文章存在
    post = post_crud.get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")

    # 如果是回复评论，验证父评论存在
    if comment_data.parent_id:
        parent_comment = crud.get_comment(db, comment_data.parent_id)
        if not parent_comment:
            raise HTTPException(status_code=404, detail="父评论不存在")

    new_comment = crud.create_comment(db, comment_data, current_user.id, post_id)
    return new_comment

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除评论"""
    comment = crud.get_comment(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="评论不存在")

    # 只有作者、文章作者和管理员可以删除
    is_author = comment.author_id == current_user.id
    is_post_author = comment.post.author_id == current_user.id
    is_admin = current_user.role == "admin"

    if not (is_author or is_post_author or is_admin):
        raise HTTPException(status_code=403, detail="权限不足")

    crud.delete_comment(db, comment)
    return None

@router.post("/{comment_id}/approve", response_model=CommentResponse)
def approve_comment(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """批准评论（仅管理员）"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="权限不足")

    comment = crud.get_comment(db, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="评论不存在")

    return crud.approve_comment(db, comment)
```

---

## 第七部分：测试

### tests/conftest.py

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from database import Base, get_db

# 测试数据库
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    """创建测试数据库会话"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db_session):
    """创建测试客户端"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(client):
    """创建测试用户"""
    response = client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "TestPass123!"
        }
    )
    return response.json()

@pytest.fixture
def auth_headers(client, test_user):
    """获取认证头"""
    response = client.post(
        "/api/auth/login",
        data={
            "username": test_user["username"],
            "password": "TestPass123!"
        }
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
```

### tests/test_auth.py

```python
def test_register(client):
    """测试注册"""
    response = client.post(
        "/api/auth/register",
        json={
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "NewPass123!"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newuser"
    assert "id" in data

def test_register_duplicate_username(client, test_user):
    """测试注册重复用户名"""
    response = client.post(
        "/api/auth/register",
        json={
            "username": test_user["username"],
            "email": "another@example.com",
            "password": "TestPass123!"
        }
    )
    assert response.status_code == 400

def test_login_success(client, test_user):
    """测试登录成功"""
    response = client.post(
        "/api/auth/login",
        data={
            "username": test_user["username"],
            "password": "TestPass123!"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client, test_user):
    """测试登录失败"""
    response = client.post(
        "/api/auth/login",
        data={
            "username": test_user["username"],
            "password": "WrongPassword123!"
        }
    )
    assert response.status_code == 401

def test_get_me(client, auth_headers):
    """测试获取当前用户"""
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "username" in data

def test_get_me_unauthorized(client):
    """测试未授权访问"""
    response = client.get("/api/auth/me")
    assert response.status_code == 401
```

### tests/test_posts.py

```python
def test_create_post(client, auth_headers):
    """测试创建文章"""
    response = client.post(
        "/api/posts/",
        json={
            "title": "Test Post",
            "content": "This is a test post content.",
            "status": "published"
        },
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Post"
    assert data["slug"] == "test-post"

def test_get_posts(client):
    """测试获取文章列表"""
    response = client.get("/api/posts/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_post_by_id(client, db_session):
    """测试获取单篇文章"""
    # 先创建文章
    from crud import posts
    from models import User
    from schemas import PostCreate

    author = db_session.query(User).first()
    post = posts.create_post(
        db_session,
        PostCreate(title="Test", content="Content", status="published"),
        author.id
    )

    response = client.get(f"/api/posts/{post.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == post.id

def test_update_post(client, auth_headers, db_session):
    """测试更新文章"""
    # 创建文章
    from crud import posts
    from models import User
    from schemas import PostCreate

    author = db_session.query(User).first()
    post = posts.create_post(
        db_session,
        PostCreate(title="Original Title", content="Content", status="published"),
        author.id
    )

    # 更新文章
    response = client.put(
        f"/api/posts/{post.id}",
        json={"title": "Updated Title"},
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"

def test_delete_post(client, auth_headers, db_session):
    """测试删除文章"""
    # 创建文章
    from crud import posts
    from models import User
    from schemas import PostCreate

    author = db_session.query(User).first()
    post = posts.create_post(
        db_session,
        PostCreate(title="To Delete", content="Content", status="published"),
        author.id
    )

    # 删除文章
    response = client.delete(f"/api/posts/{post.id}", headers=auth_headers)
    assert response.status_code == 204
```

---

## 第八部分：运行和部署

### 运行项目

```bash
# 安装依赖
pip install -r requirements.txt

# 初始化数据库
python -c "from database import engine, Base; Base.metadata.create_all(bind=engine)"

# 运行开发服务器
python -m uvicorn main:app --reload
```

### 运行测试

```bash
# 运行所有测试
pytest

# 运行指定文件
pytest tests/test_auth.py

# 显示详细输出
pytest -v

# 生成覆盖率报告
pytest --cov=app --cov-report=html
```

### Docker 部署

**Dockerfile**:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml**:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: bloguser
      POSTGRES_PASSWORD: blogpass
      POSTGRES_DB: blogdb
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://bloguser:blogpass@db:5432/blogdb
    depends_on:
      - db

volumes:
  postgres_data:
```

---

## 扩展建议

完成基础功能后，可以考虑添加：

1. **搜索功能**: 使用全文搜索
2. **标签系统**: 为文章添加标签
3. **文章点赞/收藏**: 用户交互功能
4. **邮件通知**: 评论回复通知
5. **图片上传**: 文章配图上传
6. **API 限流**: 防止滥用
7. **缓存**: 使用 Redis 缓存热门文章
8. **WebSocket**: 实时通知
9. **后台管理**: 管理员面板
10. **数据导出**: RSS 订阅、数据备份

---

> 恭喜完成博客 API 系统！你已经掌握了 FastAPI 开发的核心技能。
