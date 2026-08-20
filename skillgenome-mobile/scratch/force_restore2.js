const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/Screen11Native.js';
let content = fs.readFileSync(path, 'utf8');

const hookStart = `  const modHandlers = {`;
const hookEnd = `  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}> `;

const hookStartIndex = content.indexOf(hookStart);
const hookEndIndex = content.indexOf(hookEnd);

if (hookStartIndex !== -1 && hookEndIndex !== -1) {
  const replacement = `  const modHandlers = {
    resume: () => nav(onOpenUploadResume),
    github: () => nav(onOpenGitHubConnect),
    thought: () => nav(onOpenThoughtPrint),
    emotion: () => nav(onOpenEmotionPrint),
  };

  const actionHandlers = {
    onOpenInterviewPrep,
    onOpenMentors,
    onOpenTimeline,
    onOpenCommunity,
    onOpenExplore,
    onOpenStudyGroup,
    onOpenConnections,
    onOpenSessions,
    onOpenDailyQuiz,
    onOpenDailyLearning,
  };

  const tier = genomeScore >= 80 ? "Elite candidate" : genomeScore >= 60 ? "Strong profile" : genomeScore >= 30 ? "Rising profile" : "Getting started";

  const navHandlers = {
    home: () => setActiveNav("home"),
    explore: () => { setActiveNav("explore"); nav(onOpenExplore); },
    ai: () => { setActiveNav("ai"); nav(onOpenAIChat); },
    community: () => { setActiveNav("community"); nav(onOpenCommunity); },
    settings: () => { setActiveNav("settings"); nav(onOpenSettings); },
  };

`;

  content = content.substring(0, hookStartIndex) + replacement + content.substring(hookEndIndex);
  fs.writeFileSync(path, content, 'utf8');
  console.log("Restored all handlers and tier correctly!");
} else {
  console.log("Could not find the hooks");
}
