import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { t } from "../utils/translations";
import { getTheme } from "../utils/theme";

const T = {
  bg:       "#09090b",
  surface:  "rgba(255,255,255,0.05)",
  surface2: "rgba(255,255,255,0.08)",
  border:   "rgba(255,255,255,0.1)",
  text:     "#fafafa",
  muted:    "#71717a",
  accent:   "#7c3aed",
  accentEnd:"#5b21b6",
  cyan:     "#06b6d4",
  green:    "#22c55e",
  amber:    "#f59e0b",
  rose:     "#f43f5e",
  purple:   "#a855f7",
};

const JOBS = [
  { id: 1, co: "Google",    title: "Senior AI Engineer", loc: "Remote", type: "Full-time", pay: "$180k - $220k", match: 94, c1: T.accent, c2: T.cyan, req: ["Python", "TensorFlow", "MLOps", "AWS"] },
  { id: 2, co: "Stripe",    title: "Full Stack Developer", loc: "SF / Hybrid", type: "Full-time", pay: "$160k - $190k", match: 88, c1: T.purple, c2: T.rose, req: ["React Native", "Node.js", "TypeScript", "PostgreSQL"] },
  { id: 3, co: "Microsoft", title: "Data Scientist", loc: "Remote", type: "Contract", pay: "$140k - $170k", match: 76, c1: T.cyan, c2: T.green, req: ["Python", "SQL", "Statistics", "PowerBI"] },
];

const JobMatchesScreen = ({ onBack, onOpenJob, profileSkills = [], isDarkMode = true }) => {
  const T = getTheme(isDarkMode);
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      {/* Ambient */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["rgba(6,182,212,0.15)", "transparent"]}
          style={{ position: "absolute", top: -80, right: -60, width: 340, height: 340, borderRadius: 170 }}
        />
      </View>

      <View style={S.header}>
        <Pressable style={S.backBtn} onPress={onBack}>
          <Text style={S.backIcon}>←</Text>
        </Pressable>
        <View>
          <Text style={S.pageTitle}>Career Matches</Text>
          <Text style={S.pageSub}>Based on your DNA genome</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 16 }}>
          
          <View style={S.filterRow}>
            {["Best Match", "Remote", "High Salary", "Recent"].map((f, i) => (
              <View key={f} style={[S.filterChip, i === 0 && { borderColor: T.accent, backgroundColor: `${T.accent}15` }]}>
                <Text style={[S.filterText, i === 0 && { color: T.accent, fontWeight: "700" }]}>{f}</Text>
              </View>
            ))}
          </View>

          <View style={S.list}>
            {JOBS.map(j => {
              const matched = j.req.filter(s => profileSkills.map(p => (p||"").toLowerCase()).includes((s||"").toLowerCase()));
              return (
                <Pressable key={j.id} style={[S.jobCard, { borderColor: T.border }]} onPress={() => onOpenJob && onOpenJob(j)}>
                  <View style={S.cardTop}>
                    <View style={S.cardLeft}>
                      <LinearGradient colors={[j.c1, j.c2]} style={S.logo}>
                        <Text style={S.logoText}>{j.co[0]}</Text>
                      </LinearGradient>
                      <View>
                        <Text style={S.jobTitle}>{j.title}</Text>
                        <Text style={S.jobCo}>{j.co}</Text>
                      </View>
                    </View>
                    <View style={[S.matchRing, { borderColor: j.c1 }]}>
                      <Text style={[S.matchNum, { color: j.c1 }]}>{j.match}%</Text>
                    </View>
                  </View>

                  <View style={S.metaWrap}>
                    <Text style={S.metaItem}>📍 {j.loc}</Text>
                    <Text style={S.metaItem}>💰 {j.pay}</Text>
                    <Text style={S.metaItem}>🏷️ {j.type}</Text>
                  </View>

                  <View style={S.skillWrap}>
                    {j.req.map(s => {
                      const isMat = matched.includes(s);
                      return (
                        <View key={s} style={[S.skillPill, { borderColor: isMat ? `${j.c1}44` : T.borderLow, backgroundColor: isMat ? `${j.c1}11` : T.surface }]}>
                          <Text style={[S.skillText, { color: isMat ? j.c1 : T.muted }]}>{isMat ? `✓ ${s}` : s}</Text>
                        </View>
                      );
                    })}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const S = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 16, paddingTop: Platform.OS === "ios" ? 54 : 28, paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 18, color: T.text, fontWeight: "600" },
  pageTitle: { fontSize: 22, fontWeight: "800", color: T.text, letterSpacing: -0.4 },
  pageSub: { fontSize: 12, color: T.muted, marginTop: 2 },
  content: { paddingHorizontal: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },

  filterRow: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface },
  filterText: { fontSize: 13, color: T.text, fontWeight: "600" },

  list: { gap: 14 },
  jobCard: { borderRadius: 20, borderWidth: 1, padding: 20, backgroundColor: T.surface, gap: 16 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardLeft: { flexDirection: "row", gap: 12, flex: 1 },
  logo: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 20, fontWeight: "800", color: "#fff" },
  jobTitle: { fontSize: 17, fontWeight: "800", color: T.text },
  jobCo: { fontSize: 13, color: T.muted, marginTop: 2 },
  matchRing: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  matchNum: { fontSize: 13, fontWeight: "800" },

  metaWrap: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: -4 },
  metaItem: { fontSize: 12, color: T.muted, fontWeight: "500" },

  skillWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  skillText: { fontSize: 11, fontWeight: "700" },
});

export default JobMatchesScreen;
