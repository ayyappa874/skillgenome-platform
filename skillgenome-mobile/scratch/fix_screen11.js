const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/Screen11Native.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add onOpenSessions to function arguments
const argsHook = `onOpenExplore, onOpenAIChat, onOpenConnections, onOpenDailyQuiz, onOpenDailyLearning, profile = {}, resumeAnalysis,`;
const argsReplacement = `onOpenExplore, onOpenAIChat, onOpenConnections, onOpenSessions, onOpenDailyQuiz, onOpenDailyLearning, profile = {}, resumeAnalysis,`;

if (content.includes(argsHook)) {
  content = content.replace(argsHook, argsReplacement);
  console.log("Added onOpenSessions to arguments");
}

// 2. Add onOpenSessions to actionHandlers
const handlersHook = `onOpenConnections,
    onOpenDailyQuiz,`;
const handlersReplacement = `onOpenConnections,
    onOpenSessions,
    onOpenDailyQuiz,`;

if (content.includes(handlersHook)) {
  content = content.replace(handlersHook, handlersReplacement);
  console.log("Added onOpenSessions to actionHandlers");
}

fs.writeFileSync(path, content, 'utf8');
console.log("Done updating Screen11Native.js");
