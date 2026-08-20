const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', 'utf8');

if (!content.includes('import MentorNotificationsScreen')) {
  content = content.replace(
    'import AdminNotificationsScreen from "./screens/AdminNotificationsScreen";',
    'import AdminNotificationsScreen from "./screens/AdminNotificationsScreen";\nimport MentorNotificationsScreen from "./screens/MentorNotificationsScreen";'
  );
}

const routeCode = `        {currentScreen === 102 && (
          <MentorNotificationsScreen
            profile={profile}
            onBack={() => setCurrentScreen(10)}
            isDarkMode={darkMode}
          />
        )}
`;

if (!content.includes('currentScreen === 102')) {
  const targetAnchor = `        {currentScreen === 10 && profile?.role === 'admin' ? (`;
  content = content.replace(targetAnchor, routeCode + targetAnchor);
}

// Ensure the onOpenMentorNotifications prop is wired in App.js for MentorDashboardScreen
if (content.includes('onOpenSettings={() => setCurrentScreen(13)}\n            onOpenProfile={() => setCurrentScreen(41)}\n          />')) {
  content = content.replace(
    'onOpenSettings={() => setCurrentScreen(13)}\n            onOpenProfile={() => setCurrentScreen(41)}\n          />',
    'onOpenSettings={() => setCurrentScreen(13)}\n            onOpenProfile={() => setCurrentScreen(41)}\n            onOpenMentorNotifications={() => setCurrentScreen(102)}\n          />'
  );
} else {
    // try a more generic replace for MentorDashboardScreen
    content = content.replace(
        '<MentorDashboardScreen\n            profile={profile}\n            onUpdateProfile={setProfile}\n            onLogout={handleLogout}\n            onOpenSettings={() => setCurrentScreen(13)}\n            onOpenProfile={() => setCurrentScreen(41)}',
        '<MentorDashboardScreen\n            profile={profile}\n            onUpdateProfile={setProfile}\n            onLogout={handleLogout}\n            onOpenSettings={() => setCurrentScreen(13)}\n            onOpenProfile={() => setCurrentScreen(41)}\n            onOpenMentorNotifications={() => setCurrentScreen(102)}'
    );
}

fs.writeFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', content);
console.log('App.js updated successfully with Screen 102');
