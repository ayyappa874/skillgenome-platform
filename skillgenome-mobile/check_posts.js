const fs = require('fs');
const supabaseJS = fs.readFileSync('utils/supabase.js', 'utf8');
const urlMatch = supabaseJS.match(/const supabaseUrl = ['"]([^'"]+)['"]/);
const keyMatch = supabaseJS.match(/const supabaseAnonKey = ['"]([^'"]+)['"]/);
if (urlMatch && keyMatch) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  supabase.from('posts').select('*').then(res => {
    console.log("POSTS:", JSON.stringify(res.data, null, 2));
    if(res.error) console.error(res.error);
  });
} else {
  console.log('Keys not found');
}
