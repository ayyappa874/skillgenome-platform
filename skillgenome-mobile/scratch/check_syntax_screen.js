const parser = require('@babel/parser');
const fs = require('fs');

try {
  const code = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/StudentSessionsScreen.js', 'utf8');
  parser.parse(code, {sourceType: 'module', plugins: ['jsx']});
  console.log("StudentSessionsScreen.js OK");
} catch (e) {
  console.error("StudentSessionsScreen.js Error:", e);
}
