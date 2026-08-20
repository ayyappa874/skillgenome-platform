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

    # Remove hardcoded colors from stylesheets
    content = re.sub(r'color:\s*(?:T|C|theme)\.(?:text|muted)\s*,?\s*', '', content)
    content = re.sub(r'backgroundColor:\s*"rgba\(255,255,255,0\.06\)"\s*,?\s*', '', content)
    content = re.sub(r'borderColor:\s*"rgba\(255,255,255,0\.1\)"\s*,?\s*', '', content)
    content = re.sub(r'color:\s*\'#(?:111827|64748b)\'\s*,?\s*', '', content)

    # 1. pageTitle
    content = re.sub(r'style=\{([A-Za-z0-9_]+\.pageTitle)\}', f'style={{[\\1, {{ color: {t_var}.text }}]}}', content)
    content = re.sub(r'style=\{\[([A-Za-z0-9_]+\.pageTitle)([^\]]*)\]\}', f'style={{[\\1\\2, {{ color: {t_var}.text }}]}}', content)
    
    # 2. pageSub
    content = re.sub(r'style=\{([A-Za-z0-9_]+\.pageSub)\}', f'style={{[\\1, {{ color: {t_var}.muted }}]}}', content)
    content = re.sub(r'style=\{\[([A-Za-z0-9_]+\.pageSub)([^\]]*)\]\}', f'style={{[\\1\\2, {{ color: {t_var}.muted }}]}}', content)
    
    # 3. backBtn / iconBtn
    content = re.sub(r'style=\{([A-Za-z0-9_]+\.(?:backBtn|iconBtn))\}', f'style={{[\\1, {{ backgroundColor: {t_var}.surface || "rgba(0,0,0,0.05)", borderColor: {t_var}.border || "rgba(0,0,0,0.1)" }}]}}', content)
    content = re.sub(r'style=\{\[([A-Za-z0-9_]+\.(?:backBtn|iconBtn))([^\]]*)\]\}', f'style={{[\\1\\2, {{ backgroundColor: {t_var}.surface || "rgba(0,0,0,0.05)", borderColor: {t_var}.border || "rgba(0,0,0,0.1)" }}]}}', content)
    
    # 4. backIcon / iconBtnText
    content = re.sub(r'style=\{([A-Za-z0-9_]+\.(?:backIcon|iconBtnText))\}', f'style={{[\\1, {{ color: {t_var}.text }}]}}', content)
    content = re.sub(r'style=\{\[([A-Za-z0-9_]+\.(?:backIcon|iconBtnText))([^\]]*)\]\}', f'style={{[\\1\\2, {{ color: {t_var}.text }}]}}', content)
    
    if content != original:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched lightmode for {os.path.basename(file)}")
