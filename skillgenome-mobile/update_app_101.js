const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', 'utf8');

if (!content.includes('import AdminNotificationsScreen')) {
  content = content.replace(
    'import NotificationsScreen from "./screens/NotificationsScreen";',
    'import NotificationsScreen from "./screens/NotificationsScreen";\nimport AdminNotificationsScreen from "./screens/AdminNotificationsScreen";'
  );
}

const routeCode = `        {currentScreen === 101 && (
          <AdminNotificationsScreen
            profile={profile}
            onBack={() => setCurrentScreen(10)}
            isDarkMode={darkMode}
          />
        )}
`;

if (!content.includes('currentScreen === 101')) {
  const targetAnchor = `        {currentScreen === 10 && profile?.role === 'admin' ? (`;
  content = content.replace(targetAnchor, routeCode + targetAnchor);
}

content = content.replace(
  '<AdminDashboardScreen\n            profile={profile}\n            onBack={() => setCurrentScreen(0)}\n            isDarkMode={darkMode} language={language}\n            onOpenSettings={() => setCurrentScreen(13)}\n            onOpenEditProfile={() => setCurrentScreen(40)}\n          />',
  '<AdminDashboardScreen\n            profile={profile}\n            onBack={() => setCurrentScreen(0)}\n            isDarkMode={darkMode} language={language}\n            onOpenSettings={() => setCurrentScreen(13)}\n            onOpenEditProfile={() => setCurrentScreen(40)}\n            onOpenAdminNotifications={() => setCurrentScreen(101)}\n          />'
);

fs.writeFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', content);
console.log('App.js updated successfully');
