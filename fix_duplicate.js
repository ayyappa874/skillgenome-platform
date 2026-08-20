const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', 'utf8');

const lines = content.split('\n');

// Find the duplicated currentScreen 15
let duplicateStart = -1;
for (let i = 3400; i < lines.length; i++) {
  if (lines[i].includes('{currentScreen === 15 && (')) {
    duplicateStart = i;
    break;
  }
}

if (duplicateStart !== -1) {
  // Find the end of this duplicate block, which is right before currentScreen === 23
  let duplicateEnd = -1;
  for (let i = duplicateStart; i < lines.length; i++) {
    if (lines[i].includes('{currentScreen === 23 && (')) {
      duplicateEnd = i;
      break;
    }
  }

  if (duplicateEnd !== -1) {
    // Delete the duplicate block and replace the CommunityFeed prop
    lines.splice(duplicateStart, duplicateEnd - duplicateStart);
    console.log('Removed duplicate block');
    
    // Now fix posts={communityPosts} to posts={posts}
    let found = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('posts={communityPosts}')) {
        lines[i] = lines[i].replace('posts={communityPosts}', 'posts={posts}');
        found = true;
      }
    }
    
    if (found) {
      console.log('Replaced posts={communityPosts}');
    } else {
      console.log('posts={communityPosts} not found! Maybe it is already posts={posts} or something else?');
    }
    
    fs.writeFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', lines.join('\n'));
    console.log('App.js fixed!');
  }
}
