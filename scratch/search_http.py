import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r"C:\Users\Ayyappa\Desktop\skill - Copy\skillgenome\App.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

start = max(0, 670 - 1)
end = min(len(lines), 710)
for idx in range(start, end):
    print(f"Line {idx+1}: {lines[idx].rstrip()}")
