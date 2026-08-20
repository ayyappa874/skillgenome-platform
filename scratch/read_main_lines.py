with open("c:/Users/Ayyappa/Desktop/skill - Copy/backend/main.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i in range(679, 715):
    if i < len(lines):
        print(f"{i+1}: {lines[i]}", end="")
