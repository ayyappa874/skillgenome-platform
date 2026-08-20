const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', 'utf8');

if (content.includes('onCreatePost={handleCreatePost}')) {
  content = content.replace('onCreatePost={handleCreatePost}', 'onCreatePost={handleSaveCommunityPost}');
  fs.writeFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', content);
  console.log('Fixed onCreatePost handler!');
} else {
  console.log('Could not find onCreatePost={handleCreatePost}!');
}
