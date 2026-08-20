const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://howzkjtybavdylsdxyju.supabase.co'; 
// Use service role key to bypass RLS and query policies
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Wait, I don't have the service key.

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkRLS() {
  // Let's try to fetch a user session
  // Since we don't have credentials, we can't easily sign in.
  // But wait, the database might not have the "posts" table properly configured!
  
  // Let's get the table info via REST API using anon key if possible
  const response = await fetch(`${SUPABASE_URL}/rest/v1/posts?limit=1`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  console.log("Posts table status:", response.status, response.statusText);
  const data = await response.text();
  console.log("Data:", data);
}

checkRLS();
