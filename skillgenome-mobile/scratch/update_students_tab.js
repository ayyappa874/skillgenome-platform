const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/components/MentorStudentsTab.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Update signature
content = content.replace(
  "const MentorStudentsTab = ({ profile, T, onSelectStudent, mode = 'all' }) => {",
  "const MentorStudentsTab = ({ profile, T, onSelectStudent, mode = 'all', selectedCohortId }) => {"
);

// 2. Update useEffect
content = content.replace(
  "  }, [profile?.id, mode]);",
  "  }, [profile?.id, mode, selectedCohortId]);"
);

// 3. Update fetchStudents logic
const oldFetchCohortStr = `        if (mode === 'all' || mode === 'cohort') {
          const { data, error } = await supabase
            .from('cohorts')
            .select(\`
              name,
              cohort_students (
                id,
                profiles ( id, name, avatar_url )
              )
            \`)
            .eq('mentor_id', profile.id);`;

const newFetchCohortStr = `        if ((mode === 'all' || mode === 'cohort') && (!selectedCohortId || mode === 'cohort')) {
          let query = supabase
            .from('cohorts')
            .select(\`
              id,
              name,
              cohort_students (
                id,
                profiles ( id, name, avatar_url )
              )
            \`)
            .eq('mentor_id', profile.id);

          if (selectedCohortId) {
            query = query.eq('id', selectedCohortId);
          }
            
          const { data, error } = await query;`;

content = content.replace(oldFetchCohortStr, newFetchCohortStr);

// 4. Update the accepted logic to not run if selectedCohortId is provided
const oldAcceptedStr = `        if (mode === 'all' || mode === 'accepted') {`;
const newAcceptedStr = `        if (!selectedCohortId && (mode === 'all' || mode === 'accepted')) {`;

content = content.replace(oldAcceptedStr, newAcceptedStr);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated MentorStudentsTab.js");
