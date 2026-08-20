import * as React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Platform, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
};

const MockInterviewScreen = ({
  onBack, onEndSession, onNextQuestion,
  role = 'Senior AI Engineer', company = 'Google DeepMind',
  isDarkMode = true
}) => {
  const T = getTheme(isDarkMode);
  const [running, setRunning] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState(120);
  const [answer, setAnswer] = React.useState("");

  const pulse = React.useRef(new Animated.Value(1)).current;
  const fade = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fade]);

  React.useEffect(() => {
    if (running) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();

      const timer = setInterval(() => {
        setTimeRemaining(p => {
          if (p <= 1) { clearInterval(timer); setRunning(false); return 0; }
          return p - 1;
        });
      }, 1000);
      return () => { clearInterval(timer); pulse.stopAnimation(); };
    } else {
      pulse.setValue(1);
    }
  }, [running, pulse]);

  const toggleMic = () => setRunning(!running);
  
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const secs = s % 60;
    return `${m}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      {/* Ambient AI pulse */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: running ? 1 : 0.4 }]}>
        <LinearGradient
          colors={["rgba(124,58,237,0.2)", "transparent"]}
          style={{ position: "absolute", top: "20%", left: -100, width: 400, height: 400, borderRadius: 200 }}
        />
        <LinearGradient
          colors={["rgba(6,182,212,0.15)", "transparent"]}
          style={{ position: "absolute", bottom: -50, right: -100, width: 400, height: 400, borderRadius: 200 }}
        />
      </Animated.View>

      <View style={S.header}>
        <Pressable style={S.iconBtn} onPress={onBack}>
          <Text style={S.iconBtnText}>✕</Text>
        </Pressable>
        <View style={S.timerBadge}>
          <Text style={[S.timerDot, running && { color: T.rose }]}>●</Text>
          <Text style={S.timerText}>{formatTime(timeRemaining)}</Text>
        </View>
        <Pressable style={S.endBtn} onPress={onEndSession}>
          <Text style={S.endBtnText}>End</Text>
        </Pressable>
      </View>

      <Animated.View style={[S.content, { opacity: fade }]}>
        
        {/* Recruiter / Question Area */}
        <View style={S.questionArea}>
          <View style={[S.recruiterIcon, { backgroundColor: `${T.cyan}20`, borderColor: `${T.cyan}40` }]}>
            <Text style={S.recruiterIconText}>🤖</Text>
          </View>
          <View style={S.questionBox}>
            <Text style={S.questionLabel}>HR AI · {company}</Text>
            <Text style={S.questionText}>
              "Can you describe a time where you architected a high-performance system under tight deadlines for a {role} position?"
            </Text>
          </View>
        </View>

        {/* User Response Area */}
        <View style={S.answerArea}>
          <View style={[S.answerBox, { borderColor: running ? T.accent : T.border, backgroundColor: T.surface }]}>
            <TextInput
              style={[S.answerInput, { color: T.text }]}
              placeholder="Your answer will appear here as you speak, or you can type..."
              placeholderTextColor={T.muted}
              multiline
              value={answer}
              onChangeText={setAnswer}
            />
          </View>
        </View>

        {/* Real-time Feedback (only when running) */}
        <View style={[S.feedbackArea, { opacity: running ? 1 : 0.4 }]}>
          <Text style={S.feedbackTitle}>LIVE ANALYSIS</Text>
          <View style={S.feedbackRow}>
            <View style={S.feedPill}><Text style={S.feedText}>Pace: Good</Text></View>
            <View style={S.feedPill}><Text style={S.feedText}>Tone: Confident</Text></View>
            <View style={S.feedPill}><Text style={S.feedText}>Clarity: 92%</Text></View>
          </View>
        </View>

        {/* Controls */}
        <View style={S.controls}>
          <Pressable style={[S.ctrlBtn, { backgroundColor: T.surface, borderColor: T.border }]} onPress={() => setAnswer("")}>
            <Text style={S.ctrlIcon}>🗑️</Text>
          </Pressable>

          <Pressable onPress={toggleMic}>
            <Animated.View style={[
              S.micBtn, 
              running ? { backgroundColor: T.rose, transform: [{ scale: pulse }] } : { backgroundColor: T.accent }
            ]}>
              <Text style={S.micIcon}>{running ? "⏹" : "🎙️"}</Text>
            </Animated.View>
          </Pressable>

          <Pressable style={[S.ctrlBtn, { backgroundColor: T.surface, borderColor: T.border }]} onPress={onNextQuestion}>
            <Text style={S.ctrlIcon}>⏭</Text>
          </Pressable>
        </View>

      </Animated.View>
    </View>
  );
};

const S = StyleSheet.create({
  root: { flex: 1, justifyContent: "space-between" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? 54 : 28, paddingHorizontal: 20 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  iconBtnText: { fontSize: 18, color: T.text, fontWeight: "600" },
  
  timerBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border },
  timerDot: { fontSize: 12, color: T.muted },
  timerText: { fontSize: 15, fontWeight: "700", color: T.text, fontVariant: ["tabular-nums"] },
  
  endBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: `${T.rose}20`, borderWidth: 1, borderColor: `${T.rose}40` },
  endBtnText: { fontSize: 14, fontWeight: "700", color: T.rose },

  content: { flex: 1, paddingHorizontal: 20, paddingTop: 30, paddingBottom: 40 },

  questionArea: { alignItems: "center", marginBottom: 30, gap: 16 },
  recruiterIcon: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  recruiterIconText: { fontSize: 32 },
  questionBox: { alignItems: "center", gap: 8 },
  questionLabel: { fontSize: 12, fontWeight: "700", color: T.cyan, letterSpacing: 0.5 },
  questionText: { fontSize: 18, fontWeight: "600", color: T.text, textAlign: "center", lineHeight: 28 },

  answerArea: { flex: 1, marginBottom: 20 },
  answerBox: { flex: 1, borderRadius: 20, borderWidth: 1.5, padding: 20 },
  answerInput: { flex: 1, fontSize: 16, lineHeight: 24, textAlignVertical: "top" },

  feedbackArea: { marginBottom: 30, alignItems: "center", gap: 10 },
  feedbackTitle: { fontSize: 10, fontWeight: "700", color: T.muted, letterSpacing: 1 },
  feedbackRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", justifyContent: "center" },
  feedPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: T.surface, borderWidth: 1, borderColor: T.borderLow },
  feedText: { fontSize: 12, fontWeight: "600", color: T.muted },

  controls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 24 },
  ctrlBtn: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  ctrlIcon: { fontSize: 20 },
  micBtn: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", shadowColor: T.accent, shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  micIcon: { fontSize: 28, color: "#fff" },
});

export default MockInterviewScreen;
