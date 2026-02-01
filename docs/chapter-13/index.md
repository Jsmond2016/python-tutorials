# 第13章：数据库操作

## 本章简介

在实际开发中，几乎所有的应用都需要持久化数据存储。本章将学习如何使用 SQLAlchemy 操作数据库。

**学习目标**：
- 理解 ORM 的工作原理
- 掌握 SQLAlchemy 模型定义
- 学会执行 CRUD 操作
- 理解数据库关系（一对一、一对多、多对多）
- 掌握数据库迁移

---

## 13.1 数据库基础

### 关系型数据库 vs NoSQL

```
关系型数据库                  NoSQL
├── 结构化数据              ├── 灵活的数据模型
├── SQL 查询语言            ├── 各种查询方式
├── ACID 事务              ├── BASE 理论
├── 固定表结构              ├── 动态 Schema
└── PostgreSQL, MySQL      └── MongoDB, Redis
```

### SQL 基础回顾

```sql
-- 创建表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 插入数据
INSERT INTO users (username, email) VALUES ('john', 'john@example.com');

-- 查询数据
SELECT * FROM users WHERE username = 'john';

-- 更新数据
UPDATE users SET email = 'new@email.com' WHERE id = 1;

-- 删除数据
DELETE FROM users WHERE id = 1;

-- 关系查询
SELECT * FROM posts
INNER JOIN users ON posts.user_id = users.id
WHERE users.username = 'john';
```

---

## 13.2 SQLAlchemy 简介

### 什么是 ORM

**ORM**（Object-Relational Mapping，对象关系映射）将数据库表映射为 Python 类。

```
数据库表              Python 类
├── 字段 (Columns)    ├── 属性 (Attributes)
├── 行 (Rows)         ├── 实例 (Instances)
└── 表 (Table)        └── 类 (Class)
```

### 与前端 ORM 对比

| Python | JavaScript/TypeScript |
|--------|---------------------|
| SQLAlchemy | TypeORM / Prisma |
| Pydantic | Zod / Yup |
| Model 类 | Interface / Class |
| Session | EntityManager / Prisma Client |

### 安装 SQLAlchemy

```bash
# 核心包
pip install sqlalchemy

# FastAPI 集成
pip install fastapi
pip install uvicorn

# PostgreSQL 驱动
pip install psycopg2-binary

# SQLite（无需安装，Python 内置）

# MySQL 驱动
pip install pymysql
```

### 数据库连接

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite 数据库（文件型）
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# PostgreSQL
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/dbname"

# 创建引擎
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite 需要
)

# 创建 SessionLocal 类
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基类
Base = declarative_base()
```

### 依赖注入获取 Session

```python
from fastapi import Depends
from sqlalchemy.orm import Session

# 获取 Session 的依赖函数
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 在路由中使用
from fastapi import FastAPI

app = FastAPI()

@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users
```

---

## 13.3 模型定义

### 声明式映射

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"

    # 主键
    id = Column(Integer, primary_key=True, index=True)

    # 字符串字段
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(200), nullable=False)

    # 布尔字段
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    # 时间字段
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关系（一对多）
    posts = relationship("Post", back_populates="author")

    def __repr__(self):
        return f"<User {self.username}>"
```

### 列类型对照表

| Python 类型 | SQLAlchemy 类型 | 说明 |
|-------------|-----------------|------|
| `int` | `Integer` | 整数 |
| `str` | `String(length)` | 字符串 |
| `bool` | `Boolean` | 布尔值 |
| `float` | `Float` | 浮点数 |
| `datetime` | `DateTime` | 日期时间 |
| `bytes` | `LargeBinary` | 二进制数据 |
| `decimal.Decimal` | `Numeric` | 精确数字 |

### 模型配置选项

```python
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declared_attr

class BaseModel(Base):
    """所有模型的基类"""
    __abstract__ = True  # 抽象基类，不会创建表

    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower() + "s"

    id = Column(Integer, primary_key=True, index=True)

class User(BaseModel):
    username = Column(String(50))
    email = Column(String(100))

# 表名自动为 "users"
```

### 与 TypeScript 对比

```typescript
// TypeScript: TypeORM Entity
@Entity()
export class User {
  @PrimaryColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  email: string;

  @OneToMany(() => Post, post => post.author)
  posts: Post[];
}
```

```python
# Python: SQLAlchemy Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True)
    email = Column(String(100))

    posts = relationship("Post", back_populates="author")
```

---

## 13.4 关系定义

### 一对多关系（One-to-Many）

一个用户可以有多篇文章：

```python
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(50))

    # 反向关系：通过 user.posts 访问其所有文章
    posts = relationship("Post", back_populates="author")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True)
    title = Column(String(200))

    # 外键：每篇文章属于一个用户
    author_id = Column(Integer, ForeignKey("users.id"))

    # 正向关系：通过 post.author 访问作者信息
    author = relationship("User", back_populates="posts")
```

### 多对多关系（Many-to-Many）

一篇文章可以有多个标签，一个标签也可以用于多篇文章：

```python
# 关联表（手动定义）
post_tags = Table(
    'post_tags',
    Base.metadata,
    Column('post_id', Integer, ForeignKey('posts.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
)

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True)
    title = Column(String(200))

    # 多对多关系
    tags = relationship("Tag", secondary=post_tags, back_populates="posts")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True)

    posts = relationship("Post", secondary=post_tags, back_populates="tags")
```

### 一对一关系（One-to-One）

```python
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(50))

    # uselist=False 使关系变为一对一
    profile = relationship("Profile", back_populates="user", uselist=False)

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True)
    bio = Column(Text)

    # 外键带 unique 约束
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)

    user = relationship("User", back_populates="profile")
```

### 关系加载策略

```python
from sqlalchemy.orm import lazyload, selectinload, joinedload

# 懒加载（默认）：访问时才查询
user = db.query(User).first()
posts = user.posts  # 此时才发起查询

# 预加载：一次查询同时获取关联数据
# 方式1：selectinload（额外查询）
user = db.query(User).options(selectinload(User.posts)).first()

# 方式2：joinedload（JOIN 查询）
user = db.query(User).options(joinedload(User.posts)).first()

# 方式3：lazyload（显式懒加载）
user = db.query(User).options(lazyload(User.posts)).first()
```

---

## 13.5 CRUD 操作

### Create（创建）

```python
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

# 方法1：创建实例然后添加
def create_user(db: Session, username: str, email: str):
    user = User(username=username, email=email)
    db.add(user)
    db.commit()
    db.refresh(user)  # 刷新以获取数据库生成的值（如 id）
    return user

# 方法2：使用字典数据
def create_user_from_dict(db: Session, user_data: dict):
    user = User(**user_data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# FastAPI 路由示例
@app.post("/users", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def create_user_endpoint(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    # 检查用户名是否已存在
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="用户名已存在")

    new_user = User(**user.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
```

### Read（查询）

```python
# 查询所有
def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

# 根据 ID 查询
def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

# 查询并处理不存在
@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user

# 复杂查询
def search_users(db: Session, keyword: str = None, is_active: bool = None):
    query = db.query(User)

    if keyword:
        query = query.filter(User.username.contains(keyword))

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    return query.all()

# 排序
def get_users_sorted(db: Session):
    return db.query(User).order_by(User.created_at.desc()).all()

# 统计
def count_users(db: Session):
    return db.query(User).count()

# 聚合查询
from sqlalchemy import func

def get_user_stats(db: Session):
    return db.query(
        func.count(User.id).label('total'),
        func.sum(func.cast(User.is_active, Integer)).label('active_count')
    ).one()
```

### Update（更新）

```python
# 方法1：修改属性
def update_user(db: Session, user_id: int, new_email: str):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.email = new_email
        db.commit()
        db.refresh(user)
    return user

# 方法2：使用 update（批量更新）
def bulk_update_status(db: Session, user_ids: list[int], is_active: bool):
    db.query(User).filter(User.id.in_(user_ids)).update(
        {"is_active": is_active},
        synchronize_session=False
    )
    db.commit()

# FastAPI 端点
@app.put("/users/{user_id}")
def update_user_endpoint(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    # 只更新提供的字段
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user
```

### Delete（删除）

```python
# 方法1：获取后删除
def delete_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
    return user

# 方法2：直接删除
def delete_user_direct(db: Session, user_id: int):
    db.query(User).filter(User.id == user_id).delete()
    db.commit()

# FastAPI 端点
@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_endpoint(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    db.delete(user)
    db.commit()
    return None
```

### 查询过滤器速查表

| 操作 | SQLAlchemy | SQL 等价 |
|------|-----------|---------|
| 等于 | `filter(User.id == 1)` | `WHERE id = 1` |
| 不等于 | `filter(User.id != 1)` | `WHERE id != 1` |
| 大于 | `filter(User.age > 18)` | `WHERE age > 18` |
| 包含 | `filter(User.name.contains('John'))` | `WHERE name LIKE '%John%'` |
| 在列表中 | `filter(User.id.in_([1, 2, 3]))` | `WHERE id IN (1, 2, 3)` |
| 为空 | `filter(User.email.is_(None))` | `WHERE email IS NULL` |
| 逻辑与 | `filter(and_(cond1, cond2))` | `WHERE cond1 AND cond2` |
| 逻辑或 | `filter(or_(cond1, cond2))` | `WHERE cond1 OR cond2` |

---

## 13.6 数据库迁移

### 什么是迁移

迁移是对数据库结构的版本控制，类似于 Git 管理代码变更。

```
迁移文件
├── versions/
│   ├── 001_initial.py    # 创建初始表
│   ├── 002_add_email.py  # 添加 email 字段
│   └── 003_add_posts.py  # 添加 posts 表
```

### Alembic 基础

```bash
# 安装 Alembic
pip install alembic

# 初始化 Alembic
alembic init alembic

# 目录结构
myproject/
├── alembic/
│   ├── versions/          # 迁移脚本目录
│   ├── env.py            # 环境配置
│   └── script.py.mako    # 模板文件
├── alembic.ini           # 配置文件
└── main.py               # 应用入口
```

### 配置 Alembic

编辑 `alembic/env.py`：

```python
# 导入 Base 和所有模型
from models import Base, User, Post  # 导入你的模型
from database import engine  # 导入数据库引擎

# 设置 target_metadata
target_metadata = Base.metadata
```

编辑 `alembic.ini`：

```ini
# 设置数据库连接
sqlalchemy.url = sqlite:///./test.db
# 或使用环境变量
# sqlalchemy.url = postgresql://user:pass@localhost/dbname
```

### 创建迁移

```bash
# 生成迁移脚本（自动检测模型变化）
alembic revision --autogenerate -m "添加用户表"

# 手动创建迁移
alembic revision -m "自定义迁移"
```

生成的迁移文件：

```python
# alembic/versions/001_add_user_table.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    # 升级：应用变更
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_id', 'users', ['id'])
    op.create_index('ix_users_username', 'users', ['username'], unique=True)

def downgrade():
    # 降级：撤销变更
    op.drop_index('ix_users_username', table_name='users')
    op.drop_index('ix_users_id', table_name='users')
    op.drop_table('users')
```

### 执行迁移

```bash
# 升级到最新版本
alembic upgrade head

# 升级到指定版本
alembic upgrade +1  # 只升级一步
alembic upgrade 001  # 升级到 001 版本

# 降级
alembic downgrade -1  # 只降级一步
alembic downgrade base  # 降级到初始状态（删除所有表）

# 查看当前版本
alembic current

# 查看迁移历史
alembic history
```

### 常见迁移操作

```python
def upgrade():
    # 添加列
    op.add_column('users', sa.Column('age', sa.Integer(), nullable=True))

    # 删除列
    op.drop_column('users', 'age')

    # 修改列
    op.alter_column('users', 'username', type_=sa.String(100))

    # 创建表
    op.create_table(
        'posts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 删除表
    op.drop_table('posts')

    # 创建外键
    op.create_foreign_key(
        'fk_posts_author_id_users',
        'posts', 'users',
        ['author_id'], ['id']
    )

    # 创建索引
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
```

---

## 13.7 FastAPI 与 SQLAlchemy 集成

### 完整的项目结构

```
myproject/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI 应用
│   ├── database.py      # 数据库连接
│   ├── models.py        # SQLAlchemy 模型
│   ├── schemas.py       # Pydantic 模型
│   ├── crud.py          # CRUD 操作
│   └── routers/         # 路由模块
│       ├── __init__.py
│       ├── users.py
│       └── posts.py
├── alembic/             # 数据库迁移
│   └── versions/
├── tests/
├── requirements.txt
└── .env
```

### database.py

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### models.py

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    posts = relationship("Post", back_populates="author")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text)
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    author = relationship("User", back_populates="posts")
```

### schemas.py

```python
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True  # SQLAlchemy v2.0+

class PostBase(BaseModel):
    title: str
    content: Optional[str] = None

class PostCreate(PostBase):
    pass

class PostResponse(PostBase):
    id: int
    author_id: int
    created_at: datetime

    class Config:
        from_attributes = True
```

### crud.py

```python
from sqlalchemy.orm import Session
from models import User, Post
from schemas import UserCreate, UserUpdate, PostCreate
from typing import Optional, List

# 用户 CRUD
def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate) -> User:
    fake_hashed_password = user.password + "notreallyhashed"
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=fake_hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> Optional[User]:
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    db.delete(db_user)
    db.commit()
    return db_user

# 文章 CRUD
def create_post(db: Session, post: PostCreate, author_id: int) -> Post:
    db_post = Post(**post.dict(), author_id=author_id)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def get_posts(db: Session, skip: int = 0, limit: int = 100) -> List[Post]:
    return db.query(Post).offset(skip).limit(limit).all()

def get_user_posts(db: Session, user_id: int) -> List[Post]:
    return db.query(Post).filter(Post.author_id == user_id).all()
```

### routers/users.py

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from schemas import UserCreate, UserResponse, UserUpdate
import crud

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="邮箱已被注册")

    return crud.create_user(db=db, user=user)

@router.get("/", response_model=List[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/{user_id}", response_model=UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return db_user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db)
):
    db_user = crud.update_user(db, user_id=user_id, user_update=user_update)
    if not db_user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.delete_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return None
```

### main.py

```python
from fastapi import FastAPI
from database import engine, Base
from routers import users, posts

# 创建所有表（仅用于开发，生产环境使用迁移）
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Blog API")

# 注册路由
app.include_router(users.router)
app.include_router(posts.router)

@app.get("/")
def read_root():
    return {"message": "Blog API"}
```

---

## 常见问题

### Q1: 什么时候用 `filter()`，什么时候用 `filter_by()`？

**A**:

```python
# filter(): 使用 SQLAlchemy 表达式
db.query(User).filter(User.id == 1)
db.query(User).filter(User.username.contains('john'))

# filter_by(): 使用关键字参数（更简洁）
db.query(User).filter_by(id=1)
db.query(User).filter_by(username='john')

# filter_by 的限制：不支持复杂条件
# 不能使用：filter_by(User.age > 18)
```

### Q2: `commit()` 和 `flush()` 的区别？

**A**:

```python
# flush(): 发送到数据库，但可能不提交事务
user = User(username='john')
db.add(user)
db.flush()  # user.id 现在有值了
print(user.id)  # 可以访问

# commit(): 提交事务，永久保存
db.commit()  # 事务提交

# 使用场景：flush 用于获取生成的 ID
# commit 用于最终提交
```

### Q3: 如何处理 N+1 查询问题？

**A**:

```python
# 问题代码：N+1 查询
users = db.query(User).all()
for user in users:
    print(user.posts)  # 每次都查询数据库！

# 解决方案1：使用 joinedload
from sqlalchemy.orm import joinedload
users = db.query(User).options(joinedload(User.posts)).all()

# 解决方案2：使用 selectinload
from sqlalchemy.orm import selectinload
users = db.query(User).options(selectinload(User.posts)).all()

# 前端类比：
# 就像 GraphQL 的 DataLoader 批量查询
```

### Q4: SQLAlchemy vs Prisma？

**A**:

| 特性 | SQLAlchemy | Prisma |
|------|-----------|--------|
| 语言 | Python | TypeScript/Node |
| 模式 | 代码优先 | Schema 优先 |
| 类型提示 | 手动 | 自动生成 |
| 迁移 | Alembic | 内置 |
| 学习曲线 | 较高 | 较低 |

---

## 本章小结

### 核心知识点回顾

| 知识点 | 说明 |
|--------|------|
| ORM | 对象关系映射，表 → 类 |
| 模型定义 | `class User(Base)` |
| 关系 | 一对多、多对多、一对一 |
| CRUD | Create, Read, Update, Delete |
| 迁移 | Alembic 管理数据库结构变更 |

### SQLAlchemy 查询速查表

```python
# 创建
db.add(User(username='john'))
db.commit()

# 查询所有
db.query(User).all()

# 根据 ID 查询
db.query(User).filter(User.id == 1).first()

# 条件查询
db.query(User).filter(User.age >= 18).all()

# 排序
db.query(User).order_by(User.created_at.desc()).all()

# 统计
db.query(User).count()

# 更新
user = db.query(User).first()
user.email = 'new@email.com'
db.commit()

# 删除
db.delete(user)
db.commit()
```

### 项目结构

```
完整的项目包含：
├── database.py    # 数据库连接
├── models.py      # SQLAlchemy 模型
├── schemas.py     # Pydantic 模型
├── crud.py        # CRUD 操作
└── routers/       # API 路由
```

---

## 练习题

### 基础题

#### 题目 1：定义模型

定义一个 `Product` 模型，包含：
- id（主键）
- name（字符串，唯一）
- price（浮点数，必须大于0）
- stock（整数，默认0）
- created_at（时间，默认当前时间）

#### 题目 2：CRUD 操作

编写以下 CRUD 函数：

```python
def get_product(db: Session, product_id: int):
    pass

def get_products(db: Session, skip: int = 0, limit: int = 10):
    pass

def create_product(db: Session, name: str, price: float, stock: int = 0):
    pass

def update_product(db: Session, product_id: int, **kwargs):
    pass

def delete_product(db: Session, product_id: int):
    pass
```

#### 题目 3：关系查询

假设有 `User` 和 `Post` 模型（一对多关系），编写查询：

1. 获取所有用户及其文章数量
2. 获取没有文章的用户
3. 获取最近发布的 10 篇文章及作者信息

### 进阶题

#### 题目 4：复杂查询

实现一个产品搜索函数，支持：
- 关键词搜索（名称或描述）
- 价格范围过滤
- 库存状态（有货/无货）
- 排序（价格升序/降序）

```python
def search_products(
    db: Session,
    keyword: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock_only: bool = False,
    sort_by: str = "name"  # name, price_asc, price_desc
):
    pass
```

#### 题目 5：事务处理

实现一个订单创建函数，需要：
1. 减少产品库存
2. 创建订单记录
3. 创建订单项记录
4. 任一步骤失败则全部回滚

```python
def create_order(db: Session, user_id: int, items: list[dict]):
    # items = [{"product_id": 1, "quantity": 2}, ...]
    pass
```

### 挑战题

#### 题目 6：数据库迁移

编写迁移脚本完成以下任务：

1. 添加 `slug` 字段到 `posts` 表
2. 为已有文章生成 slug（基于标题）
3. 创建唯一索引

---

## 练习题答案

### 基础题答案

#### 题目 1 答案

```python
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False, index=True)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Product {self.name} - ${self.price}>"
```

#### 题目 2 答案

```python
from sqlalchemy.orm import Session
from models import Product
from typing import Optional, List

def get_product(db: Session, product_id: int) -> Optional[Product]:
    return db.query(Product).filter(Product.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 10) -> List[Product]:
    return db.query(Product).offset(skip).limit(limit).all()

def create_product(db: Session, name: str, price: float, stock: int = 0) -> Product:
    if price <= 0:
        raise ValueError("价格必须大于0")

    product = Product(name=name, price=price, stock=stock)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

def update_product(db: Session, product_id: int, **kwargs) -> Optional[Product]:
    product = get_product(db, product_id)
    if not product:
        return None

    for key, value in kwargs.items():
        if hasattr(product, key):
            setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product

def delete_product(db: Session, product_id: int) -> bool:
    product = get_product(db, product_id)
    if not product:
        return False

    db.delete(product)
    db.commit()
    return True
```

#### 题目 3 答案

```python
from sqlalchemy import func
from sqlalchemy.orm import joinedload

# 1. 获取所有用户及其文章数量
def get_users_with_post_count(db: Session):
    return db.query(
        User.id,
        User.username,
        func.count(Post.id).label('post_count')
    ).outerjoin(Post).group_by(User.id).all()

# 2. 获取没有文章的用户
def get_users_without_posts(db: Session):
    return db.query(User).outerjoin(Post).filter(Post.id.is_(None)).all()

# 3. 获取最近发布的 10 篇文章及作者信息
def get_recent_posts_with_author(db: Session):
    return db.query(Post)\
        .options(joinedload(Post.author))\
        .order_by(Post.created_at.desc())\
        .limit(10)\
        .all()
```

### 进阶题答案

#### 题目 4 答案

```python
from sqlalchemy import or_, and_

def search_products(
    db: Session,
    keyword: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    in_stock_only: bool = False,
    sort_by: str = "name"
):
    query = db.query(Product)

    # 关键词搜索
    if keyword:
        query = query.filter(
            or_(
                Product.name.contains(keyword),
                Product.description.contains(keyword)
            )
        )

    # 价格范围
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # 库存状态
    if in_stock_only:
        query = query.filter(Product.stock > 0)

    # 排序
    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    else:
        query = query.order_by(Product.name.asc())

    return query.all()
```

#### 题目 5 答案

```python
from sqlalchemy.exc import IntegrityError

def create_order(db: Session, user_id: int, items: list[dict]):
    try:
        # 开始事务（SQLAlchemy 默认行为）
        # 1. 验证并锁定库存
        for item in items:
            product = db.query(Product).filter(
                Product.id == item['product_id']
            ).with_for_update().first()

            if not product:
                raise ValueError(f"产品 {item['product_id']} 不存在")

            if product.stock < item['quantity']:
                raise ValueError(f"产品 {product.name} 库存不足")

        # 2. 减少库存
        for item in items:
            db.query(Product).filter(
                Product.id == item['product_id']
            ).update({
                "stock": Product.stock - item['quantity']
            })

        # 3. 创建订单
        total = sum(item['price'] * item['quantity'] for item in items)
        order = Order(user_id=user_id, total=total)
        db.add(order)
        db.flush()  # 获取 order.id

        # 4. 创建订单项
        for item in items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item['product_id'],
                quantity=item['quantity'],
                price=item['price']
            )
            db.add(order_item)

        # 提交事务
        db.commit()
        db.refresh(order)
        return order

    except Exception as e:
        # 回滚事务
        db.rollback()
        raise e
```

### 挑战题答案

#### 题目 6 答案

```python
# alembic/versions/xxx_add_slug_to_posts.py

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
import re

# 定义表结构（用于数据操作）
posts_table = table('posts',
    column('id', sa.Integer),
    column('title', sa.String),
    column('slug', sa.String)
)

def generate_slug(title: str) -> str:
    """生成 slug"""
    # 转小写
    slug = title.lower()
    # 替换空格为连字符
    slug = re.sub(r'\s+', '-', slug)
    # 只保留字母、数字和连字符
    slug = re.sub(r'[^\w\-]', '', slug)
    return slug

def upgrade():
    # 1. 添加 slug 列（可空）
    op.add_column('posts', sa.Column('slug', sa.String(200), nullable=True))

    # 2. 为已有数据生成 slug
    connection = op.get_bind()
    posts = connection.execute(sa.text("SELECT id, title FROM posts")).fetchall()

    for post_id, title in posts:
        slug = generate_slug(title)
        connection.execute(
            sa.text("UPDATE posts SET slug = :slug WHERE id = :id"),
            {"slug": slug, "id": post_id}
        )

    # 3. 将列设为不可空
    op.alter_column('posts', 'slug', nullable=False)

    # 4. 创建唯一索引
    op.create_index('ix_posts_slug', 'posts', ['slug'], unique=True)

def downgrade():
    # 1. 删除索引
    op.drop_index('ix_posts_slug', table_name='posts')

    # 2. 删除列
    op.drop_column('posts', 'slug')
```

---

> 下一章：[第14章：身份认证与授权](/chapter-14/) - 实现 JWT 认证系统
