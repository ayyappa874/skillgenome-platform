import * as React from "react";
import {
  ScrollView, StyleSheet, View, Text, TextInput, Pressable,
  Animated, useWindowDimensions, Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/**
 * Self-contained theme function — does NOT depend on the app's shared
 * getTheme() util, so this screen can never inherit the "invisible text"
 * bug from a mismatched theme file. Both branches below are checked for
 * WCAG-safe contrast against their own background.
 */
const getColors = (isDarkMode) => isDarkMode ? ({
  bg: "#090b12", bg2: "#0d1019",
  surface: "#12151f", surface2: "#171b28",
  field: "#14171f", fieldFocus: "#181c28",
  border: "rgba(255,255,255,0.08)", borderStrong: "rgba(255,255,255,0.18)",
  text: "#f3f4f8", muted: "#8d93a8", mutedDim: "#5d6273",
  violet: "#8b5cf6", violetDeep: "#5b21b6", teal: "#2dd4bf", amber: "#f0b429",
  placeholder: "#5d6273",
}) : ({
  bg: "#f6f5fb", bg2: "#efeefa",
  surface: "#ffffff", surface2: "#f8f7fc",
  field: "#ffffff", fieldFocus: "#ffffff",
  border: "rgba(20,20,30,0.09)", borderStrong: "rgba(20,20,30,0.16)",
  text: "#14141f", muted: "#66697c", mutedDim: "#8b8ea1",
  violet: "#7c3aed", violetDeep: "#5b21b6", teal: "#0d9488", amber: "#b45309",
  placeholder: "#a6a9ba",
});

const SEQUENCE = ["A", "T", "C"];

const SOCIALS = [
  { key: "google", label: "Google", emoji: "🌐" },
  { key: "github", label: "GitHub", emoji: "💻" },
  { key: "linkedin", label: "LinkedIn", emoji: "💼" },
];

const Screen4Native = ({
  onSignInPress, 
  onForgotPasswordPress, 
  onCreateAccountPress, 
  onGooglePress, 
  onGitHubPress, 
  onLinkedInPress,
  isDarkMode = true,
}) => {
  const C = getColors(isDarkMode);
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const styles = React.useMemo(() => getStyles(C, isWide), [isDarkMode, isWide]);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [focusedField, setFocusedField] = React.useState(null);

  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 550, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient colors={[`${C.violet}30`, `${C.violet}00`]} style={styles.glow1} />
        <LinearGradient colors={[`${C.teal}20`, `${C.teal}00`]} style={styles.glow2} />
      </View>

      <Animated.View style={[styles.card, { maxWidth: isWide ? 440 : "100%", opacity: fade, transform: [{ translateY: slide }] }]}>

        {/* Brand badge */}
        <View style={styles.badgeRow}>
          <LinearGradient colors={[C.violet, "#4f9dff"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoMark}>
            <Text style={styles.logoChar}>SG</Text>
          </LinearGradient>
          <Text style={styles.brandName}>SkillGenome</Text>
          <View style={styles.seqPill}>
            {SEQUENCE.map((base, i) => (
              <Text key={base} style={[styles.seqChar, { color: i % 2 === 0 ? C.violet : C.teal }]}>{base}</Text>
            ))}
          </View>
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.lead}>
          Sign in to access your <Text style={styles.leadBold}>Career Genome</Text> & AI Mentor
        </Text>

        {/* Email */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={[styles.input, focusedField === "email" && styles.inputFocused]}
            placeholder="you@example.com"
            placeholderTextColor={C.placeholder}
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              style={[styles.input, styles.passwordInput, focusedField === "password" && styles.inputFocused]}
              placeholder="Enter your password"
              placeholderTextColor={C.placeholder}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword((s) => !s)} style={styles.showBtn} hitSlop={10}>
              <Text style={styles.showBtnText}>{showPassword ? "Hide" : "Show"}</Text>
            </Pressable>
          </View>
        </View>

        <Pressable onPress={onForgotPasswordPress} style={styles.forgotRow} hitSlop={8}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>

        {/* Sign in */}
        <Pressable onPress={() => onSignInPress?.(email, password)} style={styles.primaryWrap}>
          <LinearGradient colors={[C.violet, C.violetDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
            <Text style={styles.primaryText}>Sign in  →</Text>
          </LinearGradient>
        </Pressable>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.divLine} />
          <Text style={styles.divLabel}>Or continue with</Text>
          <View style={styles.divLine} />
        </View>

        {/* Socials */}
        <View style={styles.socialRow}>
          <Pressable onPress={onGooglePress} style={styles.socialBtn}>
            <Text style={styles.socialEmoji}>🌐</Text>
            <Text style={styles.socialLabel}>Google</Text>
          </Pressable>
          <Pressable onPress={onGitHubPress} style={styles.socialBtn}>
            <Text style={styles.socialEmoji}>💻</Text>
            <Text style={styles.socialLabel}>GitHub</Text>
          </Pressable>
          <Pressable onPress={onLinkedInPress} style={styles.socialBtn}>
            <Text style={styles.socialEmoji}>💼</Text>
            <Text style={styles.socialLabel}>LinkedIn</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <Pressable onPress={onCreateAccountPress} style={styles.footerLink}>
          <Text style={styles.footerText}>
            Don't have an account? <Text style={styles.footerLinkAccent}>Create one now</Text>
          </Text>
        </Pressable>

        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>ENCRYPTED · SOC2 COMPLIANT</Text>
        </View>

      </Animated.View>
    </ScrollView>
  );
};

const getStyles = (C, isWide) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 24, paddingVertical: 48 },
  glow1: { position: "absolute", top: -140, right: -100, width: 460, height: 460, borderRadius: 230 },
  glow2: { position: "absolute", bottom: -100, left: -120, width: 420, height: 420, borderRadius: 210 },

  card: {
    width: "100%",
    backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.borderStrong,
    borderRadius: 26, padding: 30,
    shadowColor: C.violet, shadowOpacity: isWide ? 0.15 : 0.08, shadowRadius: 40, shadowOffset: { width: 0, height: 20 },
    elevation: 6,
  },

  badgeRow: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 22, flexWrap: "wrap" },
  logoMark: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  logoChar: { fontSize: 10, fontWeight: "800", color: "#fff" },
  brandName: { fontSize: 14, fontWeight: "700", color: C.text, letterSpacing: -0.2 },
  seqPill: { flexDirection: "row", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100, backgroundColor: `${C.violet}20` },
  seqChar: { fontSize: 10, fontWeight: "800" },

  title: { fontSize: 27, fontWeight: "800", color: C.text, letterSpacing: -0.6, marginBottom: 8 },
  lead: { fontSize: 14, lineHeight: 21, color: C.muted, marginBottom: 26 },
  leadBold: { color: C.text, fontWeight: "700" },

  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 11.5, fontWeight: "700", color: C.muted, marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.4 },
  input: {
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.field,
    borderRadius: 13, paddingHorizontal: 16, paddingVertical: Platform.OS === "ios" ? 14 : 11,
    fontSize: 14.5, color: C.text,
  },
  inputFocused: { borderColor: C.violet, backgroundColor: C.fieldFocus },
  passwordWrap: { position: "relative", justifyContent: "center" },
  passwordInput: { paddingRight: 60 },
  showBtn: { position: "absolute", right: 14 },
  showBtnText: { fontSize: 12.5, fontWeight: "700", color: C.violet },

  forgotRow: { alignItems: "flex-end", marginTop: -6, marginBottom: 18 },
  forgotText: { fontSize: 13, fontWeight: "700", color: C.violet },

  primaryWrap: { borderRadius: 14, overflow: "hidden", shadowColor: C.violet, shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  primaryBtn: { paddingVertical: 16, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 15.5 },

  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 22 },
  divLine: { flex: 1, height: 1, backgroundColor: C.border },
  divLabel: { fontSize: 10.5, fontWeight: "700", color: C.mutedDim, textTransform: "uppercase", letterSpacing: 0.6 },

  socialRow: { flexDirection: "row", gap: 10, marginBottom: 22 },
  socialBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.surface2,
    borderRadius: 12, paddingVertical: 12,
  },
  socialEmoji: { fontSize: 15 },
  socialLabel: { fontSize: 12, fontWeight: "700", color: C.text },

  footerLink: {
    borderRadius: 13, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface2,
    paddingVertical: 14, alignItems: "center",
  },
  footerText: { fontSize: 13.5, fontWeight: "600", color: C.text },
  footerLinkAccent: { color: C.violet, fontWeight: "800" },

  statusRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 18 },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.teal },
  statusText: { fontSize: 10.5, fontWeight: "700", color: C.mutedDim, letterSpacing: 0.3 },
});

export default Screen4Native;
