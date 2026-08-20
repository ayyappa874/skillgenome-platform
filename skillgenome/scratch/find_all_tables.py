import re

path = r"c:\Users\Ayyappa\Desktop\skill - Copy\skillgenome\App.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Find all tables used in .from('...') or .from("...")
tables = set(re.findall(r"\.from\(['\"](\w+)['\"]\)", content))
print("Tables referenced in App.js:")
for t in sorted(tables):
    print(f" - {t}")
