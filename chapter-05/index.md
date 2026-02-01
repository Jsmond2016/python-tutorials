# 第5章：函数

函数是组织代码、提高复用性的重要工具。Python 的函数定义和使用与 JavaScript 有很多相似之处，但也有一些独特的特性。

## 学习目标

- 掌握函数的定义和调用
- 理解参数的各种形式
- 学会使用返回值
- 掌握 Lambda 函数的使用
- 理解装饰器的基础概念
- 学习函数式编程技巧

## 目录

1. [函数定义](#函数定义)
2. [参数](#参数)
3. [返回值](#返回值)
4. [作用域](#作用域)
5. [Lambda 函数](#lambda-函数)
6. [装饰器基础](#装饰器基础)
7. [高阶函数](#高阶函数)
8. [Python vs JavaScript 对比](#python-vs-javascript-对比)
9. [练习题](#练习题)
10. [练习答案](#练习答案)

---

## 函数定义

### 基本语法

```python
# 基本函数定义
def greet(name: str) -> str:
    """向用户打招呼"""
    return f"Hello, {name}!"

# 调用函数
message = greet("Python")
print(message)  # 输出：Hello, Python!
```

### 无返回值的函数

```python
# 没有 return 语句的函数返回 None
def print_greeting(name: str) -> None:
    print(f"Hello, {name}!")

result = print_greeting("Python")
print(result)  # 输出：None
```

### 默认参数

```python
# 带默认值的参数
def greet(name: str, greeting: str = "Hello") -> str:
    return f"{greeting}, {name}!"

print(greet("Python"))  # Hello, Python!
print(greet("Python", "Hi"))  # Hi, Python!
```

### 文档字符串

```python
def calculate_area(length: float, width: float) -> float:
    """
    计算矩形的面积
    
    Args:
        length: 矩形的长度
        width: 矩形的宽度
    
    Returns:
        矩形的面积
    
    Example:
        >>> calculate_area(5, 3)
        15.0
    """
    return length * width

# 访问文档字符串
print(calculate_area.__doc__)
```

---

## 参数

### 位置参数

```python
def add(a: int, b: int) -> int:
    """加法"""
    return a + b

# 按位置传递参数
result = add(5, 3)
print(result)  # 8
```

### 关键字参数

```python
def greet(name: str, greeting: str = "Hello") -> str:
    return f"{greeting}, {name}!"

# 使用关键字参数
print(greet(name="Python", greeting="Hi"))  # Hi, Python!
print(greet(greeting="Hey", name="World"))  # Hey, World!
```

### 可变参数（*args 和 **kwargs）

```python
# *args：可变数量的位置参数
def sum_all(*numbers: int) -> int:
    """计算所有数字的和"""
    total = 0
    for num in numbers:
        total += num
    return total

print(sum_all(1, 2, 3, 4, 5))  # 15
print(sum_all(1, 2))  # 3

# **kwargs：可变数量的关键字参数
def print_info(**info: any) -> None:
    """打印所有信息"""
    for key, value in info.items():
        print(f"{key}: {value}")

print_info(name="张三", age=25, city="北京")
# 输出：
# name: 张三
# age: 25
# city: 北京
```

### 参数解包

```python
# 列表解包
numbers = [1, 2, 3]
print(sum_all(*numbers))  # 6

# 字典解包
user_info = {"name": "李四", "age": 30}
print_info(**user_info)
# 输出：
# name: 李四
# age: 30
```

### 参数顺序

```python
# 正确的参数顺序：位置参数 -> 默认参数 -> *args -> **kwargs
def complex_function(
    required_param: str,      # 必须的位置参数
    default_param: str = "default",  # 默认参数
    *args: int,               # 可变位置参数
    **kwargs: any              # 可变关键字参数
) -> None:
    print(f"required: {required_param}")
    print(f"default: {default_param}")
    print(f"args: {args}")
    print(f"kwargs: {kwargs}")

complex_function("required", "custom", 1, 2, 3, key1="value1", key2="value2")
```

---

## 返回值

### 单个返回值

```python
def add(a: int, b: int) -> int:
    return a + b

result = add(5, 3)
print(result)  # 8
```

### 多个返回值（元组）

```python
def divide_and_remainder(dividend: int, divisor: int) -> tuple[int, int]:
    """返回商和余数"""
    quotient = dividend // divisor
    remainder = dividend % divisor
    return quotient, remainder

q, r = divide_and_remainder(10, 3)
print(f"商: {q}, 余数: {r}")  # 商: 3, 余数: 1
```

### 条件返回

```python
def get_grade(score: int) -> str:
    """根据分数返回等级"""
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    return "F"
```

### 早期返回

```python
def login(username: str, password: str) -> bool:
    """用户登录"""
    # 检查用户名
    if not username:
        print("用户名不能为空")
        return False
    
    # 检查密码
    if not password:
        print("密码不能为空")
        return False
    
    # 模拟验证
    if username == "admin" and password == "password123":
        print("登录成功")
        return True
    
    print("用户名或密码错误")
    return False
```

---

## 作用域

### 局部变量和全局变量

```python
# 全局变量
global_var = "全局"

def test_scope() -> None:
    # 局部变量
    local_var = "局部"
    print(f"局部变量: {local_var}")
    print(f"全局变量: {global_var}")

test_scope()
# 输出：
# 局部变量: 局部
# 全局变量: 全局

print(local_var)  # 报错：局部变量在函数外部不可访问
```

### global 关键字

```python
count = 0

def increment_global() -> None:
    """修改全局变量"""
    global count  # 声明使用全局变量
    count += 1

print(count)  # 0
increment_global()
print(count)  # 1
```

### nonlocal 关键字

```python
def outer() -> None:
    """外部函数"""
    count = 0
    
    def inner() -> None:
        """内部函数"""
        nonlocal count  # 声明使用外层函数的变量
        count += 1
    
    print(f"内部函数调用前: {count}")  # 0
    inner()
    print(f"内部函数调用后: {count}")  # 1

outer()
```

### 嵌套函数

```python
def make_multiplier(n: int):
    """创建乘法函数"""
    def multiplier(x: int) -> int:
        return x * n
    return multiplier

# 创建特定的乘法函数
times_3 = make_multiplier(3)
times_5 = make_multiplier(5)

print(times_3(10))  # 30
print(times_5(10))  # 50
```

---

## Lambda 函数

### 基本语法

```python
# Lambda 函数（匿名函数）
square = lambda x: x ** 2
print(square(5))  # 25

# 等价于
def square(x: int) -> int:
    return x ** 2
```

### Lambda 与内置函数

```python
# map()：对每个元素应用函数
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x ** 2, numbers))
print(squared)  # [1, 4, 9, 16, 25]

# filter()：过滤元素
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)  # [2, 4, 6, 8, 10]

# sorted()：自定义排序
students = [
    {"name": "张三", "age": 25},
    {"name": "李四", "age": 20},
    {"name": "王五", "age": 30}
]
sorted_students = sorted(students, key=lambda x: x["age"])
print([s["name"] for s in sorted_students])  # ['李四', '张三', '王五']
```

### Lambda 的限制

```python
# Lambda 只能包含一个表达式
add = lambda x, y: x + y  # ✅ 正确

# 以下不推荐
# bad_lambda = lambda x: (
#     if x > 0:
#         return "positive"
#     else:
#         return "negative"
# )  # ❌ 错误：不能使用多行语句

# 使用普通函数替代
def classify_number(x: int) -> str:
    if x > 0:
        return "positive"
    return "negative"
```

---

## 装饰器基础

### 理解装饰器

装饰器是 Python 的一个强大特性，允许在不修改原函数的情况下增强其功能。

### 基本装饰器

```python
def my_decorator(func):
    """简单的装饰器"""
    def wrapper():
        print("函数调用前")
        func()
        print("函数调用后")
    return wrapper

@my_decorator
def say_hello():
    """简单的函数"""
    print("Hello!")

say_hello()
# 输出：
# 函数调用前
# Hello!
# 函数调用后
```

### 带参数的装饰器

```python
def timing_decorator(func):
    """计时装饰器"""
    import time
    
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"{func.__name__} 执行时间: {end_time - start_time:.4f} 秒")
        return result
    return wrapper

@timing_decorator
def slow_function():
    """慢速函数"""
    import time
    time.sleep(1)
    print("函数执行完毕")

slow_function()
# 输出：
# 函数执行完毕
# slow_function 执行时间: 1.0012 秒
```

### 带参数的装饰器工厂

```python
def repeat(times: int):
    """重复执行装饰器"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                func(*args, **kwargs)
        return wrapper
    return decorator

@repeat(3)
def greet(name: str):
    print(f"Hello, {name}!")

greet("Python")
# 输出：
# Hello, Python!
# Hello, Python!
# Hello, Python!
```

---

## 高阶函数

### 接受函数作为参数

```python
def apply_operation(numbers: list[int], operation) -> list[int]:
    """对列表中的每个数字应用操作"""
    return [operation(num) for num in numbers]

# 使用不同的操作
numbers = [1, 2, 3, 4, 5]

squared = apply_operation(numbers, lambda x: x ** 2)
print(squared)  # [1, 4, 9, 16, 25]

cubed = apply_operation(numbers, lambda x: x ** 3)
print(cubed)  # [1, 8, 27, 64, 125]
```

### 返回函数

```python
def power(n: int):
    """返回一个计算 n 次方的函数"""
    def inner(x: int) -> int:
        return x ** n
    return inner

square = power(2)
cube = power(3)

print(square(5))  # 25
print(cube(5))    # 125
```

### 常用高阶函数

```python
from functools import reduce

# reduce：将列表归约为一个值
numbers = [1, 2, 3, 4, 5]
sum_result = reduce(lambda x, y: x + y, numbers)
print(sum_result)  # 15

product = reduce(lambda x, y: x * y, numbers)
print(product)  # 120
```

---

## Python vs JavaScript 对比

### 函数定义

| 特性           | Python              | JavaScript           |
| -------------- | ------------------- | -------------------- |
| 定义关键字     | `def`               | `function`           |
| 参数类型提示   | 支持                | TypeScript 支持      |
| 返回值类型提示 | 支持                | TypeScript 支持      |
| 默认参数       | `def func(x=1):`    | `function func(x=1)` |
| 可变参数       | `*args`, `**kwargs` | `...args`            |
| 匿名函数       | `lambda x: x`       | `x => x`             |

### 代码示例对比

```python
# Python 函数
def add(a: int, b: int = 10) -> int:
    return a + b

result = add(5)
print(result)  # 15

# Lambda 函数
square = lambda x: x ** 2
print(square(5))  # 25
```

```javascript
// JavaScript 函数
function add(a, b = 10) {
    return a + b;
}

const result = add(5);
console.log(result);  // 15

// 箭头函数
const square = x => x ** 2;
console.log(square(5));  // 25
```

---

## 练习题

### 练习 1：计算器

创建一个程序 `calculator.py`：
1. 实现加、减、乘、除四个函数
2. 使用装饰器记录每次计算
3. 处理除数为零的情况
4. 提供命令行界面

### 练习 2：数据处理

创建一个程序 `data_processor.py`：
1. 定义一个处理数字列表的函数
2. 使用 Lambda 函数进行过滤和转换
3. 计算平均值、最大值、最小值
4. 使用高阶函数实现

### 练习 3：缓存装饰器

创建一个程序 `memoization.py`：
1. 实现一个缓存装饰器
2. 应用到斐波那契数列函数
3. 比较有缓存和无缓存的性能差异
4. 测试装饰器的效果

---

## 练习答案

<details>
<summary>点击查看练习 1 答案</summary>

```python
# calculator.py
from functools import wraps
from typing import Callable

def log_operation(func: Callable) -> Callable:
    """记录操作的装饰器"""
    @wraps(func)
    def wrapper(a: float, b: float) -> float:
        try:
            result = func(a, b)
            operation_name = func.__name__
            print(f"{operation_name}({a}, {b}) = {result}")
            return result
        except ZeroDivisionError:
            print(f"错误：不能除以零")
            return None
    return wrapper

@log_operation
def add(a: float, b: float) -> float:
    """加法"""
    return a + b

@log_operation
def subtract(a: float, b: float) -> float:
    """减法"""
    return a - b

@log_operation
def multiply(a: float, b: float) -> float:
    """乘法"""
    return a * b

@log_operation
def divide(a: float, b: float) -> float:
    """除法"""
    return a / b

def main():
    """主程序"""
    print("简单计算器")
    print("=" * 40)
    print("可用操作:")
    print("  1. 加法")
    print("  2. 减法")
    print("  3. 乘法")
    print("  4. 除法")
    print("  5. 退出")
    
    operations = {
        "1": ("加法", add),
        "2": ("减法", subtract),
        "3": ("乘法", multiply),
        "4": ("除法", divide)
    }
    
    while True:
        print("\n" + "=" * 40)
        choice = input("请选择操作 (1-5): ")
        
        if choice == "5":
            print("再见！")
            break
        
        if choice not in operations:
            print("无效选择，请重试")
            continue
        
        try:
            num1 = float(input("请输入第一个数字: "))
            num2 = float(input("请输入第二个数字: "))
            
            operation_name, operation_func = operations[choice]
            print(f"\n执行{operation_name}:")
            result = operation_func(num1, num2)
            
            if result is not None:
                print(f"结果: {result}")
                
        except ValueError:
            print("错误：请输入有效的数字")
        except KeyboardInterrupt:
            print("\n\n程序被中断")
            break

if __name__ == "__main__":
    main()
```

运行示例：
```bash
python3 calculator.py
# 输出：
# 简单计算器
# ========================================
# 可用操作:
#   1. 加法
#   2. 减法
#   3. 乘法
#   4. 除法
#   5. 退出
# 
# ========================================
# 请选择操作 (1-5): 1
# 请输入第一个数字: 10
# 请输入第二个数字: 5
# 
# 执行加法:
# add(10.0, 5.0) = 15.0
# 结果: 15.0
# 
# ========================================
# 请选择操作 (1-5): 4
# 请输入第一个数字: 10
# 请输入第二个数字: 0
# 
# 执行除法:
# 错误：不能除以零
# 
# ========================================
# 请选择操作 (1-5): 5
# 再见！
```

</details>

<details>
<summary>点击查看练习 2 答案</summary>

```python
# data_processor.py
from typing import List, Callable

def process_numbers(
    numbers: List[int],
    filters: List[Callable[[int], bool]] = None,
    transforms: List[Callable[[int], int]] = None
) -> List[int]:
    """
    处理数字列表
    
    Args:
        numbers: 输入的数字列表
        filters: 过滤函数列表
        transforms: 转换函数列表
    
    Returns:
        处理后的数字列表
    """
    result = numbers.copy()
    
    # 应用过滤器
    if filters:
        for filter_func in filters:
            result = list(filter(filter_func, result))
    
    # 应用转换器
    if transforms:
        for transform_func in transforms:
            result = list(map(transform_func, result))
    
    return result

def calculate_statistics(numbers: List[int]) -> dict:
    """计算统计信息"""
    if not numbers:
        return {"error": "列表为空"}
    
    return {
        "count": len(numbers),
        "sum": sum(numbers),
        "average": sum(numbers) / len(numbers),
        "min": min(numbers),
        "max": max(numbers)
    }

def main():
    """主程序"""
    print("数据处理程序")
    print("=" * 40)
    
    # 示例数据
    numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    print(f"原始数据: {numbers}")
    
    # 定义过滤器和转换器
    filters = [
        lambda x: x > 3,           # 大于 3
        lambda x: x % 2 == 0       # 偶数
    ]
    
    transforms = [
        lambda x: x ** 2,          # 平方
        lambda x: x // 10          # 除以 10
    ]
    
    # 处理数据
    print("\n处理步骤:")
    print("1. 过滤：大于 3 且为偶数")
    filtered = process_numbers(numbers, filters)
    print(f"   结果: {filtered}")
    
    print("\n2. 转换：平方后除以 10")
    transformed = process_numbers(numbers, transforms=transforms)
    print(f"   结果: {transformed}")
    
    print("\n3. 综合处理：先过滤再转换")
    result = process_numbers(numbers, filters, transforms)
    print(f"   结果: {result}")
    
    # 计算统计信息
    print("\n" + "=" * 40)
    print("统计信息:")
    
    print("\n原始数据:")
    stats = calculate_statistics(numbers)
    for key, value in stats.items():
        print(f"  {key}: {value}")
    
    print("\n过滤后的数据:")
    stats = calculate_statistics(filtered)
    for key, value in stats.items():
        print(f"  {key}: {value}")
    
    # 高阶函数示例
    print("\n" + "=" * 40)
    print("高阶函数示例:")
    
    # 使用 map
    doubled = list(map(lambda x: x * 2, numbers))
    print(f"每个数字乘以 2: {doubled}")
    
    # 使用 filter
    primes = list(filter(lambda x: all(x % i != 0 for i in range(2, int(x**0.5) + 1)), numbers))
    print(f"素数: {primes}")
    
    # 使用 reduce
    from functools import reduce
    product = reduce(lambda x, y: x * y, numbers)
    print(f"所有数字的乘积: {product}")

if __name__ == "__main__":
    main()
```

运行示例：
```bash
python3 data_processor.py
# 输出：
# 数据处理程序
# ========================================
# 原始数据: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
# 
# 处理步骤:
# 1. 过滤：大于 3 且为偶数
#    结果: [4, 6, 8, 10]
# 
# 2. 转换：平方后除以 10
#    结果: [0, 0, 1, 2, 4, 6, 9, 12, 16, 20]
# 
# 3. 综合处理：先过滤再转换
#    结果: [1, 3, 6, 10]
# 
# ========================================
# 统计信息:
# 
# 原始数据:
#   count: 10
#   sum: 55
#   average: 5.5
#   min: 1
#   max: 10
# 
# 过滤后的数据:
#   count: 4
#   sum: 28
#   average: 7.0
#   min: 4
#   max: 10
# 
# ========================================
# 高阶函数示例:
# 每个数字乘以 2: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
# 素数: [2, 3, 5, 7]
# 所有数字的乘积: 3628800
```

</details>

<details>
<summary>点击查看练习 3 答案</summary>

```python
# memoization.py
import time
from functools import wraps
from typing import Callable, Dict

def memoize(func: Callable) -> Callable:
    """
    缓存装饰器
    
    缓存函数的结果，避免重复计算
    """
    cache: Dict = {}
    
    @wraps(func)
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    
    return wrapper

# 无缓存的斐波那契函数
def fibonacci_without_cache(n: int) -> int:
    """计算斐波那契数列（无缓存）"""
    if n <= 1:
        return n
    return fibonacci_without_cache(n - 1) + fibonacci_without_cache(n - 2)

# 有缓存的斐波那契函数
@memoize
def fibonacci_with_cache(n: int) -> int:
    """计算斐波那契数列（有缓存）"""
    if n <= 1:
        return n
    return fibonacci_with_cache(n - 1) + fibonacci_with_cache(n - 2)

def test_performance(func: Callable, n: int, name: str) -> int:
    """测试函数性能"""
    start_time = time.time()
    result = func(n)
    end_time = time.time()
    elapsed = end_time - start_time
    print(f"{name}({n}) = {result}")
    print(f"执行时间: {elapsed:.6f} 秒")
    print(f"缓存大小: {len(func.cache) if hasattr(func, 'cache') else 'N/A'}")
    return result

def main():
    """主程序"""
    print("缓存装饰器性能测试")
    print("=" * 40)
    
    # 测试不同的斐波那契数
    test_numbers = [30, 35, 40]
    
    for n in test_numbers:
        print(f"\n测试斐波那契数列 F({n}):")
        print("-" * 40)
        
        # 测试无缓存版本
        print("\n无缓存版本:")
        result1 = test_performance(fibonacci_without_cache, n, "fibonacci_without_cache")
        
        # 测试有缓存版本
        print("\n有缓存版本:")
        result2 = test_performance(fibonacci_with_cache, n, "fibonacci_with_cache")
        
        # 验证结果一致
        if result1 == result2:
            print("\n✓ 结果一致")
        else:
            print("\n✗ 结果不一致！")
        
        # 测试缓存的效率
        print(f"\n第二次调用（应该使用缓存）:")
        start_time = time.time()
        result3 = fibonacci_with_cache(n)
        end_time = time.time()
        print(f"fibonacci_with_cache({n}) = {result3}")
        print(f"执行时间: {end_time - start_time:.6f} 秒")
    
    # 演示其他函数的缓存
    print("\n" + "=" * 40)
    print("其他函数的缓存示例:")
    
    @memoize
    def expensive_calculation(x: int) -> int:
        """耗时的计算"""
        print(f"计算 {x} 的平方...")
        time.sleep(0.1)  # 模拟耗时操作
        return x ** 2
    
    print("\n第一次调用:")
    start = time.time()
    result1 = expensive_calculation(10)
    print(f"结果: {result1}, 时间: {time.time() - start:.3f} 秒")
    
    print("\n第二次调用（使用缓存）:")
    start = time.time()
    result2 = expensive_calculation(10)
    print(f"结果: {result2}, 时间: {time.time() - start:.3f} 秒")

if __name__ == "__main__":
    main()
```

运行示例：
```bash
python3 memoization.py
# 输出：
# 缓存装饰器性能测试
# ========================================
# 
# 测试斐波那契数列 F(30):
# ----------------------------------------
# 
# 无缓存版本:
# fibonacci_without_cache(30) = 832040
# 执行时间: 0.234567 秒
# 缓存大小: N/A
# 
# 有缓存版本:
# fibonacci_with_cache(30) = 832040
# 执行时间: 0.000123 秒
# 缓存大小: 31
# 
# 第二次调用（应该使用缓存）:
# fibonacci_with_cache(30) = 832040
# 执行时间: 0.000001 秒
# 
# 测试斐波那契数列 F(35):
# ...
# 
# ========================================
# 其他函数的缓存示例:
# 
# 第一次调用:
# 计算 10 的平方...
# 结果: 100, 时间: 0.101 秒
# 
# 第二次调用（使用缓存）:
# 结果: 100, 时间: 0.000 秒
```

</details>

---

## 本章小结

✅ 你已经学会了：
- 函数的定义和调用
- 各种参数形式（位置参数、关键字参数、可变参数）
- 返回值的使用
- 作用域的概念（局部、全局、nonlocal）
- Lambda 函数的使用
- 装饰器的基础概念
- 高阶函数的应用
- Python 与 JavaScript 的函数对比

## 下一章

[阶段项目1：命令行待办事项管理器](/project-01/) - 综合运用前面学到的知识，创建一个实用的命令行工具。