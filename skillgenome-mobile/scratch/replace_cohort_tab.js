const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/MentorDashboardScreen.js';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `activeTab === 'cohorts' ? <MentorCohortsTab profile={profile} T={T} onCreateCohort={() => setShowWizard(true)} /> :`;
const replacementStr = `activeTab === 'cohorts' ? <MentorCohortsTab profile={profile} T={T} onCreateCohort={() => setShowWizard(true)} onViewRoster={() => setActiveTab('students')} onViewReports={() => setActiveTab('reports')} /> :`;

content = content.split(targetStr).join(replacementStr);

fs.writeFileSync(path, content, 'utf8');
console.log("Replaced:", content.includes(replacementStr));
