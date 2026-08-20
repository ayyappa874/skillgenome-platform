const parser = require('@babel/parser');
const fs = require('fs');

try {
  const code = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/Screen11Native.js', 'utf8');
  parser.parse(code, {sourceType: 'module', plugins: ['jsx']});
  console.log("Screen11Native.js OK");
} catch (e) {
  console.error("Screen11Native.js Error:", e);
}

try {
  const code2 = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', 'utf8');
  parser.parse(code2, {sourceType: 'module', plugins: ['jsx']});
  console.log("App.js OK");
} catch (e) {
  console.error("App.js Error:", e);
}
