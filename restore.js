const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', 'utf8');

const deletedCode = `            onOpenGroupsDiscovery={() => setCurrentScreen(53)}
            onConnectionsUpdated={() => {
              fetchSuggestedConnections();
              fetchCommunityPosts();
            }}
            isDarkMode={darkMode} language={language}
          />
        )}
        {currentScreen === 28 && (
          <Screen28
            onBack={() => setCurrentScreen(23)}
            onPost={(postData) => {
              handleSaveCommunityPost(postData);
            }}
            isDarkMode={darkMode} language={language}
          />`;

const targetIndex = content.indexOf('onOpenNotifications={() => { setNotificationsReturnToScreen(23); setCurrentScreen(51); }}');
if (targetIndex !== -1) {
  const lineEnd = content.indexOf('\n', targetIndex);
  content = content.substring(0, lineEnd + 1) + deletedCode + content.substring(lineEnd + 1);
  fs.writeFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', content);
  console.log('Restored the missing lines!');
}
