import re

filepath = "c:/Users/ASUS/Desktop/skill - Copy/skillgenome/screens/MentorDashboardScreen.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update signature
old_sig = "const MentorDashboardScreen = ({ profile, onLogout, onOpenSettings, onOpenProfile, onOpenChat }) => {"
new_sig = "const MentorDashboardScreen = ({ profile, onLogout, onOpenSettings, onOpenProfile, onOpenChat, isDarkMode = true, language = 'English' }) => {\n  const styles = React.useMemo(() => getStyles(isDarkMode), [isDarkMode]);"

if old_sig in content:
    content = content.replace(old_sig, new_sig)
    print("Signature updated successfully.")
else:
    print("WARNING: Signature old pattern not found.")

# 2. Extract and rewrite styles block
styles_start_pattern = "const styles = StyleSheet.create({"
styles_start_idx = content.find(styles_start_pattern)

if styles_start_idx != -1:
    print(f"Found styles stylesheet start at index {styles_start_idx}.")
    
    # We will split the content at styles_start_idx
    before_styles = content[:styles_start_idx]
    styles_content = content[styles_start_idx:]
    
    # Replace the stylesheet creation declaration
    styles_content = styles_content.replace(styles_start_pattern, """const getStyles = (isDarkMode) => {
  const themedColor = {
    ...Color,
    colorBlue8: isDarkMode ? (Color.colorBlue8 || '#0d0d1a') : '#f8fafc',
    colorAzure11: isDarkMode ? (Color.colorAzure11 || '#161a22') : '#ffffff',
    colorBlue19: isDarkMode ? (Color.colorBlue19 || '#232840') : '#e2e8f0',
    colorWhiteSolid: isDarkMode ? '#ffffff' : '#0f172a',
    colorAzure65: isDarkMode ? '#94a3b8' : '#475569',
    appPrimaryBackground: isDarkMode ? '#060612' : '#f8fafc',
  };

  const textColor = isDarkMode ? "#ffffff" : "#0f172a";
  const secTextColor = isDarkMode ? "#9AA0B2" : "#475569";
  const muteTextColor = isDarkMode ? "#5a5a7a" : "#64748b";
  const containerBg = isDarkMode ? "#060612" : "#f8fafc";
  const cardBg = isDarkMode ? "rgba(255, 255, 255, 0.01)" : "#ffffff";
  const borderLight = isDarkMode ? "rgba(255, 255, 255, 0.06)" : "#cbd5e1";
  const borderMedium = isDarkMode ? "rgba(255, 255, 255, 0.08)" : "#cbd5e1";
  const inputBg = isDarkMode ? "rgba(255, 255, 255, 0.02)" : "#f1f5f9";

  return StyleSheet.create({""", 1)
    
    # Do replacements inside stylesheet content
    replacements = [
        ("Color.colorWhiteSolid", "themedColor.colorWhiteSolid"),
        ("Color.colorAzure65", "themedColor.colorAzure65"),
        ("Color.colorBlue8", "themedColor.colorBlue8"),
        ("Color.colorAzure11", "themedColor.colorAzure11"),
        ("Color.colorBlue19", "themedColor.colorBlue19"),
        ("Color.appPrimaryBackground", "themedColor.appPrimaryBackground"),
        ('color: "#ffffff"', 'color: textColor'),
        ('color: "#fff"', 'color: textColor'),
        ('color: "#9AA0B2"', 'color: secTextColor'),
        ('color: "#5a5a7a"', 'color: muteTextColor'),
        ('backgroundColor: "#060612"', 'backgroundColor: containerBg'),
        ('backgroundColor: "rgba(255, 255, 255, 0.01)"', 'backgroundColor: cardBg'),
        ('backgroundColor: "rgba(255, 255, 255, 0.02)"', 'backgroundColor: inputBg'),
        ('backgroundColor: "rgba(255, 255, 255, 0.03)"', 'backgroundColor: inputBg'),
        ('borderColor: "rgba(255, 255, 255, 0.06)"', 'borderColor: borderLight'),
        ('borderColor: "rgba(255, 255, 255, 0.08)"', 'borderColor: borderMedium'),
        ('backgroundColor: "rgba(6, 6, 18, 0.96)"', 'backgroundColor: isDarkMode ? "rgba(6, 6, 18, 0.96)" : "rgba(248, 250, 252, 0.96)"'),
        ('backgroundColor: "rgba(3, 3, 8, 0.8)"', 'backgroundColor: isDarkMode ? "rgba(3, 3, 8, 0.8)" : "rgba(15, 23, 42, 0.4)"')
    ]
    
    for old_val, new_val in replacements:
        styles_content = styles_content.replace(old_val, new_val)
    
    # We must close the getStyles function at the end, right before the export statement
    export_pattern = "export default MentorDashboardScreen;"
    export_idx = styles_content.find(export_pattern)
    if export_idx != -1:
        styles_content = styles_content[:export_idx] + "};\n\n" + styles_content[export_idx:]
        print("Styles closed and export signature corrected.")
    else:
        print("WARNING: export default statement not found at end of styles.")
        
    # Reassemble the file
    content = before_styles + styles_content
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("MentorDashboardScreen.js transformed successfully!")
else:
    print("WARNING: StyleSheet.create pattern not found in file.")
