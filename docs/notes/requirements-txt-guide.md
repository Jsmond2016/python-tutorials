# requirements.txt 文件说明

> 创建时间：2026-03-03

本文档介绍 Python 项目中 `requirements.txt` 文件的作用、管理方式以及跨设备开发环境配置方法。

## 一、文件内容分析

一个典型的 `requirements.txt` 文件示例：

```txt
certifi==2026.2.25
charset-normalizer==3.4.4
idna==3.11
requests==2.32.5
urllib3==2.6.3
```

每个依赖包的作用：

| 包名 | 作用 |
|------|------|
| `certifi` | SSL 证书验证 |
| `charset-normalizer` | 字符编码检测 |
| `idna` | 国际化域名处理 |
| `requests` | HTTP 请求库（核心依赖） |
| `urllib3` | HTTP 连接池 |

## 二、是否需要提交到 Git？

**需要提交**。`requirements.txt` 是 Python 项目的标准依赖清单文件，应该纳入版本控制：

- 记录项目运行所需的依赖包及版本
- 文件体积很小，适合提交
- 方便他人复现开发环境

## 三、更换电脑后的快速开发配置

克隆项目后，执行以下步骤：

```bash
# 1. 进入项目目录
cd py-project

# 2. 创建虚拟环境（推荐）
python -m venv .venv

# 3. 激活虚拟环境
# macOS/Linux:
source .venv/bin/activate
# Windows:
# .venv\Scripts\activate

# 4. 安装依赖
pip install -r requirements.txt
```

## 四、建议添加 .gitignore

虚拟环境目录 `.venv` 不应提交到 git，建议在项目中创建 `.gitignore` 文件：

```gitignore
# Python
__pycache__/
*.py[cod]
.venv/
venv/
*.egg-info/
dist/
build/
```

## 五、常用命令速查

| 操作 | 命令 |
|------|------|
| 导出依赖 | `pip freeze > requirements.txt` |
| 安装依赖 | `pip install -r requirements.txt` |
| 创建虚拟环境 | `python -m venv .venv` |
| 激活虚拟环境 (Mac/Linux) | `source .venv/bin/activate` |
| 激活虚拟环境 (Windows) | `.venv\Scripts\activate` |

## 六、与前端 package.json 对比

| Python | 前端 (npm) |
|--------|------------|
| `requirements.txt` | `package.json` (dependencies 部分) |
| `pyproject.toml` | `package.json` (完整功能) |
| `pip install -r requirements.txt` | `npm install` |
| `pip freeze > requirements.txt` | 手动编辑 / `npm init` |

---

::: tip 相关阅读
更多 Python 依赖管理内容，请参阅 [Python 依赖管理](/notes/python-dependency-management)
:::