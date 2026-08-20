const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/Screen11Native.js';
let content = fs.readFileSync(path, 'utf8');

const hook = `  const modHandlers = {
    resume: () => nav(onOpenUploadResume),
    explore: () => { setActiveNav("explore"); nav(onOpenExplore); },`;

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
    explore: () => { setActiveNav("explore"); nav(onOpenExplore); },`;

content = content.replace(hook, replacement);

fs.writeFileSync(path, content, 'utf8');
console.log("Restored Screen11Native.js successfully!");
