import re

files = [
    r"c:\Users\Ayyappa\Desktop\skill - Copy\skillgenome\screens\WelcomeScreen.js",
    r"c:\Users\Ayyappa\Desktop\skill - Copy\skillgenome\screens\Screen2.js",
    r"c:\Users\Ayyappa\Desktop\skill - Copy\skillgenome\screens\Screen3.js",
    r"c:\Users\Ayyappa\Desktop\skill - Copy\skillgenome\screens\Screen4.js",
]

for path in files:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    print(f"\nFile: {path.split('\\')[-1]}")
    matches = re.finditer(r"color:\s*['\"]([^'\"]+)['\"]", content)
    for m in matches:
        print(f"  Color property: {m.group(0).strip()}")
