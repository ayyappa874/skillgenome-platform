const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/MentorDashboardScreen.js';
let content = fs.readFileSync(path, 'utf8');

// Replace both instances where the tabs are rendered
const targetStr = `             activeTab === 'cohorts' ? <MentorCohortsTab profile={profile} T={T} onCreateCohort={() => setShowWizard(true)} onViewRoster={() => setActiveTab('students')} onViewReports={() => setActiveTab('reports')} /> : 
             activeTab === 'students' ? <MentorStudentsTab profile={profile} T={T} mode="cohort" onSelectStudent={setActiveStudent} /> :
             activeTab === 'accepted' ? <MentorStudentsTab profile={profile} T={T} mode="accepted" onSelectStudent={setActiveStudent} /> :
             activeTab === 'reports' ? <MentorReportsTab profile={profile} T={T} /> :`;

const replacementStr = `             activeTab === 'cohorts' ? <MentorCohortsTab profile={profile} T={T} onCreateCohort={() => setShowWizard(true)} onViewRoster={(id) => { setSelectedCohortId(id); setActiveTab('students'); }} onViewReports={(id) => { setSelectedCohortId(id); setActiveTab('reports'); }} /> : 
             activeTab === 'students' ? <MentorStudentsTab profile={profile} T={T} mode="cohort" onSelectStudent={setActiveStudent} selectedCohortId={selectedCohortId} /> :
             activeTab === 'accepted' ? <MentorStudentsTab profile={profile} T={T} mode="accepted" onSelectStudent={setActiveStudent} /> :
             activeTab === 'reports' ? <MentorReportsTab profile={profile} T={T} selectedCohortId={selectedCohortId} /> :`;

// Wait, the previous powershell script might have replaced the spaces slightly differently. Let's just use regex.

const regex1 = /activeTab === 'cohorts' \? <MentorCohortsTab[^>]+> : \n\s*activeTab === 'students' \? <MentorStudentsTab[^>]+> : \n\s*activeTab === 'accepted' \? <MentorStudentsTab[^>]+> : \n\s*activeTab === 'reports' \? <MentorReportsTab[^>]+> :/g;

const matchCount = (content.match(regex1) || []).length;
console.log("Found matches with regex:", matchCount);

// Let's do it manually using split
let newContent = content;

const cohortsLine = `activeTab === 'cohorts' ? <MentorCohortsTab profile={profile} T={T} onCreateCohort={() => setShowWizard(true)} onViewRoster={() => setActiveTab('students')} onViewReports={() => setActiveTab('reports')} /> :`;
const newCohortsLine = `activeTab === 'cohorts' ? <MentorCohortsTab profile={profile} T={T} onCreateCohort={() => setShowWizard(true)} onViewRoster={(id) => { setSelectedCohortId(id); setActiveTab('students'); }} onViewReports={(id) => { setSelectedCohortId(id); setActiveTab('reports'); }} /> :`;

const studentsLine = `activeTab === 'students' ? <MentorStudentsTab profile={profile} T={T} mode="cohort" onSelectStudent={setActiveStudent} /> :`;
const newStudentsLine = `activeTab === 'students' ? <MentorStudentsTab profile={profile} T={T} mode="cohort" onSelectStudent={setActiveStudent} selectedCohortId={selectedCohortId} /> :`;

const reportsLine = `activeTab === 'reports' ? <MentorReportsTab profile={profile} T={T} /> :`;
const newReportsLine = `activeTab === 'reports' ? <MentorReportsTab profile={profile} T={T} selectedCohortId={selectedCohortId} /> :`;

newContent = newContent.split(cohortsLine).join(newCohortsLine);
newContent = newContent.split(studentsLine).join(newStudentsLine);
newContent = newContent.split(reportsLine).join(newReportsLine);

// Reset selectedCohortId when user clicks standard side tabs
const tabNavLine = `onPress={() => setActiveTab(sub.id)}`;
const newTabNavLine = `onPress={() => { setActiveTab(sub.id); setSelectedCohortId(null); }}`;

newContent = newContent.split(tabNavLine).join(newTabNavLine);

fs.writeFileSync(path, newContent, 'utf8');
console.log("Replacement complete.");
