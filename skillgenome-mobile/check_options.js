const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const url = 'https://howzkjtybavdylsdxyju.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhvd3pranR5YmF2ZHlsc2R4eWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyMDIsImV4cCI6MjA5NTM4NzIwMn0.DFjdKx4vTtZgyyW6Broei5l60VOy1Zpu8oR2qizWEgI';

async function checkOptions() {
  const res = await fetch(`${url}/rest/v1/posts`, {
    method: 'OPTIONS',
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  console.log(await res.text());
}
checkOptions();
