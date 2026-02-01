# 第17章：任务队列与定时任务

## 本章简介

在 Web 开发中，有些操作不适合在请求处理中同步执行，比如：
- 发送邮件通知
- 生成导出文件
- 处理图片
- 定时数据备份

这些任务应该异步处理或定时执行。本章将学习 Python 的后台任务处理方案。

**学习目标**：
- 理解任务队列的概念和应用场景
- 掌握 FastAPI 后台任务
- 学习 Celery 任务队列的使用
- 实现定时任务调度

---

## 目录

1. [后台任务基础](#后台任务基础)
2. [FastAPI 后台任务](#fastapi-后台任务)
3. [Celery 任务队列](#celery-任务队列)
4. [定时任务](#定时任务)
5. [练习题](#练习题)
6. [练习答案](#练习答案)

---

## 17.1 后台任务基础

### 什么是任务队列

任务队列是一种将任务异步执行的机制，类似于前端的异步处理。

### 同步 vs 异步处理

```
同步处理（阻塞）:
客户端请求 → 服务器处理 → 发送邮件 → 返回响应
                              ↑ 耗时操作，用户等待

异步处理（非阻塞）:
客户端请求 → 服务器 → 返回响应（立即）
                  ↓
              添加到任务队列
                  ↓
              后台 Worker 处理
```

### 对比前端异步处理

| 前端 | Python 后端 |
|------|-------------|
| `setTimeout()` | BackgroundTasks |
| `Promise` | Task/Future |
| Web Workers | Celery Workers |
| Node.js child_process | subprocess |

### 应用场景

| 场景 | 说明 | 处理方式 |
|------|------|----------|
| 发送邮件 | 耗时操作，非核心业务 | 后台任务 |
| 图片处理 | CPU 密集型 | Celery Worker |
| 定时备份 | 无需触发 | 定时任务 |
| 数据导出 | 长时间运行 | 后台任务 + 进度查询 |
| 推送通知 | 批量发送 | 后台任务 |

---

## 17.2 FastAPI 后台任务

### BackgroundTasks 基础

FastAPI 提供了轻量级的后台任务功能，适合简单的异步操作。

### 基本用法

```python
from fastapi import FastAPI, BackgroundTasks

app = FastAPI()

def send_email(email: str, message: str):
    """发送邮件（模拟）"""
    import time
    time.sleep(3)  # 模拟耗时操作
    print(f"邮件已发送到 {email}: {message}")

def write_log(message: str):
    """写入日志"""
    with open("log.txt", "a") as f:
        f.write(f"{message}\n")

@app.post("/register")
async def register(
    email: str,
    background_tasks: BackgroundTasks
):
    # 添加后台任务
    background_tasks.add_task(send_email, email, "欢迎注册！")
    background_tasks.add_task(write_log, f"用户 {email} 注册")

    return {"message": "注册成功，欢迎邮件将稍后发送"}
```

### 多个任务执行顺序

```python
@app.post("/order")
async def create_order(background_tasks: BackgroundTasks):
    # 任务按添加顺序执行
    background_tasks.add_task(write_log, "订单创建")
    background_tasks.add_task(update_inventory, "item123")
    background_tasks.add_task(send_confirmation, "user@example.com")
    background_tasks.add_task(update_analytics, "order_created")

    return {"order_id": "12345", "status": "created"}
```

### 带参数的任务

```python
from typing import Optional

def process_payment(
    order_id: str,
    amount: float,
    retry: int = 3,
    callback: Optional[str] = None
):
    print(f"处理订单 {order_id}，金额: {amount}")
    # ... 支付处理逻辑
    if callback:
        print(f"回调: {callback}")

@app.post("/pay")
async def payment(
    order_id: str,
    amount: float,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(
        process_payment,
        order_id,
        amount,
        retry=5,
        callback="https://api.example.com/webhook"
    )
    return {"status": "processing"}
```

### 实际应用：发送欢迎邮件

```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

async def send_welcome_email(email: str, username: str):
    """发送欢迎邮件"""
    SMTP_HOST = "smtp.example.com"
    SMTP_PORT = 587
    SMTP_USER = "noreply@example.com"
    SMTP_PASSWORD = "password"

    # 创建邮件
    msg = MIMEMultipart()
    msg['From'] = SMTP_USER
    msg['To'] = email
    msg['Subject'] = "欢迎加入我们！"

    body = f"""
    <html>
    <body>
        <h2>欢迎, {username}!</h2>
        <p>感谢您注册我们的服务。</p>
        <p>祝您使用愉快！</p>
    </body>
    </html>
    """

    msg.attach(MIMEText(body, 'html'))

    # 发送邮件
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)

    print(f"欢迎邮件已发送到 {email}")

@app.post("/signup")
async def signup(
    email: str,
    username: str,
    background_tasks: BackgroundTasks
):
    # 验证输入...
    # 创建用户...
    # 添加后台任务发送邮件
    background_tasks.add_task(send_welcome_email, email, username)

    return {
        "message": "注册成功",
        "email": email,
        "username": username
    }
```

### 后台任务的限制

::: warning 注意
BackgroundTasks 有以下限制：
- 任务在响应返回后执行
- 任务与请求在同一线程中运行
- 适合快速任务（几秒内完成）
- 不适合长时间运行的任务
:::

对于复杂场景，应该使用 Celery 或其他任务队列。

---

## 17.3 Celery 任务队列

### 什么是 Celery

Celery 是 Python 最流行的分布式任务队列，类似于：
- Node.js: Bull/BullMQ
- Java: Spring Batch
- Go: Asynq

### Celery 架构

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│  Web 应用   │ ───> │  Broker     │ <──> │  Celery      │
│  (FastAPI)  │      │  (Redis/    │      │  Worker      │
│             │      │   RabbitMQ) │      │              │
└─────────────┘      └─────────────┘      └──────────────┘
     添加任务            消息队列              执行任务
```

**组件说明**：
- **Producer（生产者）**: Web 应用，创建任务
- **Broker（中间人）**: 消息队列（Redis/RabbitMQ）
- **Consumer（消费者）**: Celery Worker，执行任务

### 安装 Celery

```bash
# 安装 Celery 和 Redis 客户端
pip install celery redis

# 启动 Redis（使用 Docker）
docker run -d -p 6379:6379 redis:alpine
```

### 基本配置

```python
# celery_app.py
from celery import Celery

# 创建 Celery 应用
celery_app = Celery(
    "worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1"  # 存储结果
)

# 配置
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Shanghai",
    enable_utc=True,
    # 任务结果过期时间
    result_expires=3600,
)
```

### 定义任务

```python
# celery_app.py 继续添加
from celery import shared_task
import time

@celery_app.task
def add(x: int, y: int) -> int:
    """简单的加法任务"""
    time.sleep(5)  # 模拟耗时操作
    return x + y

@celery_app.task
def send_email_task(email: str, subject: str, body: str):
    """发送邮件任务"""
    # ... 发送邮件逻辑
    print(f"发送邮件到 {email}: {subject}")
    return {"status": "sent", "email": email}

@celery_app.task(bind=True, max_retries=3)
def process_image_task(self, image_path: str):
    """处理图片任务（带重试）"""
    try:
        # ... 图片处理逻辑
        print(f"处理图片: {image_path}")
        return {"status": "success", "path": image_path}
    except Exception as exc:
        # 重试
        raise self.retry(exc=exc, countdown=60)

@celery_app.task
def generate_report_task(report_id: str, date_range: dict):
    """生成报表任务"""
    # ... 报表生成逻辑
    return {
        "report_id": report_id,
        "status": "completed",
        "download_url": f"/reports/{report_id}.pdf"
    }
```

### FastAPI 集成

```python
# main.py
from fastapi import FastAPI, BackgroundTasks
from celery_app import send_email_task, generate_report_task
from celery.result import AsyncResult

app = FastAPI()

@app.post("/send-email")
async def send_email_endpoint(
    email: str,
    subject: str,
    body: str
):
    """发送邮件（异步）"""
    # 调用 Celery 任务
    task = send_email_task.delay(email, subject, body)

    return {
        "message": "邮件发送中",
        "task_id": task.id
    }

@app.post("/reports/generate")
async def generate_report(
    start_date: str,
    end_date: str
):
    """生成报表（异步）"""
    task = generate_report_task.delay(
        report_id=str(uuid.uuid4()),
        date_range={"start": start_date, "end": end_date}
    )

    return {
        "message": "报表生成中",
        "task_id": task.id
    }

@app.get("/tasks/{task_id}")
async def get_task_status(task_id: str):
    """查询任务状态"""
    task_result = AsyncResult(task_id)

    return {
        "task_id": task_id,
        "status": task_result.status,
        "result": task_result.result if task_result.ready() else None
    }
```

### 任务状态说明

| 状态 | 说明 |
|------|------|
| PENDING | 任务等待执行 |
| STARTED | 任务已开始 |
| SUCCESS | 任务成功完成 |
| FAILURE | 任务失败 |
| RETRY | 任务重试中 |
| REVOKED | 任务被取消 |

### 启动 Worker

```bash
# 启动 Celery Worker
celery -A celery_app worker --loglevel=info

# 指定并发数
celery -A celery_app worker --concurrency=4 --loglevel=info

# 启动多个 Worker
celery multi start w1 w2 w3 -A celery_app --loglevel=info

# 停止 Worker
celery multi stopwait w1 w2 w3
```

### 任务链（Task Chain）

```python
from celery import chain

# 定义任务
@celery_app.task
def process_image(image_id: str):
    # 处理图片
    return {"image_id": image_id, "processed": True}

@celery_app.task
def compress_image(image_id: str):
    # 压缩图片
    return {"image_id": image_id, "compressed": True}

@celery_app.task
def upload_to_cdn(image_id: str):
    # 上传到 CDN
    return {"image_id": image_id, "uploaded": True}

@app.post("/images/process/{image_id}")
async def process_image_endpoint(image_id: str):
    # 创建任务链：处理 -> 压缩 -> 上传
    task = chain(
        process_image.s(image_id),
        compress_image.s(image_id),
        upload_to_cdn.s(image_id)
    )()

    return {"task_id": task.id, "message": "图片处理中"}
```

### 任务组（Task Group）

```python
from celery import group

@app.post("/reports/batch")
async def batch_generate_reports(report_ids: list[str]):
    # 并发执行多个任务
    job = group(
        generate_report_task.s(report_id, {"start": "2024-01-01", "end": "2024-12-31"})
        for report_id in report_ids
    )

    result = job.apply_async()

    return {
        "message": "批量生成报表中",
        "task_ids": [task.id for task in result.children]
    }
```

### 任务回调

```python
@celery_app.task
def on_report_success(result):
    """报表生成成功回调"""
    print(f"报表生成成功: {result}")
    # 发送通知等

@celery_app.task
def on_report_failure(request_id, exc, traceback):
    """报表生成失败回调"""
    print(f"报表生成失败: {request_id}, 错误: {exc}")
    # 错误处理

@app.post("/reports/generate")
async def generate_report():
    task = generate_report_task.apply_async(
        args=("report-123", {}),
        link=on_report_success.s(),        # 成功回调
        link_error=on_report_failure.s()   # 失败回调
    )

    return {"task_id": task.id}
```

---

## 17.4 定时任务

### Celery Beat 定时任务

Celery Beat 是 Celery 的定时任务调度器，类似于：
- Node.js: node-cron
- Linux: crontab
- Java: Quartz

### 配置 Beat

```python
# celery_app.py
from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    # 每天凌晨 2 点执行数据备份
    "backup-database-daily": {
        "task": "tasks.backup_database",
        "schedule": crontab(hour=2, minute=0),
    },

    # 每 30 分钟执行缓存清理
    "clear-cache-every-30-minutes": {
        "task": "tasks.clear_cache",
        "schedule": crontab(minute="*/30"),
    },

    # 每周一上午 9 点发送周报
    "send-weekly-report": {
        "task": "tasks.send_weekly_report",
        "schedule": crontab(hour=9, minute=0, day_of_week=1),
    },

    # 每 10 秒执行一次
    "check-status-every-10-seconds": {
        "task": "tasks.check_status",
        "schedule": 10.0,
    },
}
```

### 定义定时任务

```python
# tasks.py
from celery_app import celery_app
import datetime

@celery_app.task
def backup_database():
    """备份数据库"""
    print(f"[{datetime.now()}] 开始备份数据库...")
    # ... 备份逻辑
    print("备份完成")
    return {"status": "success", "timestamp": datetime.now().isoformat()}

@celery_app.task
def clear_cache():
    """清理缓存"""
    print(f"[{datetime.now()}] 清理缓存...")
    # ... 清理逻辑
    return {"status": "success"}

@celery_app.task
def send_weekly_report():
    """发送周报"""
    print(f"[{datetime.now()}] 生成周报...")
    # ... 报表生成逻辑
    return {"status": "sent"}

@celery_app.task
def check_status():
    """检查服务状态"""
    print(f"[{datetime.now()}] 检查服务状态...")
    # ... 健康检查
    return {"status": "healthy"}
```

### 启动 Beat

```bash
# 启动 Beat 调度器
celery -A celery_app beat --loglevel=info

# 同时启动 Worker 和 Beat
celery -A celery_app worker --beat --loglevel=info
```

### Crontab 语法

```
crontab() 参数说明：

┌───────────── 分钟 (0-59)
│ ┌─────────── 小时 (0-23)
│ │ ┌───────── 日期 (1-31)
│ │ │ ┌─────── 月份 (1-12)
│ │ │ │ ┌───── 星期 (0-6, 0=周日)
│ │ │ │ │
* * * * *

示例：
*/5 * * * *     每 5 分钟
0 * * * *       每小时整点
0 0 * * *       每天凌晨
0 0 * * 0       每周日凌晨
0 9 * * 1       每周一上午 9 点
0 0 1 * *       每月 1 号凌晨
```

### 使用 APScheduler

如果你不需要分布式，APScheduler 是一个更简单的选择：

```python
# scheduler.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import asyncio

scheduler = AsyncIOScheduler()

async def send_daily_notification():
    """发送每日通知"""
    print("发送每日通知...")
    # ... 通知逻辑

async def cleanup_old_files():
    """清理旧文件"""
    print("清理旧文件...")
    # ... 清理逻辑

# 添加定时任务
scheduler.add_job(
    send_daily_notification,
    CronTrigger(hour=9, minute=0),  # 每天上午 9 点
    id="daily_notification"
)

scheduler.add_job(
    cleanup_old_files,
    CronTrigger(hour=2, minute=0, day_of_week="mon"),  # 每周一凌晨 2 点
    id="weekly_cleanup"
)

# 在 FastAPI 启动时启动调度器
@app.on_event("startup")
async def startup_event():
    scheduler.start()
    print("调度器已启动")

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()
    print("调度器已关闭")
```

### 任务监控：Flower

Flower 是 Celery 的实时监控工具：

```bash
# 安装 Flower
pip install flower

# 启动 Flower
celery -A celery_app flower

# 访问 http://localhost:5555
```

**Flower 功能**：
- 查看任务执行情况
- 监控 Worker 状态
- 查看任务队列长度
- 远程控制任务（重启、撤销）

---

## 常见问题

### Q1: BackgroundTasks 和 Celery 怎么选？

**A**: 对比一下：

| 特性 | BackgroundTasks | Celery |
|------|-----------------|--------|
| 复杂度 | 简单 | 复杂 |
| 依赖 | 无需额外依赖 | 需要 Redis/RabbitMQ |
| 持久化 | 无 | 支持 |
| 分布式 | 不支持 | 支持 |
| 定时任务 | 不支持 | 支持 |
| 适用场景 | 简单异步任务 | 复杂后台任务 |

**选择建议**：
- 发送邮件、写入日志 → BackgroundTasks
- 图片处理、数据导出 → Celery
- 定时任务、分布式 → Celery

### Q2: 如何处理任务失败？

**A**: Celery 提供了重试机制：

```python
@celery_app.task(bind=True, max_retries=3)
def unstable_task(self, data):
    try:
        # 可能失败的操作
        return process(data)
    except Exception as exc:
        # 指数退避重试
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)

# 或者使用 autoretry_for
@celery_app.task(
    autoretry_for=(ConnectionError, TimeoutError),
    retry_kwargs={'max_retries': 5, 'countdown': 60}
)
def network_task():
    pass
```

### Q3: 如何实现任务进度查询？

**A**: 使用 Celery 的进度更新：

```python
@celery_app.task(bind=True)
def long_running_task(self, total_items: int):
    """长时间运行任务"""
    for i in range(total_items):
        # 处理项目
        process_item(i)

        # 更新进度
        self.update_state(
            state='PROGRESS',
            meta={
                'current': i + 1,
                'total': total_items,
                'percentage': int((i + 1) / total_items * 100)
            }
        )

    return {'status': 'completed', 'total': total_items}

@app.get("/tasks/{task_id}/progress")
async def get_task_progress(task_id: str):
    """查询任务进度"""
    task = AsyncResult(task_id)

    if task.state == 'PROGRESS':
        return {
            'status': 'in_progress',
            'progress': task.info
        }
    elif task.state == 'SUCCESS':
        return {
            'status': 'completed',
            'result': task.result
        }
    else:
        return {
            'status': task.state
        }
```

### Q4: 如何避免任务重复执行？

**A**: 使用 Celery 的去重机制：

```python
# 方案 1: 使用唯一 ID
@app.post("/process")
async def process_item(item_id: str):
    # 检查是否已有任务在执行
    existing_task = get_task_by_item_id(item_id)
    if existing_task:
        return {"task_id": existing_task, "message": "任务已存在"}

    task = process_item_task.apply_async(
        args=[item_id],
        task_id=f"process_item_{item_id}"  # 唯一任务 ID
    )
    return {"task_id": task.id}

# 方案 2: 使用 Redis 锁
from redis import Redis

redis = Redis()

def process_item_task(item_id: str):
    lock_key = f"lock:item:{item_id}"

    # 尝试获取锁
    if redis.set(lock_key, "1", nx=True, ex=3600):
        try:
            # 执行任务
            return process(item_id)
        finally:
            redis.delete(lock_key)
    else:
        # 任务已在执行
        return {"status": "duplicate"}
```

---

## 本章小结

### 核心知识点回顾

| 知识点 | 内容 |
|--------|------|
| 后台任务 | 异步执行耗时操作 |
| BackgroundTasks | FastAPI 内置，适合简单任务 |
| Celery | 分布式任务队列，适合复杂场景 |
| 定时任务 | Celery Beat / APScheduler |
| 任务监控 | Flower 实时监控 |

### 与前端知识对比

| 前端 | Python 后端 |
|------|-------------|
| `setTimeout()` | BackgroundTasks |
| `Promise` | AsyncResult |
| Web Workers | Celery Workers |
| `setInterval()` | Celery Beat |
| node-cron | APScheduler |

### 下一步

下一章我们将学习 **缓存与性能优化**：
- 使用 Redis 缓存数据
- 数据库查询优化
- 应用性能分析

---

## 练习题

### 基础题

#### 题目 1：欢迎邮件

使用 BackgroundTasks 实现用户注册后发送欢迎邮件：
1. 创建 POST /register 接口
2. 接收 email 和 username
3. 使用后台任务发送欢迎邮件
4. 立即返回注册成功响应

#### 题目 2：简单 Celery 任务

使用 Celery 实现异步任务：
1. 创建一个耗时 5 秒的任务
2. 创建接口触发任务
3. 返回 task_id
4. 创建接口查询任务状态

#### 题目 3：定时清理

实现每天凌晨清理过期数据：
1. 创建清理过期文件的任务
2. 使用 Celery Beat 设置定时
3. 输出清理日志

### 进阶题

#### 题目 4：图片处理

实现图片处理系统：
1. 上传图片后异步处理
2. 处理包括：生成缩略图、压缩、水印
3. 使用任务链串联处理步骤
4. 提供进度查询接口

#### 题目 5：数据导出

实现大数据量导出：
1. 创建导出任务，生成 CSV 文件
2. 更新导出进度（0-100%）
3. 完成后提供下载链接
4. 支持取消导出任务

### 挑战题

#### 题目 6：分布式任务系统

设计一个完整的任务系统：
1. 支持任务优先级队列
2. 实现任务失败重试（指数退避）
3. 实现任务超时控制
4. 添加 Flower 监控
5. 实现任务结果缓存

---

## 练习答案

### 基础题答案

#### 题目 1 答案

```python
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel, EmailStr

app = FastAPI()

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str

def send_welcome_email(email: str, username: str):
    """发送欢迎邮件（模拟）"""
    import time
    time.sleep(2)  # 模拟发送耗时
    print(f"✓ 欢迎邮件已发送到 {email}")
    print(f"  主题: 欢迎, {username}!")
    print(f"  内容: 感谢您注册我们的服务。")

@app.post("/register")
async def register(
    request: RegisterRequest,
    background_tasks: BackgroundTasks
):
    # 验证用户名
    if len(request.username) < 3:
        raise HTTPException(status_code=400, detail="用户名至少3个字符")

    # 创建用户（模拟）
    print(f"✓ 用户 {request.username} 创建成功")

    # 添加后台任务发送欢迎邮件
    background_tasks.add_task(
        send_welcome_email,
        request.email,
        request.username
    )

    return {
        "message": "注册成功",
        "email": request.email,
        "username": request.username,
        "note": "欢迎邮件将在后台发送"
    }
```

#### 题目 2 答案

```python
# celery_app.py
from celery import Celery

celery_app = Celery(
    "worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1"
)

@celery_app.task
def slow_task(name: str):
    """耗时任务"""
    import time
    time.sleep(5)
    return {"message": f"任务 {name} 完成", "duration": 5}

# main.py
from fastapi import FastAPI
from celery.result import AsyncResult
from celery_app import slow_task

app = FastAPI()

@app.post("/tasks/create")
async def create_task(name: str = "测试"):
    """创建任务"""
    task = slow_task.delay(name)
    return {
        "message": "任务已创建",
        "task_id": task.id,
        "status": "pending"
    }

@app.get("/tasks/{task_id}")
async def get_task_status(task_id: str):
    """查询任务状态"""
    task_result = AsyncResult(task_id)

    response = {
        "task_id": task_id,
        "status": task_result.status
    }

    if task_result.ready():
        response["result"] = task_result.result

    return response
```

#### 题目 3 答案

```python
# celery_app.py
from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    "cleanup-expired-files-daily": {
        "task": "tasks.cleanup_expired_files",
        "schedule": crontab(hour=2, minute=0),  # 每天凌晨 2 点
    },
}

# tasks.py
from celery_app import celery_app
from datetime import datetime, timedelta
import os

@celery_app.task
def cleanup_expired_files():
    """清理过期文件"""
    print(f"[{datetime.now()}] 开始清理过期文件...")

    # 假设清理 /tmp 目录下超过 7 天的文件
    tmp_dir = "/tmp"
    expiration_days = 7
    cutoff_time = datetime.now() - timedelta(days=expiration_days)

    cleaned_count = 0

    for filename in os.listdir(tmp_dir):
        filepath = os.path.join(tmp_dir, filename)
        if os.path.isfile(filepath):
            file_time = datetime.fromtimestamp(os.path.getmtime(filepath))
            if file_time < cutoff_time:
                try:
                    os.remove(filepath)
                    cleaned_count += 1
                    print(f"  删除过期文件: {filename}")
                except Exception as e:
                    print(f"  删除失败 {filename}: {e}")

    print(f"✓ 清理完成，共删除 {cleaned_count} 个文件")

    return {
        "status": "success",
        "cleaned_count": cleaned_count,
        "timestamp": datetime.now().isoformat()
    }
```

### 进阶题答案

#### 题目 4 答案

```python
# celery_app.py
from celery import Celery, chain
from celery import shared_task

celery_app = Celery(
    "image_processor",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1"
)

@shared_task
def generate_thumbnail(image_path: str, size: tuple = (150, 150)):
    """生成缩略图"""
    from PIL import Image

    print(f"生成缩略图: {image_path}")
    img = Image.open(image_path)
    img.thumbnail(size)

    thumbnail_path = image_path.replace(".", "_thumb.")
    img.save(thumbnail_path)

    return {"thumbnail_path": thumbnail_path}

@shared_task
def compress_image(image_path: str, quality: int = 85):
    """压缩图片"""
    from PIL import Image

    print(f"压缩图片: {image_path}")
    img = Image.open(image_path)

    compressed_path = image_path.replace(".", "_compressed.")
    img.save(compressed_path, optimize=True, quality=quality)

    return {"compressed_path": compressed_path}

@shared_task
def add_watermark(image_path: str, text: str = "Copyright"):
    """添加水印"""
    from PIL import Image, ImageDraw, ImageFont

    print(f"添加水印: {image_path}")
    img = Image.open(image_path)
    draw = ImageDraw.Draw(img)

    # 简单水印
    draw.text((10, 10), text, fill=(255, 255, 255, 128))

    watermarked_path = image_path.replace(".", "_watermarked.")
    img.save(watermarked_path)

    return {"watermarked_path": watermarked_path}

# main.py
from fastapi import FastAPI, UploadFile, File
from celery import chain
from celery_app import generate_thumbnail, compress_image, add_watermark
import uuid

app = FastAPI()

@app.post("/images/upload")
async def upload_image(file: UploadFile = File(...)):
    """上传并处理图片"""
    # 保存上传的文件
    file_id = str(uuid.uuid4())
    file_path = f"uploads/{file_id}_{file.filename}"

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # 创建处理链：缩略图 -> 压缩 -> 水印
    processing_chain = chain(
        generate_thumbnail.s(file_path),
        compress_image.s(file_path),
        add_watermark.s(file_path)
    )

    task = processing_chain.apply_async()

    return {
        "message": "图片处理中",
        "image_id": file_id,
        "task_id": task.id
    }
```

#### 题目 5 答案

```python
# celery_app.py
@celery_app.task(bind=True)
def export_data_task(self, query_params: dict):
    """导出数据任务"""
    import csv
    import time
    from datetime import datetime

    total_records = 1000  # 假设有 1000 条记录
    batch_size = 100
    filename = f"export_{self.request.id}.csv"
    filepath = f"exports/{filename}"

    with open(filepath, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['ID', 'Name', 'Email', 'Created'])

        for i in range(0, total_records, batch_size):
            # 获取数据（模拟）
            batch = get_data_batch(query_params, batch_size)

            # 写入 CSV
            for record in batch:
                writer.writerow([
                    record['id'],
                    record['name'],
                    record['email'],
                    record['created']
                ])

            # 更新进度
            progress = min(i + batch_size, total_records)
            self.update_state(
                state='PROGRESS',
                meta={
                    'current': progress,
                    'total': total_records,
                    'percentage': int(progress / total_records * 100)
                }
            )

            time.sleep(0.5)  # 模拟处理耗时

    return {
        'status': 'completed',
        'filename': filename,
        'download_url': f'/downloads/{filename}'
    }

# main.py
@app.post("/export")
async def export_data(start_date: str, end_date: str):
    """导出数据"""
    task = export_data_task.delay({
        "start_date": start_date,
        "end_date": end_date
    })

    return {
        "message": "导出任务已创建",
        "task_id": task.id
    }

@app.get("/export/{task_id}")
async def get_export_progress(task_id: str):
    """查询导出进度"""
    task_result = AsyncResult(task_id)

    if task_result.state == 'PROGRESS':
        return {
            "status": "in_progress",
            "progress": task_result.info
        }
    elif task_result.state == 'SUCCESS':
        return {
            "status": "completed",
            "result": task_result.result
        }
    else:
        return {"status": task_result.state}

@app.delete("/export/{task_id}")
async def cancel_export(task_id: str):
    """取消导出任务"""
    celery_app.control.revoke(task_id, terminate=True)
    return {"message": "任务已取消"}
```

### 挑战题答案

#### 题目 6 答案

```python
# celery_app.py
from celery import Celery
from kombu import Queue

# 定义优先级队列
celery_app = Celery(
    "distributed_tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1"
)

# 配置队列
celery_app.conf.task_queues = [
    Queue('high', routing_key='high'),
    Queue('default', routing_key='default'),
    Queue('low', routing_key='low'),
]

celery_app.conf.task_default_queue = 'default'
celery_app.conf.task_default_routing_key = 'default'

# 任务配置
celery_app.conf.task_annotations = {
    'tasks.high_priority_task': {
        'rate_limit': '10/m',  # 限流
        'time_limit': 300,      # 超时时间（秒）
        'soft_time_limit': 280, # 软超时
    }
}

# 任务结果缓存
from celery.contrib import rdb
celery_app.conf.result_backend = 'redis://localhost:6379/1'
celery_app.conf.result_expires = 3600  # 1小时

# tasks.py
from celery import shared_task
from celery.exceptions import SoftTimeLimitExceeded
import time

@shared_task(
    bind=True,
    max_retries=5,
    default_retry_delay=60,  # 初始重试延迟
    queue='high'
)
def high_priority_task(self, data: dict):
    """高优先级任务"""
    try:
        # 任务逻辑
        result = process_data(data)
        return result
    except SoftTimeLimitExceeded:
        # 软超时处理
        print("任务超时，清理资源...")
        cleanup()
        raise
    except Exception as exc:
        # 指数退避重试
        retry_delay = 2 ** self.request.retries
        raise self.retry(exc=exc, countdown=retry_delay)

@shared_task(bind=True, queue='low')
def low_priority_task(self, data: dict):
    """低优先级任务"""
    return process_data(data)

# 监控配置
# flower 启动命令
# celery -A celery_app flower --port=5555
```

```bash
# 启动不同优先级的 Worker
celery -A celery_app worker -Q high --loglevel=info -n worker-high@%h
celery -A celery_app worker -Q default --loglevel=info -n worker-default@%h
celery -A celery_app worker -Q low --loglevel=info -n worker-low@%h
```

---

> 下一章：[第18章：缓存与性能优化](/chapter-18/) - 学习如何提升应用性能！
