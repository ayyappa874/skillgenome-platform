import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import { getTheme } from '../utils/theme';

const EmotionPrintAnalysisScreen = ({ route, onBack, onDone, isDarkMode = true }) => {
  const T = getTheme(isDarkMode);
  const handleBack = onBack || onDone;
  const S = useMemo(() => getStyles(T), [T]);
  const videoRef = useRef(null);

  const data = route?.params?.result || {
    eq_score: 85,
    dominant_emotions: { happy: 0.6, neutral: 0.3, stressed: 0.1 },
    voice_confidence: "High",
    calm_coach_trigger: false,
    ai_insight: "Default fallback feedback.",
    genome_update: { "EQ": 1 }
  };

  const emotionsArr = Object.entries(data.dominant_emotions || {})
    .sort((a, b) => b[1] - a[1]);

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
          <Text style={S.headerTitle}>EmotionPrint Results</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Recorded Video Playback */}
        {data.videoUri && (
          <View style={S.videoContainer}>
            <Video
              ref={videoRef}
              style={S.video}
              source={{ uri: data.videoUri }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              shouldPlay
            />
            <View style={S.videoOverlay}>
              <Text style={S.videoTag}>LIVE ANALYSIS</Text>
            </View>
          </View>
        )}

        {/* Main EQ Score */}
        <View style={S.heroWrap}>
          <Text style={[S.heroEyebrow, { color: T.accent }]}>OVERALL EQ SCORE</Text>
          <View style={[S.eqRing, { borderColor: T.accent, backgroundColor: T.surface }]}>
            <Text style={[S.eqScore, { color: T.text }]}>{data.eq_score}</Text>
          </View>
        </View>

        {/* Calm Coach Trigger */}
        {data.calm_coach_trigger && (
          <View style={[S.alertBox, { backgroundColor: `${T.rose}15`, borderColor: T.rose }]}>
            <Text style={[S.alertTitle, { color: T.rose }]}>🧘 Calm Coach Recommended</Text>
            <Text style={[S.alertText, { color: T.rose }]}>
              High stress micro-expressions detected. Taking a 2-minute breathing break before continuing is highly recommended.
            </Text>
          </View>
        )}

        {/* Top Emotions */}
        <View style={[S.card, { borderColor: T.border, backgroundColor: T.surface }]}>
          <Text style={S.cardTitle}>Detected Emotions</Text>
          <View style={S.emotionsList}>
            {emotionsArr.map(([emotion, prob]) => {
              const perc = Math.round(prob * 100);
              return (
                <View key={emotion} style={S.emotionRow}>
                  <Text style={[S.emotionLabel, { color: T.text }]}>{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</Text>
                  <View style={[S.emotionBarBg, { backgroundColor: T.surface2 }]}>
                    <View style={[S.emotionBarFill, { width: `${perc}%`, backgroundColor: T.accent }]} />
                  </View>
                  <Text style={[S.emotionPerc, { color: T.muted }]}>{perc}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Vocal Confidence */}
        <View style={[S.card, { borderColor: T.border, backgroundColor: T.surface }]}>
          <Text style={S.cardTitle}>Vocal Confidence</Text>
          <View style={S.voiceRow}>
            <Text style={[S.voiceVal, { color: data.voice_confidence === 'High' ? T.green : T.amber }]}>
              {data.voice_confidence}
            </Text>
            <Text style={S.voiceSub}>Tone analysis</Text>
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
              <View key={key} style={[S.genomeBadge, { backgroundColor: T.surface, borderColor: T.border }]}>
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
  heroEyebrow: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  eqRing: { width: 120, height: 120, borderRadius: 60, borderWidth: 6, alignItems: 'center', justifyContent: 'center' },
  eqScore: { fontSize: 42, fontWeight: '900' },

  alertBox: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 40 },
  alertTitle: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  alertText: { fontSize: 13, lineHeight: 20 },

  videoContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: '#000'
  },
  video: {
    width: '100%',
    height: '100%'
  },
  videoOverlay: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(244, 63, 94, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  videoTag: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1
  },

  card: { padding: 20, borderRadius: 20, borderWidth: 1, gap: 14 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: T.text },

  emotionsList: { gap: 12 },
  emotionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emotionLabel: { width: 70, fontSize: 13, fontWeight: '700' },
  emotionBarBg: { flex: 1, height: 8, borderRadius: 4 },
  emotionBarFill: { height: '100%', borderRadius: 4 },
  emotionPerc: { width: 36, fontSize: 12, fontWeight: '700', textAlign: 'right' },

  voiceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  voiceVal: { fontSize: 24, fontWeight: '900' },
  voiceSub: { fontSize: 13, color: T.muted },

  insightText: { fontSize: 15, color: T.text, lineHeight: 24, opacity: 0.9 },

  genomeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  genomeBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  genomeText: { fontSize: 14, fontWeight: '800' },

  footer: { padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, borderTopWidth: 1 },
  doneBtnWrap: { borderRadius: 16, overflow: 'hidden' },
  doneBtn: { paddingVertical: 18, alignItems: 'center' },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.2 }
});

export default EmotionPrintAnalysisScreen;
