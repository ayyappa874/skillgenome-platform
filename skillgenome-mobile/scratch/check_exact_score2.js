const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkScores() {
  const studentId = '587ecf2b-9129-4469-ab2e-e16ebec895ee'; // Apps student ID
  
  const [
    { data: r, error: er },
    { data: g, error: eg },
    { data: t, error: et },
    { data: e, error: ee }
  ] = await Promise.all([
    supabase.from('resume_analyses').select('analysis_data').eq('user_id', studentId).limit(1).single(),
    supabase.from('github_analyses').select('analysis_data').eq('user_id', studentId).limit(1).single(),
    supabase.from('thought_analyses').select('analysis_data').eq('user_id', studentId).limit(1).single(),
    supabase.from('emotions').select('analysis_data').eq('user_id', studentId).limit(1).single()
  ]);

  console.log("R error:", er);
  console.log("G error:", eg);
  console.log("T error:", et);
  console.log("E error:", ee);
}

checkScores();
