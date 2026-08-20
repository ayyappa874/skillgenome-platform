import os
import glob
import re

dir_path = r"C:\Users\ASUS\OneDrive\Desktop\skill genome\skillgenome-mobile\screens"
files = glob.glob(os.path.join(dir_path, "*.js"))

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    # Fix broken imports
    content = re.sub(r'import\s*\n+\s*\{\s*getTheme\s*\}', r'import { getTheme }', content)
    content = re.sub(r'import\s*\n+\s*\{\s*t\s*\}', r'import { t }', content)
    
    if content != original:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed syntax for {os.path.basename(file)}")
