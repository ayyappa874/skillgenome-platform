import os
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

screens_dir = r"c:\Users\Ayyappa\Desktop\skill - Copy\skillgenome"
files = []
for root, dirs, filenames in os.walk(screens_dir):
    for f in filenames:
        if f.endswith(".js"):
            files.append(os.path.join(root, f))

color_regex = re.compile(r"colorBlackSolid", re.IGNORECASE)

for fpath in files:
    with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()
    
    found = []
    for i, line in enumerate(lines):
        if color_regex.search(line):
            found.append((i+1, line.strip()))
    
    if found:
        print(f"\nFile: {os.path.basename(fpath)}")
        for lnum, line in found:
            print(f"  Line {lnum}: {line}")
