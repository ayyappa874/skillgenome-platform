with open("c:/Users/Ayyappa/Desktop/skill - Copy/skillgenome/App.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i in range(839, 930):
    if i < len(lines):
        print(f"{i+1}: {lines[i]}", end="")
