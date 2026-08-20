import * as React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Color, FontFamily, FontSize, Padding, Border, StyleVariable } from "../GlobalStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultPost = {
  title: "Hey is a career development topics career as yourselves homentonics and process",
  tags: ["Skill development", "Solutionisting", "Development"],
  likes: 12,
  comments: 28,
  shares: 12,
  author: "Namer Maith",
  handle: "SkillGenome 377",
  authorTags: ["Skill Development", "Scraft development", "Career development"],
};

const Screen29 = ({ onBack, post = defaultPost, onAddComment, currentUser = "You", isDarkMode = true, language = 'English' }) => {
  const normalizedPost = {
    ...defaultPost,
    ...post,
    tags: Array.isArray(post?.tags) ? post.tags : Array.isArray(post?.skills) ? post.skills : defaultPost.tags,
    authorTags: Array.isArray(post?.authorTags) ? post.authorTags : defaultPost.authorTags,
    likes: typeof post?.likes === "number" ? post.likes : defaultPost.likes,
    comments: typeof post?.comments === "number" ? post.comments : defaultPost.comments,
    shares: typeof post?.shares === "number" ? post.shares : defaultPost.shares,
    title: post?.title || post?.content || defaultPost.title,
    author: post?.author || defaultPost.author,
    handle: post?.handle || defaultPost.handle,
  };
  const postKey = `comments_${post?.id || 'default'}`;
  const [comment, setComment] = React.useState("");
  const [replyCommentId, setReplyCommentId] = React.useState(null);
  const [replyText, setReplyText] = React.useState("");
  // Start with EMPTY comments - no static fake ones
  const [comments, setComments] = React.useState([]);

  // Load persisted comments for this post on mount
  React.useEffect(() => {
    const loadComments = async () => {
      try {
        const stored = await AsyncStorage.getItem(postKey);
        if (stored) setComments(JSON.parse(stored));
      } catch (e) {}
    };
    loadComments();
  }, [postKey]);

  const styles = React.useMemo(() => getStyles(isDarkMode), [isDarkMode]);

  const showMenu = () => {
    Alert.alert("Post options", "Choose an action", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete post", style: "destructive", onPress: () => Alert.alert("Delete", "Hook this to your delete action if needed.") },
    ]);
  };

  const handleSendComment = async () => {
    const trimmed = comment.trim();
    if (!trimmed) return;

    const nextComment = {
      id: Date.now(),
      author: currentUser || "You",
      text: trimmed,
      time: "just now",
      replies: [],
    };

    const updatedComments = [nextComment, ...comments];
    setComments(updatedComments);

    // Persist comments to AsyncStorage so they survive navigation
    try {
      await AsyncStorage.setItem(postKey, JSON.stringify(updatedComments));
    } catch (e) {}

    if (typeof onAddComment === "function") {
      onAddComment(trimmed);
    }
    setComment("");
  };

  const handleSendReply = async (commentId) => {
    const trimmed = replyText.trim();
    if (!trimmed) return;

    const nextReply = {
      id: Date.now(),
      author: currentUser || "You",
      text: trimmed,
      time: "just now",
    };

    const updatedComments = comments.map((item) =>
      item.id === commentId
        ? { ...item, replies: [nextReply, ...(item.replies || [])] }
        : item
    );
    setComments(updatedComments);

    // Persist replies too
    try {
      await AsyncStorage.setItem(postKey, JSON.stringify(updatedComments));
    } catch (e) {}

    setReplyText("");
    setReplyCommentId(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => typeof onBack === "function" && onBack()}>
          <Text style={styles.iconText}>←</Text>
        </Pressable>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconButtonSmall} onPress={showMenu}>
            <Text style={styles.iconTextSmall}>🔖</Text>
          </Pressable>
          <Pressable style={styles.iconButtonSmall} onPress={showMenu}>
            <Text style={styles.iconTextSmall}>...</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroImageWrap}>
          <View style={styles.heroImage}>
            <Text style={styles.heroEmoji}>🖼</Text>
          </View>
        </View>

        <Text style={styles.title}>{normalizedPost.title}</Text>

        <View style={styles.tagRow}>
          {normalizedPost.tags.map((tag) => (
            <View key={tag} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.statText}>{normalizedPost.likes} likes</Text>
          <Text style={styles.statText}>{normalizedPost.comments} comments</Text>
          <Text style={styles.statText}>{normalizedPost.shares} shares</Text>
        </View>

        <View style={styles.authorCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{normalizedPost.author.slice(0,1).toUpperCase()}</Text>
          </View>
          <View style={styles.authorMain}>
            <Text style={styles.authorName}>{normalizedPost.author}</Text>
            <Text style={styles.authorHandle}>{normalizedPost.handle}</Text>
            <View style={styles.authorTagRow}>
              {normalizedPost.authorTags.map((tag) => (
                <View key={tag} style={styles.authorTagPill}>
                  <Text style={styles.authorTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.relatedTitle}>Related posts</Text>
        <View style={styles.relatedRow}>
          <View style={styles.relatedCard}>
            <Text style={styles.relatedText}>How to hone to a development on career to yourourses homentonics</Text>
          </View>
          <View style={styles.relatedCard}>
            <Text style={styles.relatedText}>How is aone is a development on career to yourourses</Text>
          </View>
        </View>

        <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
        <View style={styles.commentsList}>
          {comments.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>💬</Text>
              <Text style={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : '#64748b', fontSize: 14, fontWeight: '600' }}>No comments yet</Text>
              <Text style={{ color: isDarkMode ? 'rgba(255,255,255,0.3)' : '#94a3b8', fontSize: 12, marginTop: 4, textAlign: 'center' }}>Be the first to comment!</Text>
            </View>
          ) : comments.map((item) => (
            <View key={item.id} style={styles.commentThread}>
              <View style={styles.commentCard}>
                <View style={styles.commentAvatarSmall}>
                  <Text style={styles.commentAvatarText}>{item.author.slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={styles.commentBody}>
                  <View style={styles.commentBodyHeader}>
                    <Text style={styles.commentAuthor}>{item.author}</Text>
                    <Text style={styles.commentTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.commentText}>{item.text}</Text>
                  <View style={styles.commentActionRow}>
                    <Pressable onPress={() => setReplyCommentId(item.id)}>
                      <Text style={styles.commentActionText}>Reply</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {replyCommentId === item.id && (
                <View style={styles.replyComposer}>
                  <TextInput
                    style={styles.replyInput}
                    placeholder="Write a reply..."
                    placeholderTextColor={isDarkMode ? "rgba(255,255,255,0.35)" : "#64748b"}
                    value={replyText}
                    onChangeText={setReplyText}
                    onSubmitEditing={() => handleSendReply(item.id)}
                    returnKeyType="send"
                  />
                  <Pressable style={styles.replySendButton} onPress={() => handleSendReply(item.id)}>
                    <Text style={styles.replySendText}>Send</Text>
                  </Pressable>
                </View>
              )}

              {(item.replies || []).length > 0 && (
                <View style={styles.replyList}>
                  {(item.replies || []).map((reply) => (
                    <View key={reply.id} style={styles.replyCard}>
                      <View style={styles.commentAvatarSmall}>
                        <Text style={styles.commentAvatarText}>{reply.author.slice(0, 1).toUpperCase()}</Text>
                      </View>
                      <View style={styles.commentBody}>
                        <View style={styles.commentBodyHeader}>
                          <Text style={styles.commentAuthor}>{reply.author}</Text>
                          <Text style={styles.commentTime}>{reply.time}</Text>
                        </View>
                        <Text style={styles.commentText}>{reply.text}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.commentBar}>
        <View style={styles.commentAvatar}>
          <Text style={styles.commentAvatarText}>A</Text>
        </View>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          placeholderTextColor={isDarkMode ? "rgba(255,255,255,0.35)" : "#64748b"}
          value={comment}
          onChangeText={setComment}
          onSubmitEditing={handleSendComment}
          returnKeyType="send"
        />
        <Pressable style={styles.sendButton} onPress={handleSendComment}>
          <LinearGradient colors={[Color.colorCyan50, Color.colorViolet58]} style={styles.sendGradient}>
            <Text style={styles.sendText}>Send</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
};

const getStyles = (isDarkMode) => {
  const bgStyle = isDarkMode ? (Color.colorBlue8 || "#060612") : "#f8fafc";
  const elementBg = isDarkMode ? (Color.colorBlue15 || "#1a1f30") : "#f1f5f9";
  const cardBg = isDarkMode ? (Color.colorBlue11 || "#111524") : "#ffffff";
  const borderStyle = isDarkMode ? (Color.colorWhite7 || "rgba(255, 255, 255, 0.06)") : "#cbd5e1";
  const textPrimary = isDarkMode ? (Color.colorGrey97 || "#ffffff") : "#0f172a";
  const textSecondary = isDarkMode ? (Color.colorBlue42 || "#9AA0B2") : "#475569";
  const textTertiary = isDarkMode ? (Color.colorBlue65 || "#5a5a7a") : "#64748b";

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: bgStyle,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: Padding.padding_20,
      paddingVertical: Padding.padding_14,
      paddingTop: 50,
      borderBottomWidth: 1,
      borderBottomColor: borderStyle,
      backgroundColor: bgStyle,
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: elementBg,
      alignItems: "center",
      justifyContent: "center",
    },
    iconButtonSmall: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: elementBg,
      alignItems: "center",
      justifyContent: "center",
    },
    iconText: {
      color: textPrimary,
      fontSize: 18,
      fontWeight: "700",
    },
    iconTextSmall: {
      color: textPrimary,
      fontSize: 18,
    },
    content: {
      paddingHorizontal: Padding.padding_20,
      paddingBottom: 120,
    },
    heroImageWrap: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 26,
    },
    heroImage: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    },
    heroEmoji: {
      fontSize: 18,
    },
    title: {
      color: textPrimary,
      fontFamily: FontFamily.soraBold,
      fontSize: 22,
      fontWeight: StyleVariable.fontWeight700,
      lineHeight: 30,
      marginBottom: 14,
    },
    tagRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 12,
    },
    tagPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: isDarkMode ? "rgba(0, 212, 255, 0.14)" : "rgba(0, 212, 255, 0.08)",
    },
    tagText: {
      color: Color.colorCyan50,
      fontSize: FontSize.fs_10_4,
      fontFamily: FontFamily.soraSemiBold,
    },
    statsRow: {
      flexDirection: "row",
      gap: 18,
      marginBottom: 18,
    },
    statText: {
      color: textSecondary,
      fontSize: FontSize.size_12,
      fontFamily: FontFamily.soraRegular,
    },
    authorCard: {
      flexDirection: "row",
      gap: 14,
      padding: 16,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: borderStyle,
      backgroundColor: cardBg,
      marginBottom: 18,
    },
    avatarBox: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: isDarkMode ? (Color.colorAzure11 || "#111524") : "#e2e8f0",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: textPrimary,
      fontSize: 20,
      fontFamily: FontFamily.soraBold,
    },
    authorMain: {
      flex: 1,
    },
    authorName: {
      color: textPrimary,
      fontSize: 16,
      fontWeight: "700",
      fontFamily: FontFamily.soraBold,
    },
    authorHandle: {
      color: textSecondary,
      fontSize: 12,
      marginBottom: 8,
    },
    authorTagRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    authorTagPill: {
      backgroundColor: isDarkMode ? "rgba(124, 58, 237, 0.16)" : "rgba(124, 58, 237, 0.08)",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },
    authorTagText: {
      color: isDarkMode ? "#9f7aea" : "#6d28d9",
      fontSize: 11,
      fontFamily: FontFamily.soraSemiBold,
    },
    relatedTitle: {
      color: textTertiary,
      fontSize: 13,
      fontFamily: FontFamily.soraSemiBold,
      marginBottom: 12,
    },
    relatedRow: {
      flexDirection: "row",
      gap: 10,
    },
    relatedCard: {
      flex: 1,
      minHeight: 78,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: borderStyle,
      backgroundColor: cardBg,
    },
    relatedText: {
      color: textTertiary,
      fontSize: 12,
      lineHeight: 18,
      fontFamily: FontFamily.soraRegular,
    },
    commentsTitle: {
      color: textTertiary,
      fontSize: 13,
      fontFamily: FontFamily.soraSemiBold,
      marginTop: 18,
      marginBottom: 12,
    },
    commentsList: {
      gap: 10,
      marginBottom: 4,
    },
    commentCard: {
      flexDirection: "row",
      gap: 10,
      padding: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: borderStyle,
      backgroundColor: cardBg,
    },
    commentThread: {
      gap: 8,
    },
    commentAvatarSmall: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: isDarkMode ? (Color.colorAzure11 || "#111524") : "#e2e8f0",
      alignItems: "center",
      justifyContent: "center",
    },
    commentBody: {
      flex: 1,
    },
    commentBodyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 4,
    },
    commentAuthor: {
      color: textPrimary,
      fontFamily: FontFamily.soraBold,
      fontSize: 13,
    },
    commentTime: {
      color: textSecondary,
      fontSize: 11,
      fontFamily: FontFamily.soraRegular,
    },
    commentText: {
      color: textTertiary,
      fontSize: 12,
      lineHeight: 18,
      fontFamily: FontFamily.soraRegular,
    },
    commentActionRow: {
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "flex-start",
    },
    commentActionText: {
      color: Color.colorCyan50,
      fontSize: 12,
      fontFamily: FontFamily.soraSemiBold,
    },
    replyComposer: {
      marginLeft: 38,
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
    },
    replyInput: {
      flex: 1,
      color: textPrimary,
      backgroundColor: isDarkMode ? Color.colorBlue15 : "#ffffff",
      borderWidth: 1,
      borderColor: borderStyle,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 13,
    },
    replySendButton: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: isDarkMode ? Color.colorBlue15 : "#f1f5f9",
      borderWidth: 1,
      borderColor: Color.colorCyan50,
    },
    replySendText: {
      color: Color.colorCyan50,
      fontSize: 12,
      fontFamily: FontFamily.soraBold,
    },
    replyList: {
      marginLeft: 38,
      gap: 8,
    },
    replyCard: {
      flexDirection: "row",
      gap: 10,
      padding: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: borderStyle,
      backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    },
    commentBar: {
      position: "absolute",
      left: 20,
      right: 20,
      bottom: 14,
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      borderRadius: 22,
      backgroundColor: isDarkMode ? Color.colorBlue15 : "#ffffff",
      borderWidth: 1,
      borderColor: borderStyle,
    },
    commentAvatar: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: isDarkMode ? (Color.colorAzure11 || "#111524") : "#e2e8f0",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    commentAvatarText: {
      color: textPrimary,
      fontSize: 14,
      fontFamily: FontFamily.soraBold,
    },
    commentInput: {
      flex: 1,
      color: textPrimary,
      fontSize: 14,
      paddingVertical: 6,
    },
    sendButton: {
      marginLeft: 10,
      borderRadius: 14,
      overflow: "hidden",
    },
    sendGradient: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 14,
    },
    sendText: {
      color: Color.colorWhiteSolid || "#ffffff",
      fontFamily: FontFamily.soraBold,
      fontWeight: "700",
    },
  });
};

export default Screen29;
