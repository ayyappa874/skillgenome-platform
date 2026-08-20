const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/Screen11Native.js';
let content = fs.readFileSync(path, 'utf8');

// Add "Live Sessions" to QUICK_ACTIONS
const quickActionsOld = `const QUICK_ACTIONS = [
  { id: "interview", label: "Interview prep", icon: "🤝", colorKey: "green", key: "onOpenInterviewPrep" },
  { id: "mentors", label: "Mentor matches", icon: "🎓", colorKey: "violet", key: "onOpenMentors" },
  { id: "connections", label: "My Connections", icon: "👥", colorKey: "blue", key: "onOpenConnections" },`;

// Handle mangled emojis
const quickActionsRegex = /const QUICK_ACTIONS = \[\s*\{ id: "interview",[\s\S]*?\{ id: "mentors",[\s\S]*?\{ id: "connections",[\s\S]*?, key: "onOpenConnections" \},/;

const quickActionsMatch = content.match(quickActionsRegex);
if (quickActionsMatch) {
  const replacement = quickActionsMatch[0].replace(
    /\{ id: "mentors",([^\]]+)\},/,
    `{ id: "mentors",$1},\n  { id: "sessions", label: "Live Sessions", icon: "📹", colorKey: "rose", key: "onOpenSessions" },`
  );
  content = content.replace(quickActionsRegex, replacement);
} else {
  console.log("Could not find QUICK_ACTIONS to patch");
}

fs.writeFileSync(path, content, 'utf8');
console.log("Updated Screen11Native.js");
