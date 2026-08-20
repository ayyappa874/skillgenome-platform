import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r"c:\Users\Ayyappa\Desktop\skill - Copy\skillgenome\screens\Screen11.js"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "color" in line.lower() and any(kw in line.lower() for kw in ["000", "black", "111", "222", "333", "060612", "grey", "gray"]):
        print(f"{i+1}: {line.strip()}")
