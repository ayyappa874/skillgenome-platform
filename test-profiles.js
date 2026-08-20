const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function check() {
  try {
    const configPath = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/utils/supabase.js';
    const content = fs.readFileSync(configPath, 'utf8');
    const urlMatch = content.match(/SUPABASE_URL = ['"](.*?)['"]/);
    const keyMatch = content.match(/SUPABASE_ANON_KEY = ['"](.*?)['"]/);
    
    if (urlMatch && keyMatch) {
      const supabase = createClient(urlMatch[1], keyMatch[1]);
      const { data, error } = await supabase.from('profiles').select('name, skills, role, title, id, target_role, location');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch(e) {
    console.error(e);
  }
}
check();
