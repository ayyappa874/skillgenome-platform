import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTheme } from '../utils/theme';

const CircularMetric = ({ label, value, color, T, S }) => (
  <View style={S.metricCol}>
    <View style={[S.ring, { borderColor: color, backgroundColor: T.surface }]}>
      <Text style={[S.ringNum, { color: T.text }]}>{value}</Text>
    </View>
    <Text style={[S.ringLabel, { color: T.muted }]}>{label}</Text>
  </View>
);

const ThoughtPrintAnalysisScreen = ({ route, onBack, onDone, isDarkMode = true }) => {
  const T = getTheme(isDarkMode);
  // Default onBack to onDone if not provided, to ensure they can exit
  const handleBack = onBack || onDone;
  const S = useMemo(() => getStyles(T), [T]);
  
  // result is passed either through route params (if using React Navigation) or props directly
  const data = route?.params?.result || {
    cognitive_style: "Analytical",
    stress_score: 45,
    confidence_score: 82,
    burnout_risk: "Low",
    positive_sentiment: 70,
    dominant_themes: ["Growth", "Focus"],
    ai_insight: "Default fallback data. Ensure real result is passed.",
    genome_update: { "IQ": 1, "CS": 2 }
  };

  const isHighStress = data.stress_score > 65 || data.burnout_risk === "High";

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      {/* Ambient glow */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[isDarkMode ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.10)", "transparent"]}
          style={{ position: "absolute", top: -60, left: -60, width: 380, height: 380, borderRadius: 190 }}
        />
      </View>

      <View style={S.header}>
        <Pressable style={S.backBtn} onPress={handleBack}>
          <Text style={S.backIcon}>←</Text>
        </Pressable>
        <View>
          <Text style={S.headerTitle}>ThoughtPrint Analysis</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Main Cognitive Style Hero */}
        <View style={S.heroWrap}>
          <Text style={[S.heroEyebrow, { color: T.accent }]}>THOUGHTPRINT SCORE</Text>
          <Text style={S.heroTitle}>{data.overall_score || 85}<Text style={{ fontSize: 18, color: T.muted }}> / 100</Text></Text>
          <Text style={[S.heroEyebrow, { color: T.accent, marginTop: 12 }]}>DOMINANT PATTERN</Text>
          <Text style={[S.heroTitle, { fontSize: 24, marginBottom: 4 }]}>{data.cognitive_style}</Text>
          <Text style={S.heroSub}>
            {data.cognitive_style === 'Analytical' ? 'Systematic, structured, and methodical approach.' : 
             data.cognitive_style === 'Creative' ? 'Lateral thinking, intuitive, and pattern-seeking.' :
             data.cognitive_style === 'Collaborative' ? 'Social processing, verbalizing, and teamwork-oriented.' :
             'Reflective, introverted, and deep-thinking approach.'}
          </Text>
        </View>

        {/* Burnout Alert */}
        {isHighStress && (
          <View style={[S.alertBox, { backgroundColor: `${T.rose}15`, borderColor: T.rose }]}>
            <Text style={[S.alertTitle, { color: T.rose }]}>⚠️ Elevated Stress Detected</Text>
            <Text style={[S.alertText, { color: T.rose }]}>
              Your ThoughtPrint shows elevated stress/burnout risk. Recommend a lighter prep session today and a 5-minute breathing exercise.
            </Text>
          </View>
        )}

        {/* Circular Metrics Row */}
        <View style={S.metricsRow}>
          <CircularMetric label="STRESS" value={data.stress_score} color={T.amber} T={T} S={S} />
          <CircularMetric label="CONFIDENCE" value={data.confidence_score} color={T.cyan} T={T} S={S} />
          <CircularMetric label="POSITIVITY" value={data.positive_sentiment} color={T.green} T={T} S={S} />
        </View>

        {/* Dominant Themes */}
        <View style={[S.card, { borderColor: T.border, backgroundColor: T.surface }]}>
          <Text style={S.cardTitle}>Dominant Themes</Text>
          <View style={S.themesRow}>
            {data.dominant_themes.map((theme, i) => (
              <View key={i} style={[S.themeChip, { backgroundColor: T.surface2 }]}>
                <Text style={[S.themeText, { color: T.text }]}>#{theme.toLowerCase()}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Insight */}
        <View style={[S.card, { borderColor: T.border, backgroundColor: T.surface }]}>
          <Text style={S.cardTitle}>AI Insight</Text>
          <Text style={S.insightText}>{data.ai_insight}</Text>
        </View>

        {/* Genome Updates */}
        <View style={[S.card, { borderColor: T.accent, backgroundColor: `${T.accent}15` }]}>
          <Text style={[S.cardTitle, { color: T.accent }]}>Genome Updated</Text>
          <View style={S.genomeRow}>
            {Object.entries(data.genome_update || {}).map(([key, val]) => (
              <View key={key} style={[S.genomeBadge, { backgroundColor: T.surface, borderColor: T.border, borderWidth: 1 }]}>
                <Text style={[S.genomeText, { color: T.accent }]}>{key} {val >= 0 ? `+${val}` : val}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      <View style={[S.footer, { backgroundColor: T.bg, borderTopColor: T.border }]}>
        <Pressable style={S.doneBtnWrap} onPress={onDone}>
          <LinearGradient
            colors={[T.accent, T.accentEnd]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={S.doneBtn}
          >
            <Text style={S.doneBtnText}>Complete Session</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  root: { flex: 1 },
  header: { 
    flexDirection: 'row',
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 72 : 56, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: T.border 
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: T.border
  },
  backIcon: { fontSize: 18, color: T.text, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: T.text },

  scrollContent: { padding: 20, gap: 20, paddingBottom: 40, maxWidth: 600, width: '100%', alignSelf: 'center' },

  heroWrap: { alignItems: 'center', paddingVertical: 20 },
  heroEyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  heroTitle: { fontSize: 36, fontWeight: '900', color: T.text, marginBottom: 8 },
  heroSub: { fontSize: 14, color: T.muted, textAlign: 'center', maxWidth: '80%' },

  alertBox: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  alertTitle: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  alertText: { fontSize: 13, lineHeight: 20 },

  metricsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
  metricCol: { alignItems: 'center', gap: 8 },
  ring: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  ringNum: { fontSize: 24, fontWeight: '900' },
  ringLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  card: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 14 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: T.text },
  
  themesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  themeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  themeText: { fontSize: 13, fontWeight: '700' },

  insightText: { fontSize: 15, color: T.text, lineHeight: 24, opacity: 0.9 },

  genomeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  genomeBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  genomeText: { fontSize: 14, fontWeight: '800' },

  footer: { padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, borderTopWidth: 1 },
  doneBtnWrap: { borderRadius: 16, overflow: 'hidden' },
  doneBtn: { paddingVertical: 18, alignItems: 'center' },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.2 }
});

export default ThoughtPrintAnalysisScreen;
