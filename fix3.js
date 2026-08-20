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
  
  // Find cases where I injected my line before an existing React.useMemo that used getStyles with more arguments
  // e.g. 
  // const T = getTheme(isDarkMode);
  // const S = React.useMemo(() => getStyles(T), [T]);
  // const S = React.useMemo(() => getStyles(T, isDarkMode), [T, isDarkMode]);
  
  // Also for styles
  
  // We can just find any file that has:
  // const S = React.useMemo(() => getStyles(T), [T]);
  // AND another declaration of S (like const S = React.useMemo(...) or const S = StyleSheet.create)
  
  // Let's use regex to find my injected exact string:
  const injectedS = '\n  const S = React.useMemo(() => getStyles(T), [T]);';
  const injectedStyles = '\n  const styles = React.useMemo(() => getStyles(T), [T]);';
  
  if (content.includes(injectedS)) {
    // Check if there's another "const S =" in the file
    const matches = content.match(/const S =/g);
    if (matches && matches.length > 1) {
      // Remove the injected one (only the first occurrence after T)
      content = content.replace(/(const T = getTheme\([^)]*\);)\n  const S = React\.useMemo\(\(\) => getStyles\(T\), \[T\]\);/, '$1');
    }
  }

  if (content.includes(injectedStyles)) {
    // Check if there's another "const styles =" in the file
    const matches = content.match(/const styles =/g);
    if (matches && matches.length > 1) {
      // Remove the injected one
      content = content.replace(/(const T = getTheme\([^)]*\);)\n  const styles = React\.useMemo\(\(\) => getStyles\(T\), \[T\]\);/, '$1');
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(f, content);
    console.log('Cleaned duplicate useMemo:', f);
    count++;
  }
});
console.log('Total cleaned:', count);
