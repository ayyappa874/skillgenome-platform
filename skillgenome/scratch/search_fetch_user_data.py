with open("c:/Users/Ayyappa/Desktop/skill - Copy/skillgenome/App.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "fetchUserData" in line or "auth.onAuthStateChange" in line:
        print(f"Line {i+1}: {line.strip()}")
