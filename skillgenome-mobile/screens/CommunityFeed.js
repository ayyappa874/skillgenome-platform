import * as React from "react";
import { View, Text, StyleSheet, Pressable, Animated, Platform, ScrollView, TextInput, Image, Linking, Alert, Share, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme } from "../utils/theme";
import { Video } from 'expo-av';
import GlassCard from '../components/UI/GlassCard';
import { supabase } from "../utils/supabase";

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
  onOpenStudyGroup, onCreateStudyGroup, onLeaveStudyGroup, onDeleteStudyGroup, onOpenUserProfile, onOpenNotifications, onOpenGroupsDiscovery, onOpenConnections,
  profile = null, posts = [], connections = [], suggestedConnections = [], studyGroups = [], userRank = null,
  isDarkMode = true, currentUserName = "You", currentUserId = null,
  onLikePost, onConnectionsUpdated
}) => {
  const C = getTheme(isDarkMode);
  const T = C;
  const S = getStyles(T, isDarkMode);
  const isWeb = Platform.OS === 'web';
  const [activeTab, setActiveTab] = React.useState("foryou"); // foryou, following, groups, trending
  const [activeFilter, setActiveFilter] = React.useState("All");
  const [localSuggested, setLocalSuggested] = React.useState(suggestedConnections || []);
  const [showCreateGroup, setShowCreateGroup] = React.useState(false);
  const [newGroupName, setNewGroupName] = React.useState("");
  const [selectedConnections, setSelectedConnections] = React.useState([]);
  
  const fade = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [suggestedConnections]);

  const handleConnect = async (personId, currentStatus) => {
    if (currentStatus === "Accept") {
      setLocalSuggested(prev => prev.map(s => s.id === personId ? { ...s, status: 'Connected' } : s));
      try {
        const { error: acceptError } = await supabase
          .from('mentorship_requests')
          .update({ status: 'accepted' })
          .or(`and(student_id.eq.${personId},mentor_id.eq.${currentUserId}),and(student_id.eq.${currentUserId},mentor_id.eq.${personId})`);
        
        if (!acceptError) {
          const { data: currentUserData } = await supabase.from('profiles').select('name').eq('id', currentUserId).single();
          await supabase.from('notifications').insert({
            recipient_id: personId, actor_id: currentUserId,
            actor_name: currentUserData?.name || 'Someone',
            notification_type: 'connection_accepted',
            message: `${currentUserData?.name || 'Someone'} accepted your connection request`,
            is_read: false
          }).then(({ error }) => { if (error) console.log(error); });
          if (onConnectionsUpdated) onConnectionsUpdated();
        }
      } catch (e) {
        console.error(e);
        setLocalSuggested(prev => prev.map(s => s.id === personId ? { ...s, status: 'Accept' } : s));
      }
      return;
    }

    setLocalSuggested(prev => prev.map(s => s.id === personId ? { ...s, status: 'Pending' } : s));
    try {
      const { error } = await supabase.from('mentorship_requests').insert({
        student_id: currentUserId,
        mentor_id: personId,
        status: 'pending'
      });
      if (error) {
        if (error.code === '23505') {
          console.log('Already sent a request to this user.');
        } else {
          console.error('Failed to create connection:', error);
          setLocalSuggested(prev => prev.map(s => s.id === personId ? { ...s, status: 'Connect' } : s));
        }
      } else {
        const { data: currentUserData } = await supabase.from('profiles').select('name').eq('id', currentUserId).single();
        await supabase.from('notifications').insert({
          recipient_id: personId, actor_id: currentUserId,
          actor_name: currentUserData?.name || 'Someone',
          notification_type: 'connection_request',
          message: `${currentUserData?.name || 'Someone'} connected with you`,
          is_read: false
        }).then(({ error }) => { if (error) console.log(error); });
      }
    } catch (e) {
      console.error(e);
      setLocalSuggested(prev => prev.map(s => s.id === personId ? { ...s, status: 'Connect' } : s));
    }
  };
  React.useEffect(() => {
    // Fetch fresh recommendations when opening the feed
    const fetchRecommendations = async () => {
      try {
        if (!currentUserId) return;
        const { data, error } = await supabase.rpc('get_user_recommendations', { current_user_id: currentUserId });
        if (error) throw error;
        if (data) {
          setLocalSuggested(data);
        }
      } catch (err) {
        console.log("Error fetching recommendations in feed:", err.message);
      }
    };
    fetchRecommendations();
  }, [currentUserId]);

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

  const renderLeftPanel = () => null;

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
            <Pressable onPress={() => { if(s.isMe) setShowCreateGroup(true); }}>
              {s.avatar && s.avatar !== '...' ? (
                <Image source={{ uri: s.avatar }} style={S.storyAvatar} />
              ) : (
                <View style={[S.storyAvatar, { backgroundColor: s.isMe ? T.surface : T.purple }]}>
                   {s.isMe ? <Text style={{ fontSize: 20, color: T.text }}>+</Text> : <Text style={S.avatarSmText}>{s.name[0]}</Text>}
                </View>
              )}
            </Pressable>
          </View>
          <Text style={S.storyName}>{s.name}</Text>
          {!s.isMe && <Text style={S.storyMatch}>{s.match}%</Text>}
        </View>
      ))}
    </ScrollView>
  );
  const [dismissedBanner, setDismissedBanner] = React.useState(false);
  const highMatch = localSuggested.find(c => c.match_score >= 90);

  return (
    <View style={[S.root, { backgroundColor: C?.bg || T.bg }]}>
      {/* Create Study Group Modal */}
      <Modal visible={showCreateGroup} animationType="slide" transparent>
        <View style={S.modalOverlay}>
          <View style={S.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: T.text }}>Create Study Group</Text>
              <Pressable onPress={() => { setShowCreateGroup(false); setNewGroupName(""); setSelectedConnections([]); }} hitSlop={10}>
                 <Text style={{ fontSize: 28, color: T.muted }}>×</Text>
              </Pressable>
            </View>

            <TextInput
              style={S.modalInput}
              placeholder="Group Name (e.g. React Native Wizards)"
              placeholderTextColor={T.muted}
              value={newGroupName}
              onChangeText={setNewGroupName}
            />

            <Text style={{ fontSize: 16, fontWeight: '600', color: T.text, marginTop: 16, marginBottom: 12 }}>Invite Connections</Text>
            <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
              {connections.length > 0 ? connections.map(c => {
                const isSelected = selectedConnections.includes(c.id);
                return (
                  <Pressable 
                    key={c.id} 
                    style={[S.connectionRow, isSelected && { backgroundColor: `${T.purple}15`, borderColor: T.purple }]}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedConnections(selectedConnections.filter(id => id !== c.id));
                      } else {
                        setSelectedConnections([...selectedConnections, c.id]);
                      }
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={[S.avatarSm, { backgroundColor: T.purple }]}><Text style={S.avatarSmText}>{c.name ? c.name[0] : 'U'}</Text></View>
                      <Text style={{ fontSize: 15, color: T.text, fontWeight: '500' }}>{c.name}</Text>
                    </View>
                    <View style={[S.checkbox, isSelected && { backgroundColor: T.purple, borderColor: T.purple }]}>
                      {isSelected && <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>✓</Text>}
                    </View>
                  </Pressable>
                );
              }) : (
                <Text style={{ color: T.muted, textAlign: 'center', marginVertical: 20 }}>No connections yet to invite.</Text>
              )}
            </ScrollView>

            <Pressable 
              style={[S.createGroupBtn, (!newGroupName.trim()) && { opacity: 0.5 }]}
              onPress={() => {
                if (!newGroupName.trim()) return;
                onCreateStudyGroup && onCreateStudyGroup(newGroupName, selectedConnections);
                setShowCreateGroup(false);
                setNewGroupName("");
                setSelectedConnections([]);
              }}
              disabled={!newGroupName.trim()}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>Create Group</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Ambient glow */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["rgba(124,58,237,0.18)", "transparent"]}
          style={{ position: "absolute", top: -60, left: -60, width: 380, height: 380, borderRadius: 190 }}
        />
      </View>
      <View style={S.header}>
        <Pressable onPress={onBack} style={S.backBtn}>
          <Text style={S.backIcon}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={S.pageTitle}>Community</Text>
        </View>
        <Pressable style={S.backBtn} onPress={onOpenNotifications}>
          <Text style={S.backIcon}>🔔</Text>
        </Pressable>
        <Pressable style={S.backBtn} onPress={onOpenGroupsDiscovery}>
          <Text style={S.backIcon}>👥</Text>
        </Pressable>
        <Pressable style={S.backBtn} onPress={onOpenMessages}>
          <Text style={S.backIcon}>💬</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, flexDirection: isWeb ? 'row' : 'column', justifyContent: 'center', width: '100%', maxWidth: 1200, alignSelf: 'center', paddingTop: 20, paddingHorizontal: isWeb ? 24 : 0, gap: isWeb ? 32 : 0 }}>
        <ScrollView style={{ flex: 1, width: '100%' }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: isWeb ? 0 : 20 }}>
          <Animated.View style={{ opacity: fade, gap: 20, width: '100%' }}>
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
            
            {/* Stories removed as requested */}

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

            <View style={S.tabRow}>
              {[
                { id: "foryou", label: "For You" },
                { id: "following", label: "Following" },
                { id: "groups", label: "Groups" },
                { id: "trending", label: "Trending" }
              ].map(t => (
                <Pressable key={t.id} onPress={() => setActiveTab(t.id)} style={[S.tab, activeTab === t.id && { backgroundColor: isDarkMode ? '#ffffff' : '#0f172a' }]}>
                  <Text style={[S.tabText, { color: activeTab === t.id ? (isDarkMode ? '#000' : '#fff') : T.muted, fontWeight: activeTab === t.id ? "800" : "600" }]}>{t.label}</Text>
                </Pressable>
              ))}
            </View>


            <View style={S.feedWrap}>
              {activeTab === 'following' ? (
                <View>
                  {connections.filter(c => c.status && ['connected', 'accepted'].includes(c.status.toLowerCase())).length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 60, gap: 16 }}>
                      <Text style={{ fontSize: 20, fontWeight: '800', color: T.text }}>You aren't following anyone yet</Text>
                      <Text style={{ fontSize: 15, color: T.muted, textAlign: 'center', maxWidth: 260 }}>Connect with peers to see them here.</Text>
                      <Pressable style={[S.connectBtn, { paddingHorizontal: 24, marginTop: 12 }]} onPress={onOpenConnections}>
                        <Text style={S.connectBtnText}>Find Connections</Text>
                      </Pressable>
                    </View>
                  ) : (
                    connections.filter(c => c.status && ['connected', 'accepted'].includes(c.status.toLowerCase())).map(person => (
                      <Pressable key={person.id} style={[S.postCard, { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 }]} onPress={() => onOpenUserProfile && onOpenUserProfile(person.id)}>
                        {person.avatar_url ? (
                           <Image source={{ uri: person.avatar_url }} style={[S.avatarSm, { width: 48, height: 48, borderRadius: 24 }]} />
                        ) : (
                           <View style={[S.avatarSm, { backgroundColor: person.tone?.[0] || T.cyan, width: 48, height: 48, borderRadius: 24 }]}><Text style={[S.avatarSmText, {fontSize: 18}]}>{person.initials || (person.name ? person.name[0] : 'U')}</Text></View>
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={[S.postAuthor, { fontSize: 16 }]}>{person.name}</Text>
                          <Text style={[S.postRole, { fontSize: 13 }]}>{person.role}</Text>
                        </View>
                        <Pressable style={[S.connectBtn, { paddingHorizontal: 16, paddingVertical: 8 }]} onPress={() => onOpenMessages && onOpenMessages()}>
                          <Text style={[S.connectBtnText, { fontSize: 14 }]}>Message</Text>
                        </Pressable>
                      </Pressable>
                    ))
                  )}
                </View>
              ) : activeTab === 'groups' ? (
                <View style={{ gap: 16 }}>
                  <Pressable style={[S.connectBtn, { paddingVertical: 14, marginHorizontal: 4, backgroundColor: T.purple }]} onPress={() => setShowCreateGroup(true)}>
                    <Text style={[S.connectBtnText, { color: '#fff' }]}>+ Create New Group</Text>
                  </Pressable>
                  {studyGroups.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 60, gap: 16 }}>
                      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 32 }}>👥</Text>
                      </View>
                      <Text style={{ fontSize: 20, fontWeight: '800', color: T.text }}>No Groups Yet</Text>
                      <Text style={{ fontSize: 15, color: T.muted, textAlign: 'center', maxWidth: 260, lineHeight: 22 }}>Create a group or wait for an invite to collaborate with peers.</Text>
                    </View>
                  ) : (
                    studyGroups.map(group => (
                      <Pressable key={group.id} style={S.postCard} onPress={() => onOpenStudyGroup && onOpenStudyGroup(group.id)}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: T.text, marginBottom: 4 }}>{group.name}</Text>
                            <Text style={{ fontSize: 14, color: T.muted }}>{group.member_count || 1} Members</Text>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            {group.admin_id === currentUserId ? (
                              <Pressable onPress={(e) => { e.stopPropagation(); Alert.alert("Delete", "Delete this group?", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => onDeleteStudyGroup && onDeleteStudyGroup(group.id) }]); }} style={{ padding: 6, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>
                                <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: 'bold' }}>Delete</Text>
                              </Pressable>
                            ) : (
                              <Pressable onPress={(e) => { e.stopPropagation(); Alert.alert("Leave", "Leave this group?", [{ text: "Cancel", style: "cancel" }, { text: "Leave", style: "destructive", onPress: () => onLeaveStudyGroup && onLeaveStudyGroup(group.id) }]); }} style={{ padding: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                                <Text style={{ color: T.text, fontSize: 12, fontWeight: 'bold' }}>Leave</Text>
                              </Pressable>
                            )}
                          </View>
                        </View>
                      </Pressable>
                    ))
                  )}
                </View>
              ) : activeTab === 'trending' ? (
                <View style={{ alignItems: 'center', paddingVertical: 60, gap: 16 }}>
                  <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 32 }}>🔥</Text>
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: T.text }}>Trending features coming soon</Text>
                  <Text style={{ fontSize: 15, color: T.muted, textAlign: 'center', maxWidth: 260, lineHeight: 22 }}>We are analyzing network activity to curate the hottest topics.</Text>
                </View>
              ) : (
                posts.filter(p => {
                  let isVisible = true;
                  if (activeTab === 'groups') {
                     isVisible = p.visibility?.startsWith('group_');
                  } else if (activeTab === 'foryou') {
                     if (p.visibility?.startsWith('group_')) isVisible = false;
                     else if (p.visibility === 'connections') {
                       const isConnected = connections.some(c => c.id === p.author_id && c.status && ['connected', 'accepted'].includes(c.status.toLowerCase()));
                       isVisible = (p.author_id === currentUserId || isConnected);
                     }
                  } else if (activeTab === 'following') {
                     if (p.visibility?.startsWith('group_')) isVisible = false;
                     else {
                       const isConnected = connections.some(c => c.id === p.author_id && c.status && ['connected', 'accepted'].includes(c.status.toLowerCase()));
                       isVisible = (p.author_id === currentUserId || isConnected);
                     }
                  }
                  
                  if (!isVisible) return false;
                  if (activeFilter !== 'All') return p.skills?.includes(activeFilter);
                  return true;
                }).length === 0 ? (
                  <View style={{ alignItems: 'center', paddingVertical: 60, gap: 16 }}>
                     <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                       <Text style={{ fontSize: 32 }}>🌱</Text>
                     </View>
                     <Text style={{ fontSize: 20, fontWeight: '800', color: T.text }}>Your feed is quiet</Text>
                     <Text style={{ fontSize: 15, color: T.muted, textAlign: 'center', maxWidth: 260, lineHeight: 22 }}>Connect with genome-matched peers or make a post to get things started.</Text>
                     <Pressable style={[S.connectBtn, { paddingHorizontal: 24, marginTop: 12 }]} onPress={onOpenCreatePost}>
                       <Text style={S.connectBtnText}>Create your first post</Text>
                     </Pressable>
                  </View>
                ) : posts.filter(p => {
                  if (activeTab === 'groups') return p.visibility?.startsWith('group_');
                  if (activeTab === 'foryou') {
                    if (p.visibility?.startsWith('group_')) return false;
                    if (p.visibility === 'connections') {
                      const isConnected = connections.some(c => c.id === p.author_id && c.status && ['connected', 'accepted'].includes(c.status.toLowerCase()));
                      return p.author_id === currentUserId || isConnected;
                    }
                    return true;
                  }
                  if (activeFilter !== 'All') return p.skills?.includes(activeFilter);
                  return true;
                }).map(p => (
                  <Pressable key={p.id} style={S.postCard} onPress={() => onOpenPost && onOpenPost(p)}>
                    {profile?.role === 'admin' && (
                      <Pressable 
                        onPress={async () => {
                          Alert.alert("Admin Action", "Delete this post?", [
                            {text: "Cancel"}, 
                            {text: "Delete", onPress: async () => {
                              try {
                                await supabase.from('posts').delete().eq('id', p.id);
                                if (onConnectionsUpdated) onConnectionsUpdated();
                              } catch(e) {}
                            }}
                          ]);
                        }} 
                        style={{position: 'absolute', top: 12, right: 16, zIndex: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4}}
                      >
                        <Text style={{color: '#ef4444', fontSize: 11, fontWeight: '700'}}>Delete (Admin)</Text>
                      </Pressable>
                    )}
                    <View style={S.postHeader}>
                      {p.avatar && p.avatar !== '...' ? (
                        <Image source={{ uri: p.avatar }} style={S.avatarSm} />
                      ) : (
                        <View style={[S.avatarSm, { backgroundColor: T.cyan }]}><Text style={S.avatarSmText}>{p.author ? p.author[0] : 'U'}</Text></View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Pressable onPress={() => onOpenUserProfile && onOpenUserProfile(p.author_id)}>
                          <Text style={S.postAuthor}>{p.author}</Text>
                        </Pressable>
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
                     <View style={S.visTag}><Text style={S.visTagText}>{p.visibility === 'public' ? '🌎 Public' : p.visibility === 'connections' ? '👥 Connections' : '🔒 Group'}</Text></View>
                  </View>

                  <View style={S.postFooter}>
                    <View style={{ flexDirection: 'row', gap: 16 }}>
                      <Pressable style={S.reactionBtn} onPress={(e) => { e.stopPropagation(); onLikePost && onLikePost(p.id); }}>
                         <Text style={{ fontSize: 16 }}>❤️</Text>
                         <Text style={S.postMeta}>{p.likes || 0}</Text>
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
                ))
              )}
            </View>

            {!isWeb && activeTab !== 'following' && activeTab !== 'trending' && activeTab !== 'groups' && (
               <View style={{ marginTop: 40, gap: 32 }}>
                  <Text style={{ color: T.text, fontSize: 18, fontWeight: '800' }}>Explore More</Text>
                  {renderRightPanel()}
               </View>
            )}
            
          </Animated.View>
        </ScrollView>

        {isWeb && (
          <ScrollView style={{ flex: 1, width: '100%' }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
             {renderRightPanel()}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const getStyles = (T, isDarkMode) => StyleSheet.create({
  root: { flex: 1 },
  glow1: { position: "absolute", top: -150, right: -140, width: 460, height: 460, borderRadius: 230 },
  glow2: { position: "absolute", bottom: -40, left: -160, width: 420, height: 420, borderRadius: 210 },
  header:  {
    flexDirection: "row", alignItems: "center", gap: 16,
    paddingTop: Platform.OS === "ios" ? 72 : 56,
    paddingHorizontal: 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)",
  },
  backBtn:   { width: 42, height: 42, borderRadius: 21, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, alignItems: "center", justifyContent: "center" },
  backIcon:  { fontSize: 18, color: T.text, fontWeight: "600", marginTop: -2 },
  pageTitle: { fontSize: 22, fontWeight: "800", color: T.text, letterSpacing: -0.4 },
  
  panelSection: { gap: 14 },
  panelTitle: { fontSize: 13, fontWeight: '800', color: T.text, textTransform: 'uppercase', letterSpacing: 1.2, opacity: 0.8 },
  
  suggestedCard: { padding: 14, borderRadius: 20, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#ffffff', borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0', gap: 12, shadowColor: '#000', shadowOffset: {width:0,height:4}, shadowOpacity: 0.05, shadowRadius: 12 },
  avatarSm: { width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  avatarSmText: { fontSize: 18, fontWeight: "800", color: "#fff" },
  memberName: { fontSize: 16, fontWeight: '800', color: T.text },
  memberRole: { fontSize: 13, color: T.muted, marginTop: 2 },
  matchReasonBox: { backgroundColor: `${T.accent}15`, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  matchReasonText: { fontSize: 12, color: T.accent, fontWeight: '700' },
  connectBtn: { backgroundColor: T.text, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  connectBtnText: { color: T.bg, fontWeight: '800', fontSize: 14 },

  groupCard: { padding: 14, borderRadius: 20, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#ffffff', borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0', gap: 6, shadowColor: '#000', shadowOffset: {width:0,height:4}, shadowOpacity: 0.05, shadowRadius: 12 },
  groupName: { fontSize: 15, fontWeight: '800', color: T.text },
  groupSub: { fontSize: 13, color: T.muted },
  liveBadge: { backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginTop: 6 },
  liveBadgeText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },

  rankCard: { padding: 18, borderRadius: 24, backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.4)' : '#f8fafc', borderWidth: 1, borderColor: isDarkMode ? 'rgba(56, 189, 248, 0.2)' : '#bae6fd', gap: 14 },
  rankTitle: { fontSize: 15, fontWeight: '800', color: T.text },
  progressBg: { height: 10, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: 10, backgroundColor: T.cyan, borderRadius: 5 },
  rankSub: { fontSize: 13, color: T.muted, fontWeight: '700' },

  trendingCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 16, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#ffffff', borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0' },
  trendingSkill: { fontSize: 15, fontWeight: '700', color: T.text },
  trendingUp: { fontSize: 14, fontWeight: '800', color: '#10b981' },

  tipCard: { padding: 18, borderRadius: 20, backgroundColor: `${T.cyan}10`, borderWidth: 1, borderColor: `${T.cyan}25` },
  tipText: { fontSize: 14, color: T.cyan, lineHeight: 22, fontWeight: '700' },

  storyWrap: { alignItems: 'center', gap: 8 },
  storyRing: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  storyAvatar: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' },
  storyName: { fontSize: 13, color: T.text, fontWeight: '700' },
  storyMatch: { fontSize: 11, color: T.accent, fontWeight: '800', backgroundColor: `${T.accent}15`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },

  createPostBox: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 24, borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1', backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc', gap: 14 },
  createPostText: { fontSize: 16, color: T.muted, fontWeight: '500' },
  privacySelector: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : '#e2e8f0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  privacyIcon: { fontSize: 14 },
  privacyText: { fontSize: 13, fontWeight: '800', color: T.text },

  tabRow: { flexDirection: "row", gap: 8, paddingBottom: 16 },
  tab: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 24, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9' },
  tabText: { fontSize: 15 },

  filterChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1', backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#ffffff' },
  filterChipText: { fontSize: 14, fontWeight: '700', color: T.text },

  feedWrap: { gap: 20 },
  postCard: { padding: 18, borderRadius: 24, borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0', backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#ffffff', shadowColor: '#000', shadowOffset: {width:0,height:8}, shadowOpacity: 0.04, shadowRadius: 20, gap: 16 },
  postHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  postAuthor: { fontSize: 16, fontWeight: "800", color: T.text },
  postRole: { fontSize: 13, color: T.muted, marginTop: 2 },
  matchBadge: { backgroundColor: `${T.accent}15`, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  matchBadgeText: { fontSize: 12, fontWeight: '800', color: T.accent },
  postText: { fontSize: 16, lineHeight: 24, color: T.text, fontWeight: '400' },
  
  tagRow: { flexDirection: 'row', gap: 10, marginTop: 4, flexWrap: 'wrap' },
  skillTag: { backgroundColor: `${T.cyan}15`, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  skillTagText: { fontSize: 12, color: T.cyan, fontWeight: '800' },
  visTag: { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f1f5f9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  visTagText: { fontSize: 12, color: T.muted, fontWeight: '800' },

  postFooter: { flexDirection: "row", justifyContent: "space-between", paddingTop: 16, borderTopWidth: 1, borderTopColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#f1f5f9' },
  reactionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 4 },
  postMeta: { fontSize: 14, fontWeight: "700", color: T.muted },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 400, backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 30, borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0' },
  modalInput: { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : '#f8fafc', borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, color: T.text },
  connectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9', marginBottom: 8 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: T.muted, justifyContent: 'center', alignItems: 'center' },
  createGroupBtn: { backgroundColor: T.purple, padding: 16, borderRadius: 16, marginTop: 20 },
});

export default CommunityFeed;
