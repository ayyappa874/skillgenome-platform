import sys
sys.stdout.reconfigure(encoding='utf-8')

with open("C:/Users/Ayyappa/.gemini/antigravity/brain/bb936020-c5fc-4e8b-87a4-ac7d61f3dca7/walkthrough.md", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i in range(max(0, len(lines)-15), len(lines)):
    print(f"{i+1}: {lines[i]}", end="")
