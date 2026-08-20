const fs = require('fs');
const lines = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity-ide/brain/b0a81368-12f8-4fb1-8c55-e33c425b1bba/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('App.js:3335:           <CommunityFeed')) {
    try {
      const obj = JSON.parse(lines[i]);
      const content = obj.content || '';
      const startIndex = content.indexOf('App.js:3335:           <CommunityFeed');
      console.log(content.substring(startIndex, startIndex + 1500));
      break;
    } catch(e) {}
  }
}
