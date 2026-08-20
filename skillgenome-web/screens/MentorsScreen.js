import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Animated, TextInput, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { t } from "../utils/translations";
import { getTheme } from "../utils/theme";

const MENTORS = [
  { id: 1, name: "Sarah Jenkins", role: "Principal ML Engineer", co: "OpenAI", rating: 4.9, bio: "10+ years in deep learning. Can help you crack ML system design interviews.", isMatch: true },
  { id: 2, name: "David Chen", role: "Sr. Mobile Architect", co: "Stripe", rating: 4.8, bio: "Expert in React Native and mobile infra. Happy to review your portfolio.", isMatch: false },
  { id: 3, name: "Priya Patel", role: "Engineering Manager", co: "Vercel", rating: 5.0, bio: "Transitioning from IC to management? Let's chat about leadership paths.", isMatch: false },
];

const MentorsScreen = ({ onBack, isDarkMode = true, language = 'English' }) => {
  const T = getTheme(isDarkMode);
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const MentorCard = ({ m }) => {
    const [status, setStatus] = React.useState('none'); // none, pending, accepted

    const handleConnect = () => {
      if (status === 'none') {
        setStatus('pending');
        Alert.alert("Request Sent", `Connection request sent to ${m.name}.`);
      } else if (status === 'pending') {
        setStatus('none');
      } else if (status === 'accepted') {
        Alert.alert("Chat", `Opening chat with ${m.name}...`);
      }
    };

    return (
      <View style={[S.card, { borderColor: m.isMatch ? T.accent : T.borderLow, backgroundColor: m.isMatch ? `${T.accent}08` : T.surface }]}>
        {m.isMatch && (
          <View style={[S.matchBadge, { backgroundColor: T.accent }]}>
            <Text style={S.matchText}>DNA MATCH</Text>
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
            style={[
              S.actionBtn, 
              status === 'pending' && { backgroundColor: T.surface2, borderColor: T.border },
              status === 'none' && { backgroundColor: T.accent, borderColor: T.accent },
              status === 'accepted' && { backgroundColor: T.cyan, borderColor: T.cyan },
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
            {["Recommended", "Top Rated", "My Mentors"].map((f, i) => (
              <View key={f} style={[S.filterChip, i === 0 && { borderColor: T.purple, backgroundColor: `${T.purple}15` }]}>
                <Text style={[S.filterText, i === 0 && { color: T.purple }]}>{f}</Text>
              </View>
            ))}
          </View>

          <View style={S.list}>
            {MENTORS.map(m => <MentorCard key={m.id} m={m} />)}
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

  list: { gap: 16 },
  card: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 14 },
  matchBadge: { position: "absolute", top: 16, right: 16, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
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
