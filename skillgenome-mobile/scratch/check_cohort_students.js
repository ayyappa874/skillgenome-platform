require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: cohorts, error: cErr } = await supabase.from('cohorts').select('*');
  console.log("Cohorts:", cohorts);
  
  const { data: cohortStudents, error: csErr } = await supabase.from('cohort_students').select('*');
  console.log("Cohort Students:", cohortStudents);

  const { data: joinCheck, error: jErr } = await supabase.from('cohorts').select('id, name, cohort_students(student_id)');
  console.log("Join Check:", JSON.stringify(joinCheck, null, 2));

  const { data: joinCheck2, error: jErr2 } = await supabase.from('cohorts').select('id, name, cohort_students(student_id, profiles!student_id(id, name))');
  console.log("Join Check 2 (with profiles):", JSON.stringify(joinCheck2, null, 2));
}

check();
