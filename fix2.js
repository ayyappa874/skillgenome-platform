const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.js')) results.push(file);
    }
  });
  return results;
}

const files = [
  ...walk('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome/screens'),
  ...walk('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens')
];

let count = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let originalContent = content;
  
  content = content.replace(/\n\s*const (S|styles) = getStyles\(T\);/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(f, content);
    console.log('Cleaned:', f);
    count++;
  }
});
console.log('Total cleaned:', count);
