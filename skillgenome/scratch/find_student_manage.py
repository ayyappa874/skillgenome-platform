import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r"c:\Users\Ayyappa\Desktop\skill - Copy\skillgenome\screens\MentorDashboardScreen.js"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "selectedstudent" in line.lower() or "managestudent" in line.lower() or "tab" in line.lower():
        if i % 10 == 0 or any(kw in line.lower() for kw in ["selectedstudent", "managestudent"]):
            print(f"{i+1}: {line.strip()}")
