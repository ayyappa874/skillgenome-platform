import re

file_path = r"C:\Users\ASUS\OneDrive\Desktop\skill genome\skillgenome-mobile\screens\Screen11Native.js"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace const NavContent = ({ ... }) => (
# with const NavContent = ({ ... }) => {\n  const styles = getDynamicStyles(C);\n  return (
content = re.sub(
    r'(const NavContent = \(\{\s*activeNav,\s*navHandlers,\s*C\s*\}\)\s*=>\s*)\(',
    r'\1{\n  const styles = getDynamicStyles(C);\n  return (',
    content
)

# And we need to close the parenthesis at the end of NavContent.
# In Screen11Native.js, NavContent ends with:
#     ))}
#   </View>
# );
# We need to change that ); to );\n};
content = content.replace(
    "  </View>\n);",
    "  </View>\n  );\n};"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed NavContent")
