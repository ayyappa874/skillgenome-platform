const fs = require('fs');
let code = fs.readFileSync('skillgenome/screens/DailyLearningTopicsScreen.js', 'utf8');

// 1. Destructure props and initialize styles
code = code.replace(
  /const DailyLearningTopicsScreen = \(\{ onBack \}\) => \{/g,
  'const DailyLearningTopicsScreen = ({ onBack, isDarkMode = true, language = \'English\' }) => {\n  const styles = React.useMemo(() => getStyles(isDarkMode), [isDarkMode]);'
);

// 2. Transform StyleSheet.create to getStyles function
code = code.replace(
  /const styles = StyleSheet.create\(\{/,
  'const getStyles = (isDarkMode) => {\n  const bgStyle = isDarkMode ? Color.colorBlue8 || \"#0d0d1a\" : \"#f8fafc\";\n  const cardBg = isDarkMode ? Color.colorBlue11 || \"#1a1f30\" : \"#ffffff\";\n  const textPrimary = isDarkMode ? Color.colorWhiteSolid || \"#ffffff\" : \"#0f172a\";\n  const textSecondary = isDarkMode ? Color.colorGrey97 || \"#ffffff\" : \"#334155\";\n  const textMute = isDarkMode ? Color.colorBlue42 || \"#64748b\" : \"#64748b\";\n  const borderStyle = isDarkMode ? Color.colorWhite7 || \"rgba(255, 255, 255, 0.07)\" : \"#cbd5e1\";\n  return StyleSheet.create({'
);

// 3. Replace hardcoded colors with variables
code = code.replace(/backgroundColor: Color\.colorBlue8/g, 'backgroundColor: bgStyle');
code = code.replace(/backgroundColor: Color\.colorBlue11/g, 'backgroundColor: cardBg');
code = code.replace(/color: Color\.colorWhiteSolid/g, 'color: textPrimary');
code = code.replace(/color: Color\.colorGrey97/g, 'color: textSecondary');
code = code.replace(/color: Color\.colorBlue42/g, 'color: textMute');
code = code.replace(/borderColor: Color\.colorWhite7/g, 'borderColor: borderStyle');
code = code.replace(/color: \"rgba\\(255, 255, 255, 0\.6\\)\"/g, 'color: textMute');
code = code.replace(/backgroundColor: \"#00d4ff\"/g, 'backgroundColor: Color.colorCyan50');

// 4. Close the getStyles function at the end
code = code.replace(/}\);\n\nexport default DailyLearningTopicsScreen;/g, '});\n};\n\nexport default DailyLearningTopicsScreen;');
code = code.replace(/}\);\s+export default DailyLearningTopicsScreen;/g, '});\n};\n\nexport default DailyLearningTopicsScreen;');
code = code.replace(/}\);$/, '});\n};'); // If it is at EOF
code = code.replace(/}\);\n$/, '});\n};\n'); // If it is at EOF with newline

fs.writeFileSync('skillgenome/screens/DailyLearningTopicsScreen.js', code);
fs.writeFileSync('../skill - Copy/skillgenome/screens/DailyLearningTopicsScreen.js', code);
console.log('Patch complete for DailyLearningTopicsScreen.');
