import os
import glob
import re

dir_path = r"C:\Users\ASUS\OneDrive\Desktop\skill genome\skillgenome-mobile\screens"
files = glob.glob(os.path.join(dir_path, "*.js"))

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # 1. Standardize Header Container (forces gap: 16, and iOS 64:52 padding)
    content = re.sub(
        r'header:\s*\{\s*flexDirection:\s*"row",\s*alignItems:\s*"center",(.*?)(?:paddingTop:[^\}]+)\}',
        r'header: { flexDirection: "row", alignItems: "center", gap: 16, paddingTop: Platform.OS === "ios" ? 64 : 52, paddingHorizontal: 20, paddingBottom: 16 }',
        content,
        flags=re.DOTALL
    )

    # 2. Standardize Back Button
    content = re.sub(
        r'(backBtn|iconBtn):\s*\{[^}]*?alignItems:\s*"center"[^}]*?\}',
        r'\1: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }',
        content
    )
    
    content = re.sub(
        r'(backIcon|iconBtnText):\s*\{[^}]*?\}',
        r'\1: { fontSize: 18, color: T.text, fontWeight: "600" }',
        content
    )

    # 3. Standardize Title and Subtitle
    content = re.sub(
        r'pageTitle:\s*\{[^}]*?\}',
        r'pageTitle: { fontSize: 22, fontWeight: "800", color: T.text, letterSpacing: -0.4 }',
        content
    )
    
    content = re.sub(
        r'pageSub:\s*\{[^}]*?\}',
        r'pageSub: { fontSize: 12, color: T.muted, marginTop: 2 }',
        content
    )

    if content != original:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Patched " + os.path.basename(file))
