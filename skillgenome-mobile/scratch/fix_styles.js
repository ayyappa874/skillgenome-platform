const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/MessagesScreen.js';
let content = fs.readFileSync(path, 'utf8');

const oldStyles = `    tabTextActive: {
      color: "#ffffff",
    
      flex: 1,
      backgroundColor: bgStyle,
    },`;

const newStyles = `    tabTextActive: {
      color: "#ffffff",
    },
    container: {
      flex: 1,
      backgroundColor: bgStyle,
    },`;

content = content.replace(oldStyles, newStyles);
fs.writeFileSync(path, content, 'utf8');
console.log("Fixed styling syntax in MessagesScreen.js");
