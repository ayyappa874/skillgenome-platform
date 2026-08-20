const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const { data: cohortsData, error: cohortsError } = await supabase
    .from('cohorts')
    .select('id, name')
    .limit(1);
    
  if (cohortsError) {
    console.error("Cohorts Error:", cohortsError);
  } else {
    console.log("Cohorts OK:", cohortsData);
  }

  const { data: sessionsData, error: sessionsError } = await supabase
    .from('mentor_sessions')
    .select('id, scheduled_for, topic, cohorts(name, duration_weeks)')
    .limit(1);
    
  if (sessionsError) {
    console.error("Sessions Error:", sessionsError);
  } else {
    console.log("Sessions OK:", sessionsData);
  }
}

test();
