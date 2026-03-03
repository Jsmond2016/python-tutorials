# Python Lambda 表达式详解

> 创建时间：2026-03-03

Lambda 是 Python 中的**匿名函数**（Anonymous Function），是一种简洁的定义单行函数的方式。本文将详细介绍 lambda 表达式的语法、使用场景和最佳实践。

## 一、基本语法

```python
lambda 参数: 表达式
```

### 与普通函数对比

```python
# 普通函数
def add(a, b):
    return a + b

# lambda 表达式（等价写法）
add = lambda a, b: a + b

# 使用
print(add(3, 5))  # 8
```

## 二、常见使用场景

### 1. 作为 sorted() 的 key 参数

这是 lambda 最常见的使用场景之一：

```python
students = [
    {"name": "张三", "score": 88},
    {"name": "李四", "score": 78},
    {"name": "王五", "score": 66},
]

# 按分数排序
sorted_students = sorted(students, key=lambda x: x['score'])

# 按分数降序
sorted_students = sorted(students, key=lambda x: x['score'], reverse=True)

# 按名字长度排序
sorted_students = sorted(students, key=lambda x: len(x['name']))

# 多条件排序：先按分数降序，分数相同按年龄升序
sorted(students, key=lambda x: (-x['score'], x['age']))
```

### 2. 与 map() 配合使用

```python
numbers = [1, 2, 3, 4, 5]

# 每个数平方
squares = list(map(lambda x: x ** 2, numbers))
# [1, 4, 9, 16, 25]
```

::: tip 推荐使用列表推导式
列表推导式通常更简洁易读：`[x ** 2 for x in numbers]`
:::

### 3. 与 filter() 配合使用

```python
numbers = [1, 2, 3, 4, 5, 6]

# 筛选偶数
evens = list(filter(lambda x: x % 2 == 0, numbers))
# [2, 4, 6]
```

### 4. 与 reduce() 配合使用

```python
from functools import reduce

numbers = [1, 2, 3, 4, 5]

# 求和
total = reduce(lambda a, b: a + b, numbers)
# 15

# 求最大值
maximum = reduce(lambda a, b: a if a > b else b, numbers)
# 5
```

## 三、进阶用法

### 多参数 lambda

```python
# 两个参数
multiply = lambda x, y: x * y
print(multiply(3, 4))  # 12

# 默认参数
greet = lambda name, greeting="你好": f"{greeting}, {name}"
print(greet("张三"))           # 你好, 张三
print(greet("李四", "早上好"))  # 早上好, 李四
```

### 条件表达式

```python
# 判断奇偶
check = lambda x: "偶数" if x % 2 == 0 else "奇数"
print(check(4))  # 偶数
print(check(5))  # 奇数

# 取绝对值
abs_val = lambda x: x if x >= 0 else -x

# 取较大值
max_val = lambda a, b: a if a > b else b
```

### 立即执行（IIFE）

```python
# 定义并立即调用
result = (lambda x, y: x + y)(3, 5)
print(result)  # 8
```

## 四、Lambda 的限制

Lambda 表达式只能包含**单个表达式**，不能包含语句：

```python
# ❌ 不能包含多个语句
lambda x: x += 1; return x  # 语法错误

# ❌ 不能包含赋值语句
lambda x: y = x + 1  # 语法错误

# ❌ 不能包含多行代码
lambda x:
    if x > 0:
        return x
    else:
        return -x  # 语法错误

# ✅ 条件表达式是允许的（因为是单个表达式）
lambda x: x if x > 0 else -x
```

## 五、使用建议

### 什么时候用 Lambda？

| 场景 | 推荐 |
|------|------|
| 简单的一次性函数 | ✅ Lambda |
| 需要复用的函数 | ❌ 用 `def` |
| 逻辑复杂（多行） | ❌ 用 `def` |
| 作为回调/key 函数 | ✅ Lambda |
| 需要文档字符串 | ❌ 用 `def` |

### 替代方案：operator 模块

对于简单的操作，`operator` 模块通常比 lambda 更快：

```python
from operator import itemgetter, attrgetter

# 按字典的某个键排序
sorted(students, key=itemgetter('score'))

# 按对象的某个属性排序
sorted(objects, key=attrgetter('name'))
```

## 六、总结

| 特点 | 说明 |
|------|------|
| 关键字 | `lambda` |
| 参数 | 可以有 0 个或多个 |
| 返回值 | 自动返回表达式的结果 |
| 限制 | 只能包含一个表达式 |
| 用途 | 简洁的回调函数、排序 key 等 |

**一句话总结**：Lambda 就是**单行匿名函数**，适合简单、一次性使用的场景，特别是在排序、映射、过滤等操作中作为回调函数使用。

## 相关阅读

- [Python 官方文档 - Lambda 表达式](https://docs.python.org/zh-cn/3/tutorial/controlflow.html#lambda-expressions)
- [Python sorted() 函数详解](/chapter-03/)
- [Python 函数基础](/chapter-05/)
