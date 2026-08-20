import * as React from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Platform, Image, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTheme } from '../utils/theme';

// ── Design tokens ────────────────────────────────────────────────
const T = {
  bg:      "#09090b",
  surface: "rgba(255,255,255,0.05)",
  border:  "rgba(255,255,255,0.1)",
  borderLow:"rgba(255,255,255,0.06)",
  text:    "#fafafa",
  muted:   "#71717a",
  subtle:  "#27272a",
  accent:  "#7c3aed",
  cyan:    "#06b6d4",
  green:   "#22c55e",
  rose:    "#f43f5e",
  amber:   "#f59e0b",
  purple:  "#a855f7",
};

const MODULES = [
  { label: "Resume DNA",   score: null, accent: T.accent,  scoreKey: "resumeScore"  },
  { label: "ThoughtPrint", score: null, accent: T.rose,    scoreKey: "thoughtScore" },
  { label: "EmotionPrint", score: null, accent: T.amber,   scoreKey: "emotionScore" },
  { label: "GitHub Dev",   score: null, accent: T.purple,  scoreKey: "githubScore"  },
];

function ProgressBar({ value, color }) {
  const anim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(anim, { toValue: value, duration: 800, delay: 300, useNativeDriver: false }).start();
  }, [value]);
  return (
    <View style={[pb.track, { backgroundColor: T.subtle }]}>
      <Animated.View style={[pb.fill, {
        width: anim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
        backgroundColor: color,
      }]} />
    </View>
  );
}
const pb = StyleSheet.create({
  track: { height: 4, borderRadius: 2, overflow: "hidden", flex: 1 },
  fill:  { height: "100%", borderRadius: 2 },
});

const ProfileScreen = ({
  onBack, onOpenSettings, onOpenEditProfile,
  profile = {}, profileSkills = [], resumeAnalysis = null,
  githubSkills = [], recordingDuration = 0, journalEntries = [],
  isDarkMode = true, language = 'English'
}) => {
  const T = getTheme(isDarkMode);
  const [avatarFailed, setAvatarFailed] = React.useState(false);

  const name        = profile.name       || 'Ayyappa';
  const title       = profile.title      || 'AI Engineer';
  const bio         = profile.bio        || 'Passionate about AI, career intelligence, and skill mapping.';
  const location    = profile.location   || 'India';
  const experience  = profile.experience ?? 0;
  const skills      = Array.isArray(profile.skills) && profile.skills.length ? profile.skills : profileSkills;

  // Scores
  const resumeScore = resumeAnalysis?.extractedSkills?.length
    ? Math.round(resumeAnalysis.extractedSkills.reduce((s, i) => s + (i.score || 80), 0) / resumeAnalysis.extractedSkills.length)
    : 0;
  const githubScore  = Math.min(95, 35 + (githubSkills?.length || 0) * 14);
  const thoughtScore = Math.min(92, 30 + (journalEntries?.length || 0) * 12);
  const emotionScore = Math.min(95, Math.round((recordingDuration / 60) * 12 + 50));
  const hasData      = resumeScore > 0 || githubScore > 35 || journalEntries.length > 0;
  const genomeScore  = hasData
    ? Math.round((resumeScore + githubScore + thoughtScore + emotionScore) / 4)
    : 0;

  const modScores = { resumeScore, thoughtScore, emotionScore, githubScore };

  // Entrance
  const fade  = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const accentColors = [T.accent, T.cyan, T.rose, T.green, T.amber, T.purple];

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      {/* Background ambient */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["rgba(124,58,237,0.18)", "transparent"]}
          style={{ position: "absolute", top: -80, right: -80, width: 380, height: 380, borderRadius: 190 }}
        />
      </View>

      {/* Top bar */}
      <View style={S.topBar}>
        <Pressable style={S.iconBtn} onPress={() => typeof onBack === 'function' && onBack()}>
          <Text style={S.iconBtnText}>←</Text>
        </Pressable>
        <Text style={S.topBarTitle}>Profile</Text>
        <Pressable style={S.iconBtn} onPress={() => typeof onOpenSettings === 'function' && onOpenSettings()}>
          <Text style={S.iconBtnText}>⚙</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 20 }}>

          {/* ── HERO ── */}
          <View style={S.hero}>
            {/* Avatar */}
            {profile.avatarUrl && !avatarFailed ? (
              <Image source={{ uri: profile.avatarUrl }} style={S.avatar} onError={() => setAvatarFailed(true)} />
            ) : (
              <LinearGradient
                colors={[T.accent, T.cyan]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={S.avatar}
              >
                <Text style={S.avatarLetter}>{name[0]?.toUpperCase()}</Text>
              </LinearGradient>
            )}
            {/* Online dot */}
            <View style={S.onlineDot} />

            <Text style={S.heroName}>{name}</Text>
            <Text style={S.heroTitle}>{title}</Text>

            <View style={S.heroBadgeRow}>
              {location ? (
                <View style={S.heroBadge}>
                  <Text style={S.heroBadgeText}>📍 {location}</Text>
                </View>
              ) : null}
              {experience > 0 ? (
                <View style={S.heroBadge}>
                  <Text style={S.heroBadgeText}>💼 {experience} yr{experience !== 1 ? 's' : ''}</Text>
                </View>
              ) : null}
              <View style={[S.heroBadge, { backgroundColor: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.3)" }]}>
                <Text style={[S.heroBadgeText, { color: T.green }]}>✦ Active</Text>
              </View>
            </View>
          </View>

          {/* ── GENOME SCORE ── */}
          <View style={[S.card, { borderColor: T.border }]}>
            <LinearGradient
              colors={["rgba(124,58,237,0.12)", "transparent"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={S.scoreRow}>
              <View style={S.scoreLeft}>
                <Text style={S.scoreEyebrow}>CAREER GENOME SCORE</Text>
                <Text style={S.scoreNum}>{genomeScore}<Text style={S.scoreDenom}> / 100</Text></Text>
                <Text style={S.scoreTier}>
                  {genomeScore >= 80 ? "Elite Candidate" : genomeScore >= 60 ? "Strong Profile" : genomeScore >= 30 ? "Building Momentum" : "Getting Started"}
                </Text>
              </View>
              {/* Mini gauge */}
              <LinearGradient
                colors={[T.accent, T.cyan]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={S.gaugeOuter}
              >
                <View style={S.gaugeInner}>
                  <Text style={S.gaugeNum}>{genomeScore}</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Module bars */}
            <View style={S.modBars}>
              {MODULES.map((m) => {
                const sc = modScores[m.scoreKey];
                return (
                  <View key={m.label} style={S.modBarRow}>
                    <Text style={[S.modBarLabel, { color: sc > 0 ? m.accent : T.muted }]}>{m.label}</Text>
                    <ProgressBar value={sc} color={m.accent} />
                    <Text style={[S.modBarScore, { color: sc > 0 ? m.accent : T.muted }]}>
                      {sc > 0 ? sc : "—"}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* ── BIO ── */}
          <View style={[S.card, { borderColor: T.border }]}>
            <Text style={S.cardSectionLabel}>ABOUT</Text>
            <Text style={S.bioText}>{bio}</Text>
          </View>

          {/* ── SKILLS ── */}
          {skills.length > 0 && (
            <View style={S.cardFlat}>
              <Text style={S.cardSectionLabel}>TOP SKILLS</Text>
              <View style={S.skillsWrap}>
                {skills.map((sk, i) => {
                  const a = accentColors[i % accentColors.length];
                  return (
                    <View key={sk} style={[S.skillPill, { borderColor: `${a}44`, backgroundColor: `${a}12` }]}>
                      <Text style={[S.skillPillText, { color: a }]}>{sk}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* ── STATS ── */}
          <View style={[S.statsRow]}>
            {[
              { label: "Skills",   value: skills.length || "—",    accent: T.accent },
              { label: "Sessions", value: journalEntries.length || "—", accent: T.rose },
              { label: "Repos",    value: githubSkills.length > 0 ? githubSkills.length : "—", accent: T.purple },
            ].map((s) => (
              <View key={s.label} style={[S.statCard, { borderColor: T.borderLow }]}>
                <Text style={[S.statVal, { color: s.accent }]}>{s.value}</Text>
                <Text style={S.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* ── EDIT BUTTON ── */}
          <Pressable
            onPress={() => typeof onOpenEditProfile === 'function' && onOpenEditProfile()}
            style={S.editWrap}
          >
            <LinearGradient
              colors={[T.accent, "#5b21b6"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={S.editBtn}
            >
              <Text style={S.editBtnText}>Edit Profile  →</Text>
            </LinearGradient>
          </Pressable>

        </Animated.View>
      </ScrollView>
    </View>
  );
};

const S = StyleSheet.create({
  root:    { flex: 1 },
  topBar:  {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 54 : 28,
    paddingHorizontal: 20, paddingBottom: 14,
  },
  iconBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, alignItems: "center", justifyContent: "center" },
  iconBtnText: { color: T.text, fontSize: 16, fontWeight: "700" },
  topBarTitle: { fontSize: 17, fontWeight: "800", color: T.text, letterSpacing: -0.3 },

  content: { paddingHorizontal: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },

  // Hero
  hero:          { alignItems: "center", paddingVertical: 20, gap: 6, position: "relative" },
  avatar:        { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  avatarLetter:  { color: "#fff", fontSize: 38, fontWeight: "900" },
  onlineDot:     { position: "absolute", top: 90, left: "54%", width: 14, height: 14, borderRadius: 7, backgroundColor: T.green, borderWidth: 2.5, borderColor: T.bg },
  heroName:      { fontSize: 26, fontWeight: "900", color: T.text, letterSpacing: -0.5, marginTop: 8 },
  heroTitle:     { fontSize: 14, color: T.muted, fontWeight: "500" },
  heroBadgeRow:  { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap", justifyContent: "center" },
  heroBadge:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface },
  heroBadgeText: { fontSize: 12, color: T.muted, fontWeight: "600" },

  // Score card
  card: { borderRadius: 20, borderWidth: 1, padding: 22, backgroundColor: T.surface, overflow: "hidden", gap: 18 },
  scoreRow:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  scoreLeft:     { gap: 4 },
  scoreEyebrow:  { fontSize: 10, fontWeight: "700", color: T.muted, letterSpacing: 1 },
  scoreNum:      { fontSize: 44, fontWeight: "900", color: T.text, letterSpacing: -2 },
  scoreDenom:    { fontSize: 20, fontWeight: "700", color: T.muted },
  scoreTier:     { fontSize: 13, fontWeight: "700", color: T.accent },
  gaugeOuter:    { width: 90, height: 90, borderRadius: 45, padding: 5, alignItems: "center", justifyContent: "center" },
  gaugeInner:    { width: "100%", height: "100%", borderRadius: 40, backgroundColor: "#0f0f11", alignItems: "center", justifyContent: "center" },
  gaugeNum:      { fontSize: 28, fontWeight: "900", color: T.text, letterSpacing: -1 },

  modBars:      { gap: 12 },
  modBarRow:    { flexDirection: "row", alignItems: "center", gap: 10 },
  modBarLabel:  { fontSize: 11, fontWeight: "700", width: 92 },
  modBarScore:  { fontSize: 12, fontWeight: "800", width: 28, textAlign: "right" },

  // Bio card
  cardFlat:        { gap: 14 },
  cardSectionLabel:{ fontSize: 10, fontWeight: "700", color: T.muted, letterSpacing: 1 },
  bioText:         { fontSize: 14, color: T.muted, lineHeight: 22 },

  // Skills
  skillsWrap:    { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillPill:     { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  skillPillText: { fontSize: 13, fontWeight: "700" },

  // Stats row
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 16, gap: 4, backgroundColor: T.surface, alignItems: "center" },
  statVal:  { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  statLabel:{ fontSize: 11, color: T.muted, fontWeight: "600" },

  // Edit button
  editWrap: { borderRadius: 16, overflow: "hidden" },
  editBtn:  { paddingVertical: 17, alignItems: "center" },
  editBtnText: { color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 0.1 },

  borderLow: { borderColor: T.borderLow },
});

export default ProfileScreen;
