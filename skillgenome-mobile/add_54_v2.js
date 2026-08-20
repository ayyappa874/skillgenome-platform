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

const targetAnchor = `        {currentScreen === 5 && (`;

if (content.includes(targetAnchor)) {
  const index = content.indexOf(targetAnchor);
  content = content.slice(0, index) + screen54Code + '\n' + content.slice(index);
  fs.writeFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', content);
  console.log('Successfully added Screen54 back');
} else {
  console.log('Target Anchor not found');
}
