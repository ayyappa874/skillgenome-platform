const fs = require('fs');
let c = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', 'utf8');

const targetToRemove = `        setCurrentScreen((prevScreen) => {
          if (prevScreen === 0 || prevScreen === 1 || prevScreen === 2 || prevScreen === 3) {
            return 10; // Navigate straight to Home Dashboard
          }
          return prevScreen;
        });

        if (event === 'SIGNED_IN') {
          syncUserData(user.id);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Reset profile data to initial values
      setProfile(initialProfile);
      setResumeAnalysis(null);
      setGithubUsername('');
      setJournalEntries([]);
      setJournalData({ text: '', mood: null });
      setStudyGroupMessages([]);
      setConversations([]);
      setPosts([]);

      // Clear remaining state to prevent cross-account pollution
      setLiveJobs([]);
      setAppliedJobs([]);
      setPortfolioProjects([]);
      setEmotionAnalysis(null);
      setThoughtAnalysis(null);
      setGithubAnalysis(null);
      setDailyQuizResult(null);
      setRecordingDuration(0);

      Alert.alert("Logged Out", "You have been successfully logged out.");
      setCurrentScreen(3); // Redirect straight to Screen4 (Sign In)
    } catch (e) {
      console.log("Logout error:", e.message);
      Alert.alert("Logout Error", e.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const redirectTo = Platform.OS === 'web' ? window.location.origin + '/' : ExpoLinking.createURL('');
      console.log("Google OAuth: Requesting auth URL ->", redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          skipBrowserRedirect: true,
          queryParams: { prompt: 'select_account' }
        }
      });
      if (error) throw error;

      if (data?.url) {
        if (Platform.OS === 'web') {
          console.log("Web OAuth: Navigating browser tab to Google ->", data.url);
          window.location.href = data.url;
        } else {
          console.log("Mobile OAuth: Opening WebBrowser sheet ->", data.url);
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
          if (result.type === 'success' && result.url) {
            handleDeepLink(result.url);
          }
        }
      }
    } catch (e) {
      console.error("Google Sign In Error:", e.message);
      Alert.alert("Sign In Error", e.message);
    }
  };

  const handleLinkedInSignIn = async () => {
    try {
      const redirectTo = Platform.OS === 'web' ? window.location.origin + '/' : ExpoLinking.createURL('');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: { redirectTo, skipBrowserRedirect: true, queryParams: { prompt: 'consent' } }
      });
      if (error) throw error;

      if (data?.url) {
        if (Platform.OS === 'web') {
          window.location.href = data.url;
        } else {
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
          if (result.type === 'success' && result.url) handleDeepLink(result.url);
        }
      }
    } catch (e) {
      console.error("LinkedIn Sign In Error:", e.message);
      Alert.alert("Sign In Error", e.message);
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      const redirectTo = Platform.OS === 'web' ? window.location.origin + '/' : ExpoLinking.createURL('');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo, skipBrowserRedirect: true, queryParams: { prompt: 'consent' } }
      });
      if (error) throw error;

      if (data?.url) {
        if (Platform.OS === 'web') {
          window.location.href = data.url;
        } else {
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
          if (result.type === 'success' && result.url) handleDeepLink(result.url);
        }
      }
    } catch (e) {
      console.error("GitHub Sign In Error:", e.message);
      Alert.alert("Sign In Error", e.message);
    }
  };

  const triggerOAuthSimulation = (userName) => {
    const oauthProfile = {
      ...profile,
      name: userName || "Google User",
      email: \`\${(userName || "user").toLowerCase().replace(/\\s+/g, "")}@skillgenome.ai\`,
      title: "AI & Software Engineer",
      bio: "Authenticated via OAuth",
      location: "San Francisco, CA",
      experience: 4,
      skills: ["React", "JavaScript", "Python", "SkillGenome AI"],
    };
    setProfile(oauthProfile);
    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      AsyncStorage.setItem("@app_registered_user", JSON.stringify(oauthProfile));
    } catch (err) { }

    // Navigate straight to Dashboard (Screen 10 -> renders Screen 11 / MentorDashboardScreen)
    setCurrentScreen(10);
  };


  return (
    <SafeAreaView style={[isMobileWebViewport ? styles.webContainer : styles.desktopContainer, { backgroundColor: darkMode ? "#09090b" : "#f8fafc" }]}>
      <View style={[isMobileWebViewport ? styles.webScreen : styles.desktopScreen, { backgroundColor: darkMode ? "#09090b" : "#f8fafc" }]}>
        <GlobalWebStyles isDarkMode={darkMode} language={language} />
        <ThemeToggle isDarkMode={darkMode} language={language} toggle={() => setDarkMode(!darkMode)} />
        <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
        {currentScreen === 0 && <Screen1 isDarkMode={darkMode} language={language} />}
        {currentScreen === 1 && (
          <Screen2
            onGetStarted={handleGetStarted}
            onSignIn={handleSignInFromWelcome}
            isDarkMode={darkMode} language={language}
          />
        )}
        {currentScreen === 2 && (
          <Screen3
            onSignIn={handleSignInFromRegister}
            onSignUpPress={handleSignUpSubmit}
            isDarkMode={darkMode} language={language}
          />
        )}
        {currentScreen === 3 && (
          <Screen4
            onSignInPress={handleSignInSubmit}
            onForgotPasswordPress={handleForgotPassword}
            onCreateAccountPress={handleCreateAccountFromSignIn}
            onGooglePress={handleGoogleSignIn}
            onLinkedInPress={handleLinkedInSignIn}
            onGitHubPress={handleGitHubSignIn}
            isDarkMode={darkMode} language={language}
          />
        )}
        {currentScreen === 4 && (
          <Screen5
            onBack={() => setCurrentScreen(3)}
            onSendResetLink={handleResetLinkSent}
            onContinue={handleContinueToVerification}
            isDarkMode={darkMode} language={language}
          />
        )}
        {currentScreen === 5 && (
          <Screen6
            onVerify={handleEmailVerified}
            onResend={handleResendOTP}
            isDarkMode={darkMode} language={language}
          />
        )}
        {currentScreen === 54 && (
          <ErrorBoundary onBack={() => setCurrentScreen(23)}>
            <StudyGroupScreen
              onBack={() => setCurrentScreen(23)}
              connections={connections}
              onSendInvites={(selectedIds) => {
                const invited = connections.filter(c => selectedIds.includes(c.id)).map(c => c.name);
                handleSendStudyGroupMessage(\`System: Invited \${invited.join(", ")}\`, true);
              }}
              onDeleteChat={async () => {
                try {
                  const { error } = await supabase.from('study_group_messages').delete().eq('group_id', activeStudyGroupId);
                  if (error) throw error;
                  setStudyGroupMessages([]);
                } catch(e) { console.log(e); }
              }}
              onLeaveGroup={handleLeaveGroup}
              onDeleteGroup={handleDeleteGroup}
              onSendMessage={handleSendStudyGroupMessage}
              studyGroup={studyGroup}
              setStudyGroup={setStudyGroup}
              studyGroupMessages={studyGroupMessages}
              setStudyGroupMessages={setStudyGroupMessages}
              isDarkMode={darkMode} language={language}
            />
          </ErrorBoundary>
        )}`;

if (c.includes(targetToRemove)) {
  c = c.replace(targetToRemove, `            onVerify={handleEmailVerified}
            onResend={handleResendOTP}
            isDarkMode={darkMode} language={language}
          />
        )}`);
  fs.writeFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', c);
  console.log('Successfully reverted the damage.');
} else {
  console.log('Could not find exact damage chunk.');
}
