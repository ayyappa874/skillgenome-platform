const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/components/MentorMessagesTab.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /.eq\('profile_id', activeChat.id\);/g,
  ".eq('user_id', activeChat.id);"
);

content = content.replace(
  /{ conversation_id: convId, profile_id: profile.id },/g,
  "{ conversation_id: convId, user_id: profile.id },"
);

content = content.replace(
  /{ conversation_id: convId, profile_id: activeChat.id }/g,
  "{ conversation_id: convId, user_id: activeChat.id }"
);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed all user_id column usages");
