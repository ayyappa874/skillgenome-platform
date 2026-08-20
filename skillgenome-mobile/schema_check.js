const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const content = fs.readFileSync('utils/supabase.js', 'utf8');
const urlMatch = content.match(/supabaseUrl\s*=\s*['"](.*?)['"]/);
const keyMatch = content.match(/supabaseAnonKey\s*=\s*['"](.*?)['"]/);
const url = urlMatch ? urlMatch[1] : 'https://howzkjtybavdylsdxyju.supabase.co';
const key = keyMatch ? keyMatch[1] : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';
const supabase = createClient(url, key);

async function checkSchema() {
  const { data, error } = await supabase.rpc('get_schema_info'); // if it exists
  
  // Actually, we can just fetch a single row to see columns
  const res = await fetch(`${url}/rest/v1/posts?limit=1`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  console.log(await res.text());
}
checkSchema();
