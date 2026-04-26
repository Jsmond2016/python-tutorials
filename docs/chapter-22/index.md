# 第22章：Django 快速上手

## 本章简介

Django 是 Python 生态中最成熟的全功能 Web 框架。它内置 ORM、路由、模板、表单、认证、后台管理、迁移系统和安全机制，强调 “batteries included”：常见 Web 应用需要的能力都尽量自带。

如果 Flask 像 Express.js，Django 更像 Rails、Laravel 或带强约定的全栈框架。它非常适合后台管理系统、内容系统、内部业务平台、电商系统和需要快速交付完整功能的项目。

**学习目标**：
- 理解 Django 项目、应用、模型、视图和模板的关系
- 掌握 ORM、迁移和 Admin 后台的基本使用
- 学会构建传统服务端页面和 JSON API
- 理解 Django 的认证、表单和安全机制
- 完成一个图书管理系统的核心功能

---

## 22.1 Django 的核心概念

### MVT 架构

Django 常用 MVT 描述自己的分层：

| 层 | 作用 | 前端类比 |
|----|------|----------|
| Model | 数据模型和数据库访问 | TypeScript 类型 + 数据层 |
| View | 处理请求并返回响应 | API handler / controller |
| Template | HTML 模板渲染 | JSX / Vue template |

很多框架说 MVC，Django 说 MVT。你可以简单理解为：

```txt
URL 路由 -> View 函数/类 -> Model 查询数据 -> Template 渲染页面
```

### Django 与 Flask、FastAPI 对比

| 特性 | Django | Flask | FastAPI |
|------|--------|-------|---------|
| 内置 ORM | 是 | 否 | 否 |
| 内置 Admin | 是 | 否 | 否 |
| 自动 API 文档 | 否 | 否 | 是 |
| 默认开发方式 | 全栈/服务端页面/API | 自由组合 | API 优先 |
| 学习曲线 | 中等偏高 | 低 | 中等 |
| 适合场景 | 业务系统、后台、CMS | 小服务、工具、原型 | 现代 API、高并发 |

---

## 22.2 安装和项目创建

### 创建虚拟环境

```bash
mkdir django-library
cd django-library

python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

pip install django
pip freeze > requirements.txt
```

### 创建项目

```bash
django-admin startproject config .
python manage.py runserver
```

访问：

```txt
http://127.0.0.1:8000
```

### 项目结构

```
django-library/
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── manage.py
└── requirements.txt
```

`config` 是项目配置目录，`manage.py` 是 Django 的命令入口。

---

## 22.3 创建应用

Django 项目可以包含多个 app。一个 app 通常对应一个业务模块，例如用户、图书、订单、文章。

```bash
python manage.py startapp books
```

结构：

```
books/
├── __init__.py
├── admin.py
├── apps.py
├── migrations/
├── models.py
├── tests.py
└── views.py
```

在 `config/settings.py` 中注册应用：

```python
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "books",
]
```

---

## 22.4 URL 和 View

### 第一个视图

```python
# books/views.py
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "ok"})
```

### 应用路由

```python
# books/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("health/", views.health_check, name="health"),
]
```

### 项目路由

```python
# config/urls.py
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("books.urls")),
]
```

访问：

```txt
http://127.0.0.1:8000/api/health/
```

---

## 22.5 模型和 ORM

### 定义模型

```python
# books/models.py
from django.db import models

class Book(models.Model):
    title = models.CharField(max_length=120)
    author = models.CharField(max_length=80)
    description = models.TextField(blank=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
```

### 创建迁移并同步数据库

```bash
python manage.py makemigrations
python manage.py migrate
```

Django 默认使用 SQLite，适合本地学习和开发。生产环境常用 PostgreSQL 或 MySQL。

### ORM 基础查询

```bash
python manage.py shell
```

```python
from books.models import Book

Book.objects.create(
    title="Python 入门",
    author="Alice",
    description="适合新手的 Python 教程"
)

Book.objects.all()
Book.objects.filter(author="Alice")
Book.objects.get(id=1)
Book.objects.order_by("-created_at")
```

常见操作：

| 操作 | 示例 |
|------|------|
| 创建 | `Book.objects.create(title="A", author="B")` |
| 查询全部 | `Book.objects.all()` |
| 条件查询 | `Book.objects.filter(author="Alice")` |
| 查询单个 | `Book.objects.get(id=1)` |
| 更新 | `book.title = "New"; book.save()` |
| 删除 | `book.delete()` |

---

## 22.6 Admin 后台

Django Admin 是 Django 最有生产力的功能之一。只要定义好模型，就能快速得到可用的后台管理页面。

### 注册模型

```python
# books/admin.py
from django.contrib import admin
from .models import Book

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "author", "is_published", "created_at")
    list_filter = ("is_published", "created_at")
    search_fields = ("title", "author")
```

### 创建管理员账号

```bash
python manage.py createsuperuser
python manage.py runserver
```

访问：

```txt
http://127.0.0.1:8000/admin/
```

对于内部管理系统，Admin 可以极大减少重复开发。

---

## 22.7 模板页面

### 配置模板目录

在 `config/settings.py` 中：

```python
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]
```

### 页面视图

```python
# books/views.py
from django.shortcuts import render
from .models import Book

def book_list_page(request):
    books = Book.objects.order_by("-created_at")
    return render(request, "books/book_list.html", {"books": books})
```

### 模板文件

```html
<!-- templates/books/book_list.html -->
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <title>图书列表</title>
  </head>
  <body>
    <h1>图书列表</h1>
    <ul>
      {% for book in books %}
        <li>{{ book.title }} - {{ book.author }}</li>
      {% empty %}
        <li>暂无图书</li>
      {% endfor %}
    </ul>
  </body>
</html>
```

### 页面路由

```python
# books/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("books/", views.book_list_page, name="book_list_page"),
]
```

---

## 22.8 构建 JSON API

Django 可以直接返回 JSON。更复杂的 REST API 通常使用 Django REST Framework，本节先用原生 Django 理解基本流程。

### 列表接口

```python
# books/views.py
from django.http import JsonResponse
from .models import Book

def book_list_api(request):
    keyword = request.GET.get("keyword", "")
    queryset = Book.objects.order_by("-created_at")

    if keyword:
        queryset = queryset.filter(title__icontains=keyword)

    data = [
        {
            "id": book.id,
            "title": book.title,
            "author": book.author,
            "description": book.description,
            "is_published": book.is_published,
            "created_at": book.created_at.isoformat(),
        }
        for book in queryset
    ]
    return JsonResponse({"items": data})
```

### 创建接口

```python
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def book_create_api(request):
    if request.method != "POST":
        return JsonResponse({"error": "method not allowed"}, status=405)

    data = json.loads(request.body or "{}")
    title = data.get("title", "").strip()
    author = data.get("author", "").strip()

    if not title or not author:
        return JsonResponse(
            {"error": "title and author are required"},
            status=400,
        )

    book = Book.objects.create(
        title=title,
        author=author,
        description=data.get("description", ""),
    )

    return JsonResponse({
        "id": book.id,
        "title": book.title,
        "author": book.author,
    }, status=201)
```

::: warning 注意
这里为了演示 API，使用了 `csrf_exempt`。在真实项目中，如果是传统表单提交，应保留 CSRF；如果是前后端分离 API，建议使用 Django REST Framework、Token/JWT 认证和更完整的安全配置。
:::

### 路由

```python
# books/urls.py
urlpatterns = [
    path("books/", views.book_list_api, name="book_list_api"),
    path("books/create/", views.book_create_api, name="book_create_api"),
]
```

---

## 22.9 表单和认证

### Django Form

```python
# books/forms.py
from django import forms
from .models import Book

class BookForm(forms.ModelForm):
    class Meta:
        model = Book
        fields = ["title", "author", "description", "is_published"]
```

### 表单视图

```python
from django.shortcuts import redirect, render
from .forms import BookForm

def book_create_page(request):
    if request.method == "POST":
        form = BookForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("book_list_page")
    else:
        form = BookForm()

    return render(request, "books/book_form.html", {"form": form})
```

### 登录保护

```python
from django.contrib.auth.decorators import login_required

@login_required
def book_create_page(request):
    ...
```

Django 已经内置用户模型、Session、登录状态、权限系统和密码加密，这些能力是它适合业务后台的关键原因。

---

## 22.10 Django 项目最佳实践

### settings 分环境

推荐随着项目变大拆分配置：

```
config/
├── settings/
│   ├── __init__.py
│   ├── base.py
│   ├── development.py
│   └── production.py
└── urls.py
```

### 推荐原则

- 每个 app 聚焦一个业务领域，不要把所有模型都放进一个 app
- 模型字段尽量明确约束，例如 `blank`、`null`、`unique`
- 管理后台配置 `list_display`、`search_fields` 和 `list_filter`
- API 项目优先考虑 Django REST Framework
- 生产环境关闭 `DEBUG`，配置 `ALLOWED_HOSTS`
- 静态资源使用 `collectstatic`，由 Nginx 或对象存储托管

### 生产运行

```bash
pip install gunicorn
gunicorn config.wsgi:application -w 4 -b 0.0.0.0:8000
```

---

## 练习题

1. 创建一个 `books` app，并注册到 `INSTALLED_APPS`。
2. 定义 `Book` 模型，包含标题、作者、简介和发布时间。
3. 完成迁移，并在 Django Admin 中管理图书。
4. 实现一个图书列表页面，使用模板渲染数据。
5. 实现 `/api/books/` JSON 接口，支持 `keyword` 查询参数。

## 练习答案

### 1. 创建应用

```bash
python manage.py startapp books
```

```python
# config/settings.py
INSTALLED_APPS = [
    # ...
    "books",
]
```

### 2. 定义模型

```python
from django.db import models

class Book(models.Model):
    title = models.CharField(max_length=120)
    author = models.CharField(max_length=80)
    description = models.TextField(blank=True)
    published_at = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.title
```

### 3. 迁移

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 4. 列表页面

```python
from django.shortcuts import render
from .models import Book

def book_list_page(request):
    books = Book.objects.all()
    return render(request, "books/book_list.html", {"books": books})
```

### 5. JSON 接口

```python
from django.http import JsonResponse
from .models import Book

def book_list_api(request):
    keyword = request.GET.get("keyword", "")
    books = Book.objects.all()

    if keyword:
        books = books.filter(title__icontains=keyword)

    return JsonResponse({
        "items": [
            {"id": book.id, "title": book.title, "author": book.author}
            for book in books
        ]
    })
```

---

## 小结

Django 的优势来自完整性和约定。它帮你把认证、后台、ORM、迁移、安全这些常见能力整合在一起，让团队可以更快交付业务系统。你不一定要在所有项目里使用 Django，但当需求包含复杂后台、内容管理、权限和大量表单时，它通常是非常稳的选择。
