const fs = require('fs');
const supabaseJS = fs.readFileSync('utils/supabase.js', 'utf8');
const urlMatch = supabaseJS.match(/const supabaseUrl = ['"]([^'"]+)['"]/);
const keyMatch = supabaseJS.match(/const supabaseAnonKey = ['"]([^'"]+)['"]/);
if (urlMatch && keyMatch) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  
  async function run() {
    try {
      const { data: { user }, error: authErr } = await supabase.auth.signInWithPassword({
        email: 'app@example.com',
        password: 'password'
      });
      
      if (authErr) {
         console.log("Auth err", authErr);
      }
      
      let uid = user ? user.id : '00000000-0000-0000-0000-000000000000';
      const res = await supabase.from('posts').insert([{
        author_id: uid,
        content: 'test',
        skills_tags: ['__VISIBILITY_connections__']
      }]);
      console.log('Result:', JSON.stringify(res, null, 2));
      fs.writeFileSync('insert_error.log', JSON.stringify(res, null, 2));
    } catch(e) {
      console.error(e);
      fs.writeFileSync('insert_error.log', e.toString());
    }
  }
  run();
}
