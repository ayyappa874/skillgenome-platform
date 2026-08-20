const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', 'utf8');

const targetStr = `  const handleCreateStudyGroup = async (groupData, selectedIds = []) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('study_groups')
        .insert([{
          name: groupData.name || 'New Study Group',
          challenge: groupData.challenge || 'General Discussion',`;

const replacementStr = `  const handleCreateStudyGroup = async (groupData, selectedIds = []) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const groupName = typeof groupData === 'string' ? groupData : (groupData.name || 'New Study Group');
      const groupChallenge = typeof groupData === 'object' ? (groupData.challenge || 'General Discussion') : 'General Discussion';

      const { data, error } = await supabase
        .from('study_groups')
        .insert([{
          name: groupName,
          challenge: groupChallenge,`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', content);
  console.log('Fixed handleCreateStudyGroup');
} else {
  console.log('Target string not found');
}
