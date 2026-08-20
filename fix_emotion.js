const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', 'utf8');

const lines = content.split('\n');

let startIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('setCurrentScreen(62);')) {
    // Look ahead to find the floating onBack
    for (let j = i; j < i + 10; j++) {
      if (lines[j].includes('onBack={() => setCurrentScreen(13)}')) {
        startIndex = j;
        break;
      }
    }
    if (startIndex !== -1) break;
  }
}

if (startIndex !== -1) {
  // We found the floating `onBack`
  // We want to delete that line and the following two lines
  lines.splice(startIndex, 3);
  
  // And insert the missing EmotionPrintAnalysisScreen
  lines.splice(startIndex, 0, `        )}
        {currentScreen === 62 && (
          <EmotionPrintAnalysisScreen
            route={{ params: { result: emotionPrintResult } }}
            onDone={() => setCurrentScreen(10)}
            isDarkMode={darkMode}
          />`);
          
  fs.writeFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', lines.join('\n'));
  console.log('Successfully fixed syntax error and restored EmotionPrintAnalysisScreen!');
} else {
  console.log('Could not find floating block!');
}
