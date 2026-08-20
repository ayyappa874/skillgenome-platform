import re

path = r"c:\Users\Ayyappa\Desktop\skill - Copy\skillgenome\screens\Screen3.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Find any color matches
matches = re.findall(r"color:\s*['\"]([^'\"]+)['\"]", content)
print("Colors in Screen3:")
for m in set(matches):
    print(f"  {m}")
