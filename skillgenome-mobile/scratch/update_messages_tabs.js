const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/MessagesScreen.js';
let content = fs.readFileSync(path, 'utf8');

// Add activeChatTab state
const stateRegex = /const \[composeVisible, setComposeVisible\] = React\.useState\(false\);/;
const stateNew = `const [composeVisible, setComposeVisible] = React.useState(false);
  const [activeChatTab, setActiveChatTab] = React.useState('Co-Students'); // 'Mentors' or 'Co-Students'`;
content = content.replace(stateRegex, stateNew);

// Create the Tabs UI under the Search Wrap
const searchWrapRegex = /<View style=\{styles\.searchWrap\}>[\s\S]*?<\/View>/;
const searchWrapMatch = content.match(searchWrapRegex);
if (searchWrapMatch) {
  const tabsUI = `
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, gap: 12 }}>
        <Pressable 
          style={[styles.tabBtn, activeChatTab === 'Co-Students' && styles.tabBtnActive]} 
          onPress={() => setActiveChatTab('Co-Students')}
        >
          <Text style={[styles.tabText, activeChatTab === 'Co-Students' && styles.tabTextActive]}>{t(language, "coStudents") || "Co-Students"}</Text>
        </Pressable>
        <Pressable 
          style={[styles.tabBtn, activeChatTab === 'Mentors' && styles.tabBtnActive]} 
          onPress={() => setActiveChatTab('Mentors')}
        >
          <Text style={[styles.tabText, activeChatTab === 'Mentors' && styles.tabTextActive]}>{t(language, "mentors") || "Mentors"}</Text>
        </Pressable>
      </View>
`;
  content = content.replace(searchWrapRegex, searchWrapMatch[0] + tabsUI);
}

// Modify the filtered list to show nothing or a placeholder when Mentors is selected, or let App.js pass mentor conversations
// For now, if "Mentors", we filter `conversations` if they have a `isMentor` flag. Wait, let's just use a hardcoded Mentor conversation or filter by `isMentor`.
const filteredRegex = /const filteredConversations = conversations\.filter\(\(conversation\) =>\s*conversation\.name\.toLowerCase\(\)\.includes\(query\.toLowerCase\(\)\) \|\|\s*conversation\.preview\.toLowerCase\(\)\.includes\(query\.toLowerCase\(\)\)\s*\);/;

const filteredNew = `const filteredConversations = conversations.filter((conversation) => {
    const matchesSearch = conversation.name.toLowerCase().includes(query.toLowerCase()) || conversation.preview.toLowerCase().includes(query.toLowerCase());
    if (activeChatTab === 'Mentors') {
      return matchesSearch && conversation.isMentor;
    } else {
      return matchesSearch && !conversation.isMentor;
    }
  });`;

content = content.replace(filteredRegex, filteredNew);

// Add styles
const stylesRegex = /container: \{/;
const stylesNew = `container: {
    },
    tabBtn: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "#cbd5e1",
      backgroundColor: isDarkMode ? "#1a1f30" : "#ffffff",
    },
    tabBtnActive: {
      backgroundColor: isDarkMode ? "#7c3aed" : "#7c3aed",
      borderColor: "#7c3aed",
    },
    tabText: {
      color: isDarkMode ? "#9AA0B2" : "#64748b",
      fontWeight: "600",
      fontSize: 14,
    },
    tabTextActive: {
      color: "#ffffff",
    `;
content = content.replace(stylesRegex, stylesNew);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated MessagesScreen.js");
