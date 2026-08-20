const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/Screen11Native.js';
let content = fs.readFileSync(path, 'utf8');

const regex = /const modHandlers = \{[\s\S]*?return \(/;

const replacement = `const modHandlers = {
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

  return (`

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log("Restored via Regex!");
} else {
  console.log("Regex did not match!");
}
