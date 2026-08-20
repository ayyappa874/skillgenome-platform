const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', 'utf8');

const targetIndex = content.indexOf('          <CommunityFeed');
const endTargetIndex = content.indexOf('        {currentScreen === 24 && (');

const perfectBlock = `          <CommunityFeed
            onBack={() => setCurrentScreen(10)}
            profile={profile}
            initialTab={communityTab}
            posts={communityPosts}
            suggestedConnections={suggestedConnections}
            userConnections={connections}
            userGroups={studyGroups}
            groupMessages={studyGroupMessages}
            onCreatePost={handleCreatePost}
            onLikePost={handleLikePost}
            onCommentPost={handleAddComment}
            onLoadComments={fetchPostComments}
            onDeleteComment={handleDeleteComment}
            onOpenUserProfile={(userId) => {
              setSelectedUserId(userId);
              setCurrentScreen(52);
            }}
            onOpenNotifications={() => { setNotificationsReturnToScreen(23); setCurrentScreen(51); }}
            onOpenGroupsDiscovery={() => setCurrentScreen(53)}
            onConnectionsUpdated={() => {
              fetchSuggestedConnections();
              fetchCommunityPosts();
            }}
            isDarkMode={darkMode} language={language}
          />
        )}
`;

content = content.substring(0, targetIndex) + perfectBlock + content.substring(endTargetIndex);
fs.writeFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', content);
console.log('Restored CommunityFeed block.');
