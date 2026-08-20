import * as React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Color, FontFamily, FontSize, Padding, StyleVariable, Border } from "../GlobalStyles";

const ChatThreadScreen = ({conversation,
  messages = [],
  onBack,
  onSendMessage,
  onDeleteConversation,
  isDarkMode = true,
  language = 'English',
}) => {
  const [message, setMessage] = React.useState("");

  const styles = React.useMemo(() => getStyles(isDarkMode), [isDarkMode]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    if (typeof onSendMessage === "function" && conversation?.id) {
      onSendMessage(conversation.id, trimmed);
    }

    setMessage("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => typeof onBack === "function" && onBack()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>{conversation?.name || "Chat"}</Text>
        <Pressable
          style={styles.moreButton}
          onPress={() =>
            Alert.alert("Thread options", "What do you want to do?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete chat",
                style: "destructive",
                onPress: () => {
                  if (typeof onDeleteConversation === "function" && conversation?.id) {
                    onDeleteConversation(conversation.id);
                  }
                },
              },
            ])
          }
        > 
          <Text style={styles.moreText}>•••</Text>
        </Pressable>
      </View>

      <Text style={styles.today}>Today</Text>

      <ScrollView contentContainerStyle={styles.threadContent} showsVerticalScrollIndicator={false}>
        {messages.map((item) => (
          <View
            key={item.id}
            style={[styles.bubbleRow, item.fromMe ? styles.rightRow : styles.leftRow]}
          >
            <View style={[styles.bubble, item.fromMe ? styles.meBubble : styles.themBubble]}>
              <Text style={[styles.bubbleText, item.fromMe && styles.meBubbleText]}>{item.text}</Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        ))}

        <View style={styles.typingRow}>
          <View style={styles.typingDots}>
            <Text style={styles.typingDotsText}>•••</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.composerRow}>
        <Pressable style={styles.attachButton} onPress={() => Alert.alert("Notice", "Attachment action is ready.")}> 
          <Text style={styles.attachIcon}>📎</Text>
        </Pressable>

        <TextInput
          style={styles.input}
          placeholder="Text a message..."
          placeholderTextColor={isDarkMode ? Color.colorBlue42 : "#64748b"}
          value={message}
          onChangeText={setMessage}
        />

        <Pressable style={styles.emojiButton} onPress={() => Alert.alert("Notice", "Emoji picker can be wired here.")}> 
          <Text style={styles.emojiIcon}>😊</Text>
        </Pressable>

        <Pressable style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendIcon}>➤</Text>
        </Pressable>
      </View>
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
      marginBottom: 20,
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
      fontFamily: FontFamily.soraBold,
      fontSize: FontSize.size_16,
      fontWeight: StyleVariable.fontWeight700,
    },
    moreButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: elementBg,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: borderStyle,
    },
    moreText: {
      color: textPrimary,
      fontSize: 14,
      letterSpacing: 2,
      fontWeight: StyleVariable.fontWeight700,
    },
    today: {
      textAlign: "center",
      color: textSecondary,
      fontFamily: FontFamily.soraRegular,
      fontSize: FontSize.size_11,
      marginBottom: 14,
    },
    threadContent: {
      paddingHorizontal: Padding.padding_16,
      paddingBottom: 120,
      gap: 12,
    },
    bubbleRow: {
      gap: 4,
      maxWidth: "82%",
    },
    leftRow: {
      alignSelf: "flex-start",
    },
    rightRow: {
      alignSelf: "flex-end",
    },
    bubble: {
      borderRadius: 18,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
    },
    meBubble: {
      backgroundColor: "#5A67F2",
      borderColor: "rgba(255,255,255,0.08)",
    },
    themBubble: {
      backgroundColor: elementBg,
      borderColor: borderStyle,
    },
    bubbleText: {
      color: textPrimary,
      fontFamily: FontFamily.soraRegular,
      fontSize: FontSize.size_13,
      lineHeight: 18,
    },
    meBubbleText: {
      color: Color.colorWhiteSolid || "#ffffff",
    },
    time: {
      color: textTertiary,
      fontFamily: FontFamily.soraRegular,
      fontSize: FontSize.size_11,
    },
    typingRow: {
      alignSelf: "flex-start",
    },
    typingDots: {
      width: 52,
      height: 28,
      borderRadius: 14,
      backgroundColor: elementBg,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: borderStyle,
    },
    typingDotsText: {
      color: textSecondary,
      fontSize: 16,
    },
    composerRow: {
      position: "absolute",
      left: 12,
      right: 12,
      bottom: 18,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: Padding.padding_16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: borderStyle,
      borderRadius: Border.br_18,
      backgroundColor: bgStyle,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDarkMode ? 0.22 : 0.08,
      shadowRadius: 14,
      elevation: 8,
    },
    attachButton: {
      width: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    attachIcon: {
      fontSize: 18,
      color: textSecondary,
    },
    input: {
      flex: 1,
      height: 42,
      borderRadius: 21,
      backgroundColor: elementBg,
      borderWidth: 1,
      borderColor: borderStyle,
      color: textPrimary,
      paddingHorizontal: 16,
      fontFamily: FontFamily.soraRegular,
      fontSize: FontSize.size_13,
    },
    emojiButton: {
      width: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    emojiIcon: {
      fontSize: 18,
    },
    sendButton: {
      width: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    sendIcon: {
      color: Color.colorCyan50,
      fontSize: 18,
      transform: [{ rotate: "-90deg" }],
    },
  });
};

export default ChatThreadScreen;
