with open("c:/Users/Ayyappa/Desktop/skill - Copy/skillgenome/App.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "createClient" in line or "supabase" in line:
        print(f"{i+1}: {line.strip()}")
