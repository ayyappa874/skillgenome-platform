const { createClient } = require('@supabase/supabase-js');
const url = 'https://howzkjtybavdylsdxyju.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';
const supabase = createClient(url, key);

async function testMentorship() {
  const email = `test_mentor_${Date.now()}@example.com`;
  const { data: authData } = await supabase.auth.signUp({
    email: email,
    password: 'Password123!@#'
  });
  
  if (!authData || !authData.user) {
    console.log("Signup failed");
    return;
  }
  
  const { data, error } = await supabase.from('mentorship_requests').insert([{
    student_id: authData.user.id,
    mentor_id: 'a1262d29-6dc7-47b7-bd1c-8b8a8b8a8b8a', // Fake mentor
    status: 'Pending'
  }]);
  
  console.log("Insert Error:", error);
}

testMentorship();
