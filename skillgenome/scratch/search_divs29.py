import re

with open("c:/Users/Ayyappa/Desktop/skill - Copy/skillgenome/App.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Divs29" in line or "emotionAnalysis" in line or "handleSaveEmotion" in line:
        print(f"{i+1}: {line.strip()}")
