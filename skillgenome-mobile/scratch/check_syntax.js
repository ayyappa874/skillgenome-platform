const parser = require('@babel/parser');
const fs = require('fs');

try {
  const code = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/components/StudentLiveSession.js', 'utf8');
  parser.parse(code, {sourceType: 'module', plugins: ['jsx']});
  console.log("StudentLiveSession.js OK");
} catch (e) {
  console.error("StudentLiveSession.js Error:", e);
}

try {
  const code2 = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/components/MentorLiveSession.js', 'utf8');
  parser.parse(code2, {sourceType: 'module', plugins: ['jsx']});
  console.log("MentorLiveSession.js OK");
} catch (e) {
  console.error("MentorLiveSession.js Error:", e);
}
