const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkScores() {
  const studentId = '587ecf2b-9129-4469-ab2e-e16ebec895ee'; // Apps student ID
  
  const [
    { data: r },
    { data: g },
    { data: t },
    { data: e }
  ] = await Promise.all([
    supabase.from('resume_analyses').select('analysis_data').eq('user_id', studentId).single(),
    supabase.from('github_analyses').select('analysis_data').eq('user_id', studentId).single(),
    supabase.from('thought_analyses').select('analysis_data').eq('user_id', studentId).single(),
    supabase.from('emotions').select('analysis_data').eq('user_id', studentId).single()
  ]);

  console.log("Resume:", r ? "exists" : "none");
  console.log("GitHub:", g ? "exists" : "none");
  console.log("Thought:", t ? "exists" : "none");
  console.log("Emotion:", e ? "exists" : "none");

  // Run the logic from MentorStudentsTab.js
  const resumeAnalysis = r?.analysis_data;
  const githubAnalysis = g?.analysis_data;
  const thoughtAnalysis = t?.analysis_data;
  const emotionAnalysis = e?.analysis_data;

  const isR = !!resumeAnalysis;
  const isG = !!githubAnalysis;
  const isT = !!thoughtAnalysis;
  const isE = !!emotionAnalysis;

  let rScore = 0;
  if (isR) {
      const extracted = resumeAnalysis.extractedSkills || [];
      rScore = resumeAnalysis.trueGenomeScore || (extracted.length > 0 ? Math.round(extracted.reduce((a, x) => a + (x.score || 0), 0) / extracted.length) : 85);
  }
  const gScore = isG ? (githubAnalysis.score || 75) : 0;
  const tScore = isT ? (thoughtAnalysis.adaptabilityScore || 82) : 0;
  const eScore = isE ? (emotionAnalysis.eqScore || 78) : 0;

  let active = 0;
  let sum = 0;
  if (isR) { active++; sum += rScore; }
  if (isG) { active++; sum += gScore; }
  if (isT) { active++; sum += tScore; }
  if (isE) { active++; sum += eScore; }

  let final = active > 0 ? Math.round(sum / active) : 0;

  console.log(`Scores -> R:${rScore} G:${gScore} T:${tScore} E:${eScore}`);
  console.log(`Active:${active} Sum:${sum} Final:${final}`);
}

checkScores();
