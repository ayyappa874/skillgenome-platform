const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const code = fs.readFileSync('c:\\Users\\ASUS\\OneDrive\\Desktop\\skill genome\\skillgenome-mobile\\utils\\supabase.js', 'utf8');
const urlMatch = code.match(/supabaseUrl\s*=\s*['"]([^'"]+)['"]/);
const keyMatch = code.match(/supabaseAnonKey\s*=\s*['"]([^'"]+)['"]/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  supabase.from('mentorship_requests').select('id, mentor_id, student_id, status, profiles!student_id(name)').then(({data, error}) => {
    if (error) console.error(error);
    else console.log(data);
  });
} else {
  console.log("Could not find keys");
}
