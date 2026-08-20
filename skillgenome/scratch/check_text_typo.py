import os
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

screens_dir = r"c:\Users\Ayyappa\Desktop\skill - Copy\skillgenome\screens"
files = [f for f in os.listdir(screens_dir) if f.endswith(".js")]

for fname in files:
    fpath = os.path.join(screens_dir, fname)
    with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    
    if "textTypo" in content:
        print(f"File: {fname}")
        matches = re.finditer(r"textTypo:\s*\{([^}]+)\}", content)
        for m in matches:
            print(f"  Definition: {m.group(0).strip()}")
