const { createClient } = require('@supabase/supabase-js');
const url = 'https://howzkjtybavdylsdxyju.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';
const supabase = createClient(url, key);

async function testTables() {
  const t1 = await supabase.from('conversations').select('*').limit(1);
  const t2 = await supabase.from('conversation_participants').select('*').limit(1);
  const t3 = await supabase.from('messages').select('*').limit(1);
  
  console.log("conversations err:", t1.error ? t1.error.message : "OK");
  console.log("participants err:", t2.error ? t2.error.message : "OK");
  console.log("messages err:", t3.error ? t3.error.message : "OK");
}

testTables();
