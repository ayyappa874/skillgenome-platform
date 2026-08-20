const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add onOpenSessions to Screen11
const screen11Hook = `onOpenMentors={() => setCurrentScreen(31)}`;
const screen11Replacement = `onOpenSessions={() => setCurrentScreen(55)}\n              onOpenMentors={() => setCurrentScreen(31)}`;
if (content.includes(screen11Hook) && !content.includes('onOpenSessions={() => setCurrentScreen(55)}')) {
  content = content.replace(screen11Hook, screen11Replacement);
  console.log("Added onOpenSessions to Screen11");
} else {
  console.log("onOpenSessions already present or hook not found");
}

// 2. Add StudentSessionsScreen render block
const renderHook = `{currentScreen === 31 && (`;
const renderReplacement = `{currentScreen === 55 && (
          <StudentSessionsScreen
            onBack={() => setCurrentScreen(10)}
            profile={profile}
            isDarkMode={darkMode} 
            language={language}
          />
        )}
        {currentScreen === 31 && (`;

if (content.includes(renderHook) && !content.includes('<StudentSessionsScreen')) {
  content = content.replace(renderHook, renderReplacement);
  console.log("Added StudentSessionsScreen render block");
} else {
  console.log("StudentSessionsScreen render block already present or hook not found");
}

fs.writeFileSync(path, content, 'utf8');
console.log("Done updating App.js");
