import re

path = r"c:\Users\Ayyappa\Desktop\skill - Copy\skillgenome\screens\MentorDashboardScreen.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Find all styles in StyleSheet.create
styles_match = re.search(r"StyleSheet\.create\(\{(.*)\}\);", content, re.DOTALL)
if styles_match:
    styles_block = styles_match.group(1)
    # Find all style definitions and check their colors
    style_items = re.findall(r"(\w+):\s*\{([^}]+)\}", styles_block)
    for name, properties in style_items:
        if "color:" in properties or "color " in properties:
            print(f"Style: {name}")
            for prop in properties.split(","):
                if "color" in prop:
                    print(f"  {prop.strip()}")
else:
    print("Could not find StyleSheet block")
