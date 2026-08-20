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
  
  // The buggy text we need to replace: \n  const S = React.useMemo(...) or styles
  // It looks literally like: `\n  const S = React.useMemo` (the characters backslash and n)
  // And it DELETED `const T = getTheme(isDarkMode);`!
  // Wait, did it delete `const T = getTheme(isDarkMode);` or `const T = getTheme(isDark);`?
  // I will just put `const T = getTheme(isDarkMode);` back. Wait, let's look at what is after the buggy text.
  // We can just replace literally `\\n  const S = React.useMemo(() => getStyles(T), [T]);` 
  // with `\n  const T = getTheme(isDarkMode);\n  const S = React.useMemo(() => getStyles(T), [T]);`
  
  // Note: we need to handle S and styles.
  content = content.replace(/\\n\s*const (S|styles) = React\.useMemo\(\(\) => getStyles\(T\), \[T\]\);/g, (match, p1) => {
    return '\n  const T = getTheme(isDarkMode);\n  const ' + p1 + ' = React.useMemo(() => getStyles(T), [T]);';
  });

  if (content !== originalContent) {
    fs.writeFileSync(f, content);
    console.log('Fixed:', f);
    count++;
  }
});
console.log('Total fixed:', count);
