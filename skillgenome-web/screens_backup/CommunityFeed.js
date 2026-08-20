import * as React from "react";
import { View, Text, StyleSheet, Pressable, Animated, Platform, ScrollView, TextInput, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme } from "../utils/theme";

const CommunityFeed = ({
  onBack, onOpenCreatePost, onOpenPost, onOpenMessages, onOpenJobMatches,
  isDarkMode = true, currentUserName = "You"
}) => {
  const T = getTheme(isDarkMode);
  const [activeTab, setActiveTab] = React.useState("explore"); // explore, study, network
  
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const POSTS = [
    { id: 1, author: "Sarah Jenkins", role: "AI Researcher", text: "Just deployed my first LLM using quantization. The performance gains are insane! 🚀", likes: 24, replies: 5 },
    { id: 2, author: "David Chen", role: "Frontend Dev", text: "Looking for study partners to tackle the Advanced React Genome path this weekend.", likes: 12, replies: 8 },
  ];

  const MEMBERS = [
    { id: 1, name: "Ayyappa", role: "AI Engineer", match: 92 },
    { id: 2, name: "Maria S.", role: "Data Scientist", match: 88 },
    { id: 3, name: "Alex K.", role: "Backend Dev", match: 76 },
  ];

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      <View style={S.header}>
        <View style={S.headerLeft}>
          <Pressable style={[S.iconBtn, { backgroundColor: T.surface, borderColor: T.border }]} onPress={onBack}>
            <Text style={[S.iconBtnText, { color: T.text }]}>←</Text>
          </Pressable>
          <Text style={[S.pageTitle, { color: T.text }]}>Community</Text>
        </View>
        <Pressable style={[S.iconBtn, { backgroundColor: T.surface, borderColor: T.border }]} onPress={onOpenMessages}>
          <Text style={[S.iconBtnText, { color: T.text }]}>💬</Text>
        </Pressable>
      </View>

      <View style={[S.tabRow, { borderBottomColor: T.borderLow }]}>
        {[
          { id: "explore", label: "Explore" },
          { id: "study", label: "Study Group" },
          { id: "network", label: "Network" }
        ].map(t => (
          <Pressable 
            key={t.id} 
            onPress={() => setActiveTab(t.id)} 
            style={[S.tab, activeTab === t.id && { backgroundColor: T.surface, borderColor: T.border }]}
          >
            <Text style={[S.tabText, { color: activeTab === t.id ? T.text : T.muted, fontWeight: activeTab === t.id ? "700" : "600" }]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 20 }}>
          
          {activeTab === "explore" && (
            <View style={S.feedWrap}>
              <Pressable style={[S.createPostBox, { borderColor: T.border, backgroundColor: T.surface }]} onPress={onOpenCreatePost}>
                <View style={[S.avatarSm, { backgroundColor: T.purple }]}><Text style={S.avatarSmText}>{currentUserName[0]}</Text></View>
                <Text style={[S.createPostText, { color: T.muted }]}>Share an update, project, or question...</Text>
              </Pressable>
              
              {POSTS.map(p => (
                <View key={p.id} style={[S.postCard, { borderColor: T.border, backgroundColor: T.surface }]}>
                  <View style={S.postHeader}>
                    <View style={[S.avatarSm, { backgroundColor: T.cyan }]}><Text style={S.avatarSmText}>{p.author[0]}</Text></View>
                    <View>
                      <Text style={[S.postAuthor, { color: T.text }]}>{p.author}</Text>
                      <Text style={[S.postRole, { color: T.muted }]}>{p.role}</Text>
                    </View>
                  </View>
                  <Text style={[S.postText, { color: T.text }]}>{p.text}</Text>
                  <View style={[S.postFooter, { borderTopColor: T.borderLow }]}>
                    <Text style={[S.postMeta, { color: T.muted }]}>❤️ {p.likes}</Text>
                    <Text style={[S.postMeta, { color: T.muted }]}>💬 {p.replies}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === "study" && (
            <View style={S.studyWrap}>
              <View style={[S.studyHero, { borderColor: T.accent, backgroundColor: `${T.accent}10` }]}>
                <Text style={[S.studyTitle, { color: T.text }]}>Weekly Challenge: Build a React Native app</Text>
                <Text style={[S.studySub, { color: T.muted }]}>Join 45 others in completing this week's technical challenge.</Text>
                <Pressable style={[S.actionBtn, { backgroundColor: T.accent }]}>
                  <Text style={S.actionText}>Join Group</Text>
                </Pressable>
              </View>

              <Text style={[S.sectionTitle, { color: T.muted }]}>ACTIVE STUDY ROOMS</Text>
              <View style={[S.card, { borderColor: T.border, backgroundColor: T.surface }]}>
                <Text style={[S.cardTitle, { color: T.text }]}>Advanced Machine Learning</Text>
                <Text style={[S.cardSub, { color: T.muted }]}>12 members active now</Text>
              </View>
              <View style={[S.card, { borderColor: T.border, backgroundColor: T.surface }]}>
                <Text style={[S.cardTitle, { color: T.text }]}>System Design Interview Prep</Text>
                <Text style={[S.cardSub, { color: T.muted }]}>8 members active now</Text>
              </View>
            </View>
          )}

          {activeTab === "network" && (
            <View style={S.networkWrap}>
              <View style={[S.networkHero, { borderColor: T.cyan, backgroundColor: `${T.cyan}10` }]}>
                <View style={S.heroTextWrap}>
                  <Text style={[S.studyTitle, { color: T.text }]}>Find your next role</Text>
                  <Text style={[S.studySub, { color: T.muted }]}>Discover jobs matching your Genome DNA.</Text>
                </View>
                <Pressable style={[S.outlineBtn, { borderColor: T.cyan }]} onPress={onOpenJobMatches}>
                  <Text style={[S.outlineText, { color: T.cyan }]}>Job Matches</Text>
                </Pressable>
              </View>

              <Text style={[S.sectionTitle, { color: T.muted }]}>SUGGESTED CONNECTIONS</Text>
              {MEMBERS.map(m => (
                <View key={m.id} style={[S.memberCard, { borderColor: T.border, backgroundColor: T.surface }]}>
                  <View style={S.memberLeft}>
                    <View style={[S.avatarSm, { backgroundColor: `${T.purple}40` }]}><Text style={[S.avatarSmText, { color: T.text }]}>{m.name[0]}</Text></View>
                    <View>
                      <Text style={[S.memberName, { color: T.text }]}>{m.name}</Text>
                      <Text style={[S.memberRole, { color: T.muted }]}>{m.role}</Text>
                    </View>
                  </View>
                  <View style={[S.matchBadge, { backgroundColor: `${T.accent}20`, borderColor: `${T.accent}40` }]}>
                    <Text style={[S.matchText, { color: T.accent }]}>{m.match}% Match</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

        </Animated.View>
      </ScrollView>
    </View>
  );
};

const S = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? 54 : 28, paddingHorizontal: 20, paddingBottom: 16 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  iconBtnText: { fontSize: 18, fontWeight: "600" },
  pageTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.4 },

  tabRow: { flexDirection: "row", paddingHorizontal: 20, gap: 10, paddingBottom: 10, borderBottomWidth: 1 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: "transparent" },
  tabText: { fontSize: 14 },

  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },

  feedWrap: { gap: 16 },
  createPostBox: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
  createPostText: { fontSize: 15 },
  
  postCard: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
  postHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarSm: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarSmText: { fontSize: 16, fontWeight: "800", color: "#fff" },
  postAuthor: { fontSize: 15, fontWeight: "700" },
  postRole: { fontSize: 12 },
  postText: { fontSize: 15, lineHeight: 22 },
  postFooter: { flexDirection: "row", gap: 16, paddingTop: 12, borderTopWidth: 1 },
  postMeta: { fontSize: 13, fontWeight: "600" },

  studyWrap: { gap: 16 },
  studyHero: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 10 },
  studyTitle: { fontSize: 18, fontWeight: "800" },
  studySub: { fontSize: 14, lineHeight: 20 },
  actionBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 8 },
  actionText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginLeft: 4, marginTop: 10 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1 },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardSub: { fontSize: 13, marginTop: 4 },

  networkWrap: { gap: 16 },
  networkHero: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderRadius: 20, borderWidth: 1 },
  heroTextWrap: { flex: 1, paddingRight: 16, gap: 4 },
  outlineBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  outlineText: { fontSize: 13, fontWeight: "700" },

  memberCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 16, borderWidth: 1 },
  memberLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  memberName: { fontSize: 15, fontWeight: "700" },
  memberRole: { fontSize: 13 },
  matchBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  matchText: { fontSize: 12, fontWeight: "700" },
});

export default CommunityFeed;
