const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function deleteAllPosts() {
  const { data, error } = await supabase.from('posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Deleted all posts:", error ? error.message : "Success");
}

deleteAllPosts();
