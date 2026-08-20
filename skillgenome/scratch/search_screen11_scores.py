with open("c:/Users/Ayyappa/Desktop/skill - Copy/skillgenome/screens/Screen11.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "isEmotionCompleted" in line or "emotionScore" in line:
        print(f"Line {i+1}: {line.strip()}")
