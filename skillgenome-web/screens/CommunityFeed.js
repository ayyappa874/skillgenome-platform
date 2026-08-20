import * as React from "react";
import { View, Text, StyleSheet, Pressable, Animated, Platform, ScrollView, TextInput, Image, Linking, Alert, Share } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme } from "../utils/theme";
import GlassCard from '../components/UI/GlassCard';
import { Video } from 'expo-av';

const MOCK_STORIES = [
  { id: 'me', name: 'You', isMe: true },
  { id: '1', name: 'Priya', match: 92 },
  { id: '2', name: 'David', match: 88 },
  { id: '3', name: 'Sarah', match: 85 },
  { id: '4', name: 'Alex', match: 79 },
];

const MOCK_SKILLS = ["All", "Python", "React Native", "Machine Learning", "System Design", "UI/UX"];

const CommunityFeed = ({
  onBack, onOpenCreatePost, onOpenPost, onOpenMessages, onOpenJobMatches,
  onOpenStudyGroup,
  posts = [], connections = [], suggestedConnections = [], studyGroups = [], userRank = null,
  isDarkMode = true, currentUserName = "You",
  onLikePost
}) => {
  const T = getTheme(isDarkMode);
  const S = getStyles(T);
  const isWeb = Platform.OS === 'web';
  const [activeTab, setActiveTab] = React.useState("foryou"); // foryou, following, groups, trending
  const [activeFilter, setActiveFilter] = React.useState("All");
  
  const fade = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  // Derive dynamic data
  const stories = React.useMemo(() => {
    const me = { id: 'me', name: 'You', isMe: true };
    const others = connections.slice(0, 8).map(c => ({
      id: c.id,
      name: c.name?.split(' ')[0] || 'User',
      match: c.match || 0,
      avatar: c.avatar_url
    }));
    return [me, ...others];
  }, [connections]);

  const feedSkills = React.useMemo(() => {
    const skills = new Set(["All"]);
    posts.forEach(p => {
      if (p.skills && Array.isArray(p.skills)) {
        p.skills.forEach(s => skills.add(s));
      }
    });
    return Array.from(skills).slice(0, 10); // Limit to top 10 unique skills
  }, [posts]);

  // Derive trending skills dynamically based on post occurrences (mocked increment for demo)
  const trendingSkills = React.useMemo(() => {
    return feedSkills.slice(1, 4).map((s, i) => ({
      name: s,
      growth: `+${Math.floor(Math.random() * 20) + 5}%`
    }));
  }, [feedSkills]);

  const renderLeftPanel = () => (
    <View style={{ gap: 24 }}>
      <View style={S.panelSection}>
        <Text style={S.panelTitle}>Suggested Connections</Text>
        {suggestedConnections && suggestedConnections.length > 0 ? suggestedConnections.slice(0, 3).map(c => (
          <GlassCard key={c.id} intensity="low" isDarkMode={isDarkMode} style={{ padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={[S.avatarSm, { backgroundColor: T.purple }]}><Text style={S.avatarSmText}>{c.name ? c.name[0] : 'U'}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={S.memberName}>{c.name}</Text>
                <Text style={S.memberRole}>{c.role || 'Peer Learner'}</Text>
              </View>
            </View>
            
            <View style={{ marginTop: 12, padding: 8, backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)', borderRadius: 8 }}>
              <Text style={{ fontSize: 12, color: T.text, fontWeight: '500' }}>⭐ {c.match_score}% Match</Text>
              <Text style={{ fontSize: 11, color: T.muted, marginTop: 4, lineHeight: 16 }}>{c.match_reason}</Text>
              {c.genome_proximity && (
                 <Text style={{ fontSize: 11, color: T.accent, marginTop: 2, fontWeight: '500' }}>{c.genome_proximity}</Text>
              )}
            </View>

            <Pressable style={[S.connectBtn, { marginTop: 12 }]}><Text style={S.connectBtnText}>{c.status || "Connect"}</Text></Pressable>
          </GlassCard>
        )) : (
          <GlassCard intensity="low" isDarkMode={isDarkMode} style={{ alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16, gap: 12, borderRadius: 16, borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}>
             <Text style={{ fontSize: 24 }}>🕸️</Text>
             <Text style={{ fontSize: 14, color: T.muted, textAlign: 'center', lineHeight: 20 }}>No suggestions right now.{'\n'}Keep exploring to build your network!</Text>
          </GlassCard>
        )}
      </View>
      <View style={S.panelSection}>
        <Text style={S.panelTitle}>Your Study Groups</Text>
        {studyGroups.length > 0 ? studyGroups.slice(0, 3).map(g => (
          <Pressable key={g.id} style={S.groupCard} onPress={() => onOpenStudyGroup && onOpenStudyGroup(g)}>
            <Text style={S.groupName}>{g.name}</Text>
            <Text style={S.groupSub}>{g.members_count || 1} members</Text>
          </Pressable>
        )) : (
          <View style={S.groupCard}>
            <Text style={S.groupName}>No active groups</Text>
            <Text style={S.groupSub}>Join one to start learning!</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderRightPanel = () => (
    <View style={{ gap: 24 }}>
      <View style={S.panelSection}>
        <Text style={S.panelTitle}>Your Genome Rank</Text>
        <View style={S.rankCard}>
          <Text style={S.rankTitle}>Top 15% in Community</Text>
          <View style={S.progressBg}>
            <View style={[S.progressFill, { width: `${userRank?.total_score || 50}%` }]} />
          </View>
          <Text style={S.rankSub}>{userRank?.total_score || 50}/100 Genome Score</Text>
        </View>
      </View>
      
      {trendingSkills.length > 0 && (
        <View style={S.panelSection}>
          <Text style={S.panelTitle}>Trending Skills</Text>
          {trendingSkills.map((ts, i) => (
            <View key={i} style={S.trendingCard}>
              <Text style={S.trendingSkill}>{ts.name}</Text>
              <Text style={S.trendingUp}>{ts.growth}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={S.panelSection}>
        <Text style={S.panelTitle}>Daily Genome Tip</Text>
        <View style={S.tipCard}>
          <Text style={S.tipText}>Engaging in Study Groups boosts your Communication Score by up to +5 pts.</Text>
        </View>
      </View>
    </View>
  );

  const renderStories = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 8 }}>
      {stories.map((s, i) => (
        <View key={i} style={S.storyWrap}>
          <View style={[S.storyRing, s.isMe ? { borderColor: T.border } : { borderColor: T.accent }]}>
            {s.avatar && s.avatar !== '...' ? (
              <Image source={{ uri: s.avatar }} style={S.storyAvatar} />
            ) : (
              <View style={[S.storyAvatar, { backgroundColor: s.isMe ? T.surface : T.purple }]}>
                 {s.isMe ? <Text style={{ fontSize: 20 }}>+</Text> : <Text style={S.avatarSmText}>{s.name[0]}</Text>}
              </View>
            )}
          </View>
          <Text style={S.storyName}>{s.name}</Text>
          {!s.isMe && <Text style={S.storyMatch}>{s.match}%</Text>}
        </View>
      ))}
    </ScrollView>
  );

  const [dismissedBanner, setDismissedBanner] = React.useState(false);
  const highMatch = suggestedConnections.find(c => c.match_score >= 90);

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      <View style={S.header}>
        <Pressable onPress={onBack} style={S.backBtn}>
          <Text style={S.backIcon}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={S.pageTitle}>Community</Text>
        </View>
        <Pressable style={S.backBtn} onPress={onOpenMessages}>
          <Text style={S.backIcon}>💬</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, flexDirection: isWeb ? 'row' : 'column', maxWidth: isWeb ? 1200 : 600, width: '100%', alignSelf: 'center', paddingTop: 20 }}>
        {isWeb && (
          <ScrollView style={{ width: 280, marginRight: 24 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
             {renderLeftPanel()}
          </ScrollView>
        )}

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: isWeb ? 0 : 20 }}>
          <Animated.View style={{ opacity: fade, gap: 20 }}>
            {/* Genome Notification Banner (Only shows if highMatch exists and not dismissed) */}
            {highMatch && !dismissedBanner && (
              <GlassCard intensity="medium" isDarkMode={isDarkMode} style={{ marginHorizontal: isWeb ? 0 : 16, marginTop: isWeb ? 0 : 16, padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={{ color: T.text, fontSize: 14, fontWeight: '600' }}>
                    {highMatch.name} ({highMatch.match_score}% genome match) just joined your network — add them?
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Pressable style={{ backgroundColor: T.purple, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>Connect</Text>
                  </Pressable>
                  <Pressable onPress={() => setDismissedBanner(true)} hitSlop={10}>
                    <Text style={{ color: T.muted, fontSize: 20 }}>×</Text>
                  </Pressable>
                </View>
              </GlassCard>
            )}
            
            {renderStories()}

            <Pressable style={S.createPostBox} onPress={onOpenCreatePost}>
              <View style={[S.avatarSm, { backgroundColor: T.purple }]}><Text style={S.avatarSmText}>{currentUserName[0]}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={S.createPostText}>What's on your mind, {currentUserName}?</Text>
              </View>
              <View style={S.privacySelector}>
                 <Text style={S.privacyIcon}>🌎</Text>
                 <Text style={S.privacyText}>Public</Text>
              </View>
            </Pressable>

            <View style={[S.tabRow, { borderBottomColor: T.borderLow }]}>
              {[
                { id: "foryou", label: "For You" },
                { id: "following", label: "Following" },
                { id: "groups", label: "Groups" },
                { id: "trending", label: "Trending" }
              ].map(t => (
                <Pressable key={t.id} onPress={() => setActiveTab(t.id)} style={[S.tab, activeTab === t.id && { backgroundColor: T.surface, borderColor: T.border }]}>
                  <Text style={[S.tabText, { color: activeTab === t.id ? T.text : T.muted, fontWeight: activeTab === t.id ? "700" : "600" }]}>{t.label}</Text>
                </Pressable>
              ))}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
              {feedSkills.map(skill => (
                <Pressable key={skill} onPress={() => setActiveFilter(skill)} style={[S.filterChip, activeFilter === skill && { backgroundColor: T.cyan, borderColor: T.cyan }]}>
                  <Text style={[S.filterChipText, activeFilter === skill && { color: '#000' }]}>{skill}</Text>
                </Pressable>
              ))}
            </ScrollView>
            
            <View style={S.feedWrap}>
              {posts.map(p => (
                <Pressable key={p.id} style={S.postCard} onPress={() => onOpenPost && onOpenPost(p)}>
                  <View style={S.postHeader}>
                    {p.avatar && p.avatar !== '...' ? (
                      <Image source={{ uri: p.avatar }} style={S.avatarSm} />
                    ) : (
                      <View style={[S.avatarSm, { backgroundColor: T.cyan }]}><Text style={S.avatarSmText}>{p.author ? p.author[0] : 'U'}</Text></View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={S.postAuthor}>{p.author}</Text>
                      <Text style={S.postRole}>{p.handle || "Member"} · {p.time || 'now'}</Text>
                    </View>
                    {p.rank !== undefined && (
                      <View style={S.matchBadge}>
                         <Text style={S.matchBadgeText}>Rank {p.rank}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={S.postText}>{p.content}</Text>
                  
                  {p.images && p.images.length > 0 && (
                     <Image source={{ uri: p.images[0] }} style={{ width: '100%', height: 200, borderRadius: 12, marginTop: 12 }} resizeMode="cover" />
                  )}
                  {p.video && (
                     <Video source={{ uri: p.video }} style={{ width: '100%', height: 200, borderRadius: 12, marginTop: 12 }} useNativeControls resizeMode="cover" isLooping />
                  )}
                  
                  <View style={S.tagRow}>
                     {p.skills?.map((t, idx) => (
                        <View key={idx} style={S.skillTag}><Text style={S.skillTagText}>{t}</Text></View>
                     ))}
                     <View style={S.visTag}><Text style={S.visTagText}>🌎 Public</Text></View>
                  </View>

                  <View style={S.postFooter}>
                    <View style={{ flexDirection: 'row', gap: 16 }}>
                      <Pressable style={S.reactionBtn} onPress={(e) => { e.stopPropagation(); onLikePost && onLikePost(p.id); }}>
                         <Text style={{ fontSize: 16 }}>❤️</Text>
                         <Text style={S.postMeta}>{p.likes || 0}</Text>
                      </Pressable>
                      <Pressable style={S.reactionBtn} onPress={(e) => { e.stopPropagation(); onLikePost && onLikePost(p.id); }}>
                         <Text style={{ fontSize: 16 }}>💡</Text>
                      </Pressable>
                      <Pressable style={S.reactionBtn} onPress={(e) => { e.stopPropagation(); onLikePost && onLikePost(p.id); }}>
                         <Text style={{ fontSize: 16 }}>🎉</Text>
                      </Pressable>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 16 }}>
                      <Pressable style={S.reactionBtn} onPress={(e) => { e.stopPropagation(); onOpenPost && onOpenPost(p); }}>
                         <Text style={{ fontSize: 16 }}>💬</Text>
                         <Text style={S.postMeta}>{p.comments || 0}</Text>
                      </Pressable>
                      <Pressable style={S.reactionBtn} onPress={async (e) => {
                          e.stopPropagation();
                          try {
                            const shareUrl = `https://skillgenome.app/post/${p.id || ''}`;
                            if (Platform.OS === 'web' && navigator.share) {
                              await navigator.share({ title: p.content, url: shareUrl });
                            } else if (Platform.OS === 'web') {
                              window.alert(`Copy this link to share:\n${shareUrl}`);
                            } else {
                              await Share.share({ message: `Check out this post on SkillGenome!\n${shareUrl}` });
                            }
                          } catch (err) { console.log(err); }
                      }}>
                         <Text style={{ fontSize: 16 }}>🔗</Text>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>

            {!isWeb && (
               <View style={{ marginTop: 40, gap: 32 }}>
                  <Text style={{ color: T.text, fontSize: 18, fontWeight: '800' }}>Explore More</Text>
                  {renderLeftPanel()}
                  {renderRightPanel()}
               </View>
            )}
            
          </Animated.View>
        </ScrollView>

        {isWeb && (
          <ScrollView style={{ width: 280, marginLeft: 24 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
             {renderRightPanel()}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  root: { flex: 1 },
  header:  {
    flexDirection: "row", alignItems: "center", gap: 16,
    paddingTop: Platform.OS === "ios" ? 72 : 20,
    paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: T.borderLow,
  },
  backBtn:   { width: 42, height: 42, borderRadius: 21, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, alignItems: "center", justifyContent: "center" },
  backIcon:  { fontSize: 18, color: T.text, fontWeight: "600", marginTop: -2 },
  pageTitle: { fontSize: 24, fontWeight: "900", color: T.text, letterSpacing: -0.5 },
  
  panelSection: { gap: 12 },
  panelTitle: { fontSize: 14, fontWeight: '700', color: T.muted, letterSpacing: 1 },
  
  suggestedCard: { padding: 12, borderRadius: 16, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, gap: 10 },
  avatarSm: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarSmText: { fontSize: 16, fontWeight: "800", color: "#fff" },
  memberName: { fontSize: 15, fontWeight: '700', color: T.text },
  memberRole: { fontSize: 12, color: T.muted },
  matchReasonBox: { backgroundColor: `${T.accent}10`, padding: 8, borderRadius: 8 },
  matchReasonText: { fontSize: 12, color: T.accent, fontWeight: '600' },
  connectBtn: { backgroundColor: T.text, padding: 8, borderRadius: 8, alignItems: 'center' },
  connectBtnText: { color: T.bg, fontWeight: '700', fontSize: 13 },

  groupCard: { padding: 12, borderRadius: 12, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, gap: 4 },
  groupName: { fontSize: 14, fontWeight: '700', color: T.text },
  groupSub: { fontSize: 12, color: T.muted },
  liveBadge: { backgroundColor: '#ef4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 },
  liveBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  rankCard: { padding: 16, borderRadius: 16, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, gap: 12 },
  rankTitle: { fontSize: 14, fontWeight: '700', color: T.text },
  progressBg: { height: 8, backgroundColor: T.borderLow, borderRadius: 4 },
  progressFill: { height: 8, backgroundColor: T.cyan, borderRadius: 4 },
  rankSub: { fontSize: 12, color: T.muted, fontWeight: '600' },

  trendingCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderRadius: 12, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border },
  trendingSkill: { fontSize: 14, fontWeight: '600', color: T.text },
  trendingUp: { fontSize: 13, fontWeight: '700', color: '#10b981' },

  tipCard: { padding: 16, borderRadius: 16, backgroundColor: `${T.cyan}10`, borderWidth: 1, borderColor: `${T.cyan}30` },
  tipText: { fontSize: 13, color: T.cyan, lineHeight: 20, fontWeight: '600' },

  storyWrap: { alignItems: 'center', gap: 4 },
  storyRing: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  storyAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  storyName: { fontSize: 12, color: T.text, fontWeight: '600' },
  storyMatch: { fontSize: 10, color: T.accent, fontWeight: '700' },

  createPostBox: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface, gap: 12 },
  createPostText: { fontSize: 15, color: T.muted },
  privacySelector: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: T.borderLow, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  privacyIcon: { fontSize: 14 },
  privacyText: { fontSize: 12, fontWeight: '700', color: T.text },

  tabRow: { flexDirection: "row", gap: 10, paddingBottom: 10, borderBottomWidth: 1 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: "transparent" },
  tabText: { fontSize: 14 },

  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface },
  filterChipText: { fontSize: 13, fontWeight: '600', color: T.text },

  feedWrap: { gap: 16 },
  postCard: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface, gap: 12 },
  postHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  postAuthor: { fontSize: 15, fontWeight: "700", color: T.text },
  postRole: { fontSize: 12, color: T.muted },
  matchBadge: { backgroundColor: `${T.accent}15`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  matchBadgeText: { fontSize: 11, fontWeight: '700', color: T.accent },
  postText: { fontSize: 15, lineHeight: 22, color: T.text },
  
  tagRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  skillTag: { backgroundColor: `${T.cyan}15`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  skillTagText: { fontSize: 11, color: T.cyan, fontWeight: '700' },
  visTag: { backgroundColor: T.borderLow, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  visTagText: { fontSize: 11, color: T.muted, fontWeight: '700' },

  postFooter: { flexDirection: "row", justifyContent: "space-between", paddingTop: 12, borderTopWidth: 1, borderTopColor: T.borderLow },
  reactionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
  postMeta: { fontSize: 13, fontWeight: "600", color: T.muted },
});

export default CommunityFeed;
