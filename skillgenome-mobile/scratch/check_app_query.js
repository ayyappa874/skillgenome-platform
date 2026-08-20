const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkMentorTab() {
  const profileId = '2e37c404-d478-461a-8c72-48c863d7a3aa'; // Let's use the mentor_id from check_accepted.js
  
  const { data: reqData, error: reqError } = await supabase
    .from('mentorship_requests')
    .select('id, student_id, profiles!student_id ( id, name, genome_score, avatar_url )')
    .eq('mentor_id', profileId)
    .eq('status', 'accepted');
    
  console.log("Error:", reqError);
  console.log("Data:", JSON.stringify(reqData, null, 2));
}

checkMentorTab();
