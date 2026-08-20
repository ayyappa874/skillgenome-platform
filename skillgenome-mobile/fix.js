const fs = require('fs');
let lines = fs.readFileSync('App.js', 'utf8').split('\n');
const startIdx = lines.findIndex(l => l.includes('{currentScreen === 6 && ('));
const endIdx = lines.findIndex(l => l.includes('onOpenConnections={() => setCurrentScreen(30)}'));

if (startIdx !== -1 && endIdx !== -1) {
  const goodBlock = `        {currentScreen === 6 && (
          <Screen7
            onNext={handleOnboardingComplete}
            isDarkMode={darkMode} language={language}
          />
        )}
        {currentScreen === 7 && (
          <Screen8
            onNext={handleGenomeScoreComplete}
            isDarkMode={darkMode} language={language}
          />
        )}
        {currentScreen === 8 && (
          <Screen9
            onNext={handleSimulateFuturesComplete}
            isDarkMode={darkMode} language={language}
          />
        )}
        {currentScreen === 9 && (
          <Screen10
            onNext={() => setCurrentScreen(deviceSetupReturnTo || 10)}
            onBack={() => setCurrentScreen(deviceSetupReturnTo || 10)}
            isDarkMode={darkMode} language={language}
          />
        )}
        {currentScreen === 10 && profile?.role === 'mentor' ? (
          <MentorDashboardScreen
            profile={profile}
            onLogout={handleLogout}
            onOpenSettings={() => setCurrentScreen(13)}
            onOpenProfile={() => setCurrentScreen(41)}
            onOpenChat={handleOpenMentorshipChat}
            onOpenUserProfile={(userId) => {
              setSelectedUserId(userId);
              setCurrentScreen(52);
            }}
            isDarkMode={darkMode} language={language}
          />
        ) : currentScreen === 10 && (
          <Screen11
            isRefreshing={isRefreshing}
            onRefresh={() => syncUserData(profile?.id)}
            onOpenTimeline={() => setCurrentScreen(11)}
            onOpenSettings={() => setCurrentScreen(13)}
            onOpenUploadResume={() => setCurrentScreen(15)}
            onOpenGitHubConnect={() => setCurrentScreen(17)}
            onOpenEmotionPrint={() => setCurrentScreen(61)}
            onOpenThoughtPrint={() => setCurrentScreen(20)}
            onOpenThoughtPrintResults={() => setCurrentScreen(21)}
            onOpenEmotionPrintResults={() => setCurrentScreen(62)}
            onOpenCommunity={() => {
              fetchCommunityPosts();
              fetchSuggestedConnections();
              setCommunityTab("explore");
              setCurrentScreen(23);
            }}`;

  lines.splice(startIdx, endIdx - startIdx, goodBlock);
  fs.writeFileSync('App.js', lines.join('\n'));
  console.log('Fixed App.js!');
} else {
  console.log('Could not find indices', startIdx, endIdx);
}
