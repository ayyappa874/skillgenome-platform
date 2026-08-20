const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', 'utf8');

const duplicateStart = content.lastIndexOf('import * as React from "react";');
if (duplicateStart === -1 || duplicateStart === 0) {
  console.log('No duplication found.');
  process.exit(0);
}

const screen28Index = content.indexOf('        {currentScreen === 28 && (', duplicateStart);
if (screen28Index === -1) {
  console.log('Could not find screen 28.');
  process.exit(1);
}

content = content.substring(0, duplicateStart) + content.substring(screen28Index);
fs.writeFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', content);
console.log('App.js de-duplicated and fixed perfectly!');
