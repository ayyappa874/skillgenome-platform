const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
  const { data: cohorts, error: cErr } = await supabase.from('cohorts').select('*');
  console.log("Cohorts:", cohorts);
  
  const { data: cohortStudents, error: csErr } = await supabase.from('cohort_students').select('*');
  console.log("Cohort Students Table Size:", cohortStudents ? cohortStudents.length : 0);

  // Test the exact query we use in CohortRosterModal
  const { data: query1, error: q1Err } = await supabase
        .from('cohorts')
        .select(`
          name,
          cohort_students (
            id,
            profiles ( id, name, avatar_url, genome_score )
          )
        `);
  
  console.log("Roster Query Result:", JSON.stringify(query1, null, 2));
  if (q1Err) console.error("Roster Query Error:", q1Err);

  // Test the query with !student_id to see if it fixes it
  const { data: query2, error: q2Err } = await supabase
        .from('cohorts')
        .select(`
          name,
          cohort_students (
            id,
            profiles!student_id ( id, name, avatar_url, genome_score )
          )
        `);
  
  console.log("Roster Query Result with !student_id:", JSON.stringify(query2, null, 2));
  if (q2Err) console.error("Roster Query Error 2:", q2Err);
}

check();
