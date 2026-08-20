const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkScores() {
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'ayyappa@test.com', // Assuming this is Apps email
    password: 'password123' // Or whatever default is
  });

  if (authErr) {
    console.log("Auth err:", authErr.message);
    return;
  }

  const studentId = authData.user.id;
  console.log("Logged in as:", studentId);

  const [
    { data: r },
    { data: g },
    { data: t },
    { data: e }
  ] = await Promise.all([
    supabase.from('resume_analyses').select('analysis_data').eq('user_id', studentId).limit(1).single(),
    supabase.from('github_analyses').select('analysis_data').eq('user_id', studentId).limit(1).single(),
    supabase.from('thought_analyses').select('analysis_data').eq('user_id', studentId).limit(1).single(),
    supabase.from('emotions').select('analysis_data').eq('user_id', studentId).limit(1).single()
  ]);

  console.log("R:", r);
  console.log("G:", g);
  console.log("T:", t);
  console.log("E:", e);
}

checkScores();
