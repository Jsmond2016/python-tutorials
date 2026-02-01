# 第6章：面向对象编程

面向对象编程（OOP）是 Python 的核心特性之一。如果你熟悉 JavaScript 的 ES6 类，你会发现 Python 的 OOP 非常相似。

## 学习目标

- 理解类和对象的概念
- 掌握属性和方法的使用
- 学习继承和多态
- 理解封装和私有成员
- 掌握特殊方法（魔法方法）

## 目录

1. [类和对象](#类和对象)
2. [属性和方法](#属性和方法)
3. [继承](#继承)
4. [多态](#多态)
5. [封装](#封装)
6. [特殊方法](#特殊方法)
7. [Python vs JavaScript 对比](#python-vs-javascript-对比)
8. [练习题](#练习题)
9. [练习答案](#练习答案)

---

## 类和对象

### 定义类

```python
# 基本类定义
class Person:
    """人类"""
    
    def __init__(self, name: str, age: int):
        """初始化方法"""
        self.name = name
        self.age = age
    
    def greet(self) -> str:
        """打招呼"""
        return f"你好，我是 {self.name}，今年 {self.age} 岁"

# 创建对象（实例化）
person1 = Person("张三", 25)
person2 = Person("李四", 30)

print(person1.greet())  # 你好，我是 张三，今年 25 岁
print(person2.greet())  # 你好，我是 李四，今年 30 岁
```

### __init__ 方法

```python
class Dog:
    """狗类"""
    
    def __init__(self, name: str, breed: str):
        """
        初始化方法（构造函数）
        
        Args:
            name: 狗的名字
            breed: 狗的品种
        """
        self.name = name
        self.breed = breed
        self.energy = 100  # 默认能量值
    
    def bark(self) -> None:
        """叫"""
        if self.energy > 0:
            print(f"{self.name}: 汪汪！")
            self.energy -= 10
        else:
            print(f"{self.name}: 太累了，叫不动了")
    
    def rest(self) -> None:
        """休息恢复能量"""
        self.energy = 100
        print(f"{self.name} 休息后能量恢复了！")

# 使用
dog = Dog("旺财", "金毛")
dog.bark()  # 旺财: 汪汪！
dog.bark()  # 旺财: 汪汪！
print(dog.energy)  # 80
dog.rest()
print(dog.energy)  # 100
```

---

## 属性和方法

### 实例属性和类属性

```python
class Car:
    """汽车类"""
    
    # 类属性（所有实例共享）
    wheels = 4
    
    def __init__(self, brand: str, color: str):
        """初始化"""
        self.brand = brand  # 实例属性
        self.color = color  # 实例属性
    
    def describe(self) -> str:
        """描述汽车"""
        return f"这是一辆 {self.color} 的 {self.brand}"

# 创建实例
car1 = Car("丰田", "红色")
car2 = Car("本田", "蓝色")

print(car1.wheels)  # 4
print(car2.wheels)  # 4

# 修改类属性（影响所有实例）
Car.wheels = 6
print(car1.wheels)  # 6
print(car2.wheels)  # 6

# 修改实例属性（只影响当前实例）
car1.color = "绿色"
print(car1.describe())  # 这是一辆 绿色的 丰田
print(car2.describe())  # 这是一辆 蓝色的 本田
```

### 实例方法、类方法和静态方法

```python
class Calculator:
    """计算器类"""
    
    def __init__(self, value: float = 0):
        """初始化"""
        self.value = value
    
    # 实例方法（第一个参数是 self）
    def add(self, num: float) -> float:
        """加法"""
        self.value += num
        return self.value
    
    # 类方法（第一个参数是 cls）
    @classmethod
    def from_string(cls, value_str: str):
        """从字符串创建计算器"""
        value = float(value_str)
        return cls(value)
    
    # 静态方法（没有 self 或 cls）
    @staticmethod
    def multiply(a: float, b: float) -> float:
        """乘法（静态方法）"""
        return a * b

# 使用
calc = Calculator(10)
print(calc.add(5))  # 15

# 使用类方法创建实例
calc2 = Calculator.from_string("20")
print(calc2.value)  # 20

# 使用静态方法
print(Calculator.multiply(3, 4))  # 12
```

### 属性装饰器（property）

```python
class BankAccount:
    """银行账户类"""
    
    def __init__(self, owner: str, balance: float = 0):
        """初始化"""
        self._owner = owner
        self._balance = balance  # 私有属性
    
    @property
    def balance(self) -> float:
        """获取余额（只读属性）"""
        return self._balance
    
    def deposit(self, amount: float) -> None:
        """存款"""
        if amount > 0:
            self._balance += amount
            print(f"存款 {amount} 元，当前余额: {self._balance} 元")
        else:
            print("存款金额必须大于 0")
    
    def withdraw(self, amount: float) -> None:
        """取款"""
        if amount > self._balance:
            print("余额不足")
        else:
            self._balance -= amount
            print(f"取款 {amount} 元，当前余额: {self._balance} 元")

# 使用
account = BankAccount("张三", 1000)
print(account.balance)  # 1000

account.deposit(500)  # 存款 500 元，当前余额: 1500 元
account.withdraw(200)  # 取款 200 元，当前余额: 1300 元

# account.balance = 0  # 报错：不能设置只读属性
```

---

## 继承

### 基本继承

```python
class Animal:
    """动物基类"""
    
    def __init__(self, name: str):
        """初始化"""
        self.name = name
    
    def speak(self) -> str:
        """发出声音"""
        return f"{self.name} 发出声音"

class Dog(Animal):
    """狗类（继承自 Animal）"""
    
    def speak(self) -> str:
        """覆盖父类方法"""
        return f"{self.name}: 汪汪！"
    
    def fetch(self) -> str:
        """新方法"""
        return f"{self.name} 去捡球了"

class Cat(Animal):
    """猫类（继承自 Animal）"""
    
    def speak(self) -> str:
        """覆盖父类方法"""
        return f"{self.name}: 喵喵！"

# 使用
dog = Dog("旺财")
cat = Cat("咪咪")

print(dog.speak())  # 旺财: 汪汪！
print(cat.speak())  # 咪咪: 喵喵！
print(dog.fetch())  # 旺财 去捡球了
```

### 调用父类方法

```python
class Person:
    """人类"""
    
    def __init__(self, name: str, age: int):
        """初始化"""
        self.name = name
        self.age = age
    
    def introduce(self) -> str:
        """介绍"""
        return f"我叫 {self.name}，今年 {self.age} 岁"

class Student(Person):
    """学生类（继承自 Person）"""
    
    def __init__(self, name: str, age: int, student_id: str):
        """初始化"""
        # 调用父类的 __init__ 方法
        super().__init__(name, age)
        self.student_id = student_id
    
    def introduce(self) -> str:
        """覆盖并扩展父类方法"""
        # 调用父类方法
        base_intro = super().introduce()
        return f"{base_intro}，学号是 {self.student_id}"

# 使用
student = Student("张三", 20, "2024001")
print(student.introduce())
# 输出：我叫 张三，今年 20 岁，学号是 2024001
```

### 多重继承

```python
class Flyer:
    """飞行能力"""
    
    def fly(self) -> str:
        """飞行"""
        return "可以飞行"

class Swimmer:
    """游泳能力"""
    
    def swim(self) -> str:
        """游泳"""
        return "可以游泳"

class Duck(Flyer, Swimmer):
    """鸭子类（多重继承）"""
    
    def __init__(self, name: str):
        """初始化"""
        self.name = name
    
    def speak(self) -> str:
        """嘎嘎叫"""
        return f"{self.name}: 嘎嘎！"

# 使用
duck = Duck("唐老鸭")
print(duck.speak())  # 唐老鸭: 嘎嘎！
print(duck.fly())  # 可以飞行
print(duck.swim())  # 可以游泳
```

---

## 多态

```python
class Shape:
    """形状基类"""
    
    def area(self) -> float:
        """计算面积"""
        raise NotImplementedError("子类必须实现 area 方法")

class Rectangle(Shape):
    """矩形类"""
    
    def __init__(self, width: float, height: float):
        """初始化"""
        self.width = width
        self.height = height
    
    def area(self) -> float:
        """计算矩形面积"""
        return self.width * self.height

class Circle(Shape):
    """圆形类"""
    
    def __init__(self, radius: float):
        """初始化"""
        self.radius = radius
    
    def area(self) -> float:
        """计算圆形面积"""
        import math
        return math.pi * self.radius ** 2

class Triangle(Shape):
    """三角形类"""
    
    def __init__(self, base: float, height: float):
        """初始化"""
        self.base = base
        self.height = height
    
    def area(self) -> float:
        """计算三角形面积"""
        return 0.5 * self.base * self.height

# 多态：统一调用不同类的相同方法
shapes = [
    Rectangle(5, 3),
    Circle(2),
    Triangle(4, 3)
]

for shape in shapes:
    print(f"{shape.__class__.__name__} 面积: {shape.area():.2f}")
# 输出：
# Rectangle 面积: 15.00
# Circle 面积: 12.57
# Triangle 面积: 6.00
```

---

## 封装

### 私有属性和方法

```python
class Employee:
    """员工类"""
    
    def __init__(self, name: str, salary: float):
        """初始化"""
        self.name = name  # 公开属性
        self._salary = salary  # 受保护属性（约定）
        self.__bonus = 0  # 私有属性（名称修饰）
    
    def get_salary(self) -> float:
        """获取薪水"""
        return self._salary
    
    def set_salary(self, new_salary: float) -> None:
        """设置薪水"""
        if new_salary > 0:
            self._salary = new_salary
        else:
            print("薪水必须大于 0")
    
    def __calculate_bonus(self) -> float:
        """计算奖金（私有方法）"""
        return self._salary * 0.1
    
    def get_total_pay(self) -> float:
        """获取总薪酬"""
        bonus = self.__calculate_bonus()
        return self._salary + bonus

# 使用
employee = Employee("张三", 10000)
print(employee.name)  # 张三
print(employee.get_salary())  # 10000

# 访问受保护属性（不推荐，但可以）
print(employee._salary)  # 10000

# 尝试访问私有属性（会报错）
# print(employee.__bonus)  # AttributeError

# 实际上私有属性被重命名为 _Employee__bonus
# print(employee._Employee__bonus)  # 0（不推荐这样做）
```

---

## 特殊方法

### 常用特殊方法

```python
class Point:
    """点类"""
    
    def __init__(self, x: float, y: float):
        """初始化"""
        self.x = x
        self.y = y
    
    def __str__(self) -> str:
        """字符串表示（用户友好）"""
        return f"Point({self.x}, {self.y})"
    
    def __repr__(self) -> str:
        """官方字符串表示（用于调试）"""
        return f"Point(x={self.x}, y={self.y})"
    
    def __add__(self, other: 'Point') -> 'Point':
        """加法运算符 +"""
        return Point(self.x + other.x, self.y + other.y)
    
    def __eq__(self, other: object) -> bool:
        """等于运算符 =="""
        if not isinstance(other, Point):
            return False
        return self.x == other.x and self.y == other.y
    
    def __len__(self) -> int:
        """长度函数 len()"""
        return 2  # 点有 2 个坐标

# 使用
p1 = Point(1, 2)
p2 = Point(3, 4)

print(str(p1))  # Point(1, 2)
print(repr(p1))  # Point(x=1, y=2)

p3 = p1 + p2
print(p3)  # Point(4, 6)

p4 = Point(1, 2)
print(p1 == p4)  # True

print(len(p1))  # 2
```

### 容器协议

```python
class ShoppingList:
    """购物清单类"""
    
    def __init__(self):
        """初始化"""
        self._items = []
    
    def add_item(self, item: str) -> None:
        """添加商品"""
        self._items.append(item)
    
    def __len__(self) -> int:
        """长度"""
        return len(self._items)
    
    def __getitem__(self, index: int) -> str:
        """索引访问"""
        return self._items[index]
    
    def __setitem__(self, index: int, value: str) -> None:
        """索引设置"""
        self._items[index] = value
    
    def __delitem__(self, index: int) -> None:
        """删除"""
        del self._items[index]
    
    def __contains__(self, item: str) -> bool:
        """in 运算符"""
        return item in self._items
    
    def __iter__(self):
        """迭代"""
        return iter(self._items)

# 使用
shopping = ShoppingList()
shopping.add_item("苹果")
shopping.add_item("香蕉")
shopping.add_item("橙子")

print(len(shopping))  # 3
print(shopping[0])  # 苹果
print("苹果" in shopping)  # True

shopping[1] = "葡萄"
print(shopping[1])  # 葡萄

del shopping[2]

for item in shopping:
    print(item)  # 苹果、葡萄
```

---

## Python vs JavaScript 对比

### 类定义

| 特性       | Python               | JavaScript                 |
| ---------- | -------------------- | -------------------------- |
| 定义关键字 | `class`              | `class`                    |
| 构造函数   | `__init__`           | `constructor`              |
| 实例属性   | `self.name`          | `this.name`                |
| 继承       | `class Dog(Animal):` | `class Dog extends Animal` |
| 私有属性   | `__name`             | `#name`（ES2022）          |

### 代码示例对比

```python
# Python
class Person:
    def __init__(self, name: str):
        self.name = name
    
    def greet(self) -> str:
        return f"Hello, {self.name}"

person = Person("Python")
print(person.greet())  # Hello, Python
```

```javascript
// JavaScript
class Person {
    constructor(name) {
        this.name = name;
    }
    
    greet() {
        return `Hello, ${this.name}`;
    }
}

const person = new Person("JavaScript");
console.log(person.greet());  // Hello, JavaScript
```

---

## 练习题

### 练习 1：图书管理系统

创建一个图书管理系统：
1. 创建 `Book` 类，包含书名、作者、价格等属性
2. 创建 `Library` 类，管理多本书
3. 实现添加、删除、查找图书的功能
4. 计算图书馆所有书的总价

### 练习 2：形状计算器

创建一个形状计算器：
1. 定义基类 `Shape`，包含计算面积的方法
2. 创建多个子类（矩形、圆形、三角形等）
3. 使用多态统一处理不同形状
4. 添加计算周长的功能

### 练习 3：学生管理系统

创建一个学生管理系统：
1. 创建 `Student` 类，包含学生信息
2. 创建 `Course` 类，表示课程
3. 实现学生选课和退课功能
4. 计算学生的平均成绩

---

## 练习答案

<details>
<summary>点击查看练习 1 答案</summary>

```python
class Book:
    """图书类"""
    
    def __init__(self, title: str, author: str, price: float, isbn: str):
        """
        初始化
        
        Args:
            title: 书名
            author: 作者
            price: 价格
            isbn: ISBN 编号
        """
        self.title = title
        self.author = author
        self.price = price
        self.isbn = isbn
        self.is_borrowed = False
    
    def __str__(self) -> str:
        """字符串表示"""
        status = "已借出" if self.is_borrowed else "可借阅"
        return f"《{self.title}》 - {self.author} - ¥{self.price} - {status}"
    
    def borrow(self) -> bool:
        """借书"""
        if self.is_borrowed:
            print(f"《{self.title}》已被借出")
            return False
        self.is_borrowed = True
        print(f"成功借出《{self.title}》")
        return True
    
    def return_book(self) -> None:
        """还书"""
        self.is_borrowed = False
        print(f"成功归还《{self.title}》")


class Library:
    """图书馆类"""
    
    def __init__(self, name: str):
        """
        初始化
        
        Args:
            name: 图书馆名称
        """
        self.name = name
        self.books: list[Book] = []
    
    def add_book(self, book: Book) -> None:
        """添加图书"""
        self.books.append(book)
        print(f"添加图书：{book.title}")
    
    def remove_book(self, isbn: str) -> bool:
        """删除图书"""
        for i, book in enumerate(self.books):
            if book.isbn == isbn:
                removed_book = self.books.pop(i)
                print(f"删除图书：{removed_book.title}")
                return True
        print(f"未找到 ISBN 为 {isbn} 的图书")
        return False
    
    def find_book(self, keyword: str) -> list[Book]:
        """查找图书"""
        results = [
            book for book in self.books
            if keyword.lower() in book.title.lower() or
            keyword.lower() in book.author.lower()
        ]
        return results
    
    def list_books(self) -> None:
        """列出所有图书"""
        if not self.books:
            print("图书馆暂无图书")
            return
        
        print(f"\n{self.name} 图书列表：")
        print("=" * 60)
        for book in self.books:
            print(book)
        print("=" * 60)
    
    def total_value(self) -> float:
        """计算所有图书总价"""
        return sum(book.price for book in self.books)


# 演示
if __name__ == "__main__":
    library = Library("城市图书馆")
    
    # 添加图书
    book1 = Book("Python 编程", "Guido van Rossum", 89.00, "978-7-111-12345-6")
    book2 = Book("JavaScript 高级程序设计", "Nicholas C. Zakas", 99.00, "978-7-111-23456-7")
    book3 = Book("深入理解计算机系统", "Randal E. Bryant", 139.00, "978-7-111-34567-8")
    
    library.add_book(book1)
    library.add_book(book2)
    library.add_book(book3)
    
    # 列出图书
    library.list_books()
    
    # 查找图书
    print("\n搜索 'Python'：")
    results = library.find_book("Python")
    for book in results:
        print(book)
    
    # 借书
    book1.borrow()
    book1.borrow()  # 尝试再次借阅
    
    # 计算总价
    print(f"\n图书馆图书总价: ¥{library.total_value():.2f}")
    
    # 还书
    book1.return_book()
    
    # 删除图书
    library.remove_book("978-7-111-23456-7")
```

运行示例：
```bash
python3 library.py
# 输出：
# 添加图书：Python 编程
# 添加图书：JavaScript 高级程序设计
# 添加图书：深入理解计算机系统
# 
# 城市图书馆 图书列表：
# ============================================================
# 《Python 编程》 - Guido van Rossum - ¥89.0 - 可借阅
# 《JavaScript 高级程序设计》 - Nicholas C. Zakas - ¥99.0 - 可借阅
# 《深入理解计算机系统》 - Randal E. Bryant - ¥139.0 - 可借阅
# ============================================================
# 
# 搜索 'Python'：
# 《Python 编程》 - Guido van Rossum - ¥89.0 - 可借阅
# 成功借出《Python 编程》
# 《Python 编程》已被借出
# 
# 图书馆图书总价: ¥327.00
# 成功归还《Python 编程》
# 删除图书：JavaScript 高级程序设计
```

</details>

<details>
<summary>点击查看练习 2 答案</summary>

```python
import math
from typing import Union


class Shape:
    """形状基类"""
    
    def __init__(self, name: str):
        """初始化"""
        self.name = name
    
    def area(self) -> float:
        """计算面积"""
        raise NotImplementedError("子类必须实现 area 方法")
    
    def perimeter(self) -> float:
        """计算周长"""
        raise NotImplementedError("子类必须实现 perimeter 方法")
    
    def __str__(self) -> str:
        """字符串表示"""
        return f"{self.name}: 面积={self.area():.2f}, 周长={self.perimeter():.2f}"


class Rectangle(Shape):
    """矩形"""
    
    def __init__(self, width: float, height: float):
        """初始化"""
        super().__init__("矩形")
        self.width = width
        self.height = height
    
    def area(self) -> float:
        """计算面积"""
        return self.width * self.height
    
    def perimeter(self) -> float:
        """计算周长"""
        return 2 * (self.width + self.height)


class Square(Rectangle):
    """正方形"""
    
    def __init__(self, side: float):
        """初始化"""
        super().__init__(side, side)
        self.name = "正方形"


class Circle(Shape):
    """圆形"""
    
    def __init__(self, radius: float):
        """初始化"""
        super().__init__("圆形")
        self.radius = radius
    
    def area(self) -> float:
        """计算面积"""
        return math.pi * self.radius ** 2
    
    def perimeter(self) -> float:
        """计算周长"""
        return 2 * math.pi * self.radius


class Triangle(Shape):
    """三角形"""
    
    def __init__(self, a: float, b: float, c: float):
        """
        初始化
        
        Args:
            a: 边 a
            b: 边 b
            c: 边 c
        """
        super().__init__("三角形")
        self.a = a
        self.b = b
        self.c = c
    
    def area(self) -> float:
        """计算面积（海伦公式）"""
        s = (self.a + self.b + self.c) / 2
        return math.sqrt(s * (s - self.a) * (s - self.b) * (s - self.c))
    
    def perimeter(self) -> float:
        """计算周长"""
        return self.a + self.b + self.c


class ShapeCalculator:
    """形状计算器"""
    
    def __init__(self):
        """初始化"""
        self.shapes: list[Shape] = []
    
    def add_shape(self, shape: Shape) -> None:
        """添加形状"""
        self.shapes.append(shape)
        print(f"添加形状：{shape.name}")
    
    def calculate_all(self) -> None:
        """计算所有形状的面积和周长"""
        if not self.shapes:
            print("暂无形状")
            return
        
        print("\n形状计算结果：")
        print("=" * 60)
        for shape in self.shapes:
            print(shape)
        print("=" * 60)
        
        total_area = sum(shape.area() for shape in self.shapes)
        total_perimeter = sum(shape.perimeter() for shape in self.shapes)
        
        print(f"总面积: {total_area:.2f}")
        print(f"总周长: {total_perimeter:.2f}")
    
    def find_largest_area(self) -> Shape:
        """找出面积最大的形状"""
        if not self.shapes:
            return None
        return max(self.shapes, key=lambda s: s.area())


# 演示
if __name__ == "__main__":
    calculator = ShapeCalculator()
    
    # 添加各种形状
    rectangle = Rectangle(5, 3)
    square = Square(4)
    circle = Circle(2)
    triangle = Triangle(3, 4, 5)
    
    calculator.add_shape(rectangle)
    calculator.add_shape(square)
    calculator.add_shape(circle)
    calculator.add_shape(triangle)
    
    # 计算所有形状
    calculator.calculate_all()
    
    # 找出面积最大的形状
    largest = calculator.find_largest_area()
    if largest:
        print(f"\n面积最大的形状: {largest.name} ({largest.area():.2f})")
```

运行示例：
```bash
python3 shape_calculator.py
# 输出：
# 添加形状：矩形
# 添加形状：正方形
# 添加形状：圆形
# 添加形状：三角形
# 
# 形状计算结果：
# ============================================================
# 矩形: 面积=15.00, 周长=16.00
# 正方形: 面积=16.00, 周长=16.00
# 圆形: 面积=12.57, 周长=12.57
# 三角形: 面积=6.00, 周长=12.00
# ============================================================
# 总面积: 49.57
# 总周长: 56.57
# 
# 面积最大的形状: 正方形 (16.00)
```

</details>

<details>
<summary>点击查看练习 3 答案</summary>

```python
from typing import Dict, List


class Course:
    """课程类"""
    
    def __init__(self, course_id: str, name: str, credit: float):
        """
        初始化
        
        Args:
            course_id: 课程编号
            name: 课程名称
            credit: 学分
        """
        self.course_id = course_id
        self.name = name
        self.credit = credit
        self.students: List[str] = []
    
    def __str__(self) -> str:
        """字符串表示"""
        return f"{self.course_id}: {self.name} ({self.credit} 学分) - 选课人数: {len(self.students)}"
    
    def add_student(self, student_id: str) -> bool:
        """添加学生"""
        if student_id in self.students:
            print(f"学生 {student_id} 已经选修了 {self.name}")
            return False
        self.students.append(student_id)
        return True
    
    def remove_student(self, student_id: str) -> bool:
        """移除学生"""
        if student_id not in self.students:
            print(f"学生 {student_id} 没有选修 {self.name}")
            return False
        self.students.remove(student_id)
        return True


class Student:
    """学生类"""
    
    def __init__(self, student_id: str, name: str, class_name: str):
        """
        初始化
        
        Args:
            student_id: 学号
            name: 姓名
            class_name: 班级
        """
        self.student_id = student_id
        self.name = name
        self.class_name = class_name
        self.courses: Dict[str, float] = {}  # 课程编号 -> 成绩
    
    def enroll(self, course: Course) -> bool:
        """选课"""
        if course.course_id in self.courses:
            print(f"{self.name} 已经选修了 {course.name}")
            return False
        
        if course.add_student(self.student_id):
            self.courses[course.course_id] = 0.0  # 初始成绩为 0
            print(f"{self.name} 成功选修 {course.name}")
            return True
        return False
    
    def drop(self, course: Course) -> bool:
        """退课"""
        if course.course_id not in self.courses:
            print(f"{self.name} 没有选修 {course.name}")
            return False
        
        if course.remove_student(self.student_id):
            del self.courses[course.course_id]
            print(f"{self.name} 成功退选 {course.name}")
            return True
        return False
    
    def set_grade(self, course_id: str, grade: float) -> bool:
        """设置成绩"""
        if course_id not in self.courses:
            print(f"学生没有选修该课程")
            return False
        
        if not (0 <= grade <= 100):
            print("成绩必须在 0-100 之间")
            return False
        
        self.courses[course_id] = grade
        return True
    
    def get_grade(self, course_id: str) -> float:
        """获取成绩"""
        return self.courses.get(course_id, 0.0)
    
    def calculate_gpa(self) -> float:
        """计算平均成绩（GPA）"""
        if not self.courses:
            return 0.0
        return sum(self.courses.values()) / len(self.courses)
    
    def __str__(self) -> str:
        """字符串表示"""
        return f"{self.student_id}: {self.name} - {self.class_name}"


class StudentManagementSystem:
    """学生管理系统"""
    
    def __init__(self):
        """初始化"""
        self.students: Dict[str, Student] = {}
        self.courses: Dict[str, Course] = {}
    
    def add_student(self, student: Student) -> None:
        """添加学生"""
        self.students[student.student_id] = student
        print(f"添加学生: {student.name}")
    
    def add_course(self, course: Course) -> None:
        """添加课程"""
        self.courses[course.course_id] = course
        print(f"添加课程: {course.name}")
    
    def enroll(self, student_id: str, course_id: str) -> bool:
        """学生选课"""
        if student_id not in self.students:
            print(f"学生 {student_id} 不存在")
            return False
        
        if course_id not in self.courses:
            print(f"课程 {course_id} 不存在")
            return False
        
        student = self.students[student_id]
        course = self.courses[course_id]
        return student.enroll(course)
    
    def drop(self, student_id: str, course_id: str) -> bool:
        """学生退课"""
        if student_id not in self.students:
            print(f"学生 {student_id} 不存在")
            return False
        
        if course_id not in self.courses:
            print(f"课程 {course_id} 不存在")
            return False
        
        student = self.students[student_id]
        course = self.courses[course_id]
        return student.drop(course)
    
    def set_grade(self, student_id: str, course_id: str, grade: float) -> bool:
        """设置成绩"""
        if student_id not in self.students:
            print(f"学生 {student_id} 不存在")
            return False
        
        student = self.students[student_id]
        return student.set_grade(course_id, grade)
    
    def print_student_info(self, student_id: str) -> None:
        """打印学生信息"""
        if student_id not in self.students:
            print(f"学生 {student_id} 不存在")
            return
        
        student = self.students[student_id]
        print(f"\n学生信息: {student}")
        print("已选课程及成绩:")
        
        if not student.courses:
            print("  暂无选课")
            return
        
        for course_id, grade in student.courses.items():
            course = self.courses.get(course_id)
            if course:
                print(f"  {course.name}: {grade} 分")
        
        print(f"平均成绩: {student.calculate_gpa():.2f}")
    
    def print_course_info(self, course_id: str) -> None:
        """打印课程信息"""
        if course_id not in self.courses:
            print(f"课程 {course_id} 不存在")
            return
        
        course = self.courses[course_id]
        print(f"\n课程信息: {course}")


# 演示
if __name__ == "__main__":
    sms = StudentManagementSystem()
    
    # 添加课程
    course1 = Course("CS101", "Python 程序设计", 3.0)
    course2 = Course("CS102", "数据结构与算法", 4.0)
    course3 = Course("CS103", "数据库原理", 3.0)
    
    sms.add_course(course1)
    sms.add_course(course2)
    sms.add_course(course3)
    
    # 添加学生
    student1 = Student("2024001", "张三", "计算机1班")
    student2 = Student("2024002", "李四", "计算机1班")
    student3 = Student("2024003", "王五", "计算机2班")
    
    sms.add_student(student1)
    sms.add_student(student2)
    sms.add_student(student3)
    
    # 选课
    print("\n选课操作:")
    sms.enroll("2024001", "CS101")
    sms.enroll("2024001", "CS102")
    sms.enroll("2024002", "CS101")
    sms.enroll("2024002", "CS103")
    sms.enroll("2024003", "CS102")
    sms.enroll("2024003", "CS103")
    
    # 设置成绩
    print("\n设置成绩:")
    sms.set_grade("2024001", "CS101", 85.5)
    sms.set_grade("2024001", "CS102", 92.0)
    sms.set_grade("2024002", "CS101", 78.0)
    sms.set_grade("2024002", "CS103", 88.5)
    sms.set_grade("2024003", "CS102", 95.0)
    sms.set_grade("2024003", "CS103", 87.0)
    
    # 打印学生信息
    sms.print_student_info("2024001")
    sms.print_student_info("2024002")
    
    # 打印课程信息
    sms.print_course_info("CS101")
    sms.print_course_info("CS102")
    
    # 退课
    print("\n退课操作:")
    sms.drop("2024003", "CS103")
```

运行示例：
```bash
python3 student_management.py
# 输出：
# 添加课程: Python 程序设计
# 添加课程: 数据结构与算法
# 添加课程: 数据库原理
# 添加学生: 张三
# 添加学生: 李四
# 添加学生: 王五
# 
# 选课操作:
# 张三 成功选修 Python 程序设计
# 张三 成功选修 数据结构与算法
# 李四 成功选修 Python 程序设计
# 李四 成功选修 数据库原理
# 王五 成功选修 数据结构与算法
# 王五 成功选修 数据库原理
# 
# 设置成绩:
# 
# 学生信息: 2024001: 张三 - 计算机1班
# 已选课程及成绩:
#   Python 程序设计: 85.5 分
#   数据结构与算法: 92.0 分
# 平均成绩: 88.75
# 
# 学生信息: 2024002: 李四 - 计算机1班
# 已选课程及成绩:
#   Python 程序设计: 78.0 分
#   数据库原理: 88.5 分
# 平均成绩: 83.25
# 
# 课程信息: CS101: Python 程序设计 (3.0 学分) - 选课人数: 2
# 课程信息: CS102: 数据结构与算法 (4.0 学分) - 选课人数: 2
# 
# 退课操作:
# 王五 成功退选 数据库原理
```

</details>

---

## 本章小结

✅ 你已经学会了：
- 类和对象的概念
- 实例属性和类属性
- 实例方法、类方法和静态方法
- 属性装饰器（property）
- 继承（单继承和多重继承）
- 多态的概念和应用
- 封装和私有成员
- 特殊方法（魔法方法）的使用
- Python 与 JavaScript 的 OOP 对比

## 下一章

[第7章：模块与包管理](/chapter-07/) - 学习如何组织代码、导入模块和管理 Python 包。