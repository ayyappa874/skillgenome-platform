const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/components/MentorReportsTab.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Update signature
content = content.replace(
  "const MentorReportsTab = ({ profile, T }) => {",
  "const MentorReportsTab = ({ profile, T, selectedCohortId }) => {"
);

// 2. Add skillGaps state
content = content.replace(
  "const [loading, setLoading] = useState(true);",
  "const [loading, setLoading] = useState(true);\n  const [skillGaps, setSkillGaps] = useState([]);"
);

// 3. Update setActiveCohort initialization
const oldInit = `        if (mappedCohorts.length > 0 && !activeCohort) {
          setActiveCohort(mappedCohorts[0].id);
        }`;
const newInit = `        if (selectedCohortId) {
          setActiveCohort(selectedCohortId);
        } else if (mappedCohorts.length > 0 && !activeCohort) {
          setActiveCohort(mappedCohorts[0].id);
        }`;
content = content.replace(oldInit, newInit);

// 4. Update useEffect for activeCohort changes
const oldUseEffect = `  useEffect(() => {
    if (activeCohort && cohorts.length > 0) {
      const cohort = cohorts.find(c => c.id === activeCohort);
      if (cohort && cohort.students) {
        let studentsData = [];
        cohort.students.forEach(cs => {
          const p = Array.isArray(cs.profiles) ? cs.profiles[0] : cs.profiles;
          if (p) {
            studentsData.push({
              id: p.id,
              name: p.name || 'Anonymous',
              score: p.genome_score || Math.floor(Math.random() * 40) + 50,
              trend: Math.random() > 0.5 ? '+' + Math.floor(Math.random() * 5) : '-' + Math.floor(Math.random() * 5)
            });
          }
        });
        studentsData.sort((a, b) => b.score - a.score);
        setLeaderboard(studentsData.map((s, i) => ({ ...s, rank: i + 1 })));
      } else {
        setLeaderboard([]);
      }
    }
  }, [activeCohort, cohorts]);

  // Skill Gaps Data (Dynamically Mocked for MVP based on activeCohort)
  const skillGaps = [
    { skill: 'System Design', gap: Math.floor(Math.random() * 20) + 10, avg: 65, target: 89 },
    { skill: 'Data Structures', gap: Math.floor(Math.random() * 15) + 5, avg: 72, target: 87 },
    { skill: 'Machine Learning', gap: Math.floor(Math.random() * 10) + 2, avg: 85, target: 93 },
  ];`;

const newUseEffect = `  useEffect(() => {
    if (activeCohort && cohorts.length > 0) {
      const cohort = cohorts.find(c => c.id === activeCohort);
      if (cohort && cohort.students) {
        let studentsData = [];
        const studentIds = [];
        cohort.students.forEach(cs => {
          const p = Array.isArray(cs.profiles) ? cs.profiles[0] : cs.profiles;
          if (p) {
            studentsData.push({
              id: p.id,
              name: p.name || 'Anonymous',
              score: p.genome_score || 0,
              trend: Math.random() > 0.5 ? '+' + Math.floor(Math.random() * 5) : '-' + Math.floor(Math.random() * 5)
            });
            studentIds.push(p.id);
          }
        });
        studentsData.sort((a, b) => b.score - a.score);
        setLeaderboard(studentsData.map((s, i) => ({ ...s, rank: i + 1 })));

        if (studentIds.length > 0) {
          Promise.all([
            supabase.from('resume_analyses').select('user_id, analysis_data').in('user_id', studentIds),
            supabase.from('github_analyses').select('user_id, analysis_data').in('user_id', studentIds),
            supabase.from('thought_analyses').select('user_id, analysis_data').in('user_id', studentIds),
            supabase.from('emotions').select('user_id, analysis_data').in('user_id', studentIds)
          ]).then(([resRes, gitRes, thoughtRes, emoRes]) => {
            const sum = { resume: 0, github: 0, thought: 0, emotion: 0 };
            const count = { resume: 0, github: 0, thought: 0, emotion: 0 };

            if (resRes.data) resRes.data.forEach(d => { if (d.analysis_data?.overall_score) { sum.resume += d.analysis_data.overall_score; count.resume++; }});
            if (gitRes.data) gitRes.data.forEach(d => { if (d.analysis_data?.overall_score) { sum.github += d.analysis_data.overall_score; count.github++; }});
            if (thoughtRes.data) thoughtRes.data.forEach(d => { if (d.analysis_data?.adaptabilityScore) { sum.thought += d.analysis_data.adaptabilityScore; count.thought++; }});
            if (emoRes.data) emoRes.data.forEach(d => { if (d.analysis_data?.eqScore) { sum.emotion += d.analysis_data.eqScore; count.emotion++; }});

            const avgResume = count.resume > 0 ? Math.round(sum.resume / count.resume) : 0;
            const avgGithub = count.github > 0 ? Math.round(sum.github / count.github) : 0;
            const avgThought = count.thought > 0 ? Math.round(sum.thought / count.thought) : 0;
            const avgEmotion = count.emotion > 0 ? Math.round(sum.emotion / count.emotion) : 0;

            setSkillGaps([
              { skill: 'Resume / Experience', gap: Math.max(0, 90 - avgResume), avg: avgResume, target: 90 },
              { skill: 'Code Contribution', gap: Math.max(0, 85 - avgGithub), avg: avgGithub, target: 85 },
              { skill: 'Thought Process', gap: Math.max(0, 80 - avgThought), avg: avgThought, target: 80 },
              { skill: 'Emotional Intelligence', gap: Math.max(0, 85 - avgEmotion), avg: avgEmotion, target: 85 },
            ].filter(g => g.avg > 0)); // Only show modules that actually have data
          });
        } else {
          setSkillGaps([]);
        }
      } else {
        setLeaderboard([]);
        setSkillGaps([]);
      }
    }
  }, [activeCohort, cohorts]);`;

content = content.replace(oldUseEffect, newUseEffect);

// 5. Update the auto-insight text
const oldInsight = `<Text style={[S.insightText, { color: T.text }]}>System Design is the critical weakness for this cohort. Consider scheduling a live session on this topic next week.</Text>`;
const newInsight = `<Text style={[S.insightText, { color: T.text }]}>
            {skillGaps.length > 0 
              ? \`\${skillGaps.sort((a,b)=>b.gap-a.gap)[0].skill} is the biggest gap in this cohort. Consider focusing your next live session on this area.\`
              : 'Not enough module data yet to generate an auto-insight.'}
          </Text>`;

content = content.replace(oldInsight, newInsight);

// Also need to adjust the activeCohort state update inside useEffect 1 to depend on selectedCohortId
const depArray1 = `}, [profile?.id]);`;
const newDepArray1 = `}, [profile?.id, selectedCohortId]);`;
content = content.replace(depArray1, newDepArray1);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated MentorReportsTab.js");
