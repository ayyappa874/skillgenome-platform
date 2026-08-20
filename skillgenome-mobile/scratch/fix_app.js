const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js';
let content = fs.readFileSync(path, 'utf8');

const badInjection = `          {currentScreen === 35 && (
            <StudentSessionsScreen
              profile={profile}
              onBack={() => setCurrentScreen(10)}
              isDarkMode={darkMode} 
              language={language}
            />
          )}`;

// Remove the bad injection
content = content.replace(badInjection, '');

// Find the end of the scrollview or the last screen block to append it properly
// Let's just find the very last screen component before </SafeAreaView>
// In App.js, there's </SafeAreaView> at the end.
const safeAreaEnd = `      </SafeAreaView>`;
const newInjection = `        {currentScreen === 35 && (
          <StudentSessionsScreen
            profile={profile}
            onBack={() => setCurrentScreen(10)}
            isDarkMode={darkMode} 
            language={language}
          />
        )}
      </SafeAreaView>`;

content = content.replace(safeAreaEnd, newInjection);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed App.js SyntaxError");
