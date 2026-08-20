import * as React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Image, Platform, Linking, Share } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Color, FontFamily, FontSize, Padding, Border, StyleVariable } from "../GlobalStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from 'expo-av';

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

const Screen29 = ({ onBack, post = defaultPost, onAddComment, onLoadComments, onDeletePost, onDeleteComment, onLikePost, currentUser = "You", userId, isDarkMode = true, language = 'English' }) => {
  const textPrimary = isDarkMode ? (Color.colorGrey97 || "#ffffff") : "#0f172a";
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
  const [comment, setComment] = React.useState("");
  const [replyCommentId, setReplyCommentId] = React.useState(null);
  const [replyText, setReplyText] = React.useState("");
  const [comments, setComments] = React.useState([]);

  const reloadComments = async () => {
    if (typeof onLoadComments === 'function' && post?.id) {
      try {
        const dbComments = await onLoadComments(post.id);
        if (dbComments) {
          const mapped = dbComments.map(c => ({
            id: c.id,
            author: c.profiles?.name || 'User',
            author_id: c.author_id,
            text: c.content,
            time: new Date(c.created_at).toLocaleDateString(),
            replies: [],
            parent_id: c.parent_id
          }));
          const topLevel = mapped.filter(c => !c.parent_id);
          const replies = mapped.filter(c => c.parent_id);
          topLevel.forEach(t => {
            t.replies = replies.filter(r => r.parent_id === t.id);
          });
          setComments(topLevel.reverse());
        }
      } catch (e) {}
    }
  };

  React.useEffect(() => {
    reloadComments();
  }, [post?.id, onLoadComments]);

  const styles = React.useMemo(() => getStyles(isDarkMode), [isDarkMode]);

  const showMenu = () => {
    Alert.alert("Post options", "Choose an action", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete post", 
        style: "destructive", 
        onPress: () => {
          if (userId && post?.author_id === userId) {
            Alert.alert("Confirm Delete", "Are you sure you want to delete this post?", [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => {
                  if (typeof onDeletePost === 'function') {
                    onDeletePost(post.id);
                    if (onBack) onBack();
                  }
                } 
              }
            ]);
          } else {
            Alert.alert("Not Authorized", "You can only delete your own posts.");
          }
        } 
      },
    ]);
  };

  const handleSendComment = async () => {
    const trimmed = comment.trim();
    if (!trimmed) return;

    if (typeof onAddComment === "function" && post?.id) {
      await onAddComment(post.id, trimmed);
      await reloadComments();
    }
    setComment("");
  };

  const handleSendReply = async (commentId) => {
    const trimmed = replyText.trim();
    if (!trimmed) return;

    if (typeof onAddComment === "function" && post?.id) {
      await onAddComment(post.id, trimmed, commentId);
      await reloadComments();
    }

    setReplyText("");
    setReplyCommentId(null);
  };

  const handleDeleteCommentItem = async (commentId) => {
    if (!commentId || typeof onDeleteComment !== 'function') return;

    Alert.alert('Delete comment', 'Are you sure you want to delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await onDeleteComment(commentId, post?.id);
          await reloadComments();
        }
      }
    ]);
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
          {normalizedPost.images && normalizedPost.images.length > 0 && normalizedPost.images[0] ? (
            <Image
              style={{ width: "100%", maxWidth: 600, alignSelf: "center", height: 300, resizeMode: "contain", marginBottom: 20, borderRadius: 12, backgroundColor: isDarkMode ? "#111524" : "#e2e8f0" }}
              source={{ uri: normalizedPost.images[0] }}
            />
          ) : normalizedPost.video ? (
            <Video
              style={{ width: "100%", maxWidth: 600, alignSelf: "center", height: 300, marginBottom: 20, borderRadius: 12, backgroundColor: isDarkMode ? "#111524" : "#e2e8f0" }}
              source={{ uri: normalizedPost.video }}
              useNativeControls
              resizeMode="contain"
              isLooping
            />
          ) : normalizedPost.document ? (
             <Pressable style={{ width: "100%", maxWidth: 600, alignSelf: "center", padding: 20, marginBottom: 20, borderRadius: 12, backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", flexDirection: 'row', alignItems: 'center', gap: 12 }} onPress={() => normalizedPost.document && Linking.openURL(normalizedPost.document)}>
               <Text style={{ fontSize: 24 }}>📄</Text>
               <Text style={{ color: textPrimary, fontSize: 16, fontWeight: "600", flex: 1 }} numberOfLines={1}>Attached Document</Text>
               <Text style={{ color: Color.colorCyan50, fontSize: 14, fontWeight: "600" }}>Open</Text>
             </Pressable>
          ) : (
            <View style={styles.heroImageWrap}>
              <View style={styles.heroImage}>
                <Text style={styles.heroEmoji}>🖼️</Text>
              </View>
            </View>
          )}

        <Text style={styles.title}>{normalizedPost.title}</Text>

        <View style={styles.tagRow}>
          {normalizedPost.tags.map((tag) => (
            <View key={tag} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: "row", gap: 16, paddingTop: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
          <Text style={styles.statText}>{normalizedPost.likes} Likes</Text>
          <Text style={styles.statText}>{normalizedPost.comments} Comments</Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 12, paddingBottom: 24 }}>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 6 }} onPress={() => onLikePost && post?.id && onLikePost(post.id)}>
               <Text style={{ fontSize: 18 }}>{post?.liked ? "❤️" : "🤍"}</Text>
               <Text style={{ fontSize: 14, fontWeight: "600", color: post?.liked ? Color.colorCyan50 : textPrimary }}>Like</Text>
            </Pressable>
            <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 6 }} onPress={() => onLikePost && post?.id && onLikePost(post.id)}>
               <Text style={{ fontSize: 18 }}>💡</Text>
            </Pressable>
            <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 6 }} onPress={() => onLikePost && post?.id && onLikePost(post.id)}>
               <Text style={{ fontSize: 18 }}>🎉</Text>
            </Pressable>
            <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 6 }} onPress={() => onLikePost && post?.id && onLikePost(post.id)}>
               <Text style={{ fontSize: 18 }}>🤝</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
               <Text style={{ fontSize: 18 }}>💬</Text>
               <Text style={{ fontSize: 14, fontWeight: "600", color: textPrimary }}>Comment</Text>
            </Pressable>
            <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 6 }} onPress={async () => {
                try {
                  const shareUrl = `https://skillgenome.app/post/${post?.id || ''}`;
                  if (Platform.OS === 'web' && navigator.share) {
                    await navigator.share({ title: normalizedPost.title, url: shareUrl });
                  } else if (Platform.OS === 'web') {
                    window.alert(`Copy this link to share:\n${shareUrl}`);
                  } else {
                    await Share.share({ message: `Check out this post on SkillGenome: ${normalizedPost.title}\n${shareUrl}` });
                  }
                } catch (e) { console.log(e); }
            }}>
               <Text style={{ fontSize: 18 }}>🔗</Text>
               <Text style={{ fontSize: 14, fontWeight: "600", color: textPrimary }}>Share</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.authorCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{normalizedPost.author.slice(0,1).toUpperCase()}</Text>
          </View>
          <View style={styles.authorMain}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.authorName}>{normalizedPost.author}</Text>
              <View style={{ backgroundColor: isDarkMode ? "rgba(16, 185, 129, 0.15)" : "#d1fae5", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ color: isDarkMode ? "#34d399" : "#059669", fontSize: 10, fontWeight: "700" }}>92% Match</Text>
              </View>
            </View>
            <Text style={styles.authorHandle}>{normalizedPost.handle}</Text>
            <View style={styles.authorTagRow}>
              {normalizedPost.authorTags.map((tag) => (
                <View key={tag} style={styles.authorTagPill}>
                  <Text style={styles.authorTagText}>{tag}</Text>
                </View>
              ))}
              <View style={{ backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                <Text style={{ color: isDarkMode ? "#9AA0B2" : "#475569", fontSize: 11, fontWeight: "600" }}>🌎 Public</Text>
              </View>
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
                    {userId && item.author_id === userId && (
                      <Pressable onPress={() => handleDeleteCommentItem(item.id)}>
                        <Text style={[styles.commentActionText, { color: '#ef4444' }]}>Delete</Text>
                      </Pressable>
                    )}
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
                        {userId && reply.author_id === userId && (
                          <View style={styles.commentActionRow}>
                            <Pressable onPress={() => handleDeleteCommentItem(reply.id)}>
                              <Text style={[styles.commentActionText, { color: '#ef4444' }]}>Delete</Text>
                            </Pressable>
                          </View>
                        )}
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
      alignItems: "center",
      gap: 12,
    },
    commentActionText: {
      color: Color.colorCyan50,
      fontSize: 12,
      fontFamily: FontFamily.soraSemiBold,
      lineHeight: 18,
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
