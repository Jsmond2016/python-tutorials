# Python 控制流程 - 知识点总结与 JS 对比

> 创建时间：2026-03-04

## 核心知识点

### 1. 条件语句

#### if-elif-else 语法
```python
if condition:
    # code
elif another_condition:
    # code
else:
    # code
```

#### 三元运算符
```python
# Python: 值在中间
result = "成年" if age >= 18 else "未成年"

# JS: 条件在中间
# const result = age >= 18 ? "成年" : "未成年";
```

### 2. 逻辑运算符

| Python | JavaScript |
|--------|------------|
| `and`  | `&&`       |
| `or`   | `\|\|`     |
| `not`  | `!`        |

### 3. 比较运算符

- **链式比较**: Python 特有
  ```python
  # Python
  if 18 <= age <= 30:
      print("年轻人")

  # JS 需要拆分
  // if (age >= 18 && age <= 30)
  ```

- **身份运算符**: `is` / `is not` (类似 JS 的 `===` 但检查对象同一性)

### 4. 成员运算符

```python
# Python 有专用的 in 运算符
if "apple" in fruits:
    print("有苹果")

# JS 数组需要用 includes
// if (fruits.includes("apple"))
```

### 5. 循环语句

#### for 循环
```python
# Python: for-in 遍历
for item in list:
    print(item)

# 使用 range
for i in range(5):
    print(i)

# JS: for-of 或传统 for
// for (const item of list)
// for (let i = 0; i < 5; i++)
```

#### enumerate 和 zip
```python
# 获取索引
for index, item in enumerate(items):
    print(f"{index}: {item}")

# 并行遍历
for name, age in zip(names, ages):
    print(f"{name}: {age}")
```

#### while-else 和 for-else
```python
# Python 特有：循环正常结束执行 else
for item in items:
    if item == target:
        break
else:
    print("未找到目标")  # 没有 break 时执行
```

### 6. 列表推导式

```python
# 基本形式
squares = [x**2 for x in range(10)]

# 带条件
evens = [x for x in range(10) if x % 2 == 0]

# 带条件表达式
labels = ["even" if x % 2 == 0 else "odd" for x in range(10)]

# 嵌套循环
flattened = [item for row in matrix for item in row]

# 字典推导式
word_lengths = {word: len(word) for word in words}

# 集合推导式
unique_squares = {x**2 for x in numbers}
```

### 7. break、continue、pass

```python
break     # 跳出循环
continue  # 跳过当前迭代
pass      # 占位符，什么都不做
```

### 8. match-case (Python 3.10+)

```python
match value:
    case pattern1:
        # code
    case pattern2 if guard_condition:
        # code with guard
    case _:
        # default (类似 switch 的 default)
```

---

## Python vs JavaScript 关键差异

| 特性 | Python | JavaScript |
|------|--------|------------|
| **代码块** | 缩进 | 花括号 `{}` |
| **多分支条件** | `elif` | `else if` |
| **三元运算符** | `x if cond else y` | `cond ? x : y` |
| **逻辑运算符** | `and`, `or`, `not` | `&&`, `\|\|`, `!` |
| **for 循环** | `for x in iterable` | `for (x of iterable)` |
| **索引循环** | `for i in range(n)` | `for (let i=0; i<n; i++)` |
| **遍历字典** | `for k,v in d.items()` | `for ([k,v] of Object.entries(d))` |
| **switch** | `match-case` (3.10+) | `switch-case` |
| **列表推导式** | ✅ 内置 | ❌ 用 map/filter |
| **循环 else** | ✅ 支持 | ❌ 不支持 |
| **pass 占位** | ✅ 有 | 需用空块 `{}` |

---

## 代码对比示例

### 条件判断
```python
# Python
if age >= 18 and has_license:
    print("可以开车")
elif age < 18:
    print("未成年")
else:
    print("需要驾照")
```

```javascript
// JavaScript
if (age >= 18 && hasLicense) {
    console.log("可以开车");
} else if (age < 18) {
    console.log("未成年");
} else {
    console.log("需要驾照");
}
```

### 循环
```python
# Python
for i, name in enumerate(names):
    print(f"{i}: {name}")
```

```javascript
// JavaScript
names.forEach((name, i) => {
    console.log(`${i}: ${name}`);
});
```

### 列表操作
```python
# Python - 列表推导式
evens = [x for x in range(10) if x % 2 == 0]
```

```javascript
// JavaScript - filter
const evens = [...Array(10).keys()].filter(x => x % 2 === 0);
```

---

## 记忆要点

1. **缩进是语法** - Python 用缩进表示代码块，必须保持一致
2. **没有花括号** - 条件和循环后用冒号 `:` 开始
3. **elif 不是 else if** - 注意拼写
4. **and/or/not** - 逻辑运算符是单词而非符号
5. **循环可以有 else** - 正常结束（无 break）时执行
6. **pass 是占位符** - 空代码块必须用 pass，不能留空
7. **列表推导式很强大** - 比 JS 的 map/filter 更简洁
8. **match-case 是模式匹配** - 不仅仅是 switch，支持解构和守卫
