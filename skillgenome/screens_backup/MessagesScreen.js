import * as React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Modal } from "react-native";
import { Color, FontFamily, FontSize, Padding, StyleVariable, Border } from "../GlobalStyles";
import { t } from "../utils/translations";

const MessagesScreen = ({
  onBack,
  onOpenConnections,
  onOpenCommunity,
  onOpenHome,
  onOpenThread,
  conversations = [],
  onMarkConversationRead,
  connectedFriends = [],
  onStartConversation,
  isDarkMode = true,
  language = 'English',
}) => {
  const [query, setQuery] = React.useState("");
  const [activeBottom, setActiveBottom] = React.useState(2);
  const [composeVisible, setComposeVisible] = React.useState(false);

  const styles = React.useMemo(() => getStyles(isDarkMode), [isDarkMode]);

  const filteredConversations = conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(query.toLowerCase()) ||
    conversation.preview.toLowerCase().includes(query.toLowerCase())
  );

  const handleConversationPress = (conversation) => {
    if (typeof onMarkConversationRead === "function") {
      onMarkConversationRead(conversation.id);
    }

    if (typeof onOpenThread === "function") {
      onOpenThread(conversation);
      return;
    }

    Alert.alert(conversation.name, `Open chat with ${conversation.name}.`);
  };

  const handleBottomPress = (index, label) => {
    setActiveBottom(index);

    if (index === 0) {
      if (typeof onOpenHome === "function") onOpenHome();
      else if (typeof onBack === "function") onBack();
      return;
    }

    if (index === 1) {
      if (typeof onOpenConnections === "function") onOpenConnections();
      else Alert.alert(label, "Open connections.");
      return;
    }

    if (index === 2) {
      return;
    }

    if (index === 3) {
      Alert.alert(label, "Profile screen is not wired yet.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => typeof onBack === "function" && onBack()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>{t(language, "chat")}</Text>
        <Pressable style={styles.editButton} onPress={() => setComposeVisible(true)}> 
          <Text style={styles.editIcon}>✏️</Text>
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔎</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={t(language, "searchMessagesPlaceholder")}
          placeholderTextColor={isDarkMode ? Color.colorBlue42 : "#64748b"}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>{t(language, "pinnedConversations")}</Text>

        <View style={styles.list}>
          {filteredConversations.map((conversation) => (
            <Pressable key={conversation.id} style={styles.row} onPress={() => handleConversationPress(conversation)}>
              <View style={[styles.avatar, { backgroundColor: conversation.color }]}>
                <Text style={styles.avatarText}>{conversation.name[0]}</Text>
              </View>

              <View style={styles.rowBody}>
                <View style={styles.rowTop}>
                  <Text style={styles.name}>{conversation.name}</Text>
                  <Text style={styles.time}>{conversation.time}</Text>
                </View>
                <Text style={styles.preview}>{conversation.preview}</Text>
              </View>

              <View style={styles.badgeWrap}>
                {conversation.badge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{conversation.badge}</Text>
                  </View>
                ) : null}
                {conversation.route ? (
                  <View style={styles.routePill}>
                    <Text style={styles.routePillText}>route</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={composeVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setComposeVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t(language, "startNewChat") || "New Chat"}</Text>
              <Pressable onPress={() => setComposeVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.composeList}>
              {connectedFriends.length === 0 ? (
                <View style={styles.noFriendsCard}>
                  <Text style={styles.noFriendsText}>
                    {t(language, "noConnectedFriends") || "You can only message users you are connected with."}
                  </Text>
                  <Pressable
                    style={styles.findFriendsBtn}
                    onPress={() => {
                      setComposeVisible(false);
                      if (typeof onOpenConnections === "function") onOpenConnections();
                    }}
                  >
                    <Text style={styles.findFriendsText}>{t(language, "findConnections") || "Find Connections"}</Text>
                  </Pressable>
                </View>
              ) : (
                connectedFriends.map((friend) => (
                  <Pressable
                    key={friend.id}
                    style={styles.friendRow}
                    onPress={() => {
                      setComposeVisible(false);
                      if (typeof onStartConversation === "function") {
                        onStartConversation(friend);
                      }
                    }}
                  >
                    <View style={styles.friendAvatar}>
                      <Text style={styles.friendAvatarText}>
                        {friend.name ? friend.name.charAt(0).toUpperCase() : "👤"}
                      </Text>
                    </View>
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <Text style={styles.friendTitle}>{friend.title || friend.role}</Text>
                    </View>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (isDarkMode) => {
  const bgStyle = isDarkMode ? (Color.colorBlue8 || "#060612") : "#f8fafc";
  const elementBg = isDarkMode ? (Color.colorAzure11 || "#1a1f30") : "#ffffff";
  const borderStyle = isDarkMode ? (Color.colorWhite7 || "rgba(255, 255, 255, 0.06)") : "#cbd5e1";
  const textPrimary = isDarkMode ? (Color.colorGrey97 || "#ffffff") : "#0f172a";
  const textSecondary = isDarkMode ? (Color.colorBlue42 || "#9AA0B2") : "#475569";
  const textTertiary = isDarkMode ? (Color.colorBlue65 || "#5a5a7a") : "#64748b";

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: bgStyle,
      paddingTop: 44,
    },
    header: {
      paddingHorizontal: Padding.padding_16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: elementBg,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: borderStyle,
    },
    backText: {
      color: textPrimary,
      fontSize: 18,
      fontWeight: StyleVariable.fontWeight700,
    },
    title: {
      color: textPrimary,
      fontSize: 28,
      fontFamily: FontFamily.soraBold,
      fontWeight: StyleVariable.fontWeight700,
    },
    editButton: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    editIcon: {
      fontSize: 18,
    },
    searchWrap: {
      marginHorizontal: Padding.padding_16,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: elementBg,
      borderRadius: Border.br_12,
      borderWidth: 1,
      borderColor: borderStyle,
      paddingHorizontal: 14,
      height: 44,
      marginBottom: 18,
    },
    searchIcon: {
      color: textSecondary,
      fontSize: 16,
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      color: textPrimary,
      fontFamily: FontFamily.soraRegular,
      fontSize: FontSize.size_13,
    },
    content: {
      paddingHorizontal: Padding.padding_16,
      paddingBottom: 110,
    },
    sectionLabel: {
      color: textSecondary,
      fontSize: FontSize.size_11,
      fontFamily: FontFamily.soraBold,
      letterSpacing: 1,
      marginBottom: 12,
    },
    list: {
      gap: 14,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: Color.colorWhiteSolid || "#ffffff",
      fontFamily: FontFamily.soraBold,
      fontSize: FontSize.size_16,
    },
    rowBody: {
      flex: 1,
      gap: 2,
    },
    rowTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    name: {
      color: textPrimary,
      fontFamily: FontFamily.soraBold,
      fontSize: FontSize.size_13,
      fontWeight: StyleVariable.fontWeight700,
    },
    time: {
      color: textTertiary,
      fontFamily: FontFamily.soraRegular,
      fontSize: FontSize.size_11,
    },
    preview: {
      color: textSecondary,
      fontFamily: FontFamily.soraRegular,
      fontSize: FontSize.size_11,
    },
    badgeWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    badge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      paddingHorizontal: 6,
      backgroundColor: Color.colorCyan50,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeText: {
      color: Color.colorBlue8 || "#060612",
      fontSize: 10,
      fontFamily: FontFamily.soraBold,
    },
    routePill: {
      backgroundColor: "#2D66FF",
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    routePillText: {
      color: Color.colorWhiteSolid || "#ffffff",
      fontSize: 10,
      fontFamily: FontFamily.soraBold,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "flex-end",
    },
    modalBox: {
      backgroundColor: bgStyle,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      maxHeight: "80%",
      borderWidth: 1,
      borderColor: borderStyle,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    modalTitle: {
      color: textPrimary,
      fontFamily: FontFamily.soraBold,
      fontSize: FontSize.size_16,
    },
    closeButton: {
      padding: 4,
    },
    closeText: {
      color: textSecondary,
      fontSize: 24,
    },
    composeList: {
      gap: 12,
    },
    noFriendsCard: {
      alignItems: "center",
      padding: 30,
      gap: 16,
    },
    noFriendsText: {
      color: textSecondary,
      textAlign: "center",
      fontSize: 13,
      fontFamily: FontFamily.soraRegular,
    },
    findFriendsBtn: {
      backgroundColor: Color.colorCyan50,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 12,
    },
    findFriendsText: {
      color: "#050508",
      fontFamily: FontFamily.soraBold,
      fontSize: 12,
    },
    friendRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: borderStyle,
    },
    friendAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#2D66FF",
      alignItems: "center",
      justifyContent: "center",
    },
    friendAvatarText: {
      color: "#ffffff",
      fontFamily: FontFamily.soraBold,
      fontSize: 16,
    },
    friendInfo: {
      flex: 1,
    },
    friendName: {
      color: textPrimary,
      fontFamily: FontFamily.soraBold,
      fontSize: 14,
    },
    friendTitle: {
      color: textSecondary,
      fontFamily: FontFamily.soraRegular,
      fontSize: 11,
    },
  });
};

export default MessagesScreen;
