import * as React from "react";
import { View, Text, StyleSheet, Pressable, Animated, Platform, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getTheme } from "../utils/theme";

const Divs29 = ({ onBack, onFinish, onPracticeAgain, emotionAnalysis = null, analysis = null, recordingDuration = 0, isDarkMode = true }) => {
  const T = getTheme(isDarkMode);
  
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const data = emotionAnalysis || analysis;
  const score = data?.eqScore || data?.overallScore || 92;
  
  const emotionMap = [
    { label: "Confidence", val: data?.voiceAnalysis?.confidenceRaw || 88, c: T.cyan },
    { label: "Stress", val: data?.voiceAnalysis?.stressRaw || 15, c: T.rose },
    { label: "Clarity", val: 92, c: T.green },
  ];

  const handleDone = () => {
    if (typeof onFinish === 'function') onFinish();
    else if (typeof onBack === 'function') onBack();
  };

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[`${T.purple}15`, "transparent"]}
          style={{ position: "absolute", top: -80, right: -60, width: 340, height: 340, borderRadius: 170 }}
        />
      </View>

      <View style={S.header}>
        <Pressable style={[S.iconBtn, { backgroundColor: T.surface, borderColor: T.border }]} onPress={onBack}>
          <Text style={[S.iconBtnText, { color: T.text }]}>←</Text>
        </Pressable>
        <Text style={[S.title, { color: T.text }]}>EmotionPrint Results</Text>
        <View style={{width: 42}} />
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 20 }}>
          
          <View style={S.hero}>
            <View style={[S.scoreRing, { borderColor: T.purple, backgroundColor: `${T.purple}10` }]}>
              <Text style={[S.scoreVal, { color: T.purple }]}>{score}</Text>
              <Text style={[S.scoreLabel, { color: T.muted }]}>EQ Score</Text>
            </View>
            <Text style={[S.heroText, { color: T.text }]}>Facial & Voice Analysis Complete</Text>
            <Text style={[S.heroSub, { color: T.muted }]}>{data?.aiFeedback || "Great vocal stability and facial composure detected during the session."}</Text>
          </View>

          <View style={S.section}>
            <Text style={[S.sectionTitle, { color: T.muted }]}>EMOTIONAL SPECTRUM</Text>
            <View style={[S.card, { borderColor: T.border, backgroundColor: T.surface }]}>
              {emotionMap.map((em, i) => (
                <View key={em.label}>
                  <View style={S.metricRow}>
                    <Text style={[S.metricLabel, { color: T.text }]}>{em.label}</Text>
                    <Text style={[S.metricVal, { color: em.c }]}>{em.val}%</Text>
                  </View>
                  <View style={[S.track, { backgroundColor: T.border }]}>
                    <View style={[S.fill, { width: `${em.val}%`, backgroundColor: em.c }]} />
                  </View>
                  {i < emotionMap.length - 1 && <View style={[S.divider, { backgroundColor: T.borderLow }]} />}
                </View>
              ))}
            </View>
          </View>

          <View style={S.btnGroup}>
            {onPracticeAgain && (
              <Pressable style={[S.secondaryBtn, { borderColor: T.border, backgroundColor: T.surface }]} onPress={onPracticeAgain}>
                <Text style={[S.secondaryText, { color: T.text }]}>Record Again</Text>
              </Pressable>
            )}
            <Pressable style={[S.actionBtn, { backgroundColor: T.accent, flex: 1 }]} onPress={handleDone}>
              <Text style={S.actionText}>Done</Text>
            </Pressable>
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
};

const S = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? 54 : 28, paddingHorizontal: 20, paddingBottom: 16 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  iconBtnText: { fontSize: 18, fontWeight: "600" },
  title: { fontSize: 18, fontWeight: "800", letterSpacing: -0.2 },
  
  content: { paddingHorizontal: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },

  hero: { alignItems: "center", paddingVertical: 20, gap: 10 },
  scoreRing: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  scoreVal: { fontSize: 42, fontWeight: "900", letterSpacing: -1 },
  scoreLabel: { fontSize: 12, fontWeight: "700", marginTop: -4 },
  heroText: { fontSize: 18, fontWeight: "800", textAlign: "center" },
  heroSub: { fontSize: 13, textAlign: "center", paddingHorizontal: 10, lineHeight: 20 },

  section: { gap: 12, marginTop: 10 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginLeft: 4 },
  card: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 16 },

  metricRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  metricLabel: { fontSize: 14, fontWeight: "600" },
  metricVal: { fontSize: 14, fontWeight: "800" },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
  divider: { height: 1, marginTop: 16 },

  btnGroup: { flexDirection: "row", gap: 12, marginTop: 24 },
  secondaryBtn: { paddingVertical: 18, paddingHorizontal: 20, borderRadius: 16, borderWidth: 1, alignItems: "center" },
  secondaryText: { fontWeight: "700", fontSize: 15 },
  actionBtn: { paddingVertical: 18, borderRadius: 16, alignItems: "center" },
  actionText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});

export default Divs29;
