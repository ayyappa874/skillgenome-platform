import os
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

screens_dir = r"c:\Users\Ayyappa\Desktop\skill - Copy\skillgenome\screens"
files = [f for f in os.listdir(screens_dir) if f.endswith(".js")]

color_regex = re.compile(r"color:\s*['\"](#000|#000000|black|#111|#111111|#222|#222222|#333|#333333|#060612)['\"]", re.IGNORECASE)

for fname in files:
    fpath = os.path.join(screens_dir, fname)
    with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()
    
    found = []
    for i, line in enumerate(lines):
        if color_regex.search(line):
            found.append((i+1, line.strip()))
    
    if found:
        print(f"\nFile: {fname}")
        for lnum, line in found:
            print(f"  Line {lnum}: {line}")
