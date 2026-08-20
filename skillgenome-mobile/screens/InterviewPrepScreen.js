import * as React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Animated, Alert, Switch, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getTheme } from "../utils/theme";

const SESSION_TYPES = [
  { id: 'quick_drill', icon: '⚡', title: 'Quick Drill', duration: '10 min', desc: '3 targeted questions. Instant feedback.', color: 'amber', bestFor: 'Daily practice, warming up', threshold: '< 65' },
  { id: 'mock', icon: '🎭', title: 'Mock Interview', duration: '45 min', desc: 'Full simulation. Live video analysis.', color: 'accent', bestFor: 'Final prep, confidence building', threshold: '>= 75' },
  { id: 'skill_gap', icon: '🎯', title: 'Skill Gap Drill', duration: '20 min', desc: 'Deep dive to close your biggest gap.', color: 'cyan', bestFor: 'Closing specific weaknesses' },
  { id: 'behavioral', icon: '🌟', title: 'Behavioral Practice', duration: '15 min', desc: 'STAR stories and personal story bank.', color: 'purple', bestFor: 'Amazon, Meta, behavioral-heavy companies' },
  { id: 'company_prep', icon: '🏢', title: 'Company Prep', duration: '30 min', desc: 'Company-specific interview simulation.', color: 'rose', bestFor: 'When interview is within 2 weeks' },
  { id: 'salary', icon: '💰', title: 'Salary Negotiation', duration: '10 min', desc: 'Practice negotiating your offer.', color: 'green', bestFor: 'After getting an offer' },
  { id: 'confidence', icon: '💪', title: 'Confidence Builder', duration: '10 min', desc: 'Easy wins. No hard questions today.', color: 'cyan', bestFor: 'High stress days' },
];

const InterviewPrepScreen = ({
  onBack, onStartMockInterview, onStartMockTest,
  profile, skills = [], resumeAnalysis, isDarkMode = true, language = 'English'
}) => {
  const T = getTheme(isDarkMode);
  const S = React.useMemo(() => getStyles(T), [T]);
  
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;

  const name = profile?.name?.split(" ")[0] || "Candidate";
  const readinessScore = profile?.total_score || 85;
  const status = readinessScore >= 85 ? "READY TO APPLY ✅" : readinessScore >= 65 ? "ALMOST READY ⚡" : "BUILDING FOUNDATION 🏗️";
  
  // Slicers data
  const resumeSkills = (skills || []).map(s => ({ name: s, type: 'tech', level: Math.floor(Math.random() * 40) + 55 })); // Mock levels
  const profileSkills = (profile?.profile_skills || ['Leadership', 'Communication', 'Agile']).map(s => ({ name: s, type: 'soft', level: 100 }));
  
  const [selectedSkills, setSelectedSkills] = React.useState([]);
  const [selectedSession, setSelectedSession] = React.useState(null);
  const [videoEnabled, setVideoEnabled] = React.useState(true);
  const [audioEnabled, setAudioEnabled] = React.useState(true);
  const [sidebarEnabled, setSidebarEnabled] = React.useState(true);
  
  const [targetRole, setTargetRole] = React.useState("Senior AI Engineer");
  const [targetCompany, setTargetCompany] = React.useState("Google DeepMind");

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const toggleSkill = (skillName) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  const handleStart = () => {
    if (!targetRole.trim() || !targetCompany.trim()) {
      Alert.alert("Wait!", "Please enter your Target Role and Company.");
      return;
    }
    if (selectedSkills.length === 0) {
      Alert.alert("Wait!", "Please select at least one skill topic.");
      return;
    }
    if (!selectedSession) {
      Alert.alert("Wait!", "Please select a session type.");
      return;
    }
    if (onStartMockInterview) {
      onStartMockInterview(selectedSession.id, selectedSkills, targetRole, targetCompany);
    }
  };

  const getChipColor = (skill) => {
    if (skill.type === 'soft') return T.purple;
    if (skill.level >= 85) return T.green;
    if (skill.level >= 60) return T.cyan;
    return T.amber;
  };

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      <View style={S.header}>
        <Pressable style={S.backBtn} onPress={onBack}>
          <Text style={S.backIcon}>←</Text>
        </Pressable>
        <View>
          <Text style={S.pageTitle}>AI Copilot</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 24 }}>
          
          {/* Readiness & Target Setup Card */}
          <View style={[S.readinessCard, { borderColor: T.border, backgroundColor: T.surface }]}>
            <View style={S.readinessHeader}>
              <Text style={S.greetingText}>Hey {name}! 👋</Text>
            </View>
            

            
            <View style={S.divider} />
            
            <Text style={S.setupTitle}>Your Target</Text>
            <View style={S.setupRow}>
                <View style={S.inputGroup}>
                    <Text style={S.inputLabel}>Role</Text>
                    <TextInput 
                        style={S.setupInput}
                        value={targetRole}
                        onChangeText={setTargetRole}
                        placeholder="e.g. Product Manager"
                        placeholderTextColor={T.muted}
                    />
                </View>
                <View style={S.inputGroup}>
                    <Text style={S.inputLabel}>Company</Text>
                    <TextInput 
                        style={S.setupInput}
                        value={targetCompany}
                        onChangeText={setTargetCompany}
                        placeholder="e.g. Meta"
                        placeholderTextColor={T.muted}
                    />
                </View>
            </View>
          </View>

          {/* STEP 1: TOPIC SELECTION */}
          <View style={S.stepSection}>
            <Text style={S.stepTitle}>Step 1 — What topics do you want to cover?</Text>
            <Text style={S.stepSub}>Select one or more skills from your resume and profile. Questions will be generated only for what you pick.</Text>
            
            <View style={S.chipContainer}>
              {resumeSkills.map(s => {
                const color = getChipColor(s);
                const isSel = selectedSkills.includes(s.name);
                return (
                  <Pressable key={s.name} onPress={() => toggleSkill(s.name)} style={[S.chip, { backgroundColor: isSel ? color + '20' : T.surface, borderColor: isSel ? color : T.border }]}> 
                    <View style={[S.chipDot, { backgroundColor: color }]} />
                    <Text style={[S.chipText, { color: isSel ? color : T.text }]}>{s.name} {s.level}%</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={S.chipContainer}>
              {profileSkills.map(s => {
                const color = getChipColor(s);
                const isSel = selectedSkills.includes(s.name);
                return (
                  <Pressable key={s.name} onPress={() => toggleSkill(s.name)} style={[S.chip, { backgroundColor: isSel ? color + '20' : T.surface, borderColor: isSel ? color : T.border }]}> 
                    <View style={[S.chipDot, { backgroundColor: color }]} />
                    <Text style={[S.chipText, { color: isSel ? color : T.text }]}>{s.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* STEP 2: SESSION TYPE */}
          <View style={S.stepSection}>
            <Text style={S.stepTitle}>Step 2 — What would you like to do today?</Text>
            <Text style={S.stepSub}>Questions will be generated from your selected topics above.</Text>
            
            <View style={S.grid}>
              {SESSION_TYPES.map(type => {
                const colorHex = T[type.color] || T.accent;
                const isSel = selectedSession?.id === type.id;
                return (
                  <Pressable 
                    key={type.id} 
                    style={[S.sessionBtn, { borderColor: isSel ? colorHex : T.border, backgroundColor: isSel ? colorHex + '10' : T.surface }]}
                    onPress={() => setSelectedSession(type)}
                  >
                    <View style={[S.iconBox, { backgroundColor: colorHex + "20" }]}>
                      <Text style={S.iconEmoji}>{type.icon}</Text>
                    </View>
                    <View style={S.sessionInfo}>
                      <Text style={[S.sessionTitle, isSel && { color: colorHex }]}>{type.title}</Text>
                      <View style={S.durationRow}>
                        <Text style={S.sessionDuration}>⏱️ {type.duration}</Text>
                      </View>
                      <Text style={S.sessionDesc} numberOfLines={2}>{type.desc}</Text>
                    </View>
                  </Pressable>
                )
              })}
            </View>
          </View>

          {/* STEP 3: VIDEO SETUP */}
          <View style={S.stepSection}>
            <Text style={S.stepTitle}>Step 3 — Set up live analysis</Text>
            <Text style={S.stepSub}>EmotionPrint tracks your confidence, stress and body language in real-time while you practice.</Text>
            
            <View style={[S.setupCard, { backgroundColor: T.surface, borderColor: T.border }]}>
              <View style={S.toggleRow}>
                <Text style={S.toggleText}>🎥 Enable live video analysis</Text>
                <Switch value={videoEnabled} onValueChange={setVideoEnabled} trackColor={{ true: T.accent }} />
              </View>
              <View style={S.toggleRow}>
                <Text style={S.toggleText}>🎤 Enable voice analysis</Text>
                <Switch value={audioEnabled} onValueChange={setAudioEnabled} trackColor={{ true: T.accent }} />
              </View>
              <View style={[S.toggleRow, { borderBottomWidth: 0 }]}>
                <Text style={S.toggleText}>📊 Show live sidebar</Text>
                <Switch value={sidebarEnabled} onValueChange={setSidebarEnabled} trackColor={{ true: T.accent }} />
              </View>
            </View>
          </View>

          {/* START BUTTON */}
          <Pressable 
            style={[S.startBtn, { backgroundColor: (selectedSkills.length > 0 && selectedSession) ? T.accent : T.surface }]} 
            onPress={handleStart}
          >
            <Text style={[S.startBtnText, { color: (selectedSkills.length > 0 && selectedSession) ? "#fff" : T.muted }]}>
              Start Session →
            </Text>
          </Pressable>

        </Animated.View>
      </ScrollView>
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 16, paddingTop: Platform.OS === "ios" ? 64 : 52, paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 18, color: T.text, fontWeight: "600" },
  pageTitle: { fontSize: 22, fontWeight: "800", color: T.text, letterSpacing: -0.4 },
  
  content: { paddingHorizontal: 20, paddingBottom: 50, maxWidth: 600, width: "100%", alignSelf: "center" },

  readinessCard: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 12 },
  readinessHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  greetingText: { fontSize: 24, fontWeight: "800", color: T.text },
  readinessRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  readinessLabel: { fontSize: 15, color: T.muted, fontWeight: '500' },
  readinessValue: { fontSize: 16, fontWeight: "700", color: T.accent },
  
  divider: { height: 1, backgroundColor: T.border, marginVertical: 4 },
  setupTitle: { fontSize: 14, fontWeight: "700", color: T.text, textTransform: "uppercase", letterSpacing: 0.5 },
  setupRow: { flexDirection: "column", gap: 12 },
  inputGroup: { flex: 1 },
  inputLabel: { fontSize: 12, color: T.muted, marginBottom: 4, fontWeight: "600" },
  setupInput: { backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: T.text, fontWeight: "500" },
  
  statusBadge: { backgroundColor: T.surface2, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "700", color: T.text },

  stepSection: { gap: 12 },
  stepTitle: { fontSize: 18, fontWeight: "800", color: T.text },
  stepSub: { fontSize: 14, color: T.muted, lineHeight: 20, marginBottom: 8 },
  
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  chipDot: { width: 10, height: 10, borderRadius: 5 },
  chipText: { fontSize: 14, fontWeight: "600" },

  grid: { gap: 12 },
  sessionBtn: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1, gap: 14 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  iconEmoji: { fontSize: 24 },
  sessionInfo: { flex: 1, gap: 4 },
  sessionTitle: { fontSize: 16, fontWeight: "800", color: T.text },
  durationRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sessionDuration: { fontSize: 12, fontWeight: "700", color: T.muted },
  sessionDesc: { fontSize: 13, color: T.muted, flex: 1 },

  setupCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: T.border },
  toggleText: { fontSize: 15, fontWeight: "600", color: T.text },

  startBtn: { padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  startBtnText: { fontSize: 16, fontWeight: '800' }
});

export default InterviewPrepScreen;
