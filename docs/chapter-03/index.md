# 第3章：数据结构

Python 提供了四种内置的数据结构：列表（List）、元组（Tuple）、字典（Dict）和集合（Set）。这些数据结构与 JavaScript 的数组、对象和集合有很多相似之处，但也有一些重要的区别。

## 学习目标

- 掌握列表（List）的创建、操作和方法
- 理解元组（Tuple）的特性与使用场景
- 学会使用字典（Dict）存储键值对数据
- 掌握集合（Set）的特性和操作
- 理解可变与不可变的区别

## 目录

1. [列表（List）](#列表list)
2. [元组（Tuple）](#元组tuple)
3. [字典（Dict）](#字典dict)
4. [集合（Set）](#集合set)
5. [列表推导式](#列表推导式)
6. [数据结构选择指南](#数据结构选择指南)
7. [练习题](#练习题)
8. [练习答案](#练习答案)

---

## 列表（List）

列表是 Python 中最常用的数据结构，类似于 JavaScript 的数组。列表是**可变**的有序序列。

### 创建列表

```python
# 空列表
empty_list = []
empty_list = list()

# 包含元素的列表
numbers = [1, 2, 3, 4, 5]
fruits = ["apple", "banana", "orange"]
mixed = [1, "hello", 3.14, True]  # 可以包含不同类型的元素

# 嵌套列表
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
```

### 访问和修改元素

```python
fruits = ["apple", "banana", "orange", "grape"]

# 索引访问（从 0 开始）
print(fruits[0])     # 输出：apple
print(fruits[-1])    # 输出：grape（最后一个元素）

# 切片
print(fruits[1:3])   # 输出：['banana', 'orange']
print(fruits[:2])    # 输出：['apple', 'banana']
print(fruits[2:])    # 输出：['orange', 'grape']
print(fruits[::2])   # 输出：['apple', 'orange']（步长为2）

# 修改元素
fruits[0] = "pear"
print(fruits)        # 输出：['pear', 'banana', 'orange', 'grape']

# 修改切片
fruits[1:3] = ["kiwi", "mango"]
print(fruits)        # 输出：['pear', 'kiwi', 'mango', 'grape']
```

### 列表方法

```python
numbers = [1, 2, 3]

# 添加元素
numbers.append(4)           # 在末尾添加一个元素
print(numbers)              # [1, 2, 3, 4]

numbers.extend([5, 6])      # 在末尾添加多个元素
print(numbers)              # [1, 2, 3, 4, 5, 6]

numbers.insert(0, 0)        # 在指定位置插入元素
print(numbers)              # [0, 1, 2, 3, 4, 5, 6]

# 删除元素
numbers.remove(3)           # 删除指定值的元素
print(numbers)              # [0, 1, 2, 4, 5, 6]

popped = numbers.pop()      # 删除并返回最后一个元素
print(popped)               # 6
print(numbers)              # [0, 1, 2, 4, 5]

del numbers[0]              # 删除指定位置的元素
print(numbers)              # [1, 2, 4, 5]

# 查找元素
print(numbers.index(2))     # 输出：1（元素 2 的索引）
print(2 in numbers)         # 输出：True

# 排序
numbers = [3, 1, 4, 1, 5, 9, 2, 6]
numbers.sort()               # 升序排序（原地修改）
print(numbers)              # [1, 1, 2, 3, 4, 5, 6, 9]

numbers.sort(reverse=True)  # 降序排序
print(numbers)              # [9, 6, 5, 4, 3, 2, 1, 1]

sorted_numbers = sorted(numbers)  # 返回排序后的新列表（不修改原列表）
print(sorted_numbers)        # [1, 1, 2, 3, 4, 5, 6, 9]

# 反转
numbers.reverse()           # 反转列表（原地修改）
print(numbers)              # [1, 9, 6, 5, 4, 3, 2, 1]

reversed_numbers = numbers[::-1]  # 使用切片反转
print(reversed_numbers)     # [1, 2, 3, 4, 5, 6, 9, 1]

# 其他方法
numbers.count(1)            # 统计元素出现次数
len(numbers)                # 列表长度
sum(numbers)                # 求和
min(numbers)                # 最小值
max(numbers)                # 最大值
```

### 列表运算

```python
# 列表拼接
list1 = [1, 2, 3]
list2 = [4, 5, 6]
combined = list1 + list2
print(combined)             # [1, 2, 3, 4, 5, 6]

# 列表重复
repeated = [1, 2] * 3
print(repeated)             # [1, 2, 1, 2, 1, 2]

# 检查元素是否在列表中
fruits = ["apple", "banana", "orange"]
print("apple" in fruits)    # True
print("grape" not in fruits) # True
```

### 列表遍历

```python
fruits = ["apple", "banana", "orange"]

# 使用索引遍历
for i in range(len(fruits)):
    print(f"索引 {i}: {fruits[i]}")

# 直接遍历元素
for fruit in fruits:
    print(fruit)

# 使用 enumerate 获取索引和元素
for index, fruit in enumerate(fruits):
    print(f"索引 {index}: {fruit}")

# 同时遍历多个列表
list1 = [1, 2, 3]
list2 = ["a", "b", "c"]
for num, letter in zip(list1, list2):
    print(f"{num} -> {letter}")
```

---

## 元组（Tuple）

元组是**不可变**的有序序列，类似于 JavaScript 的不可变数组。一旦创建，就不能修改。

### 创建元组

```python
# 空元组
empty_tuple = ()
empty_tuple = tuple()

# 包含元素的元组
coordinates = (10, 20)
colors = ("red", "green", "blue")

# 单个元素的元组（需要逗号）
single_element = (42,)  # 注意逗号
not_tuple = (42)         # 这只是整数 42

# 不使用括号创建元组（可选）
coordinates = 10, 20
```

### 访问元素

```python
colors = ("red", "green", "blue", "yellow")

# 索引访问
print(colors[0])          # 输出：red
print(colors[-1])         # 输出：yellow

# 切片
print(colors[1:3])        # 输出：('green', 'blue')

# 解包
red, green, blue, yellow = colors
print(red)                # 输出：red

# 部分解包
first, *rest = colors
print(first)              # 输出：red
print(rest)               # 输出：['green', 'blue', 'yellow']
```

### 元组方法

```python
# 元组的方法比列表少，因为它是不可变的
colors = ("red", "green", "blue", "red")

# 计数
print(colors.count("red"))  # 输出：2

# 查找索引
print(colors.index("blue")) # 输出：2

# 其他操作
len(colors)                # 长度
"green" in colors          # 检查元素是否存在
```

### 元组 vs 列表

| 特性   | 列表（List）   | 元组（Tuple）  |
| ------ | -------------- | -------------- |
| 可变性 | 可变           | 不可变         |
| 语法   | `[1, 2, 3]`    | `(1, 2, 3)`    |
| 方法   | 丰富           | 有限           |
| 性能   | 较慢           | 较快           |
| 用途   | 需要修改的数据 | 固定不变的数据 |

### 使用场景

```python
# ✅ 使用元组的场景

# 1. 固定的配置
CONFIG = ("localhost", 8080, "utf-8")

# 2. 函数返回多个值
def get_user_info(user_id: int) -> tuple:
    return (user_id, "张三", 25)

# 3. 字典的键（因为元组是不可变的）
locations = {
    (40.7128, -74.0060): "纽约",
    (34.0522, -118.2437): "洛杉矶"
}

# 4. 数据库查询结果
rows = [(1, "张三", 25), (2, "李四", 30)]

# ❌ 不应该使用元组的场景
# 需要频繁修改的数据应该使用列表
shopping_cart = ["apple", "banana"]  # ✅ 正确
# shopping_cart = ("apple", "banana")  # ❌ 错误
```

---

## 字典（Dict）

字典是**可变**的无序键值对集合，类似于 JavaScript 的对象。Python 3.7+ 中字典保持插入顺序。

### 创建字典

```python
# 空字典
empty_dict = {}
empty_dict = dict()

# 包含键值对的字典
user = {
    "name": "张三",
    "age": 25,
    "city": "北京"
}

# 使用 dict() 构造函数
user = dict(name="张三", age=25, city="北京")

# 从列表创建字典
keys = ["name", "age", "city"]
values = ["张三", 25, "北京"]
user = dict(zip(keys, values))
```

### 访问和修改

```python
user = {"name": "张三", "age": 25, "city": "北京"}

# 访问值
print(user["name"])           # 输出：张三
print(user.get("age"))        # 输出：25
print(user.get("height", 170)) # 输出：170（如果键不存在，返回默认值）

# 添加或修改键值对
user["email"] = "zhangsan@example.com"  # 添加新键
user["age"] = 26                          # 修改已有键

# 删除键值对
del user["city"]           # 删除指定键
email = user.pop("email")  # 删除并返回值
last_item = user.popitem() # 删除并返回最后一个键值对（Python 3.7+）

# 检查键是否存在
print("name" in user)      # 输出：True
print("city" in user)      # 输出：False
```

### 字典方法

```python
user = {"name": "张三", "age": 25, "city": "北京"}

# 获取所有键、值、键值对
print(user.keys())          # dict_keys(['name', 'age', 'city'])
print(user.values())        # dict_values(['张三', 25, '北京'])
print(user.items())         # dict_items([('name', '张三'), ('age', 25), ('city', '北京')])

# 遍历字典
for key in user.keys():
    print(key)

for value in user.values():
    print(value)

for key, value in user.items():
    print(f"{key}: {value}")

# 更新字典
user.update({"email": "zhangsan@example.com", "age": 26})

# 清空字典
user.clear()

# 复制字典
user_copy = user.copy()
```

### 字典推导式

```python
# 创建字典的简洁方式
squares = {x: x**2 for x in range(6)}
print(squares)  # {0: 0, 1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# 条件过滤
even_squares = {x: x**2 for x in range(6) if x % 2 == 0}
print(even_squares)  # {0: 0, 2: 4, 4: 16}

# 字典转换
fruits = ["apple", "banana", "orange"]
fruit_lengths = {fruit: len(fruit) for fruit in fruits}
print(fruit_lengths)  # {'apple': 5, 'banana': 6, 'orange': 6}
```

### 嵌套字典

```python
# 复杂的嵌套结构
users = {
    "user1": {
        "name": "张三",
        "age": 25,
        "address": {
            "city": "北京",
            "street": "朝阳路"
        }
    },
    "user2": {
        "name": "李四",
        "age": 30,
        "address": {
            "city": "上海",
            "street": "南京路"
        }
    }
}

# 访问嵌套数据
print(users["user1"]["name"])                    # 张三
print(users["user2"]["address"]["city"])         # 上海
```

---

## 集合（Set）

集合是**无序不重复**的元素集合，类似于 JavaScript 的 Set。集合主要用于去重和数学运算。

### 创建集合

```python
# 空集合（注意：不能使用 {}，因为 {} 表示空字典）
empty_set = set()
# {}  # 这是空字典，不是空集合

# 包含元素的集合
fruits = {"apple", "banana", "orange"}

# 从列表创建集合（去重）
numbers = [1, 2, 2, 3, 3, 3, 4]
unique_numbers = set(numbers)
print(unique_numbers)  # {1, 2, 3, 4}

# 使用字符串创建集合
chars = set("hello")
print(chars)  # {'h', 'e', 'l', 'o'}（注意：l 只有一个）
```

### 集合操作

```python
set1 = {1, 2, 3, 4, 5}
set2 = {4, 5, 6, 7, 8}

# 添加和删除元素
set1.add(6)           # 添加元素
set1.remove(1)        # 删除元素（如果不存在会报错）
set1.discard(2)       # 删除元素（如果不存在不会报错）
set1.pop()            # 随机删除并返回一个元素
set1.clear()          # 清空集合

# 并集
union = set1 | set2
union = set1.union(set2)
print(union)  # {1, 2, 3, 4, 5, 6, 7, 8}

# 交集
intersection = set1 & set2
intersection = set1.intersection(set2)
print(intersection)  # {4, 5}

# 差集
difference = set1 - set2
difference = set1.difference(set2)
print(difference)  # {1, 2, 3}

# 对称差集（只在一个集合中出现的元素）
symmetric_diff = set1 ^ set2
symmetric_diff = set1.symmetric_difference(set2)
print(symmetric_diff)  # {1, 2, 3, 6, 7, 8}

# 子集和超集
print({1, 2} <= {1, 2, 3})  # True（{1, 2} 是 {1, 2, 3} 的子集）
print({1, 2, 3} >= {1, 2})  # True（{1, 2, 3} 是 {1, 2} 的超集）
print({1, 2} < {1, 2, 3})   # True（真子集）
```

### 集合方法

```python
fruits = {"apple", "banana", "orange"}

# 添加和删除
fruits.add("grape")
fruits.update(["kiwi", "mango"])
fruits.remove("apple")
fruits.discard("notexist")  # 不会报错

# 检查元素
print("apple" in fruits)    # False
print("banana" in fruits)   # True

# 遍历集合
for fruit in fruits:
    print(fruit)

# 集合长度
print(len(fruits))

# 复制集合
fruits_copy = fruits.copy()
```

### 使用场景

```python
# ✅ 使用集合的场景

# 1. 去重
numbers = [1, 2, 2, 3, 3, 3, 4]
unique_numbers = list(set(numbers))
print(unique_numbers)  # [1, 2, 3, 4]

# 2. 检查重复
def has_duplicates(items: list) -> bool:
    return len(items) != len(set(items))

print(has_duplicates([1, 2, 3]))      # False
print(has_duplicates([1, 2, 2, 3]))  # True

# 3. 集合运算
set1 = {1, 2, 3, 4, 5}
set2 = {4, 5, 6, 7, 8}

# 找出只在 set1 中的元素
only_in_set1 = set1 - set2
print(only_in_set1)  # {1, 2, 3}

# 找出两个集合的共同元素
common = set1 & set2
print(common)  # {4, 5}

# 找出两个集合的所有元素
all_elements = set1 | set2
print(all_elements)  # {1, 2, 3, 4, 5, 6, 7, 8}

# 4. 快速查找
# 集合的查找时间是 O(1)，比列表的 O(n) 快很多
large_set = set(range(100000))
print(99999 in large_set)  # 快速
```

---

## 列表推导式

列表推导式是 Python 中创建列表的简洁方式，类似于 JavaScript 的 `map()` 和 `filter()`。

### 基本语法

```python
# 基本列表推导式
numbers = [1, 2, 3, 4, 5]

# 平方每个元素
squares = [x**2 for x in numbers]
print(squares)  # [1, 4, 9, 16, 25]

# 等价于
squares = []
for x in numbers:
    squares.append(x**2)
```

### 带条件的列表推导式

```python
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# 只保留偶数
evens = [x for x in numbers if x % 2 == 0]
print(evens)  # [2, 4, 6, 8, 10]

# 等价于
evens = []
for x in numbers:
    if x % 2 == 0:
        evens.append(x)

# 条件表达式
results = ["even" if x % 2 == 0 else "odd" for x in numbers]
print(results)  # ['odd', 'even', 'odd', 'even', 'odd', 'even', 'odd', 'even', 'odd', 'even']
```

### 嵌套列表推导式

```python
# 创建矩阵
matrix = [[row * col for col in range(3)] for row in range(3)]
print(matrix)
# [[0, 0, 0], [0, 1, 2], [0, 2, 4]]

# 扁平化二维列表
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
flattened = [item for row in matrix for item in row]
print(flattened)  # [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

### 字典和集合推导式

```python
# 字典推导式
words = ["apple", "banana", "cherry"]
word_lengths = {word: len(word) for word in words}
print(word_lengths)  # {'apple': 5, 'banana': 6, 'cherry': 6}

# 集合推导式
numbers = [1, 2, 2, 3, 3, 3, 4]
squared_set = {x**2 for x in numbers}
print(squared_set)  # {1, 4, 9, 16}
```

### 实际应用示例

```python
# 1. 数据清洗
data = ["  apple  ", "banana", "  cherry", "date"]
cleaned = [word.strip() for word in data]
print(cleaned)  # ['apple', 'banana', 'cherry', 'date']

# 2. 数据转换
prices = ["$10", "$20", "$30"]
numbers = [int(price.replace("$", "")) for price in prices]
print(numbers)  # [10, 20, 30]

# 3. 过滤数据
users = [
    {"name": "张三", "age": 25},
    {"name": "李四", "age": 17},
    {"name": "王五", "age": 30}
]
adults = [user for user in users if user["age"] >= 18]
print(adults)  # [{'name': '张三', 'age': 25}, {'name': '王五', 'age': 30}]

# 4. 数据提取
products = [
    {"name": "iPhone", "price": 999},
    {"name": "MacBook", "price": 1999},
    {"name": "AirPods", "price": 199}
]
product_names = [product["name"] for product in products]
print(product_names)  # ['iPhone', 'MacBook', 'AirPods']
```

---

## 数据结构选择指南

### 选择合适的容器

| 需求           | 推荐容器                  | 原因             |
| -------------- | ------------------------- | ---------------- |
| 需要修改的数据 | 列表（List）              | 可变，支持增删改 |
| 固定不变的数据 | 元组（Tuple）             | 不可变，更安全   |
| 键值对存储     | 字典（Dict）              | 快速查找         |
| 去重           | 集合（Set）               | 自动去重         |
| 有序数据       | 列表（List）              | 保持插入顺序     |
| 频繁查找       | 字典（Dict）或集合（Set） | O(1) 查找时间    |

### 性能对比

| 操作     | 列表  | 元组 | 字典 | 集合 |
| -------- | ----- | ---- | ---- | ---- |
| 插入     | O(n)* | -    | O(1) | O(1) |
| 删除     | O(n)  | -    | O(1) | O(1) |
| 查找     | O(n)  | O(n) | O(1) | O(1) |
| 索引访问 | O(1)  | O(1) | O(1) | -    |
| 切片     | O(k)  | O(k) | -    | -    |

*列表在末尾插入是 O(1)，在其他位置是 O(n)

### 内存使用

```python
# 一般来说：
# 元组 < 列表 < 集合 < 字典

import sys

list_example = [1, 2, 3, 4, 5]
tuple_example = (1, 2, 3, 4, 5)
set_example = {1, 2, 3, 4, 5}
dict_example = {1: 1, 2: 2, 3: 3, 4: 4, 5: 5}

print(f"列表: {sys.getsizeof(list_example)} 字节")
print(f"元组: {sys.getsizeof(tuple_example)} 字节")
print(f"集合: {sys.getsizeof(set_example)} 字节")
print(f"字典: {sys.getsizeof(dict_example)} 字节")
```

---

## 练习题

### 练习 1：数据处理

创建一个程序 `data_processing.py`：
1. 创建一个包含学生信息的列表（姓名、年龄、成绩）
2. 使用列表推导式找出成绩大于 80 的学生
3. 计算平均成绩
4. 按成绩排序

### 练习 2：字典操作

创建一个程序 `dict_operations.py`：
1. 创建一个商品库存字典
2. 实现添加商品、删除商品、更新库存的功能
3. 统计总库存量
4. 找出库存不足的商品

### 练习 3：集合应用

创建一个程序 `set_applications.py`：
1. 创建两个班级的学生集合
2. 找出两个班级的共同学生
3. 找出只在其中一个班级的学生
4. 合并两个班级的学生

---

## 练习答案

<details>
<summary>点击查看练习 1 答案</summary>

```python
# data_processing.py
from typing import List, Dict

# 学生数据
students = [
    {"name": "张三", "age": 20, "score": 85},
    {"name": "李四", "age": 21, "score": 92},
    {"name": "王五", "age": 19, "score": 78},
    {"name": "赵六", "age": 20, "score": 88},
    {"name": "钱七", "age": 22, "score": 65},
]

# 1. 找出成绩大于 80 的学生
high_score_students = [s for s in students if s["score"] > 80]
print("成绩大于 80 的学生:")
for student in high_score_students:
    print(f"  {student['name']}: {student['score']} 分")

# 2. 计算平均成绩
total_score = sum(s["score"] for s in students)
average_score = total_score / len(students)
print(f"\n平均成绩: {average_score:.2f} 分")

# 3. 按成绩排序
sorted_students = sorted(students, key=lambda x: x["score"], reverse=True)
print("\n按成绩排序:")
for i, student in enumerate(sorted_students, 1):
    print(f"  {i}. {student['name']}: {student['score']} 分")

# 4. 额外功能：统计各分数段
excellent = len([s for s in students if s["score"] >= 90])
good = len([s for s in students if 80 <= s["score"] < 90])
passing = len([s for s in students if 60 <= s["score"] < 80])
failing = len([s for s in students if s["score"] < 60])

print(f"\n成绩分布:")
print(f"  优秀 (>=90): {excellent} 人")
print(f"  良好 (80-89): {good} 人")
print(f"  及格 (60-79): {passing} 人")
print(f"  不及格 (<60): {failing} 人")
```

运行示例：
```bash
python3 data_processing.py
# 输出：
# 成绩大于 80 的学生:
#   张三: 85 分
#   李四: 92 分
#   赵六: 88 分
# 
# 平均成绩: 81.60 分
# 
# 按成绩排序:
#   1. 李四: 92 分
#   2. 赵六: 88 分
#   3. 张三: 85 分
#   4. 王五: 78 分
#   5. 钱七: 65 分
# 
# 成绩分布:
#   优秀 (>=90): 1 人
#   良好 (80-89): 2 人
#   及格 (60-79): 2 人
#   不及格 (<60): 0 人
```

</details>

<details>
<summary>点击查看练习 2 答案</summary>

```python
# dict_operations.py
from typing import Dict, Optional

# 商品库存
inventory = {
    "苹果": 50,
    "香蕉": 30,
    "橙子": 20,
    "葡萄": 15,
    "西瓜": 10
}

def add_product(name: str, quantity: int) -> None:
    """添加商品"""
    if quantity <= 0:
        print(f"错误：数量必须大于 0")
        return
    
    if name in inventory:
        inventory[name] += quantity
        print(f"已更新 {name} 的库存为 {inventory[name]}")
    else:
        inventory[name] = quantity
        print(f"已添加新商品 {name}，库存: {quantity}")

def remove_product(name: str) -> bool:
    """删除商品"""
    if name in inventory:
        del inventory[name]
        print(f"已删除商品 {name}")
        return True
    else:
        print(f"商品 {name} 不存在")
        return False

def update_stock(name: str, new_quantity: int) -> bool:
    """更新库存"""
    if name not in inventory:
        print(f"商品 {name} 不存在")
        return False
    
    if new_quantity < 0:
        print(f"错误：库存不能为负数")
        return False
    
    inventory[name] = new_quantity
    print(f"已更新 {name} 的库存为 {new_quantity}")
    return True

def total_inventory() -> int:
    """统计总库存量"""
    return sum(inventory.values())

def low_stock_products(threshold: int = 20) -> Dict[str, int]:
    """找出库存不足的商品"""
    return {name: qty for name, qty in inventory.items() if qty < threshold}

# 演示功能
print("=" * 40)
print("初始库存:")
for product, quantity in inventory.items():
    print(f"  {product}: {quantity}")

print("\n" + "=" * 40)
print("添加商品:")
add_product("苹果", 10)     # 更新已有商品
add_product("草莓", 25)     # 添加新商品

print("\n" + "=" * 40)
print("更新库存:")
update_stock("香蕉", 40)
update_stock("西瓜", 5)

print("\n" + "=" * 40)
print("删除商品:")
remove_product("橙子")

print("\n" + "=" * 40)
print("当前库存:")
for product, quantity in inventory.items():
    print(f"  {product}: {quantity}")

print("\n" + "=" * 40)
print(f"总库存量: {total_inventory()}")

print("\n" + "=" * 40)
print("库存不足的商品（< 20）:")
low_stock = low_stock_products()
if low_stock:
    for product, quantity in low_stock.items():
        print(f"  {product}: {quantity}（需要补货）")
else:
    print("  所有商品库存充足")
```

运行示例：
```bash
python3 dict_operations.py
# 输出：
# ========================================
# 初始库存:
#   苹果: 50
#   香蕉: 30
#   橙子: 20
#   葡萄: 15
#   西瓜: 10
# 
# ========================================
# 添加商品:
# 已更新 苹果 的库存为 60
# 已添加新商品 草莓，库存: 25
# 
# ========================================
# 更新库存:
# 已更新 香蕉 的库存为 40
# 已更新 西瓜 的库存为 5
# 
# ========================================
# 删除商品:
# 已删除商品 橙子
# 
# ========================================
# 当前库存:
#   苹果: 60
#   香蕉: 40
#   葡萄: 15
#   西瓜: 5
#   草莓: 25
# 
# ========================================
# 总库存量: 145
# 
# ========================================
# 库存不足的商品（< 20）:
#   葡萄: 15（需要补货）
#   西瓜: 5（需要补货）
```

</details>

<details>
<summary>点击查看练习 3 答案</summary>

```python
# set_applications.py

# 两个班级的学生集合
class_a = {"张三", "李四", "王五", "赵六", "钱七"}
class_b = {"李四", "王五", "孙八", "周九", "吴十"}

print("=" * 40)
print("班级 A 的学生:")
print(f"  {sorted(class_a)}")

print("\n班级 B 的学生:")
print(f"  {sorted(class_b)}")

# 1. 找出两个班级的共同学生
print("\n" + "=" * 40)
print("两个班级的共同学生:")
common = class_a & class_b
if common:
    print(f"  {sorted(common)}（共 {len(common)} 人）")
else:
    print("  没有共同学生")

# 2. 找出只在其中一个班级的学生
print("\n" + "=" * 40)
print("只在班级 A 的学生:")
only_in_a = class_a - class_b
print(f"  {sorted(only_in_a)}（共 {len(only_in_a)} 人）")

print("\n只在班级 B 的学生:")
only_in_b = class_b - class_a
print(f"  {sorted(only_in_b)}（共 {len(only_in_b)} 人）")

# 3. 合并两个班级的学生
print("\n" + "=" * 40)
print("合并两个班级的学生:")
all_students = class_a | class_b
print(f"  {sorted(all_students)}（共 {len(all_students)} 人）")

# 4. 找出只在其中一个班级的学生（对称差集）
print("\n" + "=" * 40)
print("只在其中一个班级的学生（不重复）:")
unique_students = class_a ^ class_b
print(f"  {sorted(unique_students)}（共 {len(unique_students)} 人）")

# 5. 检查是否有学生同时在两个班级
print("\n" + "=" * 40)
if len(common) > 0:
    print(f"有 {len(common)} 个学生同时在两个班级")
    print("这可能是数据错误，需要核查")
else:
    print("没有学生在两个班级同时出现（数据正常）")

# 6. 额外功能：学生统计
print("\n" + "=" * 40)
print("学生统计:")
print(f"  班级 A: {len(class_a)} 人")
print(f"  班级 B: {len(class_b)} 人")
print(f"  共同学生: {len(common)} 人")
print(f"  总人数: {len(all_students)} 人")
print(f"  去重后总人数: {len(all_students)} 人")
```

运行示例：
```bash
python3 set_applications.py
# 输出：
# ========================================
# 班级 A 的学生:
#   ['周九', '吴十', '孙八', '李四', '王五']
# 
# 班级 B 的学生:
#   ['周九', '吴十', '孙八', '李四', '王五']
# 
# ========================================
# 两个班级的共同学生:
#   ['李四', '王五']（共 2 人）
# 
# ========================================
# 只在班级 A 的学生:
#   ['钱七', '赵六', '张三']（共 3 人）
# 
# 只在班级 B 的学生:
#   ['孙八', '吴十', '周九']（共 3 人）
# 
# ========================================
# 合并两个班级的学生:
#   ['吴十', '周九', '孙八', '张三', '李四', '王五', '赵六', '钱七']（共 8 人）
# 
# ========================================
# 只在其中一个班级的学生（不重复）:
#   ['吴十', '周九', '孙八', '张三', '赵六', '钱七']（共 6 人）
# 
# ========================================
# 有 2 个学生同时在两个班级
# 这可能是数据错误，需要核查
# 
# ========================================
# 学生统计:
#   班级 A: 5 人
#   班级 B: 5 人
#   共同学生: 2 人
#   总人数: 8 人
#   去重后总人数: 8 人
```

</details>

---

## 本章小结

✅ 你已经学会了：
- 列表（List）的创建、操作和方法
- 元组（Tuple）的特性和使用场景
- 字典（Dict）的键值对存储和操作
- 集合（Set）的去重和数学运算
- 列表推导式的使用
- 如何选择合适的数据结构
- 不同数据结构的性能特点

## 下一章

[第4章：控制流程](/chapter-04/) - 学习 Python 的条件语句、循环和列表推导式。