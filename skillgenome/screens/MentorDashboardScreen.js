import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Animated, TextInput, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { t } from "../utils/translations";
import { getTheme } from "../utils/theme";

const COHORT = [
  { id: 1, name: "Ayyappa", role: "AI Engineer Intern", genome: 82, status: "Active", c: T.cyan },
  { id: 2, name: "Maria S.", role: "Junior Frontend Dev", genome: 75, status: "Reviewing", c: T.purple },
  { id: 3, name: "Alex K.", role: "Data Analyst", genome: 91, status: "Ready to Match", c: T.green },
];

const REQUESTS = [
  { id: 101, name: "James Lee", role: "Backend Developer", message: "Looking for guidance on microservices scaling." },
  { id: 102, name: "Sara V.", role: "Mobile Engineer", message: "Need help structuring my portfolio for Senior roles." },
];

const MentorDashboardScreen = ({ profile = { name: "Mentor", title: "Principal Engineer" }, onLogout, onOpenSettings, isDarkMode = true, language = 'English' }) => {
  
  const T = getTheme(isDarkMode);
  const S = React.useMemo(() => getStyles(T), [T]);
  const [activeTab, setActiveTab] = React.useState("overview");
  
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const TabButton = ({ id, label }) => (
    <Pressable onPress={() => setActiveTab(id)} style={[S.tabBtn, activeTab === id && S.tabBtnActive]}>
      <Text style={[S.tabText, activeTab === id && S.tabTextActive]}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      {/* Ambient glow */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["rgba(124,58,237,0.15)", "transparent"]}
          style={{ position: "absolute", top: -80, right: -60, width: 340, height: 340, borderRadius: 170 }}
        />
      </View>

      <View style={S.header}>
        <View style={S.headerLeft}>
          <LinearGradient colors={[T.accent, T.purple]} style={S.avatar}>
            <Text style={S.avatarText}>{profile.name?.[0]}</Text>
          </LinearGradient>
          <View>
            <Text style={S.headerTitle}>Expert Workspace</Text>
            <Text style={S.headerSub}>{profile.name} · {profile.title}</Text>
          </View>
        </View>
        <Pressable style={S.iconBtn} onPress={onOpenSettings}>
          <Text style={S.iconBtnText}>⚙</Text>
        </Pressable>
      </View>

      <View style={S.tabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.tabScroll}>
          <TabButton id="overview" label="Overview" />
          <TabButton id="cohort" label="My Cohort" />
          <TabButton id="requests" label="Requests (2)" />
          <TabButton id="availability" label="Schedule" />
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 20 }}>
          
          {activeTab === "overview" && (
            <>
              {/* Stats Row */}
              <View style={S.statsRow}>
                {[
                  { l: "Total Mentees", v: "14", c: T.cyan },
                  { l: "Session Hours", v: "42h", c: T.accent },
                  { l: "Mentees Hired", v: "6", c: T.green },
                ].map((s) => (
                  <View key={s.l} style={[S.statCard, { borderColor: T.border, backgroundColor: T.surface }]}>
                    <Text style={[S.statVal, { color: s.c }]}>{s.v}</Text>
                    <Text style={S.statLabel}>{s.l}</Text>
                  </View>
                ))}
              </View>

              {/* Upcoming Session */}
              <View style={S.section}>
                <Text style={S.sectionTitle}>NEXT UP</Text>
                <View style={[S.card, { borderColor: T.accent, backgroundColor: `${T.accent}10` }]}>
                  <View style={S.cardTop}>
                    <View style={S.cardLeft}>
                      <Text style={S.cardIcon}>📅</Text>
                      <View>
                        <Text style={S.cardTitle}>System Design Mock</Text>
                        <Text style={S.cardSub}>with Ayyappa (AI Engineer)</Text>
                      </View>
                    </View>
                    <View style={[S.badge, { backgroundColor: T.accent }]}>
                      <Text style={S.badgeText}>In 2 hrs</Text>
                    </View>
                  </View>
                  <Pressable style={[S.actionBtn, { backgroundColor: T.surface, borderColor: T.border }]} onPress={() => Alert.alert("Join", "Opening meeting link...")}>
                    <Text style={[S.actionText, { color: T.text }]}>Join Meeting Workspace</Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}

          {activeTab === "cohort" && (
            <View style={S.section}>
              <Text style={S.sectionTitle}>ACTIVE MENTEES ({COHORT.length})</Text>
              <View style={S.list}>
                {COHORT.map(m => (
                  <View key={m.id} style={[S.card, { borderColor: T.border, backgroundColor: T.surface }]}>
                    <View style={S.cardTop}>
                      <View style={[S.avatarSm, { backgroundColor: `${m.c}20` }]}>
                        <Text style={S.avatarTextSm}>{m.name[0]}</Text>
                      </View>
                      <View style={S.infoWrap}>
                        <Text style={S.infoTitle}>{m.name}</Text>
                        <Text style={S.infoSub}>{m.role}</Text>
                      </View>
                      <View style={[S.genomeRing, { borderColor: m.c }]}>
                        <Text style={[S.genomeText, { color: m.c }]}>{m.genome}</Text>
                      </View>
                    </View>
                    <View style={S.bottomRow}>
                      <Text style={S.statusText}>Status: {m.status}</Text>
                      <Pressable style={[S.outlineBtn, { borderColor: T.borderLow }]} onPress={() => Alert.alert("Profile", "Opening profile...")}>
                        <Text style={S.outlineText}>View DNA</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {activeTab === "requests" && (
            <View style={S.section}>
              <Text style={S.sectionTitle}>PENDING MENTORSHIP REQUESTS</Text>
              <View style={S.list}>
                {REQUESTS.map(r => (
                  <View key={r.id} style={[S.card, { borderColor: T.border, backgroundColor: T.surface }]}>
                    <Text style={S.infoTitle}>{r.name} <Text style={{ color: T.muted }}>· {r.role}</Text></Text>
                    <Text style={S.msgText}>"{r.message}"</Text>
                    <View style={[S.bottomRow, { marginTop: 10 }]}>
                      <Pressable style={[S.actionBtn, { flex: 1, backgroundColor: T.surface2, borderColor: T.border }]} onPress={() => Alert.alert("Decline", "Declined request.")}>
                        <Text style={[S.actionText, { color: T.text }]}>Decline</Text>
                      </Pressable>
                      <Pressable style={[S.actionBtn, { flex: 1, backgroundColor: T.accent, borderColor: T.accent }]} onPress={() => Alert.alert("Accept", "Accepted request!")}>
                        <Text style={[S.actionText, { color: "#fff" }]}>Accept</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

        </Animated.View>
      </ScrollView>
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? 54 : 28, paddingHorizontal: 20, paddingBottom: 16 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 20, fontWeight: "800", color: "#fff" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: T.text, letterSpacing: -0.4 },
  headerSub: { fontSize: 13, color: T.muted, marginTop: 2, fontWeight: "500" },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  iconBtnText: { fontSize: 18, color: T.text, fontWeight: "600" },

  tabs: { borderBottomWidth: 1, borderBottomColor: T.borderLow, paddingBottom: 10 },
  tabScroll: { paddingHorizontal: 20, gap: 8 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, backgroundColor: "transparent" },
  tabBtnActive: { backgroundColor: T.surface, borderWidth: 1, borderColor: T.border },
  tabText: { fontSize: 14, fontWeight: "600", color: T.muted },
  tabTextActive: { color: T.text, fontWeight: "700" },

  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },

  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, gap: 4 },
  statVal: { fontSize: 24, fontWeight: "900", letterSpacing: -1 },
  statLabel: { fontSize: 11, color: T.muted, fontWeight: "600" },

  section: { gap: 12 },
  sectionTitle: { fontSize: 10, fontWeight: "700", color: T.muted, letterSpacing: 1, marginLeft: 4 },
  
  list: { gap: 12 },
  card: { padding: 18, borderRadius: 18, borderWidth: 1, gap: 14 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardIcon: { fontSize: 24 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: T.text },
  cardSub: { fontSize: 13, color: T.muted, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "800", color: "#fff" },

  actionBtn: { paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  actionText: { fontSize: 14, fontWeight: "700" },

  avatarSm: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarTextSm: { fontSize: 18, fontWeight: "700", color: T.text },
  infoWrap: { flex: 1 },
  infoTitle: { fontSize: 15, fontWeight: "800", color: T.text },
  infoSub: { fontSize: 13, color: T.muted, marginTop: 2 },
  genomeRing: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  genomeText: { fontSize: 13, fontWeight: "800" },
  
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  statusText: { fontSize: 12, color: T.muted, fontWeight: "600" },
  outlineBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  outlineText: { fontSize: 12, fontWeight: "700", color: T.text },

  msgText: { fontSize: 14, color: T.muted, fontStyle: "italic", lineHeight: 22 },
});

export default MentorDashboardScreen;
