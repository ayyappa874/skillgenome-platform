import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r"c:\Users\Ayyappa\Desktop\skill - Copy\skillgenome\App.js"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "currentscreen ===" in line.lower() or "currentscreen =" in line.lower():
        print(f"{i+1}: {line.strip()}")
