with open("c:/Users/Ayyappa/Desktop/skill - Copy/backend/main.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "voiceAnalysis" in line or "eqScore" in line or "aiFeedback" in line:
        print(f"Line {i+1}: {line.strip()}")
