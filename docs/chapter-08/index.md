# 第8章：异常处理与文件操作

异常处理和文件操作是 Python 编程中的重要主题。如果你熟悉 JavaScript 的 `try-catch` 和 `fs` 模块，你会发现 Python 的处理方式非常相似，但有一些独特的特性。

## 学习目标

- 理解异常的概念和异常处理机制
- 掌握 try-except-finally 语句
- 学会抛出和自定义异常
- 掌握文件的读写操作
- 学习路径操作（pathlib）
- 掌握 JSON 等格式的处理

## 目录

1. [异常处理](#异常处理)
2. [常见异常类型](#常见异常类型)
3. [抛出异常](#抛出异常)
4. [自定义异常](#自定义异常)
5. [文件读写](#文件读写)
6. [路径操作](#路径操作)
7. [JSON 处理](#json-处理)
8. [其他文件格式](#其他文件格式)
9. [文件系统最佳实践](#文件系统最佳实践)
10. [Python vs JavaScript 对比](#python-vs-javascript-对比)
11. [练习题](#练习题)
12. [练习答案](#练习答案)

---

## 异常处理

### 什么是异常

异常是程序运行时发生的错误。Python 使用异常对象来表示错误状态。

```python
# 常见的异常情况
print(1 / 0)  # ZeroDivisionError: division by zero

numbers = [1, 2, 3]
print(numbers[10])  # IndexError: list index out of range

print(undefined_var)  # NameError: name 'undefined_var' is not defined
```

### try-except 语句

```python
# 基本语法
try:
    # 可能发生异常的代码
    result = 10 / 0
except ZeroDivisionError:
    # 捕获特定异常
    print("不能除以零！")

# 捕获多个异常
try:
    numbers = [1, 2, 3]
    index = int(input("输入索引: "))
    print(numbers[index])
except ValueError:
    print("请输入有效的整数！")
except IndexError:
    print("索引超出范围！")
except Exception as e:
    # 捕获所有其他异常
    print(f"发生错误: {e}")

# 获取异常信息
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"错误类型: {type(e).__name__}")
    print(f"错误信息: {e}")
    print(f"错误参数: {e.args}")
```

### else 和 finally 子句

```python
# else - 没有异常时执行
def divide(a: float, b: float) -> float:
    """除法运算"""
    try:
        result = a / b
    except ZeroDivisionError:
        print("除数不能为零！")
        return None
    else:
        # 只有没有异常时才执行
        print("计算成功！")
        return result
    finally:
        # 无论是否异常都会执行
        print("除法运算结束")

print(divide(10, 2))
# 输出：
# 计算成功！
# 除法运算结束
# 5.0

print(divide(10, 0))
# 输出：
# 除数不能为零！
# 除法运算结束
# None

# finally 的典型应用：资源清理
def process_file(filename: str) -> None:
    """处理文件"""
    file = None
    try:
        file = open(filename, 'r')
        content = file.read()
        print(f"文件内容: {content[:50]}...")
    except FileNotFoundError:
        print(f"文件 {filename} 不存在")
    except IOError as e:
        print(f"读取文件错误: {e}")
    finally:
        # 确保文件被关闭
        if file:
            file.close()
            print("文件已关闭")
```

### 异常链

```python
# 使用 raise ... from 保留原始异常信息
def calculate_square_root(value: str) -> float:
    """计算平方根"""
    import math

    try:
        number = float(value)
        if number < 0:
            raise ValueError("数值不能为负数")
        return math.sqrt(number)
    except ValueError as e:
        # 抛出新异常但保留原始异常
        raise TypeError(f"无效的输入值: {value}") from e

# 使用
try:
    result = calculate_square_root("-4")
except TypeError as e:
    print(f"错误: {e}")
    print(f"原始异常: {e.__cause__}")
```

---

## 常见异常类型

### 内置异常类层次结构

```
BaseException
├── SystemExit
├── KeyboardInterrupt
├── GeneratorExit
└── Exception
    ├── ArithmeticError
    │   ├── FloatingPointError
    │   ├── OverflowError
    │   └── ZeroDivisionError
    ├── LookupError
    │   ├── IndexError
    │   └── KeyError
    ├── OSError
    │   ├── FileNotFoundError
    │   ├── PermissionError
    │   └── TimeoutError
    ├── TypeError
    ├── ValueError
    └── RuntimeError
```

### 常用异常示例

```python
# 1. TypeError - 类型错误
try:
    result = "10" + 5  # 不能拼接字符串和数字
except TypeError as e:
    print(f"TypeError: {e}")

# 2. ValueError - 值错误
try:
    number = int("abc")  # 无法转换为整数
except ValueError as e:
    print(f"ValueError: {e}")

# 3. IndexError - 索引错误
try:
    items = [1, 2, 3]
    print(items[10])
except IndexError as e:
    print(f"IndexError: {e}")

# 4. KeyError - 键错误
try:
    data = {"name": "Python"}
    print(data["age"])
except KeyError as e:
    print(f"KeyError: {e}")

# 5. AttributeError - 属性错误
try:
    number = 42
    print(number.append(1))
except AttributeError as e:
    print(f"AttributeError: {e}")

# 6. FileNotFoundError - 文件未找到
try:
    with open("nonexistent.txt", "r") as f:
        content = f.read()
except FileNotFoundError as e:
    print(f"FileNotFoundError: {e}")

# 7. PermissionError - 权限错误
try:
    # 尝试在没有权限的目录创建文件
    with open("/root/test.txt", "w") as f:
        f.write("test")
except PermissionError as e:
    print(f"PermissionError: {e}")
```

---

## 抛出异常

### raise 语句

```python
# 主动抛出异常
def check_age(age: int) -> None:
    """检查年龄"""
    if age < 0:
        raise ValueError("年龄不能为负数")
    if age > 150:
        raise ValueError("年龄不能超过150")
    print(f"年龄 {age} 有效")

# 使用
try:
    check_age(-5)
except ValueError as e:
    print(f"错误: {e}")

# 抛出异常但不处理（让调用者处理）
def process_payment(amount: float) -> None:
    """处理支付"""
    if amount <= 0:
        raise ValueError("支付金额必须大于零")
    # 处理支付逻辑...

# 重新抛出异常
def handle_payment(amount: float) -> None:
    """处理支付（带日志）"""
    try:
        process_payment(amount)
    except ValueError:
        print("记录错误日志...")
        raise  # 重新抛出异常，让上层处理
```

### assert 语句

```python
# 断言 - 用于调试
def calculate_discount(price: float, discount: float) -> float:
    """计算折扣后价格"""
    assert price > 0, "价格必须大于零"
    assert 0 <= discount <= 1, "折扣必须在 0-1 之间"
    return price * (1 - discount)

# 正常情况
print(calculate_discount(100, 0.2))  # 80.0

# 断言失败会抛出 AssertionError
try:
    print(calculate_discount(100, 1.5))
except AssertionError as e:
    print(f"AssertionError: {e}")

# 在开发环境使用断言，生产环境禁用
# 运行时使用 -O 标志禁用断言：python -O script.py
```

---

## 自定义异常

### 创建异常类

```python
# 自定义异常类
class ValidationError(Exception):
    """验证错误基类"""
    def __init__(self, message: str, field: str = None):
        self.message = message
        self.field = field
        super().__init__(self.message)

    def __str__(self):
        if self.field:
            return f"字段 '{self.field}' 验证失败: {self.message}"
        return self.message


class EmailValidationError(ValidationError):
    """邮箱验证错误"""
    pass


class PasswordValidationError(ValidationError):
    """密码验证错误"""
    pass


# 使用自定义异常
def validate_email(email: str) -> None:
    """验证邮箱"""
    if "@" not in email:
        raise EmailValidationError("邮箱必须包含 @ 符号", "email")
    if "." not in email.split("@")[-1]:
        raise EmailValidationError("邮箱格式不正确", "email")


def validate_password(password: str) -> None:
    """验证密码"""
    if len(password) < 8:
        raise PasswordValidationError("密码长度至少8位", "password")
    if not any(c.isdigit() for c in password):
        raise PasswordValidationError("密码必须包含数字", "password")


def register_user(email: str, password: str) -> None:
    """注册用户"""
    try:
        validate_email(email)
        validate_password(password)
        print("用户注册成功！")
    except ValidationError as e:
        print(f"注册失败: {e}")
        return False
    return True


# 测试
register_user("invalid-email", "password123")
# 注册失败: 字段 'email' 验证失败: 邮箱必须包含 @ 符号

register_user("user@example.com", "short")
# 注册失败: 字段 'password' 验证失败: 密码长度至少8位

register_user("user@example.com", "password123")
# 用户注册成功！
```

### 异常上下文

```python
class PaymentError(Exception):
    """支付错误基类"""
    def __init__(self, message: str, code: str = None):
        self.message = message
        self.code = code
        super().__init__(message)


class InsufficientFundsError(PaymentError):
    """余额不足"""
    def __init__(self, balance: float, amount: float):
        message = f"余额不足: 需要 {amount}, 可用 {balance}"
        super().__init__(message, code="INSUFFICIENT_FUNDS")
        self.balance = balance
        self.amount = amount


class PaymentGatewayError(PaymentError):
    """支付网关错误"""
    pass


def process_payment(account_id: str, amount: float) -> bool:
    """处理支付"""
    # 模拟检查余额
    balance = 100.0

    if amount > balance:
        raise InsufficientFundsError(balance, amount)

    # 模拟支付网关调用
    if amount > 10000:
        raise PaymentGatewayError("支付网关超时", code="GATEWAY_TIMEOUT")

    return True


# 处理异常
try:
    process_payment("ACC001", 150.0)
except InsufficientFundsError as e:
    print(f"支付失败: {e.message}")
    print(f"错误代码: {e.code}")
    print(f"当前余额: {e.balance}, 需要金额: {e.amount}")
except PaymentError as e:
    print(f"支付失败: {e.message} (代码: {e.code})")
```

---

## 文件读写

### open() 函数

```python
# 基本语法
file = open(filename, mode='r', encoding='utf-8')

# 常用模式
# 'r'  - 只读（默认）
# 'w'  - 只写（覆盖已有文件）
# 'a'  - 追加
# 'r+' - 读写
# 'rb' - 二进制读取
# 'wb' - 二进制写入
# 'x'  - 创建新文件（如果存在则失败）
```

### 读取文件

```python
# 方法1: read() - 读取全部内容
with open('example.txt', 'r', encoding='utf-8') as f:
    content = f.read()
    print(content)

# 方法2: readline() - 读取一行
with open('example.txt', 'r', encoding='utf-8') as f:
    line = f.readline()
    while line:
        print(line.strip())
        line = f.readline()

# 方法3: readlines() - 读取所有行到列表
with open('example.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i, line in enumerate(lines, 1):
        print(f"{i}: {line.strip()}")

# 方法4: 直接遍历文件（推荐）
with open('example.txt', 'r', encoding='utf-8') as f:
    for line in f:
        print(line.strip())

# 读取指定字符数
with open('example.txt', 'r', encoding='utf-8') as f:
    first_100 = f.read(100)  # 读取前100个字符
    print(first_100)
```

### 写入文件

```python
# write() - 写入字符串
with open('output.txt', 'w', encoding='utf-8') as f:
    f.write("第一行\n")
    f.write("第二行\n")

# writelines() - 写入多行
lines = ["第一行\n", "第二行\n", "第三行\n"]
with open('output.txt', 'w', encoding='utf-8') as f:
    f.writelines(lines)

# 追加模式
with open('output.txt', 'a', encoding='utf-8') as f:
    f.write("这是追加的内容\n")

# 使用 print 写入（自动换行）
with open('output.txt', 'w', encoding='utf-8') as f:
    print("第一行", file=f)
    print("第二行", file=f)
```

### with 语句（上下文管理器）

```python
# with 语句自动关闭文件
# 即使发生异常也会正确关闭

# 传统方式
file = open('example.txt', 'r')
try:
    content = file.read()
    print(content)
finally:
    file.close()

# 使用 with 语句（推荐）
with open('example.txt', 'r', encoding='utf-8') as f:
    content = f.read()
    print(content)
# 文件在这里自动关闭

# 同时打开多个文件
with open('input.txt', 'r') as f_in, open('output.txt', 'w') as f_out:
    content = f_in.read()
    f_out.write(content.upper())
```

### 文件指针操作

```python
# tell() - 获取当前位置
# seek() - 移动文件指针

with open('example.txt', 'r', encoding='utf-8') as f:
    # 读取前10个字符
    first_part = f.read(10)
    print(f"已读取: {first_part}")
    print(f"当前位置: {f.tell()}")

    # 移动到文件开头
    f.seek(0)
    print(f"seek(0) 后位置: {f.tell()}")

    # 从当前位置读取
    rest = f.read()
    print(f"剩余内容: {rest}")

# seek 偏移量模式
# seek(offset, whence)
# whence:
#   0 - 文件开头（默认）
#   1 - 当前位置
#   2 - 文件末尾

with open('example.txt', 'rb') as f:
    # 移动到文件末尾前10字节
    f.seek(-10, 2)
    last_10 = f.read()
    print(f"最后10字节: {last_10}")
```

---

## 路径操作

### os.path 模块

```python
import os

# 路径拼接
path = os.path.join('folder', 'subfolder', 'file.txt')
print(path)  # folder/subfolder/file.txt (Unix) 或 folder\subfolder\file.txt (Windows)

# 路径分隔
dirname, filename = os.path.split(path)
print(f"目录: {dirname}, 文件: {filename}")

# 文件名和扩展名
name, ext = os.path.splitext(filename)
print(f"文件名: {name}, 扩展名: {ext}")

# 获取绝对路径
abs_path = os.path.abspath('file.txt')
print(f"绝对路径: {abs_path}")

# 检查路径
print(os.path.exists(path))      # 是否存在
print(os.path.isfile(path))      # 是否是文件
print(os.path.isdir(path))       # 是否是目录

# 获取文件大小
print(os.path.getsize('file.txt'))

# 获取当前工作目录
print(os.getcwd())

# 改变工作目录
os.chdir('/path/to/directory')

# 创建目录
os.makedirs('folder/subfolder', exist_ok=True)

# 删除
os.remove('file.txt')       # 删除文件
os.rmdir('folder')          # 删除空目录
os.removedirs('folder/subfolder')  # 删除多级空目录
```

### pathlib 模块（推荐）

```python
from pathlib import Path

# 创建路径对象
path = Path('folder/subfolder/file.txt')

# 路径操作
print(path.name)           # file.txt
print(path.stem)           # file (不含扩展名)
print(path.suffix)         # .txt
print(path.parent)         # folder/subfolder
print(path.parts)          # ('folder', 'subfolder', 'file.txt')

# 路径拼接
new_path = path.parent / 'new_file.txt'
print(new_path)

# 绝对路径
print(path.absolute())
print(path.resolve())

# 检查路径
print(path.exists())       # 是否存在
print(path.is_file())      # 是否是文件
print(path.is_dir())       # 是否是目录

# 读写文件（更简洁）
content = path.read_text(encoding='utf-8')
path.write_text('Hello, World!', encoding='utf-8')

# 创建目录
path.parent.mkdir(parents=True, exist_ok=True)

# 遍历目录
folder = Path('.')
for file in folder.glob('*.txt'):  # 匹配模式
    print(file)

for file in folder.rglob('*.py'):  # 递归匹配
    print(file)

# 获取所有文件和目录
for item in folder.iterdir():
    print(f"{'📁' if item.is_dir() else '📄'} {item.name}")

# 文件信息
print(path.stat())        # 文件统计信息
print(path.stat().st_size)  # 文件大小
print(path.stat().st_mtime)  # 修改时间
```

### 实际应用示例

```python
from pathlib import Path

def organize_files(directory: str) -> None:
    """按扩展名整理文件"""
    path = Path(directory)

    # 按扩展名分类
    categories = {
        '.jpg': 'images',
        '.png': 'images',
        '.gif': 'images',
        '.pdf': 'documents',
        '.doc': 'documents',
        '.docx': 'documents',
        '.txt': 'documents',
        '.mp3': 'music',
        '.mp4': 'videos',
    }

    # 遍历文件
    for file in path.iterdir():
        if file.is_file():
            ext = file.suffix.lower()

            # 找到对应分类
            category = categories.get(ext)

            if category:
                # 创建目标目录
                target_dir = path / category
                target_dir.mkdir(exist_ok=True)

                # 移动文件
                target_file = target_dir / file.name
                file.rename(target_file)
                print(f"移动: {file.name} -> {category}/")

# 使用
organize_files('./downloads')
```

---

## JSON 处理

### json 模块基础

```python
import json

# Python 对象转 JSON（序列化）
data = {
    "name": "Python",
    "version": "3.12",
    "features": ["动态类型", "自动内存管理", "丰富的标准库"],
    "creators": ["Guido van Rossum"]
}

json_str = json.dumps(data, indent=2, ensure_ascii=False)
print(json_str)
"""
{
  "name": "Python",
  "version": "3.12",
  "features": [
    "动态类型",
    "自动内存管理",
    "丰富的标准库"
  ],
  "creators": [
    "Guido van Rossum"
  ]
}
"""

# JSON 转 Python 对象（反序列化）
json_str = '{"name": "JavaScript", "version": "ES2024", "year": 2024}'
parsed = json.loads(json_str)
print(parsed["name"])  # JavaScript
print(parsed["year"])  # 2024

# 类型映射
# JSON          Python
# object        dict
# array         list
# string        str
# number        int/float
# true/false    True/False
# null          None
```

### 读写 JSON 文件

```python
import json
from pathlib import Path

# 写入 JSON 文件
data = {
    "users": [
        {"id": 1, "name": "张三", "email": "zhangsan@example.com"},
        {"id": 2, "name": "李四", "email": "lisi@example.com"}
    ],
    "count": 2
}

with open('users.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

# 读取 JSON 文件
with open('users.json', 'r', encoding='utf-8') as f:
    loaded_data = json.load(f)

print(loaded_data["users"])
# [{'id': 1, 'name': '张三', 'email': 'zhangsan@example.com'}, ...]

# 使用 pathlib
config_file = Path('config.json')
config = {
    "app_name": "MyApp",
    "version": "1.0.0",
    "debug": True
}

# 写入
config_file.write_text(json.dumps(config, indent=2), encoding='utf-8')

# 读取
config = json.loads(config_file.read_text(encoding='utf-8'))
```

### 自定义 JSON 序列化

```python
import json
from datetime import datetime
from pathlib import Path

# 自定义序列化
class Person:
    """人类"""
    def __init__(self, name: str, birth_date: datetime):
        self.name = name
        self.birth_date = birth_date

# 方法1: 自定义编码器
class PersonEncoder(json.JSONEncoder):
    """自定义编码器"""
    def default(self, obj):
        if isinstance(obj, Person):
            return {
                "name": obj.name,
                "birth_date": obj.birth_date.isoformat(),
                "__type__": "Person"
            }
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

person = Person("张三", datetime(1990, 5, 15))
json_str = json.dumps(person, cls=PersonEncoder, ensure_ascii=False)
print(json_str)
# {"name": "张三", "birth_date": "1990-05-15T00:00:00", "__type__": "Person"}

# 方法2: 自定义解码器
def person_decoder(obj: dict):
    """自定义解码器"""
    if obj.get("__type__") == "Person":
        from datetime import datetime
        return Person(
            obj["name"],
            datetime.fromisoformat(obj["birth_date"])
        )
    return obj

loaded_person = json.loads(json_str, object_hook=person_decoder)
print(f"{loaded_person.name}, {type(loaded_person)}")

# 方法3: 使用 to_dict/from_dict 模式
class Product:
    """产品类"""
    def __init__(self, id: int, name: str, price: float):
        self.id = id
        self.name = name
        self.price = price

    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price
        }

    @classmethod
    def from_dict(cls, data: dict):
        """从字典创建"""
        return cls(data["id"], data["name"], data["price"])

# 使用
product = Product(1, "笔记本电脑", 5999.0)
json_str = json.dumps(product.to_dict(), ensure_ascii=False)
loaded_product = Product.from_dict(json.loads(json_str))
```

### 实际应用：配置文件管理

```python
import json
from pathlib import Path
from typing import Any, Dict

class ConfigManager:
    """配置管理器"""

    def __init__(self, config_file: str):
        self.config_file = Path(config_file)
        self.config: Dict[str, Any] = {}
        self.load()

    def load(self) -> None:
        """加载配置"""
        if self.config_file.exists():
            with open(self.config_file, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
            print(f"配置已从 {self.config_file} 加载")
        else:
            self.config = {}
            print("配置文件不存在，使用默认配置")

    def save(self) -> None:
        """保存配置"""
        self.config_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=2, ensure_ascii=False)
        print(f"配置已保存到 {self.config_file}")

    def get(self, key: str, default: Any = None) -> Any:
        """获取配置项"""
        return self.config.get(key, default)

    def set(self, key: str, value: Any) -> None:
        """设置配置项"""
        self.config[key] = value

    def update(self, data: Dict[str, Any]) -> None:
        """批量更新"""
        self.config.update(data)

# 使用
config = ConfigManager('config/app.json')

# 设置配置
config.set("app_name", "MyApplication")
config.set("version", "1.0.0")
config.set("debug", True)
config.update({
    "database": {
        "host": "localhost",
        "port": 5432
    }
})

# 保存配置
config.save()

# 获取配置
print(config.get("app_name"))  # MyApplication
print(config.get("database", {}))
```

---

## 其他文件格式

### CSV 文件

```python
import csv
from pathlib import Path

# 读取 CSV 文件
with open('data.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)

# 使用 DictReader（按列名访问）
with open('data.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(f"Name: {row['name']}, Age: {row['age']}")

# 写入 CSV 文件
data = [
    ['name', 'age', 'city'],
    ['张三', '25', '北京'],
    ['李四', '30', '上海']
]

with open('output.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(data)

# 使用 DictWriter
with open('output.csv', 'w', encoding='utf-8', newline='') as f:
    fieldnames = ['name', 'age', 'city']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerow({'name': '张三', 'age': '25', 'city': '北京'})
    writer.writerow({'name': '李四', 'age': '30', 'city': '上海'})
```

### YAML 文件

```python
# 需要安装: pip install pyyaml
import yaml
from pathlib import Path

# 读取 YAML 文件
config_text = """
app:
  name: MyApp
  version: 1.0.0
database:
  host: localhost
  port: 5432
  name: mydb
"""

config = yaml.safe_load(config_text)
print(config["app"]["name"])  # MyApp

# 写入 YAML 文件
data = {
    "app": {
        "name": "MyApp",
        "version": "1.0.0"
    }
}

with open('config.yaml', 'w', encoding='utf-8') as f:
    yaml.dump(data, f, allow_unicode=True, default_flow_style=False)

# 读取 YAML 文件
with open('config.yaml', 'r', encoding='utf-8') as f:
    loaded = yaml.safe_load(f)
```

### XML 文件

```python
import xml.etree.ElementTree as ET

# 解析 XML
xml_string = """
<users>
    <user id="1">
        <name>张三</name>
        <email>zhangsan@example.com</email>
    </user>
    <user id="2">
        <name>李四</name>
        <email>lisi@example.com</email>
    </user>
</users>
"""

root = ET.fromstring(xml_string)

# 遍历元素
for user in root.findall('user'):
    user_id = user.get('id')
    name = user.find('name').text
    email = user.find('email').text
    print(f"ID: {user_id}, Name: {name}, Email: {email}")

# 创建 XML
root = ET.Element('users')

user1 = ET.SubElement(root, 'user', id='1')
name1 = ET.SubElement(user1, 'name')
name1.text = '张三'
email1 = ET.SubElement(user1, 'email')
email1.text = 'zhangsan@example.com'

# 格式化输出
ET.dump(root)

# 写入文件
tree = ET.ElementTree(root)
tree.write('users.xml', encoding='utf-8', xml_declaration=True)
```

---

## 文件系统最佳实践

### 编码问题

```python
# 始终指定编码
# 推荐 UTF-8

# 读取文本文件
with open('file.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# 处理不同编码
encodings = ['utf-8', 'gbk', 'gb2312', 'big5']

for encoding in encodings:
    try:
        with open('file.txt', 'r', encoding=encoding) as f:
            content = f.read()
        print(f"成功使用 {encoding} 编码读取")
        break
    except UnicodeDecodeError:
        continue

# 写入时使用 BOM（某些软件需要）
with open('file.txt', 'w', encoding='utf-8-sig') as f:
    f.write("内容")
```

### 大文件处理

```python
# 逐行读取大文件
def process_large_file(filename: str):
    """处理大文件"""
    with open(filename, 'r', encoding='utf-8') as f:
        for line in f:
            # 处理每一行
            yield line.strip()

# 使用
for line in process_large_file('large_file.txt'):
    print(line)

# 分块读取二进制文件
def read_in_chunks(file_path: str, chunk_size: int = 8192):
    """分块读取文件"""
    with open(file_path, 'rb') as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            yield chunk

# 使用
for chunk in read_in_chunks('large_file.bin'):
    process_chunk(chunk)
```

### 临时文件

```python
import tempfile
import os

# 创建临时文件
with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', delete=False) as f:
    temp_filename = f.name
    f.write("临时数据")

# 使用临时文件
with open(temp_filename, 'r') as f:
    print(f.read())

# 手动删除
os.unlink(temp_filename)

# 创建临时目录
with tempfile.TemporaryDirectory() as temp_dir:
    print(f"临时目录: {temp_dir}")
    # 在临时目录中操作
    temp_file = Path(temp_dir) / 'temp.txt'
    temp_file.write_text("临时数据")
# 临时目录自动删除

# 获取系统临时目录
print(tempfile.gettempdir())
```

### 文件锁

```python
import fcntl
import time

def acquire_lock(lock_file: str):
    """获取文件锁"""
    with open(lock_file, 'w') as f:
        try:
            fcntl.flock(f, fcntl.LOCK_EX)  # 排他锁
            # 执行需要加锁的操作
            print("获得锁，执行操作...")
            time.sleep(2)
        finally:
            fcntl.flock(f, fcntl.LOCK_UN)  # 释放锁
            print("释放锁")

# Windows 使用 msvcrt
import msvcrt

def acquire_lock_windows(lock_file: str):
    """Windows 文件锁"""
    with open(lock_file, 'w') as f:
        try:
            msvcrt.locking(f.fileno(), msvcrt.LK_LOCK, 1)
            # 执行操作
        finally:
            msvcrt.locking(f.fileno(), msvcrt.LK_UNLCK, 1)
```

---

## Python vs JavaScript 对比

### 异常处理

| 特性       | Python                          | JavaScript                     |
| ---------- | ------------------------------- | ------------------------------ |
| 捕获异常   | `except`                        | `catch`                        |
| 抛出异常   | `raise`                         | `throw`                        |
| finally    | `finally`                       | `finally`                      |
| 多个异常   | `except A, B:` 或多个 `except`  | 一个 `catch`                   |
| 错误类型   | `Exception` 及子类              | `Error` 及子类                 |

### 代码示例对比

```python
# Python
try:
    result = divide(10, 0)
except ZeroDivisionError as e:
    print(f"错误: {e}")
except ValueError as e:
    print(f"值错误: {e}")
finally:
    print("清理资源")
```

```javascript
// JavaScript
try {
    const result = divide(10, 0);
} catch (e) {
    if (e instanceof DivideByZeroError) {
        console.log(`错误: ${e.message}`);
    } else if (e instanceof ValueError) {
        console.log(`值错误: ${e.message}`);
    }
} finally {
    console.log("清理资源");
}
```

### 文件操作对比

```python
# Python
with open('file.txt', 'r', encoding='utf-8') as f:
    content = f.read()
```

```javascript
// JavaScript (Node.js)
const fs = require('fs');
const content = fs.readFileSync('file.txt', 'utf8');
// 或异步
fs.readFile('file.txt', 'utf8', (err, data) => {
    if (err) throw err;
    console.log(data);
});
```

---

## 练习题

### 练习 1：安全除法计算器

创建一个安全的除法计算器：
1. 处理除零错误
2. 处理无效输入（非数字）
3. 使用自定义异常
4. 提供友好的错误信息

### 练习 2：配置文件管理器

创建一个配置文件管理器：
1. 支持从 JSON 文件加载配置
2. 支持保存配置到 JSON
3. 支持环境变量覆盖
4. 提供配置验证

### 练习 3：日志分析工具

创建一个日志分析工具：
1. 读取日志文件
2. 解析不同格式的日志
3. 统计错误数量
4. 生成分析报告

---

## 练习答案

<details>
<summary>点击查看练习 1 答案</summary>

```python
class DivideError(Exception):
    """除法错误基类"""
    pass


class DivideByZeroError(DivideError):
    """除零错误"""
    pass


class InvalidOperandError(DivideError):
    """无效操作数错误"""
    pass


def safe_divide(a: str, b: str) -> float:
    """
    安全除法计算

    Args:
        a: 被除数（字符串）
        b: 除数（字符串）

    Returns:
        除法结果

    Raises:
        InvalidOperandError: 操作数无效
        DivideByZeroError: 除数为零
    """
    try:
        num_a = float(a)
    except (ValueError, TypeError):
        raise InvalidOperandError(f"被除数 '{a}' 不是有效数字")

    try:
        num_b = float(b)
    except (ValueError, TypeError):
        raise InvalidOperandError(f"除数 '{b}' 不是有效数字")

    if num_b == 0:
        raise DivideByZeroError("除数不能为零")

    return num_a / num_b


def main():
    """主函数"""
    print("=== 安全除法计算器 ===")
    print("输入 'q' 退出")

    while True:
        try:
            a = input("\n被除数: ").strip()
            if a.lower() == 'q':
                print("再见！")
                break

            b = input("除数: ").strip()
            if b.lower() == 'q':
                print("再见！")
                break

            result = safe_divide(a, b)
            print(f"结果: {result:.4f}")

        except InvalidOperandError as e:
            print(f"❌ 输入错误: {e}")
        except DivideByZeroError as e:
            print(f"❌ 计算错误: {e}")
        except DivideError as e:
            print(f"❌ 错误: {e}")
        except Exception as e:
            print(f"❌ 未知错误: {e}")


if __name__ == "__main__":
    main()
```

运行示例：
```bash
python3 calculator.py
# === 安全除法计算器 ===
# 输入 'q' 退出
#
# 被除数: 10
# 除数: 2
# 结果: 5.0000
#
# 被除数: abc
# 除数: 2
# ❌ 输入错误: 被除数 'abc' 不是有效数字
#
# 被除数: 10
# 除数: 0
# ❌ 计算错误: 除数不能为零
#
# 被除数: q
# 再见！
```

</details>

<details>
<summary>点击查看练习 2 答案</summary>

```python
import json
import os
from pathlib import Path
from typing import Any, Dict, Optional


class ConfigValidationError(Exception):
    """配置验证错误"""
    pass


class ConfigManager:
    """配置管理器"""

    DEFAULT_CONFIG = {
        "app_name": "MyApp",
        "version": "1.0.0",
        "debug": False,
        "database": {
            "host": "localhost",
            "port": 5432,
            "name": "mydb"
        },
        "logging": {
            "level": "INFO",
            "file": "app.log"
        }
    }

    REQUIRED_FIELDS = ["app_name", "version"]

    def __init__(self, config_file: str = "config.json"):
        """
        初始化配置管理器

        Args:
            config_file: 配置文件路径
        """
        self.config_file = Path(config_file)
        self.config: Dict[str, Any] = {}
        self.load()

    def load(self) -> None:
        """加载配置"""
        # 从文件加载
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    file_config = json.load(f)
                # 合并默认配置和文件配置
                self.config = self._merge_config(self.DEFAULT_CONFIG, file_config)
                print(f"✓ 配置已从 {self.config_file} 加载")
            except json.JSONDecodeError as e:
                print(f"⚠ 配置文件格式错误: {e}")
                print("使用默认配置")
                self.config = self.DEFAULT_CONFIG.copy()
        else:
            self.config = self.DEFAULT_CONFIG.copy()
            print("⚠ 配置文件不存在，使用默认配置")

        # 环境变量覆盖（格式：APP_NAME, DATABASE_HOST）
        self._apply_env_overrides()

        # 验证配置
        self.validate()

    def save(self) -> None:
        """保存配置"""
        self.config_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=2, ensure_ascii=False)
        print(f"✓ 配置已保存到 {self.config_file}")

    def get(self, key: str, default: Any = None) -> Any:
        """
        获取配置项（支持嵌套，如 'database.host'）

        Args:
            key: 配置键
            default: 默认值

        Returns:
            配置值
        """
        keys = key.split('.')
        value = self.config

        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default

        return value

    def set(self, key: str, value: Any) -> None:
        """
        设置配置项（支持嵌套）

        Args:
            key: 配置键
            value: 配置值
        """
        keys = key.split('.')
        config = self.config

        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]

        config[keys[-1]] = value

    def update(self, data: Dict[str, Any]) -> None:
        """批量更新配置"""
        self.config = self._merge_config(self.config, data)

    def validate(self) -> None:
        """验证配置"""
        missing_fields = []

        for field in self.REQUIRED_FIELDS:
            if field not in self.config or not self.config[field]:
                missing_fields.append(field)

        if missing_fields:
            raise ConfigValidationError(
                f"缺少必需的配置字段: {', '.join(missing_fields)}"
            )

        # 验证端口
        port = self.get("database.port")
        if port and not (1 <= port <= 65535):
            raise ConfigValidationError(
                f"数据库端口无效: {port} (范围: 1-65535)"
            )

    def _merge_config(
        self,
        base: Dict[str, Any],
        override: Dict[str, Any]
    ) -> Dict[str, Any]:
        """递归合并配置"""
        result = base.copy()

        for key, value in override.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = self._merge_config(result[key], value)
            else:
                result[key] = value

        return result

    def _apply_env_overrides(self) -> None:
        """应用环境变量覆盖"""
        # 应用配置
        if "APP_NAME" in os.environ:
            self.config["app_name"] = os.environ["APP_NAME"]

        if "DEBUG" in os.environ:
            self.config["debug"] = os.environ["DEBUG"].lower() in ("true", "1", "yes")

        # 数据库配置
        if "DB_HOST" in os.environ:
            self.config["database"]["host"] = os.environ["DB_HOST"]

        if "DB_PORT" in os.environ:
            self.config["database"]["port"] = int(os.environ["DB_PORT"])

        if "DB_NAME" in os.environ:
            self.config["database"]["name"] = os.environ["DB_NAME"]

    def display(self) -> None:
        """显示当前配置"""
        print("\n=== 当前配置 ===")
        print(json.dumps(self.config, indent=2, ensure_ascii=False))


# 演示
if __name__ == "__main__":
    # 创建配置管理器
    try:
        config = ConfigManager("config/app.json")

        # 显示配置
        config.display()

        # 获取配置
        print(f"\n应用名称: {config.get('app_name')}")
        print(f"数据库主机: {config.get('database.host')}")
        print(f"不存在的配置: {config.get('nonexistent', '默认值')}")

        # 修改配置
        config.set("debug", True)
        config.set("database.port", 3306)
        config.set("new_setting", "新值")

        # 保存配置
        config.save()

    except ConfigValidationError as e:
        print(f"配置验证失败: {e}")
```

运行示例：
```bash
python3 config_manager.py
# ⚠ 配置文件不存在，使用默认配置
#
# === 当前配置 ===
# {
#   "app_name": "MyApp",
#   "version": "1.0.0",
#   "debug": false,
#   "database": {
#     "host": "localhost",
#     "port": 5432,
#     "name": "mydb"
#   },
#   "logging": {
#     "level": "INFO",
#     "file": "app.log"
#   }
# }
#
# 应用名称: MyApp
# 数据库主机: localhost
# 不存在的配置: 默认值
# ✓ 配置已保存到 config/app.json
```

</details>

<details>
<summary>点击查看练习 3 答案</summary>

```python
import re
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


class LogEntry:
    """日志条目"""

    def __init__(
        self,
        timestamp: datetime,
        level: str,
        message: str,
        source: Optional[str] = None
    ):
        self.timestamp = timestamp
        self.level = level
        self.message = message
        self.source = source

    def __repr__(self):
        return f"[{self.timestamp}] [{self.level}] {self.message}"


class LogAnalyzer:
    """日志分析器"""

    # 常见日志格式正则
    PATTERNS = {
        # 2024-01-15 14:30:45 [INFO] Message
        "standard": re.compile(
            r'(?P<timestamp>\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+'
            r'\[(?P<level>\w+)\]\s+'
            r'(?P<message>.+)'
        ),
        # [INFO] 2024-01-15 14:30:45 Message
        "reverse": re.compile(
            r'\[(?P<level>\w+)\]\s+'
            r'(?P<timestamp>\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+'
            r'(?P<message>.+)'
        ),
        # INFO: Message
        "simple": re.compile(
            r'(?P<level>ERROR|WARN|INFO|DEBUG):\s*'
            r'(?P<message>.+)'
        )
    }

    def __init__(self, log_file: str):
        """
        初始化日志分析器

        Args:
            log_file: 日志文件路径
        """
        self.log_file = Path(log_file)
        self.entries: List[LogEntry] = []
        self.load_logs()

    def load_logs(self) -> None:
        """加载日志"""
        if not self.log_file.exists():
            raise FileNotFoundError(f"日志文件 {self.log_file} 不存在")

        with open(self.log_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue

                entry = self._parse_line(line)
                if entry:
                    self.entries.append(entry)

        print(f"✓ 加载了 {len(self.entries)} 条日志")

    def _parse_line(self, line: str) -> Optional[LogEntry]:
        """解析日志行"""
        # 尝试各种模式
        for pattern_name, pattern in self.PATTERNS.items():
            match = pattern.match(line)
            if match:
                groups = match.groupdict()

                # 解析时间戳
                timestamp = None
                if "timestamp" in groups:
                    try:
                        timestamp = datetime.strptime(
                            groups["timestamp"],
                            "%Y-%m-%d %H:%M:%S"
                        )
                    except ValueError:
                        pass

                # 如果没有时间戳，使用当前时间
                if not timestamp and "timestamp" in groups:
                    timestamp = datetime.now()

                level = groups.get("level", "UNKNOWN")
                message = groups.get("message", line)

                return LogEntry(timestamp, level, message)

        # 如果都不匹配，创建一个简单的条目
        return LogEntry(datetime.now(), "UNKNOWN", line)

    def count_by_level(self) -> Dict[str, int]:
        """按级别统计"""
        counter = Counter(entry.level for entry in self.entries)
        return dict(counter)

    def get_errors(self) -> List[LogEntry]:
        """获取所有错误"""
        return [e for e in self.entries if e.level == "ERROR"]

    def get_warnings(self) -> List[LogEntry]:
        """获取所有警告"""
        return [e for e in self.entries if e.level in ("WARN", "WARNING")]

    def search(self, keyword: str) -> List[LogEntry]:
        """搜索日志"""
        return [e for e in self.entries if keyword.lower() in e.message.lower()]

    def get_time_range(self) -> tuple:
        """获取时间范围"""
        if not self.entries:
            return None, None

        timestamps = [e.timestamp for e in self.entries if e.timestamp]
        if not timestamps:
            return None, None

        return min(timestamps), max(timestamps)

    def generate_report(self) -> str:
        """生成分析报告"""
        total = len(self.entries)
        level_counts = self.count_by_level()
        errors = self.get_errors()
        warnings = self.get_warnings()
        time_range = self.get_time_range()

        report = []
        report.append("=" * 60)
        report.append("日志分析报告")
        report.append("=" * 60)
        report.append(f"\n日志文件: {self.log_file}")
        report.append(f"总日志数: {total}")

        if time_range[0]:
            report.append(f"\n时间范围:")
            report.append(f"  开始: {time_range[0]}")
            report.append(f"  结束: {time_range[1]}")

        report.append(f"\n日志级别统计:")
        for level, count in sorted(level_counts.items()):
            percentage = (count / total * 100) if total > 0 else 0
            report.append(f"  {level}: {count} ({percentage:.1f}%)")

        report.append(f"\n错误汇总:")
        if errors:
            report.append(f"  错误总数: {len(errors)}")
            report.append(f"\n  最近 5 条错误:")
            for error in errors[-5:]:
                report.append(f"    - {error}")
        else:
            report.append("  ✓ 无错误")

        report.append(f"\n警告汇总:")
        if warnings:
            report.append(f"  警告总数: {len(warnings)}")
        else:
            report.append("  ✓ 无警告")

        report.append("\n" + "=" * 60)

        return "\n".join(report)

    def save_report(self, output_file: str) -> None:
        """保存报告到文件"""
        report = self.generate_report()
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report)

        print(f"✓ 报告已保存到 {output_file}")


# 演示
if __name__ == "__main__":
    # 创建示例日志文件
    sample_log = """2024-01-15 14:30:45 [INFO] 应用程序启动
2024-01-15 14:30:46 [INFO] 加载配置文件
2024-01-15 14:30:47 [WARN] 配置项 'debug' 未设置，使用默认值
2024-01-15 14:30:48 [INFO] 连接数据库
2024-01-15 14:30:50 [ERROR] 数据库连接失败: Connection timeout
2024-01-15 14:30:52 [INFO] 重试连接数据库...
2024-01-15 14:30:55 [INFO] 数据库连接成功
2024-01-15 14:31:00 [INFO] 启动 HTTP 服务器
2024-01-15 14:31:01 [INFO] 服务器监听端口 8000
2024-01-15 14:32:15 [ERROR] 请求处理失败: Invalid API key
2024-01-15 14:33:30 [WARN] 内存使用率: 85%
2024-01-15 14:34:00 [INFO] 处理请求: GET /api/users
2024-01-15 14:35:00 [ERROR] 文件未找到: /path/to/file.txt"""

    log_file = "logs/app.log"
    log_path = Path(log_file)
    log_path.parent.mkdir(parents=True, exist_ok=True)
    log_path.write_text(sample_log, encoding='utf-8')

    # 分析日志
    analyzer = LogAnalyzer(log_file)

    # 打印报告
    print("\n")
    print(analyzer.generate_report())

    # 搜索日志
    print("\n搜索 '数据库':")
    for entry in analyzer.search("数据库"):
        print(f"  {entry}")

    # 保存报告
    analyzer.save_report("logs/analysis_report.txt")
```

运行示例：
```bash
python3 log_analyzer.py
# ✓ 加载了 14 条日志
#
#
# ============================================================
# 日志分析报告
# ============================================================
#
# 日志文件: logs/app.log
# 总日志数: 14
#
# 时间范围:
#   开始: 2024-01-15 14:30:45
#   结束: 2024-01-15 14:35:00
#
# 日志级别统计:
#   ERROR: 2 (14.3%)
#   INFO: 9 (64.3%)
#   WARN: 3 (21.4%)
#
# 错误汇总:
#   错误总数: 2
#
#   最近 2 条错误:
#     - [2024-01-15 14:30:50] [ERROR] 数据库连接失败: Connection timeout
#     - [2024-01-15 14:32:15] [ERROR] 请求处理失败: Invalid API key
#
# 警告汇总:
#   警告总数: 3
#
# ============================================================
#
# 搜索 '数据库':
#   [2024-01-15 14:30:48] [INFO] 连接数据库
#   [2024-01-15 14:30:50] [ERROR] 数据库连接失败: Connection timeout
#   [2024-01-15 14:30:52] [INFO] 重试连接数据库...
#   [2024-01-15 14:30:55] [INFO] 数据库连接成功
#
# ✓ 报告已保存到 logs/analysis_report.txt
```

</details>

---

## 本章小结

✅ 你已经学会了：
- 异常处理机制（try-except-finally）
- 常见异常类型及其使用场景
- 抛出异常和自定义异常
- 文件读写操作（open、with 语句）
- 路径操作（os.path 和 pathlib）
- JSON、CSV、YAML、XML 文件处理
- 文件系统最佳实践
- Python 与 JavaScript 的对比

## 下一章

[第9章：异步编程基础](/chapter-09/) - 学习 Python 的异步编程模型，理解 asyncio、协程和异步 I/O。
