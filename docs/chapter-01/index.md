# 第1章：环境搭建与 Hello World

欢迎来到 Python 世界！作为前端开发者，你可能已经熟悉了 Node.js 和 npm。Python 的生态系统与之类似，但也有一些独特的特点。本章将帮助你搭建 Python 开发环境。

## 学习目标

- 安装 Python 3.10+
- 理解和使用虚拟环境
- 配置 Python 开发工具
- 编写并运行第一个 Python 程序

## 目录

1. [Python 安装](#python-安装)
2. [虚拟环境管理](#虚拟环境管理)
3. [开发工具推荐](#开发工具推荐)
4. [Hello World](#hello-world)
5. [练习题](#练习题)
6. [练习答案](#练习答案)

---

## Python 安装

### macOS

```bash
# 使用 Homebrew 安装
brew install python@3.11

# 验证安装
python3 --version
pip3 --version
```

### Windows

1. 访问 [Python 官网](https://www.python.org/downloads/)
2. 下载 Python 3.10+ 安装包
3. 运行安装程序，**务必勾选 "Add Python to PATH"**
4. 验证安装：
   ```cmd
   python --version
   pip --version
   ```

### Linux

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip python3-venv

# 验证安装
python3 --version
pip3 --version
```

### 版本管理工具

如果你需要管理多个 Python 版本，可以使用：

- **pyenv** (macOS/Linux)：类似于 nvm
  ```bash
  brew install pyenv
  pyenv install 3.11.0
  pyenv global 3.11.0
  ```

- **pyenv-win** (Windows)：Windows 版本的 pyenv

---

## 虚拟环境管理

### 为什么需要虚拟环境？

类似于前端的 `node_modules` 隔离，Python 的虚拟环境可以为每个项目创建独立的依赖环境，避免版本冲突。

**对比表格：**

| 前端            | Python             |
| --------------- | ------------------ |
| `node_modules/` | `venv/` 或 `env/`  |
| `npm install`   | `pip install`      |
| `package.json`  | `requirements.txt` |
| `nvm`           | `pyenv`            |

### 创建虚拟环境

```bash
# 进入项目目录
mkdir my-python-project
cd my-python-project

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境

# macOS/Linux:
source venv/bin/activate

# Windows:
venv\Scripts\activate

# 激活后，命令行提示符会显示 (venv)
```

### 管理依赖

```bash
# 安装包
pip install requests

# 生成依赖列表
pip freeze > requirements.txt

# 从依赖列表安装
pip install -r requirements.txt

# 查看已安装的包
pip list

# 卸载包
pip uninstall requests
```

### 退出虚拟环境

```bash
deactivate
```

### requirements.txt 示例

```txt
requests==2.31.0
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
```

---

## 开发工具推荐

### IDE 选择

#### 1. Visual Studio Code (推荐)

**安装 Python 扩展：**
1. 打开 VS Code
2. 按 `Cmd/Ctrl + Shift + X` 打开扩展市场
3. 搜索 "Python" 并安装 Microsoft 官方扩展
4. 推荐安装的额外扩展：
   - Pylance（智能提示）
   - Python Test Explorer（测试）
   - Jupyter（数据科学）

**VS Code 配置 (`.vscode/settings.json`)：**

```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/venv/bin/python",
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "editor.formatOnSave": true
}
```

#### 2. PyCharm

- **Community Edition**：免费，适合基础开发
- **Professional Edition**：付费，包含 Web 开发、数据库工具等

#### 3. 其他选择

- **Sublime Text** + Anaconda 插件
- **Atom** + atom-python-runner
- **Jupyter Notebook**：数据科学首选

### 代码格式化工具

```bash
# Black - 类似于 Prettier
pip install black

# 使用 Black 格式化代码
black your_file.py

# isort - 排序 import 语句
pip install isort

# pylint - 代码检查
pip install pylint

# mypy - 类型检查（类似 TypeScript 的 tsc）
pip install mypy
```

---

## Hello World

### 创建第一个 Python 程序

创建文件 `hello.py`：

```python
# 这是一个注释
print("Hello, World!")

# Python 3.6+ 支持 f-string（类似于模板字符串）
name = "Python"
print(f"Hello, {name}!")

# 多行字符串（类似于模板字符串）
message = f"""
你好，{name}！
欢迎来到 Python 世界。
"""
print(message)
```

### 运行 Python 程序

```bash
# 方式1：直接运行
python3 hello.py

# 方式2：在 Python REPL 中运行
python3
>>> exec(open('hello.py').read())
>>> exit()

# 方式3：作为模块运行
python3 -m hello
```

### Python vs JavaScript 对比

| 功能       | JavaScript              | Python                   |
| ---------- | ----------------------- | ------------------------ |
| 输出       | `console.log()`         | `print()`                |
| 注释       | `// 单行`, `/* 多行 */` | `# 单行`, `""" 多行 """` |
| 模板字符串 | `` `Hello ${name}` ``   | `f"Hello {name}"`        |
| 变量声明   | `const/let/var`         | 直接赋值                 |
| 代码块     | `{}`                    | **缩进**                 |

::: warning 重要提示
Python 使用**缩进**来表示代码块，而不是花括号 `{}`。这是 Python 与 JavaScript 最大的语法区别之一。
:::

---

## 练习题

### 练习 1：环境验证

1. 检查你的 Python 版本，确保是 3.10 或更高
2. 创建一个虚拟环境并激活它
3. 安装 `requests` 库
4. 生成 `requirements.txt` 文件

### 练习 2：Hello World 变体

创建一个程序 `greeting.py`，要求：
1. 使用 `input()` 获取用户的名字
2. 使用 f-string 输出欢迎信息
3. 包含多行注释解释代码功能

### 练习 3：格式化输出

创建一个程序 `format_demo.py`，演示：
1. 使用 f-string 格式化数字
2. 使用 f-string 格式化日期
3. 使用 f-string 格式化列表

---

## 练习答案

<details>
<summary>点击查看练习 1 答案</summary>

```bash
# 1. 检查 Python 版本
python3 --version

# 2. 创建并激活虚拟环境
python3 -m venv myenv
source myenv/bin/activate  # Windows: myenv\Scripts\activate

# 3. 安装 requests
pip install requests

# 4. 生成 requirements.txt
pip freeze > requirements.txt
```

</details>

<details>
<summary>点击查看练习 2 答案</summary>

```python
# greeting.py
# 这个程序演示如何获取用户输入并输出欢迎信息

# 获取用户输入
name = input("请输入你的名字: ")

# 使用 f-string 输出欢迎信息
print(f"你好, {name}!")
print(f"欢迎来到 Python 世界, {name}!")

# 多行输出
message = f"""
亲爱的 {name}：

感谢你开始学习 Python！
希望这个教程能帮助你快速掌握 Python 编程。

祝你学习愉快！
"""
print(message)
```

运行方式：
```bash
python3 greeting.py
```

</details>

<details>
<summary>点击查看练习 3 答案</summary>

```python
# format_demo.py
# 这个程序演示 f-string 的各种格式化用法

# 1. 格式化数字
pi = 3.1415926
print(f"圆周率: {pi}")
print(f"圆周率（保留2位小数）: {pi:.2f}")
print(f"圆周率（科学计数法）: {pi:.2e}")

# 百分比
score = 0.8567
print(f"得分: {score:.2%}")

# 2. 格式化日期
from datetime import datetime

now = datetime.now()
print(f"当前时间: {now}")
print(f"格式化日期: {now:%Y-%m-%d}")
print(f"格式化时间: {now:%H:%M:%S}")

# 3. 格式化列表
fruits = ["苹果", "香蕉", "橙子"]
print(f"水果列表: {fruits}")
print(f"第一个水果: {fruits[0]}")
print(f"水果数量: {len(fruits)}")

# 列表推导式
numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers]
print(f"原列表: {numbers}")
print(f"平方列表: {squares}")
```

</details>

---

## 本章小结

✅ 你已经学会了：
- 安装 Python 3.10+
- 创建和管理虚拟环境
- 使用 pip 管理依赖
- 配置 VS Code 开发环境
- 编写并运行 Python 程序
- 理解 Python 与 JavaScript 的基本语法差异

## 下一章

[第2章：基础语法与数据类型](/chapter-02/) - 学习 Python 的变量、数据类型和类型提示。