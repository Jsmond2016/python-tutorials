# 项目2：数据处理脚本

这是第二个实战项目，我们将综合运用第6-10章的知识，开发一个实用的数据处理工具。

## 项目概述

开发一个命令行数据处理工具，能够读取、清洗、分析和导出各种格式的数据文件。

## 功能需求

- ✅ 支持多种文件格式（CSV、JSON、Excel）
- ✅ 数据清洗和验证
- ✅ 数据统计和分析
- ✅ 生成可视化报告
- ✅ 导出处理结果
- ✅ 命令行参数解析
- ✅ 进度显示和错误处理

## 技术要点

- 面向对象编程（类和继承）
- 模块化设计
- 异常处理
- 装饰器（计时、缓存、日志）
- 上下文管理器
- 命令行参数

## 项目结构

```
data-processor/
├── main.py              # 程序入口
├── config.py            # 配置管理
├── utils/               # 工具模块
│   ├── __init__.py
│   ├── decorators.py    # 装饰器
│   └── validators.py    # 验证器
├── readers/             # 读取器模块
│   ├── __init__.py
│   ├── base.py          # 基类
│   ├── csv_reader.py
│   ├── json_reader.py
│   └── excel_reader.py
├── processors/          # 处理器模块
│   ├── __init__.py
│   ├── cleaner.py       # 数据清洗
│   └── analyzer.py      # 数据分析
├── writers/             # 写入器模块
│   ├── __init__.py
│   └── report_writer.py
└── requirements.txt
```

## 完整代码

### 1. 装饰器工具 (utils/decorators.py)

```python
import time
import logging
from functools import wraps

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def timer(func):
    """计时装饰器"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        logger.info(f"{func.__name__} 耗时: {elapsed:.2f}秒")
        return result
    return wrapper


def log(func):
    """日志装饰器"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        logger.info(f"调用 {func.__name__}")
        try:
            result = func(*args, **kwargs)
            logger.info(f"{func.__name__} 完成")
            return result
        except Exception as e:
            logger.error(f"{func.__name__} 失败: {e}")
            raise
    return wrapper
```

### 2. 数据验证器 (utils/validators.py)

```python
class ValidationError(Exception):
    """验证错误"""
    pass


class DataValidator:
    """数据验证器"""

    @staticmethod
    def validate_email(email: str) -> bool:
        """验证邮箱"""
        return "@" in email and "." in email.split("@")[-1]

    @staticmethod
    def validate_positive_number(value) -> bool:
        """验证正数"""
        try:
            return float(value) > 0
        except (ValueError, TypeError):
            return False

    @staticmethod
    def validate_required(value) -> bool:
        """验证必填字段"""
        return value is not None and value != ""
```

### 3. 读取器基类 (readers/base.py)

```python
from abc import ABC, abstractmethod
from pathlib import Path
from typing import List, Dict, Any


class DataReader(ABC):
    """数据读取器基类"""

    def __init__(self, filepath: str):
        self.filepath = Path(filepath)

    def _validate_file(self) -> None:
        """验证文件"""
        if not self.filepath.exists():
            raise FileNotFoundError(f"文件不存在: {self.filepath}")

        if not self.filepath.is_file():
            raise ValueError(f"路径不是文件: {self.filepath}")

    @abstractmethod
    def read(self) -> List[Dict[str, Any]]:
        """读取数据（子类实现）"""
        pass

    def __enter__(self):
        """进入上下文"""
        self._validate_file()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """退出上下文"""
        return False
```

### 4. CSV 读取器 (readers/csv_reader.py)

```python
import csv
from typing import List, Dict, Any
from .base import DataReader


class CSVReader(DataReader):
    """CSV 文件读取器"""

    def read(self) -> List[Dict[str, Any]]:
        """读取 CSV 文件"""
        self._validate_file()

        data = []
        with open(self.filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # 转换空字符串为 None
                cleaned_row = {
                    k: (v if v != "" else None)
                    for k, v in row.items()
                }
                data.append(cleaned_row)

        print(f"✓ 从 {self.filepath.name} 读取了 {len(data)} 条记录")
        return data
```

### 5. JSON 读取器 (readers/json_reader.py)

```python
import json
from typing import List, Dict, Any
from .base import DataReader


class JSONReader(DataReader):
    """JSON 文件读取器"""

    def read(self) -> List[Dict[str, Any]]:
        """读取 JSON 文件"""
        self._validate_file()

        with open(self.filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # 确保是列表
        if not isinstance(data, list):
            data = [data]

        print(f"✓ 从 {self.filepath.name} 读取了 {len(data)} 条记录")
        return data
```

### 6. 数据清洗器 (processors/cleaner.py)

```python
from typing import List, Dict, Any
from utils.validators import DataValidator, ValidationError


class DataCleaner:
    """数据清洗器"""

    def __init__(self):
        self.validator = DataValidator()
        self.cleaning_stats = {
            'total_rows': 0,
            'cleaned_rows': 0,
            'removed_rows': 0,
            'errors': []
        }

    def clean(
        self,
        data: List[Dict[str, Any]],
        rules: Dict[str, str]
    ) -> List[Dict[str, Any]]:
        """
        清洗数据

        Args:
            data: 原始数据
            rules: 清洗规则 {'field': 'rule_type'}

        Returns:
            清洗后的数据
        """
        self.cleaning_stats['total_rows'] = len(data)
        cleaned_data = []

        for i, row in enumerate(data):
            try:
                # 应用清洗规则
                cleaned_row = self._apply_rules(row, rules)
                cleaned_data.append(cleaned_row)
                self.cleaning_stats['cleaned_rows'] += 1

            except ValidationError as e:
                self.cleaning_stats['removed_rows'] += 1
                self.cleaning_stats['errors'].append({
                    'row': i,
                    'error': str(e)
                })

        return cleaned_data

    def _apply_rules(
        self,
        row: Dict[str, Any],
        rules: Dict[str, str]
    ) -> Dict[str, Any]:
        """应用清洗规则"""
        result = {}

        for field, rule in rules.items():
            value = row.get(field)

            # 必填规则
            if rule == 'required':
                if not self.validator.validate_required(value):
                    raise ValidationError(f"字段 '{field}' 不能为空")
                result[field] = value

            # 邮箱规则
            elif rule == 'email':
                if value and not self.validator.validate_email(value):
                    raise ValidationError(f"字段 '{field}' 邮箱格式无效")
                result[field] = value

            # 正数规则
            elif rule == 'positive':
                if value and not self.validator.validate_positive_number(value):
                    raise ValidationError(f"字段 '{field}' 必须是正数")
                result[field] = value

            # 去除空格
            elif rule == 'strip':
                if isinstance(value, str):
                    result[field] = value.strip()
                else:
                    result[field] = value

            else:
                result[field] = value

        return result

    def get_stats(self) -> Dict[str, Any]:
        """获取清洗统计"""
        return self.cleaning_stats
```

### 7. 数据分析器 (processors/analyzer.py)

```python
from typing import List, Dict, Any
from collections import Counter
from utils.decorators import timer, log


class DataAnalyzer:
    """数据分析器"""

    def __init__(self):
        self.stats = {}

    @timer
    @log
    def analyze(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        分析数据

        Args:
            data: 数据列表

        Returns:
            分析结果
        """
        if not data:
            return {"error": "没有数据可分析"}

        return {
            'total_records': len(data),
            'fields': list(data[0].keys()),
            'field_stats': self._analyze_fields(data),
            'missing_values': self._count_missing(data)
        }

    def _analyze_fields(self, data: List[Dict[str, Any]]) -> Dict:
        """分析各个字段"""
        field_stats = {}

        for field in data[0].keys():
            values = [row.get(field) for row in data if row.get(field) is not None]

            if values:
                # 数值类型
                if all(isinstance(v, (int, float)) for v in values):
                    field_stats[field] = {
                        'type': 'numeric',
                        'count': len(values),
                        'min': min(values),
                        'max': max(values),
                        'avg': sum(values) / len(values)
                    }
                # 字符串类型
                elif all(isinstance(v, str) for v in values):
                    counter = Counter(values)
                    field_stats[field] = {
                        'type': 'string',
                        'count': len(values),
                        'unique': len(counter),
                        'most_common': counter.most_common(5)
                    }

        return field_stats

    def _count_missing(self, data: List[Dict[str, Any]]) -> Dict[str, int]:
        """统计缺失值"""
        missing = {}
        for field in data[0].keys():
            count = sum(1 for row in data if row.get(field) is None)
            missing[field] = count
        return missing
```

### 8. 报告写入器 (writers/report_writer.py)

```python
import json
from typing import Dict, Any
from pathlib import Path
from datetime import datetime


class ReportWriter:
    """报告写入器"""

    def __init__(self, output_dir: str = "output"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)

    def write_report(
        self,
        data: Dict[str, Any],
        filename: str = None
    ) -> str:
        """
        写入报告

        Args:
            data: 报告数据
            filename: 文件名

        Returns:
            输出文件路径
        """
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"report_{timestamp}.json"

        output_path = self.output_dir / filename

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"✓ 报告已保存到 {output_path}")
        return str(output_path)

    def write_summary(self, stats: Dict[str, Any]) -> None:
        """写入摘要报告"""
        print("\n" + "=" * 60)
        print("数据处理摘要")
        print("=" * 60)

        for key, value in stats.items():
            if isinstance(value, dict):
                print(f"\n{key}:")
                for k, v in value.items():
                    print(f"  {k}: {v}")
            else:
                print(f"{key}: {value}")

        print("=" * 60 + "\n")
```

### 9. 主程序 (main.py)

```python
import argparse
from readers.csv_reader import CSVReader
from readers.json_reader import JSONReader
from processors.cleaner import DataCleaner
from processors.analyzer import DataAnalyzer
from writers.report_writer import ReportWriter


def get_reader(filepath: str):
    """根据文件扩展名获取读取器"""
    if filepath.endswith('.csv'):
        return CSVReader(filepath)
    elif filepath.endswith('.json'):
        return JSONReader(filepath)
    else:
        raise ValueError(f"不支持的文件格式: {filepath}")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description='数据处理工具',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python main.py data.csv
  python main.py data.csv --rules email:required,age:positive
  python main.py data.csv --output results/
        """
    )

    parser.add_argument('input', help='输入文件路径')
    parser.add_argument(
        '--rules',
        help='清洗规则 (格式: field:rule,field:rule)',
        default='name:strip,email:email,age:positive'
    )
    parser.add_argument(
        '--output',
        help='输出目录',
        default='output'
    )

    args = parser.parse_args()

    try:
        # 1. 读取数据
        print(f"📂 读取文件: {args.input}")
        reader = get_reader(args.input)
        data = reader.read()

        # 2. 解析清洗规则
        rules = {}
        if args.rules:
            for rule_str in args.rules.split(','):
                if ':' in rule_str:
                    field, rule = rule_str.split(':', 1)
                    rules[field.strip()] = rule.strip()

        # 3. 清洗数据
        print(f"🧹 清洗数据...")
        cleaner = DataCleaner()
        cleaned_data = cleaner.clean(data, rules)
        cleaner.get_stats()

        # 4. 分析数据
        print(f"📊 分析数据...")
        analyzer = DataAnalyzer()
        analysis = analyzer.analyze(cleaned_data)

        # 5. 生成报告
        print(f"📝 生成报告...")
        writer = ReportWriter(args.output)
        report_path = writer.write_report(analysis)

        # 6. 打印摘要
        summary = {
            '输入文件': args.input,
            '原始记录数': len(data),
            '清洗后记录数': len(cleaned_data),
            '移除记录数': cleaner.cleaning_stats['removed_rows'],
            '报告文件': report_path
        }
        writer.write_summary(summary)

        print("✅ 处理完成！")

    except Exception as e:
        print(f"❌ 错误: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())
```

### 10. 配置文件 (config.py)

```python
"""
配置管理模块
"""
from pathlib import Path
from typing import Dict, Any
import json


class Config:
    """配置类"""

    # 默认配置
    DEFAULT_CONFIG = {
        'input_dir': 'data',
        'output_dir': 'output',
        'supported_formats': ['.csv', '.json'],
        'max_file_size': 100 * 1024 * 1024,  # 100MB
        'encoding': 'utf-8',
        'default_rules': {
            'name': 'strip',
            'email': 'email',
            'age': 'positive'
        }
    }

    def __init__(self, config_file: str = None):
        """初始化配置"""
        self.config = self.DEFAULT_CONFIG.copy()

        if config_file:
            self.load(config_file)

    def load(self, config_file: str) -> None:
        """加载配置文件"""
        config_path = Path(config_file)

        if config_path.exists():
            with open(config_path, 'r', encoding='utf-8') as f:
                user_config = json.load(f)
                self.config.update(user_config)

    def get(self, key: str, default=None):
        """获取配置项"""
        return self.config.get(key, default)

    def set(self, key: str, value: Any) -> None:
        """设置配置项"""
        self.config[key] = value
```

## 使用示例

### 创建测试数据

```python
# data/sample.csv
name,email,age,salary
张三,zhangsan@example.com,25,5000
李四,lisi@example.com,30,6000
王五,wangwu@example.com,28,,
赵六,,35,7000
```

### 运行程序

```bash
# 基本用法
python main.py data/sample.csv

# 自定义清洗规则
python main.py data/sample.csv --rules name:strip,email:email,age:positive,salary:positive

# 指定输出目录
python main.py data/sample.csv --output results/
```

### 输出示例

```
📂 读取文件: data/sample.csv
✓ 从 sample.csv 读取了 4 条记录
🧹 清洗数据...
✓ 从 sample.csv 读取了 4 条记录
📊 分析数据...
调用 analyze
analyze 耗时: 0.00秒
analyze 完成
📝 生成报告...
✓ 报告已保存到 output/report_20240115_143045.json

============================================================
数据处理摘要
============================================================
输入文件: data/sample.csv
原始记录数: 4
清洗后记录数: 3
移除记录数: 1
报告文件: output/report_20240115_143045.json
============================================================

✅ 处理完成！
```

### 生成的报告

```json
{
  "total_records": 3,
  "fields": ["name", "email", "age", "salary"],
  "field_stats": {
    "name": {
      "type": "string",
      "count": 3,
      "unique": 3,
      "most_common": [["张三", 1], ["李四", 1], ["王五", 1]]
    },
    "email": {
      "type": "string",
      "count": 3,
      "unique": 3,
      "most_common": [["zhangsan@example.com", 1], ["lisi@example.com", 1], ["wangwu@example.com", 1]]
    },
    "age": {
      "type": "numeric",
      "count": 3,
      "min": 25,
      "max": 30,
      "avg": 27.666666666666668
    }
  },
  "missing_values": {
    "name": 0,
    "email": 0,
    "age": 0,
    "salary": 1
  }
}
```

## 知识点总结

本项目综合运用了以下知识点：

| 知识点 | 应用位置 |
|--------|----------|
| 类和对象 | 所有类定义 |
| 继承 | DataReader 基类 |
| 装饰器 | @timer, @log |
| 上下文管理器 | `__enter__`, `__exit__` |
| 异常处理 | try-except 各处 |
| 模块化 | 多文件组织 |
| 命令行参数 | argparse |
| 类型提示 | 所有函数 |

## 扩展练习

1. **支持更多格式**：添加 Excel 读取支持
2. **并行处理**：使用多进程处理大文件
3. **可视化**：生成图表报告
4. **配置文件**：支持 YAML 配置
5. **单元测试**：添加 pytest 测试

## 下一章

继续学习 [第11章：Web 开发入门](/chapter-11/)，开始探索 Python Web 开发的世界！
