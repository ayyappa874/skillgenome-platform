const parser = require('@babel/parser');
const fs = require('fs');
try {
  const code = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/components/MentorReportsTab.js', 'utf8');
  parser.parse(code, {sourceType: 'module', plugins: ['jsx']});
  console.log("MentorReportsTab.js OK");
} catch (e) {
  console.error("MentorReportsTab.js Error:", e);
}
