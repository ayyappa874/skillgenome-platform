const { supabase } = require('./utils/supabase');

async function test() {
  const { data, error } = await supabase
    .from('mentorship_requests')
    .select('id, student_id, status, profiles!student_id(name)');
  
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Data:", data);
  }
}
test();
