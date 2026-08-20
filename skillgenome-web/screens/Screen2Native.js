import * as React from "react";
import {
  ScrollView, StyleSheet, View, Text, Pressable,
  Animated, Easing, useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getTheme } from "../utils/theme";
import HelixBackground from "../components/UI/HelixBackground";
import DNAHelix from "../components/UI/DNAHelix";
import { supabase } from "../utils/supabase";

// ---------------------------------------------------------------------------
// Content Constants
// ---------------------------------------------------------------------------

const FEATURES = [
  { icon: "🧬", label: "Genome Score",   sub: "AI-computed fingerprint of your skills, ranked against where the market is heading." },
  { icon: "🤖", label: "AI Career Twin", sub: "A personalised coach that studies your trajectory and nudges you before you fall behind." },
  { icon: "🚀", label: "Career Sim",     sub: "Run what-if simulations across roles, industries, and skill bets before you commit." },
  { icon: "📊", label: "Live Analytics", sub: "Real-time recruiter interest and demand signals mapped straight to your profile." },
];

const COMPANIES = [
  "Google", "Apple", "Microsoft", "Amazon", "Meta", "Netflix", "Tesla", "Nvidia",
  "Samsung", "IBM", "Intel", "Adobe", "Salesforce", "Uber", "Spotify",
  "Goldman Sachs", "JPMorgan", "McKinsey", "Deloitte", "Airbnb"
];

const TESTIMONIALS = [
  { q: "SkillGenome helped me understand exactly which skills to focus on. I landed my dream job within three months.", n: "Arjun M.", r: "Senior Engineer @ Google", a: "AM" },
  { q: "The Career Sim let me test a pivot into product before I risked my actual title. Best decision I made this year.", n: "Priya S.", r: "Product Lead @ Stripe", a: "PS" },
  { q: "It's like having a coach who's read every job description on earth and actually remembers mine.", n: "Daniel K.", r: "Data Scientist @ Netflix", a: "DK" },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DecodeText({ text, delay = 0, style }) {
  const [displayText, setDisplayText] = React.useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  React.useEffect(() => {
    let frame = 0;
    const total = 18;
    let timer;

    const delayTimer = setTimeout(() => {
      timer = setInterval(() => {
        let out = '';
        for (let i = 0; i < text.length; i++) {
          if (text[i] === ' ' || text[i] === '\n') {
            out += text[i];
            continue;
          }
          const reveal = frame - i * 1.3;
          if (reveal > total) {
            out += text[i];
          } else if (reveal > 0) {
            out += chars[Math.floor(Math.random() * chars.length)];
          } else {
            out += '';
          }
        }
        setDisplayText(out);
        frame++;
        if (frame > text.length * 1.3 + total) {
          setDisplayText(text);
          clearInterval(timer);
        }
      }, 28);
    }, delay);

    return () => {
      clearTimeout(delayTimer);
      if (timer) clearInterval(timer);
    };
  }, [text, delay]);

  return <Text style={style}>{displayText || text}</Text>;
}

function FeatureCard({ icon, label, sub, delay, T, isDark, styles }) {
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(18)).current;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateY: slide }] }]}>
      <LinearGradient
        colors={[isDark ? "rgba(124,58,237,0.14)" : "rgba(124,58,237,0.06)", "transparent"]}
        style={styles.cardAccent}
      />
      <View style={styles.cardIconWrap}>
        {label === "Genome Score" ? (
          <DNAHelix size={32} rowCount={5} />
        ) : (
          <Text style={{ fontSize: 20 }}>{icon}</Text>
        )}
      </View>
      <Text style={styles.cardTitle}>{label}</Text>
      <Text style={styles.cardSub}>{sub}</Text>
    </Animated.View>
  );
}

function CompanyTicker({ T, styles }) {
  const scrollX = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(scrollX, {
        toValue: -600,
        duration: 22000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const items = [...COMPANIES, ...COMPANIES];

  return (
    <View style={styles.tickerSection}>
      <Text style={styles.tickerLabel}>CAREER DNA MATCHED AT WORLD-CLASS TEAMS</Text>
      <View style={styles.tickerMask}>
        <Animated.View style={[styles.tickerTrack, { transform: [{ translateX: scrollX }] }]}>
          {items.map((company, idx) => (
            <View key={idx} style={styles.tickerRow}>
              <Text style={styles.tickerItem}>{company}</Text>
              <Text style={[styles.tickerItem, { opacity: 0.3, marginHorizontal: 16 }]}>·</Text>
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

function TestimonialCard({ T, styles }) {
  const [index, setIndex] = React.useState(0);
  const fade = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(fade, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const item = TESTIMONIALS[index];

  return (
    <View style={styles.proofBox}>
      <Animated.View style={{ opacity: fade }}>
        <Text style={styles.proofMark}>“</Text>
        <Text style={styles.proofQuote}>{item.q}</Text>
        <View style={styles.attrRow}>
          <LinearGradient colors={[T.accentEnd, T.accent]} style={styles.avatar}>
            <Text style={styles.avatarText}>{item.a}</Text>
          </LinearGradient>
          <View>
            <Text style={styles.attrName}>{item.n}</Text>
            <Text style={styles.attrRole}>{item.r}</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Screen Component
// ---------------------------------------------------------------------------

const Screen2Native = ({ onGetStarted, onSignIn, isDarkMode = true }) => {
  const T = getTheme(isDarkMode);
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const styles = React.useMemo(() => getStyles(T, isWide, isDarkMode), [T, isWide, isDarkMode]);

  const heroFade = React.useRef(new Animated.Value(0)).current;
  const heroSlide = React.useRef(new Animated.Value(28)).current;
  const btnScale = React.useRef(new Animated.Value(0.94)).current;
  const ctaPulse = React.useRef(new Animated.Value(1)).current;
  const readoutFade = React.useRef(new Animated.Value(0)).current;
  const pulse = React.useRef(new Animated.Value(0.4)).current;

  const [activeUsersCount, setActiveUsersCount] = React.useState(0);

  React.useEffect(() => {
    const fetchSupabaseUserCount = async () => {
      try {
        if (supabase) {
          const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
          if (!error && typeof count === 'number') {
            setActiveUsersCount(count);
          }
        }
      } catch (e) {
        console.log("[Screen2Native] Error fetching user count from Supabase:", e.message);
      }
    };
    fetchSupabaseUserCount();

    let channel;
    if (supabase) {
      channel = supabase
        .channel('public:profiles')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, payload => {
          setActiveUsersCount(prev => prev + 1);
        })
        .subscribe();
    }

    Animated.stagger(90, [
      Animated.parallel([
        Animated.timing(heroFade, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(heroSlide, { toValue: 0, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.spring(btnScale, { toValue: 1, tension: 110, friction: 9, useNativeDriver: true }),
      Animated.timing(readoutFade, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ctaPulse, { toValue: 1.04, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(ctaPulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: T.bg }]}
      contentContainerStyle={[styles.content, { paddingHorizontal: isWide ? 40 : 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <HelixBackground opacity={0.5} side="right" fps={30} />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient colors={["rgba(124,58,237,0.22)", "rgba(124,58,237,0.0)"]} style={styles.glow1} />
        <LinearGradient colors={["rgba(6,182,212,0.16)", "transparent"]} style={styles.glow2} />
      </View>

      <View style={[styles.wrapper, { maxWidth: isWide ? 720 : "100%" }]}>

        <Animated.View style={[styles.logoRow, { opacity: heroFade }]}>
          <LinearGradient
            colors={[T.accent, T.accentEnd]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.logoMark}
          >
            <Text style={styles.logoChar}>SG</Text>
          </LinearGradient>
          <Text style={styles.brandName}>SkillGenome</Text>
          <View style={{ marginLeft: "auto" }}>
            <DNAHelix size={44} rowCount={6} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: heroFade, transform: [{ translateY: heroSlide }] }}>
          <Text style={styles.eyebrow}>Genome-grade career intelligence</Text>
          <Text style={styles.headline}>
            <DecodeText text="Your Career," delay={200} style={styles.headline} />{"\n"}
            <DecodeText text="Decoded by AI." delay={700} style={styles.headlineAccent} />
          </Text>
          <Text style={styles.sub}>
            SkillGenome sequences your professional DNA, skills, mindset, and momentum, then compiles a living roadmap to your next breakthrough.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.ctaRow, { transform: [{ scale: btnScale }] }]}>
          <Animated.View style={[styles.primaryWrap, { transform: [{ scale: ctaPulse }] }]}>
            <Pressable onPress={onGetStarted} style={{ width: "100%" }}>
              <LinearGradient
                colors={[T.accent, "#5b21b6"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryText}>Get Started Free  →</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
          <Pressable onPress={onSignIn} style={styles.ghostBtn}>
            <Text style={styles.ghostText}>Sign In</Text>
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.activeUsersCard, { opacity: heroFade }]}>
          <View style={styles.liveDotWrap}>
            <Animated.View style={[styles.pulseLiveDot, { opacity: pulse }]} />
            <Text style={styles.liveLabelText}>ENROLLED</Text>
          </View>
          <Text style={styles.activeUsersMsg}>
            <Text style={styles.activeCountText}>{activeUsersCount.toLocaleString()}</Text> Enrolled Professionals Decoded
          </Text>
        </Animated.View>

        <Animated.View style={[styles.readoutsGrid, { opacity: readoutFade }]}>
          <View style={styles.readoutBoxCard}>
            <Text style={styles.readoutNum}>{activeUsersCount.toLocaleString()}</Text>
            <Text style={styles.readoutLbl}>PROFESSIONALS MAPPED</Text>
          </View>
          <View style={styles.readoutBoxCard}>
            <Text style={styles.readoutNum}>94.2%</Text>
            <Text style={styles.readoutLbl}>MATCH ACCURACY</Text>
          </View>
          <View style={styles.readoutBoxCard}>
            <Text style={styles.readoutNum}>24/7</Text>
            <Text style={styles.readoutLbl}>AI CAREER TWIN</Text>
          </View>
        </Animated.View>

        <View style={styles.sectionDivider}>
          <View style={[styles.divLine, { backgroundColor: T.border }]} />
          <Text style={styles.divLabel}>What you unlock</Text>
          <View style={[styles.divLine, { backgroundColor: T.border }]} />
        </View>

        <View style={[styles.cardsGrid, { flexDirection: isWide ? "row" : "column" }]}>
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.label} {...f} delay={i * 90 + 400} T={T} styles={styles} />
          ))}
        </View>

        <TestimonialCard T={T} styles={styles} />

        {/* Footer / Final CTA */}
        <View style={styles.footerCard}>
          <Text style={styles.footerHeadline}>Your next role is already{"\n"}written in the data.</Text>
          <Text style={styles.footerSub}>Start your sequence in under two minutes. No credit card required.</Text>
          <Pressable onPress={onGetStarted} style={styles.primaryWrap}>
            <LinearGradient
              colors={[T.accent, "#5b21b6"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryText}>Get Started Free  →</Text>
            </LinearGradient>
          </Pressable>
        </View>

      </View>
    </ScrollView>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const getStyles = (T, isWide, isDark) => StyleSheet.create({
  screen:  { flex: 1 },
  content: { flexGrow: 1, paddingVertical: 56, alignItems: "center" },

  glow1: { position: "absolute", top: -120, left: -120, width: 500, height: 500, borderRadius: 250 },
  glow2: { position: "absolute", bottom: 40, right: -100, width: 400, height: 400, borderRadius: 200 },
  gridOverlay: { ...StyleSheet.absoluteFillObject, flexDirection: "row" },
  gridLine: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: T.borderLow },

  wrapper: { width: "100%", alignSelf: "center", gap: 28 },

  logoRow:  { flexDirection: "row", alignItems: "center", gap: 12 },
  logoMark: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center", shadowColor: T.accent, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  logoChar: { fontSize: 15, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  brandName: { fontSize: 18, fontWeight: "800", color: T.text, letterSpacing: -0.4 },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, backgroundColor: "rgba(34,211,238,0.10)", borderColor: "rgba(34,211,238,0.28)" },
  liveDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22d3ee" },
  liveText: { fontSize: 11, fontWeight: "700", color: "#22d3ee", letterSpacing: 0.4 },

  seqRow: { flexDirection: "row", alignItems: "center" },
  seqPill: { flexDirection: "row", gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", borderWidth: 1, borderColor: T.border },
  seqChar: { fontSize: 12, fontWeight: "800" },

  eyebrow: { fontSize: 13, fontWeight: "700", letterSpacing: 0.6, color: T.cyan || T.muted, marginBottom: 8 },
  headline: { fontSize: isWide ? 54 : 42, fontWeight: "900", lineHeight: isWide ? 62 : 50, letterSpacing: -1.5, color: T.text },
  headlineAccent: { color: T.accent },
  sub: { fontSize: 17, lineHeight: 27, color: T.muted, marginTop: 16, maxWidth: 600 },

  ctaRow: { flexDirection: "row", gap: 12 },
  primaryWrap: { borderRadius: 16, overflow: "hidden", flex: 1, shadowColor: T.accent, shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: { width: 0, height: 5 } },
  primaryBtn: { paddingVertical: 18, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 0.2 },
  ghostBtn: {
    paddingVertical: 17, paddingHorizontal: 28, borderRadius: 16, borderWidth: 1.5,
    borderColor: T.border, backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
    alignItems: "center", justifyContent: "center",
  },
  ghostText: { color: T.text, fontWeight: "700", fontSize: 16 },

  activeUsersCard: {
    flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18,
    borderWidth: 1, borderColor: T.border, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
  },
  liveDotWrap: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: "rgba(34,197,94,0.15)", borderWidth: 1, borderColor: "rgba(34,197,94,0.3)" },
  pulseLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22c55e" },
  liveLabelText: { fontSize: 10, fontWeight: "800", color: "#22c55e", letterSpacing: 0.5 },
  avatarStack: { flexDirection: "row", alignItems: "center" },
  stackAvatar: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: isDark ? "#09090b" : "#fff" },
  stackAvatarText: { fontSize: 9, fontWeight: "800", color: "#fff" },
  activeUsersMsg: { fontSize: 12.5, color: T.muted, fontWeight: "500", flex: 1 },
  activeCountText: { fontWeight: "800", color: T.text },

  readoutsGrid: { flexDirection: "row", gap: 12, marginTop: 10 },
  readoutBoxCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
    alignItems: "center",
    shadowColor: T.accent,
    shadowOpacity: isDark ? 0 : 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  readoutNum: { fontSize: 20, fontWeight: "900", color: T.text, letterSpacing: -0.5 },
  readoutLbl: { fontSize: 9.5, color: T.muted, marginTop: 4, letterSpacing: 0.5, fontWeight: "700", textAlign: "center" },

  tickerSection: { marginTop: 6 },
  tickerLabel: { fontSize: 11, color: T.muted, fontWeight: "700", letterSpacing: 1.4, textAlign: "center", marginBottom: 14 },
  tickerMask: { overflow: "hidden" },
  tickerTrack: { flexDirection: "row" },
  tickerRow: { flexDirection: "row" },
  tickerItem: { fontSize: 13, color: T.muted, fontWeight: "600" },

  sectionDivider: { flexDirection: "row", alignItems: "center", gap: 16, marginVertical: 10 },
  divLine: { flex: 1, height: 1 },
  divLabel: { fontSize: 12, color: T.muted, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },

  cardsGrid: { gap: 14 },
  card: {
    flex: 1, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff",
    borderWidth: 1, borderColor: T.border, borderRadius: 18, padding: 22,
    shadowColor: "#000", shadowOpacity: isDark ? 0 : 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  cardIconWrap: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center", marginBottom: 14, backgroundColor: isDark ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.08)" },
  cardIcon: { fontSize: 22 },
  cardTitle: { fontSize: 16.5, fontWeight: "800", color: isDark ? "#ffffff" : T.text, marginBottom: 6 },
  cardLabel: { fontSize: 16.5, fontWeight: "800", color: isDark ? "#ffffff" : T.text, marginBottom: 6 },
  cardSub: { fontSize: 13.5, color: isDark ? "#cbd5e1" : T.muted, lineHeight: 20, fontWeight: "500" },

  proofCard: {
    borderRadius: 24, borderWidth: 1, borderColor: T.border, padding: 28, overflow: "hidden",
    backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#fff",
    shadowColor: T.accent, shadowOpacity: isDark ? 0 : 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
  },
  proofMark: { fontSize: 44, color: T.accentEnd || T.accent, opacity: 0.4, lineHeight: 44, marginBottom: 2 },
  proofQuote: { fontSize: 17, lineHeight: 27, color: T.text, fontWeight: "600" },
  attrRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 18 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 13, fontWeight: "800", color: "#fff" },
  attrName: { fontSize: 14, fontWeight: "700", color: T.text },
  attrRole: { fontSize: 12.5, color: T.muted, marginTop: 1 },
  dotsRow: { flexDirection: "row", gap: 7, marginTop: 22 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.border },
  dotActive: { width: 20, backgroundColor: "#22d3ee" },

  footerCard: {
    borderRadius: 24, borderWidth: 1, borderColor: T.border, padding: 32,
    backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#fff",
    alignItems: "center", gap: 14, marginTop: 24,
  },
  footerHeadline: {
    fontSize: isWide ? 28 : 22, fontWeight: "900", color: T.text,
    textAlign: "center", letterSpacing: -0.6, lineHeight: isWide ? 36 : 28,
  },
  footerSub: {
    fontSize: 14, color: T.muted, textAlign: "center", marginBottom: 8,
  },
});

export default Screen2Native;
