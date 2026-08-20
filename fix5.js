const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/ConnectionsScreen.js', 'utf8');

// Replace props
content = content.replace(
  "const ConnectionsScreen = ({ onBack, isDarkMode = true, language = 'English' }) => {",
  "const ConnectionsScreen = ({ onBack, isDarkMode = true, language = 'English', connections = [], suggestedConnections = [], currentUserId = null, onConnectionsUpdated, onOpenProfile }) => {"
);

// Find the start of the useEffect that does fetchDynamicConnections
const fetchStartIdx = content.indexOf('  React.useEffect(() => {');
const fetchEndIdx = content.indexOf('  }, [isDarkMode]);', fetchStartIdx) + 19; // The end of that massive useEffect

if (fetchStartIdx !== -1 && fetchEndIdx !== -1 && fetchEndIdx > fetchStartIdx) {
  const replacement = `  React.useEffect(() => {
    if (connections && Array.isArray(connections)) {
      const palettes = [
        ["#38bdf8", "#7c3aed"],
        ["#a855f7", "#ec4899"],
        ["#3b82f6", "#10b981"],
        ["#f59e0b", "#ef4444"],
        ["#14b8a6", "#6366f1"],
      ];

      const mappedConnections = connections.map((conn, index) => ({
        id: conn.id || conn.user_id,
        name: conn.name || 'Anonymous',
        role: conn.role || 'Member',
        genome_score: conn.genome_score || conn.total_score || 50,
        match_score: conn.match_score || 0,
        initials: conn.name ? conn.name.charAt(0).toUpperCase() : 'U',
        tone: palettes[index % palettes.length],
        userRole: conn.userRole || 'student',
        status: conn.status || 'Connected'
      }));

      setPeople(mappedConnections);
      setLoading(false);
    }
  }, [connections]);

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
  content = content.substring(0, fetchStartIdx) + replacement + content.substring(fetchEndIdx);
}

// We also need to fix `toggleConnection` logic which had the old logic.
// Actually, let's just use the `ConnectionsScreen.js` from my transcript!
