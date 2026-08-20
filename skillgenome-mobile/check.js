const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
  const p = await supabase.from('portfolio_projects').select('*').limit(1);
  console.log("portfolio_projects:", p.error ? "Error: " + p.error.message : "Exists");
  
  const sg = await supabase.from('study_groups').select('*').limit(1);
  console.log("study_groups:", sg.error ? "Error: " + sg.error.message : "Exists");
  
  const jm = await supabase.from('job_matches').select('*').limit(1);
  console.log("job_matches:", jm.error ? "Error: " + jm.error.message : "Exists");
}
check();
