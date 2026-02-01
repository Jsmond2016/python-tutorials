# 第19章：日志与监控

## 本章简介

完善的日志和监控体系是生产环境必不可少的部分。它们帮助我们：
- 快速定位问题
- 了解系统运行状态
- 预警潜在风险
- 优化性能

**学习目标**：
- 掌握 Python logging 模块的使用
- 实现结构化日志
- 集成错误追踪（Sentry）
- 实现健康检查和监控

---

## 目录

1. [日志基础](#日志基础)
2. [结构化日志](#结构化日志)
3. [错误追踪](#错误追踪)
4. [监控与告警](#监控与告警)
5. [练习题](#练习题)
6. [练习答案](#练习答案)

---

## 19.1 日志基础

### Python logging 模块

Python 内置的 logging 模块提供了灵活的日志功能。

### 日志级别

```python
import logging

# 日志级别（从低到高）
logging.debug("调试信息")       # 10
logging.info("一般信息")        # 20
logging.warning("警告信息")     # 30
logging.error("错误信息")       # 40
logging.critical("严重错误")    # 50
```

| 级别 | 数值 | 使用场景 | 对比前端 |
|------|------|----------|----------|
| DEBUG | 10 | 调试信息 | console.log |
| INFO | 20 | 正常运行信息 | console.info |
| WARNING | 30 | 警告，不影响运行 | console.warn |
| ERROR | 40 | 错误，部分功能异常 | console.error |
| CRITICAL | 50 | 严重错误，可能崩溃 | 无 |

### 基本配置

```python
import logging

# 基本配置
logging.basicConfig(
    level=logging.INFO,  # 设置日志级别
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    filename='app.log',  # 输出到文件
    filemode='a'  # 追加模式
)

# 使用
logging.info("应用启动")
logging.error("发生错误")
```

### 高级配置

```python
import logging
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler

# 创建 logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# 创建格式化器
formatter = logging.Formatter(
    '%(asctime)s | %(name)s | %(levelname)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# 文件处理器（按大小轮转）
file_handler = RotatingFileHandler(
    'app.log',
    maxBytes=10*1024*1024,  # 10MB
    backupCount=5,  # 保留5个备份
    encoding='utf-8'
)
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)

# 时间轮转文件处理器
time_handler = TimedRotatingFileHandler(
    'app.log',
    when='midnight',  # 每天午夜
    interval=1,
    backupCount=30,  # 保留30天
    encoding='utf-8'
)
time_handler.setFormatter(formatter)

# 控制台处理器
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(formatter)

# 添加处理器
logger.addHandler(file_handler)
logger.addHandler(console_handler)
logger.addHandler(time_handler)

# 使用
logger.debug("这是调试信息")
logger.info("应用启动成功")
logger.warning("内存使用率超过 80%")
logger.error("数据库连接失败")
logger.critical("系统即将崩溃！")
```

### 日志格式化字段

| 字段 | 说明 | 示例 |
|------|------|------|
| `%(asctime)s` | 时间 | 2024-01-01 12:00:00 |
| `%(name)s` | Logger 名称 | __main__ |
| `%(levelname)s` | 日志级别 | INFO |
| `%(message)s` | 日志消息 | 用户登录成功 |
| `%(pathname)s` | 文件路径 | /app/main.py |
| `%(filename)s` | 文件名 | main.py |
| `%(lineno)d` | 行号 | 42 |
| `%(funcName)s` | 函数名 | login |
| `%(process)d` | 进程 ID | 12345 |
| `%(thread)d` | 线程 ID | 67890 |

### 在 FastAPI 中使用日志

```python
from fastapi import FastAPI, Request
import logging

app = FastAPI()

# 配置日志
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s'
)

@app.get("/")
async def root():
    logger.info("访问根路径")
    return {"message": "Hello"}

@app.get("/items/{item_id}")
async def read_item(item_id: int):
    logger.debug(f"查询商品 ID: {item_id}")
    return {"item_id": item_id}

# 请求日志中间件
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"状态码: {response.status_code}")
    return response
```

---

## 19.2 结构化日志

### 什么是结构化日志

结构化日志是将日志信息以结构化格式（如 JSON）输出，便于机器解析和分析。

### JSON 日志

```python
import logging
import json
from datetime import datetime
from typing import Any

class JsonFormatter(logging.Formatter):
    """JSON 格式化器"""

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # 添加异常信息
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # 添加额外字段
        if hasattr(record, "extra_fields"):
            log_data.update(record.extra_fields)

        return json.dumps(log_data, ensure_ascii=False)

# 使用 JSON 格式化器
handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())

logger = logging.getLogger(__name__)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# 添加额外字段
class LoggerAdapter(logging.LoggerAdapter):
    def process(self, msg, kwargs):
        extra = kwargs.get('extra', {})
        extra['request_id'] = self.extra['request_id']
        extra['user_id'] = self.extra.get('user_id')
        return msg, kwargs

# 使用
logger.info("用户登录", extra={"user_id": 123})
# 输出: {"timestamp":"2024-01-01T00:00:00","level":"INFO","message":"用户登录","user_id":123}
```

### 结构化日志中间件

```python
from fastapi import FastAPI, Request
import logging
import uuid
import time

logger = logging.getLogger(__name__)

@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    # 生成请求 ID
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id

    # 记录开始时间
    start_time = time.time()

    # 记录请求
    logger.info(
        "请求开始",
        extra={
            "extra_fields": {
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "client": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
            }
        }
    )

    # 处理请求
    try:
        response = await call_next(request)
        process_time = time.time() - start_time

        # 记录响应
        logger.info(
            "请求完成",
            extra={
                "extra_fields": {
                    "request_id": request_id,
                    "status_code": response.status_code,
                    "process_time": round(process_time, 3),
                }
            }
        )

        # 添加响应头
        response.headers["X-Request-ID"] = request_id
        return response

    except Exception as e:
        process_time = time.time() - start_time

        # 记录错误
        logger.error(
            "请求失败",
            extra={
                "extra_fields": {
                    "request_id": request_id,
                    "error": str(e),
                    "process_time": round(process_time, 3),
                }
            },
            exc_info=True
        )
        raise
```

### 上下文日志

```python
from contextvars import ContextVar
import logging
import uuid

# 上下文变量
request_id_var: ContextVar[str] = ContextVar('request_id', default='')
user_id_var: ContextVar[str] = ContextVar('user_id', default='')

class ContextFilter(logging.Filter):
    """上下文过滤器"""

    def filter(self, record):
        record.request_id = request_id_var.get()
        record.user_id = user_id_var.get()
        return True

# 配置
logger = logging.getLogger(__name__)
logger.addFilter(ContextFilter())

# 在中间件中设置上下文
@app.middleware("http")
async def context_middleware(request: Request, call_next):
    # 设置请求 ID
    request_id = str(uuid.uuid4())
    request_id_var.set(request_id)

    # 从请求中获取用户 ID
    user_id = request.headers.get("X-User-ID")
    if user_id:
        user_id_var.set(user_id)

    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# 在日志中使用
logging.basicConfig(
    format='%(asctime)s | %(request_id)s | %(user_id)s | %(levelname)s | %(message)s'
)
```

### 日志轮转

```python
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
import os

# 确保日志目录存在
os.makedirs("logs", exist_ok=True)

# 按大小轮转
size_handler = RotatingFileHandler(
    "logs/app.log",
    maxBytes=50 * 1024 * 1024,  # 50MB
    backupCount=10,  # 保留10个备份
    encoding="utf-8"
)

# 按时间轮转
time_handler = TimedRotatingFileHandler(
    "logs/app.log",
    when="midnight",  # 每天午夜
    interval=1,
    backupCount=30,  # 保留30天
    encoding="utf-8"
)

# 自定义轮转：每天轮转，按大小限制
from logging.handlers import RotatingFileHandler
import gzip
import shutil

class CompressedRotatingFileHandler(RotatingFileHandler):
    """压缩轮转日志"""

    def doRollover(self):
        super().doRollover()

        # 压缩旧日志
        for i in range(1, self.backupCount + 1):
            source = f"{self.baseFilename}.{i}"
            if os.path.exists(source):
                target = f"{source}.gz"
                with open(source, 'rb') as f_in:
                    with gzip.open(target, 'wb') as f_out:
                        shutil.copyfileobj(f_in, f_out)
                os.remove(source)

# 使用
handler = CompressedRotatingFileHandler(
    "logs/app.log",
    maxBytes=100 * 1024 * 1024,  # 100MB
    backupCount=30
)
```

---

## 19.3 错误追踪

### Sentry 简介

Sentry 是一个流行的错误追踪平台，类似于前端的 Sentry 集成。

### 安装和配置

```bash
pip install sentry-sdk
```

### 基本集成

```python
import sentry_sdk
from fastapi import FastAPI

# 初始化 Sentry
sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    traces_sample_rate=1.0,  # 性能监控采样率
    environment="production",  # 环境
    release="my-project-1.0.0",  # 版本
)

app = FastAPI()

@app.get("/api/error")
async def trigger_error():
    # 这会自动上报到 Sentry
    1 / 0
```

### 添加用户上下文

```python
from fastapi import Request, HTTPException

@app.get("/api/user/profile")
async def get_profile(request: Request):
    # 设置用户上下文
    sentry_sdk.set_user({
        "id": "123",
        "username": "john_doe",
        "email": "john@example.com"
    })

    # 设置额外上下文
    sentry_sdk.set_context("profile", {
        "page": "profile",
        "action": "view"
    })

    # 添加面包屑（操作轨迹）
    sentry_sdk.add_breadcrumb(
        category="http",
        message="访问个人资料页",
        level="info"
    )

    # 业务逻辑...
    return {"user_id": "123"}
```

### 手动捕获错误

```python
import sentry_sdk
from fastapi import HTTPException

@app.post("/api/process")
async def process_data(data: dict):
    try:
        # 可能出错的代码
        result = risky_operation(data)
        return result
    except ValueError as e:
        # 手动捕获并发送到 Sentry
        sentry_sdk.capture_exception(e)
        raise HTTPException(status_code=400, detail="处理失败")
    except Exception as e:
        # 发送错误消息
        sentry_sdk.capture_message(f"处理数据时发生未知错误: {e}")
        raise HTTPException(status_code=500, detail="服务器错误")

# 自定义错误级别
sentry_sdk.capture_message("警告：内存使用率过高", level="warning")
```

### 性能监控

```python
from sentry_sdk import start_transaction, start_span

@app.get("/api/posts")
async def get_posts():
    with start_transaction(op="api", name="get_posts") as transaction:
        # 数据库查询
        with start_span(op="db", description="查询文章列表"):
            posts = db.query(Post).all()

        # 数据处理
        with start_span(op="process", description="格式化数据"):
            result = [post.to_dict() for post in posts]

        return result
```

### 自定义异常处理器

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import sentry_sdk

class AppException(Exception):
    """自定义异常基类"""
    def __init__(self, message: str, code: str = "UNKNOWN"):
        self.message = message
        self.code = code
        super().__init__(message)

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    # 发送到 Sentry
    sentry_sdk.capture_exception(exc)

    return JSONResponse(
        status_code=400,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message
            }
        }
    )

# 使用
@app.get("/api/data")
async def get_data():
    if not has_permission():
        raise AppException("权限不足", code="PERMISSION_DENIED")
    return {"data": "..."}
```

---

## 19.4 监控与告警

### 健康检查

```python
from fastapi import FastAPI
from sqlalchemy import text
import redis

app = FastAPI()

@app.get("/health")
async def health_check():
    """健康检查端点"""
    status = {
        "status": "healthy",
        "checks": {}
    }

    # 检查数据库
    try:
        db.execute(text("SELECT 1"))
        status["checks"]["database"] = {"status": "ok"}
    except Exception as e:
        status["status"] = "unhealthy"
        status["checks"]["database"] = {
            "status": "error",
            "error": str(e)
        }

    # 检查 Redis
    try:
        redis_client.ping()
        status["checks"]["redis"] = {"status": "ok"}
    except Exception as e:
        status["status"] = "unhealthy"
        status["checks"]["redis"] = {
            "status": "error",
            "error": str(e)
        }

    # 返回相应的状态码
    status_code = 200 if status["status"] == "healthy" else 503
    return JSONResponse(content=status, status_code=status_code)

@app.get("/health/live")
async def liveness():
    """存活检查（Kubernetes liveness probe）"""
    return {"status": "alive"}

@app.get("/health/ready")
async def readiness():
    """就绪检查（Kubernetes readiness probe）"""
    # 检查关键依赖
    checks = {
        "database": check_database(),
        "redis": check_redis()
    }

    all_ok = all(checks.values())
    status_code = 200 if all_ok else 503

    return JSONResponse(
        content={"checks": checks},
        status_code=status_code
    )
```

### Prometheus 指标

```bash
pip install prometheus-fastapi-instrumentator
```

```python
from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()

# 初始化 Prometheus
instrumentator = Instrumentator()
instrumentator.instrument(app).expose(app, endpoint="/metrics")

@app.get("/api/users")
async def get_users():
    return {"users": []}

# 访问 /metrics 查看指标
```

### 自定义指标

```python
from prometheus_client import Counter, Histogram, Gauge
import time

# 定义指标
request_count = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

active_connections = Gauge(
    'active_connections',
    'Number of active connections'
)

# 使用中间件
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    # 增加活跃连接
    active_connections.inc()

    # 记录开始时间
    start_time = time.time()

    try:
        response = await call_next(request)

        # 记录请求计数
        request_count.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()

        # 记录请求时长
        duration = time.time() - start_time
        request_duration.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)

        return response

    finally:
        # 减少活跃连接
        active_connections.dec()
```

### 告警规则

```yaml
# prometheus_alerts.yml
groups:
  - name: api_alerts
    rules:
      # 高错误率告警
      - alert: HighErrorRate
        expr: |
          rate(http_requests_total{status=~"5.."}[5m]) /
          rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "API 错误率过高"
          description: "过去 5 分钟错误率超过 5%"

      # 慢请求告警
      - alert: SlowRequests
        expr: |
          histogram_quantile(0.95,
            http_request_duration_seconds_bucket
          ) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "API 响应过慢"
          description: "95% 的请求响应时间超过 1 秒"

      # 连接数告警
      - alert: TooManyConnections
        expr: active_connections > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "活跃连接数过多"
          description: "活跃连接数超过 1000"
```

### Grafana 仪表板

```python
# 提供监控端点
from fastapi import FastAPI
import psutil
import time

app = FastAPI()

@app.get("/metrics/system")
async def system_metrics():
    """系统指标"""
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')

    return {
        "timestamp": time.time(),
        "cpu": {
            "percent": cpu,
            "count": psutil.cpu_count()
        },
        "memory": {
            "total": memory.total,
            "available": memory.available,
            "percent": memory.percent,
            "used": memory.used
        },
        "disk": {
            "total": disk.total,
            "used": disk.used,
            "free": disk.free,
            "percent": disk.percent
        }
    }

@app.get("/metrics/application")
async def app_metrics():
    """应用指标"""
    return {
        "active_requests": len(active_requests),
        "cache_hits": cache_stats.hits,
        "cache_misses": cache_stats.misses,
        "cache_hit_rate": cache_stats.hit_rate
    }
```

---

## 常见问题

### Q1: DEBUG 级别日志应该在生产环境开启吗？

**A**: 不建议。

```python
import os

# 根据环境配置日志级别
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

logging.basicConfig(
    level=LOG_LEVEL,
    # ...
)
```

**原因**：
- DEBUG 日志量巨大，影响性能
- 可能泄露敏感信息
- 增加存储成本

### Q2: 如何避免日志泄露敏感信息？

**A**: 几种方法：

1. **过滤器**
```python
class SensitiveDataFilter(logging.Filter):
    """敏感数据过滤器"""

    SENSITIVE_PATTERNS = [
        r'password["\s:=]+[^\s"\',}]+',
        r'token["\s:=]+[^\s"\',}]+',
        r'api_key["\s:=]+[^\s"\',}]+',
    ]

    def filter(self, record):
        msg = record.getMessage()
        for pattern in self.SENSITIVE_PATTERNS:
            msg = re.sub(pattern, '[REDACTED]', msg)
        record.msg = msg
        return True
```

2. **脱敏函数**
```python
def sanitize_log_data(data: dict) -> dict:
    """脱敏日志数据"""
    sensitive_fields = ['password', 'token', 'api_key', 'secret']

    result = data.copy()
    for field in sensitive_fields:
        if field in result:
            result[field] = '[REDACTED]'

    return result

logger.info("用户数据", extra={"extra_fields": sanitize_log_data(user_data)})
```

### Q3: Sentry 性能监控会影响应用性能吗？

**A**: 有一定影响，可以控制：

```python
sentry_sdk.init(
    dsn="...",
    # 降低采样率
    traces_sample_rate=0.1,  # 只采样 10% 的请求
    # 性能监控只对特定路由启用
    traces_sampler=lambda ctx: 1.0 if ctx.get("path") == "/api/critical" else 0.0,
)
```

### Q4: 如何实现日志的集中管理？

**A**: 使用 ELK/Loki Stack：

```
应用 → Filebeat → Elasticsearch → Kibana
                     或
应用 → Promtail → Loki → Grafana
```

```python
# 使用 Logstash 格式（JSON + 时间戳）
handler = logging.StreamHandler()
handler.setFormatter(
    logging.Formatter(
        '{"timestamp":"%(asctime)s","level":"%(levelname)s","message":"%(message)s"}'
    )
)
```

---

## 本章小结

### 核心知识点回顾

| 知识点 | 内容 |
|--------|------|
| logging 模块 | 日志级别、格式化、处理器 |
| 结构化日志 | JSON 格式、上下文信息 |
| 错误追踪 | Sentry 集成、用户上下文 |
| 健康检查 | liveness、readiness 探针 |
| 监控指标 | Prometheus、自定义指标 |

### 与前端知识对比

| 前端 | Python 后端 |
|------|-------------|
| console.log | logging.info |
| console.error | logging.error |
| Sentry (前端) | Sentry (后端) |
| Performance API | Prometheus 指标 |
| Google Analytics | 自定义分析 |

### 下一步

下一章我们将学习 **容器化与部署**：
- 编写 Dockerfile
- Docker Compose 编排
- Nginx 反向代理
- CI/CD 自动部署

---

## 练习题

### 基础题

#### 题目 1：配置日志系统

实现完整的日志系统：
1. 配置文件日志和控制台日志
2. 日志按日期轮转，保留 30 天
3. 使用 JSON 格式输出
4. 包含请求 ID 和用户 ID

#### 题目 2：集成 Sentry

集成 Sentry 错误追踪：
1. 初始化 Sentry SDK
2. 添加用户上下文
3. 手动捕获异常
4. 记录面包屑

#### 题目 3：健康检查

实现健康检查端点：
1. 检查数据库连接
2. 检查 Redis 连接
3. 返回详细的状态信息
4. 根据状态返回正确的 HTTP 状态码

### 进阶题

#### 题目 4：结构化日志

实现完整的结构化日志系统：
1. JSON 格式输出
2. 包含请求、响应、错误的所有信息
3. 添加性能指标（响应时间）
4. 支持日志查询和过滤

#### 题目 5：自定义指标

实现应用监控指标：
1. 请求计数（按状态码分类）
2. 请求延迟（P50, P95, P99）
3. 活跃连接数
4. 缓存命中率

### 挑战题

#### 题目 6：告警系统

实现完整的告警系统：
1. 定义告警规则
2. 实现告警检查逻辑
3. 支持多种通知方式（邮件、钉钉、企业微信）
4. 告警去重和聚合

---

## 练习答案

### 基础题答案

#### 题目 1 答案

```python
import logging
import os
from logging.handlers import TimedRotatingFileHandler
import json
from datetime import datetime

class JsonFormatter(logging.Formatter):
    """JSON 格式化器"""

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "line": record.lineno,
        }

        # 添加上下文信息
        if hasattr(record, 'request_id'):
            log_data['request_id'] = record.request_id
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id

        # 异常信息
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)

        return json.dumps(log_data, ensure_ascii=False)

# 创建日志目录
os.makedirs("logs", exist_ok=True)

# 创建 logger
logger = logging.getLogger("app")
logger.setLevel(logging.DEBUG)

# JSON 格式化器
json_formatter = JsonFormatter()

# 文件处理器（按天轮转）
file_handler = TimedRotatingFileHandler(
    "logs/app.log",
    when="midnight",
    interval=1,
    backupCount=30,
    encoding="utf-8"
)
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(json_formatter)

# 控制台处理器
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(json_formatter)

# 添加处理器
logger.addHandler(file_handler)
logger.addHandler(console_handler)

# 使用
logger.info("应用启动", extra={"request_id": "init", "user_id": "system"})
```

#### 题目 2 答案

```python
import sentry_sdk
from fastapi import FastAPI, Request, HTTPException
from sentry_sdk import set_user, add_breadcrumb, capture_exception

# 初始化 Sentry
sentry_sdk.init(
    dsn="https://xxx@sentry.io/xxx",
    traces_sample_rate=0.1,
    environment="production",
    release="api-v1.0.0",
)

app = FastAPI()

# 中间件：添加用户上下文
@app.middleware("http")
async def sentry_middleware(request: Request, call_next):
    # 获取用户信息
    user_id = request.headers.get("X-User-ID")

    if user_id:
        set_user({"id": user_id})

    # 添加面包屑
    add_breadcrumb(
        category="http",
        message=f"{request.method} {request.url.path}",
        level="info",
        data={"client": request.client.host if request.client else None}
    )

    try:
        response = await call_next(request)
        return response
    except Exception as e:
        # 捕获异常
        capture_exception(e)
        raise

# 触发错误的端点
@app.get("/api/error")
async def trigger_error():
    """触发测试错误"""
    add_breadcrumb(
        category="test",
        message="触发测试错误",
        level="warning"
    )
    1 / 0  # ZeroDivisionError

# 手动捕获
@app.post("/api/process")
async def process_data(data: dict):
    try:
        # 业务逻辑
        if not data.get("required_field"):
            raise ValueError("缺少必填字段")
        return {"status": "ok"}
    except ValueError as e:
        capture_exception(e)
        raise HTTPException(status_code=400, detail=str(e))
```

#### 题目 3 答案

```python
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import text
import redis

app = FastAPI()
redis_client = redis.Redis(host='localhost', port=6379)

def check_database():
    """检查数据库连接"""
    try:
        result = db.execute(text("SELECT 1")).scalar()
        return result == 1
    except Exception:
        return False

def check_redis():
    """检查 Redis 连接"""
    try:
        return redis_client.ping() == True
    except Exception:
        return False

@app.get("/health")
async def health_check():
    """健康检查"""
    checks = {
        "database": check_database(),
        "redis": check_redis()
    }

    all_ok = all(checks.values())
    status_code = 200 if all_ok else 503

    return JSONResponse(
        content={
            "status": "healthy" if all_ok else "unhealthy",
            "checks": checks
        },
        status_code=status_code
    )

# Kubernetes 探针
@app.get("/health/live")
async def liveness():
    """存活探针"""
    return {"status": "alive"}

@app.get("/health/ready")
async def readiness():
    """就绪探针"""
    checks = {
        "database": check_database(),
        "redis": check_redis()
    }

    all_ok = all(checks.values())
    status_code = 200 if all_ok else 503

    return JSONResponse(
        content={"checks": checks},
        status_code=status_code
    )
```

### 进阶题答案

#### 题目 4 答案

```python
import logging
import json
import uuid
from contextvars import ContextVar
from fastapi import Request
from datetime import datetime

# 上下文变量
request_id_var: ContextVar[str] = ContextVar('request_id')
user_id_var: ContextVar[str] = ContextVar('user_id')

class StructuredLogger:
    """结构化日志记录器"""

    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)

        # JSON 格式化器
        formatter = logging.Formatter('%(message)s')

        # 处理器
        handler = logging.StreamHandler()
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)

    def _log(self, level: str, message: str, **kwargs):
        """内部日志方法"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level,
            "message": message,
            "request_id": request_id_var.get(""),
            "user_id": user_id_var.get(""),
        }

        # 添加额外字段
        log_entry.update(kwargs)

        self.logger.log(
            getattr(logging, level.upper()),
            json.dumps(log_entry, ensure_ascii=False)
        )

    def info(self, message: str, **kwargs):
        self._log("info", message, **kwargs)

    def error(self, message: str, **kwargs):
        self._log("error", message, **kwargs)

    def warning(self, message: str, **kwargs):
        self._log("warning", message, **kwargs)

# 全局日志实例
logger = StructuredLogger("app")

# 中间件
@app.middleware("http")
async def structured_logging_middleware(request: Request, call_next):
    # 设置上下文
    request_id_var.set(str(uuid.uuid4()))
    user_id_var.set(request.headers.get("X-User-ID", ""))

    # 记录请求
    logger.info(
        "request_started",
        method=request.method,
        path=request.url.path,
        client=request.client.host if request.client else None
    )

    start_time = datetime.now()

    try:
        response = await call_next(request)

        # 计算响应时间
        duration_ms = (datetime.now() - start_time).total_seconds() * 1000

        # 记录响应
        logger.info(
            "request_completed",
            status_code=response.status_code,
            duration_ms=round(duration_ms, 2)
        )

        return response

    except Exception as e:
        duration_ms = (datetime.now() - start_time).total_seconds() * 1000

        logger.error(
            "request_failed",
            error=str(e),
            duration_ms=round(duration_ms, 2)
        )
        raise
```

#### 题目 5 答案

```python
from prometheus_client import Counter, Histogram, Gauge
import time

# 定义指标
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

http_request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

http_request_duration_buckets = Histogram(
    'http_request_duration_seconds_buckets',
    'HTTP request duration buckets',
    ['method', 'endpoint'],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0]
)

active_connections = Gauge(
    'active_connections',
    'Number of active connections'
)

cache_hits_total = Counter('cache_hits_total', 'Total cache hits')
cache_misses_total = Counter('cache_misses_total', 'Total cache misses')

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    # 增加活跃连接
    active_connections.inc()

    start_time = time.time()

    try:
        response = await call_next(request)

        # 记录请求计数
        http_requests_total.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()

        # 记录请求时长
        duration = time.time() - start_time
        http_request_duration.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)

        http_request_duration_buckets.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)

        return response

    finally:
        active_connections.dec()

# 缓存指标追踪
def cache_get(key: str):
    """带指标追踪的缓存获取"""
    cached = redis_client.get(key)
    if cached:
        cache_hits_total.inc()
    else:
        cache_misses_total.inc()
    return cached

# 暴露指标端点
from prometheus_client import generate_latest

@app.get("/metrics")
async def metrics():
    return Response(content=generate_latest(), media_type="text/plain")
```

### 挑战题答案

#### 题目 6 答案

```python
from typing import Dict, List, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum

class AlertLevel(Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"

class AlertStatus(Enum):
    ACTIVE = "active"
    RESOLVED = "resolved"
    SILENCED = "silenced"

@dataclass
class Alert:
    id: str
    name: str
    level: AlertLevel
    message: str
    status: AlertStatus
    created_at: datetime
    resolved_at: datetime = None

@dataclass
class AlertRule:
    id: str
    name: str
    level: AlertLevel
    check_func: Callable[[], bool]
    message_template: str
    cooldown_seconds: int = 300  # 告警冷却时间

class NotificationChannel:
    """通知渠道基类"""
    async def send(self, alert: Alert):
        raise NotImplementedError

class EmailNotification(NotificationChannel):
    def __init__(self, smtp_config: dict):
        self.config = smtp_config

    async def send(self, alert: Alert):
        # 发送邮件实现
        print(f"[邮件] {alert.level.value}: {alert.message}")

class DingTalkNotification(NotificationChannel):
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url

    async def send(self, alert: Alert):
        # 发送钉钉通知实现
        print(f"[钉钉] {alert.level.value}: {alert.message}")

class AlertManager:
    """告警管理器"""

    def __init__(self):
        self.rules: List[AlertRule] = []
        self.active_alerts: Dict[str, Alert] = {}
        self.notification_channels: List[NotificationChannel] = []
        self.last_check_time: Dict[str, datetime] = {}

    def add_rule(self, rule: AlertRule):
        """添加告警规则"""
        self.rules.append(rule)

    def add_notification_channel(self, channel: NotificationChannel):
        """添加通知渠道"""
        self.notification_channels.append(channel)

    async def check_rules(self):
        """检查所有规则"""
        for rule in self.rules:
            # 检查冷却时间
            if rule.id in self.last_check_time:
                elapsed = (datetime.now() - self.last_check_time[rule.id]).total_seconds()
                if elapsed < rule.cooldown_seconds:
                    continue

            # 执行检查
            should_alert = rule.check_func()

            if should_alert and rule.id not in self.active_alerts:
                # 触发告警
                alert = Alert(
                    id=str(uuid.uuid4()),
                    name=rule.name,
                    level=rule.level,
                    message=rule.message_template,
                    status=AlertStatus.ACTIVE,
                    created_at=datetime.now()
                )
                self.active_alerts[rule.id] = alert
                self.last_check_time[rule.id] = datetime.now()

                # 发送通知
                await self._send_notifications(alert)

            elif not should_alert and rule.id in self.active_alerts:
                # 恢复告警
                alert = self.active_alerts[rule.id]
                alert.status = AlertStatus.RESOLVED
                alert.resolved_at = datetime.now()
                del self.active_alerts[rule.id]

    async def _send_notifications(self, alert: Alert):
        """发送通知"""
        for channel in self.notification_channels:
            try:
                await channel.send(alert)
            except Exception as e:
                print(f"发送通知失败: {e}")

# 全局告警管理器
alert_manager = AlertManager()

# 定义告警规则
alert_manager.add_rule(AlertRule(
    id="high_error_rate",
    name="高错误率",
    level=AlertLevel.CRITICAL,
    check_func=lambda: get_error_rate() > 0.05,
    message_template="API 错误率超过 5%"
))

alert_manager.add_rule(AlertRule(
    id="slow_response",
    name="慢响应",
    level=AlertLevel.WARNING,
    check_func=lambda: get_avg_response_time() > 1.0,
    message_template="API 平均响应时间超过 1 秒"
))

# 添加通知渠道
alert_manager.add_notification_channel(EmailNotification({...}))
alert_manager.add_notification_channel(DingTalkNotification("..."))

# 定时检查
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()

@scheduler.scheduled_job('interval', seconds=30)
async def check_alerts():
    await alert_manager.check_rules()
```

---

> 下一章：[第20章：容器化与部署](/chapter-20/) - 学习如何将应用部署到生产环境！
