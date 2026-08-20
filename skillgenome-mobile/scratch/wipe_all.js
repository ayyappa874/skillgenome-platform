const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function wipe() {
  console.log("Wiping all analysis tables to give the user a pure 0 score for testing...");
  // Use delete().neq to delete all rows
  await supabase.from('resume_analyses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('github_analyses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('emotions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('thought_analyses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  // also delete from genome_scores
  await supabase.from('genome_scores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Wiped!");
}

wipe();
