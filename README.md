# Python 教程 - 前端转岗指南

这是一个专为前端开发工程师设计的 Python 转岗教程，帮助你快速掌握 Python 核心概念和 Web 开发技能。

## 📚 项目特色

- ✨ **专为前端开发者设计**：包含大量 Python 与 JavaScript 的对比
- 🎯 **实战导向**：4 个实战项目巩固所学知识
- 📖 **循序渐进**：从基础到高级，完整的学习路径
- 💡 **代码示例丰富**：每个知识点都有详细的代码示例
- ✅ **练习完善**：每章都有练习题和答案

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:5173](http://localhost:5173) 查看文档。

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

## 📁 项目结构

```
python-tutorials/
├── docs/                       # 文档源文件
│   ├── .vitepress/             # VitePress 配置
│   │   └── config.mjs          # 站点配置
│   ├── chapter-01/             # 第1章：环境搭建
│   ├── chapter-02/             # 第2章：基础语法
│   ├── chapter-03/             # 第3章：数据结构
│   ├── chapter-04/             # 第4章：控制流程
│   ├── chapter-05/             # 第5章：函数
│   ├── chapter-06/             # 第6章：面向对象编程
│   ├── chapter-07/             # 第7章：模块与包管理
│   ├── chapter-08/             # 第8章：异常处理与文件操作
│   ├── chapter-09/             # 第9章：异步编程基础
│   ├── chapter-10/             # 第10章：装饰器与上下文管理器
│   ├── chapter-11/             # 第11章：Web 开发入门
│   ├── chapter-12/             # 第12章：FastAPI 快速上手
│   ├── chapter-13/             # 第13章：数据库操作
│   ├── chapter-14/             # 第14章：身份认证与授权
│   ├── chapter-15/             # 第15章：API 测试与文档
│   ├── chapter-16/             # 第16章：WebSocket 实时通信
│   ├── chapter-17/             # 第17章：任务队列与定时任务
│   ├── chapter-18/             # 第18章：缓存与性能优化
│   ├── chapter-19/             # 第19章：日志与监控
│   ├── chapter-20/             # 第20章：容器化与部署
│   ├── project-01/             # 项目1：待办事项管理器
│   ├── project-02/             # 项目2：数据处理脚本
│   ├── project-03/             # 项目3：博客 API 系统
│   ├── project-04/             # 项目4：全栈实战项目
│   ├── index.md                # 首页
│   └── learning-path.md        # 学习路径
├── .gitignore                  # Git 忽略文件
├── package.json                # 项目配置
└── README.md                   # 项目说明
```

## 📖 学习内容

### 第一部分：Python 基础

- **第1章：环境搭建** - Python 安装、虚拟环境、开发工具
- **第2章：基础语法** - 变量、数据类型、类型提示
- **第3章：数据结构** - 列表、元组、字典、集合
- **第4章：控制流程** - 条件语句、循环、列表推导式
- **第5章：函数** - 函数定义、参数、装饰器、Lambda
- **项目1：待办事项管理器** - 命令行实战项目

### 第二部分：进阶主题

- **第6章：面向对象编程** - 类、继承、多态、封装
- **第7章：模块与包管理** - 模块导入、pip、包结构
- **第8章：异常处理与文件操作** - try-except、文件 I/O、JSON
- **第9章：异步编程基础** - asyncio、协程、异步 I/O
- **第10章：装饰器与上下文管理器** - 高级装饰器、资源管理
- **项目2：数据处理脚本** - 文件处理实战项目

### 第三部分：Python Web 开发

- **第11章：Web 开发入门** - HTTP、WSGI/ASGI、框架对比
- **第12章：FastAPI 快速上手** - 路由、参数、响应模型
- **第13章：数据库操作** - SQLAlchemy、CRUD、迁移
- **第14章：身份认证与授权** - JWT、密码加密、权限控制
- **第15章：API 测试与文档** - pytest、自动文档
- **项目3：博客 API 系统** - 完整的 Web API 项目

### 第四部分：进阶实战

- **第16章：WebSocket 实时通信** - 聊天室、连接管理
- **第17章：任务队列与定时任务** - Celery、后台任务
- **第18章：缓存与性能优化** - Redis、缓存策略、性能分析
- **第19章：日志与监控** - logging、Sentry、Prometheus
- **第20章：容器化与部署** - Docker、CI/CD、Nginx
- **项目4：全栈实战项目** - 综合运用所有知识

## 🎯 学习路径

完整的 **30 天**学习计划，详见 [学习路径页面](/learning-path)

## 📊 内容统计

- **20 章**核心内容
- **4 个**实战项目
- **100+**练习题及答案
- **~40000 行**教程内容

## 🛠️ 技术栈

- **文档框架**: VitePress 1.6+
- **Python 版本**: 3.10+
- **Web 框架**: FastAPI
- **数据库**: SQLite / PostgreSQL
- **ORM**: SQLAlchemy 2.0+
- **测试**: pytest
- **容器化**: Docker

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 本地开发

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License

## 🙏 致谢

- [VitePress](https://vitepress.dev/) - 静态网站生成器
- [FastAPI](https://fastapi.tiangolo.com/) - 现代 Web 框架
- [Python](https://www.python.org/) - 编程语言

## 📮 联系方式

如有问题或建议，欢迎提交 Issue。
