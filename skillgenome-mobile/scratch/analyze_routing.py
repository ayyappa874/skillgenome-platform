import re
import json

app_js_path = r'c:\Users\ASUS\OneDrive\Desktop\skill genome\skillgenome-mobile\App.js'

with open(app_js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Map indices to components
screen_map = {}
matches = re.finditer(r'currentScreen === (\d+)[^<]+<\s*([A-Za-z0-9_]+)', content)
for m in matches:
    idx = int(m.group(1))
    comp = m.group(2)
    if comp not in ['View', 'ScrollView', 'SafeAreaView', 'Text']:
        screen_map.setdefault(idx, []).append(comp)

# Find component usages and their props containing setCurrentScreen
# We want to match: <ComponentName ... prop={() => setCurrentScreen(X)} ... />
# Since components span multiple lines, we can use a regex to capture <ComponentName ... />

components_used = re.findall(r'<([A-Z][A-Za-z0-9_]+)([^>]+)>', content)
routing = {}
for comp, props_str in components_used:
    # Find all props like onBack={() => setCurrentScreen(3)} or onOpenSettings={() => setCurrentScreen(13)}
    # or handleSignInSubmit -> we need to map those too
    
    props_matches = re.findall(r'(\w+)=\{([^}]+setCurrentScreen\([^}]+\)\s*\}?)', props_str)
    for prop_name, prop_val in props_matches:
        # Extract the destination screen index
        dest_match = re.search(r'setCurrentScreen\(\s*([0-9a-zA-Z_]+)\s*\)', prop_val)
        if dest_match:
            dest = dest_match.group(1)
            routing.setdefault(comp, []).append({'prop': prop_name, 'destination': dest})

    # Find handler functions mapped to props, e.g. onSignIn={handleSignInFromWelcome}
    handler_matches = re.findall(r'(\w+)=\{([a-zA-Z0-9_]+)\}', props_str)
    for prop_name, handler_name in handler_matches:
        # Find the handler definition and its setCurrentScreen
        handler_def = re.search(r'const\s+' + handler_name + r'\s*=\s*(async\s*)?\([^)]*\)\s*=>\s*\{([^}]*)setCurrentScreen\(\s*([0-9a-zA-Z_]+)\s*\)', content)
        if handler_def:
            dest = handler_def.group(3)
            routing.setdefault(comp, []).append({'prop': prop_name, 'handler': handler_name, 'destination': dest})

print(json.dumps(routing, indent=2))
