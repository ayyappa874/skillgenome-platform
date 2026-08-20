import * as React from "react";
import { ScrollView, StyleSheet, View, Text, Pressable, Platform, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { t } from "../utils/translations";
import { getTheme } from "../utils/theme";

const AnalysisResultsScreen = ({ onBack, onSave, analysisData, isDarkMode = true, language = 'English' }) => {
  const T = getTheme(isDarkMode);
  const S = React.useMemo(() => getStyles(T), [T]);
  const currentYear = new Date().getFullYear();
  const expYears = analysisData?.experienceYears || 4;
  
  const skills = analysisData?.extractedSkills || [
    { name: 'Python', score: 95 },
    { name: 'React Native', score: 88 },
    { name: 'Machine Learning', score: 85 },
    { name: 'System Design', score: 78 }
  ];

  const jobMatches = analysisData?.jobMatches || [
    { jobTitle: "Senior AI Engineer", matchPercent: "92%", color: T.accent },
    { jobTitle: "Full Stack Mobile Dev", matchPercent: "85%", color: T.cyan },
    { jobTitle: "Data Scientist", matchPercent: "78%", color: T.green }
  ];

  const summary = analysisData?.summary || 
    "Experienced ML engineer with strong backend and mobile frontend experience. Capable of productionizing models and designing complex architectures.";
  const genomeScore = analysisData?.trueGenomeScore || 85;

  // Animations
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;
  const ringScale = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(ringScale, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true })
    ]).start();
  }, []);

  const handleSave = () => {
    if (onSave) onSave({ ...analysisData, extractedSkills: skills, jobMatches, summary, trueGenomeScore: genomeScore });
  };

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      {/* Ambient glow */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["rgba(124,58,237,0.2)", "transparent"]}
          style={{ position: "absolute", top: -80, right: -60, width: 340, height: 340, borderRadius: 170 }}
        />
      </View>

      <View style={S.header}>
        <Pressable style={S.backBtn} onPress={onBack}>
          <Text style={S.backIcon}>←</Text>
        </Pressable>
        <View>
          <Text style={S.pageTitle}>Analysis Results</Text>
          <Text style={S.pageSub}>Genome mapping complete</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 20 }}>
          
          {/* File Success Header */}
          <View style={[S.card, { borderColor: T.border, flexDirection: "row", alignItems: "center", padding: 16 }]}>
            <View style={S.fileIconWrap}>
              <Text style={S.fileIcon}>📄</Text>
            </View>
            <View style={S.fileInfo}>
              <Text style={S.fileName}>{analysisData?.fileName || "Uploaded_Resume.pdf"}</Text>
              <Text style={S.fileSub}>{analysisData?.candidateName || "User"} · {expYears} yrs experience</Text>
            </View>
            <Text style={S.checkIcon}>✅</Text>
          </View>

          {/* Score Hero */}
          <View style={[S.heroCard, { borderColor: T.border }]}>
            <LinearGradient colors={["rgba(124,58,237,0.1)", "transparent"]} style={StyleSheet.absoluteFill} />
            <Text style={S.heroEyebrow}>CALCULATED GENOME SCORE</Text>
            
            <Animated.View style={[S.scoreRing, { transform: [{ scale: ringScale }] }]}>
              <LinearGradient colors={[T.accent, T.cyan]} start={{x:0,y:0}} end={{x:1,y:1}} style={S.scoreRingInner}>
                <View style={S.scoreRingBg}>
                  <Text style={S.scoreNum}>{genomeScore}</Text>
                </View>
              </LinearGradient>
            </Animated.View>

            <Text style={S.heroSummary}>{summary}</Text>
          </View>

          {/* Extracted Skills */}
          <View style={S.section}>
            <Text style={S.sectionTitle}>EXTRACTED SKILLS ({skills.length})</Text>
            <View style={S.skillsWrap}>
              {skills.map((s, i) => (
                <View key={s.name} style={[S.skillPill, { borderColor: T.border, backgroundColor: T.surface }]}>
                  <Text style={S.skillName}>{s.name}</Text>
                  <Text style={[S.skillScore, { color: i < 2 ? T.accent : T.cyan }]}>{s.score}%</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Job Matches */}
          <View style={S.section}>
            <Text style={S.sectionTitle}>TOP CAREER MATCHES</Text>
            <View style={S.matchList}>
              {jobMatches.map((j) => (
                <View key={j.jobTitle} style={[S.matchCard, { borderColor: T.border, backgroundColor: T.surface }]}>
                  <View style={S.matchLeft}>
                    <Text style={S.matchTitle}>{j.jobTitle}</Text>
                    <Text style={S.matchSub}>Based on your {expYears} years of experience</Text>
                  </View>
                  <View style={[S.matchScoreWrap, { backgroundColor: `${j.color}15`, borderColor: `${j.color}30` }]}>
                    <Text style={[S.matchScore, { color: j.color }]}>{j.matchPercent}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Action */}
          <Pressable onPress={handleSave} style={S.saveWrap}>
            <LinearGradient colors={[T.accent, T.accentEnd]} start={{x:0,y:0}} end={{x:1,y:0}} style={S.saveBtn}>
              <Text style={S.saveText}>Save to Profile  →</Text>
            </LinearGradient>
          </Pressable>

        </Animated.View>
      </ScrollView>
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 16, paddingTop: Platform.OS === "ios" ? 72 : 56, paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 18, color: T.text, fontWeight: "600" },
  pageTitle: { fontSize: 22, fontWeight: "800", color: T.text, letterSpacing: -0.4 },
  pageSub: { fontSize: 12, color: T.muted, marginTop: 2 },
  content: { paddingHorizontal: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },

  card: { borderRadius: 16, borderWidth: 1, backgroundColor: T.surface },
  fileIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: T.surface2, alignItems: "center", justifyContent: "center" },
  fileIcon: { fontSize: 20 },
  fileInfo: { flex: 1, marginLeft: 14, gap: 2 },
  fileName: { fontSize: 15, fontWeight: "700", color: T.text },
  fileSub: { fontSize: 12, color: T.muted },
  checkIcon: { fontSize: 18, color: T.green },

  heroCard: { borderRadius: 20, borderWidth: 1, backgroundColor: T.surface, padding: 24, alignItems: "center", overflow: "hidden" },
  heroEyebrow: { fontSize: 10, fontWeight: "700", color: T.muted, letterSpacing: 1, marginBottom: 20 },
  scoreRing: { width: 140, height: 140, borderRadius: 70, backgroundColor: T.border, padding: 4, marginBottom: 20 },
  scoreRingInner: { width: "100%", height: "100%", borderRadius: 66, padding: 4 },
  scoreRingBg: { width: "100%", height: "100%", borderRadius: 62, backgroundColor: T.bg, alignItems: "center", justifyContent: "center" },
  scoreNum: { fontSize: 48, fontWeight: "900", color: T.text, letterSpacing: -2 },
  heroSummary: { fontSize: 14, color: T.muted, textAlign: "center", lineHeight: 22 },

  section: { gap: 12 },
  sectionTitle: { fontSize: 10, fontWeight: "700", color: T.muted, letterSpacing: 1, marginLeft: 4 },
  
  skillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  skillPill: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, gap: 8 },
  skillName: { fontSize: 14, fontWeight: "600", color: T.text },
  skillScore: { fontSize: 14, fontWeight: "800" },

  matchList: { gap: 12 },
  matchCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1 },
  matchLeft: { flex: 1, gap: 4 },
  matchTitle: { fontSize: 16, fontWeight: "800", color: T.text },
  matchSub: { fontSize: 12, color: T.muted },
  matchScoreWrap: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  matchScore: { fontSize: 15, fontWeight: "800" },

  saveWrap: { borderRadius: 16, overflow: "hidden", marginTop: 8 },
  saveBtn: { paddingVertical: 18, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 0.1 },
});

export default AnalysisResultsScreen;

