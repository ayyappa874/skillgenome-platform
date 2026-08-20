const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/StudentSessionsScreen.js';
let content = fs.readFileSync(path, 'utf8');

// Replace MentorLiveSession with StudentLiveSession
content = content.replace(
  "import MentorLiveSession from '../components/MentorLiveSession';",
  "import StudentLiveSession from '../components/StudentLiveSession';"
);

content = content.replace(
  /<MentorLiveSession/g,
  "<StudentLiveSession studentId={profile.id}"
);

content = content.replace(
  /<\/MentorLiveSession>/g,
  "</StudentLiveSession>"
);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated StudentSessionsScreen to use StudentLiveSession");
