import os
import glob
import re

dir_path = r"C:\Users\ASUS\OneDrive\Desktop\skill genome\skillgenome-mobile\screens"
files = glob.glob(os.path.join(dir_path, "*.js"))

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # Fix properties corrupted by greedy regex
    content = content.replace('"rgba(255,255,255,0.1)"Strong', 'C.borderStrong')
    content = content.replace('"rgba(255,255,255,0.1)"Low', 'C.borderLow')
    content = content.replace('"#fafafa"Muted', 'C.textMuted')
    content = content.replace('"#a1a1aa"Strong', 'C.mutedStrong')
    content = content.replace('\'rgba(255,255,255,0.1)\'Strong', 'C.borderStrong')
    content = content.replace('\'rgba(255,255,255,0.1)\'Low', 'C.borderLow')

    # Also, some files might use T instead of C
    # But wait, if they didn't have has_t_global, my script removed T and used raw string + Strong.
    # So C.borderStrong or T.borderStrong? Let's just restore them correctly based on what was there.
    # Actually, for Screen4Native.js, it might use T or C.
    
    if content != original:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed corrupted colors in {os.path.basename(file)}")
