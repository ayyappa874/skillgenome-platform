import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

screens_dir = r"c:\Users\Ayyappa\Desktop\skill - Copy\skillgenome\screens"
files = [f for f in os.listdir(screens_dir) if f.endswith(".js")]

print(f"Auditing {len(files)} files in screens directory...")

for fname in files:
    fpath = os.path.join(screens_dir, fname)
    with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    
    # Parse StyleSheet.create
    styles_match = re.search(r"const\s+styles\s*=\s*StyleSheet\.create\(\{(.*)\}\);", content, re.DOTALL)
    colored_classes = set()
    all_classes = set()
    if styles_match:
        styles_content = styles_match.group(1)
        blocks = re.findall(r"(\w+)\s*:\s*\{([^}]+)\}", styles_content)
        for name, body in blocks:
            all_classes.add(name)
            if "color" in body.lower():
                colored_classes.add(name)
                
    # Now find all Text tags in JSX
    text_tags = re.findall(r"<Text\s+([^>]*?)>(.*?)</Text>", content, re.DOTALL)
    bad_texts = []
    
    for idx, (attrs, body) in enumerate(text_tags, 1):
        attrs_clean = attrs.strip().replace("\n", " ")
        body_clean = body.strip().replace("\n", " ")[:60]
        
        has_style = "style=" in attrs_clean
        has_explicit_color = False
        
        if has_style:
            if "color:" in attrs_clean:
                has_explicit_color = True
            else:
                classes = re.findall(r"styles\.(\w+)", attrs_clean)
                for c in classes:
                    if c in colored_classes:
                        has_explicit_color = True
                        break
        else:
            # Check if this Text purely nests other tags (like <Text><Text style={...}>...</Text></Text>)
            # In that case it is safe as long as all leaf nodes are colored.
            # But let's report it if there is direct raw text inside it.
            pass
            
        if not has_explicit_color:
            # Ignore if there is no literal text (e.g. only tags)
            raw_text = re.sub(r"<[^>]+>", "", body).strip()
            if raw_text and not raw_text.startswith("{") and not raw_text.endswith("}"):
                bad_texts.append((idx, attrs_clean, body_clean))
                
    if bad_texts:
        print(f"\n{fname}: {len(bad_texts)} texts missing explicit color:")
        for idx, attrs, body in bad_texts[:5]:
            print(f"  - Text #{idx} [attrs: {attrs}]: \"{body}\"")
