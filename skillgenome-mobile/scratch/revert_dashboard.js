const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/MentorDashboardScreen.js';
let content = fs.readFileSync(path, 'utf8');

const target1 = `activeTab === 'cohorts' ? <MentorCohortsTab profile={profile} T={T} onCreateCohort={() => setShowWizard(true)} onViewRoster={(id) => { setSelectedCohortId(id); setActiveTab('students'); }} onViewReports={(id) => { setSelectedCohortId(id); setActiveTab('reports'); }} /> :`;
const replacement1 = `activeTab === 'cohorts' ? <MentorCohortsTab profile={profile} T={T} onCreateCohort={() => setShowWizard(true)} /> :`;

content = content.split(target1).join(replacement1);

fs.writeFileSync(path, content, 'utf8');
console.log("Reverted Dashboard");
