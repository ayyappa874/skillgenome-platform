import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Modal } from "react-native";
import { Color, FontFamily, FontSize, Padding, Border, StyleVariable } from "../GlobalStyles";
import { t } from "../utils/translations";

const StudyGroupScreen = ({ 
  onBack, 
  connections: connectionsProp, 
  onSendInvites, 
  onDeleteChat, 
  onSendMessage, 
  studyGroup, 
  setStudyGroup, 
  studyGroupMessages, 
  setStudyGroupMessages,
  isDarkMode = true,
  language = 'English'
}) => {
  const [messageText, setMessageText] = React.useState("");

  // Use study group data passed from App.js (persisted across navigation)
  const group = studyGroup || { name: "Study Group", memberCount: 1, onlineCount: 1, members: ["Y"] };
  const messages = studyGroupMessages || [];

  const [inviteVisible, setInviteVisible] = React.useState(false);
  const connections = connectionsProp || [];
  const [selectedConnections, setSelectedConnections] = React.useState([]);

  const toggleConnection = (id) => {
    setSelectedConnections((prev) => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleSendInvites = () => {
    if (selectedConnections.length === 0) {
      Alert.alert("No selection", "Select at least one connection to invite.");
      return;
    }

    const invitedNames = connections.filter(c => selectedConnections.includes(c.id)).map(c => c.name);

    // Clear the chat messages and add a system message announcing the invites
    const systemMsg = {
      id: Date.now(),
      author: "System",
      time: new Date().toISOString(),
      text: `Invited: ${invitedNames.join(", ")}`,
      system: true,
    };
    if (typeof setStudyGroupMessages === "function") setStudyGroupMessages([systemMsg]);
    // Clear composer input as requested
    setMessageText("");

    // Remove "ML" from the group name if present
    if (typeof setStudyGroup === "function") {
      setStudyGroup(prev => ({ ...prev, name: (prev?.name || "").replace(/\bML\b/gi, "").trim() || "Study Group" }));
    }

    setInviteVisible(false);
    setSelectedConnections([]);
    // Call external handler if provided so App.js can route real invites/notifications
    if (typeof onSendInvites === "function") {
      try { onSendInvites(selectedConnections); } catch (e) { /* ignore */ }
    }

    Alert.alert("Invitations sent", `Invited: ${invitedNames.join(", ")}`);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    if (typeof onSendMessage === "function") {
      onSendMessage(messageText);
    } else {
      const newMessage = {
        id: Date.now(),
        author: "You",
        avatar: "Y",
        time: new Date().toISOString(),
        text: messageText,
        isOwn: true,
      };

      if (typeof setStudyGroupMessages === "function") {
        setStudyGroupMessages([...(messages || []), newMessage]);
      }
    }
    setMessageText("");
  };

  const handleDeleteChat = () => {
    Alert.alert(
      "Delete chat",
      "This will remove all messages in the study group chat.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (typeof setStudyGroupMessages === "function") setStudyGroupMessages([]);
            setMessageText("");
            if (typeof onDeleteChat === "function") {
              try { onDeleteChat(); } catch (e) { /* ignore */ }
            }
          }
        }
      ]
    );
  };

  const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  };

  const getDateLabel = (date) => {
    const now = new Date();
    if (isSameDay(date, now)) return "Today";
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (isSameDay(date, yesterday)) return "Yesterday";
    return date.toLocaleDateString();
  };

  // Theme overrides
  const bgStyle = isDarkMode ? Color.colorBlue8 || '#060612' : '#f8fafc';
  const cardBg = isDarkMode ? Color.colorBlue11 || '#1a1f30' : '#ffffff';
  const borderStyle = isDarkMode ? Color.colorWhite7 || 'rgba(255, 255, 255, 0.07)' : '#cbd5e1';
  const textPrimary = isDarkMode ? Color.colorWhiteSolid || '#ffffff' : '#0f172a';
  const textSecondary = isDarkMode ? Color.colorBlue42 || '#94a3b8' : '#475569';
  const inputBg = isDarkMode ? Color.colorBlue11 || '#1a1f30' : '#ffffff';
  const headerBg = isDarkMode ? Color.colorBlue8 || '#060612' : '#ffffff';
  const listBorderColor = isDarkMode ? Color.colorWhite7 || 'rgba(255, 255, 255, 0.07)' : '#e2e8f0';

  return (
    <View style={[styles.container, { backgroundColor: bgStyle }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <Pressable style={[styles.backButton, { backgroundColor: isDarkMode ? Color.colorAzure11 : '#e2e8f0' }]} onPress={() => typeof onBack === "function" && onBack()}>
          <Text style={[styles.backText, { color: textPrimary }]}>←</Text>
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={[styles.groupName, { color: textPrimary }]}>{group.name}</Text>
          <Text style={[styles.groupInfo, { color: textSecondary }]}>{group.memberCount} members, {group.onlineCount} online</Text>
        </View>
        <Pressable style={styles.moreButton} onPress={() => Alert.alert("Options", "Choose an action", [
          { text: t(language, "cancel"), style: "cancel" },
          { text: t(language, "deleteChat"), style: "destructive", onPress: handleDeleteChat },
        ])}>
          <Text style={[styles.moreText, { color: textSecondary }]}>...</Text>
        </Pressable>
      </View>

      {/* Members - dynamic list of joined connected people */}
      <View style={styles.membersRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {group.members.map((name, i) => {
            const initials = name === "You" ? "Y" : name.charAt(0).toUpperCase();
            return (
              <View key={i} style={[styles.memberAvatar, { backgroundColor: name === "You" ? "#9B5BFF" : "#3b82f6" }]}> 
                <Text style={styles.memberInitial}>{initials}</Text>
              </View>
            );
          })}
          <Pressable style={styles.inviteButton} onPress={() => { setMessageText(""); setInviteVisible(true); }}>
            <Text style={styles.inviteText}>+</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Invite Modal UI */}
      <Modal visible={inviteVisible} transparent animationType="slide" onRequestClose={() => setInviteVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: bgStyle, borderTopColor: borderStyle, borderTopWidth: 1 }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>{t(language, "inviteConnections")}</Text>
            <ScrollView style={styles.connectionsList}>
              {connections.length === 0 ? (
                <View style={{ alignItems: 'center', padding: 24 }}>
                  <Text style={{ color: textSecondary, textAlign: 'center', fontSize: 13, lineHeight: 18 }}>
                    You can only invite users who you are connected with. Connect with other students or mentors first!
                  </Text>
                </View>
              ) : (
                connections.map((c) => (
                  <Pressable key={c.id} style={[styles.connectionRow, { borderBottomColor: listBorderColor }, selectedConnections.includes(c.id) && { backgroundColor: isDarkMode ? (Color.colorBlue19 || '#232840') : '#e2e8f0' }]} onPress={() => toggleConnection(c.id)}>
                    <Text style={[styles.connectionName, { color: textPrimary }]}>{c.name}</Text>
                    <Text style={styles.connectionCheck}>{selectedConnections.includes(c.id) ? '✓' : ''}</Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setInviteVisible(false)}>
                <Text style={[styles.modalCancelText, { color: textSecondary }]}>{t(language, "cancel")}</Text>
              </Pressable>
              <Pressable style={styles.modalSend} onPress={handleSendInvites}>
                <Text style={styles.modalSendText}>{t(language, "sendInvites")}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Active Challenge removed per request */}

      {/* Messages */}
      <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>

        {messages.map((message, idx) => {
          const msgDate = message.time ? new Date(message.time) : new Date();
          const prev = messages[idx - 1];
          const showDate = !prev || !isSameDay(msgDate, new Date(prev.time));
          return (
            <View key={message.id}>
              {showDate && <Text style={[styles.dateLabel, { color: textSecondary }]}>{getDateLabel(msgDate)}</Text>}
              <View style={[styles.messageRow, message.isOwn && styles.messageRowOwn]}>
                {!message.isOwn && (
                  <View style={styles.messageAvatarSmall}>
                    <Text style={styles.messageAvatarText}>{message.avatar}</Text>
                  </View>
                )}

                {message.resource ? (
                  <View style={[styles.messageBubble, styles.resourceBubble, { backgroundColor: isDarkMode ? Color.colorBlue19 : '#f1f5f9', borderColor: borderStyle }]}>
                    <Text style={styles.resourceIcon}>📚</Text>
                    <View>
                      <Text style={[styles.resourceTitle, { color: textSecondary }]}>Resource shared by {message.author}</Text>
                      <Text style={styles.resourceName}>{message.text}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={[styles.messageBubble, { backgroundColor: cardBg }, message.isOwn && styles.messageBubbleOwn]}>
                    <Text style={[styles.messageText, { color: textPrimary }, message.isOwn && styles.messageTextOwn]}>{message.text}</Text>
                    <Text style={[styles.messageTime, { color: textSecondary }, message.isOwn && styles.messageTimeOwn]}>{new Date(message.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Message Composer */}
      <View style={[styles.composerContainer, { borderTopColor: borderStyle }]}>
        <View style={styles.composerRow}>
          <Pressable style={styles.attachButton}>
            <Text style={[styles.attachIcon, { color: textSecondary }]}>📎</Text>
          </Pressable>

          <TextInput
            style={[styles.composerInput, { backgroundColor: inputBg, color: textPrimary, borderColor: borderStyle, borderWidth: isDarkMode ? 0 : 1 }]}
            placeholder={t(language, "messagePlaceholderStudyGroup")}
            placeholderTextColor={textSecondary}
            value={messageText}
            onChangeText={setMessageText}
          />

          <Pressable style={styles.emojiButton}>
            <Text style={[styles.emojiIcon, { color: textSecondary }]}>😊</Text>
          </Pressable>

          <Pressable style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendIcon}>➤</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.colorBlue8,
  },
  header: {
    paddingTop: 64,
    paddingHorizontal: Padding.padding_20,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Color.colorAzure11,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: Color.colorGrey97,
    fontSize: 18,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  groupName: {
    color: Color.colorWhiteSolid,
    fontFamily: FontFamily.soraBold,
    fontSize: FontSize.size_16,
    fontWeight: StyleVariable.fontWeight700,
  },
  groupInfo: {
    color: Color.colorBlue42,
    fontSize: FontSize.size_11,
    marginTop: 2,
  },
  moreButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  moreText: {
    color: Color.colorBlue42,
    fontSize: 18,
  },
  membersRow: {
    paddingHorizontal: Padding.padding_16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  memberInitial: {
    color: Color.colorWhiteSolid,
    fontWeight: StyleVariable.fontWeight700,
    fontSize: FontSize.size_16,
  },
  inviteButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Color.colorCyan50,
    alignItems: "center",
    justifyContent: "center",
  },
  inviteText: {
    color: Color.colorWhiteSolid,
    fontSize: 24,
    fontWeight: StyleVariable.fontWeight800,
  },
  youPill: {
    marginLeft: 12,
    backgroundColor: Color.colorBlue11,
    borderRadius: Border.br_14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Color.colorWhite7,
    alignItems: "center",
    justifyContent: "center",
  },
  youPillText: {
    color: Color.colorGrey97,
    fontSize: FontSize.size_11,
  },
  challengeCard: {
    marginHorizontal: Padding.padding_16,
    backgroundColor: Color.colorBlue19,
    borderRadius: Border.br_12,
    borderWidth: 1,
    borderColor: Color.colorCyan50,
    padding: 12,
    marginBottom: 16,
  },
  challengeLabel: {
    color: Color.colorCyan50,
    fontSize: FontSize.size_11,
    marginBottom: 4,
  },
  challengeTitle: {
    color: Color.colorWhiteSolid,
    fontSize: FontSize.size_13,
    fontWeight: StyleVariable.fontWeight700,
    marginBottom: 4,
  },
  challengeProgress: {
    color: Color.colorBlue42,
    fontSize: FontSize.size_11,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: Padding.padding_16,
    paddingVertical: 12,
  },
  dateLabel: {
    color: Color.colorBlue42,
    fontSize: FontSize.size_11,
    textAlign: "center",
    marginBottom: 12,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
    gap: 8,
  },
  messageRowOwn: {
    justifyContent: "flex-end",
  },
  messageAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Color.colorCyan50,
    alignItems: "center",
    justifyContent: "center",
  },
  messageAvatarText: {
    color: Color.colorBlue8,
    fontWeight: StyleVariable.fontWeight700,
    fontSize: FontSize.size_11,
  },
  messageBubble: {
    backgroundColor: Color.colorBlue11,
    borderRadius: Border.br_12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: "75%",
  },
  messageBubbleOwn: {
    backgroundColor: Color.colorCyan50,
  },
  messageText: {
    color: Color.colorGrey97,
    fontSize: FontSize.size_13,
  },
  messageTextOwn: {
    color: Color.colorBlue8,
  },
  messageTime: {
    color: Color.colorBlue42,
    fontSize: FontSize.size_9,
    marginTop: 4,
  },
  messageTimeOwn: {
    color: "rgba(0, 0, 100, 0.6)",
  },
  resourceBubble: {
    backgroundColor: Color.colorBlue19,
    borderWidth: 1,
    borderColor: Color.colorCyan50,
    padding: 12,
    maxWidth: "85%",
  },
  resourceIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  resourceTitle: {
    color: Color.colorBlue42,
    fontSize: FontSize.size_10,
  },
  resourceName: {
    color: Color.colorCyan50,
    fontSize: FontSize.size_12,
    marginTop: 4,
    fontWeight: StyleVariable.fontWeight700,
  },
  composerContainer: {
    paddingHorizontal: Padding.padding_16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Color.colorBlue11,
  },
  composerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  attachButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  attachIcon: {
    fontSize: 20,
  },
  composerInput: {
    flex: 1,
    backgroundColor: Color.colorBlue11,
    borderRadius: Border.br_20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Color.colorWhiteSolid,
    fontSize: FontSize.size_13,
  },
  emojiButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  /* Invite modal styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: Color.colorBlue8,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "60%",
  },
  modalTitle: {
    color: Color.colorGrey97,
    fontSize: FontSize.size_16,
    fontFamily: FontFamily.soraBold,
    marginBottom: 8,
  },
  connectionsList: {
    maxHeight: 220,
  },
  connectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Color.colorWhite7,
  },
  connectionRowSelected: {
    backgroundColor: Color.colorBlue19,
  },
  connectionName: {
    color: Color.colorGrey97,
    fontSize: FontSize.size_13,
  },
  connectionCheck: {
    color: Color.colorCyan50,
    fontSize: FontSize.size_13,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 12,
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  modalCancelText: {
    color: Color.colorBlue42,
  },
  modalSend: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Color.colorCyan50,
    borderRadius: Border.br_8,
  },
  modalSendText: {
    color: Color.colorBlue8,
    fontWeight: StyleVariable.fontWeight700,
  },
  emojiIcon: {
    fontSize: 20,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Color.colorCyan50,
    alignItems: "center",
    justifyContent: "center",
  },
  sendIcon: {
    color: Color.colorBlue8,
    fontSize: 18,
    fontWeight: StyleVariable.fontWeight700,
  },
});

export default StudyGroupScreen;
