# 第18章：缓存与性能优化

## 本章简介

性能优化是后端开发的重要课题。合理的缓存策略可以大幅提升应用性能，减少数据库压力。

本章将学习：
- 缓存的基本概念和策略
- Redis 的使用方法
- FastAPI 中的缓存实现
- 数据库查询优化技巧

**学习目标**：
- 理解缓存的工作原理
- 掌握 Redis 的基本使用
- 实现多层缓存策略
- 识别和优化性能瓶颈

---

## 目录

1. [缓存基础](#缓存基础)
2. [Redis 入门](#redis-入门)
3. [FastAPI 缓存](#fastapi-缓存)
4. [性能优化](#性能优化)
5. [练习题](#练习题)
6. [练习答案](#练习答案)

---

## 18.1 缓存基础

### 什么是缓存

缓存是将频繁访问的数据存储在快速访问介质中，减少重复计算或数据库查询。

### 缓存类型

```
┌─────────────────────────────────────────────┐
│                  应用层                      │
├─────────────────────────────────────────────┤
│  浏览器缓存 → CDN缓存 → 应用缓存 → 数据库    │
│     (前端)      (静态)      (Redis)         │
└─────────────────────────────────────────────┘
```

| 缓存类型 | 位置 | 速度 | 容量 | 说明 |
|---------|------|------|------|------|
| 浏览器缓存 | 客户端 | 最快 | 小 | 静态资源 |
| CDN 缓存 | 边缘节点 | 快 | 中 | 静态内容 |
| 应用缓存 | 服务器 | 中 | 中 | Redis/Memcached |
| 数据库查询缓存 | 数据库 | 慢 | 小 | 查询结果 |

### 缓存策略

#### Cache-Aside（旁路缓存）

```
读取:
1. 检查缓存
2. 命中 → 返回
3. 未命中 → 查询数据库 → 写入缓存 → 返回

写入:
1. 更新数据库
2. 删除缓存（非更新）
```

```python
def get_user(user_id: str):
    # 先查缓存
    cached = redis.get(f"user:{user_id}")
    if cached:
        return json.loads(cached)

    # 缓存未命中，查数据库
    user = db.query(User).filter_by(id=user_id).first()

    # 写入缓存
    redis.setex(f"user:{user_id}", 3600, json.dumps(user))

    return user

def update_user(user_id: str, data: dict):
    # 更新数据库
    db.query(User).filter_by(id=user_id).update(data)
    db.commit()

    # 删除缓存
    redis.delete(f"user:{user_id}")
```

#### Write-Through（写穿）

```
写入:
1. 同时写入缓存和数据库
2. 保证数据一致性
```

#### Write-Behind（写回）

```
写入:
1. 先写缓存
2. 异步批量写入数据库
3. 性能最好，但可能丢失数据
```

### 缓存失效策略

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| TTL | 时间过期 | 大多数场景 |
| LRU | 最近最少使用 | 内存限制 |
| LFU | 最少使用频率 | 热点数据 |
| FIFO | 先进先出 | 简单场景 |

### 缓存问题

#### 缓存穿透

```
问题: 查询不存在的数据，每次都查数据库

解决:
1. 布隆过滤器
2. 缓存空值
```

```python
def get_user(user_id: str):
    # 先查缓存
    cached = redis.get(f"user:{user_id}")
    if cached == "NULL":
        return None  # 缓存空值
    if cached:
        return json.loads(cached)

    # 查数据库
    user = db.query(User).filter_by(id=user_id).first()

    if user:
        redis.setex(f"user:{user_id}", 3600, json.dumps(user))
    else:
        # 缓存空值，防止穿透
        redis.setex(f"user:{user_id}", 300, "NULL")

    return user
```

#### 缓存击穿

```
问题: 热点数据过期，大量请求同时查询数据库

解决:
1. 互斥锁
2. 永不过期（异步更新）
```

```python
import asyncio

lock = asyncio.Lock()

async def get_hot_data(key: str):
    # 先查缓存
    cached = redis.get(key)
    if cached:
        return json.loads(cached)

    # 获取锁
    async with lock:
        # 再次检查缓存（双重检查）
        cached = redis.get(key)
        if cached:
            return json.loads(cached)

        # 查询数据库
        data = db.query(HotData).filter_by(key=key).first()

        # 写入缓存
        redis.setex(key, 3600, json.dumps(data))

        return data
```

#### 缓存雪崩

```
问题: 大量缓存同时过期，数据库压力骤增

解决:
1. 随机过期时间
2. 缓存预热
3. 限流降级
```

```python
import random

# 添加随机过期时间，防止同时过期
expire_time = 3600 + random.randint(0, 300)  # 1小时 + 0-5分钟
redis.setex(key, expire_time, value)
```

---

## 18.2 Redis 入门

### Redis 简介

Redis 是高性能的键值存储数据库，支持：
- 字符串 (String)
- 哈希 (Hash)
- 列表 (List)
- 集合 (Set)
- 有序集合 (Sorted Set)

### 安装 Redis

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt install redis-server
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:alpine

# 验证安装
redis-cli ping
# 输出: PONG
```

### Python Redis 客户端

```bash
pip install redis
```

### 基本操作

```python
import redis

# 连接 Redis
r = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True  # 自动解码为字符串
)

# 字符串操作
r.set('name', 'Python')
value = r.get('name')  # 'Python'

# 设置过期时间
r.setex('session:123', 3600, 'user_data')  # 1小时后过期

# 不存在则设置
r.setnx('counter', 1)

# 哈希操作
r.hset('user:1', 'name', 'Alice')
r.hset('user:1', 'email', 'alice@example.com')
name = r.hget('user:1', 'name')  # 'Alice'
user_data = r.hgetall('user:1')  # {'name': 'Alice', 'email': 'alice@example.com'}

# 列表操作
r.lpush('queue', 'task1', 'task2', 'task3')
task = r.rpop('queue')  # 'task1'

# 集合操作
r.sadd('tags', 'python', 'redis', 'web')
tags = r.smembers('tags')  # {'python', 'redis', 'web'}

# 有序集合操作
r.zadd('rank', {'Alice': 100, 'Bob': 85, 'Charlie': 95})
top_3 = r.zrevrange('rank', 0, 2, withscores=True)
```

### Redis 数据类型选择

| 场景 | 数据类型 | 示例 |
|------|---------|------|
| 简单键值 | String | 缓存、计数器 |
| 对象存储 | Hash | 用户信息 |
| 消息队列 | List | 任务队列 |
| 去重/标签 | Set | 标签系统 |
| 排行榜 | Sorted Set | 评分排行 |

---

## 18.3 FastAPI 缓存

### 响应缓存

```python
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from redis import Redis
import json
import hashlib

app = FastAPI()
redis_client = Redis(host='localhost', port=6379, decode_responses=True)

def cache_key(*args, **kwargs):
    """生成缓存键"""
    key_data = f"{args}{kwargs}"
    return f"cache:{hashlib.md5(key_data.encode()).hexdigest()}"

def get_cache(key: str):
    """获取缓存"""
    data = redis_client.get(key)
    if data:
        return json.loads(data)
    return None

def set_cache(key: str, data, expire: int = 300):
    """设置缓存"""
    redis_client.setex(key, expire, json.dumps(data))

@app.get("/api/posts/{post_id}")
async def get_post(post_id: int):
    # 尝试从缓存获取
    cache_key = f"post:{post_id}"
    cached = get_cache(cache_key)
    if cached:
        return JSONResponse(
            content=cached,
            headers={"X-Cache": "HIT"}
        )

    # 缓存未命中，查询数据库
    post = db.query(Post).filter_by(id=post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")

    post_data = {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "author": post.author
    }

    # 写入缓存
    set_cache(cache_key, post_data, expire=600)

    return JSONResponse(
        content=post_data,
        headers={"X-Cache": "MISS"}
    )
```

### 装饰器缓存

```python
from functools import wraps
import inspect

def cached(expire: int = 300, key_prefix: str = "cache"):
    """缓存装饰器"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 生成缓存键
            func_params = inspect.signature(func).parameters
            args_values = {
                name: str(value)
                for name, value in zip(func_params.keys(), args)
            }
            args_values.update(kwargs)

            cache_key = f"{key_prefix}:{func.__name__}:{hashlib.md5(str(args_values).encode()).hexdigest()}"

            # 尝试获取缓存
            cached = get_cache(cache_key)
            if cached is not None:
                return cached

            # 执行函数
            result = await func(*args, **kwargs)

            # 写入缓存
            set_cache(cache_key, result, expire)

            return result

        return wrapper
    return decorator

# 使用装饰器
@app.get("/api/users/{user_id}")
@cached(expire=600, key_prefix="user")
async def get_user(user_id: int):
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user
```

### 查询结果缓存

```python
from typing import List, Optional
from pydantic import BaseModel

class Post(BaseModel):
    id: int
    title: str
    content: str

@app.get("/api/posts", response_model=List[Post])
async def get_posts(
    page: int = 1,
    limit: int = 10,
    category: Optional[str] = None
):
    # 生成缓存键
    cache_key = f"posts:page={page}:limit={limit}:category={category or 'all'}"

    # 尝试获取缓存
    cached = get_cache(cache_key)
    if cached:
        return cached

    # 构建查询
    query = db.query(Post)
    if category:
        query = query.filter_by(category=category)

    # 分页
    offset = (page - 1) * limit
    posts = query.offset(offset).limit(limit).all()

    result = [Post.from_orm(p) for p in posts]

    # 写入缓存（5分钟）
    set_cache(cache_key, result, expire=300)

    return result
```

### 缓存失效

```python
@app.post("/api/posts")
async def create_post(post: PostCreate):
    # 创建文章
    new_post = Post(**post.dict())
    db.add(new_post)
    db.commit()

    # 清除相关缓存
    # 清除列表缓存
    for page in range(1, 11):  # 假设清除前10页
        redis_client.delete(f"posts:page={page}:limit=10:category=all")
        if post.category:
            redis_client.delete(f"posts:page={page}:limit=10:category={post.category}")

    return new_post

@put("/api/posts/{post_id}")
async def update_post(post_id: int, post: PostUpdate):
    # 更新文章
    db.query(Post).filter_by(id=post_id).update(post.dict(exclude_unset=True))
    db.commit()

    # 清除缓存
    redis_client.delete(f"post:{post_id}")

    # 清除列表缓存（简化版，可使用模式匹配）
    keys = redis_client.keys("posts:*")
    if keys:
        redis_client.delete(*keys)

    return {"message": "更新成功"}
```

### 会话缓存

```python
import secrets
from datetime import datetime, timedelta

SESSION_EXPIRE = 3600  # 1小时

def create_session(user_id: int) -> str:
    """创建会话"""
    session_id = secrets.token_urlsafe(32)

    session_data = {
        "user_id": user_id,
        "created_at": datetime.now().isoformat(),
        "last_activity": datetime.now().isoformat()
    }

    redis_client.setex(
        f"session:{session_id}",
        SESSION_EXPIRE,
        json.dumps(session_data)
    )

    return session_id

def get_session(session_id: str) -> Optional[dict]:
    """获取会话"""
    session_data = redis_client.get(f"session:{session_id}")
    if session_data:
        # 更新最后活跃时间
        data = json.loads(session_data)
        data["last_activity"] = datetime.now().isoformat()
        redis_client.setex(
            f"session:{session_id}",
            SESSION_EXPIRE,
            json.dumps(data)
        )
        return data
    return None

def delete_session(session_id: str):
    """删除会话"""
    redis_client.delete(f"session:{session_id}")

@app.post("/api/login")
async def login(username: str, password: str):
    # 验证用户
    user = authenticate_user(username, password)
    if not user:
        raise HTTPException(status_code=401, detail="认证失败")

    # 创建会话
    session_id = create_session(user.id)

    return {"access_token": session_id, "token_type": "bearer"}

@app.post("/api/logout")
async def logout(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    delete_session(token)
    return {"message": "退出成功"}
```

---

## 18.4 性能优化

### 数据库优化

#### 查询优化

```python
# ❌ N+1 查询问题
def get_posts_with_authors():
    posts = db.query(Post).all()  # 1次查询
    result = []
    for post in posts:
        author = db.query(User).filter_by(id=post.author_id).first()  # N次查询
        result.append({
            "post": post,
            "author": author
        })
    return result  # 总共 1 + N 次查询

# ✅ 使用 join
def get_posts_with_authors():
    posts = db.query(Post)\
        .join(User, Post.author_id == User.id)\
        .all()  # 1次查询
    return posts
```

#### 使用索引

```python
from sqlalchemy import Index

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True)
    title = Column(String(200))
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    category = Column(String(50))

    # 添加索引
    __table_args__ = (
        Index('idx_author_id', 'author_id'),
        Index('idx_category', 'category'),
        Index('idx_created_at', 'created_at'),
        Index('idx_category_created', 'category', 'created_at'),  # 复合索引
    )
```

#### 批量操作

```python
# ❌ 逐条插入
for item in items:
    db.add(Item(**item))
    db.commit()  # N 次提交

# ✅ 批量插入
db.bulk_insert_mappings(Item, items)
db.commit()  # 1 次提交
```

### 连接池配置

```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

# 配置连接池
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,          # 连接池大小
    max_overflow=20,       # 最大溢出连接数
    pool_timeout=30,       # 获取连接超时时间
    pool_recycle=1800,     # 连接回收时间（秒）
    pool_pre_ping=True,    # 连接前检查有效性
    echo=False
)
```

### 异步优化

```python
import asyncio
from httpx import AsyncClient

# ❌ 同步请求
def fetch_urls(urls: list):
    results = []
    for url in urls:
        response = requests.get(url)
        results.append(response.json())
    return results

# ✅ 异步并发请求
async def fetch_urls(urls: list):
    async with AsyncClient() as client:
        tasks = [client.get(url) for url in urls]
        responses = await asyncio.gather(*tasks)
        return [r.json() for r in responses]
```

### 使用 cProfile 分析性能

```python
import cProfile
import pstats
from io import StringIO

def profile_function(func):
    """性能分析装饰器"""
    def wrapper(*args, **kwargs):
        pr = cProfile.Profile()
        pr.enable()

        result = func(*args, **kwargs)

        pr.disable()

        # 输出分析结果
        s = StringIO()
        ps = pstats.Stats(pr, stream=s).sort_stats('cumulative')
        ps.print_stats(20)  # 打印前20个
        print(s.getvalue())

        return result
    return wrapper

@profile_function
def slow_function():
    # 需要分析的函数
    pass
```

### 内存优化

```python
import gc
import tracemalloc

def check_memory_usage():
    """检查内存使用"""
    # 当前内存使用
    current = tracemalloc.get_traced_memory()

    print(f"当前内存使用: {current[0] / 1024 / 1024:.2f} MB")
    print(f"峰值内存使用: {current[1] / 1024 / 1024:.2f} MB")

    # 垃圾回收
    gc.collect()

# 使用生成器减少内存
def process_large_file(filepath: str):
    """❌ 一次性加载到内存"""
    with open(filepath) as f:
        lines = f.readlines()  # 全部加载
    return [process_line(line) for line in lines]

def process_large_file_stream(filepath: str):
    """✅ 使用生成器流式处理"""
    with open(filepath) as f:
        for line in f:  # 逐行读取
            yield process_line(line)
```

---

## 常见问题

### Q1: Redis 和 Memcached 怎么选？

**A**: 对比一下：

| 特性 | Redis | Memcached |
|------|-------|-----------|
| 数据类型 | 丰富 | 仅字符串 |
| 持久化 | 支持 | 不支持 |
| 集群 | 支持 | 不支持 |
| 性能 | 很高 | 极高 |
| 功能 | 缓存+队列+排行榜 | 纯缓存 |

**选择建议**：
- 需要复杂数据结构 → Redis
- 需要持久化 → Redis
- 纯缓存，追求极致性能 → Memcached
- 大多数场景 → Redis

### Q2: 缓存应该设置多长的过期时间？

**A**: 根据数据特性：

| 数据类型 | 过期时间 | 说明 |
|---------|---------|------|
| 热点数据 | 1-5 分钟 | 高频访问，短缓存 |
| 用户信息 | 10-30 分钟 | 中等频率 |
| 列表数据 | 1-5 分钟 | 变化较频繁 |
| 配置数据 | 1-24 小时 | 很少变化 |
| 永久数据 | 不过期 | 配合主动失效 |

### Q3: 如何保证缓存和数据库的一致性？

**A**: 几种策略：

1. **Cache-Aside（推荐）**：先更新数据库，再删除缓存
2. **延时双删**：更新数据库 → 删除缓存 → 延时 → 再删缓存
3. **订阅 Binlog**：监听数据库变更，异步更新缓存

```python
# 延时双删
def update_with_cache_delay(data: dict):
    # 1. 更新数据库
    db.update(data)

    # 2. 删除缓存
    redis.delete(f"item:{data['id']}")

    # 3. 延时再删
    asyncio.sleep(1)
    redis.delete(f"item:{data['id']}")
```

### Q4: 如何监控缓存命中率？

**A**: 实现监控：

```python
class CacheMonitor:
    def __init__(self):
        self.hits = 0
        self.misses = 0

    def record_hit(self):
        self.hits += 1

    def record_miss(self):
        self.misses += 1

    def get_hit_rate(self) -> float:
        total = self.hits + self.misses
        if total == 0:
            return 0.0
        return self.hits / total

monitor = CacheMonitor()

def get_with_monitor(key: str):
    cached = redis.get(key)
    if cached:
        monitor.record_hit()
        return cached
    monitor.record_miss()
    return None

@app.get("/cache/stats")
async def cache_stats():
    return {
        "hits": monitor.hits,
        "misses": monitor.misses,
        "hit_rate": f"{monitor.get_hit_rate():.2%}"
    }
```

---

## 本章小结

### 核心知识点回顾

| 知识点 | 内容 |
|--------|------|
| 缓存策略 | Cache-Aside、Write-Through、Write-Behind |
| Redis | 字符串、哈希、列表、集合、有序集合 |
| FastAPI 缓存 | 装饰器、响应缓存、会话缓存 |
| 性能优化 | 数据库优化、连接池、异步处理 |
| 缓存问题 | 穿透、击穿、雪崩及解决方案 |

### 与前端知识对比

| 前端 | Python 后端 |
|------|-------------|
| localStorage | Redis 持久化 |
| sessionStorage | Redis 临时缓存 |
| Memory Cache | 应用内存缓存 |
| CDN 缓存 | Nginx 缓存 |
| Service Worker | 后台任务缓存 |

### 下一步

下一章我们将学习 **日志与监控**：
- 配置结构化日志
- 集成错误追踪
- 实现健康检查
- 配置监控面板

---

## 练习题

### 基础题

#### 题目 1：响应缓存

实现文章详情的缓存：
1. 创建 GET /posts/{id} 接口
2. 使用 Redis 缓存文章数据
3. 缓存 5 分钟
4. 返回时显示缓存状态（HIT/MISS）

#### 题目 2：会话管理

实现基于 Redis 的会话管理：
1. 登录时创建会话，返回 session_id
2. 需要认证的接口验证会话
3. 会话过期时间 1 小时
4. 退出时删除会话

#### 题目 3：缓存装饰器

实现一个通用的缓存装饰器：
1. 支持自定义过期时间
2. 自动根据函数参数生成缓存键
3. 支持同步和异步函数
4. 支持手动清除缓存

### 进阶题

#### 题目 4：排行榜系统

使用 Redis Sorted Set 实现游戏排行榜：
1. 添加分数接口
2. 获取 TOP 100 接口
3. 获取用户排名接口
4. 实现排名缓存

#### 题目 5：多层缓存

实现 L1(内存) + L2(Redis) 多层缓存：
1. 先查内存缓存
2. 未命中查 Redis
3. 未命中查数据库
4. 写入时更新所有层

### 挑战题

#### 题目 6：缓存预热系统

实现一个智能缓存预热系统：
1. 应用启动时预热热点数据
2. 定时更新即将过期的缓存
3. 监控缓存命中率
4. 自动调整缓存时间

---

## 练习答案

### 基础题答案

#### 题目 1 答案

```python
from fastapi import FastAPI, HTTPException
from redis import Redis
import json

app = FastAPI()
redis_client = Redis(host='localhost', port=6379, decode_responses=True)

@app.get("/posts/{post_id}")
async def get_post(post_id: int):
    cache_key = f"post:{post_id}"

    # 尝试从缓存获取
    cached = redis_client.get(cache_key)
    if cached:
        return {
            "data": json.loads(cached),
            "cache": "HIT"
        }

    # 缓存未命中，查询数据库
    post = db.query(Post).filter_by(id=post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")

    post_data = {
        "id": post.id,
        "title": post.title,
        "content": post.content
    }

    # 写入缓存（5分钟）
    redis_client.setex(cache_key, 300, json.dumps(post_data))

    return {
        "data": post_data,
        "cache": "MISS"
    }
```

#### 题目 2 答案

```python
import secrets
from datetime import datetime
from fastapi import Header, HTTPException

SESSION_EXPIRE = 3600

def create_session(user_id: int) -> str:
    session_id = secrets.token_urlsafe(32)
    session_data = {
        "user_id": user_id,
        "created_at": datetime.now().isoformat()
    }
    redis_client.setex(
        f"session:{session_id}",
        SESSION_EXPIRE,
        json.dumps(session_data)
    )
    return session_id

def get_user_from_session(session_id: str) -> dict:
    session_data = redis_client.get(f"session:{session_id}")
    if not session_data:
        return None
    return json.loads(session_data)

@app.post("/login")
async def login(username: str, password: str):
    # 验证用户
    user = db.query(User).filter_by(username=username).first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="认证失败")

    # 创建会话
    session_id = create_session(user.id)

    return {"session_id": session_id}

@app.get("/protected")
async def protected_route(authorization: str = Header(...)):
    # 提取 session_id
    session_id = authorization.replace("Bearer ", "")

    # 验证会话
    session = get_user_from_session(session_id)
    if not session:
        raise HTTPException(status_code=401, detail="未认证")

    return {"user_id": session["user_id"]}

@app.post("/logout")
async def logout(authorization: str = Header(...)):
    session_id = authorization.replace("Bearer ", "")
    redis_client.delete(f"session:{session_id}")
    return {"message": "退出成功"}
```

#### 题目 3 答案

```python
from functools import wraps
import hashlib
import inspect

def cached(expire: int = 300, key_prefix: str = "cache"):
    """通用缓存装饰器"""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            # 生成缓存键
            cache_key = _generate_cache_key(func.__name__, args, kwargs, key_prefix)

            # 尝试获取缓存
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)

            # 执行函数
            result = await func(*args, **kwargs)

            # 写入缓存
            redis_client.setex(cache_key, expire, json.dumps(result))

            return result

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            cache_key = _generate_cache_key(func.__name__, args, kwargs, key_prefix)

            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)

            result = func(*args, **kwargs)
            redis_client.setex(cache_key, expire, json.dumps(result))

            return result

        # 根据函数类型返回对应的包装器
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper

    return decorator

def _generate_cache_key(func_name: str, args, kwargs, prefix: str) -> str:
    """生成缓存键"""
    # 将参数转换为字符串
    args_str = ",".join(str(arg) for arg in args)
    kwargs_str = ",".join(f"{k}={v}" for k, v in sorted(kwargs.items()))

    key_data = f"{func_name}:{args_str}:{kwargs_str}"
    hash_key = hashlib.md5(key_data.encode()).hexdigest()

    return f"{prefix}:{func_name}:{hash_key}"

def clear_cache(pattern: str):
    """清除匹配模式的缓存"""
    keys = redis_client.keys(f"cache:{pattern}*")
    if keys:
        redis_client.delete(*keys)

# 使用示例
@app.get("/users/{user_id}")
@cached(expire=600)
async def get_user(user_id: int):
    user = db.query(User).filter_by(id=user_id).first()
    return user
```

### 进阶题答案

#### 题目 4 答案

```python
from fastapi import FastAPI
from redis import Redis

app = FastAPI()
redis_client = Redis(host='localhost', port=6379, decode_responses=True)

LEADERBOARD_KEY = "game:leaderboard"
TOP_N = 100

@app.post("/leaderboard/score")
async def add_score(user_id: int, score: float):
    """添加分数"""
    redis_client.zadd(LEADERBOARD_KEY, {str(user_id): score})
    return {"message": "分数已添加"}

@app.get("/leaderboard/top")
async def get_top_leaderboard(limit: int = TOP_N):
    """获取排行榜前 N 名"""
    # 获取前 N 名（降序）
    top_scores = redis_client.zrevrange(
        LEADERBOARD_KEY,
        0,
        limit - 1,
        withscores=True
    )

    # 格式化结果
    result = [
        {
            "rank": idx + 1,
            "user_id": int(user_id),
            "score": float(score)
        }
        for idx, (user_id, score) in enumerate(top_scores)
    ]

    return result

@app.get("/leaderboard/rank/{user_id}")
async def get_user_rank(user_id: int):
    """获取用户排名和分数"""
    # 获取分数
    score = redis_client.zscore(LEADERBOARD_KEY, str(user_id))

    if score is None:
        return {"error": "用户不在排行榜中"}

    # 获取排名（降序，从0开始）
    rank = redis_client.zrevrank(LEADERBOARD_KEY, str(user_id))

    return {
        "user_id": user_id,
        "score": float(score),
        "rank": rank + 1 if rank is not None else None
    }

@app.get("/leaderboard/around/{user_id}")
async def get_around_user(user_id: int, count: int = 5):
    """获取用户周围的排名"""
    rank = redis_client.zrevrank(LEADERBOARD_KEY, str(user_id))

    if rank is None:
        return {"error": "用户不在排行榜中"}

    # 获取周围的用户
    start = max(0, rank - count)
    end = rank + count

    around = redis_client.zrevrange(
        LEADERBOARD_KEY,
        start,
        end,
        withscores=True
    )

    return {
        "user_id": user_id,
        "rank": rank + 1,
        "around": [
            {"rank": start + idx + 1, "user_id": int(uid), "score": float(score)}
            for idx, (uid, score) in enumerate(around)
        ]
    }
```

#### 题目 5 答案

```python
from typing import Optional, Any
import asyncio

class MultiLevelCache:
    """多层缓存"""

    def __init__(self):
        # L1: 内存缓存
        self.memory_cache: dict = {}
        self.memory_lock = asyncio.Lock()

        # L2: Redis
        self.redis = Redis(host='localhost', port=6379, decode_responses=True)

        # 统计
        self.l1_hits = 0
        self.l2_hits = 0
        self.misses = 0

    async def get(self, key: str) -> Optional[Any]:
        """获取数据（优先 L1，其次 L2）"""
        # L1 缓存
        async with self.memory_lock:
            if key in self.memory_cache:
                self.l1_hits += 1
                return self.memory_cache[key]

        # L2 缓存
        cached = self.redis.get(key)
        if cached:
            self.l2_hits += 1
            data = json.loads(cached)

            # 回写 L1
            async with self.memory_lock:
                self.memory_cache[key] = data

            return data

        # 缓存未命中
        self.misses += 1
        return None

    async def set(self, key: str, value: Any, expire: int = 300):
        """设置数据（同时写入 L1 和 L2）"""
        # 写入 L1
        async with self.memory_lock:
            self.memory_cache[key] = value

        # 写入 L2
        self.redis.setex(key, expire, json.dumps(value))

    async def delete(self, key: str):
        """删除数据（同时删除 L1 和 L2）"""
        # 删除 L1
        async with self.memory_lock:
            self.memory_cache.pop(key, None)

        # 删除 L2
        self.redis.delete(key)

    def get_stats(self) -> dict:
        """获取统计信息"""
        total = self.l1_hits + self.l2_hits + self.misses
        hit_rate = (self.l1_hits + self.l2_hits) / total if total > 0 else 0

        return {
            "l1_hits": self.l1_hits,
            "l2_hits": self.l2_hits,
            "misses": self.misses,
            "hit_rate": f"{hit_rate:.2%}"
        }

# 全局缓存实例
cache = MultiLevelCache()

# 使用示例
@app.get("/posts/{post_id}")
async def get_post(post_id: int):
    cache_key = f"post:{post_id}"

    # 尝试从缓存获取
    cached = await cache.get(cache_key)
    if cached:
        return {"data": cached, "cache_level": "L1" if cache_key in cache.memory_cache else "L2"}

    # 查询数据库
    post = db.query(Post).filter_by(id=post_id).first()
    if not post:
        raise HTTPException(status_code=404)

    post_data = {"id": post.id, "title": post.title}

    # 写入缓存
    await cache.set(cache_key, post_data, expire=600)

    return {"data": post_data, "cache_level": "DB"}

@app.get("/cache/stats")
async def cache_stats():
    return cache.get_stats()
```

### 挑战题答案

#### 题目 6 答案

```python
from fastapi import FastAPI, on_event
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from typing import List
import asyncio

app = FastAPI()
scheduler = AsyncIOScheduler()

class CacheWarmupManager:
    """缓存预热管理器"""

    def __init__(self):
        self.hot_keys: List[str] = []
        self.warming_up: set = set()
        self.last_warmup: dict = {}

    async def warmup_hot_data(self):
        """预热热点数据"""
        # 获取热点数据（可以是配置或从分析获取）
        hot_posts = db.query(Post)\
            .order_by(Post.views.desc())\
            .limit(100)\
            .all()

        for post in hot_posts:
            key = f"post:{post.id}"
            await self.warmup_key(key, post.to_dict())

    async def warmup_key(self, key: str, data: dict, expire: int = 600):
        """预热单个键"""
        if key in self.warming_up:
            return

        self.warming_up.add(key)

        try:
            # 写入缓存
            redis_client.setex(key, expire, json.dumps(data))
            self.last_warmup[key] = datetime.now()

            print(f"✓ 预热缓存: {key}")
        finally:
            self.warming_up.discard(key)

    async def refresh_expiring_soon(self, threshold_minutes: int = 5):
        """刷新即将过期的缓存"""
        keys = redis_client.keys("post:*")

        for key in keys:
            ttl = redis_client.ttl(key)
            if 0 < ttl < threshold_minutes * 60:
                # 即将过期，刷新数据
                post_id = int(key.split(":")[1])
                post = db.query(Post).filter_by(id=post_id).first()

                if post:
                    await self.warmup_key(key, post.to_dict())

    def get_hit_rate(self) -> float:
        """获取命中率"""
        info = redis_client.info("stats")
        keyspace_hits = info.get("keyspace_hits", 0)
        keyspace_misses = info.get("keyspace_misses", 0)
        total = keyspace_hits + keyspace_misses

        return keyspace_hits / total if total > 0 else 0

    async def auto_adjust_expire(self, key: str, base_expire: int = 300):
        """根据热度自动调整过期时间"""
        # 获取键的访问频率（简化实现）
        # 实际应该使用更复杂的算法
        access_count = redis_client.object("idletime", key)

        if access_count < 60:  # 频繁访问
            return base_expire * 2  # 延长过期时间
        else:
            return base_expire

warmup_manager = CacheWarmupManager()

# 启动时预热
@app.on_event("startup")
async def startup_event():
    # 预热热点数据
    await warmup_manager.warmup_hot_data()

    # 启动定时任务
    scheduler.add_job(
        warmup_manager.warmup_hot_data,
        "interval",
        minutes=30,
        id="warmup_hot_data"
    )

    scheduler.add_job(
        warmup_manager.refresh_expiring_soon,
        "interval",
        minutes=5,
        id="refresh_expiring"
    )

    scheduler.start()
    print("缓存预热系统已启动")

@app.get("/cache/warmup")
async def trigger_warmup():
    """手动触发预热"""
    await warmup_manager.warmup_hot_data()
    return {"message": "预热完成"}

@app.get("/cache/stats")
async def cache_stats():
    """缓存统计"""
    return {
        "hit_rate": f"{warmup_manager.get_hit_rate():.2%}",
        "hot_keys_count": len(warmup_manager.hot_keys),
        "warming_up": list(warmup_manager.warming_up),
        "last_warmup": {
            k: v.isoformat()
            for k, v in warmup_manager.last_warmup.items()
        }
    }
```

---

> 下一章：[第19章：日志与监控](/chapter-19/) - 学习如何建立完善的监控体系！
