import * as React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert, ActivityIndicator, TextInput, Dimensions, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { supabase } from "../utils/supabase";
import { getTheme } from "../utils/theme";

const { width, height } = Dimensions.get('window');
const isWide = width > 768;

export default function AdminDashboardScreen({ profile, onBack, onOpenSettings, onOpenEditProfile, onOpenAdminNotifications, isDarkMode }) {
  const C = getTheme(isDarkMode);
  const styles = React.useMemo(() => getStyles(C), [C]);
  
  const [activeModule, setActiveModule] = React.useState('menu');
  const [loading, setLoading] = React.useState(false);
  
  // States
  const [stats, setStats] = React.useState(null);
  const [allUsers, setAllUsers] = React.useState([]);
  const [mentors, setMentors] = React.useState([]);
  const [flaggedPosts, setFlaggedPosts] = React.useState([]);
  const [cohorts, setCohorts] = React.useState([]);
  const [broadcastMessage, setBroadcastMessage] = React.useState("");
  const [trendingSkills, setTrendingSkills] = React.useState([]);
  const [injectedSkills, setInjectedSkills] = React.useState([]);
  const [targetRoles, setTargetRoles] = React.useState([]);
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [skillInput, setSkillInput] = React.useState("");
  const [banUserObj, setBanUserObj] = React.useState(null);
  const [banReason, setBanReason] = React.useState("");
  const [banDuration, setBanDuration] = React.useState("Permanent");

  React.useEffect(() => {
    checkMaintenance();
    if (activeModule === 'analytics') fetchStats();
    if (activeModule === 'mentors') fetchMentors();
    if (activeModule === 'users') fetchUsers();
    if (activeModule === 'intelligence') fetchIntelligence();
    if (activeModule === 'moderation') fetchModeration();
    if (activeModule === 'health') fetchHealth();
  }, [activeModule]);

  const checkMaintenance = async () => {
    const { data } = await supabase.from('platform_settings').select('maintenance_mode').eq('id', 1).single();
    if (data) setMaintenanceMode(data.maintenance_mode);
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [{ count: userCount }, { count: cohortCount }, { count: postCount }, { count: resumeCount }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('cohorts').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('resume_analyses').select('*', { count: 'exact', head: true })
      ]);
      setStats({ users: userCount || 0, cohorts: cohortCount || 0, posts: postCount || 0, resumeCount: resumeCount || 0 });
    } catch (e) { }
    setLoading(false);
  };

  const fetchMentors = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').eq('role', 'mentor');
    if (error) Alert.alert("fetchMentors Error", error.message);
    setMentors(data || []);
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').limit(50);
    if (error) Alert.alert("fetchUsers Error", error.message);
    setAllUsers(data || []);
    setLoading(false);
  };

  const fetchModeration = async () => {
    setLoading(true);
    const { data } = await supabase.from('posts').select('*, profiles(name, shadowbanned)').order('created_at', { ascending: false }).limit(20);
    setFlaggedPosts(data || []);
    setLoading(false);
  };

  const fetchHealth = async () => {
    setLoading(true);
    const { data } = await supabase.from('cohorts').select('*, profiles(name)').limit(15);
    setCohorts(data || []);
    setLoading(false);
  };

  const fetchIntelligence = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('skills, title').limit(200);
    const { data: injectedData } = await supabase.from('approved_skills').select('*').order('created_at', { ascending: false });
    if (injectedData) setInjectedSkills(injectedData);
    let skillCounts = {}; let titleCounts = {};
    if (data) {
      data.forEach(p => {
        if (p.skills && Array.isArray(p.skills)) p.skills.forEach(s => skillCounts[s] = (skillCounts[s] || 0) + 1);
        if (p.title) titleCounts[p.title] = (titleCounts[p.title] || 0) + 1;
      });
    }
    setTrendingSkills(Object.keys(skillCounts).map(k => ({ name: k, count: skillCounts[k] })).sort((a,b) => b.count - a.count).slice(0, 5));
    setTargetRoles(Object.keys(titleCounts).map(k => ({ name: k, count: titleCounts[k] })).sort((a,b) => b.count - a.count).slice(0, 5));
    setLoading(false);
  };

  // --- OMNISCIENT ACTIONS ---
  
  // 1. Delete Account (Hard Wipe)
  const hardWipeUser = async (userId) => {
    Alert.alert("Confirm Wipe", "Permanently delete this user's profile and data?", [
      { text: "Cancel", style: "cancel" },
      { text: "WIPE", style: "destructive", onPress: async () => {
          await Promise.all([
            supabase.from('posts').delete().eq('user_id', userId),
            supabase.from('resume_analyses').delete().eq('user_id', userId),
            supabase.from('profiles').delete().eq('id', userId)
          ]);
          fetchUsers();
          Alert.alert("User Wiped");
      }}
    ]);
  };

  // 2. Bans & Shadowbans
  const openBanModal = (u) => {
    setBanUserObj(u);
    setBanReason("");
    setBanDuration("Permanent");
  };

  const executeBan = async () => {
    if (!banUserObj) return;
    
    // We update the is_banned flag, and ideally a banned_until column (if the schema supports it). 
    // We also notify the user so it's captured in real-time.
    const { error } = await supabase.from('profiles').update({ is_banned: true }).eq('id', banUserObj.id);
    if (error) {
      Alert.alert("Ban Error", error.message);
      return;
    }
    
    await supabase.from('notifications').insert({
      recipient_id: banUserObj.id,
      actor_id: profile?.id || '00000000-0000-0000-0000-000000000000',
      actor_name: 'SkillGenome Admin',
      notification_type: 'system_alert',
      message: `ACCOUNT BANNED: Your account has been banned. Duration: ${banDuration}. Reason: ${banReason || 'Violation of terms.'}`
    });

    setBanUserObj(null);
    fetchUsers();
    Alert.alert("Ban Applied", "User has been banned and notified in real-time.");
  };

  const executeUnban = async (userId) => {
    const { error } = await supabase.from('profiles').update({ is_banned: false }).eq('id', userId);
    if (error) {
      Alert.alert("Unban Error", error.message);
      return;
    }
    await supabase.from('notifications').insert({
      recipient_id: userId,
      actor_id: profile?.id || '00000000-0000-0000-0000-000000000000',
      actor_name: 'SkillGenome Admin',
      notification_type: 'system_alert',
      message: 'ACCOUNT RESTORED: Your account ban has been lifted. Welcome back!'
    });
    fetchUsers();
    Alert.alert("Unbanned", "User has been unbanned successfully.");
  };
  const toggleShadowban = async (userId, current) => {
    const { error } = await supabase.from('profiles').update({ shadowbanned: !current }).eq('id', userId); 
    if (error) Alert.alert("Shadowban Error", error.message);
    fetchUsers();
  };

  // 3. Role Switch
  const switchRole = async (userId, currentRole) => {
    const newRole = currentRole === 'mentor' ? 'student' : 'mentor';
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId); 
    if (error) Alert.alert("Role Error", error.message);
    fetchUsers();
  };

  // 6. Mentor Verification
  const toggleMentorStatus = async (mentorId, current) => {
    const { error } = await supabase.from('profiles').update({ is_verified: !current }).eq('id', mentorId); 
    if (error) {
      Alert.alert("Verification Error", error.message);
      return;
    }
    
    if (!current) {
      // They just got verified
      const { error: notifError } = await supabase.from('notifications').insert({
        recipient_id: mentorId,
        actor_id: profile?.id || '00000000-0000-0000-0000-000000000000',
        actor_name: 'SkillGenome Admin',
        notification_type: 'system_alert',
        message: 'VERIFICATION APPROVED: Your mentor account has been verified by an admin! You can now log in.'
      });
      if (notifError) console.error("Notif Error:", notifError);
      Alert.alert("Mentor Approved", "The mentor has been verified and notified.");
    }
    
    fetchMentors();
  };

  // 10. Delete Post
  const deletePost = async (postId) => {
    // Delete likes and comments first to prevent foreign key constraint errors
    await supabase.from('post_likes').delete().eq('post_id', postId);
    await supabase.from('comments').delete().eq('post_id', postId);
    
    const { error } = await supabase.from('posts').delete().eq('id', postId); 
    if (error) {
      Alert.alert("Delete Error", error.message);
    } else {
      fetchModeration();
      Alert.alert("Post Deleted", "The post has been permanently removed from the platform.");
    }
  };

  // 12. Disband Cohort
  const disbandCohort = async (cohortId, isActive) => {
    await supabase.from('cohorts').update({ is_active: !isActive }).eq('id', cohortId); 
    fetchHealth();
  };

  // 13. Global Broadcast
  const sendBroadcast = async () => {
    if (!broadcastMessage) return;
    await supabase.from('broadcasts').insert({ title: "SYSTEM ALERT", message: broadcastMessage, admin_id: profile?.id });
    setBroadcastMessage(""); Alert.alert("Broadcast Sent!");
  };

  // 14. Reset AI Resume
  const resetResume = async (userId) => {
    await supabase.from('resume_analyses').delete().eq('user_id', userId); Alert.alert("Resume Cleared");
  };

  // 17. Maintenance Mode
  const toggleMaintenance = async () => {
    const next = !maintenanceMode;
    await supabase.from('platform_settings').upsert({ id: 1, maintenance_mode: next });
    setMaintenanceMode(next);
  };

  // 18. Skill Injection
  const injectSkill = async () => {
    if (!skillInput) return;
    await supabase.from('approved_skills').insert({ name: skillInput });
    setSkillInput(""); Alert.alert("Skill Injected"); fetchIntelligence();
  };

  const renderGridMenu = () => {
    const modules = [
      { id: 'analytics', title: 'Live Analytics', icon: '📊', sub: 'Global Overview' },
      { id: 'users', title: 'User Directory', icon: '👥', sub: 'Wipes, Roles & Bans' },
      { id: 'mentors', title: 'Mentorship', icon: '🛡️', sub: 'Approvals & Overrides' },
      { id: 'moderation', title: 'Moderation', icon: '🧹', sub: 'Posts & Shadowbans' },
      { id: 'intelligence', title: 'Intelligence', icon: '🧠', sub: 'Skills & AI Logs' },
      { id: 'health', title: 'Cohorts', icon: '❤️', sub: 'Study Groups' },
      { id: 'broadcasts', title: 'Broadcast', icon: '📢', sub: 'Global System Alerts' },
      { id: 'settings', title: 'Settings', icon: '⚙️', sub: 'Maintenance & Config' },
    ];
    return (
      <View style={styles.grid}>
        {modules.map(mod => (
          <Pressable key={mod.id} onPress={() => setActiveModule(mod.id)} style={styles.gridCard}>
            <Text style={{ fontSize: 32, marginBottom: 12 }}>{mod.icon}</Text>
            <Text style={{ color: C.text, fontWeight: '700', fontSize: 15, marginBottom: 4 }}>{mod.title}</Text>
            <Text style={{ color: C.muted, fontSize: 12 }}>{mod.sub}</Text>
          </Pressable>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: 'transparent' }]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient colors={[`${C.accent}22`, `${C.accent}00`]} style={styles.glow1} />
        <LinearGradient colors={[`${C.cyan}18`, `${C.cyan}00`]} style={styles.glow2} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.container, { maxWidth: isWide ? 1600 : "100%" }]}>
          
          <View style={styles.header}>
            <View style={styles.brandWrap}>
              {activeModule !== 'menu' ? (
                <Pressable onPress={() => setActiveModule('menu')} style={{ paddingRight: 16, paddingVertical: 4 }}>
                  <Feather name="arrow-left" size={24} color={C.text} />
                </Pressable>
              ) : (
                <LinearGradient colors={[C.accent, C.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoMark}>
                  <Text style={styles.logoChar}>SG</Text>
                </LinearGradient>
              )}
              <View>
                <Text style={[styles.brandName, { color: C.text }]}>SkillGenome</Text>
                <Text style={[styles.brandSub, { color: C.muted }]}>OMNISCIENT ADMIN</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {activeModule === 'menu' && (
                <Pressable onPress={onOpenSettings} style={[styles.iconBtn, { backgroundColor: 'transparent' }]}>
                  <Feather name="settings" size={22} color={C.muted} />
                </Pressable>
              )}
              <Pressable onPress={onOpenAdminNotifications} style={[styles.iconBtn, { backgroundColor: 'transparent', position: 'relative' }]}>
                <Feather name="bell" size={22} color={C.muted} />
              </Pressable>
              <Pressable style={styles.profileBtn} onPress={onOpenEditProfile}>
                {profile?.avatarUrl ? (
                  <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                ) : (
                  <LinearGradient colors={[C.accent, C.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
                    <Text style={styles.avatarLetter}>{profile?.name?.[0]?.toUpperCase() || "A"}</Text>
                  </LinearGradient>
                )}
              </Pressable>
            </View>
          </View>

          {activeModule !== 'menu' && (
            <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
              <Text style={{ color: C.text, fontSize: 24, fontWeight: '800' }}>{activeModule.toUpperCase()}</Text>
            </View>
          )}

          {activeModule === 'menu' && renderGridMenu()}

          {loading ? (
            <ActivityIndicator size="large" color={C.accent} style={{ marginTop: 50 }} />
          ) : (
            <View style={{ paddingHorizontal: 20 }}>
              {/* Analytics */}
              {activeModule === 'analytics' && stats && (
                <View style={{ gap: 16 }}>
                  {[
                    { label: "Total Registered Users", val: stats.users },
                    { label: "Active Learning Cohorts", val: stats.cohorts },
                    { label: "Total Community Posts", val: stats.posts },
                    { label: "Resumes Analyzed", val: stats.resumeCount },
                  ].map((s, i) => (
                    <View key={i} style={styles.card}>
                      <Text style={{ color: C.muted, fontSize: 13, textTransform: 'uppercase', fontWeight: '600', marginBottom: 4 }}>{s.label}</Text>
                      <Text style={{ color: C.text, fontSize: 32, fontWeight: '900' }}>{s.val}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Mentors */}
              {activeModule === 'mentors' && (
                <View style={{ gap: 16 }}>
                  {mentors.length === 0 ? <Text style={{ color: C.muted }}>No mentors.</Text> : mentors.map(m => (
                    <View key={m.id} style={styles.card}>
                      <Text style={{ color: C.text, fontWeight: '700', fontSize: 16 }}>{m.name}</Text>
                      <Text style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Verified: {m.is_verified ? "Yes" : "No"}</Text>
                      <Pressable onPress={() => toggleMentorStatus(m.id, m.is_verified)} style={[styles.btn, { backgroundColor: C.surface2, marginTop: 12 }]}>
                        <Text style={{ color: C.text, fontWeight: '700' }}>{m.is_verified ? "Revoke Verification" : "Approve Mentor"}</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}

              {/* Users */}
              {activeModule === 'users' && (
                <View style={{ gap: 24 }}>
                  <View>
                    <Text style={{ color: C.text, fontSize: 18, fontWeight: '800', marginBottom: 12 }}>Mentors</Text>
                    <View style={{ gap: 12 }}>
                      {allUsers.filter(u => u.role === 'mentor').map(u => (
                        <View key={u.id} style={[styles.card, { padding: 16 }]}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            {u.avatarUrl ? (
                              <Image source={{ uri: u.avatarUrl }} style={styles.avatar} />
                            ) : (
                              <LinearGradient colors={[C.accent, C.cyan]} style={styles.avatar}>
                                <Text style={styles.avatarLetter}>{u.name?.[0]?.toUpperCase() || "M"}</Text>
                              </LinearGradient>
                            )}
                            <View style={{ marginLeft: 12, flex: 1 }}>
                              <Text style={{ color: C.text, fontWeight: '700', fontSize: 16 }}>{u.name}</Text>
                              <Text style={{ color: C.muted, fontSize: 12, textTransform: 'capitalize' }}>{u.role}</Text>
                            </View>
                            <Pressable onPress={() => hardWipeUser(u.id)}>
                              <Feather name="trash-2" size={20} color={C.rose} />
                            </Pressable>
                          </View>
                          
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {u.is_banned ? (
                              <Pressable onPress={() => executeUnban(u.id)} style={[styles.pill, { backgroundColor: C.surface2 }]}>
                                <Text style={{ color: C.text, fontSize: 12 }}>Unban Account</Text>
                              </Pressable>
                            ) : (
                              <Pressable onPress={() => openBanModal(u)} style={[styles.pill, { backgroundColor: C.rose }]}>
                                <Text style={{ color: '#fff', fontSize: 12 }}>Disband / Ban</Text>
                              </Pressable>
                            )}
                            <Pressable onPress={() => toggleShadowban(u.id, u.shadowbanned)} style={[styles.pill, { backgroundColor: u.shadowbanned ? C.amber : C.surface2 }]}>
                              <Text style={{ color: u.shadowbanned ? '#fff' : C.text, fontSize: 12 }}>{u.shadowbanned ? 'Shadowbanned' : 'Shadowban'}</Text>
                            </Pressable>
                            <Pressable onPress={() => switchRole(u.id, u.role)} style={[styles.pill, { backgroundColor: C.surface2 }]}>
                              <Text style={{ color: C.text, fontSize: 12 }}>Force Role: Student</Text>
                            </Pressable>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View>
                    <Text style={{ color: C.text, fontSize: 18, fontWeight: '800', marginBottom: 12 }}>Students</Text>
                    <View style={{ gap: 12 }}>
                      {allUsers.filter(u => u.role !== 'mentor').map(u => (
                        <View key={u.id} style={[styles.card, { padding: 16 }]}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            {u.avatarUrl ? (
                              <Image source={{ uri: u.avatarUrl }} style={styles.avatar} />
                            ) : (
                              <LinearGradient colors={[C.accent, C.cyan]} style={styles.avatar}>
                                <Text style={styles.avatarLetter}>{u.name?.[0]?.toUpperCase() || "S"}</Text>
                              </LinearGradient>
                            )}
                            <View style={{ marginLeft: 12, flex: 1 }}>
                              <Text style={{ color: C.text, fontWeight: '700', fontSize: 16 }}>{u.name}</Text>
                              <Text style={{ color: C.muted, fontSize: 12, textTransform: 'capitalize' }}>{u.role}</Text>
                            </View>
                            <Pressable onPress={() => hardWipeUser(u.id)}>
                              <Feather name="trash-2" size={20} color={C.rose} />
                            </Pressable>
                          </View>
                          
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {u.is_banned ? (
                              <Pressable onPress={() => executeUnban(u.id)} style={[styles.pill, { backgroundColor: C.surface2 }]}>
                                <Text style={{ color: C.text, fontSize: 12 }}>Unban Account</Text>
                              </Pressable>
                            ) : (
                              <Pressable onPress={() => openBanModal(u)} style={[styles.pill, { backgroundColor: C.rose }]}>
                                <Text style={{ color: '#fff', fontSize: 12 }}>Disband / Ban</Text>
                              </Pressable>
                            )}
                            <Pressable onPress={() => toggleShadowban(u.id, u.shadowbanned)} style={[styles.pill, { backgroundColor: u.shadowbanned ? C.amber : C.surface2 }]}>
                              <Text style={{ color: u.shadowbanned ? '#fff' : C.text, fontSize: 12 }}>{u.shadowbanned ? 'Shadowbanned' : 'Shadowban'}</Text>
                            </Pressable>
                            <Pressable onPress={() => switchRole(u.id, u.role)} style={[styles.pill, { backgroundColor: C.surface2 }]}>
                              <Text style={{ color: C.text, fontSize: 12 }}>Force Role: Mentor</Text>
                            </Pressable>
                            <Pressable onPress={() => resetResume(u.id)} style={[styles.pill, { backgroundColor: C.surface2 }]}>
                              <Text style={{ color: C.text, fontSize: 12 }}>Wipe AI Resume</Text>
                            </Pressable>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* Broadcasts */}
              {activeModule === 'broadcasts' && (
                <View style={{ gap: 16 }}>
                  <TextInput
                    style={[styles.card, { color: C.text, minHeight: 120, textAlignVertical: 'top' }]}
                    placeholder="Type an announcement..."
                    placeholderTextColor={C.muted}
                    multiline
                    value={broadcastMessage}
                    onChangeText={setBroadcastMessage}
                  />
                  <Pressable onPress={sendBroadcast} style={[styles.btn, { backgroundColor: C.accent, borderColor: C.accentEnd }]}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Send Global Push Alert</Text>
                  </Pressable>
                </View>
              )}

              {/* Intelligence */}
              {activeModule === 'intelligence' && (
                <View style={{ gap: 20 }}>
                  <View style={styles.card}>
                    <Text style={{ color: C.text, fontWeight: '800', marginBottom: 12 }}>Inject New Skill to AI Dictionary</Text>
                    <TextInput style={{ backgroundColor: C.surface2, color: C.text, padding: 12, borderRadius: 8, marginBottom: 12 }} placeholder="e.g. GPT-5" value={skillInput} onChangeText={setSkillInput} />
                    <Pressable onPress={injectSkill} style={[styles.btn, { backgroundColor: C.accent }]}>
                      <Text style={{ color: '#fff' }}>Inject Skill</Text>
                    </Pressable>
                  </View>
                  <View style={{ marginTop: 24, marginBottom: 12 }}>
                    <Text style={{ color: C.text, fontWeight: '800', marginBottom: 12 }}>INJECTED AI DICTIONARY (MANUAL)</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {injectedSkills.length === 0 ? <Text style={{ color: C.muted, fontSize: 12 }}>No manually injected skills.</Text> : injectedSkills.map((s) => (
                        <View key={s.id} style={[styles.pill, { backgroundColor: C.surface2, borderColor: C.border }]}>
                          <Text style={{ color: C.text, fontSize: 12, fontWeight: '600' }}>{s.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View>
                    <Text style={{ color: C.text, fontWeight: '800', marginBottom: 12 }}>TRENDING GENOMES</Text>
                    {trendingSkills.map((s, i) => (
                      <View key={i} style={[styles.card, { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, padding: 12 }]}>
                        <Text style={{ color: C.text, fontWeight: '600' }}>{s.name}</Text>
                        <Text style={{ color: C.accent, fontWeight: '800' }}>{s.count}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Moderation */}
              {activeModule === 'moderation' && (
                <View style={{ gap: 12 }}>
                  {flaggedPosts.length === 0 ? <Text style={{ color: C.muted }}>No posts.</Text> : flaggedPosts.map(p => (
                    <View key={p.id} style={styles.card}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: C.muted, fontSize: 12, flex: 1 }}>{p.profiles?.name} {p.profiles?.shadowbanned ? "(Shadowbanned)" : ""}</Text>
                        <Pressable onPress={() => deletePost(p.id)}>
                          <Feather name="trash-2" size={18} color={C.rose} />
                        </Pressable>
                      </View>
                      <Text style={{ color: C.text, marginVertical: 8 }}>{p.content}</Text>
                      {p.images && p.images.length > 0 && (
                        <Image source={{ uri: p.images[0] }} style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 12 }} resizeMode="cover" />
                      )}
                      <Pressable onPress={() => toggleShadowban(p.author_id, p.profiles?.shadowbanned || false)} style={{ backgroundColor: C.surface2, padding: 8, borderRadius: 6, alignSelf: 'flex-start' }}>
                        <Text style={{ color: C.text, fontWeight: '700', fontSize: 12 }}>{p.profiles?.shadowbanned ? 'Un-shadowban Author' : 'Shadowban Author'}</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}

              {/* Health / Cohorts */}
              {activeModule === 'health' && (
                <View style={{ gap: 12 }}>
                  <Text style={{ color: C.muted, marginBottom: 8 }}>Active Study Groups</Text>
                  {cohorts.length === 0 ? <Text style={{ color: C.muted }}>No active cohorts.</Text> : cohorts.map(c => (
                    <View key={c.id} style={[styles.card, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: C.text, fontWeight: '700' }}>{c.name || "Study Group"} {c.is_active === false && "(Disbanded)"}</Text>
                        <Text style={{ color: C.muted, fontSize: 12 }}>Created by {c.profiles?.name}</Text>
                      </View>
                      <Pressable onPress={() => disbandCohort(c.id, c.is_active !== false)} style={{ backgroundColor: c.is_active !== false ? C.roseLight : C.surface2, padding: 8, borderRadius: 6 }}>
                        <Text style={{ color: c.is_active !== false ? C.rose : C.text, fontWeight: '700', fontSize: 12 }}>
                          {c.is_active !== false ? 'Disband' : 'Un-disband'}
                        </Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}

              {/* Settings */}
              {activeModule === 'settings' && (
                <View style={{ gap: 16 }}>
                  <View style={[styles.card, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                    <View>
                      <Text style={{ color: C.text, fontWeight: '700' }}>Maintenance Mode</Text>
                      <Text style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>Block non-admin logins</Text>
                    </View>
                    <Pressable onPress={toggleMaintenance} style={{ backgroundColor: maintenanceMode ? C.rose : C.surface2, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                      <Text style={{ color: maintenanceMode ? '#fff' : C.text, fontWeight: '700' }}>{maintenanceMode ? 'ACTIVE' : 'OFF'}</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Ban Modal Overlay */}
      {banUserObj && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 20 }]}>
          <View style={{ backgroundColor: C.surface, width: '100%', maxWidth: 400, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ color: C.rose, fontSize: 20, fontWeight: '800', marginBottom: 8 }}>Ban User: {banUserObj.name}</Text>
            <Text style={{ color: C.text, fontSize: 14, marginBottom: 16 }}>Select duration and provide a reason for this permanent/temporary ban. They will receive a notification immediately.</Text>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {["3 Days", "7 Days", "30 Days", "Permanent"].map(d => (
                <Pressable key={d} onPress={() => setBanDuration(d)} style={[styles.pill, { backgroundColor: banDuration === d ? C.rose : C.surface2, borderColor: banDuration === d ? C.rose : C.border }]}>
                  <Text style={{ color: banDuration === d ? '#fff' : C.text, fontSize: 13, fontWeight: '600' }}>{d}</Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={{ backgroundColor: C.surface2, color: C.text, padding: 16, borderRadius: 12, minHeight: 100, textAlignVertical: 'top', marginBottom: 24 }}
              placeholder="Reason for ban..."
              placeholderTextColor={C.muted}
              multiline
              value={banReason}
              onChangeText={setBanReason}
            />
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable onPress={() => setBanUserObj(null)} style={[styles.btn, { flex: 1, backgroundColor: C.surface2 }]}>
                <Text style={{ color: C.text, fontWeight: '700' }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={executeBan} style={[styles.btn, { flex: 1, backgroundColor: C.rose, borderColor: C.rose }]}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Confirm Ban</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const getStyles = (C) => StyleSheet.create({
  root: { flex: 1 },
  glow1: { position: 'absolute', top: 0, left: 0, right: 0, height: 400 },
  glow2: { position: 'absolute', top: 200, right: -100, width: 300, height: 400, transform: [{ rotate: '-45deg' }] },
  container: { flex: 1, alignSelf: 'center', width: '100%' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 45, paddingBottom: 15 
  },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoMark: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logoChar: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: -0.5 },
  brandName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  brandSub: { fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  profileBtn: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { padding: 8, borderRadius: 20 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: '#fff', fontWeight: '800', fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, padding: 20 },
  gridCard: { width: (width - 56) / 2, backgroundColor: C.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  card: { backgroundColor: C.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  btn: { paddingVertical: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: C.border }
});
