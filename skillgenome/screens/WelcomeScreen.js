import * as React from "react";
import {
  ScrollView, StyleSheet, View, Text, Pressable, Animated
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import SafeLinearGradient from "../components/SafeLinearGradient";
import { getTheme } from "../utils/theme";

const STATS = [
  { value: "10K+",  label: "Professionals" },
  { value: "92%",   label: "Job Placement" },
  { value: "4.9★",  label: "User Rating" },
];

const FEATURES = [
  { icon: "🧬", title: "Genome Score",     desc: "AI fingerprint across skills, mindset & potential" },
  { icon: "🤖", title: "AI Career Coach",  desc: "24/7 personalised guidance from your AI twin" },
  { icon: "🚀", title: "Career Simulator", desc: "Explore future paths before you commit" },
  { icon: "📊", title: "Live Analytics",   desc: "Real-time recruiter match & readiness index" },
];

const WelcomeScreen = ({ onGetStarted, onSignIn, isDarkMode = true, language = 'English' }) => {
  
  const T = getTheme(isDarkMode);
  const S = React.useMemo(() => getStyles(T), [T]);
  // Staggered entrance animations
  const heroFade   = React.useRef(new Animated.Value(0)).current;
  const heroSlide  = React.useRef(new Animated.Value(28)).current;
  const statsFade  = React.useRef(new Animated.Value(0)).current;
  const featFade   = React.useRef(new Animated.Value(0)).current;
  const btnScale   = React.useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(heroFade,  { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(heroSlide, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      Animated.spring(btnScale, { toValue: 1, tension: 90, friction: 7, useNativeDriver: true }),
      Animated.timing(statsFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(featFade,  { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <ScrollView
      style={[S.screen, { backgroundColor: T.bg }]}
      contentContainerStyle={S.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Background ambient glows */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["rgba(124,58,237,0.25)", "transparent"]}
          style={{ position: "absolute", top: -120, left: -80, width: 440, height: 440, borderRadius: 220 }}
        />
        <LinearGradient
          colors={["rgba(6,182,212,0.18)", "transparent"]}
          style={{ position: "absolute", bottom: 60, right: -100, width: 360, height: 360, borderRadius: 180 }}
        />
        {/* Subtle grid */}
        <View style={S.grid}>
          {[...Array(10)].map((_, i) => (
            <View key={i} style={[S.gridLine, { left: `${i * 11}%` }]} />
          ))}
        </View>
      </View>

      <View style={S.wrapper}>

        {/* Logo + badge */}
        <Animated.View style={[S.topRow, { opacity: heroFade }]}>
          <LinearGradient
            colors={[T.accent, T.cyan]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={S.logoMark}
          >
            <Text style={S.logoChar}>SG</Text>
          </LinearGradient>
          <View style={S.betaBadge}>
            <View style={S.betaDot} />
            <Text style={S.betaText}>Beta · v2.0</Text>
          </View>
        </Animated.View>

        {/* Hero */}
        <Animated.View style={{ opacity: heroFade, transform: [{ translateY: heroSlide }] }}>
          <Text style={S.eyebrow}>The future of career intelligence</Text>
          <Text style={S.headline}>
            Your Career,{"\n"}
            <Text style={[S.headline, { color: T.accent }]}>Decoded by AI.</Text>
          </Text>
          <Text style={S.sub}>
            SkillGenome maps your complete professional DNA — skills, mindset, and potential —
            then builds you a live roadmap to the top.
          </Text>
        </Animated.View>

        {/* CTA buttons */}
        <Animated.View style={[S.ctaBlock, { transform: [{ scale: btnScale }] }]}>
          <Pressable onPress={onGetStarted} style={S.primaryWrap}>
            <LinearGradient
              colors={[T.accent, "#5b21b6"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={S.primaryBtn}
            >
              <Text style={S.primaryText}>Get Started Free  →</Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={onSignIn} style={S.ghostBtn}>
            <Text style={S.ghostText}>Sign In to Account</Text>
          </Pressable>
        </Animated.View>

        {/* Social proof stats */}
        <Animated.View style={[S.statsRow, { opacity: statsFade }]}>
          {STATS.map((s, i) => (
            <React.Fragment key={s.label}>
              <View style={S.statItem}>
                <Text style={S.statValue}>{s.value}</Text>
                <Text style={S.statLabel}>{s.label}</Text>
              </View>
              {i < STATS.length - 1 && <View style={S.statDiv} />}
            </React.Fragment>
          ))}
        </Animated.View>

        {/* Divider */}
        <View style={S.divider}>
          <View style={[S.divLine, { backgroundColor: T.border }]} />
          <Text style={S.divText}>What you unlock</Text>
          <View style={[S.divLine, { backgroundColor: T.border }]} />
        </View>

        {/* Feature cards */}
        <Animated.View style={[S.featGrid, { opacity: featFade }]}>
          {FEATURES.map((f, i) => (
            <View
              key={f.title}
              style={[S.featCard, { borderColor: T.border, backgroundColor: T.surface }]}
            >
              <View style={[S.featIconWrap, { backgroundColor: `${T.accent}18` }]}>
                <Text style={S.featIcon}>{f.icon}</Text>
              </View>
              <Text style={S.featTitle}>{f.title}</Text>
              <Text style={S.featDesc}>{f.desc}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Testimonial */}
        <View style={S.testimonial}>
          <LinearGradient
            colors={["rgba(124,58,237,0.12)", "rgba(6,182,212,0.08)", "transparent"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={S.quoteIcon}>"</Text>
          <Text style={S.quoteText}>
            SkillGenome helped me understand exactly which skills to build. I got my dream role within 3 months.
          </Text>
          <View style={S.quoteAuthorRow}>
            <LinearGradient colors={[T.accent, T.cyan]} style={S.quoteAvatar}>
              <Text style={S.quoteAvatarText}>A</Text>
            </LinearGradient>
            <View>
              <Text style={S.quoteAuthorName}>Arjun Menon</Text>
              <Text style={S.quoteAuthorRole}>Senior Engineer · Google</Text>
            </View>
          </View>
        </View>

        {/* Privacy note */}
        <Text style={S.privacyNote}>
          🔒  Enterprise-grade encryption · We never sell your data · Cancel anytime
        </Text>

      </View>
    </ScrollView>
  );
};

const getStyles = (T) => StyleSheet.create({
  screen:  { flex: 1 },
  content: { flexGrow: 1, alignItems: "center", paddingVertical: 60, paddingHorizontal: 22 },

  grid:     { ...StyleSheet.absoluteFillObject, flexDirection: "row" },
  gridLine: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: "rgba(255,255,255,0.025)" },

  wrapper: { width: "100%", maxWidth: 520, alignSelf: "center", gap: 32 },

  topRow:   { flexDirection: "row", alignItems: "center", gap: 14 },
  logoMark: { width: 50, height: 50, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  logoChar: { fontSize: 16, fontWeight: "900", color: "#fff", letterSpacing: -0.5 },
  betaBadge:{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: "rgba(34,197,94,0.35)", backgroundColor: "rgba(34,197,94,0.1)" },
  betaDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: T.green },
  betaText: { fontSize: 12, fontWeight: "600", color: T.green },

  eyebrow:  { fontSize: 12, fontWeight: "600", color: T.muted, letterSpacing: 0.4, marginBottom: 10 },
  headline: { fontSize: 44, fontWeight: "900", lineHeight: 52, letterSpacing: -1.8, color: T.text },
  sub:      { fontSize: 15, lineHeight: 25, color: T.muted, marginTop: 14 },

  ctaBlock:    { gap: 12 },
  primaryWrap: { borderRadius: 16, overflow: "hidden" },
  primaryBtn:  { paddingVertical: 18, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 0.1 },
  ghostBtn: {
    paddingVertical: 17, borderRadius: 16,
    borderWidth: 1, borderColor: T.border,
    backgroundColor: T.surface, alignItems: "center",
  },
  ghostText: { color: T.text, fontWeight: "600", fontSize: 15 },

  statsRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8 },
  statItem:  { alignItems: "center", gap: 4, flex: 1 },
  statValue: { fontSize: 24, fontWeight: "900", color: T.text, letterSpacing: -0.8 },
  statLabel: { fontSize: 11, color: T.muted, fontWeight: "500" },
  statDiv:   { width: 1, height: 36, backgroundColor: T.border, flexShrink: 0 },

  divider:  { flexDirection: "row", alignItems: "center", gap: 14 },
  divLine:  { flex: 1, height: 1 },
  divText:  { fontSize: 12, color: T.muted, fontWeight: "500" },

  featGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  featCard: {
    width: "47.5%", borderRadius: 18, borderWidth: 1,
    padding: 18, gap: 8,
  },
  featIconWrap: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  featIcon:  { fontSize: 22 },
  featTitle: { fontSize: 14, fontWeight: "800", color: T.text },
  featDesc:  { fontSize: 12, color: T.muted, lineHeight: 17 },

  testimonial: {
    borderRadius: 20, borderWidth: 1, borderColor: T.border,
    padding: 24, gap: 14, overflow: "hidden",
    backgroundColor: T.surface,
  },
  quoteIcon:    { fontSize: 40, color: T.accent, lineHeight: 40, marginTop: -8 },
  quoteText:    { fontSize: 15, lineHeight: 24, color: T.text, fontStyle: "italic" },
  quoteAuthorRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  quoteAvatar:  { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  quoteAvatarText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  quoteAuthorName: { fontSize: 13, fontWeight: "700", color: T.text },
  quoteAuthorRole: { fontSize: 11, color: T.muted },

  privacyNote: { fontSize: 12, color: "rgba(113,113,122,0.7)", textAlign: "center", lineHeight: 18 },
});

export default WelcomeScreen;
