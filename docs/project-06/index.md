# 项目6：Django 图书管理系统

## 项目简介

本项目使用 Django 构建一个图书管理系统，包含图书 CRUD、后台管理、服务端页面、搜索筛选和基础 JSON API。它展示 Django 最擅长的场景：快速搭建带管理后台的业务系统。

**项目目标**：
- 使用 Django 创建完整业务项目
- 使用 Model 和 ORM 管理图书数据
- 使用 Admin 快速生成后台管理能力
- 使用 Template 构建服务端页面
- 提供基础 JSON API 给前端调用

**技术栈**：
- Django - 全功能 Web 框架
- SQLite - 本地数据库
- Django Template - 服务端页面渲染
- Django Admin - 后台管理
- pytest / Django TestCase - 测试

---

## 功能需求

| 功能 | 页面/API | 说明 |
|------|----------|------|
| 图书列表 | `/books/` | 展示图书，支持搜索 |
| 图书详情 | `/books/<id>/` | 查看单本图书 |
| 新增图书 | `/books/create/` | 表单创建 |
| 编辑图书 | `/books/<id>/edit/` | 表单更新 |
| 删除图书 | `/books/<id>/delete/` | 确认删除 |
| 后台管理 | `/admin/` | 管理图书和分类 |
| JSON API | `/api/books/` | 给前端页面调用 |

---

## 项目结构

```
django-library/
├── config/
│   ├── settings.py
│   └── urls.py
├── books/
│   ├── admin.py
│   ├── forms.py
│   ├── models.py
│   ├── urls.py
│   ├── views.py
│   └── tests.py
├── templates/
│   ├── base.html
│   └── books/
│       ├── book_confirm_delete.html
│       ├── book_detail.html
│       ├── book_form.html
│       └── book_list.html
├── manage.py
└── requirements.txt
```

---

## 第一部分：项目初始化

```bash
mkdir django-library
cd django-library

python -m venv .venv
source .venv/bin/activate

pip install django
pip freeze > requirements.txt

django-admin startproject config .
python manage.py startapp books
```

在 `config/settings.py` 注册应用和模板目录：

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

---

## 第二部分：数据模型

```python
# books/models.py
from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=60, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "分类"
        verbose_name_plural = "分类"

    def __str__(self):
        return self.name

class Book(models.Model):
    title = models.CharField(max_length=120)
    author = models.CharField(max_length=80)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="books",
    )
    isbn = models.CharField(max_length=20, blank=True)
    description = models.TextField(blank=True)
    stock = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "图书"
        verbose_name_plural = "图书"

    def __str__(self):
        return self.title
```

执行迁移：

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## 第三部分：Admin 后台

```python
# books/admin.py
from django.contrib import admin
from .models import Book, Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "description")
    search_fields = ("name",)

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "author",
        "category",
        "stock",
        "is_published",
        "created_at",
    )
    list_filter = ("category", "is_published", "created_at")
    search_fields = ("title", "author", "isbn")
```

创建管理员：

```bash
python manage.py createsuperuser
python manage.py runserver
```

访问：

```txt
http://127.0.0.1:8000/admin/
```

---

## 第四部分：表单

```python
# books/forms.py
from django import forms
from .models import Book

class BookForm(forms.ModelForm):
    class Meta:
        model = Book
        fields = [
            "title",
            "author",
            "category",
            "isbn",
            "description",
            "stock",
            "is_published",
        ]
        widgets = {
            "description": forms.Textarea(attrs={"rows": 4}),
        }
```

---

## 第五部分：页面视图

```python
# books/views.py
from django.contrib import messages
from django.shortcuts import get_object_or_404, redirect, render
from .forms import BookForm
from .models import Book

def book_list(request):
    keyword = request.GET.get("keyword", "").strip()
    books = Book.objects.select_related("category")

    if keyword:
        books = books.filter(title__icontains=keyword)

    return render(request, "books/book_list.html", {
        "books": books,
        "keyword": keyword,
    })

def book_detail(request, pk):
    book = get_object_or_404(Book, pk=pk)
    return render(request, "books/book_detail.html", {"book": book})

def book_create(request):
    if request.method == "POST":
        form = BookForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "图书创建成功")
            return redirect("book_list")
    else:
        form = BookForm()

    return render(request, "books/book_form.html", {"form": form})

def book_update(request, pk):
    book = get_object_or_404(Book, pk=pk)

    if request.method == "POST":
        form = BookForm(request.POST, instance=book)
        if form.is_valid():
            form.save()
            messages.success(request, "图书更新成功")
            return redirect("book_detail", pk=book.pk)
    else:
        form = BookForm(instance=book)

    return render(request, "books/book_form.html", {"form": form})

def book_delete(request, pk):
    book = get_object_or_404(Book, pk=pk)

    if request.method == "POST":
        book.delete()
        messages.success(request, "图书删除成功")
        return redirect("book_list")

    return render(request, "books/book_confirm_delete.html", {"book": book})
```

---

## 第六部分：路由

```python
# books/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("books/", views.book_list, name="book_list"),
    path("books/create/", views.book_create, name="book_create"),
    path("books/<int:pk>/", views.book_detail, name="book_detail"),
    path("books/<int:pk>/edit/", views.book_update, name="book_update"),
    path("books/<int:pk>/delete/", views.book_delete, name="book_delete"),
    path("api/books/", views.book_list_api, name="book_list_api"),
]
```

```python
# config/urls.py
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("books.urls")),
]
```

---

## 第七部分：模板页面

### 基础模板

```html
<!-- templates/base.html -->
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <title>{% block title %}图书管理系统{% endblock %}</title>
  </head>
  <body>
    <header>
      <a href="{% url 'book_list' %}">图书管理</a>
      <a href="{% url 'book_create' %}">新增图书</a>
    </header>

    {% if messages %}
      <ul>
        {% for message in messages %}
          <li>{{ message }}</li>
        {% endfor %}
      </ul>
    {% endif %}

    <main>
      {% block content %}{% endblock %}
    </main>
  </body>
</html>
```

### 图书列表

```html
<!-- templates/books/book_list.html -->
{% extends "base.html" %}

{% block title %}图书列表{% endblock %}

{% block content %}
  <h1>图书列表</h1>

  <form method="get">
    <input name="keyword" value="{{ keyword }}" placeholder="搜索书名">
    <button type="submit">搜索</button>
  </form>

  <ul>
    {% for book in books %}
      <li>
        <a href="{% url 'book_detail' book.pk %}">{{ book.title }}</a>
        - {{ book.author }}
        {% if book.category %} / {{ book.category.name }}{% endif %}
      </li>
    {% empty %}
      <li>暂无图书</li>
    {% endfor %}
  </ul>
{% endblock %}
```

### 图书表单

```html
<!-- templates/books/book_form.html -->
{% extends "base.html" %}

{% block content %}
  <h1>图书表单</h1>

  <form method="post">
    {% csrf_token %}
    {{ form.as_p }}
    <button type="submit">保存</button>
  </form>
{% endblock %}
```

### 删除确认

```html
<!-- templates/books/book_confirm_delete.html -->
{% extends "base.html" %}

{% block content %}
  <h1>删除图书</h1>
  <p>确认删除《{{ book.title }}》吗？</p>

  <form method="post">
    {% csrf_token %}
    <button type="submit">确认删除</button>
    <a href="{% url 'book_detail' book.pk %}">取消</a>
  </form>
{% endblock %}
```

---

## 第八部分：JSON API

```python
# books/views.py
from django.http import JsonResponse

def book_list_api(request):
    keyword = request.GET.get("keyword", "").strip()
    books = Book.objects.select_related("category").filter(is_published=True)

    if keyword:
        books = books.filter(title__icontains=keyword)

    return JsonResponse({
        "items": [
            {
                "id": book.id,
                "title": book.title,
                "author": book.author,
                "category": book.category.name if book.category else None,
                "stock": book.stock,
            }
            for book in books
        ]
    })
```

前端调用：

```javascript
async function fetchBooks(keyword = '') {
  const params = new URLSearchParams();
  if (keyword) params.set('keyword', keyword);

  const response = await fetch(`/api/books/?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch books');
  return response.json();
}
```

---

## 第九部分：测试

```python
# books/tests.py
from django.test import TestCase
from django.urls import reverse
from .models import Book

class BookTests(TestCase):
    def test_book_list_page(self):
        Book.objects.create(title="Python 入门", author="Alice")

        response = self.client.get(reverse("book_list"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Python 入门")

    def test_book_list_api(self):
        Book.objects.create(title="Django 实战", author="Bob")

        response = self.client.get(reverse("book_list_api"))

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["items"]), 1)
        self.assertEqual(data["items"][0]["title"], "Django 实战")
```

运行测试：

```bash
python manage.py test
```

---

## 扩展任务

1. 给图书增加封面图片字段，并配置媒体文件上传。
2. 给列表页增加分类筛选和库存排序。
3. 使用 Django 内置认证，让只有登录用户可以新增、编辑和删除图书。
4. 接入 Django REST Framework，重写 `/api/books/` 为标准 REST API。
5. 使用 PostgreSQL 替换 SQLite，并配置生产环境 settings。

## 小结

这个项目展示了 Django 的主线开发体验：先建模型，再迁移数据库，随后自动获得 Admin 管理能力，并用视图和模板快速交付业务页面。对于后台系统和内容管理类项目，Django 的效率非常高。
