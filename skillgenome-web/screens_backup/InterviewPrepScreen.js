import * as React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Platform, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
  accentEnd:"#5b21b6",
  cyan:     "#06b6d4",
  green:    "#22c55e",
  purple:   "#a855f7",
  amber:    "#f59e0b",
};

const ChecklistItem = ({ checked, label, onToggle }) => (
  <Pressable onPress={onToggle} style={S.checkRow}>
    <View style={[S.checkBox, checked && S.checkBoxChecked, { borderColor: checked ? T.accent : T.border }]}>
      {checked && <Text style={S.checkMark}>✓</Text>}
    </View>
    <Text style={[S.checkLabel, checked && { textDecorationLine: 'line-through', color: T.muted }]}>{label}</Text>
  </Pressable>
);

const InterviewPrepScreen = ({
  onBack, onStartMockInterview, onStartMockTest, onOpenResumeTips,
  role = 'Senior AI Engineer', company = 'Google DeepMind',
  job = null, isDarkMode = true
}) => {
  const T = getTheme(isDarkMode);
  const [activeTab, setActiveTab] = React.useState('roadmap'); // roadmap, technical, behavioral
  
  // Checklist State
  const [checks, setChecks] = React.useState({
    resume: false, github: false, systemDesign: false, behavioral: false
  });
  const toggleCheck = (k) => setChecks(p => ({...p, [k]: !p[k]}));

  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const progress = Object.values(checks).filter(Boolean).length / 4;

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      {/* Ambient glow */}
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
          <Text style={S.pageTitle}>Interview Prep</Text>
          <Text style={S.pageSub}>Target: {company}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 20 }}>
          
          {/* Target Role Hero */}
          <View style={[S.heroCard, { borderColor: T.cyan, backgroundColor: `${T.cyan}08` }]}>
            <View style={S.heroTop}>
              <View style={[S.heroIconWrap, { backgroundColor: T.cyan }]}>
                <Text style={S.heroIconText}>🎯</Text>
              </View>
              <View style={S.heroInfo}>
                <Text style={S.heroRole}>{role}</Text>
                <Text style={S.heroCo}>@ {company}</Text>
              </View>
            </View>
            <View style={S.progressWrap}>
              <Text style={S.progressLabel}>Readiness Score</Text>
              <Text style={S.progressVal}>{Math.round(progress * 100)}%</Text>
            </View>
            <View style={[S.progressTrack, { backgroundColor: T.border }]}>
              <View style={[S.progressFill, { width: `${progress * 100}%`, backgroundColor: T.cyan }]} />
            </View>
          </View>

          {/* Action Tabs */}
          <View style={S.tabRow}>
            {["roadmap", "technical", "behavioral"].map(tName => (
              <Pressable 
                key={tName} 
                onPress={() => setActiveTab(tName)}
                style={[S.tabBtn, activeTab === tName && { backgroundColor: T.surface, borderColor: T.border }]}
              >
                <Text style={[S.tabText, activeTab === tName && { color: T.text, fontWeight: "700" }]}>
                  {tName.charAt(0).toUpperCase() + tName.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Tab Content */}
          {activeTab === 'roadmap' && (
            <View style={S.section}>
              <Text style={S.sectionTitle}>PREPARATION CHECKLIST</Text>
              <View style={[S.card, { borderColor: T.border }]}>
                <ChecklistItem checked={checks.resume} onToggle={() => toggleCheck('resume')} label="Review & optimize Resume" />
                <View style={S.divider} />
                <ChecklistItem checked={checks.github} onToggle={() => toggleCheck('github')} label="Clean up top GitHub repos" />
                <View style={S.divider} />
                <ChecklistItem checked={checks.systemDesign} onToggle={() => toggleCheck('systemDesign')} label="Practice System Design" />
                <View style={S.divider} />
                <ChecklistItem checked={checks.behavioral} onToggle={() => toggleCheck('behavioral')} label="Prepare STAR method stories" />
              </View>
            </View>
          )}

          {activeTab === 'technical' && (
            <View style={S.section}>
              <Text style={S.sectionTitle}>TECHNICAL MOCK</Text>
              <View style={[S.card, { borderColor: T.border, gap: 14 }]}>
                <Text style={S.cardTitle}>System Design & Coding</Text>
                <Text style={S.cardDesc}>AI-driven technical mock interview tailored for {role} at {company}. Simulates real coding round environments.</Text>
                <Pressable onPress={onStartMockTest} style={[S.actionBtn, { borderColor: T.purple, backgroundColor: `${T.purple}15` }]}>
                  <Text style={[S.actionText, { color: T.purple }]}>Start Technical Test</Text>
                </Pressable>
              </View>
            </View>
          )}

          {activeTab === 'behavioral' && (
            <View style={S.section}>
              <Text style={S.sectionTitle}>BEHAVIORAL MOCK</Text>
              <View style={[S.card, { borderColor: T.border, gap: 14 }]}>
                <Text style={S.cardTitle}>Live Audio Interview</Text>
                <Text style={S.cardDesc}>Practice your communication, tone, and pacing with a live AI recruiter. Real-time feedback on your EQ.</Text>
                <Pressable onPress={onStartMockInterview} style={[S.actionBtn, { borderColor: T.accent, backgroundColor: `${T.accent}15` }]}>
                  <Text style={[S.actionText, { color: T.accent }]}>Start Audio Interview</Text>
                </Pressable>
              </View>
            </View>
          )}

          <Text style={S.footerNote}>
            💡 Pro tip: Complete your GitHub and Resume DNA modules first for a more accurate interview simulation.
          </Text>

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
  pageSub: { fontSize: 13, color: T.cyan, marginTop: 2, fontWeight: "600" },
  
  content: { paddingHorizontal: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },

  heroCard: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 16 },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  heroIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  heroIconText: { fontSize: 24 },
  heroInfo: { flex: 1 },
  heroRole: { fontSize: 18, fontWeight: "800", color: T.text },
  heroCo: { fontSize: 14, color: T.muted },
  progressWrap: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  progressLabel: { fontSize: 12, color: T.text, fontWeight: "600" },
  progressVal: { fontSize: 16, fontWeight: "800", color: T.cyan },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },

  tabRow: { flexDirection: "row", gap: 8, paddingBottom: 4, marginTop: 4 },
  tabBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: "transparent", alignItems: "center" },
  tabText: { fontSize: 14, color: T.muted, fontWeight: "600" },

  section: { gap: 12 },
  sectionTitle: { fontSize: 10, fontWeight: "700", color: T.muted, letterSpacing: 1, marginLeft: 4 },
  card: { borderRadius: 18, borderWidth: 1, backgroundColor: T.surface, padding: 16 },
  
  checkRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 8 },
  checkBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  checkBoxChecked: { backgroundColor: T.accent },
  checkMark: { color: "#fff", fontSize: 12, fontWeight: "800" },
  checkLabel: { fontSize: 15, color: T.text, flex: 1 },
  divider: { height: 1, backgroundColor: T.borderLow, marginVertical: 4 },

  cardTitle: { fontSize: 16, fontWeight: "800", color: T.text },
  cardDesc: { fontSize: 13, color: T.muted, lineHeight: 20 },
  actionBtn: { paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: "center", marginTop: 4 },
  actionText: { fontSize: 14, fontWeight: "800" },

  footerNote: { fontSize: 12, color: T.muted, textAlign: "center", lineHeight: 20, marginTop: 10 },
});

export default InterviewPrepScreen;
