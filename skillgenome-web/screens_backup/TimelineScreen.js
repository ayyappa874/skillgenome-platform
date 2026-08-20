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
  borderLow:"rgba(255,255,255,0.06)",
  text:     "#fafafa",
  muted:    "#71717a",
  accent:   "#7c3aed",
  cyan:     "#06b6d4",
  green:    "#22c55e",
  amber:    "#f59e0b",
  rose:     "#f43f5e",
  purple:   "#a855f7",
};

// ── Progress Bar ──
const ProgressBar = ({ value, color, height = 4 }) => {
  const anim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(anim, { toValue: value, duration: 800, delay: 200, useNativeDriver: false }).start();
  }, [value]);
  return (
    <View style={[S.track, { height, backgroundColor: T.borderLow }]}>
      <Animated.View style={[S.fill, {
        width: anim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
        backgroundColor: color
      }]} />
    </View>
  );
};

const TimelineScreen = ({
  onBack, onNavigateHome, onOpenAlerts,
  resumeAnalysis, githubAnalysis, thoughtAnalysis, emotionAnalysis,
  journalEntries = [], appliedJobs = [],
  onOpenUploadResume, onOpenGitHubConnect, onOpenEmotionPrint, onOpenThoughtPrint,
  isDarkMode = true, language = 'English'
}) => {
  const T = getTheme(isDarkMode);
  // Score math
  const hasRes = !!resumeAnalysis;
  const hasGit = !!githubAnalysis;
  const hasTho = (journalEntries.length > 0) || !!thoughtAnalysis;
  const hasEmo = !!emotionAnalysis;

  const resScore = hasRes ? (resumeAnalysis.trueGenomeScore || 85) : 0;
  const gitScore = hasGit ? (githubAnalysis.score || 75) : 0;
  const thoScore = hasTho ? (thoughtAnalysis?.adaptabilityScore || 82) : 0;
  const emoScore = hasEmo ? (emotionAnalysis?.eqScore || 78) : 0;

  const activeCount = [hasRes, hasGit, hasTho, hasEmo].filter(Boolean).length;
  const totalScore  = resScore + gitScore + thoScore + emoScore;
  const finalScore  = activeCount > 0 ? Math.round(totalScore / activeCount) : 80;

  // Animations
  const fade  = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const TaskCard = ({ active, title, sub, icon, color, onPress, score }) => (
    <Pressable onPress={active ? null : onPress} style={[S.taskCard, { borderColor: active ? `${color}44` : T.borderLow, backgroundColor: active ? `${color}11` : T.surface }]}>
      <View style={[S.taskIconWrap, { backgroundColor: active ? color : T.surface2 }]}>
        <Text style={[S.taskIcon, { color: active ? "#fff" : T.muted }]}>{icon}</Text>
      </View>
      <View style={S.taskInfo}>
        <Text style={[S.taskTitle, { color: active ? color : T.text }]}>{title}</Text>
        <Text style={S.taskSub}>{active ? `Calibrated · ${score}%` : sub}</Text>
      </View>
      {!active && <Text style={S.chevron}>›</Text>}
      {active && <Text style={[S.chevron, { color }]}>✓</Text>}
    </Pressable>
  );

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      {/* Ambient glow */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["rgba(124,58,237,0.15)", "transparent"]}
          style={{ position: "absolute", top: -100, right: -50, width: 340, height: 340, borderRadius: 170 }}
        />
      </View>

      <View style={S.header}>
        <Pressable style={S.backBtn} onPress={onBack}>
          <Text style={S.backIcon}>←</Text>
        </Pressable>
        <View>
          <Text style={S.pageTitle}>DNA Timeline</Text>
          <Text style={S.pageSub}>Calibrate your 4 core dimensions</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 20 }}>

          {/* Sync Progress */}
          <View style={[S.card, { borderColor: T.border }]}>
            <View style={S.syncRow}>
              <View style={S.syncLeft}>
                <Text style={S.syncLabel}>CALIBRATION SYNC</Text>
                <Text style={S.syncTitle}>{activeCount} of 4 Modules</Text>
              </View>
              <View style={S.scoreCircle}>
                <Text style={S.scoreNum}>{finalScore}</Text>
              </View>
            </View>
            <ProgressBar value={(activeCount / 4) * 100} color={T.accent} height={6} />
            <Text style={S.syncNote}>
              {activeCount === 4 ? "🌟 DNA fully mapped. You are ready to match." : "⚠️ Complete missing modules to unlock top matches."}
            </Text>
          </View>

          {/* Action List */}
          <View style={S.section}>
            <Text style={S.sectionTitle}>DIMENSIONS</Text>
            <View style={S.taskList}>
              <TaskCard active={hasRes} title="Resume DNA"   sub="Upload PDF"         icon="📄" color={T.accent} onPress={onOpenUploadResume} score={resScore} />
              <TaskCard active={hasGit} title="GitHub Dev"   sub="Connect Account"    icon="⌥"  color={T.purple} onPress={onOpenGitHubConnect} score={gitScore} />
              <TaskCard active={hasTho} title="ThoughtPrint" sub="Log first entry"    icon="🧠" color={T.rose}   onPress={onOpenThoughtPrint} score={thoScore} />
              <TaskCard active={hasEmo} title="EmotionPrint" sub="Record 30s audio"   icon="🎙️" color={T.amber}  onPress={onOpenEmotionPrint} score={emoScore} />
            </View>
          </View>

          {/* Recent Activity */}
          <View style={S.section}>
            <Text style={S.sectionTitle}>ACTIVITY LOG</Text>
            {activeCount === 0 && (
              <View style={[S.emptyState, { borderColor: T.border, backgroundColor: T.surface }]}>
                <Text style={S.emptyIcon}>⏳</Text>
                <Text style={S.emptyText}>No recent activity</Text>
                <Text style={S.emptySub}>Start calibrating modules to build history</Text>
              </View>
            )}
            
            <View style={S.timeline}>
              {hasRes && (
                <View style={S.timeItem}>
                  <View style={[S.timeDot, { backgroundColor: T.accent }]} />
                  <View style={[S.timeCard, { borderColor: T.border, backgroundColor: T.surface }]}>
                    <Text style={S.timeTitle}>Resume Parsed</Text>
                    <Text style={S.timeSub}>Extracted 12+ skills from PDF</Text>
                  </View>
                </View>
              )}
              {hasGit && (
                <View style={S.timeItem}>
                  <View style={[S.timeDot, { backgroundColor: T.purple }]} />
                  <View style={[S.timeCard, { borderColor: T.border, backgroundColor: T.surface }]}>
                    <Text style={S.timeTitle}>GitHub Synced</Text>
                    <Text style={S.timeSub}>Analyzed top languages</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
};

const S = StyleSheet.create({
  root:    { flex: 1 },
  header:  { flexDirection: "row", alignItems: "center", gap: 16, paddingTop: Platform.OS === "ios" ? 54 : 28, paddingHorizontal: 20, paddingBottom: 16 },
  backBtn:   { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  backIcon:  { fontSize: 18, color: T.text, fontWeight: "600" },
  pageTitle: { fontSize: 22, fontWeight: "800", color: T.text, letterSpacing: -0.4 },
  pageSub:   { fontSize: 12, color: T.muted, marginTop: 2 },

  content: { paddingHorizontal: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },

  card: { borderRadius: 20, borderWidth: 1, padding: 22, backgroundColor: T.surface, gap: 16 },
  syncRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  syncLeft: { gap: 4 },
  syncLabel: { fontSize: 10, fontWeight: "700", color: T.muted, letterSpacing: 1 },
  syncTitle: { fontSize: 22, fontWeight: "900", color: T.text },
  scoreCircle: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: T.accent, alignItems: "center", justifyContent: "center" },
  scoreNum: { fontSize: 18, fontWeight: "800", color: T.text },
  syncNote: { fontSize: 12, color: T.muted },

  section: { gap: 14, marginTop: 8 },
  sectionTitle: { fontSize: 10, fontWeight: "700", color: T.muted, letterSpacing: 1, marginLeft: 4 },
  
  taskList: { gap: 10 },
  taskCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  taskIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  taskIcon: { fontSize: 18, fontWeight: "700" },
  taskInfo: { flex: 1, gap: 2 },
  taskTitle: { fontSize: 15, fontWeight: "700" },
  taskSub: { fontSize: 12, color: T.muted },
  chevron: { fontSize: 20, color: T.muted, fontWeight: "600" },

  emptyState: { padding: 30, alignItems: "center", borderRadius: 16, borderWidth: 1, borderStyle: "dashed", gap: 8 },
  emptyIcon: { fontSize: 28 },
  emptyText: { fontSize: 15, fontWeight: "700", color: T.text },
  emptySub: { fontSize: 12, color: T.muted },

  timeline: { gap: 16, paddingLeft: 8 },
  timeItem: { flexDirection: "row", alignItems: "center", gap: 16 },
  timeDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: T.bg },
  timeCard: { flex: 1, padding: 16, borderRadius: 14, borderWidth: 1, gap: 4 },
  timeTitle: { fontSize: 14, fontWeight: "700", color: T.text },
  timeSub: { fontSize: 12, color: T.muted },

  track: { width: "100%", overflow: "hidden", borderRadius: 99 },
  fill: { height: "100%", borderRadius: 99 },
});

export default TimelineScreen;
