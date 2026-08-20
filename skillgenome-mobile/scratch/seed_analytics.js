const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seedData() {
  console.log("Fetching Apps student...");
  const { data: profiles } = await supabase.from('profiles').select('id, name').ilike('name', '%Apps%');
  
  if (!profiles || profiles.length === 0) {
    console.log("No student named Apps found.");
    return;
  }
  
  const studentId = profiles[0].id;
  console.log("Found student ID:", studentId);
  
  console.log("Inserting mock resume analysis...");
  await supabase.from('resume_analyses').upsert({
    user_id: studentId,
    analysis_data: { overall_score: 82 }
  }, { onConflict: 'user_id' });
  
  console.log("Inserting mock github analysis...");
  await supabase.from('github_analyses').upsert({
    user_id: studentId,
    analysis_data: { overall_score: 91 }
  }, { onConflict: 'user_id' });
  
  console.log("Inserting mock thought analysis...");
  await supabase.from('thought_analyses').upsert({
    user_id: studentId,
    analysis_data: { adaptabilityScore: 78 }
  }, { onConflict: 'user_id' });
  
  console.log("Inserting mock emotion analysis...");
  await supabase.from('emotions').upsert({
    user_id: studentId,
    analysis_data: { eqScore: 88 }
  }, { onConflict: 'user_id' });
  
  console.log("Successfully seeded database! Dashboard will now show real data.");
}

seedData();
