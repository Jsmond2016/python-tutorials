# 第7章：模块与包管理

模块和包是 Python 代码组织和复用的基础。如果你熟悉 JavaScript 的模块系统（ES Modules），你会发现 Python 的模块系统非常相似。

## 学习目标

- 理解模块的概念
- 掌握模块的导入和使用
- 学习包的结构和创建
- 理解 `__name__` 和 `__main__`
- 掌握常用的标准库模块
- 学习虚拟环境和依赖管理

## 目录

1. [模块基础](#模块基础)
2. [导入模块](#导入模块)
3. [包（Package）](#包package)
4. [__name__ 和 __main__](#name-和-main)
5. [常用标准库模块](#常用标准库模块)
6. [虚拟环境](#虚拟环境)
7. [依赖管理](#依赖管理)
8. [Python vs JavaScript 对比](#python-vs-javascript-对比)
9. [练习题](#练习题)
10. [练习答案](#练习答案)

---

## 模块基础

### 什么是模块

在 Python 中，一个 `.py` 文件就是一个模块。模块可以包含函数、类、变量和可执行代码。

```python
# my_module.py
"""
这是我的第一个模块
"""

# 变量
PI = 3.14159

# 函数
def greet(name: str) -> str:
    """打招呼"""
    return f"Hello, {name}!"

# 类
class Calculator:
    """计算器"""
    
    def add(self, a: float, b: float) -> float:
        """加法"""
        return a + b
```

### 使用模块

```python
# main.py
import my_module

# 使用模块中的变量
print(my_module.PI)  # 3.14159

# 使用模块中的函数
message = my_module.greet("Python")
print(message)  # Hello, Python!

# 使用模块中的类
calc = my_module.Calculator()
result = calc.add(1, 2)
print(result)  # 3
```

---

## 导入模块

### 导入方式

```python
# 1. 导入整个模块
import math
print(math.sqrt(16))  # 4.0
print(math.pi)  # 3.14159...

# 2. 导入模块并设置别名
import math as m
print(m.sqrt(16))  # 4.0

# 3. 从模块中导入特定内容
from math import sqrt, pi
print(sqrt(16))  # 4.0
print(pi)  # 3.14159...

# 4. 从模块中导入所有内容（不推荐）
# from math import *
# print(sqrt(16))
# print(pi)

# 5. 导入并重命名
from math import sqrt as square_root
print(square_root(16))  # 4.0
```

### 导入最佳实践

```python
# ✅ 推荐：明确导入
from os.path import join, exists

# ❌ 不推荐：使用通配符导入
from os.path import *

# ✅ 推荐：使用模块名作为命名空间
import os
path = os.path.join('folder', 'file.txt')

# ✅ 推荐：当模块名很长时使用别名
import matplotlib.pyplot as plt
plt.plot([1, 2, 3], [1, 4, 9])
```

### 相对导入

```python
# 假设有以下目录结构：
# project/
# ├── main.py
# ├── my_package/
# │   ├── __init__.py
# │   ├── module1.py
# │   └── submodule/
# │       ├── __init__.py
# │       └── module2.py

# 在 module2.py 中：
# 导入同级目录的模块
from . import module1

# 导入父目录的模块
from .. import module1

# 导入同级的特定内容
from .module1 import some_function
```

---

## 包（Package）

### 什么是包

包是一个包含多个模块的目录，必须包含一个 `__init__.py` 文件。

```
my_package/
├── __init__.py          # 标识这是一个包
├── module1.py
├── module2.py
└── submodule/
    ├── __init__.py
    └── module3.py
```

### 创建包

```python
# my_package/__init__.py
"""我的包"""

# 在 __init__.py 中可以直接导出内容
from .module1 import hello
from .module2 import Calculator

# 也可以定义包级别的变量
VERSION = "1.0.0"
```

```python
# my_package/module1.py
"""模块 1"""

def hello(name: str) -> str:
    """打招呼"""
    return f"Hello, {name}!"

GOODBYE = "Goodbye!"
```

```python
# my_package/module2.py
"""模块 2"""

class Calculator:
    """计算器"""
    
    def multiply(self, a: float, b: float) -> float:
        """乘法"""
        return a * b
```

### 使用包

```python
# main.py
from my_package import hello, Calculator, VERSION

print(hello("Python"))  # Hello, Python!

calc = Calculator()
print(calc.multiply(3, 4))  # 12

print(VERSION)  # 1.0.0
```

### 包的层级结构

```python
# 导入子包的模块
from my_package.submodule import module3

# 导入子包模块中的函数
from my_package.submodule.module3 import some_function

# 使用完整路径
import my_package.submodule.module3 as m3
```

---

## __name__ 和 __main__

### 理解 __name__

```python
# my_module.py
def greet(name: str) -> str:
    """打招呼"""
    return f"Hello, {name}!"

def main():
    """主函数"""
    print("程序开始")
    print(greet("Python"))
    print("程序结束")

# 检查是否直接运行此文件
if __name__ == "__main__":
    main()
```

### 运行方式

```bash
# 直接运行
python my_module.py
# 输出：
# 程序开始
# Hello, Python!
# 程序结束

# 作为模块导入
python
>>> import my_module
# 不会执行 main() 函数
```

### 实际应用

```python
# data_processor.py
import sys
from pathlib import Path

def process_data(data: list) -> list:
    """处理数据"""
    return [item * 2 for item in data]

def read_file(filename: str) -> list:
    """读取文件"""
    path = Path(filename)
    if not path.exists():
        raise FileNotFoundError(f"文件 {filename} 不存在")
    
    with open(path, 'r') as f:
        return [float(line.strip()) for line in f]

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法: python data_processor.py <filename>")
        return
    
    filename = sys.argv[1]
    data = read_file(filename)
    processed = process_data(data)
    
    print(f"原始数据: {data}")
    print(f"处理后数据: {processed}")

if __name__ == "__main__":
    main()
```

```python
# main.py
from data_processor import process_data

# 复用 process_data 函数
data = [1, 2, 3, 4, 5]
result = process_data(data)
print(result)  # [2, 4, 6, 8, 10]
```

---

## 常用标准库模块

### datetime - 日期时间

```python
from datetime import datetime, date, time, timedelta

# 当前时间
now = datetime.now()
print(now)  # 2024-01-15 14:30:45.123456
print(now.year)  # 2024
print(now.month)  # 1
print(now.day)  # 15

# 创建日期
d = date(2024, 1, 15)
print(d)  # 2024-01-15

# 创建时间
t = time(14, 30, 45)
print(t)  # 14:30:45

# 日期计算
tomorrow = date.today() + timedelta(days=1)
print(tomorrow)  # 2024-01-16

# 格式化日期
formatted = now.strftime("%Y-%m-%d %H:%M:%S")
print(formatted)  # 2024-01-15 14:30:45

# 解析日期字符串
parsed = datetime.strptime("2024-01-15", "%Y-%m-%d")
print(parsed)  # 2024-01-15 00:00:00
```

### os - 操作系统接口

```python
import os
from pathlib import Path

# 获取当前工作目录
cwd = os.getcwd()
print(cwd)

# 创建目录
os.makedirs("new_folder", exist_ok=True)

# 列出目录内容
items = os.listdir(".")
print(items)

# 路径操作
path = "/path/to/file.txt"
directory = os.path.dirname(path)
filename = os.path.basename(path)
print(directory)  # /path/to
print(filename)  # file.txt

# 检查文件是否存在
print(os.path.exists(path))

# 使用 pathlib（推荐）
p = Path("folder/file.txt")
p.parent.mkdir(parents=True, exist_ok=True)  # 创建父目录
p.write_text("Hello, Python!")
content = p.read_text()
print(content)
```

### json - JSON 处理

```python
import json

# Python 对象转 JSON
data = {
    "name": "Python",
    "version": "3.12",
    "features": ["动态类型", "自动内存管理", "丰富的标准库"]
}

json_str = json.dumps(data, indent=2, ensure_ascii=False)
print(json_str)

# JSON 转 Python 对象
json_str = '{"name": "JavaScript", "version": "ES2024"}'
parsed = json.loads(json_str)
print(parsed["name"])  # JavaScript

# 读写 JSON 文件
json.dump(data, open("data.json", "w"), indent=2, ensure_ascii=False)
loaded_data = json.load(open("data.json", "r"))
print(loaded_data)
```

### random - 随机数生成

```python
import random

# 随机整数
print(random.randint(1, 10))  # 1-10 之间的随机整数

# 随机选择
colors = ["红色", "绿色", "蓝色"]
print(random.choice(colors))  # 随机选择一个颜色
print(random.choices(colors, k=2))  # 随机选择 2 个（可重复）

# 随机打乱列表
nums = [1, 2, 3, 4, 5]
random.shuffle(nums)
print(nums)

# 随机浮点数
print(random.random())  # 0.0-1.0 之间的随机浮点数
print(random.uniform(1.0, 10.0))  # 1.0-10.0 之间的随机浮点数

# 设置随机种子（用于可重复的结果）
random.seed(42)
print(random.randint(1, 10))  # 每次运行结果相同
```

### collections - 高级数据结构

```python
from collections import Counter, defaultdict, deque

# Counter - 计数器
words = ["apple", "banana", "apple", "orange", "banana", "apple"]
word_counts = Counter(words)
print(word_counts)  # Counter({'apple': 3, 'banana': 2, 'orange': 1})
print(word_counts.most_common(2))  # [('apple', 3), ('banana', 2)]

# defaultdict - 带默认值的字典
d = defaultdict(list)
d["fruits"].append("apple")
d["fruits"].append("banana")
print(d)  # defaultdict(<class 'list'>, {'fruits': ['apple', 'banana']})

# deque - 双端队列
dq = deque([1, 2, 3])
dq.append(4)  # 从右端添加
dq.appendleft(0)  # 从左端添加
print(dq)  # deque([0, 1, 2, 3, 4])

print(dq.pop())  # 从右端弹出：4
print(dq.popleft())  # 从左端弹出：0
print(dq)  # deque([1, 2, 3])
```

### typing - 类型提示

```python
from typing import List, Dict, Optional, Union, Callable

# 列表类型
def process_numbers(numbers: List[int]) -> List[int]:
    """处理数字列表"""
    return [n * 2 for n in numbers]

# 字典类型
def get_user_info() -> Dict[str, Union[str, int]]:
    """获取用户信息"""
    return {"name": "张三", "age": 25}

# 可选类型
def find_user(user_id: str) -> Optional[Dict[str, str]]:
    """查找用户（可能找不到）"""
    users = {"001": {"name": "张三"}, "002": {"name": "李四"}}
    return users.get(user_id)

# 函数类型
def apply_function(
    data: List[int],
    func: Callable[[int], int]
) -> List[int]:
    """应用函数到列表"""
    return [func(x) for x in data]

result = apply_function([1, 2, 3], lambda x: x ** 2)
print(result)  # [1, 4, 9]
```

---

## 虚拟环境

### 为什么需要虚拟环境

虚拟环境可以：
- 隔离项目依赖
- 避免版本冲突
- 保持全局 Python 环境清洁

### 创建虚拟环境

```bash
# 使用 venv（Python 内置）
python -m venv venv

# 激活虚拟环境
# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

# 验证虚拟环境
python --version
which python  # macOS/Linux
where python  # Windows

# 退出虚拟环境
deactivate
```

### 虚拟环境目录结构

```
venv/
├── bin/              # 可执行文件（macOS/Linux）
├── Scripts/          # 可执行文件（Windows）
├── lib/              # 安装的包
├── include/          # C 头文件
├── pyvenv.cfg        # 配置文件
└── ...               # 其他文件
```

### 最佳实践

```bash
# 1. 为每个项目创建独立的虚拟环境
cd project_folder
python -m venv .venv

# 2. 激活虚拟环境
source .venv/bin/activate  # macOS/Linux
# 或
.venv\Scripts\activate  # Windows

# 3. 安装依赖
pip install -r requirements.txt

# 4. 在虚拟环境中开发
python main.py

# 5. 完成后退出
deactivate

# 6. 将 venv/ 添加到 .gitignore
echo "venv/" >> .gitignore
echo ".venv/" >> .gitignore
```

---

## 依赖管理

### requirements.txt

```bash
# 生成依赖文件
pip freeze > requirements.txt

# requirements.txt 示例
# fastapi==0.104.1
# uvicorn[standard]==0.24.0
# pydantic==2.5.0
# requests==2.31.0

# 安装依赖
pip install -r requirements.txt

# 安装单个包
pip install fastapi

# 安装特定版本
pip install fastapi==0.104.1

# 卸载包
pip uninstall fastapi

# 查看已安装的包
pip list
pip show fastapi
```

### pyproject.toml（现代标准）

```toml
# pyproject.toml
[project]
name = "my-project"
version = "1.0.0"
description = "我的 Python 项目"
requires-python = ">=3.10"
dependencies = [
    "fastapi>=0.104.1",
    "uvicorn[standard]>=0.24.0",
    "pydantic>=2.5.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "black>=23.0.0",
    "mypy>=1.6.0",
]

[build-system]
requires = ["setuptools>=68.0", "wheel"]
build-backend = "setuptools.build_meta"
```

### Poetry（推荐的依赖管理工具）

```bash
# 安装 Poetry
curl -sSL https://install.python-poetry.org | python3 -

# 创建新项目
poetry new my-project

# 在现有项目中初始化
poetry init

# 添加依赖
poetry add fastapi

# 添加开发依赖
poetry add pytest --group dev

# 安装所有依赖
poetry install

# 运行脚本
poetry run python main.py

# 更新依赖
poetry update

# 导出 requirements.txt
poetry export -f requirements.txt > requirements.txt
```

### Pipenv

```bash
# 安装 Pipenv
pip install pipenv

# 创建虚拟环境并安装依赖
pipenv install fastapi

# 安装开发依赖
pipenv install pytest --dev

# 激活虚拟环境
pipenv shell

# 运行命令
pipenv run python main.py

# 生成 requirements.txt
pipenv requirements > requirements.txt
```

---

## Python vs JavaScript 对比

### 模块系统

| 特性       | Python                    | JavaScript (ES6)                |
| ---------- | ------------------------- | ------------------------------- |
| 导入       | `import module`           | `import module from 'module'`   |
| 导出       | 默认导出整个模块          | 需要明确导出                    |
| 别名       | `import module as m`      | `import module as m`            |
| 选择性导入 | `from module import func` | `import { func } from 'module'` |

### 代码示例对比

```python
# Python
import math
from collections import Counter

result = math.sqrt(16)
counter = Counter(["a", "b", "a"])
```

```javascript
// JavaScript
import { sqrt } from 'math';  // 假设有一个 math 模块
import { Counter } from 'collections';  // 假设有一个 collections 模块

const result = sqrt(16);
const counter = new Counter(["a", "b", "a"]);
```

---

## 练习题

### 练习 1：创建工具包

创建一个工具包 `utils`：
1. 包含 `string_utils.py`：字符串处理函数
2. 包含 `math_utils.py`：数学计算函数
3. 在 `__init__.py` 中导出常用函数
4. 编写测试代码验证功能

### 练习 2：日志工具

创建一个日志工具：
1. 使用 `datetime` 模块获取时间戳
2. 使用 `pathlib` 处理文件路径
3. 实现不同级别的日志（INFO、WARNING、ERROR）
4. 将日志写入文件

### 练习 3：数据分析工具

创建一个数据分析工具：
1. 使用 `json` 读取数据文件
2. 使用 `collections.Counter` 统计数据
3. 使用 `typing` 添加类型提示
4. 将分析结果保存为 JSON

---

## 练习答案

<details>
<summary>点击查看练习 1 答案</summary>

```python
# utils/__init__.py
"""工具包"""

from .string_utils import reverse_string, capitalize_words, count_words
from .math_utils import calculate_average, calculate_median, is_prime

__all__ = [
    "reverse_string",
    "capitalize_words",
    "count_words",
    "calculate_average",
    "calculate_median",
    "is_prime"
]
```

```python
# utils/string_utils.py
"""字符串工具"""

def reverse_string(text: str) -> str:
    """反转字符串"""
    return text[::-1]

def capitalize_words(text: str) -> str:
    """将每个单词的首字母大写"""
    return ' '.join(word.capitalize() for word in text.split())

def count_words(text: str) -> int:
    """统计单词数量"""
    return len(text.split())

def remove_whitespace(text: str) -> str:
    """移除所有空白字符"""
    return ''.join(text.split())

def is_palindrome(text: str) -> bool:
    """判断是否为回文"""
    cleaned = remove_whitespace(text).lower()
    return cleaned == cleaned[::-1]
```

```python
# utils/math_utils.py
"""数学工具"""

from typing import List

def calculate_average(numbers: List[float]) -> float:
    """计算平均值"""
    if not numbers:
        return 0.0
    return sum(numbers) / len(numbers)

def calculate_median(numbers: List[float]) -> float:
    """计算中位数"""
    if not numbers:
        return 0.0
    
    sorted_numbers = sorted(numbers)
    n = len(sorted_numbers)
    
    if n % 2 == 0:
        mid = n // 2
        return (sorted_numbers[mid - 1] + sorted_numbers[mid]) / 2
    else:
        return sorted_numbers[n // 2]

def is_prime(n: int) -> bool:
    """判断是否为质数"""
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    
    for i in range(3, int(n ** 0.5) + 1, 2):
        if n % i == 0:
            return False
    return True

def factorial(n: int) -> int:
    """计算阶乘"""
    if n < 0:
        raise ValueError("阶乘不能为负数")
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)
```

```python
# test_utils.py
"""测试工具包"""

from utils import reverse_string, calculate_average, is_prime
from utils.string_utils import is_palindrome
from utils.math_utils import calculate_median

# 测试字符串工具
print("=== 字符串工具测试 ===")
print(reverse_string("Python"))  # nohtyP
print(reverse_string("Hello World"))  # dlroW olleH
print(is_palindrome("A man a plan a canal Panama"))  # True
print(is_palindrome("racecar"))  # True

# 测试数学工具
print("\n=== 数学工具测试 ===")
print(calculate_average([1, 2, 3, 4, 5]))  # 3.0
print(calculate_median([1, 2, 3, 4, 5]))  # 3
print(calculate_median([1, 2, 3, 4]))  # 2.5
print(is_prime(7))  # True
print(is_prime(10))  # False

# 测试导入
print("\n=== 导入测试 ===")
from utils import *
print(reverse_string("Test"))  # tseT
print(calculate_average([10, 20, 30]))  # 20.0
```

运行示例：
```bash
python test_utils.py
# 输出：
# === 字符串工具测试 ===
# nohtyP
# dlroW olleH
# True
# True
# 
# === 数学工具测试 ===
# 3.0
# 3
# 2.5
# True
# False
# 
# === 导入测试 ===
# tseT
# 20.0
```

</details>

<details>
<summary>点击查看练习 2 答案</summary>

```python
# logger.py
"""日志工具"""

from datetime import datetime
from pathlib import Path
from typing import Optional
from enum import Enum

class LogLevel(Enum):
    """日志级别"""
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class Logger:
    """日志记录器"""
    
    def __init__(self, name: str, log_file: Optional[str] = None):
        """
        初始化
        
        Args:
            name: 日志器名称
            log_file: 日志文件路径（可选）
        """
        self.name = name
        self.log_file = Path(log_file) if log_file else None
        self.min_level = LogLevel.INFO
        
        # 创建日志目录
        if self.log_file:
            self.log_file.parent.mkdir(parents=True, exist_ok=True)
    
    def _format_message(
        self,
        level: LogLevel,
        message: str
    ) -> str:
        """格式化日志消息"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        return f"[{timestamp}] [{level.value}] [{self.name}] {message}"
    
    def _write_log(self, level: LogLevel, message: str) -> None:
        """写入日志"""
        formatted = self._format_message(level, message)
        
        # 打印到控制台
        print(formatted)
        
        # 写入文件
        if self.log_file:
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write(formatted + '\n')
    
    def set_level(self, level: LogLevel) -> None:
        """设置日志级别"""
        self.min_level = level
    
    def debug(self, message: str) -> None:
        """调试日志"""
        if self.min_level.value <= LogLevel.DEBUG.value:
            self._write_log(LogLevel.DEBUG, message)
    
    def info(self, message: str) -> None:
        """信息日志"""
        if self.min_level.value <= LogLevel.INFO.value:
            self._write_log(LogLevel.INFO, message)
    
    def warning(self, message: str) -> None:
        """警告日志"""
        if self.min_level.value <= LogLevel.WARNING.value:
            self._write_log(LogLevel.WARNING, message)
    
    def error(self, message: str) -> None:
        """错误日志"""
        if self.min_level.value <= LogLevel.ERROR.value:
            self._write_log(LogLevel.ERROR, message)
    
    def critical(self, message: str) -> None:
        """严重错误日志"""
        self._write_log(LogLevel.CRITICAL, message)


# 演示
if __name__ == "__main__":
    # 创建日志器
    logger = Logger("MyApp", "logs/app.log")
    
    # 记录不同级别的日志
    logger.debug("这是调试信息")
    logger.info("应用程序启动")
    logger.warning("这是一个警告")
    logger.error("发生了一个错误")
    logger.critical("严重错误！")
    
    # 设置日志级别为 DEBUG
    logger.set_level(LogLevel.DEBUG)
    logger.debug("现在可以看到调试信息了")
    
    print(f"\n日志文件: {logger.log_file}")
    print(f"日志内容:")
    print(logger.log_file.read_text())
```

运行示例：
```bash
python logger.py
# 输出：
# [2024-01-15 14:30:45] [INFO] [MyApp] 应用程序启动
# [2024-01-15 14:30:45] [WARNING] [MyApp] 这是一个警告
# [2024-01-15 14:30:45] [ERROR] [MyApp] 发生了一个错误
# [2024-01-15 14:30:45] [CRITICAL] [MyApp] 严重错误！
# [2024-01-15 14:30:45] [DEBUG] [MyApp] 现在可以看到调试信息了
# 
# 日志文件: logs/app.log
# 日志内容:
# [2024-01-15 14:30:45] [INFO] [MyApp] 应用程序启动
# [2024-01-15 14:30:45] [WARNING] [MyApp] 这是一个警告
# [2024-01-15 14:30:45] [ERROR] [MyApp] 发生了一个错误
# [2024-01-15 14:30:45] [CRITICAL] [MyApp] 严重错误！
# [2024-01-15 14:30:45] [DEBUG] [MyApp] 现在可以看到调试信息了
```

</details>

<details>
<summary>点击查看练习 3 答案</summary>

```python
# data_analyzer.py
"""数据分析工具"""

import json
from collections import Counter
from pathlib import Path
from typing import List, Dict, Any


class DataAnalyzer:
    """数据分析器"""
    
    def __init__(self, data_file: str):
        """
        初始化
        
        Args:
            data_file: 数据文件路径
        """
        self.data_file = Path(data_file)
        self.data: List[Dict[str, Any]] = []
        self.load_data()
    
    def load_data(self) -> None:
        """加载数据"""
        if not self.data_file.exists():
            raise FileNotFoundError(f"数据文件 {self.data_file} 不存在")
        
        with open(self.data_file, 'r', encoding='utf-8') as f:
            self.data = json.load(f)
        
        print(f"加载了 {len(self.data)} 条数据")
    
    def count_by_field(self, field: str) -> Counter:
        """按字段统计"""
        values = [item.get(field) for item in self.data if field in item]
        return Counter(values)
    
    def get_average(self, field: str) -> float:
        """计算平均值"""
        values = [item.get(field, 0) for item in self.data if isinstance(item.get(field), (int, float))]
        
        if not values:
            return 0.0
        
        return sum(values) / len(values)
    
    def get_max(self, field: str) -> Any:
        """获取最大值"""
        values = [(item.get(field), item) for item in self.data if field in item]
        if not values:
            return None
        return max(values, key=lambda x: x[0])[1]
    
    def get_min(self, field: str) -> Any:
        """获取最小值"""
        values = [(item.get(field), item) for item in self.data if field in item]
        if not values:
            return None
        return min(values, key=lambda x: x[0])[1]
    
    def filter_by(self, field: str, value: Any) -> List[Dict[str, Any]]:
        """过滤数据"""
        return [item for item in self.data if item.get(field) == value]
    
    def analyze(self, fields: List[str]) -> Dict[str, Any]:
        """分析数据"""
        results = {}
        
        for field in fields:
            results[field] = {
                "count": len(self.filter_by(field, lambda x: True)),
                "unique_count": len(set(item.get(field) for item in self.data if field in item)),
                "top_values": self.count_by_field(field).most_common(5)
            }
            
            # 如果字段是数字类型，计算平均值
            if all(isinstance(item.get(field), (int, float)) for item in self.data if field in item):
                results[field]["average"] = self.get_average(field)
                results[field]["max"] = self.get_max(field)
                results[field]["min"] = self.get_min(field)
        
        return results
    
    def save_results(self, output_file: str, results: Dict[str, Any]) -> None:
        """保存分析结果"""
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"分析结果已保存到 {output_path}")


# 演示
if __name__ == "__main__":
    # 创建示例数据文件
    sample_data = [
        {"name": "张三", "age": 25, "department": "技术部", "salary": 15000},
        {"name": "李四", "age": 30, "department": "销售部", "salary": 12000},
        {"name": "王五", "age": 28, "department": "技术部", "salary": 16000},
        {"name": "赵六", "age": 32, "department": "市场部", "salary": 13000},
        {"name": "钱七", "age": 27, "department": "技术部", "salary": 14000},
        {"name": "孙八", "age": 29, "department": "销售部", "salary": 12500},
    ]
    
    # 保存示例数据
    data_file = "data/employees.json"
    data_path = Path(data_file)
    data_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(data_file, 'w', encoding='utf-8') as f:
        json.dump(sample_data, f, indent=2, ensure_ascii=False)
    
    # 创建分析器
    analyzer = DataAnalyzer(data_file)
    
    # 分析数据
    print("\n=== 数据分析 ===")
    results = analyzer.analyze(["department", "age", "salary"])
    
    for field, stats in results.items():
        print(f"\n{field}:")
        print(f"  数量: {stats['count']}")
        print(f"  唯一值: {stats['unique_count']}")
        print(f"  Top 5: {stats['top_values']}")
        if "average" in stats:
            print(f"  平均值: {stats['average']:.2f}")
            print(f"  最大值: {stats['max']}")
            print(f"  最小值: {stats['min']}")
    
    # 保存结果
    analyzer.save_results("data/analysis_results.json", results)
```

运行示例：
```bash
python data_analyzer.py
# 输出：
# 加载了 6 条数据
# 
# === 数据分析 ===
# 
# department:
#   数量: 6
#   唯一值: 3
#   Top 5: [('技术部', 3), ('销售部', 2), ('市场部', 1)]
# 
# age:
#   数量: 6
#   唯一值: 6
#   Top 5: [(25, 1), (30, 1), (28, 1), (32, 1), (27, 1)]
#   平均值: 28.50
#   最大值: {'name': '赵六', 'age': 32, 'department': '市场部', 'salary': 13000}
#   最小值: {'name': '张三', 'age': 25, 'department': '技术部', 'salary': 15000}
# 
# salary:
#   数量: 6
#   唯一值: 6
#   Top 5: [(15000, 1), (12000, 1), (16000, 1), (13000, 1), (14000, 1)]
#   平均值: 13750.00
#   最大值: {'name': '王五', 'age': 28, 'department': '技术部', 'salary': 16000}
#   最小值: {'name': '李四', 'age': 30, 'department': '销售部', 'salary': 12000}
# 
# 分析结果已保存到 data/analysis_results.json
```

</details>

---

## 本章小结

✅ 你已经学会了：
- 模块的概念和使用
- 不同的导入方式
- 包的创建和使用
- `__name__` 和 `__main__` 的作用
- 常用的标准库模块
- 虚拟环境的创建和使用
- 依赖管理的方法
- Python 与 JavaScript 的模块对比

## 下一章

[第8章：异常处理与文件操作](/chapter-08/) - 学习如何处理异常和进行文件 I/O 操作。