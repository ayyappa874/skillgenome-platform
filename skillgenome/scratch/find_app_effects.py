import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r"c:\Users\Ayyappa\Desktop\skill - Copy\skillgenome\App.js"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "useeffect" in line.lower():
        print(f"Line {i+1}: {line.strip()}")
        # print 5 lines around it
        start = max(0, i - 2)
        end = min(len(lines), i + 8)
        for j in range(start, end):
            print(f"  {j+1}: {lines[j].strip()}")
