const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js';
let content = fs.readFileSync(path, 'utf8');

// Ensure role check is completely safe and case-insensitive
content = content.replace(
  /isMentor: otherParticipant.role === 'mentor' \|\| otherParticipant.role === 'Mentor'/g,
  "isMentor: (otherParticipant.role || '').toLowerCase() === 'mentor' || (otherParticipant.title || '').toLowerCase() === 'mentor'"
);

content = content.replace(
  /isMentor: peer.role === 'mentor' \|\| peer.role === 'Mentor'/g,
  "isMentor: (peer.role || '').toLowerCase() === 'mentor' || (peer.title || '').toLowerCase() === 'mentor'"
);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed isMentor case-sensitivity and title check");
