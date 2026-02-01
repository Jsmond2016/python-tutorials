# 第4章：控制流程

控制流程是编程的核心，决定了程序的执行顺序。Python 的控制流程与 JavaScript 相似，但语法更简洁，使用缩进而不是花括号。

## 学习目标

- 掌握条件语句（if-elif-else）
- 学会使用循环（for 和 while）
- 理解列表推导式的高级用法
- 掌握 break、continue 和 pass 语句
- 学习 match-case 语句（Python 3.10+）

## 目录

1. [条件语句](#条件语句)
2. [循环语句](#循环语句)
3. [列表推导式进阶](#列表推导式进阶)
4. [break、continue 和 pass](#breakcontinue-和-pass)
5. [match-case 语句](#match-case-语句)
6. [Python vs JavaScript 对比](#python-vs-javascript-对比)
7. [练习题](#练习题)
8. [练习答案](#练习答案)

---

## 条件语句

### if-elif-else 语法

```python
# 基本 if 语句
age = 18
if age >= 18:
    print("你已经成年了")

# if-else 语句
age = 15
if age >= 18:
    print("你已经成年了")
else:
    print("你还是未成年人")

# if-elif-else 语句
score = 85
if score >= 90:
    print("优秀")
elif score >= 80:
    print("良好")
elif score >= 60:
    print("及格")
else:
    print("不及格")
```

### 条件表达式（三元运算符）

```python
# Python 的条件表达式
age = 18
status = "成年" if age >= 18 else "未成年"
print(status)  # 输出：成年

# 等价于 JavaScript 的三元运算符
# const status = age >= 18 ? "成年" : "未成年";

# 复杂示例
score = 85
grade = "A" if score >= 90 else "B" if score >= 80 else "C"
print(grade)  # 输出：B
```

### 逻辑运算符

```python
# and（逻辑与）
age = 25
has_license = True
if age >= 18 and has_license:
    print("可以开车")

# or（逻辑或）
is_weekend = True
is_holiday = False
if is_weekend or is_holiday:
    print("可以休息")

# not（逻辑非）
is_raining = False
if not is_raining:
    print("可以出去散步")

# 短路求值
def expensive_function():
    print("执行了昂贵的操作")
    return True

# 如果第一个条件为 False，不会执行第二个
if False and expensive_function():
    print("这不会执行")

# 如果第一个条件为 True，不会执行第二个
if True or expensive_function():
    print("这会执行，但不会调用 expensive_function")
```

### 比较运算符

```python
# 基本比较
a = 10
b = 20

print(a == b)  # False（等于）
print(a != b)  # True（不等于）
print(a < b)   # True（小于）
print(a <= b)  # True（小于等于）
print(a > b)   # False（大于）
print(a >= b)  # False（大于等于）

# 链式比较
age = 25
print(18 <= age <= 30)  # True（age 在 18 到 30 之间）
# 等价于
print(age >= 18 and age <= 30)  # True

# 身份运算符（is 和 is not）
a = [1, 2, 3]
b = [1, 2, 3]
c = a

print(a == b)  # True（值相等）
print(a is b)  # False（不是同一个对象）
print(a is c)  # True（同一个对象）

# None 的判断
value = None
if value is None:
    print("value 是 None")
```

### 成员运算符

```python
# in 和 not in
fruits = ["apple", "banana", "orange"]
print("apple" in fruits)    # True
print("grape" not in fruits) # True

# 字符串包含
text = "Hello, World!"
print("World" in text)      # True

# 字典键检查
user = {"name": "张三", "age": 25}
print("name" in user)       # True
print("email" in user)       # False
```

---

## 循环语句

### for 循环

#### 基本用法

```python
# 遍历列表
fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(fruit)

# 遍历字符串
for char in "Python":
    print(char)

# 遍历字典
user = {"name": "张三", "age": 25}
for key in user:
    print(key)  # 只遍历键

for key, value in user.items():
    print(f"{key}: {value}")  # 遍历键值对

# 使用 range()
for i in range(5):  # 0, 1, 2, 3, 4
    print(i)

for i in range(1, 6):  # 1, 2, 3, 4, 5
    print(i)

for i in range(0, 10, 2):  # 0, 2, 4, 6, 8（步长为 2）
    print(i)

for i in range(10, 0, -1):  # 10, 9, 8, 7, 6, 5, 4, 3, 2, 1（倒序）
    print(i)
```

#### enumerate() 函数

```python
# 获取索引和值
fruits = ["apple", "banana", "orange"]
for index, fruit in enumerate(fruits):
    print(f"索引 {index}: {fruit}")

# 指定起始索引
for index, fruit in enumerate(fruits, start=1):
    print(f"第 {index} 个水果: {fruit}")
```

#### zip() 函数

```python
# 同时遍历多个序列
names = ["张三", "李四", "王五"]
ages = [25, 30, 28]
cities = ["北京", "上海", "广州"]

for name, age, city in zip(names, ages, cities):
    print(f"{name}, {age} 岁, 住在 {city}")

# 等价于 JavaScript 的
# names.forEach((name, i) => {
#     console.log(`${name}, ${ages[i]} 岁, 住在 ${cities[i]}`);
# });
```

### while 循环

```python
# 基本 while 循环
count = 0
while count < 5:
    print(count)
    count += 1

# 无限循环（需要 break）
while True:
    user_input = input("输入 'quit' 退出: ")
    if user_input == "quit":
        break
    print(f"你输入了: {user_input}")

# 条件循环
sum_result = 0
number = 1
while sum_result < 100:
    sum_result += number
    number += 1
print(f"1 到 {number-1} 的和是 {sum_result}")
```

### 循环中的 else 子句

```python
# for 循环的 else（正常结束时执行）
for i in range(5):
    print(i)
else:
    print("循环正常结束")

# 如果使用 break，else 不会执行
for i in range(5):
    print(i)
    if i == 3:
        break
else:
    print("这不会执行")  # 因为使用了 break

# 实际应用：查找素数
for n in range(2, 10):
    for x in range(2, n):
        if n % x == 0:
            print(f"{n} 等于 {x} * {n//x}")
            break
    else:
        # 没有找到因数
        print(f"{n} 是素数")
```

---

## 列表推导式进阶

### 嵌套循环

```python
# 双重循环的列表推导式
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

# 扁平化矩阵
flattened = [item for row in matrix for item in row]
print(flattened)  # [1, 2, 3, 4, 5, 6, 7, 8, 9]

# 创建矩阵
transposed = [[row[i] for row in matrix] for i in range(3)]
print(transposed)  # [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
```

### 多条件过滤

```python
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# 多个条件
result = [x for x in numbers if x > 3 and x < 8]
print(result)  # [4, 5, 6, 7]

# 条件表达式
result = ["even" if x % 2 == 0 else "odd" for x in numbers]
print(result)  # ['odd', 'even', 'odd', 'even', 'odd', 'even', 'odd', 'even', 'odd', 'even']

# 复杂条件
result = [x for x in numbers if x % 2 == 0 or x % 3 == 0]
print(result)  # [2, 3, 4, 6, 8, 9, 10]
```

### 字典和集合推导式

```python
# 字典推导式
words = ["apple", "banana", "cherry"]
word_lengths = {word: len(word) for word in words}
print(word_lengths)  # {'apple': 5, 'banana': 6, 'cherry': 6}

# 条件字典推导式
filtered = {word: length for word, length in word_lengths.items() if length > 5}
print(filtered)  # {'banana': 6, 'cherry': 6}

# 集合推导式
numbers = [1, 2, 2, 3, 3, 3, 4]
squared_set = {x**2 for x in numbers}
print(squared_set)  # {1, 4, 9, 16}
```

---

## break、continue 和 pass

### break 语句

```python
# 跳出循环
for i in range(10):
    if i == 5:
        break  # 跳出循环
    print(i)
# 输出：0 1 2 3 4

# 查找元素
fruits = ["apple", "banana", "orange", "grape"]
search_for = "orange"

for fruit in fruits:
    if fruit == search_for:
        print(f"找到了 {fruit}")
        break
else:
    print("没有找到")

# 嵌套循环中的 break
for i in range(3):
    for j in range(3):
        if i == 1 and j == 1:
            break  # 只跳出内层循环
        print(f"({i}, {j})")
```

### continue 语句

```python
# 跳过当前迭代
for i in range(5):
    if i == 2:
        continue  # 跳过 i == 2
    print(i)
# 输出：0 1 3 4

# 过滤数据
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
for num in numbers:
    if num % 2 == 0:
        continue  # 跳过偶数
    print(num)
# 输出：1 3 5 7 9
```

### pass 语句

```python
# pass 是空操作，用作占位符
for i in range(5):
    pass  # 什么都不做

# 定义空函数
def empty_function():
    pass

# 定义空类
class EmptyClass:
    pass

# if 语句中的占位符
if True:
    pass  # 后续添加代码
```

---

## match-case 语句

Python 3.10+ 引入了 `match-case` 语句，类似于其他语言的 switch-case。

### 基本用法

```python
# 基本 match-case
status = 404

match status:
    case 200:
        print("成功")
    case 404:
        print("未找到")
    case 500:
        print("服务器错误")
    case _:
        print("其他状态")
```

### 模式匹配

```python
# 匹配元组
point = (3, 4)

match point:
    case (0, 0):
        print("原点")
    case (x, 0):
        print(f"X 轴上的点: {x}")
    case (0, y):
        print(f"Y 轴上的点: {y}")
    case (x, y):
        print(f"点 ({x}, {y})")

# 匹配列表
items = [1, 2, 3]

match items:
    case []:
        print("空列表")
    case [x]:
        print(f"一个元素: {x}")
    case [x, y]:
        print(f"两个元素: {x}, {y}")
    case [x, y, *rest]:
        print(f"第一个: {x}, 第二个: {y}, 剩余: {rest}")

# 匹配字典
user = {"name": "张三", "role": "admin"}

match user:
    case {"name": name, "role": "admin"}:
        print(f"管理员: {name}")
    case {"name": name, "role": role}:
        print(f"{role}: {name}")
```

### 守卫条件

```python
# 使用 if 作为守卫条件
age = 25

match age:
    case n if n < 18:
        print("未成年")
    case n if 18 <= n < 60:
        print("成年人")
    case _:
        print("老年人")
```

---

## Python vs JavaScript 对比

### 条件语句

| 特性       | Python                  | JavaScript          |
| ---------- | ----------------------- | ------------------- |
| 语法       | `if-elif-else`          | `if-else if-else`   |
| 代码块     | 缩进                    | 花括号 `{}`         |
| 三元运算符 | `x if condition else y` | `condition ? x : y` |
| 逻辑运算符 | `and`, `or`, `not`      | `&&`, `             |  | `, `!` |
| 恒等       | `is`, `is not`          | `===`, `!==`        |

### 循环语句

| 特性       | Python                           | JavaScript                                        |
| ---------- | -------------------------------- | ------------------------------------------------- |
| for 循环   | `for item in list`               | `for (item of list)`                              |
| 索引循环   | `for i in range(n)`              | `for (let i = 0; i < n; i++)`                     |
| while 循环 | `while condition:`               | `while (condition)`                               |
| 遍历对象   | `for key, value in dict.items()` | `for (const [key, value] of Object.entries(obj))` |

### 代码示例对比

```python
# Python 条件语句
if age >= 18 and has_license:
    print("可以开车")
else:
    print("不能开车")

# JavaScript 条件语句
if (age >= 18 && hasLicense) {
    console.log("可以开车");
} else {
    console.log("不能开车");
}
```

```python
# Python 循环
for i in range(5):
    print(i)

# JavaScript 循环
for (let i = 0; i < 5; i++) {
    console.log(i);
}
```

---

## 练习题

### 练习 1：FizzBuzz 游戏

创建一个程序 `fizzbuzz.py`：
1. 遍历 1 到 100 的数字
2. 如果是 3 的倍数，打印 "Fizz"
3. 如果是 5 的倍数，打印 "Buzz"
4. 如果是 3 和 5 的倍数，打印 "FizzBuzz"
5. 否则打印数字本身

### 练习 2：成绩分级

创建一个程序 `grade_classifier.py`：
1. 从用户输入获取成绩（0-100）
2. 根据成绩输出等级（A、B、C、D、F）
3. 使用 match-case 语句（Python 3.10+）或 if-elif-else
4. 处理无效输入

### 练习 3：查找素数

创建一个程序 `prime_finder.py`：
1. 找出 1 到 100 之间的所有素数
2. 使用嵌套循环
3. 使用列表推导式优化代码
4. 统计素数数量

---

## 练习答案

<details>
<summary>点击查看练习 1 答案</summary>

```python
# fizzbuzz.py

# 方法1：使用 if-elif-else
print("方法1：if-elif-else")
for i in range(1, 101):
    if i % 15 == 0:  # 3 和 5 的最小公倍数
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)

# 方法2：使用字符串拼接
print("\n方法2：字符串拼接")
for i in range(1, 101):
    output = ""
    if i % 3 == 0:
        output += "Fizz"
    if i % 5 == 0:
        output += "Buzz"
    print(output or i)

# 方法3：使用列表推导式和函数
print("\n方法3：函数式")
def fizzbuzz(n: int) -> str:
    if n % 15 == 0:
        return "FizzBuzz"
    elif n % 3 == 0:
        return "Fizz"
    elif n % 5 == 0:
        return "Buzz"
    return str(n)

print("\n".join([fizzbuzz(i) for i in range(1, 101)]))
```

运行示例：
```bash
python3 fizzbuzz.py
# 输出前 20 行：
# 方法1：if-elif-else
# 1
# 2
# Fizz
# 4
# Buzz
# Fizz
# 7
# 8
# Fizz
# Buzz
# 11
# Fizz
# 13
# 14
# FizzBuzz
# 16
# 17
# Fizz
# 19
# Buzz
# ...
```

</details>

<details>
<summary>点击查看练习 2 答案</summary>

```python
# grade_classifier.py

# 方法1：使用 if-elif-else
def classify_grade_if(score: int) -> str:
    """使用 if-elif-else 分类成绩"""
    if score >= 90:
        return "A (优秀)"
    elif score >= 80:
        return "B (良好)"
    elif score >= 70:
        return "C (中等)"
    elif score >= 60:
        return "D (及格)"
    elif score >= 0:
        return "F (不及格)"
    else:
        return "无效成绩"

# 方法2：使用 match-case（Python 3.10+）
def classify_grade_match(score: int) -> str:
    """使用 match-case 分类成绩"""
    match score:
        case n if n >= 90:
            return "A (优秀)"
        case n if n >= 80:
            return "B (良好)"
        case n if n >= 70:
            return "C (中等)"
        case n if n >= 60:
            return "D (及格)"
        case n if n >= 0:
            return "F (不及格)"
        case _:
            return "无效成绩"

# 主程序
print("成绩分级程序")
print("=" * 40)

while True:
    try:
        user_input = input("\n请输入成绩 (0-100)，输入 'quit' 退出: ")
        
        if user_input.lower() == 'quit':
            print("再见！")
            break
        
        score = int(user_input)
        
        # 使用 if-elif-else 方法
        grade = classify_grade_if(score)
        print(f"\n方法1 (if-elif-else): {grade}")
        
        # 使用 match-case 方法
        grade = classify_grade_match(score)
        print(f"方法2 (match-case): {grade}")
        
        # 额外信息
        if 0 <= score <= 100:
            if score >= 60:
                print("恭喜！通过了考试")
            else:
                print("需要继续努力")
        
    except ValueError:
        print("错误：请输入有效的数字")
    except KeyboardInterrupt:
        print("\n\n程序被中断")
        break
```

运行示例：
```bash
python3 grade_classifier.py
# 输出：
# 成绩分级程序
# ========================================
# 
# 请输入成绩 (0-100)，输入 'quit' 退出: 85
# 
# 方法1 (if-elif-else): B (良好)
# 方法2 (match-case): B (良好)
# 恭喜！通过了考试
# 
# 请输入成绩 (0-100)，输入 'quit' 退出: 55
# 
# 方法1 (if-elif-else): F (不及格)
# 方法2 (match-case): F (不及格)
# 需要继续努力
# 
# 请输入成绩 (0-100)，输入 'quit' 退出: quit
# 再见！
```

</details>

<details>
<summary>点击查看练习 3 答案</summary>

```python
# prime_finder.py

# 方法1：传统方法
def find_primes_traditional(n: int) -> list[int]:
    """使用传统方法找素数"""
    primes = []
    for num in range(2, n + 1):
        is_prime = True
        for i in range(2, int(num ** 0.5) + 1):
            if num % i == 0:
                is_prime = False
                break
        if is_prime:
            primes.append(num)
    return primes

# 方法2：使用列表推导式
def find_primes_comprehension(n: int) -> list[int]:
    """使用列表推导式找素数"""
    return [
        num for num in range(2, n + 1)
        if all(num % i != 0 for i in range(2, int(num ** 0.5) + 1))
    ]

# 方法3：使用 filter 函数
def find_primes_filter(n: int) -> list[int]:
    """使用 filter 函数找素数"""
    def is_prime(num: int) -> bool:
        return all(num % i != 0 for i in range(2, int(num ** 0.5) + 1))
    
    return list(filter(is_prime, range(2, n + 1)))

# 主程序
print("素数查找程序")
print("=" * 40)

limit = 100
print(f"\n查找 1 到 {limit} 之间的素数")

# 使用不同方法查找
print("\n方法1：传统方法")
primes1 = find_primes_traditional(limit)
print(f"找到 {len(primes1)} 个素数:")
print(primes1)

print("\n方法2：列表推导式")
primes2 = find_primes_comprehension(limit)
print(f"找到 {len(primes2)} 个素数:")
print(primes2)

print("\n方法3：filter 函数")
primes3 = find_primes_filter(limit)
print(f"找到 {len(primes3)} 个素数:")
print(primes3)

# 验证三种方法结果一致
if primes1 == primes2 == primes3:
    print("\n✓ 三种方法的结果一致")
else:
    print("\n✗ 三种方法的结果不一致")

# 额外功能：统计分布
print("\n" + "=" * 40)
print("素数分布:")

ranges = [
    (1, 10, "1-10"),
    (11, 20, "11-20"),
    (21, 50, "21-50"),
    (51, 100, "51-100")
]

for start, end, label in ranges:
    count = len([p for p in primes1 if start <= p <= end])
    print(f"  {label}: {count} 个")
```

运行示例：
```bash
python3 prime_finder.py
# 输出：
# 素数查找程序
# ========================================
# 
# 查找 1 到 100 之间的素数
# 
# 方法1：传统方法
# 找到 25 个素数:
# [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]
# 
# 方法2：列表推导式
# 找到 25 个素数:
# [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]
# 
# 方法3：filter 函数
# 找到 25 个素数:
# [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]
# 
# ✓ 三种方法的结果一致
# 
# ========================================
# 素数分布:
#   1-10: 4 个
#   11-20: 4 个
#   21-50: 7 个
#   51-100: 10 个
```

</details>

---

## 本章小结

✅ 你已经学会了：
- 条件语句（if-elif-else）的使用
- 逻辑运算符和比较运算符
- for 循环和 while 循环
- enumerate() 和 zip() 的使用
- 列表推导式的高级用法
- break、continue 和 pass 语句
- match-case 语句（Python 3.10+）
- Python 与 JavaScript 的控制流程对比

## 下一章

[第5章：函数](/chapter-05/) - 学习 Python 函数的定义、参数、返回值和装饰器。