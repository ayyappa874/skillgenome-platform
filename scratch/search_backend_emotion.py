with open("c:/Users/Ayyappa/Desktop/skill - Copy/backend/main.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

found = []
for i, line in enumerate(lines):
    if "analyze-emotion" in line or "analyze_emotion" in line:
        found.append((i+1, line.strip()))

for num, text in found:
    print(f"{num}: {text}")
