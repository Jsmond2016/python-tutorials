# Python 依赖管理学习笔记

> 记录时间：2026-03-03

本文整理了 Python 项目中依赖管理的核心概念和工具使用方法。

## 一、pip freeze 命令详解

`pip freeze > requirements.txt` 是一个常用的依赖导出命令。

### 命令分解

| 部分 | 作用 |
|------|------|
| `pip freeze` | 列出当前环境中所有已安装的包及其精确版本 |
| `>` | Shell 重定向符，将输出写入文件 |
| `requirements.txt` | 目标文件名 |

### 输出示例

执行后，`requirements.txt` 文件内容类似：

```txt
numpy==1.24.3
pandas==2.0.2
requests==2.31.0
flask==2.3.2
```

### 主要用途

1. **保存依赖快照** - 记录项目所需的全部包及版本，便于复现环境
2. **分享项目** - 他人可以通过 `pip install -r requirements.txt` 一键安装相同依赖
3. **部署应用** - 在生产环境中安装与开发环境一致的依赖版本

### 常用命令搭配

```bash
# 导出依赖
pip freeze > requirements.txt

# 安装依赖
pip install -r requirements.txt
```

::: tip 小提示
如果只想导出项目直接依赖（而非所有包），可以考虑使用 `pip-tools` 等工具。在虚拟环境中使用效果最佳，避免导出系统全局安装的无关包。
:::

---

## 二、requirements.txt 文件作用

`requirements.txt` 是 Python 项目中用于声明依赖包的标准文件。

### 核心作用

**记录项目依赖清单**，让其他人或环境能快速安装相同的依赖包。

### 使用场景

| 场景 | 说明 |
|------|------|
| **团队协作** | 团队成员执行 `pip install -r requirements.txt` 即可获得相同环境 |
| **部署上线** | 服务器上安装与开发环境一致的依赖版本 |
| **项目分享** | 开源项目必备文件，方便用户安装依赖 |
| **环境迁移** | 换电脑或重建环境时快速恢复依赖 |

### 文件示例

```txt
# 直接指定版本（推荐）
requests==2.31.0
pandas==2.0.2

# 版本范围
numpy>=1.20.0
flask>=2.0,<3.0

# 最小版本
django>=4.2
```

---

## 三、与前端 package.json 对比

`requirements.txt` 与前端的 `package.json` 功能相似，但有一些关键区别。

### 功能对比

| 特性 | Python `requirements.txt` | 前端 `package.json` |
|------|-------------------------|---------------------|
| **声明依赖** | ✅ | ✅ |
| **锁定版本** | ✅ | ✅ (配合 package-lock.json) |
| **项目元信息** | ❌ | ✅ (名称、版本、脚本等) |
| **运行脚本** | ❌ | ✅ (npm run xxx) |
| **开发依赖分离** | ❌ | ✅ (dependencies / devDependencies) |

### 功能对应关系

| Python | 前端 (npm) |
|--------|---------------|
| `requirements.txt` | `package.json` (dependencies 部分) |
| 无内置对应 | `package-lock.json` |
| `pyproject.toml` | `package.json` (完整功能) |
| `pip install -r requirements.txt` | `npm install` |
| `pip freeze > requirements.txt` | 手动编辑 / `npm init` |

### 关键差异

#### 1. 元信息

```json
// package.json 包含项目元信息
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": { ... }
}
```

```txt
# requirements.txt 只包含依赖
requests==2.31.0
pandas==2.0.2
```

#### 2. 开发依赖分离

```json
// package.json 可以区分
{
  "dependencies": { "vue": "^3.0.0" },
  "devDependencies": { "vite": "^5.0.0" }
}
```

```txt
# requirements.txt 不区分，全部混在一起
vue==3.0.0
vite==5.0.0
```

::: tip 总结
`requirements.txt` ≈ `package.json` 的依赖部分，但功能更单一。
:::

---

## 四、pyproject.toml 现代配置文件

`pyproject.toml` 是 Python 项目的现代配置标准，功能更接近前端的 `package.json`。

### 文件示例

```toml
[project]
name = "my-project"
version = "1.0.0"
description = "A Python project"
authors = [{ name = "Your Name", email = "you@example.com" }]
requires-python = ">=3.10"

dependencies = [
    "requests>=2.31.0",
    "pandas>=2.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "black>=23.0.0",
    "ruff>=0.1.0",
]

[project.scripts]
my-cli = "my_project.cli:main"

[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[tool.black]
line-length = 88

[tool.ruff]
line-length = 88
select = ["E", "F", "W"]
```

### 与 requirements.txt 对比

| 特性 | `requirements.txt` | `pyproject.toml` |
|------|-------------------|------------------|
| 依赖声明 | ✅ | ✅ |
| 开发依赖分离 | ❌ | ✅ |
| 项目元信息 | ❌ | ✅ |
| 入口点/脚本 | ❌ | ✅ |
| Python 版本要求 | ❌ | ✅ |
| 工具配置 | ❌ | ✅ |
| 打包发布 | ❌ | ✅ |
| 简单易用 | ✅ | 较复杂 |

### 什么时候使用？

#### 使用 `pyproject.toml` 的场景

- 发布包到 PyPI
- 需要区分开发/生产依赖
- 项目需要元信息（名称、版本、作者）
- 需要定义命令行入口
- 多个工具需要配置（black、ruff、pytest 等）
- 正式的、长期维护的项目

#### 使用 `requirements.txt` 的场景

- 简单脚本/小型项目
- 快速原型开发
- 只需要记录依赖
- CI/CD 环境简单
- 学习/练手项目

---

## 五、Python 包管理工具生态

| 工具 | 配置文件 | 特点 |
|------|---------|------|
| `pip` | requirements.txt | Python 内置，最基础 |
| `pip-tools` | requirements.in → requirements.txt | 依赖锁定 |
| `poetry` | pyproject.toml + poetry.lock | 现代化，类似 npm |
| `pdm` | pyproject.toml + pdm.lock | PEP 标准实现 |
| `uv` | pyproject.toml + uv.lock | 极速，Rust 编写 |

### 推荐实践

```
简单项目/学习阶段 → requirements.txt
正式项目/发布包   → pyproject.toml + poetry 或 uv
```

---

## 总结

| 工具 | 定位 | 适用场景 |
|------|------|---------|
| `requirements.txt` | 简单依赖清单 | 学习、小项目、快速开发 |
| `pyproject.toml` | 现代项目配置 | 正式项目、发布包、团队协作 |

选择建议：
- 初学阶段：先用 `requirements.txt` 熟悉流程
- 进阶后：迁移到 `pyproject.toml` + `poetry` 或 `uv`