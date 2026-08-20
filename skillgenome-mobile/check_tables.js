const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let content = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/utils/supabase.js', 'utf8');
let matchUrl = content.match(/const supabaseUrl = ['\"]([^'\"]+)['\"]/);
let matchKey = content.match(/const supabaseAnonKey = ['\"]([^'\"]+)['\"]/);

if (!matchUrl && !matchKey) {
  content = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', 'utf8');
  const regex = /createClient\(['\"]([^'\"]+)['\"],\s*['\"]([^'\"]+)['\"]/;
  const match = content.match(regex);
  if(match) {
    matchUrl = [null, match[1]];
    matchKey = [null, match[2]];
  }
}

if (matchUrl && matchKey) {
  const supabase = createClient(matchUrl[1], matchKey[1]);
  const tables = ['profiles', 'journals', 'emotions', 'resume_analyses', 'github_analyses', 'thought_analyses', 'applied_jobs', 'daily_quizzes', 'portfolio_projects', 'user_modules', 'genome_scores'];
  
  async function checkTables() {
    for (const t of tables) {
      const { error } = await supabase.from(t).select('*').limit(1);
      if (error && error.code === '42P01') {
        console.log('MISSING: ' + t);
      } else {
        console.log('EXISTS: ' + t);
      }
    }
  }
  checkTables();
} else {
  console.log('Credentials not found');
}
