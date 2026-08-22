const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/Screen11Web.js';
let content = fs.readFileSync(path, 'utf8');

// Update ACTIONS array
const actionsOld = `const ACTIONS = [
  { label:"Interview\\nPrep",  icon:"🤝", accent:"var(--green)", actionKey: "onOpenInterviewPrep" },
  { label:"Career\\nFutures",  icon:"🎓", accent:"var(--violet)", actionKey: "onOpenMentors" },
  { label:"My\\nConnections",  icon:"👥", accent:"var(--blue)", actionKey: "onOpenConnections" },`;

const actionsRegex = /const ACTIONS = \[\s*\{ label:"Interview\\nPrep",[\s\S]*?\{ label:"My\\nConnections",[\s\S]*?actionKey: "onOpenConnections" \},/;
const actionsMatch = content.match(actionsRegex);

if (actionsMatch) {
  const replacement = actionsMatch[0].replace(
    /\{ label:"Career\\nFutures",([^\]]+)\},/,
    `{ label:"Career\\nFutures",$1},\n  { label:"Live\\nSessions",  icon:"📹", accent:"var(--rose)", actionKey: "onOpenSessions" },`
  );
  content = content.replace(actionsRegex, replacement);
}

// Ensure the Screen11Web function signature accepts onOpenSessions
const sigMatch = content.match(/const Screen11Web = \(\{([\s\S]*?)\}\) => \{/);
if (sigMatch && !sigMatch[1].includes('onOpenSessions')) {
  content = content.replace(
    sigMatch[0],
    sigMatch[0].replace('onOpenMentors,', 'onOpenMentors, onOpenSessions,')
  );
}

// Update actionHandlers
const handlersRegex = /const actionHandlers = \{[\s\S]*?onOpenConnections,/;
const handlersMatch = content.match(handlersRegex);
if (handlersMatch) {
  content = content.replace(
    handlersRegex,
    handlersMatch[0] + '\n    onOpenSessions,'
  );
}

fs.writeFileSync(path, content, 'utf8');
console.log("Updated Screen11Web.js");