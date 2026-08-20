with open("c:/Users/Ayyappa/Desktop/skill - Copy/skillgenome/screens/SCREEN26THOUGHTPRINTINPUT.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "mood" in line or "Mood" in line:
        print(f"Line {i+1}: {line.strip()}")
