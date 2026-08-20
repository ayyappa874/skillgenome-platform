import re

with open("c:/Users/ASUS/Desktop/skill - Copy/skillgenome/screens/Screen11.js", "r", encoding="utf-8") as f:
    content = f.read()

print("File loaded. Checking for static colors...")
static_whites = [m.start() for m in re.finditer(r'#fff|#ffffff|Color.colorWhiteSolid', content, re.IGNORECASE)]
print(f"Occurrences of white constants: {len(static_whites)}")

# Print stylesheet lines containing color definitions
lines = content.split("\n")
styles_start = -1
for idx, line in enumerate(lines):
    if "StyleSheet.create" in line:
        styles_start = idx
        break

if styles_start != -1:
    print(f"StyleSheet starts at line {styles_start + 1}")
    for i in range(styles_start, len(lines)):
        if "color" in lines[i] or "backgroundColor" in lines[i] or "borderColor" in lines[i]:
            print(f"Line {i+1}: {lines[i].strip()}")
