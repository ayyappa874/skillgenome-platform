import re
import json

app_js_path = r'c:\Users\ASUS\OneDrive\Desktop\skill genome\skillgenome-mobile\App.js'

with open(app_js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# First, find all handler functions and what screen they route to
handler_to_screen = {}
for line in content.split('\n'):
    if 'setCurrentScreen(' in line:
        m = re.search(r'setCurrentScreen\(\s*([a-zA-Z0-9_]+)\s*\)', line)
        if m:
            dest = m.group(1)
            # Find the enclosing function by looking backwards (simplified heuristic)
            # Or just rely on the previous script's handler matching
            
# A better way: just search for JSX tags and their props
jsx_tags = re.findall(r'<([A-Z][A-Za-z0-9_]+)\s+([^>]+)/>', content, re.DOTALL)
if not jsx_tags:
    jsx_tags = re.findall(r'<([A-Z][A-Za-z0-9_]+)([^>]*)>', content, re.DOTALL)

results = {}
for tag, props in jsx_tags:
    # Find all inline setCurrentScreen calls in props
    inline_matches = re.findall(r'(\w+)=\{[^}]*setCurrentScreen\(\s*([0-9]+)\s*\)[^}]*\}', props)
    for prop_name, dest in inline_matches:
        results.setdefault(tag, []).append({ 'prop': prop_name, 'action': f'setCurrentScreen({dest})' })

    # Find handler references
    handler_refs = re.findall(r'(\w+)=\{([a-zA-Z0-9_]+)\}', props)
    for prop_name, handler in handler_refs:
        # Avoid booleans and variables
        if handler in ['darkMode', 'language', 'profile', 'true', 'false']:
            continue
        results.setdefault(tag, []).append({ 'prop': prop_name, 'action': f'Calls {handler}' })

print(json.dumps(results, indent=2))
