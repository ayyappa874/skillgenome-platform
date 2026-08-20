const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function injectFakeData() {
  const studentId = '587ecf2b-9129-4469-ab2e-e16ebec895ee'; // Apps

  // Give them a resume score of 84
  const { error: e1 } = await supabase.from('resume_analyses').insert([{
    user_id: studentId,
    analysis_data: { extractedSkills: [], trueGenomeScore: 84 }
  }]);
  console.log("e1", e1);

  // Give them a github score of 85
  const { error: e2 } = await supabase.from('github_analyses').insert([{
    user_id: studentId,
    analysis_data: { score: 85 }
  }]);
  console.log("e2", e2);

  // Give them a thought score of 30
  const { error: e3 } = await supabase.from('thought_analyses').insert([{
    user_id: studentId,
    analysis_data: { adaptabilityScore: 30 }
  }]);
  console.log("e3", e3);

  // Give them an emotion score of 35
  const { error: e4 } = await supabase.from('emotions').insert([{
    user_id: studentId,
    analysis_data: { eqScore: 35 }
  }]);
  console.log("e4", e4);

  console.log("Injected fake data!");
}

injectFakeData();
