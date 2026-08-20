const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Import StudentSessionsScreen
const importMatch = content.includes('import StudentSessionsScreen from "./screens/StudentSessionsScreen";');
if (!importMatch) {
  content = content.replace(
    'import JobMatchesScreen from "./screens/JobMatchesScreen";',
    'import JobMatchesScreen from "./screens/JobMatchesScreen";\nimport StudentSessionsScreen from "./screens/StudentSessionsScreen";'
  );
}

// 2. Add route case for screen 35
const switchMatch = /\{\s*currentScreen === 34 && \([\s\S]*?\}\)/;
if (content.match(switchMatch)) {
  const newSwitch = `          {currentScreen === 35 && (
            <StudentSessionsScreen
              profile={profile}
              onBack={() => setCurrentScreen(10)}
              isDarkMode={darkMode} 
              language={language}
            />
          )}`;
  
  content = content.replace(switchMatch, match => match + '\n' + newSwitch);
}

// 3. Update Screen11 to accept onOpenSessions
const screen11Match = /<Screen11\s+onOpenInterviewPrep/;
const screen11New = `<Screen11\n              onOpenSessions={() => setCurrentScreen(35)}\n              onOpenInterviewPrep`;
content = content.replace(screen11Match, screen11New);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated App.js routing");
