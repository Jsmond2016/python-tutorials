# 前端转岗 Python 开发工程师教程

这是一个专为前端开发工程师设计的 Python 转岗教程，帮助你快速掌握 Python 核心概念和 Web 开发技能。

## 教程特色

- **前端友好**：对比 JavaScript/TypeScript 的语法，快速上手 Python
- **实战导向**：每个章节都有练习题，阶段性有实战项目
- **主流技术栈**：基于 Python 3.10+，使用 FastAPI、SQLAlchemy 等主流库
- **项目驱动**：从命令行工具到 Web 应用，循序渐进

## 教程大纲

### 第一部分：Python 基础（第1-8章）

1. [环境搭建与 Hello World](./01-environment-setup/)
   - Python 安装与配置
   - 虚拟环境管理
   - 开发工具推荐

2. [基础语法与数据类型](./02-basic-syntax/)
   - 变量与注释
   - 基本数据类型（int, float, str, bool）
   - 类型提示（Type Hints）
   - 练习：数据类型转换与格式化

3. [数据结构](./03-data-structures/)
   - 列表（List）
   - 元组（Tuple）
   - 字典（Dict）
   - 集合（Set）
   - 练习：数据处理小工具

4. [控制流程](./04-control-flow/)
   - 条件语句
   - 循环语句
   - 列表推导式
   - 练习：FizzBuzz 游戏

5. [函数](./05-functions/)
   - 函数定义与调用
   - 参数与返回值
   - Lambda 函数
   - 装饰器基础
   - 练习：工具函数库

6. **【阶段项目】**：命令行待办事项管理器
   - 综合运用前面学到的知识
   - 文件读写
   - 命令行参数处理

7. [面向对象编程](./07-oop/)
   - 类与对象
   - 继承与多态
   - 属性与方法
   - 练习：简单的类设计

8. [模块与包管理](./08-modules-packages/)
   - 模块导入
   - 包的结构
   - pip 包管理
   - requirements.txt
   - 练习：创建自己的包

### 第二部分：进阶主题（第9-10章）

9. [异常处理与文件操作](./09-exceptions-files/)
   - try-except 语句
   - 文件读写
   - 上下文管理器（with 语句）
   - JSON 处理
   - 练习：配置文件管理工具

10. [异步编程基础](./10-async/)
    - asyncio 基础
    - async/await 语法
    - 与 JS Promise 的对比
    - 练习：异步数据获取

### 第三部分：Python Web 开发（第11-16章）

11. [Web 开发入门](./11-web-intro/)
    - HTTP 协议回顾
    - WSGI 与 ASGI
    - Python Web 框架对比
    - 为什么选择 FastAPI

12. [FastAPI 快速上手](./12-fastapi-basics/)
    - 安装与项目结构
    - 路由与请求处理
    - 请求参数与验证
    - 响应模型
    - 练习：RESTful API 基础

13. [数据库操作](./13-database/)
    - SQLAlchemy ORM
    - 数据库模型定义
    - CRUD 操作
    - 数据库迁移（Alembic）
    - 练习：用户管理 API

14. [身份认证与授权](./14-auth/)
    - JWT 令牌
    - 密码加密
    - 依赖注入
    - 练习：登录注册系统

15. **【实战项目】**：博客 API 系统
    - 用户系统
    - 文章 CRUD
    - 评论系统
    - 标签与分类
    - 全面的测试覆盖

16. [部署与运维](./16-deployment/)
    - Docker 容器化
    - Nginx 反向代理
    - Gunicorn/Uvicorn 部署
    - CI/CD 基础

## 学习路径

```
Day 1-2:  第1-2章（环境与基础语法）
Day 3-4:  第3-4章（数据结构与控制流程）
Day 5-6:  第5章（函数）+ 阶段项目1
Day 7-8:  第7-8章（面向对象与模块）
Day 9-10: 第9-10章（异常与异步）
Day 11-12: 第11-12章（Web 入门与 FastAPI）
Day 13-14: 第13-14章（数据库与认证）
Day 15-20: 实战项目2（博客 API 系统）
Day 21-22: 第16章（部署）
```

## 前置知识

- 熟悉至少一种前端框架（React/Vue/Angular）
- 了解基本的编程概念（变量、函数、循环等）
- 了解 HTTP 协议和 RESTful API 设计

## 技术栈

- **Python**: 3.10+
- **Web 框架**: FastAPI
- **数据库**: SQLite（开发）/ PostgreSQL（生产）
- **ORM**: SQLAlchemy 2.0+
- **测试**: pytest
- **容器化**: Docker

## 开始学习

从 [第1章：环境搭建](./01-environment-setup/) 开始你的 Python 学习之旅！

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个教程。

## 许可证

MIT License