import os
import glob
import re

dir_path = r"C:\Users\ASUS\OneDrive\Desktop\skill genome\skillgenome-mobile\screens"
files = [
    "ChangePasswordScreen.js", "CommunityFeed.js", "Divs28.js", "Divs29.js", 
    "HelpSupportScreen_uipro.js", "LinkedAccountsScreen.js", "PortfolioScreen.js", 
    "ProfileEditScreen.js", "Screen10.js", "SCREEN26THOUGHTPRINTINPUT.js", 
    "Screen3.js", "Screen5.js", "Screen6.js", "Screen7.js", "Screen8.js", 
    "Screen9.js", "SettingsScreen_uipro.js", "WelcomeScreen.js"
]

fallback_t = "const T = { text: '#111827', muted: '#64748b' };\n"

for filename in files:
    filepath = os.path.join(dir_path, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Remove the improperly injected T
    content = re.sub(r'const T = \{ text: \'#111827\', muted: \'#64748b\' \};\s*', '', content)
    
    # 2. Inject it right before StyleSheet.create
    # Find StyleSheet.create
    if 'StyleSheet.create' in content:
        content = re.sub(
            r'(const\s+[A-Za-z0-9_]+\s*=\s*StyleSheet\.create)', 
            fallback_t + r'\1', 
            content
        )
    else:
        # If no StyleSheet.create, just append to bottom
        content += "\n" + fallback_t

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed {filename}")
