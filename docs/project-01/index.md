# 阶段项目1：命令行待办事项管理器

这是一个综合实战项目，将运用前面学到的所有 Python 基础知识，创建一个实用的命令行待办事项管理器。

## 项目目标

- 综合运用变量、数据结构、控制流程和函数
- 实现文件的读写操作
- 创建用户友好的命令行界面
- 学习项目的组织和结构

## 项目功能

- [ ] 添加待办事项
- [ ] 查看待办事项列表
- [ ] 标记待办事项为完成
- [ ] 删除待办事项
- [ ] 清空所有待办事项
- [ ] 数据持久化（保存到文件）
- [ ] 搜索待办事项

## 项目结构

```
todo-app/
├── todo.py          # 主程序
├── todo_manager.py  # 待办事项管理器
├── todo.json        # 数据存储文件
└── README.md        # 项目说明
```

## 实现步骤

### 步骤 1：创建数据模型

```python
# todo_manager.py
import json
from typing import List, Dict, Optional
from datetime import datetime
from pathlib import Path

class TodoManager:
    """待办事项管理器"""
    
    def __init__(self, data_file: str = "todo.json"):
        """
        初始化待办事项管理器
        
        Args:
            data_file: 数据存储文件路径
        """
        self.data_file = Path(data_file)
        self.todos: List[Dict] = []
        self.load_todos()
    
    def load_todos(self) -> None:
        """从文件加载待办事项"""
        if self.data_file.exists():
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    self.todos = json.load(f)
                print(f"✓ 已加载 {len(self.todos)} 条待办事项")
            except (json.JSONDecodeError, IOError) as e:
                print(f"⚠️  加载数据失败: {e}")
                self.todos = []
        else:
            print("✓ 创建新的待办事项列表")
            self.todos = []
    
    def save_todos(self) -> None:
        """保存待办事项到文件"""
        try:
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(self.todos, f, ensure_ascii=False, indent=2)
            print(f"✓ 已保存 {len(self.todos)} 条待办事项")
        except IOError as e:
            print(f"❌ 保存数据失败: {e}")
```

### 步骤 2：实现核心功能

```python
# todo_manager.py (继续）

class TodoManager:
    # ... 之前的代码 ...
    
    def add_todo(self, title: str, description: str = "") -> bool:
        """
        添加待办事项
        
        Args:
            title: 待办事项标题
            description: 待办事项描述（可选）
        
        Returns:
            是否添加成功
        """
        if not title.strip():
            print("❌ 标题不能为空")
            return False
        
        todo = {
            "id": self._generate_id(),
            "title": title.strip(),
            "description": description.strip(),
            "completed": False,
            "created_at": datetime.now().isoformat(),
            "completed_at": None
        }
        
        self.todos.append(todo)
        self.save_todos()
        print(f"✓ 已添加: {title}")
        return True
    
    def _generate_id(self) -> int:
        """生成唯一的 ID"""
        if not self.todos:
            return 1
        return max(todo["id"] for todo in self.todos) + 1
    
    def list_todos(self, show_completed: bool = False) -> None:
        """
        列出所有待办事项
        
        Args:
            show_completed: 是否显示已完成的待办事项
        """
        if not self.todos:
            print("📝 暂无待办事项")
            return
        
        # 过滤待办事项
        filtered_todos = self.todos
        if not show_completed:
            filtered_todos = [t for t in self.todos if not t["completed"]]
        
        if not filtered_todos:
            print("📝 暂无待办事项")
            return
        
        print(f"\n{'=' * 60}")
        print(f"{'待办事项列表'.center(60)}")
        print(f"{'=' * 60}")
        
        for todo in filtered_todos:
            status = "✓" if todo["completed"] else "○"
            print(f"\n[{status}] ID: {todo['id']}")
            print(f"     标题: {todo['title']}")
            if todo["description"]:
                print(f"     描述: {todo['description']}")
            print(f"     创建时间: {todo['created_at'][:19]}")
        
        print(f"\n{'=' * 60}")
        print(f"总计: {len(filtered_todos)} 条")
        print(f"{'=' * 60}")
    
    def complete_todo(self, todo_id: int) -> bool:
        """
        标记待办事项为完成
        
        Args:
            todo_id: 待办事项 ID
        
        Returns:
            是否操作成功
        """
        for todo in self.todos:
            if todo["id"] == todo_id:
                if todo["completed"]:
                    print(f"⚠️  待办事项 '{todo['title']}' 已经完成了")
                    return False
                
                todo["completed"] = True
                todo["completed_at"] = datetime.now().isoformat()
                self.save_todos()
                print(f"✓ 已完成: {todo['title']}")
                return True
        
        print(f"❌ 未找到 ID 为 {todo_id} 的待办事项")
        return False
    
    def delete_todo(self, todo_id: int) -> bool:
        """
        删除待办事项
        
        Args:
            todo_id: 待办事项 ID
        
        Returns:
            是否删除成功
        """
        for i, todo in enumerate(self.todos):
            if todo["id"] == todo_id:
                title = todo["title"]
                self.todos.pop(i)
                self.save_todos()
                print(f"✓ 已删除: {title}")
                return True
        
        print(f"❌ 未找到 ID 为 {todo_id} 的待办事项")
        return False
    
    def clear_all(self) -> None:
        """清空所有待办事项"""
        if not self.todos:
            print("📝 暂无待办事项")
            return
        
        confirm = input("确定要清空所有待办事项吗？(yes/no): ")
        if confirm.lower() == "yes":
            self.todos = []
            self.save_todos()
            print("✓ 已清空所有待办事项")
        else:
            print("已取消操作")
    
    def search_todos(self, keyword: str) -> None:
        """
        搜索待办事项
        
        Args:
            keyword: 搜索关键词
        """
        if not keyword.strip():
            print("❌ 搜索关键词不能为空")
            return
        
        results = [
            todo for todo in self.todos
            if keyword.lower() in todo["title"].lower() or
            keyword.lower() in todo["description"].lower()
        ]
        
        if not results:
            print(f"📝 未找到包含 '{keyword}' 的待办事项")
            return
        
        print(f"\n找到 {len(results)} 条结果:")
        for todo in results:
            status = "✓" if todo["completed"] else "○"
            print(f"\n[{status}] ID: {todo['id']}")
            print(f"     标题: {todo['title']}")
            if todo["description"]:
                print(f"     描述: {todo['description']}")
    
    def get_statistics(self) -> Dict[str, int]:
        """
        获取统计信息
        
        Returns:
            统计信息字典
        """
        total = len(self.todos)
        completed = sum(1 for t in self.todos if t["completed"])
        pending = total - completed
        
        return {
            "total": total,
            "completed": completed,
            "pending": pending
        }
```

### 步骤 3：创建命令行界面

```python
# todo.py
from todo_manager import TodoManager
from typing import Optional

def display_menu() -> None:
    """显示主菜单"""
    print("\n" + "=" * 40)
    print("待办事项管理器".center(40))
    print("=" * 40)
    print("1. 添加待办事项")
    print("2. 查看待办事项")
    print("3. 查看所有待办事项（包括已完成）")
    print("4. 标记为完成")
    print("5. 删除待办事项")
    print("6. 搜索待办事项")
    print("7. 查看统计信息")
    print("8. 清空所有待办事项")
    print("0. 退出")
    print("=" * 40)

def add_todo_menu(manager: TodoManager) -> None:
    """添加待办事项菜单"""
    print("\n--- 添加待办事项 ---")
    title = input("标题: ")
    description = input("描述（可选）: ")
    manager.add_todo(title, description)

def complete_todo_menu(manager: TodoManager) -> None:
    """完成待办事项菜单"""
    print("\n--- 标记为完成 ---")
    manager.list_todos(show_completed=False)
    
    if not manager.todos:
        return
    
    try:
        todo_id = int(input("\n请输入要完成的待办事项 ID: "))
        manager.complete_todo(todo_id)
    except ValueError:
        print("❌ 请输入有效的 ID")

def delete_todo_menu(manager: TodoManager) -> None:
    """删除待办事项菜单"""
    print("\n--- 删除待办事项 ---")
    manager.list_todos()
    
    if not manager.todos:
        return
    
    try:
        todo_id = int(input("\n请输入要删除的待办事项 ID: "))
        manager.delete_todo(todo_id)
    except ValueError:
        print("❌ 请输入有效的 ID")

def search_todo_menu(manager: TodoManager) -> None:
    """搜索待办事项菜单"""
    print("\n--- 搜索待办事项 ---")
    keyword = input("请输入搜索关键词: ")
    manager.search_todos(keyword)

def display_statistics(manager: TodoManager) -> None:
    """显示统计信息"""
    print("\n--- 统计信息 ---")
    stats = manager.get_statistics()
    print(f"总计: {stats['total']} 条")
    print(f"已完成: {stats['completed']} 条")
    print(f"待完成: {stats['pending']} 条")
    
    if stats['total'] > 0:
        completion_rate = (stats['completed'] / stats['total']) * 100
        print(f"完成率: {completion_rate:.1f}%")

def main() -> None:
    """主程序"""
    manager = TodoManager()
    
    while True:
        display_menu()
        choice = input("\n请选择操作 (0-8): ")
        
        if choice == "0":
            print("\n再见！")
            break
        elif choice == "1":
            add_todo_menu(manager)
        elif choice == "2":
            manager.list_todos(show_completed=False)
        elif choice == "3":
            manager.list_todos(show_completed=True)
        elif choice == "4":
            complete_todo_menu(manager)
        elif choice == "5":
            delete_todo_menu(manager)
        elif choice == "6":
            search_todo_menu(manager)
        elif choice == "7":
            display_statistics(manager)
        elif choice == "8":
            manager.clear_all()
        else:
            print("❌ 无效选择，请重试")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n程序被中断")
    except Exception as e:
        print(f"\n❌ 发生错误: {e}")
```

## 完整代码

<details>
<summary>todo_manager.py</summary>

```python
import json
from typing import List, Dict, Optional
from datetime import datetime
from pathlib import Path


class TodoManager:
    """待办事项管理器"""
    
    def __init__(self, data_file: str = "todo.json"):
        """
        初始化待办事项管理器
        
        Args:
            data_file: 数据存储文件路径
        """
        self.data_file = Path(data_file)
        self.todos: List[Dict] = []
        self.load_todos()
    
    def load_todos(self) -> None:
        """从文件加载待办事项"""
        if self.data_file.exists():
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    self.todos = json.load(f)
                print(f"✓ 已加载 {len(self.todos)} 条待办事项")
            except (json.JSONDecodeError, IOError) as e:
                print(f"⚠️  加载数据失败: {e}")
                self.todos = []
        else:
            print("✓ 创建新的待办事项列表")
            self.todos = []
    
    def save_todos(self) -> None:
        """保存待办事项到文件"""
        try:
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(self.todos, f, ensure_ascii=False, indent=2)
            print(f"✓ 已保存 {len(self.todos)} 条待办事项")
        except IOError as e:
            print(f"❌ 保存数据失败: {e}")
    
    def add_todo(self, title: str, description: str = "") -> bool:
        """
        添加待办事项
        
        Args:
            title: 待办事项标题
            description: 待办事项描述（可选）
        
        Returns:
            是否添加成功
        """
        if not title.strip():
            print("❌ 标题不能为空")
            return False
        
        todo = {
            "id": self._generate_id(),
            "title": title.strip(),
            "description": description.strip(),
            "completed": False,
            "created_at": datetime.now().isoformat(),
            "completed_at": None
        }
        
        self.todos.append(todo)
        self.save_todos()
        print(f"✓ 已添加: {title}")
        return True
    
    def _generate_id(self) -> int:
        """生成唯一的 ID"""
        if not self.todos:
            return 1
        return max(todo["id"] for todo in self.todos) + 1
    
    def list_todos(self, show_completed: bool = False) -> None:
        """
        列出所有待办事项
        
        Args:
            show_completed: 是否显示已完成的待办事项
        """
        if not self.todos:
            print("📝 暂无待办事项")
            return
        
        # 过滤待办事项
        filtered_todos = self.todos
        if not show_completed:
            filtered_todos = [t for t in self.todos if not t["completed"]]
        
        if not filtered_todos:
            print("📝 暂无待办事项")
            return
        
        print(f"\n{'=' * 60}")
        print(f"{'待办事项列表'.center(60)}")
        print(f"{'=' * 60}")
        
        for todo in filtered_todos:
            status = "✓" if todo["completed"] else "○"
            print(f"\n[{status}] ID: {todo['id']}")
            print(f"     标题: {todo['title']}")
            if todo["description"]:
                print(f"     描述: {todo['description']}")
            print(f"     创建时间: {todo['created_at'][:19]}")
        
        print(f"\n{'=' * 60}")
        print(f"总计: {len(filtered_todos)} 条")
        print(f"{'=' * 60}")
    
    def complete_todo(self, todo_id: int) -> bool:
        """
        标记待办事项为完成
        
        Args:
            todo_id: 待办事项 ID
        
        Returns:
            是否操作成功
        """
        for todo in self.todos:
            if todo["id"] == todo_id:
                if todo["completed"]:
                    print(f"⚠️  待办事项 '{todo['title']}' 已经完成了")
                    return False
                
                todo["completed"] = True
                todo["completed_at"] = datetime.now().isoformat()
                self.save_todos()
                print(f"✓ 已完成: {todo['title']}")
                return True
        
        print(f"❌ 未找到 ID 为 {todo_id} 的待办事项")
        return False
    
    def delete_todo(self, todo_id: int) -> bool:
        """
        删除待办事项
        
        Args:
            todo_id: 待办事项 ID
        
        Returns:
            是否删除成功
        """
        for i, todo in enumerate(self.todos):
            if todo["id"] == todo_id:
                title = todo["title"]
                self.todos.pop(i)
                self.save_todos()
                print(f"✓ 已删除: {title}")
                return True
        
        print(f"❌ 未找到 ID 为 {todo_id} 的待办事项")
        return False
    
    def clear_all(self) -> None:
        """清空所有待办事项"""
        if not self.todos:
            print("📝 暂无待办事项")
            return
        
        confirm = input("确定要清空所有待办事项吗？(yes/no): ")
        if confirm.lower() == "yes":
            self.todos = []
            self.save_todos()
            print("✓ 已清空所有待办事项")
        else:
            print("已取消操作")
    
    def search_todos(self, keyword: str) -> None:
        """
        搜索待办事项
        
        Args:
            keyword: 搜索关键词
        """
        if not keyword.strip():
            print("❌ 搜索关键词不能为空")
            return
        
        results = [
            todo for todo in self.todos
            if keyword.lower() in todo["title"].lower() or
            keyword.lower() in todo["description"].lower()
        ]
        
        if not results:
            print(f"📝 未找到包含 '{keyword}' 的待办事项")
            return
        
        print(f"\n找到 {len(results)} 条结果:")
        for todo in results:
            status = "✓" if todo["completed"] else "○"
            print(f"\n[{status}] ID: {todo['id']}")
            print(f"     标题: {todo['title']}")
            if todo["description"]:
                print(f"     描述: {todo['description']}")
    
    def get_statistics(self) -> Dict[str, int]:
        """
        获取统计信息
        
        Returns:
            统计信息字典
        """
        total = len(self.todos)
        completed = sum(1 for t in self.todos if t["completed"])
        pending = total - completed
        
        return {
            "total": total,
            "completed": completed,
            "pending": pending
        }
```

</details>

<details>
<summary>todo.py</summary>

```python
from todo_manager import TodoManager
from typing import Optional


def display_menu() -> None:
    """显示主菜单"""
    print("\n" + "=" * 40)
    print("待办事项管理器".center(40))
    print("=" * 40)
    print("1. 添加待办事项")
    print("2. 查看待办事项")
    print("3. 查看所有待办事项（包括已完成）")
    print("4. 标记为完成")
    print("5. 删除待办事项")
    print("6. 搜索待办事项")
    print("7. 查看统计信息")
    print("8. 清空所有待办事项")
    print("0. 退出")
    print("=" * 40)


def add_todo_menu(manager: TodoManager) -> None:
    """添加待办事项菜单"""
    print("\n--- 添加待办事项 ---")
    title = input("标题: ")
    description = input("描述（可选）: ")
    manager.add_todo(title, description)


def complete_todo_menu(manager: TodoManager) -> None:
    """完成待办事项菜单"""
    print("\n--- 标记为完成 ---")
    manager.list_todos(show_completed=False)
    
    if not manager.todos:
        return
    
    try:
        todo_id = int(input("\n请输入要完成的待办事项 ID: "))
        manager.complete_todo(todo_id)
    except ValueError:
        print("❌ 请输入有效的 ID")


def delete_todo_menu(manager: TodoManager) -> None:
    """删除待办事项菜单"""
    print("\n--- 删除待办事项 ---")
    manager.list_todos()
    
    if not manager.todos:
        return
    
    try:
        todo_id = int(input("\n请输入要删除的待办事项 ID: "))
        manager.delete_todo(todo_id)
    except ValueError:
        print("❌ 请输入有效的 ID")


def search_todo_menu(manager: TodoManager) -> None:
    """搜索待办事项菜单"""
    print("\n--- 搜索待办事项 ---")
    keyword = input("请输入搜索关键词: ")
    manager.search_todos(keyword)


def display_statistics(manager: TodoManager) -> None:
    """显示统计信息"""
    print("\n--- 统计信息 ---")
    stats = manager.get_statistics()
    print(f"总计: {stats['total']} 条")
    print(f"已完成: {stats['completed']} 条")
    print(f"待完成: {stats['pending']} 条")
    
    if stats['total'] > 0:
        completion_rate = (stats['completed'] / stats['total']) * 100
        print(f"完成率: {completion_rate:.1f}%")


def main() -> None:
    """主程序"""
    manager = TodoManager()
    
    while True:
        display_menu()
        choice = input("\n请选择操作 (0-8): ")
        
        if choice == "0":
            print("\n再见！")
            break
        elif choice == "1":
            add_todo_menu(manager)
        elif choice == "2":
            manager.list_todos(show_completed=False)
        elif choice == "3":
            manager.list_todos(show_completed=True)
        elif choice == "4":
            complete_todo_menu(manager)
        elif choice == "5":
            delete_todo_menu(manager)
        elif choice == "6":
            search_todo_menu(manager)
        elif choice == "7":
            display_statistics(manager)
        elif choice == "8":
            manager.clear_all()
        else:
            print("❌ 无效选择，请重试")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n程序被中断")
    except Exception as e:
        print(f"\n❌ 发生错误: {e}")
```

</details>

## 运行项目

```bash
# 运行程序
python3 todo.py

# 示例输出
# ========================================
#           待办事项管理器
# ========================================
# 1. 添加待办事项
# 2. 查看待办事项
# 3. 查看所有待办事项（包括已完成）
# 4. 标记为完成
# 5. 删除待办事项
# 6. 搜索待办事项
# 7. 查看统计信息
# 8. 清空所有待办事项
# 0. 退出
# ========================================
```

## 扩展功能建议

1. **优先级设置**：为待办事项添加优先级（高、中、低）
2. **标签系统**：为待办事项添加标签，便于分类管理
3. **截止日期**：为待办事项设置截止日期，并显示提醒
4. **分类管理**：将待办事项按项目或类别分组
5. **导入导出**：支持导入和导出待办事项（CSV、JSON 格式）
6. **颜色输出**：使用 ANSI 颜色代码美化输出
7. **历史记录**：记录已完成的待办事项历史

## 学习要点

通过这个项目，你学会了：

✅ **数据结构应用**
- 使用列表存储待办事项
- 使用字典表示单个待办事项
- 使用列表推导式过滤和转换数据

✅ **函数设计**
- 创建可复用的函数
- 使用类型提示提高代码质量
- 使用文档字符串说明函数功能

✅ **文件操作**
- 使用 JSON 格式存储数据
- 使用 `with` 语句安全地读写文件
- 处理文件操作中的异常

✅ **用户交互**
- 创建命令行界面
- 处理用户输入
- 提供友好的错误提示

✅ **项目组织**
- 将代码模块化
- 分离业务逻辑和用户界面
- 使用类封装相关功能

## 下一章

[第6章：面向对象编程](/chapter-06/) - 深入学习 Python 的面向对象编程，包括类、继承、多态等概念。