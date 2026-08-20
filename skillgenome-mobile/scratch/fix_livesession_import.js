const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/StudentSessionsScreen.js';
let content = fs.readFileSync(path, 'utf8');

// Replace LiveSessionModal with MentorLiveSession
content = content.replace(
  "import LiveSessionModal from '../components/LiveSessionModal';",
  "import MentorLiveSession from '../components/MentorLiveSession';"
);

content = content.replace(
  /<LiveSessionModal/g,
  "<MentorLiveSession"
);

content = content.replace(
  /<\/LiveSessionModal>/g,
  "</MentorLiveSession>"
);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed import in StudentSessionsScreen.js");
