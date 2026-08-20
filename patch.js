const fs = require('fs');
let code = fs.readFileSync('skillgenome/screens/JobMatchesScreen.js', 'utf8');

// 1. Pass styles to JobCard
code = code.replace(
  /const JobCard = \(\{ job, matchPercent, matchedSkills, onPress, onApply, language = 'English' \}\) => \(/g,
  'const JobCard = ({ job, matchPercent, matchedSkills, onPress, onApply, language = \'English\', styles }) => ('
);

// 2. Add styles prop to JobCard usage
code = code.replace(
  /language=\{language\}\\s+\/>/g,
  'language={language}\n              styles={styles}\n            />'
);

// 3. Define styles with React.useMemo
code = code.replace(
  /const JobMatchesScreen = \(\{ onBack, onOpenNext, profileSkills = \[\], jobs = \[\], loadingJobs = false, onOpenJobDetail, onApply, isDarkMode = true, language = 'English' \}\) => \{/g,
  'const JobMatchesScreen = ({ onBack, onOpenNext, profileSkills = [], jobs = [], loadingJobs = false, onOpenJobDetail, onApply, isDarkMode = true, language = \'English\' }) => {\n  const styles = React.useMemo(() => getStyles(isDarkMode), [isDarkMode]);'
);

// 4. Transform StyleSheet.create to getStyles function
code = code.replace(
  /const styles = StyleSheet.create\(\{/,
  'const getStyles = (isDarkMode) => {\n  const bgStyle = isDarkMode ? Color.colorBlue8 || \"#0d0d1a\" : \"#f8fafc\";\n  const cardBg = isDarkMode ? Color.colorBlue11 || \"#1a1f30\" : \"#ffffff\";\n  const textPrimary = isDarkMode ? Color.colorWhiteSolid || \"#ffffff\" : \"#0f172a\";\n  const textSecondary = isDarkMode ? Color.colorGrey97 || \"#ffffff\" : \"#334155\";\n  const textMute = isDarkMode ? Color.colorBlue42 || \"#64748b\" : \"#64748b\";\n  const borderStyle = isDarkMode ? Color.colorWhite7 || \"rgba(255, 255, 255, 0.07)\" : \"#cbd5e1\";\n  const activeTabBg = isDarkMode ? Color.colorBlue19 || \"#232840\" : \"#e0f2fe\";\n  return StyleSheet.create({'
);

// 5. Replace colors inside StyleSheet.create with variables
code = code.replace(/backgroundColor: Color\.colorBlue8/g, 'backgroundColor: bgStyle');
code = code.replace(/backgroundColor: Color\.colorBlue11/g, 'backgroundColor: cardBg');
code = code.replace(/color: Color\.colorWhiteSolid/g, 'color: textPrimary');
code = code.replace(/color: Color\.colorGrey97/g, 'color: textSecondary');
code = code.replace(/color: Color\.colorBlue42/g, 'color: textMute');
code = code.replace(/borderColor: Color\.colorWhite7/g, 'borderColor: borderStyle');
code = code.replace(/backgroundColor: Color\.colorBlue19/g, 'backgroundColor: activeTabBg');

// 6. Close the getStyles function at the end
code = code.replace(/}\);\n\nexport default JobMatchesScreen;/g, '});\n};\n\nexport default JobMatchesScreen;');
code = code.replace(/}\);\s+export default JobMatchesScreen;/g, '});\n};\n\nexport default JobMatchesScreen;');
code = code.replace(/}\);$/, '});\n};'); // If it is at EOF
code = code.replace(/}\);\n$/, '});\n};\n'); // If it is at EOF with newline

fs.writeFileSync('skillgenome/screens/JobMatchesScreen.js', code);
console.log('Patch complete.');
