const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUpsert() {
  const dummyId = '00000000-0000-0000-0000-000000000000';
  
  const { error: err1 } = await supabase.from('resume_analyses').upsert({ user_id: dummyId, analysis_data: {} }, { onConflict: 'user_id' });
  console.log("Resume Upsert Error:", err1);
  
  const { error: err2 } = await supabase.from('github_analyses').upsert({ user_id: dummyId, analysis_data: {} }, { onConflict: 'user_id' });
  console.log("Github Upsert Error:", err2);

  const { error: err3 } = await supabase.from('emotions').upsert({ user_id: dummyId, analysis_data: {} }, { onConflict: 'user_id' });
  console.log("Emotions Upsert Error:", err3);

  const { error: err4 } = await supabase.from('thought_analyses').upsert({ user_id: dummyId, analysis_data: {} }, { onConflict: 'user_id' });
  console.log("Thought Upsert Error:", err4);
}

checkUpsert();
