f = open(r'c:\Users\ASUS\OneDrive\Desktop\skill genome\skillgenome\App.js', 'r', encoding='utf-8')
content = f.read()
f.close()

old = '            isDarkMode={darkMode}\n            language={language}\n          />\n        )}\n        {currentScreen === 30'
new = '            isDarkMode={darkMode}\n            language={language}\n            currentUser={profile.name || "You"}\n          />\n        )}\n        {currentScreen === 30'

if old in content:
    content = content.replace(old, new, 1)
    f = open(r'c:\Users\ASUS\OneDrive\Desktop\skill genome\skillgenome\App.js', 'w', encoding='utf-8')
    f.write(content)
    f.close()
    print('Done - currentUser prop added to Screen29')
else:
    print('Pattern NOT FOUND')
