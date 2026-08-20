const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// We don't have the exact mentor_id, so let's just get any accepted request
async function test() {
  const { data, error } = await supabase
    .from('mentorship_requests')
    .select('id, mentor_id, student_id, status, profiles!student_id ( id, name )')
    .eq('status', 'accepted');

  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}

test();
