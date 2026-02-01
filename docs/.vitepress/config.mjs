import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Python 教程 - 前端转岗指南',
  description: '专为前端开发工程师设计的 Python 转岗教程，帮助你快速掌握 Python 核心概念和 Web 开发技能。',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '入门篇', link: '/chapter-01/' },
      { text: 'Web 开发', link: '/chapter-11/' },
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
        text: '第一部分：Python 基础',
        items: [
          { text: '第1章：环境搭建', link: '/chapter-01/' },
          { text: '第2章：基础语法', link: '/chapter-02/' },
          { text: '第3章：数据结构', link: '/chapter-03/' },
          { text: '第4章：控制流程', link: '/chapter-04/' },
          { text: '第5章：函数', link: '/chapter-05/' },
          { text: '项目1：待办事项管理器', link: '/project-01/' },
          { text: '第7章：面向对象', link: '/chapter-07/' },
          { text: '第8章：模块与包', link: '/chapter-08/' },
        ]
      },
      {
        text: '第二部分：进阶主题',
        items: [
          { text: '第9章：异常与文件', link: '/chapter-09/' },
          { text: '第10章：异步编程', link: '/chapter-10/' },
        ]
      },
      {
        text: '第三部分：Python Web 开发',
        items: [
          { text: '第11章：Web 开发入门', link: '/chapter-11/' },
          { text: '第12章：FastAPI 快速上手', link: '/chapter-12/' },
          { text: '第13章：数据库操作', link: '/chapter-13/' },
          { text: '第14章：身份认证', link: '/chapter-14/' },
          { text: '项目2：博客 API 系统', link: '/project-02/' },
          { text: '第16章：部署与运维', link: '/chapter-16/' },
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