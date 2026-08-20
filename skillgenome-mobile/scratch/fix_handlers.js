const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/Screen11Native.js';
let content = fs.readFileSync(path, 'utf8');

const handlersHook = `onOpenDailyQuiz,`;
const handlersReplacement = `onOpenDailyQuiz,\n    onOpenSessions,`;

if (content.includes(handlersHook) && !content.includes('onOpenSessions,')) {
  content = content.replace(handlersHook, handlersReplacement);
  console.log("Added onOpenSessions to actionHandlers");
}

fs.writeFileSync(path, content, 'utf8');
console.log("Done updating actionHandlers in Screen11Native.js");
