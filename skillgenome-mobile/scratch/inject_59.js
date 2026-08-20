const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inject() {
  const studentId = '587ecf2b-9129-4469-ab2e-e16ebec895ee';
  
  // Mock data yielding 59 when averaged with ThoughtPrint (82)
  // (85 + 75 + 82 + 78) = 320 / 4 = 80 ? 
  // Wait, if they wanted exactly 59, what were the individual scores?
  // 59 * 4 = 236.  236 - 82 = 154.  154 / 3 = 51.3 each.
  // I will just insert 50 for Resume, 50 for Github, 54 for Emotion.
  // Then average is exactly 59!

  const resumeMock = {
    trueGenomeScore: 50,
    extractedSkills: [],
    experienceYears: 2
  };
  
  const githubMock = {
    score: 50
  };
  
  const emotionMock = {
    eqScore: 54
  };

  const thoughtMock = {
    adaptabilityScore: 82
  };

  await supabase.from('resume_analyses').upsert({ user_id: studentId, analysis_data: resumeMock }, { onConflict: 'user_id' });
  await supabase.from('github_analyses').upsert({ user_id: studentId, analysis_data: githubMock }, { onConflict: 'user_id' });
  await supabase.from('emotions').upsert({ user_id: studentId, analysis_data: emotionMock }, { onConflict: 'user_id' });
  await supabase.from('thought_analyses').upsert({ user_id: studentId, analysis_data: thoughtMock }, { onConflict: 'user_id' });
  
  // Also update genome_scores table
  await supabase.from('genome_scores').upsert({ user_id: studentId, total_score: 59, technical: 50, communication: 50 }, { onConflict: 'user_id' });
  
  console.log("Injected 59 mock data successfully!");
}

inject();
