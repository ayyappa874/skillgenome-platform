import os
import glob
import re

dir_path = r"C:\Users\ASUS\OneDrive\Desktop\skill genome\skillgenome-mobile\screens"
files = glob.glob(os.path.join(dir_path, "*.js"))

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    # Remove the fallback T
    content = re.sub(r'const T = \{ text: \'#111827\', muted: \'#64748b\' \};\s*', '', content)
    
    # If a file has T.text or C.text in StyleSheet, it MUST have T or C defined globally.
    # Otherwise we replace T.text / C.text in StyleSheet with "#fafafa" (standard dark mode text) 
    # and T.muted / C.muted with "#a1a1aa" (standard dark mode muted) 
    # to perfectly restore the dark mode default for static stylesheets!
    
    if "StyleSheet.create" in content:
        parts = content.split("StyleSheet.create")
        head = parts[0]
        tail = parts[1]
        
        has_t_global = bool(re.search(r'^const T =', head, re.MULTILINE))
        has_c_global = bool(re.search(r'^const C =', head, re.MULTILINE))
        has_theme_global = bool(re.search(r'^const theme =', head, re.MULTILINE))
        
        if not has_t_global:
            tail = re.sub(r'T\.text', '"#fafafa"', tail)
            tail = re.sub(r'T\.muted', '"#a1a1aa"', tail)
            tail = re.sub(r'T\.border', '"rgba(255,255,255,0.1)"', tail)
            tail = re.sub(r'T\.surface', '"rgba(255,255,255,0.05)"', tail)
            tail = re.sub(r'T\.surface2', '"rgba(255,255,255,0.08)"', tail)
            
        if not has_c_global:
            tail = re.sub(r'C\.text', '"#fafafa"', tail)
            tail = re.sub(r'C\.muted', '"#a1a1aa"', tail)
            tail = re.sub(r'C\.border', '"rgba(255,255,255,0.1)"', tail)
            tail = re.sub(r'C\.surface', '"rgba(255,255,255,0.05)"', tail)
            tail = re.sub(r'C\.surface2', '"rgba(255,255,255,0.08)"', tail)
            
        if not has_theme_global:
            tail = re.sub(r'theme\.text', '"#fafafa"', tail)
            tail = re.sub(r'theme\.muted', '"#a1a1aa"', tail)
            tail = re.sub(r'theme\.border', '"rgba(255,255,255,0.1)"', tail)
            tail = re.sub(r'theme\.surface', '"rgba(255,255,255,0.05)"', tail)
            tail = re.sub(r'theme\.surface2', '"rgba(255,255,255,0.08)"', tail)
            
        content = head + "StyleSheet.create" + tail

    if content != original:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Removed fallback & fixed static dark mode for {os.path.basename(file)}")
