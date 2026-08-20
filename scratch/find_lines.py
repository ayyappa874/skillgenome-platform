import re
import sys

# Reconfigure stdout to use utf-8 to prevent encoding errors
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

filepath = "c:/Users/ASUS/Desktop/skill - Copy/skillgenome/screens/Screen11.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Find all <Text> ... </Text> blocks
text_blocks = re.findall(r"<Text[^>]*>([^<]+)</Text>", content)
print("Text elements in Screen11.js:")
for t in text_blocks:
    t_clean = t.strip()
    if t_clean and not (t_clean.startswith("{") and t_clean.endswith("}")):
        print(f"  - '{t_clean}'")
