import os
import glob
import re

dir_path = r"C:\Users\ASUS\OneDrive\Desktop\skill genome\skillgenome-mobile\screens"
files = glob.glob(os.path.join(dir_path, "*.js"))

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    t_var = "T"
    if re.search(r'\bC\s*=\s*getTheme', content) or re.search(r'\bC\s*=\s*useTheme', content): t_var = "C"
    elif re.search(r'\btheme\s*=\s*getTheme', content) or re.search(r'\btheme\s*=\s*useTheme', content): t_var = "theme"

    # We need to restore color: T.text to common elements if they lack color
    
    def restore_color(match):
        key = match.group(1)
        body = match.group(2)
        
        # If it already has a color, leave it
        if "color:" in body:
            return match.group(0)
            
        # Determine the color to inject based on the key name
        key_lower = key.lower()
        if any(word in key_lower for word in ['title', 'name', 'text', 'value', 'icon', 'head', 'count']):
            return f"{key}: {{ {body}, color: {t_var}.text }}"
        elif any(word in key_lower for word in ['sub', 'desc', 'meta', 'role', 'label', 'eyebrow', 'note', 'time', 'date']):
            return f"{key}: {{ {body}, color: {t_var}.muted }}"
            
        return match.group(0)
        
    # We only apply this inside StyleSheet.create
    if "StyleSheet.create" in content:
        parts = content.split("StyleSheet.create")
        stylesheet_body = parts[1]
        
        # Regex to match style definitions: key: { body }
        stylesheet_body = re.sub(r'([A-Za-z0-9_]+):\s*\{\s*([^}]*?)\s*\}', restore_color, stylesheet_body)
        
        # Clean up commas like {,
        stylesheet_body = re.sub(r'\{\s*,', '{', stylesheet_body)
        
        content = parts[0] + "StyleSheet.create" + stylesheet_body

    if content != original:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Restored colors for {os.path.basename(file)}")
