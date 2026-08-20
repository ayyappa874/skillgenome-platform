import sys
sys.stdout.reconfigure(encoding='utf-8')

with open("c:/Users/Ayyappa/Desktop/skill - Copy/skillgenome/screens/SCREEN26THOUGHTPRINTINPUT.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i in range(29, 45):
    if i < len(lines):
        print(f"{i+1}: {lines[i]}", end="")
