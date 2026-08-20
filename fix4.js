const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/ConnectionsScreen.js', 'utf8');

const startStr = '// Load recommendations from RPC on mount';
const endStr = '// Map existing connections';

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `// Sync suggestedConnections from App.js to suggested state
  React.useEffect(() => {
    if (suggestedConnections && Array.isArray(suggestedConnections)) {
      const palettes = [
        ["#38bdf8", "#7c3aed"],
        ["#a855f7", "#ec4899"],
        ["#3b82f6", "#10b981"],
        ["#f59e0b", "#ef4444"],
        ["#14b8a6", "#6366f1"],
      ];

      const mappedSuggested = suggestedConnections.map((conn, index) => ({
        ...conn,
        initials: conn.name ? conn.name.charAt(0).toUpperCase() : 'U',
        tone: palettes[index % palettes.length]
      }));

      setSuggested(mappedSuggested);
      setLoading(false);
    }
  }, [suggestedConnections]);

  `;

  content = content.slice(0, startIdx) + replacement + content.slice(endIdx);
  fs.writeFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/ConnectionsScreen.js', content);
  console.log('Success');
} else {
  console.log('Failed to find indices');
}
