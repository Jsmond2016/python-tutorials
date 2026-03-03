import keyword

print(keyword.kwlist)


# 转义字符

# 原始字符串
pathName = r"C:\users\alan"
print(pathName)


# 字符串拼接

name = "Python"
greetings = "Hello, " + name

print(greetings)

message = f"Hello, {name}"

print(message)


# 字符串索引和切片

text = "abcdefg"

print(text[0])
print(text[0:2])
print(text[:3])
print(text[3:])

print("------------")

print(text[::2])
# 反转 = js string.reverse
print(text[::-1])