with open("c:/Users/ASUS/Desktop/skill - Copy/skillgenome/screens/MentorDashboardScreen.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

print("File loaded. Scanning declarations...")
for idx, line in enumerate(lines):
    if line.strip().startswith("const ") and "=" in line and ("=>" in line or "function" in line) and idx < 2679:
        print(f"Line {idx+1}: {line.strip()}")
