# 第9章：异步编程基础

异步编程是 Python 中处理 I/O 密集型任务的重要方式。如果你熟悉 JavaScript 的 Promise 和 async/await，你会发现 Python 的异步模型非常相似，但有一些关键的区别。

## 学习目标

- 理解异步编程的概念
- 掌握 asyncio 模块的使用
- 学会定义和运行协程
- 理解事件循环机制
- 掌握异步 I/O 操作
- 学会使用任务和 Future
- 理解同步原语（锁、事件、队列）

## 目录

1. [异步编程概念](#异步编程概念)
2. [asyncio 基础](#asyncio-基础)
3. [异步函数](#异步函数)
4. [异步 I/O](#异步-io)
5. [任务和 Future](#任务和-future)
6. [同步原语](#同步原语)
7. [超时和取消](#超时和取消)
8. [Python vs JavaScript 对比](#python-vs-javascript-对比)
9. [练习题](#练习题)
10. [练习答案](#练习答案)

---

## 异步编程概念

### 同步 vs 异步

```python
# 同步代码 - 按顺序执行
import time

def sync_task(name: str, duration: float):
    """同步任务"""
    print(f"{name} 开始")
    time.sleep(duration)  # 阻塞等待
    print(f"{name} 完成")

start = time.time()
sync_task("任务1", 2)
sync_task("任务2", 1)
sync_task("任务3", 1.5)
print(f"总耗时: {time.time() - start:.2f}秒")
# 输出：总耗时: 4.50秒（2 + 1 + 1.5）

# 异步代码 - 并发执行
import asyncio

async def async_task(name: str, duration: float):
    """异步任务"""
    print(f"{name} 开始")
    await asyncio.sleep(duration)  # 非阻塞等待
    print(f"{name} 完成")

async def main():
    start = time.time()
    # 并发执行多个任务
    await asyncio.gather(
        async_task("任务1", 2),
        async_task("任务2", 1),
        async_task("任务3", 1.5)
    )
    print(f"总耗时: {time.time() - start:.2f}秒")

asyncio.run(main())
# 输出：总耗时: 2.00秒（取最长的任务时间）
```

### 阻塞 vs 非阻塞

```python
# 阻塞调用
def blocking_read(filename: str) -> str:
    """阻塞读取文件"""
    with open(filename, 'r') as f:
        return f.read()  # 等待读取完成

# 非阻塞调用
async def nonblocking_read(filename: str) -> str:
    """异步读取文件"""
    # 使用 aiofiles 等异步库
    import aiofiles
    async with aiofiles.open(filename, 'r') as f:
        return await f.read()  # 不阻塞其他任务
```

### 并发 vs 并行

```python
# 并发（Concurrency）- 交替执行
# 同一时间段处理多个任务，但任何时刻只执行一个
# 适合 I/O 密集型任务

# 并行（Parallelism）- 同时执行
# 同一时刻执行多个任务（需要多核）
# 适合 CPU 密集型任务

# Python 异步是并发，不是并行
# 要实现并行，需要使用 multiprocessing
```

---

## asyncio 基础

### 什么是 asyncio

```python
"""
asyncio 是 Python 的异步 I/O 库，提供：
- 事件循环
- 协程
- 任务和 Future
- 同步原语
"""

import asyncio

# 基本用法
async def main():
    """主协程"""
    print("Hello")
    await asyncio.sleep(1)  # 等待1秒
    print("World")

# 运行协程
asyncio.run(main())
```

### 事件循环

```python
import asyncio

async def task1():
    """任务1"""
    print("任务1 开始")
    await asyncio.sleep(1)
    print("任务1 完成")
    return "结果1"

async def task2():
    """任务2"""
    print("任务2 开始")
    await asyncio.sleep(2)
    print("任务2 完成")
    return "结果2"

async def main():
    """主函数"""
    # 获取当前事件循环
    loop = asyncio.get_running_loop()
    print(f"事件循环: {loop}")

    # 创建任务
    t1 = asyncio.create_task(task1())
    t2 = asyncio.create_task(task2())

    # 等待任务完成
    result1 = await t1
    result2 = await t2

    print(f"结果1: {result1}, 结果2: {result2}")

asyncio.run(main())
```

### 协程（Coroutine）

```python
import asyncio
from typing import Coroutine

# 定义协程
async def coroutine_function():
    """协程函数"""
    print("协程开始")
    await asyncio.sleep(1)
    print("协程结束")
    return "协程结果"

# 协程不会自动执行
coro = coroutine_function()
print(coro)  # <coroutine object coroutine_function at 0x...>
print(type(coro))  # <class 'coroutine'>

# 需要通过事件循环运行
async def main():
    result = await coro
    print(result)

asyncio.run(main())
```

---

## 异步函数

### 定义和调用

```python
import asyncio

# 定义异步函数
async def greet(name: str) -> str:
    """异步打招呼"""
    await asyncio.sleep(1)  # 模拟耗时操作
    return f"Hello, {name}!"

# 调用异步函数
async def main():
    # 方式1: 直接 await
    result1 = await greet("Python")
    print(result1)

    # 方式2: 创建任务
    task = asyncio.create_task(greet("JavaScript"))
    result2 = await task
    print(result2)

asyncio.run(main())
```

### async/await 语法

```python
import asyncio
import random

async def fetch_data(id: int) -> dict:
    """模拟获取数据"""
    delay = random.uniform(0.5, 2.0)
    await asyncio.sleep(delay)
    return {"id": id, "data": f"数据{id}", "delay": delay}

async def process_data(data: dict) -> None:
    """处理数据"""
    await asyncio.sleep(0.5)
    print(f"处理: {data}")

async def main():
    """主函数"""
    # 串行执行
    print("=== 串行执行 ===")
    start = asyncio.get_event_loop().time()
    data1 = await fetch_data(1)
    await process_data(data1)
    data2 = await fetch_data(2)
    await process_data(data2)
    print(f"耗时: {asyncio.get_event_loop().time() - start:.2f}秒\n")

    # 并发执行
    print("=== 并发执行 ===")
    start = asyncio.get_event_loop().time()
    task1 = asyncio.create_task(fetch_data(1))
    task2 = asyncio.create_task(fetch_data(2))
    data1, data2 = await asyncio.gather(task1, task2)
    await process_data(data1)
    await process_data(data2)
    print(f"耗时: {asyncio.get_event_loop().time() - start:.2f}秒")

asyncio.run(main())
```

### 并行执行

```python
import asyncio

async def task(name: str, delay: float):
    """任务"""
    print(f"{name} 开始")
    await asyncio.sleep(delay)
    print(f"{name} 完成")
    return f"{name} 结果"

async def main():
    """主函数"""

    # 方式1: asyncio.gather - 并行执行多个协程
    print("=== gather ===")
    results = await asyncio.gather(
        task("A", 1),
        task("B", 2),
        task("C", 1.5)
    )
    print(f"结果: {results}")

    # 方式2: asyncio.wait - 等待一组任务完成
    print("\n=== wait ===")
    tasks = [
        asyncio.create_task(task("D", 1)),
        asyncio.create_task(task("E", 2))
    ]
    done, pending = await asyncio.wait(tasks)
    for task in done:
        print(f"完成: {task.result()}")

    # 方式3: asyncio.wait_for - 带超时的等待
    print("\n=== wait_for ===")
    try:
        result = await asyncio.wait_for(task("F", 5), timeout=2)
        print(f"结果: {result}")
    except asyncio.TimeoutError:
        print("任务超时")

    # 方式4: asyncio.as_completed - 按完成顺序处理
    print("\n=== as_completed ===")
    tasks = [
        asyncio.create_task(task("G", 3)),
        asyncio.create_task(task("H", 1)),
        asyncio.create_task(task("I", 2))
    ]
    for coro in asyncio.as_completed(tasks):
        result = await coro
        print(f"完成: {result}")

asyncio.run(main())
```

---

## 异步 I/O

### 异步文件操作（aiofiles）

```python
# 需要安装: pip install aiofiles
import asyncio
import aiofiles
from pathlib import Path

async def read_file(filename: str) -> str:
    """异步读取文件"""
    async with aiofiles.open(filename, 'r', encoding='utf-8') as f:
        return await f.read()

async def write_file(filename: str, content: str) -> None:
    """异步写入文件"""
    async with aiofiles.open(filename, 'w', encoding='utf-8') as f:
        await f.write(content)

async def process_files(files: list[str]) -> None:
    """并发处理多个文件"""
    tasks = [read_file(file) for file in files]
    contents = await asyncio.gather(*tasks)

    for file, content in zip(files, contents):
        print(f"{file}: {len(content)} 字符")

# 创建示例文件
async def main():
    # 创建测试文件
    Path('test1.txt').write_text("文件1内容", encoding='utf-8')
    Path('test2.txt').write_text("文件2内容", encoding='utf-8')
    Path('test3.txt').write_text("文件3内容", encoding='utf-8')

    # 并发读取
    await process_files(['test1.txt', 'test2.txt', 'test3.txt'])

asyncio.run(main())
```

### 异步网络请求（aiohttp）

```python
# 需要安装: pip install aiohttp
import asyncio
import aiohttp

async def fetch_url(session: aiohttp.ClientSession, url: str) -> str:
    """获取 URL 内容"""
    async with session.get(url) as response:
        response.raise_for_status()
        return await response.text()

async def fetch_multiple_urls(urls: list[str]) -> dict[str, str]:
    """并发获取多个 URL"""
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        return dict(zip(urls, results))

async def main():
    """主函数"""
    urls = [
        "https://httpbin.org/delay/1",
        "https://httpbin.org/delay/2",
        "https://httpbin.org/get"
    ]

    results = await fetch_multiple_urls(urls)

    for url, result in results.items():
        if isinstance(result, Exception):
            print(f"❌ {url}: {result}")
        else:
            print(f"✅ {url}: {len(result)} 字符")

asyncio.run(main())
```

### 异步上下文管理器

```python
import asyncio

class AsyncResource:
    """异步资源"""

    async def __aenter__(self):
        """进入上下文"""
        print("获取资源...")
        await asyncio.sleep(0.5)  # 模拟异步获取
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """退出上下文"""
        print("释放资源...")
        await asyncio.sleep(0.5)  # 模拟异步释放
        return False

async def main():
    """使用异步上下文管理器"""
    async with AsyncResource() as resource:
        print("使用资源...")
        await asyncio.sleep(1)

asyncio.run(main())
```

---

## 任务和 Future

### asyncio.Task

```python
import asyncio

async def background_task(name: str, duration: float):
    """后台任务"""
    print(f"{name} 开始")
    await asyncio.sleep(duration)
    print(f"{name} 完成")
    return f"{name} 结果"

async def main():
    """主函数"""

    # 创建任务
    task1 = asyncio.create_task(background_task("任务1", 2))
    task2 = asyncio.create_task(background_task("任务2", 1))

    # 检查任务状态
    print(f"task1.done(): {task1.done()}")
    print(f"task2.done(): {task2.done()}")

    # 等待任务完成
    await task1
    await task2

    print(f"task1.done(): {task1.done()}")
    print(f"task2.done(): {task2.done()}")

    # 获取结果
    print(f"task1.result(): {task1.result()}")
    print(f"task2.result(): {task2.result()}")

asyncio.run(main())
```

### 任务取消

```python
import asyncio

async def cancellable_task(name: str, duration: float):
    """可取消的任务"""
    try:
        print(f"{name} 开始")
        for i in range(int(duration * 10)):
            await asyncio.sleep(0.1)
            print(f"{name}: 进度 {i+1}/{int(duration*10)}")
        print(f"{name} 完成")
        return f"{name} 成功"
    except asyncio.CancelledError:
        print(f"{name} 被取消")
        raise  # 重新抛出取消异常

async def main():
    """主函数"""

    # 创建任务
    task = asyncio.create_task(cancellable_task("长时间任务", 10))

    # 等待1秒后取消
    await asyncio.sleep(1)
    print("取消任务...")
    task.cancel()

    try:
        await task
    except asyncio.CancelledError:
        print("任务已被取消")

asyncio.run(main())
```

### asyncio.Future

```python
import asyncio

async def set_future(future: asyncio.Future):
    """设置 Future 的值"""
    print("开始工作...")
    await asyncio.sleep(2)
    future.set_result("工作完成")
    print("Future 已设置")

async def wait_for_future(future: asyncio.Future):
    """等待 Future"""
    print("等待 Future...")
    result = await future
    print(f"Future 结果: {result}")

async def main():
    """主函数"""

    # 创建 Future
    future = asyncio.Future()

    # 同时运行设置和等待
    await asyncio.gather(
        set_future(future),
        wait_for_future(future)
    )

asyncio.run(main())
```

---

## 同步原语

### asyncio.Lock

```python
import asyncio

class SharedResource:
    """共享资源"""

    def __init__(self):
        self.value = 0
        self.lock = asyncio.Lock()

    async def increment(self, name: str):
        """增加值"""
        async with self.lock:
            print(f"{name}: 获取锁")
            current = self.value
            await asyncio.sleep(0.1)  # 模拟耗时操作
            self.value = current + 1
            print(f"{name}: 值变为 {self.value}")
            print(f"{name}: 释放锁")

async def main():
    """主函数"""
    resource = SharedResource()

    # 多个任务并发修改资源
    tasks = [
        resource.increment(f"任务{i}")
        for i in range(5)
    ]
    await asyncio.gather(*tasks)

    print(f"最终值: {resource.value}")  # 应该是 5

asyncio.run(main())
```

### asyncio.Event

```python
import asyncio

async def waiter(event: asyncio.Event, name: str):
    """等待事件"""
    print(f"{name}: 等待事件...")
    await event.wait()
    print(f"{name}: 事件已触发！")

async def setter(event: asyncio.Event):
    """触发事件"""
    print("触发器: 等待3秒...")
    await asyncio.sleep(3)
    print("触发器: 触发事件！")
    event.set()

async def main():
    """主函数"""
    event = asyncio.Event()

    # 创建多个等待任务
    waiters = [
        waiter(event, f"等待者{i}")
        for i in range(3)
    ]

    # 创建触发任务
    setter_task = asyncio.create_task(setter(event))

    # 运行所有任务
    await asyncio.gather(*waiters, setter_task)

asyncio.run(main())
```

### asyncio.Queue

```python
import asyncio
import random

async def producer(queue: asyncio.Queue, name: str):
    """生产者"""
    for i in range(5):
        item = f"{name}-商品{i}"
        await queue.put(item)
        print(f"{name}: 生产 {item}")
        await asyncio.sleep(random.uniform(0.1, 0.5))

async def consumer(queue: asyncio.Queue, name: str):
    """消费者"""
    while True:
        item = await queue.get()
        print(f"{name}: 消费 {item}")
        await asyncio.sleep(random.uniform(0.2, 0.8))
        queue.task_done()

async def main():
    """主函数"""
    queue = asyncio.Queue(maxsize=10)

    # 创建生产者和消费者
    producers = [
        asyncio.create_task(producer(queue, f"生产者{i}"))
        for i in range(2)
    ]

    consumers = [
        asyncio.create_task(consumer(queue, f"消费者{i}"))
        for i in range(3)
    ]

    # 等待所有生产者完成
    await asyncio.gather(*producers)

    # 等待队列中的所有项目被处理
    await queue.join()

    # 取消消费者
    for c in consumers:
        c.cancel()

asyncio.run(main())
```

### asyncio.Semaphore

```python
import asyncio

async def limited_task(semaphore: asyncio.Semaphore, name: str):
    """受限任务"""
    async with semaphore:
        print(f"{name}: 开始")
        await asyncio.sleep(2)
        print(f"{name}: 完成")

async def main():
    """主函数"""
    # 限制同时运行的任务数量
    semaphore = asyncio.Semaphore(3)

    # 创建10个任务
    tasks = [
        asyncio.create_task(limited_task(semaphore, f"任务{i}"))
        for i in range(10)
    ]

    await asyncio.gather(*tasks)

asyncio.run(main())
```

---

## 超时和取消

### 超时控制

```python
import asyncio

async def slow_operation(name: str, duration: float):
    """慢操作"""
    print(f"{name}: 开始 ({duration}秒)")
    await asyncio.sleep(duration)
    print(f"{name}: 完成")
    return f"{name} 结果"

async def main():
    """主函数"""

    # 方式1: wait_for
    try:
        result = await asyncio.wait_for(
            slow_operation("任务1", 5),
            timeout=2
        )
        print(f"结果: {result}")
    except asyncio.TimeoutError:
        print("任务1 超时")

    # 方式2: timeout（Python 3.11+）
    async with asyncio.timeout(2):
        await slow_operation("任务2", 5)

asyncio.run(main())
```

### 任务取消示例

```python
import asyncio

async def task_with_cleanup(name: str):
    """带清理的任务"""
    try:
        print(f"{name}: 开始")
        for i in range(10):
            await asyncio.sleep(1)
            print(f"{name}: 步骤 {i+1}/10")
    except asyncio.CancelledError:
        print(f"{name}: 被取消，执行清理...")
        await asyncio.sleep(0.5)
        print(f"{name}: 清理完成")
        raise

async def main():
    """主函数"""

    # 创建任务
    task = asyncio.create_task(task_with_cleanup("任务"))

    # 3秒后取消
    await asyncio.sleep(3)
    print("取消任务")
    task.cancel()

    try:
        await task
    except asyncio.CancelledError:
        print("任务已取消")

asyncio.run(main())
```

### 优雅关闭

```python
import asyncio
from typing import Set

async def worker(name: str, running: asyncio.Event):
    """工作协程"""
    print(f"{name}: 启动")
    while running.is_set():
        print(f"{name}: 工作中...")
        await asyncio.sleep(1)
    print(f"{name}: 关闭")

async def main():
    """主函数"""
    running = asyncio.Event()
    running.set()

    # 启动多个工作协程
    workers = [
        asyncio.create_task(worker(f"Worker{i}", running))
        for i in range(3)
    ]

    print("运行5秒...")
    await asyncio.sleep(5)

    print("停止所有工作...")
    running.clear()

    # 等待所有工作完成
    await asyncio.gather(*workers)
    print("所有工作已停止")

asyncio.run(main())
```

---

## Python vs JavaScript 对比

### async/await 语法对比

| 特性       | Python                          | JavaScript                     |
| ---------- | ------------------------------- | ------------------------------ |
| 定义异步函数 | `async def`                     | `async function`               |
| 等待异步结果 | `await`                         | `await`                        |
| 创建任务   | `asyncio.create_task()`         | 不需要（直接调用）             |
| 并行执行   | `asyncio.gather()`              | `Promise.all()`                |
| 超时控制   | `asyncio.wait_for()`            | `Promise.race()` + setTimeout  |
| 事件循环   | 显式（`asyncio.run()`）         | 隐式                           |

### 代码示例对比

```python
# Python
import asyncio

async def fetch_data(id: int):
    await asyncio.sleep(1)
    return f"数据{id}"

async def main():
    results = await asyncio.gather(
        fetch_data(1),
        fetch_data(2),
        fetch_data(3)
    )
    print(results)

asyncio.run(main())
```

```javascript
// JavaScript
async function fetchData(id) {
    await new Promise(r => setTimeout(r, 1000));
    return `数据${id}`;
}

async function main() {
    const results = await Promise.all([
        fetchData(1),
        fetchData(2),
        fetchData(3)
    ]);
    console.log(results);
}

main();
```

### 关键区别

```python
# Python 需要显式创建任务
async def main():
    # 创建任务（不会立即执行）
    task = asyncio.create_task(some_coroutine())

    # 需要等待才会执行
    await task

# JavaScript 直接调用就会执行
async function main() {
    // 直接调用就开始执行
    const promise = someAsyncFunction();

    // 需要等待结果
    const result = await promise;
}
```

---

## 练习题

### 练习 1：并发下载器

创建一个并发下载器：
1. 支持同时下载多个 URL
2. 限制并发数量
3. 显示下载进度
4. 保存下载的文件

### 练习 2：异步任务调度器

创建一个异步任务调度器：
1. 支持添加定时任务
2. 支持任务取消
3. 支持任务重试
4. 记录任务执行日志

### 练习 3：生产者-消费者模型

实现生产者-消费者模型：
1. 多个生产者生产数据
2. 多个消费者处理数据
3. 使用队列传递数据
4. 支持优雅关闭

---

## 练习答案

<details>
<summary>点击查看练习 1 答案</summary>

```python
import asyncio
import aiohttp
from pathlib import Path
from typing import Optional
import time

class ConcurrentDownloader:
    """并发下载器"""

    def __init__(self, max_concurrent: int = 5):
        """
        初始化下载器

        Args:
            max_concurrent: 最大并发数
        """
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.session: Optional[aiohttp.ClientSession] = None
        self.downloaded = 0
        self.failed = 0

    async def __aenter__(self):
        """进入上下文"""
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(timeout=timeout)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """退出上下文"""
        if self.session:
            await self.session.close()

    async def download_one(
        self,
        url: str,
        save_path: str,
        index: int,
        total: int
    ) -> bool:
        """
        下载单个文件

        Args:
            url: 下载 URL
            save_path: 保存路径
            index: 当前索引
            total: 总数

        Returns:
            是否成功
        """
        async with self.semaphore:
            try:
                print(f"[{index}/{total}] 下载: {url}")

                async with self.session.get(url) as response:
                    response.raise_for_status()

                    # 获取文件大小
                    total_size = int(response.headers.get('content-length', 0))
                    downloaded = 0

                    # 创建保存目录
                    Path(save_path).parent.mkdir(parents=True, exist_ok=True)

                    # 下载并显示进度
                    with open(save_path, 'wb') as f:
                        async for chunk in response.content.iter_chunked(8192):
                            f.write(chunk)
                            downloaded += len(chunk)

                            if total_size > 0:
                                progress = downloaded / total_size * 100
                                print(f"[{index}/{total}] 进度: {progress:.1f}%")

                print(f"[{index}/{total}] 完成: {save_path}")
                self.downloaded += 1
                return True

            except Exception as e:
                print(f"[{index}/{total}] 失败: {url} - {e}")
                self.failed += 1
                return False

    async def download_all(
        self,
        urls: list[tuple[str, str]]
    ) -> dict[str, bool]:
        """
        下载所有文件

        Args:
            urls: (url, save_path) 元组列表

        Returns:
            下载结果映射
        """
        start = time.time()
        total = len(urls)

        print(f"开始下载 {total} 个文件...")

        tasks = [
            self.download_one(url, path, i + 1, total)
            for i, (url, path) in enumerate(urls)
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        elapsed = time.time() - start
        print(f"\n下载完成！")
        print(f"成功: {self.downloaded}")
        print(f"失败: {self.failed}")
        print(f"耗时: {elapsed:.2f}秒")

        return dict(zip(urls, results))


# 使用示例
async def main():
    """主函数"""

    # 示例 URL（使用 httpbin 测试）
    urls = [
        ("https://httpbin.org/delay/1", "downloads/file1.json"),
        ("https://httpbin.org/delay/2", "downloads/file2.json"),
        ("https://httpbin.org/delay/1", "downloads/file3.json"),
        ("https://httpbin.org/delay/3", "downloads/file4.json"),
        ("https://httpbin.org/get", "downloads/file5.json"),
    ]

    async with ConcurrentDownloader(max_concurrent=3) as downloader:
        await downloader.download_all(urls)


if __name__ == "__main__":
    asyncio.run(main())
```

运行示例：
```bash
python3 downloader.py
# 开始下载 5 个文件...
# [1/5] 下载: https://httpbin.org/delay/1
# [2/5] 下载: https://httpbin.org/delay/2
# [3/5] 下载: https://httpbin.org/delay/1
# [1/5] 完成: downloads/file1.json
# [4/5] 下载: https://httpbin.org/delay/3
# [3/5] 完成: downloads/file3.json
# [5/5] 下载: https://httpbin.org/get
# [2/5] 完成: downloads/file2.json
# [5/5] 完成: downloads/file5.json
# [4/5] 完成: downloads/file4.json
#
# 下载完成！
# 成功: 5
# 失败: 0
# 耗时: 4.52秒
```

</details>

<details>
<summary>点击查看练习 2 答案</summary>

```python
import asyncio
from datetime import datetime, timedelta
from typing import Callable, Optional
import enum

class TaskStatus(enum.Enum):
    """任务状态"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ScheduledTask:
    """定时任务"""

    def __init__(
        self,
        name: str,
        func: Callable,
        run_at: datetime,
        max_retries: int = 0
    ):
        self.name = name
        self.func = func
        self.run_at = run_at
        self.max_retries = max_retries
        self.retries = 0
        self.status = TaskStatus.PENDING
        self.result = None
        self.error = None
        self.task: Optional[asyncio.Task] = None

    async def execute(self) -> None:
        """执行任务"""
        self.status = TaskStatus.RUNNING
        print(f"[{self.name}] 开始执行")

        try:
            result = await self.func()
            self.result = result
            self.status = TaskStatus.COMPLETED
            print(f"[{self.name}] 执行成功")
        except Exception as e:
            self.error = e
            print(f"[{self.name}] 执行失败: {e}")

            # 重试逻辑
            if self.retries < self.max_retries:
                self.retries += 1
                print(f"[{self.name}] 重试 {self.retries}/{self.max_retries}")
                self.status = TaskStatus.PENDING
                self.run_at = datetime.now() + timedelta(seconds=5)
            else:
                self.status = TaskStatus.FAILED
                print(f"[{self.name}] 达到最大重试次数，放弃")

    def cancel(self) -> None:
        """取消任务"""
        if self.task and not self.task.done():
            self.task.cancel()
            self.status = TaskStatus.CANCELLED
            print(f"[{self.name}] 已取消")


class AsyncTaskScheduler:
    """异步任务调度器"""

    def __init__(self):
        """初始化调度器"""
        self.tasks: list[ScheduledTask] = []
        self.running = False
        self.worker_task: Optional[asyncio.Task] = None

    def schedule(
        self,
        name: str,
        func: Callable,
        delay: float = 0,
        max_retries: int = 0
    ) -> ScheduledTask:
        """
        添加定时任务

        Args:
            name: 任务名称
            func: 异步函数
            delay: 延迟时间（秒）
            max_retries: 最大重试次数

        Returns:
            ScheduledTask 实例
        """
        run_at = datetime.now() + timedelta(seconds=delay)
        task = ScheduledTask(name, func, run_at, max_retries)
        self.tasks.append(task)
        print(f"[调度器] 已添加任务: {name} (延迟 {delay}秒)")
        return task

    async def _worker(self):
        """工作协程"""
        while self.running or self.tasks:
            now = datetime.now()

            # 找到到期的任务
            for task in self.tasks[:]:
                if task.run_at <= now and task.status == TaskStatus.PENDING:
                    self.tasks.remove(task)
                    task.task = asyncio.create_task(task.execute())

            # 清理已完成/失败的任务
            self.tasks = [
                t for t in self.tasks
                if t.status in [TaskStatus.PENDING, TaskStatus.RUNNING]
            ]

            await asyncio.sleep(0.1)  # 避免忙等待

    async def start(self):
        """启动调度器"""
        if self.running:
            return

        self.running = True
        print("[调度器] 启动")
        self.worker_task = asyncio.create_task(self._worker())

    async def stop(self):
        """停止调度器"""
        self.running = False
        print("[调度器] 停止中...")

        if self.worker_task:
            await self.worker_task

        # 取消所有待执行的任务
        for task in self.tasks:
            if task.status == TaskStatus.PENDING:
                task.cancel()

        print("[调度器] 已停止")

    async def wait_until_complete(self, timeout: Optional[float] = None):
        """等待所有任务完成"""
        start = datetime.now()

        while self.tasks:
            if timeout and (datetime.now() - start).total_seconds() > timeout:
                print("[调度器] 等待超时")
                break
            await asyncio.sleep(0.5)

        print("[调度器] 所有任务已完成")


# 使用示例
async def sample_task(name: str, duration: float, fail: bool = False):
    """示例任务"""
    print(f"[{name}] 开始执行...")
    await asyncio.sleep(duration)

    if fail:
        raise RuntimeError(f"{name} 模拟失败")

    print(f"[{name}] 执行完成")
    return f"{name} 的结果"


async def main():
    """主函数"""
    scheduler = AsyncTaskScheduler()
    await scheduler.start()

    # 添加各种任务
    scheduler.schedule("任务1", lambda: sample_task("任务1", 1), delay=1)
    scheduler.schedule("任务2", lambda: sample_task("任务2", 2), delay=2)
    scheduler.schedule(
        "任务3（会失败）",
        lambda: sample_task("任务3", 1, fail=True),
        delay=3,
        max_retries=2
    )
    scheduler.schedule("任务4", lambda: sample_task("任务4", 1), delay=10)

    # 等待大部分任务完成
    await asyncio.sleep(8)

    # 取消未执行的任务
    pending = [t for t in scheduler.tasks if t.status == TaskStatus.PENDING]
    for task in pending:
        task.cancel()

    await scheduler.stop()


if __name__ == "__main__":
    asyncio.run(main())
```

运行示例：
```bash
python3 scheduler.py
# [调度器] 启动
# [调度器] 已添加任务: 任务1 (延迟 1秒)
# [调度器] 已添加任务: 任务2 (延迟 2秒)
# [调度器] 已添加任务: 任务3（会失败） (延迟 3秒)
# [调度器] 已添加任务: 任务4 (延迟 10秒)
# [任务1] 开始执行
# [任务1] 开始执行...
# [任务1] 执行成功
# [任务2] 开始执行
# [任务2] 开始执行...
# [任务2] 执行成功
# [任务3（会失败）] 开始执行
# [任务3（会失败）] 开始执行...
# [任务3（会失败）] 执行失败: 任务3 模拟失败
# [任务3（会失败）] 重试 1/2
# [任务3（会失败）] 开始执行
# [任务3（会失败）] 开始执行...
# [任务3（会失败）] 执行失败: 任务3 模拟失败
# [任务3（会失败）] 重试 2/2
# [任务3（会失败）] 开始执行
# [任务3（会失败）] 开始执行...
# [任务3（会失败）] 执行失败: 任务3 模拟失败
# [任务3（会失败）] 达到最大重试次数，放弃
# [任务4] 已取消
# [调度器] 停止中...
# [调度器] 已停止
```

</details>

<details>
<summary>点击查看练习 3 答案</summary>

```python
import asyncio
import random
import time
from typing import Optional


class DataItem:
    """数据项"""
    def __init__(self, id: int, content: str):
        self.id = id
        self.content = content
        self.created_at = time.time()

    def __repr__(self):
        return f"DataItem(id={self.id}, content='{self.content}')"


class Producer:
    """生产者"""

    def __init__(
        self,
        name: str,
        queue: asyncio.Queue,
        production_time: tuple[float, float]
    ):
        self.name = name
        self.queue = queue
        self.production_time = production_time
        self.running = False
        self.produced = 0
        self.task: Optional[asyncio.Task] = None

    async def produce(self, item: DataItem) -> None:
        """
        生产一个数据项

        Args:
            item: 数据项
        """
        # 模拟生产耗时
        delay = random.uniform(*self.production_time)
        await asyncio.sleep(delay)

        await self.queue.put(item)
        self.produced += 1
        print(f"[{self.name}] 生产: {item} (总计: {self.produced})")

    async def run(self, max_items: int = -1) -> None:
        """
        运行生产者

        Args:
            max_items: 最大生产数量（-1 表示无限制）
        """
        self.running = True
        item_id = 1

        try:
            while self.running:
                if max_items > 0 and item_id > max_items:
                    print(f"[{self.name}] 达到最大生产数量")
                    break

                # 检查队列是否已满
                if self.queue.full():
                    print(f"[{self.name}] 队列已满，等待...")
                    await asyncio.sleep(0.5)
                    continue

                item = DataItem(item_id, f"{self.name}-产品{item_id}")
                await self.produce(item)
                item_id += 1

        except asyncio.CancelledError:
            print(f"[{self.name}] 被取消")
        finally:
            print(f"[{self.name}] 停止生产 (总计: {self.produced})")

    def start(self, max_items: int = -1) -> asyncio.Task:
        """
        启动生产者

        Args:
            max_items: 最大生产数量

        Returns:
            异步任务
        """
        self.task = asyncio.create_task(self.run(max_items))
        return self.task

    async def stop(self) -> None:
        """停止生产者"""
        self.running = False
        if self.task and not self.task.done():
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass


class Consumer:
    """消费者"""

    def __init__(
        self,
        name: str,
        queue: asyncio.Queue,
        processing_time: tuple[float, float]
    ):
        self.name = name
        self.queue = queue
        self.processing_time = processing_time
        self.running = False
        self.consumed = 0
        self.task: Optional[asyncio.Task] = None

    async def consume(self) -> None:
        """消费一个数据项"""
        # 模拟处理耗时
        delay = random.uniform(*self.processing_time)
        await asyncio.sleep(delay)

        try:
            item = await asyncio.wait_for(self.queue.get(), timeout=1.0)
            self.consumed += 1
            print(f"[{self.name}] 消费: {item} (总计: {self.consumed})")
            self.queue.task_done()
        except asyncio.TimeoutError:
            # 队列空闲
            pass

    async def run(self) -> None:
        """运行消费者"""
        self.running = True

        try:
            while self.running:
                await self.consume()

        except asyncio.CancelledError:
            print(f"[{self.name}] 被取消")
        finally:
            print(f"[{self.name}] 停止消费 (总计: {self.consumed})")

    def start(self) -> asyncio.Task:
        """启动消费者"""
        self.task = asyncio.create_task(self.run())
        return self.task

    async def stop(self) -> None:
        """停止消费者"""
        self.running = False
        if self.task and not self.task.done():
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass


class ProducerConsumerSystem:
    """生产者-消费者系统"""

    def __init__(
        self,
        queue_size: int = 10,
        num_producers: int = 2,
        num_consumers: int = 3
    ):
        """
        初始化系统

        Args:
            queue_size: 队列大小
            num_producers: 生产者数量
            num_consumers: 消费者数量
        """
        self.queue = asyncio.Queue(maxsize=queue_size)
        self.producers: list[Producer] = []
        self.consumers: list[Consumer] = []
        self.num_producers = num_producers
        self.num_consumers = num_consumers

    def setup(
        self,
        production_time: tuple[float, float] = (0.1, 0.5),
        processing_time: tuple[float, float] = (0.2, 0.8)
    ) -> None:
        """
        设置生产者和消费者

        Args:
            production_time: 生产时间范围
            processing_time: 处理时间范围
        """
        # 创建生产者
        for i in range(self.num_producers):
            producer = Producer(
                f"生产者{i+1}",
                self.queue,
                production_time
            )
            self.producers.append(producer)

        # 创建消费者
        for i in range(self.num_consumers):
            consumer = Consumer(
                f"消费者{i+1}",
                self.queue,
                processing_time
            )
            self.consumers.append(consumer)

    async def start(self, max_items_per_producer: int = 10) -> None:
        """
        启动系统

        Args:
            max_items_per_producer: 每个生产者的最大生产数量
        """
        print("=== 启动生产者-消费者系统 ===")
        print(f"队列大小: {self.queue.maxsize}")
        print(f"生产者数量: {len(self.producers)}")
        print(f"消费者数量: {len(self.consumers)}")
        print()

        # 启动所有生产者和消费者
        producer_tasks = [
            p.start(max_items_per_producer)
            for p in self.producers
        ]

        consumer_tasks = [
            c.start()
            for c in self.consumers
        ]

        # 等待所有生产者完成
        await asyncio.gather(*producer_tasks)

        print("\n=== 所有生产者已完成 ===")

        # 等待队列清空
        print("等待消费者处理剩余项目...")
        await self.queue.join()

        # 停止所有消费者
        for consumer in self.consumers:
            await consumer.stop()

        # 打印统计
        print("\n=== 统计信息 ===")
        total_produced = sum(p.produced for p in self.producers)
        total_consumed = sum(c.consumed for c in self.consumers)
        print(f"总生产量: {total_produced}")
        print(f"总消费量: {total_consumed}")
        print(f"队列剩余: {self.queue.qsize()}")


# 使用示例
async def main():
    """主函数"""

    # 创建系统
    system = ProducerConsumerSystem(
        queue_size=10,
        num_producers=2,
        num_consumers=3
    )

    # 设置生产者和消费者
    system.setup(
        production_time=(0.2, 0.8),  # 生产需要 0.2-0.8 秒
        processing_time=(0.3, 1.0)   # 处理需要 0.3-1.0 秒
    )

    # 运行系统
    await system.start(max_items_per_producer=10)


if __name__ == "__main__":
    asyncio.run(main())
```

运行示例：
```bash
python3 producer_consumer.py
# === 启动生产者-消费者系统 ===
# 队列大小: 10
# 生产者数量: 2
# 消费者数量: 3
#
# [生产者1] 生产: DataItem(id=1, content='生产者1-产品1') (总计: 1)
# [生产者2] 生产: DataItem(id=1, content='生产者2-产品1') (总计: 1)
# [消费者1] 消费: DataItem(id=1, content='生产者1-产品1') (总计: 1)
# [生产者1] 生产: DataItem(id=2, content='生产者1-产品2') (总计: 2)
# [消费者2] 消费: DataItem(id=1, content='生产者2-产品1') (总计: 1)
# [生产者2] 生产: DataItem(id=2, content='生产者2-产品2') (总计: 2)
# [消费者3] 消费: DataItem(id=2, content='生产者1-产品2') (总计: 1)
# ... (持续运行)
#
# === 所有生产者已完成 ===
# 等待消费者处理剩余项目...
# [生产者1] 停止生产 (总计: 10)
# [生产者2] 停止生产 (总计: 10)
# ... (消费者处理剩余项目)
#
# === 统计信息 ===
# 总生产量: 20
# 总消费量: 20
# 队列剩余: 0
```

</details>

---

## 本章小结

✅ 你已经学会了：
- 异步编程的基本概念（同步、异步、阻塞、非阻塞、并发、并行）
- asyncio 模块的使用（事件循环、协程）
- async/await 语法
- 并行执行多个异步任务
- 异步 I/O 操作（文件、网络）
- 任务和 Future 的使用
- 同步原语（Lock、Event、Queue、Semaphore）
- 超时控制和任务取消
- Python 与 JavaScript 异步编程的对比

## 下一章

[第10章：装饰器与上下文管理器](/chapter-10/) - 深入学习装饰器模式和上下文管理器的创建与使用。
