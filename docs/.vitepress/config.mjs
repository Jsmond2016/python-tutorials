import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Python 教程 - 前端转岗指南',
  description: '专为前端开发工程师设计的 Python 转岗教程，帮助你快速掌握 Python 核心概念和 Web 开发技能。',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '学习路径', link: '/learning-path' },
      { text: '项目实战', link: '/project-01/' },
    ],

    sidebar: [
      {
        text: '开始学习',
        items: [
          { text: '简介', link: '/' },
          { text: '学习路径', link: '/learning-path' },
        ]
      },
      {
        text: '学习随笔',
        items: [
          { text: 'Python 依赖管理', link: '/notes/python-dependency-management' },
          { text: 'requirements.txt 说明', link: '/notes/requirements-txt-guide' },
          { text: 'Lambda 表达式详解', link: '/notes/python-lambda' },
          { text: '控制流程与 JS 对比', link: '/notes/python-control-flow-summary' },
        ]
      },
      {
        text: '第一部分：Python 基础',
        items: [
          { text: '第1章：环境搭建', link: '/chapter-01/' },
          { text: '第2章：基础语法', link: '/chapter-02/' },
          { text: '第3章：数据结构', link: '/chapter-03/' },
          { text: '第4章：控制流程', link: '/chapter-04/' },
          { text: '第5章：函数', link: '/chapter-05/' },
          { text: '项目1：待办事项管理器', link: '/project-01/' },
        ]
      },
      {
        text: '第二部分：进阶主题',
        items: [
          { text: '第6章：面向对象编程', link: '/chapter-06/' },
          { text: '第7章：模块与包管理', link: '/chapter-07/' },
          { text: '第8章：异常处理与文件操作', link: '/chapter-08/' },
          { text: '第9章：异步编程基础', link: '/chapter-09/' },
          { text: '第10章：装饰器与上下文管理器', link: '/chapter-10/' },
          { text: '项目2：数据处理脚本', link: '/project-02/' },
        ]
      },
      {
        text: '第三部分：Python Web 开发',
        items: [
          { text: '第11章：Web 开发入门', link: '/chapter-11/' },
          { text: '第12章：FastAPI 快速上手', link: '/chapter-12/' },
          { text: '第13章：数据库操作', link: '/chapter-13/' },
          { text: '第14章：身份认证与授权', link: '/chapter-14/' },
          { text: '第15章：API 测试与文档', link: '/chapter-15/' },
          { text: '项目3：博客 API 系统', link: '/project-03/' },
        ]
      },
      {
        text: '第四部分：进阶实战',
        items: [
          { text: '第16章：WebSocket 实时通信', link: '/chapter-16/' },
          { text: '第17章：任务队列与定时任务', link: '/chapter-17/' },
          { text: '第18章：缓存与性能优化', link: '/chapter-18/' },
          { text: '第19章：日志与监控', link: '/chapter-19/' },
          { text: '第20章：容器化与部署', link: '/chapter-20/' },
          { text: '项目4：全栈实战项目', link: '/project-04/' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/python-tutorials' }
    ],

    footer: {
      message: '基于 MIT 许可证发布',
      copyright: 'Copyright © 2024'
    },

    search: {
      provider: 'local'
    }
  }
})
