import * as React from "react";
import {
  ScrollView, StyleSheet, View, Text, Pressable,
  Animated, useWindowDimensions
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { t } from "../utils/translations";
import { getTheme } from "../utils/theme";

/**
 * FIXES vs the previous version:
 * 1. Headline's first line ("Your career,") was invisible — it relied on
 *    T.text from getTheme(), which in the light-mode branch was resolving
 *    to a colour indistinguishable from the background. Headline colours
 *    are now pinned to guaranteed-readable values (COLORS.text /
 *    COLORS.textOnDark) instead of trusting an external theme file blindly.
 * 2. The testimonial card text was nearly unreadable — italic light text
 *    sat on a translucent gradient that faded to the card's own light
 *    background. Replaced with a solid-contrast card and a fixed text
 *    colour regardless of theme.
 * 3. Everything else (spacing, motion, hierarchy) has been redesigned to
 *    match the "genome / decoded" visual identity — sequence badge, helix
 *    accents, numbered feature "loci", star rating on the testimonial.
 */

const COLORS = {
  bgDark: "#090b12",
  bgDark2: "#0d1019",
  surface: "#12151f",
  surface2: "#171b28",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.16)",
  text: "#f3f4f8",
  muted: "#8d93a8",
  mutedDim: "#5d6273",
  violet: "#8b5cf6",
  violetDeep: "#5b21b6",
  teal: "#2dd4bf",
  amber: "#f0b429",
  green: "#34d399",
};

const FEATURES = [
  { tag: "01 · SEQUENCE", icon: "🧬", label: "Genome Score",   sub: "AI-computed fingerprint of your skills and blind spots.", tint: COLORS.violet },
  { tag: "02 · COACH",    icon: "🤖", label: "AI Career Twin", sub: "A personalised coach, on call around the clock.",         tint: COLORS.teal },
  { tag: "03 · SIMULATE", icon: "🚀", label: "Career Sim",     sub: "Run what-if simulations across roles and timelines.",     tint: COLORS.amber },
  { tag: "04 · SIGNAL",   icon: "📊", label: "Live Analytics", sub: "Real-time visibility into how recruiters see you.",       tint: COLORS.green },
];

const TRUST = ["10K+ Professionals", "AI-Powered", "Privacy First", "Free to Start"];
const SEQUENCE = ["A", "T", "C", "G", "A"];

function FeatureCard({ tag, icon, label, sub, tint, delay, styles }) {
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY: slide }] }]}>
      <Text style={styles.cardTag}>{tag}</Text>
      <View style={[styles.cardIconWrap, { backgroundColor: `${tint}20` }]}>
        <Text style={styles.cardIcon}>{icon}</Text>
      </View>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardSub}>{sub}</Text>
    </Animated.View>
  );
}

const Screen2Native = ({ onGetStarted, onSignIn, isDarkMode = true, language = "English" }) => {
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const styles = React.useMemo(() => getStyles(isWide), [isWide]);

  const heroFade = React.useRef(new Animated.Value(0)).current;
  const heroSlide = React.useRef(new Animated.Value(28)).current;
  const btnScale = React.useRef(new Animated.Value(0.94)).current;
  const pulse = React.useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    Animated.stagger(80, [
      Animated.parallel([
        Animated.timing(heroFade, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(heroSlide, { toValue: 0, duration: 650, useNativeDriver: true }),
      ]),
      Animated.spring(btnScale, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingHorizontal: isWide ? 40 : 22 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Ambient backdrop */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient colors={["rgba(139,92,246,0.22)", "rgba(139,92,246,0)"]} style={styles.glow1} />
        <LinearGradient colors={["rgba(45,212,191,0.16)", "rgba(45,212,191,0)"]} style={styles.glow2} />
      </View>

      <View style={[styles.wrapper, { maxWidth: isWide ? 680 : "100%" }]}>

        {/* Logo row */}
        <Animated.View style={[styles.logoRow, { opacity: heroFade }]}>
          <LinearGradient colors={[COLORS.violet, "#4f9dff"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoMark}>
            <Text style={styles.logoChar}>SG</Text>
          </LinearGradient>
          <Text style={styles.brandName}>SkillGenome</Text>
        </Animated.View>

        {/* Sequence badge (signature element) */}
        <Animated.View style={[styles.badgeRow, { opacity: heroFade }]}>
          <View style={styles.badgePill}>
            <Text style={styles.badgeLabel}>Beta · v2.0 live</Text>
          </View>
          <View style={styles.seqPill}>
            {SEQUENCE.map((base, i) => (
              <Animated.Text
                key={`${base}-${i}`}
                style={[
                  styles.seqChar,
                  { color: i % 2 === 0 ? COLORS.violet : COLORS.teal, opacity: i === 0 ? pulse : 0.7 },
                ]}
              >
                {base}
              </Animated.Text>
            ))}
          </View>
        </Animated.View>

        {/* Hero headline — colours pinned, not theme-dependent */}
        <Animated.View style={{ opacity: heroFade, transform: [{ translateY: heroSlide }] }}>
          <Text style={styles.headline}>
            Your career,{"\n"}
            <Text style={styles.headlineAccent}>decoded by AI.</Text>
          </Text>
          <Text style={styles.sub}>
            SkillGenome maps your professional DNA — skills, mindset, and potential —
            then builds a living roadmap to your next breakthrough.
          </Text>
        </Animated.View>

        {/* CTA buttons */}
        <Animated.View style={[styles.ctaRow, { transform: [{ scale: btnScale }] }]}>
          <Pressable onPress={onGetStarted} style={styles.primaryWrap}>
            <LinearGradient colors={[COLORS.violet, COLORS.violetDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
              <Text style={styles.primaryText}>Get Started Free  →</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={onSignIn} style={styles.ghostBtn}>
            <Text style={styles.ghostText}>Sign In</Text>
          </Pressable>
        </Animated.View>

        {/* Trust bar */}
        <Animated.View style={[styles.trustRow, { opacity: heroFade }]}>
          {TRUST.map((item, i) => (
            <React.Fragment key={item}>
              <Text style={styles.trustItem}>{item}</Text>
              {i < TRUST.length - 1 && <View style={styles.trustDivider} />}
            </React.Fragment>
          ))}
        </Animated.View>

        {/* Divider */}
        <View style={styles.sectionDivider}>
          <View style={styles.divLine} />
          <Text style={styles.divLabel}>What you unlock</Text>
          <View style={styles.divLine} />
        </View>

        {/* Feature grid */}
        <View style={[styles.cardsGrid, { flexDirection: isWide ? "row" : "column" }]}>
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.label} {...f} delay={i * 80 + 400} styles={styles} />
          ))}
        </View>

        {/* Testimonial — solid, guaranteed-contrast card */}
        <View style={styles.proofCard}>
          <LinearGradient
            colors={["rgba(139,92,246,0.16)", "rgba(45,212,191,0.06)"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.proofTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AM</Text>
            </View>
            <Text style={styles.stars}>★★★★★</Text>
          </View>
          <Text style={styles.proofQuote}>
            "SkillGenome helped me understand exactly which skills to focus on. I landed my dream job within three months."
          </Text>
          <Text style={styles.proofAttr}>— Arjun M., Senior Engineer @ Google</Text>
        </View>

        {/* Final CTA */}
        <View style={styles.finalCta}>
          <Text style={styles.finalHeadline}>Your next role is already written in your data.</Text>
          <Text style={styles.finalSub}>Decode it in under two minutes. No credit card required.</Text>
          <Pressable onPress={onGetStarted} style={styles.primaryWrap}>
            <LinearGradient colors={[COLORS.violet, COLORS.violetDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
              <Text style={styles.primaryText}>Get Started Free  →</Text>
            </LinearGradient>
          </Pressable>
        </View>

      </View>
    </ScrollView>
  );
};

const getStyles = (isWide) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bgDark },
  content: { flexGrow: 1, paddingVertical: 48, alignItems: "center" },
  glow1: { position: "absolute", top: -140, left: -120, width: 520, height: 520, borderRadius: 260 },
  glow2: { position: "absolute", bottom: 40, right: -120, width: 420, height: 420, borderRadius: 210 },

  wrapper: { width: "100%", alignSelf: "center", gap: 30 },

  logoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoMark: { width: 40, height: 40, borderRadius: 11, alignItems: "center", justifyContent: "center", shadowColor: COLORS.violet, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  logoChar: { fontSize: 14, fontWeight: "700", color: "#fff", letterSpacing: -0.3 },
  brandName: { fontSize: 16, fontWeight: "700", color: COLORS.text, letterSpacing: -0.2 },

  badgeRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  badgePill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, borderWidth: 1, borderColor: COLORS.borderStrong, backgroundColor: "rgba(255,255,255,0.03)" },
  badgeLabel: { fontSize: 12.5, fontWeight: "600", color: COLORS.muted },
  seqPill: { flexDirection: "row", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100, backgroundColor: "rgba(139,92,246,0.12)" },
  seqChar: { fontSize: 11, fontWeight: "700" },

  headline: { fontSize: isWide ? 54 : 42, fontWeight: "800", lineHeight: isWide ? 60 : 48, letterSpacing: -1.4, color: COLORS.text },
  headlineAccent: { color: COLORS.violet },
  sub: { fontSize: 17, lineHeight: 27, color: COLORS.muted, marginTop: 16, maxWidth: 600 },

  ctaRow: { flexDirection: "row", gap: 12 },
  primaryWrap: { borderRadius: 15, overflow: "hidden", flex: 1, shadowColor: COLORS.violet, shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  primaryBtn: { paddingVertical: 18, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 0.2 },
  ghostBtn: {
    paddingVertical: 17, paddingHorizontal: 26,
    borderRadius: 15, borderWidth: 1.5, borderColor: COLORS.borderStrong,
    backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center",
  },
  ghostText: { color: COLORS.text, fontWeight: "700", fontSize: 16 },

  trustRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  trustItem: { fontSize: 12, color: COLORS.mutedDim, fontWeight: "600" },
  trustDivider: { width: 3, height: 3, borderRadius: 2, backgroundColor: COLORS.borderStrong, marginHorizontal: 8 },

  sectionDivider: { flexDirection: "row", alignItems: "center", gap: 16, marginVertical: 6 },
  divLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  divLabel: { fontSize: 12, color: COLORS.mutedDim, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.2 },

  cardsGrid: { gap: 14 },
  card: {
    flex: 1, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 18, padding: 22,
  },
  cardTag: { fontSize: 10.5, fontWeight: "700", color: COLORS.mutedDim, letterSpacing: 0.6, marginBottom: 14 },
  cardIconWrap: { width: 40, height: 40, borderRadius: 11, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  cardIcon: { fontSize: 19 },
  cardLabel: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 6 },
  cardSub: { fontSize: 13, color: COLORS.muted, lineHeight: 19, fontWeight: "500" },

  proofCard: {
    borderRadius: 22, borderWidth: 1, borderColor: COLORS.borderStrong,
    padding: 26, gap: 12, overflow: "hidden",
    backgroundColor: COLORS.surface,
  },
  proofTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.teal, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 14, fontWeight: "800", color: "#0a0c14" },
  stars: { fontSize: 13, color: COLORS.amber, letterSpacing: 2 },
  proofQuote: { fontSize: 17, lineHeight: 26, color: COLORS.text, fontWeight: "600" },
  proofAttr: { fontSize: 13, color: COLORS.teal, fontWeight: "700" },

  finalCta: {
    borderRadius: 22, borderWidth: 1, borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.surface, padding: 32, alignItems: "center", gap: 10,
  },
  finalHeadline: { fontSize: isWide ? 26 : 22, fontWeight: "800", color: COLORS.text, textAlign: "center", letterSpacing: -0.5 },
  finalSub: { fontSize: 14.5, color: COLORS.muted, textAlign: "center", marginBottom: 12 },
});

export default Screen2Native;
