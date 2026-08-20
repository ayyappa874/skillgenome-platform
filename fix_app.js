const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', 'utf8');

const targetIndex = content.indexOf('          <Screen11');
const endTargetIndex = content.indexOf('        {currentScreen === 14 && (');

const perfectBlock = `          <Screen11
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
              setCommunityTab('explore');
              setCurrentScreen(23);
            }}
            onOpenConnections={() => setCurrentScreen(30)}
            onOpenSessions={() => setCurrentScreen(55)}
            onOpenMentors={() => setCurrentScreen(31)}
            onOpenStudyGroup={() => {
              fetchCommunityPosts();
              fetchSuggestedConnections();
              setCommunityTab('study');
              setCurrentScreen(23);
            }}
            onOpenInterviewPrep={(j) => { setSelectedJob(j); setCurrentScreen(37); }}
            onOpenProfile={() => setCurrentScreen(41)}
            onOpenExplore={() => setCurrentScreen(44)}
            onOpenAIChat={() => setCurrentScreen(48)}
            onOpenDailyQuiz={() => setCurrentScreen(45)}
            onOpenDailyLearning={() => setCurrentScreen(46)}
            topCompanies={topCompanies}
            onOpenJobMatches={() => setCurrentScreen(34)}
            profile={profile}
            resumeAnalysis={resumeAnalysis}
            githubAnalysis={githubAnalysis}
            thoughtAnalysis={thoughtAnalysis}
            emotionAnalysis={emotionAnalysis}
            journalEntries={journalEntries}
            recordingDuration={recordingDuration}
            searchAll={searchAll}
            onNavigateToScreen={navigateTo}
            isDarkMode={darkMode} language={language}
          />
        )}
        {currentScreen === 11 && (
          <TimelineScreen
            onBack={() => setCurrentScreen(10)}
            onNavigateHome={() => setCurrentScreen(10)}
            onOpenAlerts={() => setCurrentScreen(51)}
            profile={profile}
            resumeAnalysis={resumeAnalysis}
            githubAnalysis={githubAnalysis}
            thoughtAnalysis={thoughtAnalysis}
            emotionAnalysis={emotionAnalysis}
            journalEntries={journalEntries}
            appliedJobs={appliedJobs}
            liveJobs={liveJobs}
          />
        )}
        {currentScreen === 12 && (
          <Component_uipro
            onNavigateHome={() => setCurrentScreen(10)}
            isDarkMode={darkMode} language={language}
          />
        )}
        {currentScreen === 13 && (
          <SettingsScreen_uipro
            onBack={() => setCurrentScreen(10)}
            onOpenHelp={() => setCurrentScreen(14)}
            onOpenPortfolio={() => { setPortfolioReturnTo(13); setCurrentScreen(39); }}
            onOpenEditProfile={() => setCurrentScreen(40)}
            onOpenChangePassword={() => setCurrentScreen(42)}
            onOpenLinkedAccounts={() => setCurrentScreen(43)}
            onExportData={handleExportData}
            onClearCache={handleClearCache}
            onDeleteAccount={handleDeleteAccount}
            onLogout={handleLogout}
            onOpenDeviceSetup={() => { setDeviceSetupReturnTo(13); setCurrentScreen(9); }}
            isDarkMode={darkMode} language={language}
            onToggleDarkMode={handleToggleDarkMode}
            onLanguageChange={handleLanguageChange}
          />
        )}
`;

content = content.substring(0, targetIndex) + perfectBlock + content.substring(endTargetIndex);
fs.writeFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', content);
