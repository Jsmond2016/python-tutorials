pi = 3.1415926

print(f"圆周率：{pi}")

# 格式化数字
print(f"圆周率：{pi:.2f}")


# 百分比

score = 0.86789
print(f"得分: {score:.2%}")


# 格式化日期
from datetime import datetime

now = datetime.now()

print(f"当前时间：{now}")
print(f"格式化日期：{now:%Y-%m-%d}")
print(f"格式化时间：{now:%H:%M:%S}")

# 格式化列表

fruits = ["苹果", "香蕉", "橙子"]
print(f"水果列表：{fruits}")
print(f"第一个水果：{fruits[0]}")
print(f"水果数量：{len(fruits)}")

# 列表推导公式

numbers = [1,2,3,4,5]
squares = [x**2 for x in numbers]
print(f"原列表：{numbers}")
print(f"平方列表：{squares}")