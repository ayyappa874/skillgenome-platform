import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Animated, TextInput, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { t } from "../utils/translations";
import { getTheme } from "../utils/theme";
import { supabase } from "../utils/supabase";

const MentorsScreen = ({ profile = {}, onBack, onOpenChat, isDarkMode = true, language = 'English' }) => {
  
  const T = getTheme(isDarkMode);
  const S = React.useMemo(() => getStyles(T), [T]);
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;

  const [mentors, setMentors] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("Recommended");

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    const fetchMentors = async () => {
      if (!profile?.id) return;
      try {
        setLoading(true);
        // 1. Fetch mentors
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'mentor')
          .eq('is_verified', true);
        if (error) throw error;

        // 2. Fetch active requests for this student
        const { data: reqData } = await supabase
          .from('mentorship_requests')
          .select('*')
          .eq('student_id', profile.id);

        // 3. Score them
        let studentSkills = {};
        try { studentSkills = typeof profile?.skills === 'string' ? JSON.parse(profile.skills) : (profile?.skills || {}); } catch(e){}
        const studentTarget = (profile?.target_role || '').toLowerCase();
        
        const scoredMentors = (data || []).map(m => {
          let score = 30; // base score
          let mSkills = {};
          try { mSkills = typeof m.skills === 'string' ? JSON.parse(m.skills) : (m.skills || {}); } catch(e){}
          
          let hasSkills = false;
          // Skill gap matching
          Object.keys(studentSkills).forEach(sk => {
             hasSkills = true;
             const stuLvl = parseInt(studentSkills[sk], 10) || 0;
             const menLvl = parseInt(mSkills[sk], 10) || 0;
             if (stuLvl < 50 && menLvl > 70) {
               score += 40; // High bonus for filling a gap
             } else if (menLvl > stuLvl) {
               score += 10;
             }
          });

          // If no skills are defined in DB yet, fallback to base score (previously 92 for demo, now 30)
          if (!hasSkills) {
             score = 30; 
          }

          // Role matching
          if (studentTarget && m.current_role?.toLowerCase().includes(studentTarget)) {
            score += 30;
          }

          const finalScore = Math.min(100, score);
          const request = reqData?.find(r => r.mentor_id === m.id);
          
          return {
            id: m.id,
            name: m.name || 'Anonymous Mentor',
            role: m.current_role || 'Mentor',
            co: m.company || 'Industry',
            bio: m.bio || 'Experienced professional ready to guide you.',
            rating: (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1), // Mock rating
            matchScore: finalScore,
            isMatch: finalScore >= 80,
            status: request ? request.status : 'none'
          };
        });

        scoredMentors.sort((a, b) => b.matchScore - a.matchScore);
        setMentors(scoredMentors);
      } catch(e) {
        console.error("Error fetching mentors:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [profile?.id]);

  const MentorCard = ({ m }) => {
    const [status, setStatus] = React.useState(m.status); // none, pending, accepted

    const handleConnect = async () => {
      if (status === 'none') {
        // Optimistic UI
        setStatus('pending');
        try {
          const { error } = await supabase.from('mentorship_requests').insert({
            mentor_id: m.id,
            student_id: profile.id,
            status: 'pending'
          });
          if (error) {
            setStatus('none');
            Alert.alert("Error", error.message);
          } else {
            Alert.alert("Request Sent", `Connection request sent to ${m.name}.`);
          }
        } catch (e) {
          setStatus('none');
          console.error(e);
        }
      } else if (status === 'accepted') {
        if (onOpenChat) {
          onOpenChat(m);
        } else {
          Alert.alert("Chat", `Opening chat with ${m.name}...`);
        }
      }
    };

    return (
      <View style={[S.card, { borderColor: m.isMatch ? T.accent : T.borderLow, backgroundColor: m.isMatch ? `${T.accent}08` : T.surface }]}>
        {m.isMatch && (
          <View style={[S.matchBadge, { backgroundColor: T.accent }]}>
            <Text style={S.matchText}>✨ {m.matchScore}% MATCH</Text>
          </View>
        )}
        <View style={S.cardTop}>
          <LinearGradient colors={[T.accent, T.purple]} style={S.avatar}>
            <Text style={S.avatarText}>{m.name[0]}</Text>
          </LinearGradient>
          <View style={S.info}>
            <Text style={S.name}>{m.name}</Text>
            <Text style={S.role}>{m.role}</Text>
            <Text style={S.co}>🏢 {m.co}</Text>
          </View>
        </View>

        <Text style={S.bio}>{m.bio}</Text>

        <View style={S.bottomRow}>
          <View style={S.ratingBadge}>
            <Text style={S.ratingText}>★ {m.rating}</Text>
          </View>
          <Pressable 
            onPress={handleConnect}
            style={({ pressed }) => [
              S.actionBtn, 
              status === 'pending' && { backgroundColor: T.surface2, borderColor: T.border },
              status === 'none' && { backgroundColor: T.accent, borderColor: T.accent },
              status === 'accepted' && { backgroundColor: T.cyan, borderColor: T.cyan },
              pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
            ]}
          >
            <Text style={[S.actionText, status === 'pending' && { color: T.text }]}>
              {status === 'none' ? 'Connect' : status === 'pending' ? 'Pending' : 'Chat'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      {/* Ambient */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["rgba(168,85,247,0.15)", "transparent"]}
          style={{ position: "absolute", top: -80, right: -60, width: 340, height: 340, borderRadius: 170 }}
        />
      </View>

      <View style={S.header}>
        <Pressable style={S.backBtn} onPress={onBack}>
          <Text style={S.backIcon}>←</Text>
        </Pressable>
        <View>
          <Text style={S.pageTitle}>Mentorship</Text>
          <Text style={S.pageSub}>Connect with industry leaders</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 16 }}>
          
          <View style={[S.searchWrap, { backgroundColor: T.surface, borderColor: T.border }]}>
            <Text style={S.searchIcon}>🔍</Text>
            <TextInput
              style={[S.searchInput, { color: T.text }]}
              placeholder="Search by role, company, or name..."
              placeholderTextColor={T.muted}
            />
          </View>

          <View style={S.filterRow}>
            {["Recommended", "Top Rated", "My Mentors"].map((f) => {
              const isActive = activeTab === f;
              return (
                <Pressable 
                  key={f} 
                  onPress={() => setActiveTab(f)}
                  style={[S.filterChip, isActive && { borderColor: T.purple, backgroundColor: `${T.purple}15` }]}
                >
                  <Text style={[S.filterText, isActive && { color: T.purple }]}>{f}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[S.list, { marginTop: 24 }]}>
            {loading ? (
              <Text style={{ color: T.muted, textAlign: 'center', marginTop: 40 }}>Loading mentors...</Text>
            ) : (() => {
              // Filter and sort based on active tab
              let displayMentors = [...mentors];
              if (activeTab === "My Mentors") {
                displayMentors = displayMentors.filter(m => m.status === 'accepted' || m.status === 'pending');
              } else if (activeTab === "Top Rated") {
                displayMentors.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
              } else {
                displayMentors.sort((a, b) => b.matchScore - a.matchScore);
              }

              if (displayMentors.length === 0) {
                return (
                  <View style={{ alignItems: 'center', marginTop: 40 }}>
                    <Text style={{ fontSize: 40, marginBottom: 12 }}>🎓</Text>
                    <Text style={{ color: T.text, fontSize: 18, fontWeight: 'bold' }}>
                      {activeTab === "My Mentors" ? "No connected mentors yet" : "No mentors available"}
                    </Text>
                    <Text style={{ color: T.muted, fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 20 }}>
                      {activeTab === "My Mentors" 
                        ? "Check the Recommended tab to find your first mentor!" 
                        : "Check back later to connect with industry leaders."}
                    </Text>
                  </View>
                );
              }

              return displayMentors.map(m => <MentorCard key={m.id} m={m} />);
            })()}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  root: { flex: 1 },
  header:  {
    flexDirection: "row", alignItems: "center", gap: 16,
    paddingTop: Platform.OS === "ios" ? 72 : 56,
    paddingHorizontal: 20, paddingBottom: 16,
  },
  backBtn:   { width: 42, height: 42, borderRadius: 21, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, alignItems: "center", justifyContent: "center" },
  backIcon:  { fontSize: 18, color: T.text, fontWeight: "600", marginTop: -2 },
  pageTitle: { fontSize: 24, fontWeight: "900", color: T.text, letterSpacing: -0.5 },
  pageSub:   { fontSize: 14, color: T.muted, fontWeight: "500", marginTop: 2 },
  
  content: { paddingHorizontal: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },

  searchWrap: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, height: 50 },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15 },

  filterRow: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: T.borderLow, backgroundColor: T.surface },
  filterText: { fontSize: 13, color: T.muted, fontWeight: "600" },

  list: { gap: 20 },
  card: { padding: 20, borderRadius: 24, borderWidth: 1, gap: 14, ...T.cardShadow },
  matchBadge: { position: "absolute", top: 16, right: 16, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, ...T.cardShadow },
  matchText: { fontSize: 10, fontWeight: "800", color: "#fff" },
  cardTop: { flexDirection: "row", gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 24, fontWeight: "800", color: "#fff" },
  info: { flex: 1, justifyContent: "center" },
  name: { fontSize: 16, fontWeight: "800", color: T.text },
  role: { fontSize: 13, color: T.muted, marginTop: 2 },
  co: { fontSize: 13, color: T.cyan, fontWeight: "600", marginTop: 4 },
  bio: { fontSize: 14, color: T.text, lineHeight: 22, opacity: 0.9 },
  
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 4 },
  ratingBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: T.surface2 },
  ratingText: { fontSize: 13, fontWeight: "700", color: T.amber },
  actionBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  actionText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});

export default MentorsScreen;
