import os
import glob
import re

dir_path = r"C:\Users\ASUS\OneDrive\Desktop\skill genome\skillgenome-mobile\screens"
files = glob.glob(os.path.join(dir_path, "*.js"))

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # If it uses T.text in StyleSheet (which is usually at the bottom)
    if 'T.text' in content or 'T.muted' in content:
        # Check if T is defined at the top scope (e.g. const T = { )
        has_t_global = bool(re.search(r'^const T = \{', content, re.MULTILINE))
        if not has_t_global:
            print(f"Missing global T: {os.path.basename(file)}")
