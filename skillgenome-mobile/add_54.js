const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', 'utf8');

const screen54Code = `        {currentScreen === 54 && (
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

const targetAnchor = `        {currentScreen === 5 && (
          <Screen6
            onVerify={handleEmailVerified}
            onResend={handleResendOTP}
            isDarkMode={darkMode} language={language}
          />
        )}`;

if (content.includes(targetAnchor)) {
  content = content.replace(targetAnchor, targetAnchor + '\n' + screen54Code);
  fs.writeFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', content);
  console.log('Successfully added Screen54 back');
}
