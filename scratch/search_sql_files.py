import os

found_files = []
for root, dirs, files in os.walk("c:/Users/Ayyappa/Desktop/skill - Copy"):
    if ".git" in root or ".venv" in root or "node_modules" in root:
        continue
    for file in files:
        if file.endswith(".sql"):
            found_files.append(os.path.join(root, file))

print("SQL files found:")
for f in found_files:
    print("-", f)
