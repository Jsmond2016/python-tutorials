# 第10章：装饰器与上下文管理器

装饰器和上下文管理器是 Python 中两个强大的高级特性。装饰器可以在不修改原函数的情况下增强其功能，而上下文管理器则提供了优雅的资源管理方式。

## 学习目标

- 深入理解装饰器的本质和工作原理
- 掌握带参数的装饰器
- 学会使用常用装饰器模式
- 理解上下文管理器的原理
- 掌握自定义上下文管理器
- 学会使用 contextlib 模块

## 目录

1. [装饰器深入](#装饰器深入)
2. [常用装饰器模式](#常用装饰器模式)
3. [类装饰器](#类装饰器)
4. [上下文管理器](#上下文管理器)
5. [自定义上下文管理器](#自定义上下文管理器)
6. [contextlib 模块](#contextlib-模块)
7. [实际应用场景](#实际应用场景)
8. [Python vs JavaScript 对比](#python-vs-javascript-对比)
9. [练习题](#练习题)
10. [练习答案](#练习答案)

---

## 装饰器深入

### 装饰器的本质

```python
# 装饰器本质是高阶函数
# 接收一个函数，返回一个新的函数

def simple_decorator(func):
    """简单装饰器"""
    def wrapper():
        print("函数调用前")
        result = func()
        print("函数调用后")
        return result
    return wrapper

@simple_decorator
def greet():
    """打招呼"""
    print("Hello, World!")

# 等价于: greet = simple_decorator(greet)
greet()
# 输出:
# 函数调用前
# Hello, World!
# 函数调用后
```

### 保留原函数元数据

```python
from functools import wraps

def decorator(func):
    """装饰器"""
    @wraps(func)  # 保留原函数的元数据
    def wrapper(*args, **kwargs):
        print(f"调用 {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@decorator
def add(a: int, b: int) -> int:
    """加法函数"""
    return a + b

# 不使用 @wraps 时：
# print(add.__name__)  # wrapper
# print(add.__doc__)   # None

# 使用 @wraps 后：
print(add.__name__)  # add
print(add.__doc__)   # 加法函数
print(add(1, 2))     # 3
```

### 带参数的装饰器

```python
def repeat(times: int):
    """
    重复执行装饰器

    Args:
        times: 重复次数
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            results = []
            for _ in range(times):
                result = func(*args, **kwargs)
                results.append(result)
            return results
        return wrapper
    return decorator

@repeat(3)
def greet(name: str) -> str:
    """打招呼"""
    return f"Hello, {name}!"

print(greet("Python"))
# 输出: ['Hello, Python!', 'Hello, Python!', 'Hello, Python!']
```

### 可选参数的装饰器

```python
from functools import wraps

def smart_decorator(arg=None):
    """智能装饰器（可以带参数或不带参数）"""

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            print(f"装饰器参数: {arg}")
            return func(*args, **kwargs)
        return wrapper

    # 如果被调用时没有参数，arg 是函数
    if callable(arg):
        func = arg
        arg = None
        return decorator(func)
    else:
        return decorator

# 不带参数
@smart_decorator
def func1():
    print("函数1")

# 带参数
@smart_decorator(value=42)
def func2():
    print("函数2")

func1()  # 装饰器参数: None
func2()  # 装饰器参数: 42
```

### 装饰器堆叠

```python
from functools import wraps

def debug(func):
    """调试装饰器"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(f"[DEBUG] 调用 {func.__name__}")
        print(f"[DEBUG] 参数: args={args}, kwargs={kwargs}")
        result = func(*args, **kwargs)
        print(f"[DEBUG] 返回: {result}")
        return result
    return wrapper

def cache(func):
    """缓存装饰器"""
    _cache = {}

    @wraps(func)
    def wrapper(*args, **kwargs):
        key = (args, tuple(sorted(kwargs.items())))
        if key not in _cache:
            _cache[key] = func(*args, **kwargs)
            print(f"[CACHE] 计算 {func.__name__}{args}")
        else:
            print(f"[CACHE] 命中 {func.__name__}{args}")
        return _cache[key]
    return wrapper

@debug
@cache
def fibonacci(n: int) -> int:
    """斐波那契数列"""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(5))
# [DEBUG] 调用 fibonacci
# [DEBUG] 参数: args=(5,), kwargs={}
# [CACHE] 计算 fibonacci(5)
# [DEBUG] 调用 fibonacci
# [DEBUG] 参数: args=(4,), kwargs={}
# [CACHE] 计算 fibonacci(4)
# ...
# [DEBUG] 返回: 5
```

---

## 常用装饰器模式

### 计时装饰器

```python
import time
from functools import wraps

def timer(func):
    """计时装饰器"""

    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        elapsed = end - start
        print(f"{func.__name__} 耗时: {elapsed:.4f}秒")
        return result

    return wrapper

@timer
def slow_function():
    """慢函数"""
    time.sleep(1)
    return "完成"

print(slow_function())
# slow_function 耗时: 1.0012秒
# 完成
```

### 重试装饰器

```python
from functools import wraps
import time

def retry(
    max_attempts: int = 3,
    delay: float = 1.0,
    exceptions: tuple = (Exception,)
):
    """
    重试装饰器

    Args:
        max_attempts: 最大尝试次数
        delay: 重试延迟（秒）
        exceptions: 需要重试的异常类型
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None

            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_attempts:
                        print(
                            f"{func.__name__} 失败 "
                            f"({attempt}/{max_attempts}): {e}"
                        )
                        print(f"等待 {delay} 秒后重试...")
                        time.sleep(delay)
                    else:
                        print(
                            f"{func.__name__} 失败 "
                            f"({attempt}/{max_attempts}): 达到最大重试次数"
                        )

            raise last_exception

        return wrapper
    return decorator

@retry(max_attempts=3, delay=1, exceptions=(ValueError, ConnectionError))
def unstable_function(should_fail: bool = True):
    """不稳定函数"""
    if should_fail:
        raise ValueError("操作失败")
    return "成功"

# 第一次会失败
try:
    print(unstable_function(True))
except ValueError:
    print("最终失败")

# 第二次会成功
print(unstable_function(False))
```

### 权限检查装饰器

```python
from functools import wraps
from typing import List

def require_permissions(*permissions: str):
    """权限检查装饰器"""

    def decorator(func):
        @wraps(func)
        def wrapper(user, *args, **kwargs):
            # 假设 user 有 permissions 属性
            user_permissions = getattr(user, 'permissions', [])

            # 检查是否有所需权限
            missing = [
                perm for perm in permissions
                if perm not in user_permissions
            ]

            if missing:
                raise PermissionError(
                    f"缺少权限: {', '.join(missing)}"
                )

            return func(user, *args, **kwargs)

        return wrapper
    return decorator

class User:
    """用户类"""
    def __init__(self, name: str, permissions: List[str]):
        self.name = name
        self.permissions = permissions

@require_permissions('read', 'write')
def edit_document(user: User):
    """编辑文档"""
    return f"{user.name} 正在编辑文档"

admin = User("管理员", ["read", "write", "delete"])
guest = User("访客", ["read"])

print(edit_document(admin))  # 管理员 正在编辑文档

try:
    print(edit_document(guest))
except PermissionError as e:
    print(f"错误: {e}")  # 错误: 缺少权限: write
```

### 日志装饰器

```python
import logging
from functools import wraps

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def log(func):
    """日志装饰器"""

    @wraps(func)
    def wrapper(*args, **kwargs):
        logger = logging.getLogger(func.__name__)

        logger.info(f"调用函数: {func.__name__}")
        logger.info(f"参数: args={args}, kwargs={kwargs}")

        try:
            result = func(*args, **kwargs)
            logger.info(f"返回: {result}")
            return result
        except Exception as e:
            logger.error(f"异常: {e}", exc_info=True)
            raise

    return wrapper

@log
def divide(a: float, b: float) -> float:
    """除法"""
    return a / b

print(divide(10, 2))
# 2024-01-15 14:30:45 - divide - INFO - 调用函数: divide
# 2024-01-15 14:30:45 - divide - INFO - 参数: args=(10, 2), kwargs={}
# 2024-01-15 14:30:45 - divide - INFO - 返回: 5.0
# 5.0

try:
    divide(10, 0)
except ZeroDivisionError:
    pass
# 2024-01-15 14:30:46 - divide - INFO - 调用函数: divide
# 2024-01-15 14:30:46 - divide - INFO - 参数: args=(10, 0), kwargs={}
# 2024-01-15 14:30:46 - divide - ERROR - 异常: division by zero
```

### 单例装饰器

```python
from functools import wraps

def singleton(cls):
    """单例装饰器"""
    instances = {}

    @wraps(cls)
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]

    return get_instance

@singleton
class Database:
    """数据库连接类"""
    def __init__(self):
        print("创建新的数据库连接")
        self.connection = "connected"

db1 = Database()  # 创建新的数据库连接
db2 = Database()  # 不会创建新实例

print(db1 is db2)  # True
print(id(db1), id(db2))  # 相同的 ID
```

---

## 类装饰器

### 类作为装饰器

```python
class CountCalls:
    """计数装饰器类"""

    def __init__(self, func):
        self.func = func
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"{self.func.__name__} 被调用 {self.count} 次")
        return self.func(*args, **kwargs)

@CountCalls
def greet(name: str):
    """打招呼"""
    return f"Hello, {name}!"

print(greet("Python"))
print(greet("JavaScript"))
print(greet("Java"))
# greet 被调用 1 次
# greet 被调用 2 次
# greet 被调用 3 次
```

### 装饰类

```python
def add_repr(cls):
    """为类添加 __repr__ 方法"""
    def __repr__(self):
        return f"<{self.__class__.__name__}>"
    cls.__repr__ = __repr__
    return cls

@add_repr
class Person:
    """人类"""
    def __init__(self, name: str):
        self.name = name

p = Person("张三")
print(p)  # <Person>
```

---

## 上下文管理器

### 基本原理

```python
# 上下文管理器协议
# 1. __enter__(self) - 进入上下文时调用
# 2. __exit__(self, exc_type, exc_val, exc_tb) - 退出上下文时调用

class ContextManager:
    """简单的上下文管理器"""

    def __enter__(self):
        print("进入上下文")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        print("退出上下文")
        # 返回 False 表示不抑制异常
        # 返回 True 表示抑制异常
        return False

with ContextManager():
    print("在上下文中")
# 输出:
# 进入上下文
# 在上下文中
# 退出上下文
```

### 带资源的上下文管理器

```python
class FileManager:
    """文件管理器"""

    def __init__(self, filename: str, mode: str):
        self.filename = filename
        self.mode = mode
        self.file = None

    def __enter__(self):
        print(f"打开文件: {self.filename}")
        self.file = open(self.filename, self.mode)
        return self.file

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file:
            self.file.close()
            print(f"关闭文件: {self.filename}")

        # 如果有异常，不抑制它
        if exc_type is not None:
            print(f"发生异常: {exc_type.__name__}: {exc_val}")
            return False
        return True

with FileManager('test.txt', 'w') as f:
    f.write('Hello, World!')
# 打开文件: test.txt
# 关闭文件: test.txt
```

### 异常处理

```python
class SafeDivision:
    """安全除法上下文管理器"""

    def __enter__(self):
        print("开始安全除法")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is ZeroDivisionError:
            print(f"捕获除零错误，返回默认值 0")
            # 抑制异常，返回 True
            return True
        return False

with SafeDivision():
    result = 10 / 0
    print(f"结果: {result}")

print("程序继续执行")
# 开始安全除法
# 捕获除零错误，返回默认值 0
# 程序继续执行
```

---

## 自定义上下文管理器

### 计时上下文

```python
import time

class Timer:
    """计时上下文管理器"""

    def __init__(self, name: str = "操作"):
        self.name = name
        self.start = None
        self.elapsed = None

    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.elapsed = time.perf_counter() - self.start
        print(f"{self.name} 耗时: {self.elapsed:.4f}秒")
        return False

with Timer("数据处理"):
    # 模拟耗时操作
    time.sleep(1)
    data = [x ** 2 for x in range(1000000)]

# 数据处理 耗时: 1.2345秒
```

### 数据库连接上下文

```python
class DatabaseConnection:
    """数据库连接上下文管理器"""

    def __init__(self, host: str, database: str):
        self.host = host
        self.database = database
        self.connection = None

    def __enter__(self):
        print(f"连接数据库: {self.host}/{self.database}")
        # 模拟建立连接
        self.connection = f"Connection to {self.database}"
        return self.connection

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.connection:
            print(f"关闭数据库连接")
            # 模拟关闭连接
            self.connection = None
        return False

with DatabaseConnection("localhost", "mydb") as conn:
    print(f"使用连接: {conn}")
# 连接数据库: localhost/mydb
# 使用连接: Connection to mydb
# 关闭数据库连接
```

### 事务上下文

```python
class Transaction:
    """事务上下文管理器"""

    def __init__(self, db_connection):
        self.db = db_connection
        self.committed = False

    def __enter__(self):
        print("开始事务")
        self.db.begin()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            # 没有异常，提交事务
            print("提交事务")
            self.db.commit()
            self.committed = True
        else:
            # 有异常，回滚事务
            print(f"回滚事务: {exc_type.__name__}")
            self.db.rollback()
        return False  # 不抑制异常

# 模拟数据库连接
class MockDatabase:
    """模拟数据库"""
    def begin(self):
        print("  BEGIN TRANSACTION")

    def commit(self):
        print("  COMMIT")

    def rollback(self):
        print("  ROLLBACK")

db = MockDatabase()

# 成功的事务
with Transaction(db) as tx:
    print("  执行 SQL 语句...")
print(f"事务已提交: {tx.committed}\n")

# 失败的事务
try:
    with Transaction(db) as tx:
        print("  执行 SQL 语句...")
        raise ValueError("SQL 错误")
except ValueError:
    pass
print(f"事务已提交: {tx.committed}")
```

---

## contextlib 模块

### contextmanager 装饰器

```python
from contextlib import contextmanager

@contextmanager
def simple_context():
    """简单的上下文管理器"""
    print("进入上下文")
    try:
        yield "资源"
    finally:
        print("退出上下文")

with simple_context() as resource:
    print(f"使用资源: {resource}")
# 进入上下文
# 使用资源: 资源
# 退出上下文
```

### 计时上下文（使用 contextmanager）

```python
from contextlib import contextmanager
import time

@contextmanager
def timer(name: str = "操作"):
    """计时上下文"""
    start = time.perf_counter()
    yield
    elapsed = time.perf_counter() - start
    print(f"{name} 耗时: {elapsed:.4f}秒")

with timer("列表生成"):
    result = [x ** 2 for x in range(1000000)]

# 列表生成 耗时: 0.1234秒
```

### 临时目录上下文

```python
from contextlib import contextmanager
import tempfile
import shutil
from pathlib import Path

@contextmanager
def temporary_directory():
    """临时目录上下文"""
    temp_dir = Path(tempfile.mkdtemp())
    print(f"创建临时目录: {temp_dir}")
    try:
        yield temp_dir
    finally:
        shutil.rmtree(temp_dir)
        print(f"删除临时目录: {temp_dir}")

with temporary_directory() as temp_dir:
    # 在临时目录中操作
    (temp_dir / "test.txt").write_text("测试内容")
    print(f"文件: {(temp_dir / 'test.txt').read_text()}")
```

### suppress - 忽略异常

```python
from contextlib import suppress

# 忽略特定异常
with suppress(FileNotFoundError):
    with open("nonexistent.txt", "r") as f:
        content = f.read()

print("程序继续执行")
```

### redirect_stdout/stderr

```python
from contextlib import redirect_stdout, redirect_stderr
from io import StringIO

# 重定向输出
output = StringIO()

with redirect_stdout(output):
    print("这不会被打印到控制台")
    print("而是被捕获到 StringIO")

captured = output.getvalue()
print(f"捕获的内容: {captured}")
```

### ExitStack - 多个上下文管理器

```python
from contextlib import ExitStack

class Resource:
    """资源类"""
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        print(f"获取资源: {self.name}")
        return self

    def __exit__(self, *args):
        print(f"释放资源: {self.name}")
        return False

# 使用 ExitStack 管理多个资源
resources = ["文件A", "数据库B", "网络C"]

with ExitStack() as stack:
    managed_resources = [stack.enter_context(Resource(r)) for r in resources]
    print(f"\n使用资源: {[r.name for r in managed_resources]}")
    print("执行操作...")

print("\n所有资源已释放")
```

---

## 实际应用场景

### 性能分析装饰器

```python
import time
import tracemalloc
from functools import wraps

def profile(func):
    """性能分析装饰器"""

    @wraps(func)
    def wrapper(*args, **kwargs):
        # 开始跟踪
        tracemalloc.start()
        start_time = time.perf_counter()

        # 执行函数
        result = func(*args, **kwargs)

        # 计算统计
        end_time = time.perf_counter()
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()

        # 打印结果
        print(f"\n=== {func.__name__} 性能分析 ===")
        print(f"执行时间: {(end_time - start_time) * 1000:.2f}ms")
        print(f"内存使用: {current / 1024:.2f}KB")
        print(f"内存峰值: {peak / 1024:.2f}KB")
        print("=" * 30)

        return result

    return wrapper

@profile
def process_large_data():
    """处理大数据"""
    # 模拟大数据处理
    data = list(range(1000000))
    result = sum(x ** 2 for x in data)
    return result

result = process_large_data()
# === process_large_data 性能分析 ===
# 执行时间: 345.67ms
# 内存使用: 8192.00KB
# 内存峰值: 45056.00KB
# ==============================
```

### 缓存装饰器

```python
from functools import wraps, lru_cache
from typing import Dict, Any
import hashlib
import json

def cache_to_file(ttl: int = 3600):
    """
    文件缓存装饰器

    Args:
        ttl: 缓存过期时间（秒）
    """
    cache: Dict[str, tuple[Any, float]] = {}

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 生成缓存键
            key_data = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True)
            cache_key = hashlib.md5(key_data.encode()).hexdigest()

            # 检查缓存
            if cache_key in cache:
                result, timestamp = cache[cache_key]
                if time.time() - timestamp < ttl:
                    print(f"缓存命中: {func.__name__}")
                    return result
                else:
                    print(f"缓存过期: {func.__name__}")
                    del cache[cache_key]

            # 执行函数
            print(f"执行函数: {func.__name__}")
            result = func(*args, **kwargs)
            cache[cache_key] = (result, time.time())

            return result

        return wrapper
    return decorator

@cache_to_file(ttl=60)
def expensive_operation(n: int) -> int:
    """昂贵操作"""
    import time
    time.sleep(1)  # 模拟耗时
    return n ** 2

print(expensive_operation(5))  # 执行函数
print(expensive_operation(5))  # 缓存命中
```

### 上下文管理器组合

```python
from contextlib import contextmanager
import logging

@contextmanager
def log_context(name: str, level: str = "INFO"):
    """日志上下文"""
    logger = logging.getLogger(name)

    # 保存原始级别
    original_level = logger.level

    # 设置新级别
    logger.setLevel(getattr(logging, level))
    print(f"[{name}] 日志级别设置为 {level}")

    try:
        yield logger
    finally:
        # 恢复原始级别
        logger.setLevel(original_level)
        print(f"[{name}] 日志级别恢复为 {logging.getLevelName(original_level)}")

@contextmanager
def debug_mode(enabled: bool = True):
    """调试模式上下文"""
    if enabled:
        print("调试模式: 开启")
    else:
        print("调试模式: 关闭")
    yield enabled
    print("调试模式结束")

# 组合使用
with log_context("myapp", "DEBUG") as logger:
    with debug_mode(True):
        logger.debug("调试信息")
        logger.info("普通信息")
```

---

## Python vs JavaScript 对比

### 装饰器对比

| 特性       | Python                          | JavaScript (TypeScript)        |
| ---------- | ------------------------------- | ------------------------------ |
| 语法       | `@decorator`                    | `@decorator`                   |
| 本质       | 函数/类                         | 函数                           |
| 参数       | 返回装饰器的函数                | 装饰器工厂函数                 |
| 元数据     | 需要 `functools.wraps`          | 自动保留                       |
| 类装饰器   | 支持                            | 支持（TS）                     |

### 上下文管理器对比

```python
# Python - with 语句
with open('file.txt', 'r') as f:
    content = f.read()
# 自动关闭文件
```

```javascript
// JavaScript - 需要手动管理或使用 try-finally
let file;
try {
    file = openFile('file.txt', 'r');
    const content = file.read();
} finally {
    if (file) file.close();
}

// 或使用 Symbol.dispose (ES2024)
{
    using file = openFile('file.txt', 'r');
    const content = file.read();
} // 自动关闭
```

### 装饰器代码对比

```python
# Python
import functools

def memoize(func):
    cache = {}

    @functools.wraps(func)
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]

    return wrapper

@memoize
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
```

```javascript
// JavaScript (TypeScript)
function memoize(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;
    const cache = new Map();

    descriptor.value = function(...args: any[]) {
        const key = JSON.stringify(args);
        if (!cache.has(key)) {
            cache.set(key, originalMethod.apply(this, args));
        }
        return cache.get(key);
    };

    return descriptor;
}

class Calculator {
    @memoize
    fibonacci(n: number): number {
        if (n <= 1) return n;
        return this.fibonacci(n - 1) + this.fibonacci(n - 2);
    }
}
```

---

## 练习题

### 练习 1：参数验证装饰器

创建一个参数验证装饰器：
1. 验证参数类型
2. 验证参数范围
3. 提供友好的错误信息
4. 支持自定义验证规则

### 练习 2：数据库事务上下文管理器

实现数据库事务上下文管理器：
1. 支持自动提交/回滚
2. 支持嵌套事务
3. 记录事务日志
4. 处理连接超时

### 练习 3：性能监控工具

创建性能监控工具：
1. 计时装饰器
2. 内存使用监控
3. 调用计数
4. 生成性能报告

---

## 练习答案

<details>
<summary>点击查看练习 1 答案</summary>

```python
from functools import wraps
from typing import Any, Callable, Type, get_type_hints


class ValidationError(Exception):
    """验证错误"""
    pass


def validate(**validators):
    """
    参数验证装饰器

    Args:
        **validators: 参数名 -> 验证器函数/类型/元组
    """
    def decorator(func):
        type_hints = get_type_hints(func)

        @wraps(func)
        def wrapper(*args, **kwargs):
            # 获取函数签名
            import inspect
            sig = inspect.signature(func)
            bound_args = sig.bind(*args, **kwargs)
            bound_args.apply_defaults()

            # 验证每个参数
            for param_name, value in bound_args.arguments.items():
                # 检查是否有自定义验证器
                if param_name in validators:
                    validator = validators[param_name]

                    if callable(validator):
                        # 自定义验证函数
                        try:
                            if not validator(value):
                                raise ValidationError(
                                    f"参数 '{param_name}' 验证失败: {value}"
                                )
                        except ValidationError:
                            raise
                        except Exception as e:
                            raise ValidationError(
                                f"参数 '{param_name}' 验证出错: {e}"
                            )

                    elif isinstance(validator, (tuple, list)):
                        # 元组格式: (type, min_value, max_value)
                        param_type = validator[0]
                        if not isinstance(value, param_type):
                            raise ValidationError(
                                f"参数 '{param_name}' 必须是 {param_type.__name__} 类型"
                            )
                        if len(validator) > 2:
                            min_val, max_val = validator[1], validator[2]
                            if not (min_val <= value <= max_val):
                                raise ValidationError(
                                    f"参数 '{param_name}' 必须在 {min_val}-{max_val} 之间"
                                )

                    else:
                        # 类型检查
                        if not isinstance(value, validator):
                            raise ValidationError(
                                f"参数 '{param_name}' 必须是 {validator.__name__} 类型"
                            )

                # 使用类型提示
                elif param_name in type_hints:
                    expected_type = type_hints[param_name]
                    if not isinstance(value, expected_type):
                        raise ValidationError(
                            f"参数 '{param_name}' 必须是 {expected_type.__name__} 类型"
                        )

            return func(*args, **kwargs)

        return wrapper
    return decorator


# 使用示例
@validate(
    name=str,  # 必须是字符串
    age=(int, 0, 150),  # 整数，0-150之间
    email=lambda x: "@" in x,  # 自定义验证函数
    score=(float, 0, 100)  # 浮点数，0-100之间
)
def register_user(name: str, age: int, email: str, score: float):
    """注册用户"""
    print(f"注册用户: {name}, {age}岁, {email}, 分数: {score}")

# 测试
register_user("张三", 25, "zhangsan@example.com", 85.5)
# 注册用户: 张三, 25岁, zhangsan@example.com, 分数: 85.5

try:
    register_user("李四", -5, "invalid-email", 150)
except ValidationError as e:
    print(f"错误: {e}")
# 错误: 参数 'age' 必须在 0-150 之间
```

</details>

<details>
<summary>点击查看练习 2 答案</summary>

```python
from contextlib import contextmanager
from typing import Optional
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TransactionError(Exception):
    """事务错误"""
    pass


class DatabaseConnection:
    """模拟数据库连接"""

    def __init__(self, name: str):
        self.name = name
        self.in_transaction = False
        self.transaction_level = 0

    def begin(self):
        """开始事务"""
        logger.info(f"[{self.name}] BEGIN")
        self.in_transaction = True
        self.transaction_level += 1

    def commit(self):
        """提交事务"""
        if self.in_transaction:
            logger.info(f"[{self.name}] COMMIT")
            self.transaction_level -= 1
            if self.transaction_level == 0:
                self.in_transaction = False

    def rollback(self):
        """回滚事务"""
        if self.in_transaction:
            logger.info(f"[{self.name}] ROLLBACK")
            self.transaction_level = 0
            self.in_transaction = False

    def execute(self, sql: str):
        """执行 SQL"""
        if not self.in_transaction:
            raise TransactionError("不在事务中")
        logger.info(f"[{self.name}] EXECUTE: {sql}")


@contextmanager
def transaction(
    db: DatabaseConnection,
    auto_rollback: bool = True,
    timeout: Optional[float] = None
):
    """
    数据库事务上下文管理器

    Args:
        db: 数据库连接
        auto_rollback: 异常时自动回滚
        timeout: 超时时间（秒）
    """
    # 支持嵌套事务
    if db.in_transaction:
        logger.info(f"进入嵌套事务 (级别: {db.transaction_level + 1})")
        try:
            db.begin()
            yield db
            db.commit()
            logger.info(f"嵌套事务提交")
        except Exception as e:
            if auto_rollback:
                db.rollback()
                logger.info(f"嵌套事务回滚: {e}")
            raise
        return

    # 新事务
    logger.info("开始事务")
    db.begin()

    try:
        yield db

        # 成功执行，提交
        logger.info("事务成功，提交")
        db.commit()

    except Exception as e:
        # 发生错误
        logger.error(f"事务出错: {e}")

        if auto_rollback:
            logger.info("自动回滚")
            db.rollback()
            raise TransactionError(f"事务已回滚: {e}") from e
        else:
            logger.info("不自动回滚")
            raise

    finally:
        logger.info(f"事务结束 (级别: {db.transaction_level})")


# 使用示例
def main():
    """主函数"""
    db = DatabaseConnection("mydb")

    # 成功的事务
    print("=== 成功的事务 ===")
    with transaction(db):
        db.execute("INSERT INTO users VALUES (1, 'Alice')")
        db.execute("INSERT INTO users VALUES (2, 'Bob')")

    # 失败的事务（自动回滚）
    print("\n=== 失败的事务 ===")
    try:
        with transaction(db):
            db.execute("INSERT INTO users VALUES (3, 'Charlie')")
            db.execute("INSERT INTO users VALUES (4, 'David')")
            raise ValueError("模拟错误")
    except TransactionError as e:
        print(f"捕获到错误: {e}")

    # 嵌套事务
    print("\n=== 嵌套事务 ===")
    with transaction(db):
        db.execute("UPDATE users SET status = 'active'")
        with transaction(db):
            db.execute("UPDATE settings SET value = '123'")
        db.execute("INSERT INTO logs VALUES ('updated')")


if __name__ == "__main__":
    main()
```

</details>

<details>
<summary>点击查看练习 3 答案</summary>

```python
import time
import tracemalloc
from functools import wraps
from typing import Callable, Dict, List
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class PerformanceMetrics:
    """性能指标"""
    function_name: str
    call_count: int = 0
    total_time: float = 0
    min_time: float = float('inf')
    max_time: float = 0
    total_memory: int = 0
    peak_memory: int = 0
    calls: List[Dict] = field(default_factory=list)

    @property
    def avg_time(self) -> float:
        """平均时间"""
        return self.total_time / self.call_count if self.call_count > 0 else 0

    def add_call(self, duration: float, memory: int, peak: int):
        """添加一次调用记录"""
        self.call_count += 1
        self.total_time += duration
        self.min_time = min(self.min_time, duration)
        self.max_time = max(self.max_time, duration)
        self.total_memory += memory
        self.peak_memory = max(self.peak_memory, peak)
        self.calls.append({
            'timestamp': datetime.now().isoformat(),
            'duration': duration,
            'memory': memory,
            'peak': peak
        })


class PerformanceMonitor:
    """性能监控器"""

    def __init__(self):
        self.metrics: Dict[str, PerformanceMetrics] = {}

    def get_metrics(self, func_name: str) -> PerformanceMetrics:
        """获取函数指标"""
        if func_name not in self.metrics:
            self.metrics[func_name] = PerformanceMetrics(func_name)
        return self.metrics[func_name]

    def generate_report(self) -> str:
        """生成报告"""
        lines = []
        lines.append("=" * 80)
        lines.append("性能监控报告")
        lines.append("=" * 80)
        lines.append("")

        for func_name, metrics in sorted(
            self.metrics.items(),
            key=lambda x: x[1].total_time,
            reverse=True
        ):
            lines.append(f"函数: {func_name}")
            lines.append("-" * 40)
            lines.append(f"  调用次数: {metrics.call_count}")
            lines.append(f"  总耗时: {metrics.total_time:.4f}秒")
            lines.append(f"  平均耗时: {metrics.avg_time:.4f}秒")
            lines.append(f"  最小耗时: {metrics.min_time:.4f}秒")
            lines.append(f"  最大耗时: {metrics.max_time:.4f}秒")
            lines.append(f"  平均内存: {metrics.total_memory // metrics.call_count / 1024:.2f}KB")
            lines.append(f"  峰值内存: {metrics.peak_memory / 1024:.2f}KB")
            lines.append("")

        lines.append("=" * 80)
        return "\n".join(lines)


# 全局监控器实例
monitor = PerformanceMonitor()


def track_performance(
    enable_memory: bool = True,
    enable_timing: bool = True,
    log_calls: bool = True
):
    """
    性能监控装饰器

    Args:
        enable_memory: 启用内存监控
        enable_timing: 启用计时
        log_calls: 记录每次调用
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            metrics = monitor.get_metrics(func.__name__)

            # 开始跟踪
            start_time = time.perf_counter()

            if enable_memory:
                tracemalloc.start()

            try:
                # 执行函数
                result = func(*args, **kwargs)

                # 计算指标
                duration = time.perf_counter() - start_time

                if enable_memory:
                    current, peak = tracemalloc.get_traced_memory()
                    tracemalloc.stop()
                else:
                    current, peak = 0, 0

                # 记录指标
                if enable_timing and enable_memory:
                    metrics.add_call(duration, current, peak)
                elif log_calls:
                    metrics.add_call(duration, 0, 0)

                return result

            except Exception as e:
                duration = time.perf_counter() - start_time

                if enable_memory:
                    tracemalloc.stop()

                # 记录失败的调用
                if log_calls:
                    metrics.calls.append({
                        'timestamp': datetime.now().isoformat(),
                        'duration': duration,
                        'error': str(e)
                    })

                raise

        return wrapper
    return decorator


# 使用示例
@track_performance()
def fibonacci(n: int) -> int:
    """斐波那契数列"""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

@track_performance()
def process_list(n: int) -> int:
    """处理列表"""
    result = [x ** 2 for x in range(n)]
    time.sleep(0.001)  # 模拟耗时
    return sum(result)

@track_performance()
def recursive_sum(n: int) -> int:
    """递归求和"""
    if n <= 0:
        return 0
    return n + recursive_sum(n - 1)


def main():
    """主函数"""

    # 执行各种函数
    print("执行 fibonacci(30)...")
    result = fibonacci(30)
    print(f"结果: {result}\n")

    print("执行 process_list(10000)...")
    result = process_list(10000)
    print(f"结果: {result}\n")

    print("执行 recursive_sum(1000)...")
    result = recursive_sum(1000)
    print(f"结果: {result}\n")

    # 多次调用以收集更多数据
    for i in range(5):
        process_list(10000)

    # 生成报告
    print(monitor.generate_report())


if __name__ == "__main__":
    main()
```

</details>

---

## 本章小结

✅ 你已经学会了：
- 装饰器的本质和工作原理
- 使用 `@wraps` 保留函数元数据
- 带参数的装饰器
- 装饰器堆叠
- 常用装饰器模式（计时、重试、权限、日志、单例）
- 类装饰器和装饰类
- 上下文管理器的协议
- 自定义上下文管理器
- `contextlib` 模块的使用
- Python 与 JavaScript 的对比

## 下一章

[第11章：Web 开发入门](/chapter-11/) - 开始学习 Python Web 开发，了解 HTTP、Web 框架和前后端交互。
