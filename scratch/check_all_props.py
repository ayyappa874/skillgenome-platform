with open("c:/Users/ASUS/Desktop/skill - Copy/skillgenome/App.js", "r", encoding="utf-8") as f:
    content = f.read()

# Let's write a simple nesting parser to find custom elements and extract their full text
import re
matches = list(re.finditer(r"<([A-Z][A-Za-z0-9_]+)\b", content))

print("Parsing custom components in App.js JSX:")
for m in matches:
    name = m.group(1)
    if name in ["View", "Text", "TextInput", "Pressable", "ScrollView", "SafeAreaView", "StatusBar", "LinearGradient"]:
        continue
    
    start_idx = m.start()
    # parse until matching closing angle bracket, keeping track of braces to not stop at =>
    brace_level = 0
    bracket_level = 0
    i = start_idx
    while i < len(content):
        c = content[i]
        if c == '{':
            brace_level += 1
        elif c == '}':
            brace_level -= 1
        elif c == '<':
            bracket_level += 1
        elif c == '>':
            bracket_level -= 1
            if bracket_level == 0 and brace_level == 0:
                # found the end of the tag
                break
        i += 1
    
    tag_content = content[start_idx:i+1]
    has_dm = "isDarkMode" in tag_content
    has_lang = "language" in tag_content
    line_num = content[:start_idx].count("\n") + 1
    
    print(f"Line {line_num}: <{name} ...> (isDarkMode: {has_dm}, language: {has_lang})")
