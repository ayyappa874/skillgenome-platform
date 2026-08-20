const { createClient } = require('@supabase/supabase-js');
const url = 'https://howzkjtybavdylsdxyju.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';
const supabase = createClient(url, key);

async function testUserInsert() {
  const email = `test_${Date.now()}@example.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: email,
    password: 'Password123!@#'
  });
  if (authError) {
    console.log("Auth Error:", authError);
    return;
  }
  console.log("User signed up:", authData.user.id);
  
  const { data, error } = await supabase.from('posts').insert([{
    author_id: authData.user.id,
    content: "Testing post insert",
    skills_tags: ["React", "__VISIBILITY_public__"]
  }]).select('*');
  
  console.log("Insert Error:", error);
  console.log("Inserted Data:", data);
}

testUserInsert();
