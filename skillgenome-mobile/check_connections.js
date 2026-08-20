const fs = require('fs');
const supabaseJS = fs.readFileSync('utils/supabase.js', 'utf8');
const urlMatch = supabaseJS.match(/const supabaseUrl = ['"]([^'"]+)['"]/);
const keyMatch = supabaseJS.match(/const supabaseAnonKey = ['"]([^'"]+)['"]/);
if (urlMatch && keyMatch) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  supabase.from('mentorship_requests').select('*').limit(5).then(res => {
    console.log('mentorship_requests:', res.data);
    if(res.error) console.error(res.error);
  });
  supabase.from('connections').select('*').limit(5).then(res => {
    console.log('connections table:', res.data);
    if(res.error) console.error(res.error);
  });
}
