import sys
sys.stdout.reconfigure(encoding='utf-8')

with open("c:/Users/Ayyappa/Desktop/skill - Copy/skillgenome/screens/Screen11.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "emotionAnalysis" in line or "Emotion" in line:
        print(f"--- Line {i+1} ---")
        for j in range(max(0, i-4), min(len(lines), i+8)):
            print(f"{j+1}: {lines[j]}", end="")
