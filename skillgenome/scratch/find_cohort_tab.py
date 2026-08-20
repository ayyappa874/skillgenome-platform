import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r"c:\Users\Ayyappa\Desktop\skill - Copy\skillgenome\screens\MentorDashboardScreen.js"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'activeTab === "cohort"' in line:
        print(f"{i+1}: {line.strip()}")
