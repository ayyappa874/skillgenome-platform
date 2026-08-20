import os
import re

app_js_path = r'c:\Users\ASUS\OneDrive\Desktop\skill genome\skillgenome-mobile\App.js'
screens_dir = r'c:\Users\ASUS\OneDrive\Desktop\skill genome\skillgenome-mobile\screens'

with open(app_js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find imports
imports = re.findall(r'import\s+(\w+)\s+from\s+[\"'']./screens/([^\"'']+)[\"'']', content)
imported_screens = {imp[1] + '.js': imp[0] for imp in imports}

# Find screen mapping
# pattern: currentScreen === X && \s* ( <ScreenName | \( \s* <ScreenName )
screen_map = {}
matches = re.finditer(r'currentScreen === (\d+)[^<]+<\s*([A-Za-z0-9_]+)', content)
for m in matches:
    idx = int(m.group(1))
    comp = m.group(2)
    # Exclude basic RN components like View, ScrollView if they slip in, but shouldn't match this pattern ideally
    if comp not in ['View', 'ScrollView', 'SafeAreaView', 'Text']:
        if idx not in screen_map:
            screen_map[idx] = []
        if comp not in screen_map[idx]:
            screen_map[idx].append(comp)

# Some currentScreens might have ternary (like Screen11 and MentorDashboardScreen for idx 10)
# We handle this by collecting all components mapped to an index in the regex above.

# List all files in screens directory
all_files = os.listdir(screens_dir)
js_files = [f for f in all_files if f.endswith('.js')]

unused_files = [f for f in js_files if f not in imported_screens]

print('=== SCREEN MAPPING ===')
for k in sorted(screen_map.keys()):
    print(f'{k}: {", ".join(screen_map[k])}')

print('\n=== UNUSED SCREENS ===')
for f in sorted(unused_files):
    print(f)

print('\n=== IMPORTED BUT NO INDEX FOUND ===')
# flatten all mapped components
mapped_components = set()
for comps in screen_map.values():
    for c in comps:
        mapped_components.add(c)
        
for f, comp in imported_screens.items():
    if comp not in mapped_components:
        print(f'{f} ({comp})')
