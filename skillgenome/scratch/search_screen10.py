with open("c:/Users/Ayyappa/Desktop/skill - Copy/skillgenome/App.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "currentScreen === 10" in line:
        print(f"--- Line {i+1} ---")
        for j in range(max(0, i-2), min(len(lines), i+10)):
            print(f"{j+1}: {lines[j]}", end="")
