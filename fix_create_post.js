const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', 'utf8');

const targetStr = 'onOpenJobMatches={() => setCurrentScreen(34)}';
const replacementStr = `onOpenJobMatches={() => setCurrentScreen(34)}
            onOpenCreatePost={() => setCurrentScreen(28)}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', content);
  console.log('Injected onOpenCreatePost prop!');
} else {
  console.log('Could not find target string!');
}
