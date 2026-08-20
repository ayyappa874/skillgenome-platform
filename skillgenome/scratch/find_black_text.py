import os
import re

screens_dir = r"c:\Users\Ayyappa\Desktop\skill - Copy\skillgenome\screens"
files = [f for f in os.listdir(screens_dir) if f.endswith(".js")]

for fname in files:
    fpath = os.path.join(screens_dir, fname)
    with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    
    # Find style color properties
    matches = re.finditer(r"color:\s*['\"](#000000|#000|#111|#222|#333|black|#1c1c1e)['\"]", content, re.IGNORECASE)
    has_printed_header = False
    for match in matches:
        if not has_printed_header:
            print(f"\nFile: {fname}")
            has_printed_header = True
        # Print surrounding context
        start = max(0, match.start() - 30)
        end = min(len(content), match.end() + 30)
        context = content[start:end].replace('\n', ' ')
        print(f"  Line context: ... {context.strip()} ...")
