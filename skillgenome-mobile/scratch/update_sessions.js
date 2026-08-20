const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/components/MentorSessionsTab.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Modal import if missing
if (!content.includes('Modal,')) {
  content = content.replace(
    "import { View, Text, StyleSheet, Pressable, ScrollView, Alert, TextInput } from 'react-native';",
    "import { View, Text, StyleSheet, Pressable, ScrollView, Alert, TextInput, Modal } from 'react-native';"
  );
}

// 2. Add handleDeleteSession function
const handleCreateSession = `  const handleCreateSession = async () => {`;
const handleDeleteSession = `  const handleDeleteSession = async (sessionId) => {
    Alert.alert("Delete Session", "Are you sure you want to delete this session?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            const { error } = await supabase.from('mentor_sessions').delete().eq('id', sessionId);
            if (error) throw error;
            fetchSessions();
          } catch (err) {
            Alert.alert("Error", err.message);
          }
      }}
    ]);
  };

  const handleCreateSession = async () => {`;
content = content.replace(handleCreateSession, handleDeleteSession);

// 3. Add Delete Button to Card Footer
const cardFooterOld = `              <View style={S.cardFooter}>
                <Text style={{ color: T.muted, fontSize: 13 }}>📅 {new Date(s.scheduled_for).toLocaleString()}</Text>
                {s.status === 'Scheduled' && (
                  <Pressable style={[S.joinBtn, { backgroundColor: T.surface2, borderColor: T.border }]} onPress={() => onJoinLive && onJoinLive(s)}>
                    <Text style={{ color: T.text, fontWeight: '700', fontSize: 13 }}>Enter Live Room</Text>
                  </Pressable>
                )}
              </View>`;
              
// If the emoji 📅 got mangled (e.g. Y".) I will use a generic regex replacement
const cardFooterRegex = /<View style=\{S\.cardFooter\}>[\s\S]*?<\/View>/;
const cardFooterNew = `<View style={S.cardFooter}>
                <Text style={{ color: T.muted, fontSize: 13 }}>📅 {new Date(s.scheduled_for).toLocaleString()}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable style={[S.joinBtn, { backgroundColor: T.surface2, borderColor: T.border }]} onPress={() => handleDeleteSession(s.id)}>
                    <Text style={{ color: T.red, fontWeight: '700', fontSize: 13 }}>Delete</Text>
                  </Pressable>
                  {s.status === 'Scheduled' && (
                    <Pressable style={[S.joinBtn, { backgroundColor: T.surface2, borderColor: T.border }]} onPress={() => onJoinLive && onJoinLive(s)}>
                      <Text style={{ color: T.text, fontWeight: '700', fontSize: 13 }}>Enter Live Room</Text>
                    </Pressable>
                  )}
                </View>
              </View>`;
content = content.replace(cardFooterRegex, cardFooterNew);

// 4. Change View overlay to Modal
const modalOld = `{showCreate && (
        <View style={S.modalOverlay}>`;
const modalNew = `<Modal visible={showCreate} transparent animationType="fade">
        <View style={S.modalOverlay}>`;
content = content.replace(modalOld, modalNew);

const modalEndOld = `          </View>
        </View>
      )}`;
const modalEndNew = `          </View>
        </View>
      </Modal>`;
content = content.replace(modalEndOld, modalEndNew);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated MentorSessionsTab.js");
