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

fallback_t = "\n\nconst T = { text: '#111827', muted: '#64748b' };\n"

for filename in files:
    filepath = os.path.join(dir_path, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Inject after the last import statement
    # Find the end of the last import
    last_import = -1
    for match in re.finditer(r'^import .*?;?', content, re.MULTILINE):
        last_import = match.end()
        
    if last_import != -1:
        new_content = content[:last_import] + fallback_t + content[last_import:]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Injected T into {filename}")
