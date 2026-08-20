const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let content = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/utils/supabase.js', 'utf8');
const regexUrl = /const SUPABASE_URL = ['"]([^'"]+)['"]/;
const regexKey = /const SUPABASE_ANON_KEY = ['"]([^'"]+)['"]/;
let matchUrl = content.match(regexUrl);
let matchKey = content.match(regexKey);

if (matchUrl && matchKey) {
  const supabase = createClient(matchUrl[1], matchKey[1]);
  async function check() {
    const { data: userAuth } = await supabase.auth.getUser();
    console.log("Current User:", userAuth?.user?.id || "None logged in via script (expected)");
    
    // fetch all resumes
    const { data, error } = await supabase.from('resume_analyses').select('*');
    console.log("Resume count:", data ? data.length : 0);
    if (data && data.length > 0) {
      console.log("Sample Data:", data[0]);
    } else {
      console.log("Error:", error);
    }
  }
  check();
} else {
  console.log('Credentials not found');
}
