import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Animated, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { t } from "../utils/translations";
import { getTheme } from "../utils/theme";

const JobDetailScreen = ({ job = {}, onBack, onApply, isDarkMode = true, language = 'English' }) => {
  const T = getTheme(isDarkMode);
  const S = React.useMemo(() => getStyles(T), [T]);
  const [liked, setLiked] = React.useState(false);

  const j = {
    title: job.title || "Senior AI Engineer",
    co:    job.company || "Google",
    loc:   job.location || "Remote",
    pay:   job.salaryInr || "$180k - $220k",
    type:  job.employmentType || "Full-time",
    match: job.matchPercent || 94,
    c1:    job.color || T.accent,
    desc:  job.description || "As an AI Engineer, you will lead the architecture of our next-gen machine learning systems. You will work closely with product, engineering, and research to bring state of the art models into production environments.",
    req:   job.requiredSkills || ["Python", "TensorFlow", "MLOps", "AWS", "PyTorch"],
    matched: job.matchedSkills || ["Python", "AWS"]
  };

  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleApply = () => {
    if (typeof onApply === 'function') onApply(j);
    else Alert.alert("Application Sent", `You applied to ${j.title} at ${j.co}.`);
  };

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      {/* Ambient */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[`${j.c1}20`, "transparent"]}
          style={{ position: "absolute", top: -60, left: -60, width: 340, height: 340, borderRadius: 170 }}
        />
      </View>

      <View style={S.header}>
        <Pressable style={S.backBtn} onPress={onBack}>
          <Text style={S.backIcon}>←</Text>
        </Pressable>
        <Pressable style={[S.backBtn, { borderColor: liked ? T.rose : T.border }]} onPress={() => setLiked(!liked)}>
          <Text style={[S.backIcon, { color: liked ? T.rose : T.text }]}>{liked ? "♥" : "♡"}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 24 }}>
          
          {/* Top Hero */}
          <View style={S.hero}>
            <LinearGradient colors={[j.c1, T.cyan]} style={S.logo}>
              <Text style={S.logoText}>{j.co[0]}</Text>
            </LinearGradient>
            <Text style={S.title}>{j.title}</Text>
            <Text style={S.co}>{j.co}</Text>

            <View style={S.metaWrap}>
              <View style={S.metaPill}><Text style={S.metaText}>📍 {j.loc}</Text></View>
              <View style={S.metaPill}><Text style={S.metaText}>💰 {j.pay}</Text></View>
              <View style={S.metaPill}><Text style={S.metaText}>🏷️ {j.type}</Text></View>
            </View>

            <View style={[S.matchBox, { borderColor: `${j.c1}30`, backgroundColor: `${j.c1}10` }]}>
              <Text style={S.matchLabel}>Genome Match</Text>
              <Text style={[S.matchScore, { color: j.c1 }]}>{j.match}%</Text>
            </View>
          </View>

          {/* Description */}
          <View style={S.section}>
            <Text style={S.sectionTitle}>THE ROLE</Text>
            <Text style={S.descText}>{j.desc}</Text>
          </View>

          {/* Skills */}
          <View style={S.section}>
            <Text style={S.sectionTitle}>REQUIREMENTS & MATCH</Text>
            <View style={S.skillWrap}>
              {j.req.map(s => {
                const isMat = j.matched.includes(s);
                return (
                  <View key={s} style={[S.skillPill, { borderColor: isMat ? `${j.c1}44` : T.borderLow, backgroundColor: isMat ? `${j.c1}15` : T.surface }]}>
                    <Text style={[S.skillText, { color: isMat ? j.c1 : T.muted }]}>{isMat ? `✓ ${s}` : `✗ ${s}`}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Apply */}
          <Pressable onPress={handleApply} style={S.applyWrap}>
            <LinearGradient colors={[j.c1, T.accentEnd]} start={{x:0,y:0}} end={{x:1,y:0}} style={S.applyBtn}>
              <Text style={S.applyText}>Quick Apply  →</Text>
            </LinearGradient>
          </Pressable>

        </Animated.View>
      </ScrollView>
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  root: { flex: 1 },
  header:  {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 72 : 56,
    paddingHorizontal: 20, paddingBottom: 16,
  },
  backBtn:   { width: 42, height: 42, borderRadius: 21, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, alignItems: "center", justifyContent: "center" },
  backIcon:  { fontSize: 18, color: T.text, fontWeight: "600", marginTop: -2 },

  content: { paddingHorizontal: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },

  hero: { alignItems: "center", gap: 10, paddingVertical: 10 },
  logo: { width: 64, height: 64, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  logoText: { fontSize: 32, fontWeight: "800", color: "#fff" },
  title: { fontSize: 24, fontWeight: "900", color: T.text, textAlign: "center", letterSpacing: -0.5 },
  co: { fontSize: 15, color: T.muted },

  metaWrap: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 4 },
  metaPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: T.surface, borderWidth: 1, borderColor: T.borderLow },
  metaText: { fontSize: 12, color: T.text, fontWeight: "600" },

  matchBox: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1, marginTop: 10 },
  matchLabel: { fontSize: 13, fontWeight: "700", color: T.text },
  matchScore: { fontSize: 18, fontWeight: "900" },

  section: { gap: 12 },
  sectionTitle: { fontSize: 10, fontWeight: "700", color: T.muted, letterSpacing: 1 },
  descText: { fontSize: 15, color: T.text, lineHeight: 24, opacity: 0.9 },

  skillWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillPill: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  skillText: { fontSize: 13, fontWeight: "700" },

  applyWrap: { borderRadius: 16, overflow: "hidden", marginTop: 10 },
  applyBtn: { paddingVertical: 18, alignItems: "center" },
  applyText: { color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 0.1 },
});

export default JobDetailScreen;
