# 第2章：基础语法与数据类型

本章将深入学习 Python 的基础语法和数据类型。作为前端开发者，你会发现 Python 的许多概念与 JavaScript 相似，但也有一些重要的差异。

## 学习目标

- 理解 Python 变量的动态类型特性
- 掌握基本数据类型（int, float, str, bool）
- 学习类型提示（Type Hints）
- 掌握类型转换和字符串操作
- 理解 None 类型

## 目录

1. [变量与命名规则](#变量与命名规则)
2. [基本数据类型](#基本数据类型)
3. [类型提示（Type Hints）](#类型提示type-hints)
4. [类型转换](#类型转换)
5. [字符串操作](#字符串操作)
6. [None 类型](#none-类型)
7. [Python vs JavaScript 对比](#python-vs-javascript-对比)
8. [练习题](#练习题)
9. [练习答案](#练习答案)

---

## 变量与命名规则

### 变量声明

Python 是动态类型语言，不需要显式声明变量类型：

```python
# 直接赋值，Python 会自动推断类型
name = "张三"        # str
age = 25             # int
height = 1.75        # float
is_student = True    # bool
```

::: tip 与 JavaScript 对比
```javascript
// JavaScript
let name = "张三";
const age = 25;
let height = 1.75;
let isStudent = true;
```
:::

### 命名规则

```python
# ✅ 正确的命名
user_name = "张三"      # 蛇形命名法（推荐）
userName = "张三"        # 驼峰命名法
_private_var = "私有"   # 约定：以下划线开头表示私有
CONSTANT_VALUE = 100   # 约定：全大写表示常量

# ❌ 错误的命名
2user = "错误"          # 不能以数字开头
user-name = "错误"       # 不能包含连字符
class = "错误"          # 不能使用关键字
```

### 关键字

Python 保留的关键字不能用作变量名：

```python
import keyword

print(keyword.kwlist)
# 输出：['False', 'None', 'True', 'and', 'as', 'assert', 'async', 
#        'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 
#        'else', 'except', 'finally', 'for', 'from', 'global', 'if', 
#        'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 
#        'pass', 'raise', 'return', 'try', 'while', 'with', 'yield']
```

---

## 基本数据类型

### 整数（int）

```python
# 整数
x = 42
y = -10
z = 0

# 大整数（自动处理，无精度问题）
big_number = 123456789012345678901234567890

# 不同进制的表示
binary = 0b1010      # 二进制：10
octal = 0o12         # 八进制：10
hexadecimal = 0x0a   # 十六进制：10

# 整数运算
print(10 + 5)        # 加法：15
print(10 - 5)        # 减法：5
print(10 * 5)        # 乘法：50
print(10 / 3)        # 除法（返回浮点数）：3.333...
print(10 // 3)       # 整除：3
print(10 % 3)        # 取模：1
print(2 ** 3)        # 幂运算：8
```

### 浮点数（float）

```python
# 浮点数
price = 19.99
temperature = -5.5
scientific = 1.23e-4  # 科学计数法：0.000123

# 浮点数运算（注意精度问题）
print(0.1 + 0.2)      # 输出：0.30000000000000004
print(round(0.1 + 0.2, 2))  # 输出：0.3

# 解决浮点数精度问题的方法
from decimal import Decimal
result = Decimal('0.1') + Decimal('0.2')
print(result)         # 输出：0.3
```

### 字符串（str）

```python
# 字符串定义
s1 = "双引号字符串"
s2 = '单引号字符串'
s3 = """三引号字符串
可以跨行"""

# 转义字符
path = "C:\\Users\\name"  # 使用反斜杠
path = r"C:\Users\name"   # 原始字符串（推荐）

# 字符串拼接
name = "Python"
greeting = "Hello, " + name  # 使用 + 运算符
message = f"Hello, {name}"   # 使用 f-string（推荐）

# 字符串重复
print("=" * 20)  # 输出：====================

# 字符串长度
print(len("Hello"))  # 输出：5

# 字符串索引和切片
text = "Python"
print(text[0])      # 输出：P
print(text[-1])     # 输出：n（最后一个字符）
print(text[0:3])    # 输出：Pyt
print(text[:3])     # 输出：Pyt
print(text[3:])     # 输出：hon
print(text[::2])    # 输出：Pto（步长为2）
print(text[::-1])   # 输出：nohtyP（反转）
```

### 布尔值（bool）

```python
# 布尔值
is_true = True
is_false = False

# 布尔运算
print(True and False)  # False
print(True or False)   # True
print(not True)        # False

# 比较运算符
print(5 > 3)           # True
print(5 == 5)          # True
print(5 != 3)          # True
print(5 >= 5)          # True

# 真值测试
print(bool(1))         # True
print(bool(0))         # False
print(bool(""))        # False
print(bool("hello"))   # True
print(bool([]))        # False
print(bool([1, 2]))    # True
```

---

## 类型提示（Type Hints）

Python 3.5+ 支持类型提示，类似于 TypeScript 的类型系统。这是 Python 向静态类型靠拢的重要特性。

### 基本类型提示

```python
# 基本类型提示
def greet(name: str) -> str:
    return f"Hello, {name}!"

def add(a: int, b: int) -> int:
    return a + b

def get_user_info(user_id: int) -> dict:
    return {"id": user_id, "name": "张三"}

# 使用
result = greet("Python")
print(result)  # 输出：Hello, Python!
```

### 类型模块

```python
from typing import List, Dict, Optional, Union

# 列表类型
numbers: List[int] = [1, 2, 3, 4, 5]
names: List[str] = ["Alice", "Bob", "Charlie"]

# 字典类型
user: Dict[str, Union[str, int]] = {
    "name": "张三",
    "age": 25
}

# 可选类型
def find_user(user_id: int) -> Optional[Dict]:
    # 可能返回 None 或字典
    if user_id == 1:
        return {"id": 1, "name": "张三"}
    return None

# 联合类型
value: Union[int, str] = 42  # 可以是 int 或 str
value = "hello"  # 也可以是 str
```

### 类型别名

```python
from typing import List, Dict

# 定义类型别名
UserID = int
UserName = str
UserInfo = Dict[str, Union[str, int]]
UserList = List[UserInfo]

# 使用类型别名
def get_users() -> UserList:
    return [
        {"id": 1, "name": "张三", "age": 25},
        {"id": 2, "name": "李四", "age": 30}
    ]
```

### 类型检查工具

```bash
# 安装 mypy
pip install mypy

# 类型检查
mypy your_file.py
```

::: tip 与 TypeScript 对比
```python
# Python 类型提示
def add(a: int, b: int) -> int:
    return a + b

# TypeScript
function add(a: number, b: number): number {
    return a + b;
}
```
:::

---

## 类型转换

### 隐式类型转换

```python
# Python 会自动进行某些类型转换
result = 5 + 3.14  # int + float -> float: 8.14
result = "Hello " + str(123)  # 需要显式转换
```

### 显式类型转换

```python
# 转换为整数
print(int(3.14))        # 输出：3
print(int("42"))        # 输出：42
print(int("3.14"))      # 报错：ValueError
print(int("42", 8))     # 输出：34（八进制转十进制）

# 转换为浮点数
print(float(42))        # 输出：42.0
print(float("3.14"))    # 输出：3.14

# 转换为字符串
print(str(42))          # 输出："42"
print(str(3.14))        # 输出："3.14"

# 转换为布尔值
print(bool(0))          # 输出：False
print(bool(42))         # 输出：True
print(bool(""))         # 输出：False
print(bool("hello"))    # 输出：True

# 列表、元组、集合之间的转换
numbers = [1, 2, 3]
print(tuple(numbers))   # 输出：(1, 2, 3)
print(set(numbers))     # 输出：{1, 2, 3}
```

---

## 字符串操作

### 字符串方法

```python
text = "Hello, World!"

# 大小写转换
print(text.upper())              # 输出：HELLO, WORLD!
print(text.lower())              # 输出：hello, world!
print(text.title())              # 输出：Hello, World!
print(text.capitalize())         # 输出：Hello, world!

# 去除空白
text = "  Hello  "
print(text.strip())              # 输出：Hello
print(text.lstrip())             # 输出：Hello  
print(text.rstrip())             # 输出：  Hello

# 查找和替换
print(text.find("lo"))           # 输出：3（索引位置）
print(text.replace("World", "Python"))  # 输出：Hello, Python!

# 分割和连接
text = "apple,banana,orange"
fruits = text.split(",")         # 输出：['apple', 'banana', 'orange']
print(",".join(fruits))          # 输出：apple,banana,orange

# 检查字符串
print(text.startswith("apple"))  # 输出：True
print(text.endswith("orange"))   # 输出：True
print("hello".isalpha())         # 输出：True（全是字母）
print("123".isdigit())           # 输出：True（全是数字）
print("123abc".isalnum())        # 输出：True（字母和数字）
```

### 字符串格式化

```python
# f-string（Python 3.6+，推荐）
name = "Python"
version = 3.11
print(f"Welcome to {name} {version}")  # 输出：Welcome to Python 3.11

# 格式化选项
pi = 3.1415926
print(f"Pi: {pi:.2f}")           # 输出：Pi: 3.14
print(f"Pi: {pi:.4f}")           # 输出：Pi: 3.1416
print(f"Pi: {pi:.2e}")           # 输出：Pi: 3.14e+00

# 格式化字符串（旧式）
name = "Python"
print("Welcome to %s" % name)   # 输出：Welcome to Python

# str.format() 方法
print("Welcome to {}".format(name))  # 输出：Welcome to Python
print("Welcome to {name}".format(name=name))  # 输出：Welcome to Python
print("Welcome to {0} {1}".format("Python", 3.11))  # 输出：Welcome to Python 3.11
```

---

## None 类型

`None` 是 Python 的空值，类似于 JavaScript 的 `null` 或 `undefined`。

```python
# None 表示没有值
result = None
print(result)                    # 输出：None
print(type(result))              # 输出：<class 'NoneType'>

# None 的使用
def find_user(user_id: int) -> Optional[Dict]:
    if user_id == 1:
        return {"id": 1, "name": "张三"}
    return None  # 用户不存在

# 检查 None
result = find_user(999)
if result is None:
    print("用户不存在")
else:
    print(f"用户: {result['name']}")

# None vs 空字符串 vs False
print(bool(None))                # 输出：False
print(bool(""))                   # 输出：False
print(bool(False))                # 输出：False

# 但它们是不同的
print(None == "")                 # 输出：False
print(None == False)              # 输出：False
```

::: tip 重要提示
在 Python 中，检查 `None` 应该使用 `is None` 或 `is not None`，而不是 `== None`。
:::

---

## Python vs JavaScript 对比

### 变量声明

| 特性       | Python | JavaScript                 |
| ---------- | ------ | -------------------------- |
| 声明关键字 | 无     | `let`, `const`, `var`      |
| 变量提升   | 无     | 有（`var`）                |
| 块级作用域 | 有     | `let`/`const` 有，`var` 无 |
| 重复声明   | 不允许 | `var` 允许                 |

### 数据类型

| Python  | JavaScript          | 说明                    |
| ------- | ------------------- | ----------------------- |
| `int`   | `number`            | Python 区分整数和浮点数 |
| `float` | `number`            | Python 浮点数           |
| `str`   | `string`            | 字符串                  |
| `bool`  | `boolean`           | 布尔值                  |
| `None`  | `null`, `undefined` | 空值                    |
| `list`  | `Array`             | 列表/数组               |
| `dict`  | `Object`            | 字典/对象               |
| `tuple` | 无                  | 元组                    |
| `set`   | `Set`               | 集合                    |

### 类型系统

| 特性     | Python              | JavaScript | TypeScript |
| -------- | ------------------- | ---------- | ---------- |
| 类型系统 | 动态 + 可选类型提示 | 动态       | 静态       |
| 类型检查 | 运行时（mypy 可选） | 运行时     | 编译时     |
| 类型推断 | 有                  | 有限       | 强大       |

---

## 练习题

### 练习 1：类型转换

创建一个程序 `type_conversion.py`：
1. 从用户输入获取一个数字字符串
2. 将其转换为整数并计算平方
3. 将其转换为浮点数并计算平方根
4. 使用 f-string 格式化输出结果

### 练习 2：字符串操作

创建一个程序 `string_operations.py`：
1. 定义一个包含姓名和年龄的字符串
2. 使用字符串方法提取姓名和年龄
3. 将姓名转换为首字母大写
4. 格式化输出信息

### 练习 3：类型提示

创建一个程序 `type_hints.py`：
1. 定义一个函数，接收姓名和年龄参数
2. 使用类型提示标注参数和返回值
3. 返回格式化的字符串
4. 处理年龄为 None 的情况

---

## 练习答案

<details>
<summary>点击查看练习 1 答案</summary>

```python
# type_conversion.py
import math

# 获取用户输入
input_str = input("请输入一个数字: ")

try:
    # 转换为整数并计算平方
    integer_num = int(input_str)
    square = integer_num ** 2
    print(f"整数: {integer_num}, 平方: {square}")
    
    # 转换为浮点数并计算平方根
    float_num = float(input_str)
    square_root = math.sqrt(float_num)
    print(f"浮点数: {float_num}, 平方根: {square_root:.4f}")
    
except ValueError:
    print("错误：请输入有效的数字！")
```

运行示例：
```bash
python3 type_conversion.py
# 输入：16
# 输出：
# 整数: 16, 平方: 256
# 浮点数: 16.0, 平方根: 4.0000
```

</details>

<details>
<summary>点击查看练习 2 答案</summary>

```python
# string_operations.py

# 定义字符串
info = "张三，25岁"

# 使用 split 提取姓名和年龄
parts = info.split("，")
name = parts[0]
age_str = parts[1].replace("岁", "")  # 去掉"岁"

# 提取年龄数字
age = int(age_str)

# 姓名转换为首字母大写
formatted_name = name[0].upper() + name[1:]

# 格式化输出
print("=" * 30)
print(f"姓名: {formatted_name}")
print(f"年龄: {age} 岁")
print(f"明年: {age + 1} 岁")
print("=" * 30)

# 另一种方式（使用正则表达式）
import re

match = re.match(r"(.*)，(\d+)岁", info)
if match:
    name = match.group(1)
    age = int(match.group(2))
    print(f"\n使用正则表达式提取:")
    print(f"姓名: {name}")
    print(f"年龄: {age}")
```

运行示例：
```bash
python3 string_operations.py
# 输出：
# ==============================
# 姓名: 张三
# 年龄: 25 岁
# 明年: 26 岁
# ==============================
```

</details>

<details>
<summary>点击查看练习 3 答案</summary>

```python
# type_hints.py
from typing import Optional

def format_user_info(name: str, age: Optional[int] = None) -> str:
    """
    格式化用户信息
    
    Args:
        name: 用户姓名
        age: 用户年龄（可选）
    
    Returns:
        格式化的用户信息字符串
    """
    if age is None:
        return f"姓名: {name}, 年龄: 未知"
    else:
        return f"姓名: {name}, 年龄: {age} 岁"

# 使用示例
print(format_user_info("张三", 25))
print(format_user_info("李四"))
print(format_user_info(name="王五", age=30))

# 类型提示在函数中的使用
def calculate_discount(price: float, discount_rate: float) -> float:
    """
    计算折扣后的价格
    
    Args:
        price: 原价
        discount_rate: 折扣率（0-1之间）
    
    Returns:
        折扣后的价格
    """
    if discount_rate < 0 or discount_rate > 1:
        raise ValueError("折扣率必须在 0-1 之间")
    
    return price * (1 - discount_rate)

# 使用
original_price = 100.0
discount = 0.2  # 20% 折扣
final_price = calculate_discount(original_price, discount)
print(f"\n原价: ¥{original_price}")
print(f"折扣: {discount * 100}%")
print(f"最终价格: ¥{final_price:.2f}")
```

运行示例：
```bash
python3 type_hints.py
# 输出：
# 姓名: 张三, 年龄: 25 岁
# 姓名: 李四, 年龄: 未知
# 姓名: 王五, 年龄: 30 岁
# 
# 原价: ¥100.0
# 折扣: 20.0%
# 最终价格: ¥80.00
```

</details>

---

## 本章小结

✅ 你已经学会了：
- Python 变量的动态类型特性
- 基本数据类型（int, float, str, bool）
- 类型提示（Type Hints）的使用
- 类型转换的方法
- 字符串的各种操作
- None 类型的使用
- Python 与 JavaScript 的类型系统对比

## 下一章

[第3章：数据结构](/chapter-03/) - 学习 Python 的列表、元组、字典和集合。