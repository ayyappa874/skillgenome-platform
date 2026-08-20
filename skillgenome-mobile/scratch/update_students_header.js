const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/components/MentorStudentsTab.js';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `<Text style={[S.title, { color: T.text }]}>{mode === 'accepted' ? 'Accepted Students' : 'List of Students'}</Text>`;
const replacementStr = `<Text style={[S.title, { color: T.text }]}>{selectedCohortId ? 'Cohort Roster' : (mode === 'accepted' ? 'Accepted Students' : 'List of Students')}</Text>`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(path, content, 'utf8');
console.log("Updated title in MentorStudentsTab");
