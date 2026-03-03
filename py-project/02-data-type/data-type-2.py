

students = [
  {"name": "张三", "age": 18, "score": 91},
  {"name": "李四", "age": 28, "score": 88},
  {"name": "王五", "age": 38, "score": 66},
  {"name": "赵六", "age": 48, "score": 55},
]

high_score_students = [s for s in students if s["score"] > 80]
print(f"成绩大于 80 的学生: {high_score_students}")

for stu in high_score_students:
  print(f" {stu['name']}: {stu['score']} 分")


print('============= 分割线 =====================')


total_score = sum(s["score"] for s in students)
average_score = total_score / len(students)

print(f"平均成绩为: {average_score:.2f} 分")


print('============= 分割线 =====================')

sorted_students = sorted(students, key=lambda x: x['score'], reverse=True)

print("\n 按照成绩排序: ")

for i, student in enumerate(sorted_students, 1):
  print(f" {i}. {student['name']} : {student['score'] } 分")


print('============= 分割线 =====================')

# 统计各个分数阶段

excellent = len([s for s in students if s["score"] >= 90])
good = len([s for s in students if 80 <= s['score'] < 90])
passing = len([s for s in students if 60 <= s['score'] < 80])
failing = len([s for s in students if s['score'] < 60])

print(f"\n成绩分布如下")
print(f" 优秀 >= 90: {excellent} 人")
print(f" 良好 (80-90): {good} 人")
print(f" 及格 (60-80): {passing} 人")
print(f" 不及格 < 60: {failing} 人")