const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/components/MentorSessionsTab.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove the static mock helper
const mockRegex = /\/\/ Mock helper to generate a recommended topic[\s\S]*?return topics\[Math\.floor\(Math\.random\(\) \* topics\.length\)\];\n\};\n/m;
content = content.replace(mockRegex, '');

// 2. Add dynamic recommendation calculation inside useEffect or when selectedCohortId changes
// We'll replace the existing fetchSessions and useEffect
const oldHooks = `  useEffect(() => {
    if (profile?.id) {
      fetchSessions();
      setRecommended(getRecommendedTopic());
    }
  }, [profile?.id]);`;

const newHooks = `  const fetchRecommendation = async (cohortId) => {
    try {
      const { data, error } = await supabase
        .from('cohorts')
        .select(\`
          cohort_students ( profiles ( id ) )
        \`)
        .eq('id', cohortId)
        .single();
        
      if (error || !data) return;
      
      const studentIds = [];
      if (data.cohort_students) {
        data.cohort_students.forEach(cs => {
          const p = Array.isArray(cs.profiles) ? cs.profiles[0] : cs.profiles;
          if (p) studentIds.push(p.id);
        });
      }

      if (studentIds.length === 0) {
        setRecommended(null);
        return;
      }

      const [resRes, gitRes, thoughtRes, emoRes] = await Promise.all([
        supabase.from('resume_analyses').select('user_id, analysis_data').in('user_id', studentIds),
        supabase.from('github_analyses').select('user_id, analysis_data').in('user_id', studentIds),
        supabase.from('thought_analyses').select('user_id, analysis_data').in('user_id', studentIds),
        supabase.from('emotions').select('user_id, analysis_data').in('user_id', studentIds)
      ]);

      const sum = { resume: 0, github: 0, thought: 0, emotion: 0 };
      const count = { resume: 0, github: 0, thought: 0, emotion: 0 };

      if (resRes.data) resRes.data.forEach(d => { 
        const r = d.analysis_data;
        if (r) {
          const extracted = r.extractedSkills || [];
          const rScore = r.trueGenomeScore || (extracted.length > 0 ? Math.round(extracted.reduce((a, x) => a + (x.score || 0), 0) / extracted.length) : 85);
          sum.resume += rScore; count.resume++; 
        }
      });
      if (gitRes.data) gitRes.data.forEach(d => { if (d.analysis_data?.score) { sum.github += d.analysis_data.score; count.github++; }});
      if (thoughtRes.data) thoughtRes.data.forEach(d => { if (d.analysis_data?.overall_score) { sum.thought += d.analysis_data.overall_score; count.thought++; }});
      if (emoRes.data) emoRes.data.forEach(d => { if (d.analysis_data?.eq_score) { sum.emotion += d.analysis_data.eq_score; count.emotion++; }});

      const avgResume = count.resume > 0 ? Math.round(sum.resume / count.resume) : 0;
      const avgGithub = count.github > 0 ? Math.round(sum.github / count.github) : 0;
      const avgThought = count.thought > 0 ? Math.round(sum.thought / count.thought) : 0;
      const avgEmotion = count.emotion > 0 ? Math.round(sum.emotion / count.emotion) : 0;

      const gaps = [
        { skill: 'Resume & Experience', gap: Math.max(0, 85 - avgResume), avg: avgResume },
        { skill: 'Code Contribution', gap: Math.max(0, 80 - avgGithub), avg: avgGithub },
        { skill: 'Thought Process', gap: Math.max(0, 80 - avgThought), avg: avgThought },
        { skill: 'Emotional Intelligence', gap: Math.max(0, 85 - avgEmotion), avg: avgEmotion }
      ].filter(g => g.avg > 0);

      if (gaps.length > 0) {
        const biggestGap = [...gaps].sort((a,b) => b.gap - a.gap)[0];
        setRecommended({
          title: biggestGap.skill,
          reason: \`\${studentIds.length} \${studentIds.length === 1 ? 'student has' : 'students have'} a \${biggestGap.gap}% average gap below target in \${biggestGap.skill}. Strongly recommended.\`
        });
      } else {
        setRecommended(null);
      }
    } catch (err) {
      console.warn("Error fetching recommendation", err);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchSessions();
    }
  }, [profile?.id]);

  useEffect(() => {
    if (selectedCohortId) {
      fetchRecommendation(selectedCohortId);
    }
  }, [selectedCohortId]);`;

content = content.replace(oldHooks, newHooks);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated MentorSessionsTab to have dynamic recommendations");
