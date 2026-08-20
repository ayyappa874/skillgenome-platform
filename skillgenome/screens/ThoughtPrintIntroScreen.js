import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getTheme } from "../utils/theme";

const SESSIONS = [
  { id: "A", title: "Daily check-in", desc: "Quick cognitive pulse — how are you thinking today?", qCount: 5, time: 3 },
  { id: "B", title: "Deep reflection", desc: "Full cognitive genome analysis including leadership and clarity", qCount: 10, time: 7 },
  { id: "C", title: "Pre-interview prep", desc: "Calibrate your mindset before a big interview or presentation", qCount: 5, time: 3 }
];

const CHIPS = ["Cognitive style", "Stress level", "Confidence", "Burnout risk"];

const ThoughtPrintIntroScreen = ({ onBack, onBegin, isDarkMode = true }) => {
  const T = getTheme(isDarkMode);
  const S = React.useMemo(() => getStyles(T), [T]);
  const [selected, setSelected] = React.useState("A");
  const activeSession = SESSIONS.find(s => s.id === selected) || SESSIONS[0];
  
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      {/* Ambient glow */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[isDarkMode ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.10)", "transparent"]}
          style={{ position: "absolute", top: -60, left: -60, width: 380, height: 380, borderRadius: 190 }}
        />
      </View>

      {/* Header */}
      <View style={S.header}>
        <View style={S.headerRow}>
          <Pressable style={S.backBtn} onPress={onBack}>
            <Text style={S.backIcon}>←</Text>
          </Pressable>
          <View style={S.titleWrap}>
            <Text style={S.pageTitle}>❁ ThoughtPrint</Text>
            <Text style={S.pageSub}>Cognitive genome session</Text>
          </View>
          <View style={[S.badge, { backgroundColor: `${T.accent}20` }]}>
            <Text style={[S.badgeText, { color: T.accentText }]}>{activeSession.title}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 24 }}>
          
          <Text style={S.sectionEyebrow}>●  Adaptive questions — answers shape next question</Text>

          {/* How this works Card */}
          <View style={[S.card, { borderColor: T.border, backgroundColor: T.surface }]}>
            <Text style={S.cardTitle}>How this works</Text>
            <Text style={S.cardDesc}>
              You answer 5 smart questions. Each answer shapes the next one. At the end, your cognitive genome updates — stress score, confidence, thinking style, burnout risk.
            </Text>
            <View style={S.chipRow}>
              {CHIPS.map((chip, i) => (
                <View key={chip} style={[S.chip, { backgroundColor: [T.purpleLight, T.greenLight, T.amberLight, T.roseLight][i % 4] }]}>
                  <Text style={[S.chipText, { color: [T.purple, T.green, T.amber, T.rose][i % 4] }]}>{chip}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={S.sessionListWrap}>
            <Text style={S.sectionEyebrowCenter}>Pick your session type</Text>
            <View style={S.sessionList}>
              {SESSIONS.map((sess) => {
                const isActive = selected === sess.id;
                return (
                  <Pressable
                    key={sess.id}
                    style={[S.sessCard, isActive ? { borderColor: T.accent, backgroundColor: T.accentLight } : { borderColor: T.border, backgroundColor: T.surface2 }]}
                    onPress={() => setSelected(sess.id)}
                  >
                    <View style={[S.sessIcon, { backgroundColor: isActive ? T.accent : T.surface }]}>
                      <Text style={[S.sessIconText, { color: isActive ? "#fff" : T.muted }]}>{sess.id}</Text>
                    </View>
                    <View style={S.sessInfo}>
                      <View style={S.sessRow}>
                        <Text style={[S.sessTitle, { color: isActive ? T.text : T.text }]}>{sess.title}</Text>
                        <Text style={S.sessMeta}> • {sess.qCount} questions • {sess.time} min</Text>
                      </View>
                      <Text style={S.sessDesc}>{sess.desc}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={[S.footer, { borderTopColor: T.border, backgroundColor: T.bg }]}>
        <Text style={S.footerMeta}>Genome updates after session</Text>
        <Pressable style={S.beginBtnWrap} onPress={() => onBegin && onBegin(selected)}>
          <LinearGradient
            colors={[T.accent, T.accentEnd]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={S.beginBtn}
          >
            <Text style={S.beginBtnText}>Begin  →</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  root: { flex: 1 },
  header: { 
    paddingTop: Platform.OS === "ios" ? 72 : 56, 
    paddingHorizontal: 20, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: T.border 
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    backgroundColor: T.surface, 
    borderWidth: 1, 
    borderColor: T.border, 
    alignItems: "center", 
    justifyContent: "center",
    marginRight: 12 
  },
  backIcon: { fontSize: 18, color: T.text, fontWeight: "600" },
  titleWrap: { flex: 1 },
  pageTitle: { fontSize: 20, fontWeight: "800", color: T.text, letterSpacing: -0.5 },
  pageSub: { fontSize: 13, color: T.muted },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: "700" },

  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },
  
  sectionEyebrow: { fontSize: 12, fontWeight: "600", color: T.muted },
  sectionEyebrowCenter: { fontSize: 14, fontWeight: "600", color: T.muted, textAlign: "center", marginBottom: 12 },

  card: { borderRadius: 20, borderWidth: 1, padding: 22, gap: 14 },
  cardTitle: { fontSize: 18, fontWeight: "800", color: T.text },
  cardDesc: { fontSize: 14, color: T.muted, lineHeight: 22 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 12, fontWeight: "700" },

  sessionListWrap: { marginTop: 10 },
  sessionList: { gap: 12 },
  sessCard: { flexDirection: "row", alignItems: "center", padding: 18, borderRadius: 18, borderWidth: 1, gap: 16 },
  sessIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  sessIconText: { fontSize: 16, fontWeight: "800" },
  sessInfo: { flex: 1, gap: 4 },
  sessRow: { flexDirection: "row", alignItems: "center" },
  sessTitle: { fontSize: 16, fontWeight: "800" },
  sessMeta: { fontSize: 12, color: T.muted },
  sessDesc: { fontSize: 13, color: T.muted, lineHeight: 18 },

  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1 },
  footerMeta: { fontSize: 13, color: T.muted, fontWeight: "500" },
  beginBtnWrap: { borderRadius: 16, overflow: "hidden" },
  beginBtn: { paddingHorizontal: 28, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  beginBtnText: { fontSize: 16, fontWeight: "800", color: "#fff", letterSpacing: 0.5 }
});

export default ThoughtPrintIntroScreen;
