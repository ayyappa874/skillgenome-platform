import os
import glob
import re

dir_path = r"C:\Users\ASUS\OneDrive\Desktop\skill genome\skillgenome-mobile\screens"
files = glob.glob(os.path.join(dir_path, "*.js"))

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # Determine the theme variable used in this file
    has_t = bool(re.search(r'\b(?:const|let|var)\s+T\s*=', content) or re.search(r'T\s*=\s*getTheme', content))
    has_c = bool(re.search(r'\b(?:const|let|var)\s+C\s*=', content) or re.search(r'C\s*=\s*getTheme', content))
    has_theme = bool(re.search(r'\b(?:const|let|var)\s+theme\s*=', content) or re.search(r'theme\s*=\s*getTheme', content))
    
    if not has_t:
        if has_c:
            content = content.replace('T.text', 'C.text')
            content = content.replace('T.muted', 'C.muted')
            content = content.replace('T.border', 'C.border')
        elif has_theme:
            content = content.replace('T.text', 'theme.text')
            content = content.replace('T.muted', 'theme.muted')
            content = content.replace('T.border', 'theme.border')
        else:
            # Fallback to hardcoded light mode colors if no theme var is found (very rare)
            content = content.replace('T.text', '"#111827"')
            content = content.replace('T.muted', '"#64748b"')
            content = content.replace('T.border', '"rgba(15, 23, 42, 0.07)"')

    if content != original:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed " + os.path.basename(file))
