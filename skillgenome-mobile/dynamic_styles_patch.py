import re
import os

file_path = r"C:\Users\ASUS\OneDrive\Desktop\skill genome\skillgenome-mobile\screens\Screen11Native.js"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace const styles = StyleSheet.create({ with const getDynamicStyles = (C) => StyleSheet.create({
content = content.replace("const styles = StyleSheet.create({", "const getDynamicStyles = (C) => StyleSheet.create({")

# 2. Inside the StyleSheet, replace hardcoded dark colors with C.text / C.muted
content = content.replace('color: "#fafafa"', 'color: C.text')
content = content.replace("color: '#fafafa'", 'color: C.text')
content = content.replace('color: "#a1a1aa"', 'color: C.muted')
content = content.replace("color: '#a1a1aa'", 'color: C.muted')
content = content.replace('backgroundColor: "rgba(255,255,255,0.05)"', 'backgroundColor: C.surface')
content = content.replace('backgroundColor: "rgba(255,255,255,0.08)"', 'backgroundColor: C.surface2')
content = content.replace('borderColor: "rgba(255,255,255,0.1)"', 'borderColor: C.border')

# 3. Inside the component, find const C = getColors(isDarkMode); and inject const styles = getDynamicStyles(C);
# The component is const Screen11Native = ...
content = re.sub(
    r'(const C = getColors\(isDarkMode\);)',
    r'\1\n  const styles = React.useMemo(() => getDynamicStyles(C), [isDarkMode]);',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Dynamic styles applied to Screen11Native.js")
