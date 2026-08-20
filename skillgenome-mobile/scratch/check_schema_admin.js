const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseFile = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/utils/supabase.js', 'utf8');
const urlMatch = supabaseFile.match(/const supabaseUrl = ['"]([^'"]+)['"]/);
const keyMatch = supabaseFile.match(/const supabaseAnonKey = ['"]([^'"]+)['"]/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  
  async function test() {
    console.log('-- cohorts schema --');
    const { data: c, error: cerr } = await supabase.from('cohorts').select('*').limit(1);
    console.log(c, cerr ? cerr.message : '');
    
    console.log('-- approved_skills schema --');
    const { data: s, error: serr } = await supabase.from('approved_skills').select('*').limit(1);
    console.log(s, serr ? serr.message : '');

    console.log('-- posts schema --');
    const { data: p, error: perr } = await supabase.from('posts').select('*').limit(1);
    console.log(p, perr ? perr.message : '');

    console.log('-- profiles schema --');
    const { data: pr, error: prerr } = await supabase.from('profiles').select('*').limit(1);
    console.log(pr, prerr ? prerr.message : '');
  }
  
  test();
} else {
  console.log('Credentials not found');
}
