const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', 'utf8');

const targetStr = '<CommunityFeed';
const targetStrIndex = content.indexOf(targetStr);

if (targetStrIndex !== -1) {
  const insertStr = `
            onOpenMessages={() => setCurrentScreen(32)}
            onOpenJobMatches={() => setCurrentScreen(34)}
            onOpenStudyGroup={() => setCurrentScreen(54)}
            onOpenConnections={() => setCurrentScreen(30)}`;
  
  const insertIndex = targetStrIndex + targetStr.length;
  content = content.substring(0, insertIndex) + insertStr + content.substring(insertIndex);
  fs.writeFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', content);
  console.log('Injected missing props!');
}
