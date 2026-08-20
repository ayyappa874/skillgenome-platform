const fs = require('fs');
const supabaseJS = fs.readFileSync('utils/supabase.js', 'utf8');
const urlMatch = supabaseJS.match(/const SUPABASE_URL = ['"]([^'"]+)['"]/);
const keyMatch = supabaseJS.match(/const SUPABASE_ANON_KEY = ['"]([^'"]+)['"]/);
if (urlMatch && keyMatch) {
  const url = urlMatch[1];
  const key = keyMatch[1];
  
  // Need to use user credentials to bypass RLS, so let's use the fetch REST endpoint
  // Wait, without auth, we can't insert into posts probably because of RLS.
  // We can try to authenticate first.
  fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'app@example.com',
      password: 'password'
    })
  }).then(r => r.json()).then(authData => {
    if (!authData.access_token) {
        console.log("Auth failed:", authData);
        return;
    }
    fetch(`${url}/rest/v1/posts`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        author_id: authData.user.id,
        content: 'test connections post',
        skills_tags: ['__VISIBILITY_connections__']
      })
    }).then(r => r.json()).then(data => {
      console.log("Insert Response:", JSON.stringify(data, null, 2));
    });
  }).catch(e => console.error(e));
} else {
  console.log("Regex failed to find keys");
}
