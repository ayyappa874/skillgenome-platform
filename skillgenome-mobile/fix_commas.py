import os
import glob
import re

dir_path = r"C:\Users\ASUS\OneDrive\Desktop\skill genome\skillgenome-mobile\screens"
files = glob.glob(os.path.join(dir_path, "*.js"))

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # Replace double commas that might have space between them
    content = re.sub(r',\s*,', ',', content)

    if content != original:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed commas in {os.path.basename(file)}")
