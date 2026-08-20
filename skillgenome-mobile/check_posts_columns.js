const { createClient } = require('@supabase/supabase-js');
const url = 'https://howzkjtybavdylsdxyju.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';
const supabase = createClient(url, key);

async function checkColumns() {
  const { data, error } = await supabase.from('posts').select('*').limit(1);
  console.log("Error:", error);
  if (data && data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
  } else {
    // If it's empty, we can't easily see columns without hitting the endpoint directly and looking at headers or errors
    // Let's insert a dummy row and intentionally fail to see if it complains about a specific column
    const { error: e2 } = await supabase.from('posts').insert([{ id: 'invalid-uuid', non_existent_column: 1 }]);
    console.log("Insert Error:", e2);
  }
}

checkColumns();
