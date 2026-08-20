import * as React from "react";
import {
  Alert, Image, Pressable, ScrollView, StyleSheet,
  Text, TextInput, View, Platform, Animated
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { t } from "../utils/translations";
import { getTheme } from "../utils/theme";

// ── Design tokens ─────────────────────────────────────────────────
const T = {
  bg:       "#09090b",
  surface:  "rgba(255,255,255,0.05)",
  surface2: "rgba(255,255,255,0.08)",
  border:   "rgba(255,255,255,0.1)",
  borderLow:"rgba(255,255,255,0.06)",
  inputBg:  "rgba(255,255,255,0.07)",
  text:     "#fafafa",
  muted:    "#71717a",
  subtle:   "#27272a",
  accent:   "#7c3aed",
  accentEnd:"#5b21b6",
  cyan:     "#06b6d4",
  green:    "#22c55e",
  purple:   "#a855f7",
};

const WHAT_WE_SCAN = [
  { icon: "📊", label: "Language distribution" },
  { icon: "⭐", label: "Repository quality & stars" },
  { icon: "🔄", label: "Commit frequency pattern" },
  { icon: "🧩", label: "Framework & tool diversity" },
  { icon: "🤝", label: "Open-source contributions" },
  { icon: "📈", label: "GitHub developer score" },
];

const GitHubConnectScreen = ({
  onBack, onAnalyze, onGitHubSignIn,
  previousUsername = "", isDarkMode = true, language = "English"
}) => {
  const T = getTheme(isDarkMode);
  const [username,          setUsername]          = React.useState("");
  const [connectedAccounts, setConnectedAccounts] = React.useState([]);
  const [focused,           setFocused]           = React.useState(false);

  // Entrance animation
  const fade  = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;
  const borderAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 160, useNativeDriver: false }).start();
  };
  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 160, useNativeDriver: false }).start();
  };
  const borderColor = borderAnim.interpolate({ inputRange: [0, 1], outputRange: [T.border, T.accent] });

  React.useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("recentGitHubAccounts");
        if (stored) {
          let accounts = JSON.parse(stored);
          if (previousUsername && !accounts.find(a => a.handle === `@${previousUsername}`)) {
            accounts = [{ name: previousUsername, handle: `@${previousUsername}` }, ...accounts].slice(0, 5);
          }
          setConnectedAccounts(accounts);
        } else if (previousUsername) {
          setConnectedAccounts([{ name: previousUsername, handle: `@${previousUsername}` }]);
        }
      } catch (e) { console.error("GitHub: failed to load accounts", e); }
    })();
  }, [previousUsername]);

  const handleConnectAnalyze = async () => {
    const cleaned = username.trim();
    if (!cleaned) { Alert.alert("Username required", "Enter your GitHub username to continue."); return; }
    try {
      const newAccount    = { name: cleaned, handle: `@${cleaned}` };
      const filtered      = connectedAccounts.filter(a => a.handle !== newAccount.handle);
      const updated       = [newAccount, ...filtered].slice(0, 5);
      setConnectedAccounts(updated);
      await AsyncStorage.setItem("recentGitHubAccounts", JSON.stringify(updated));
    } catch (e) { console.error("GitHub: save failed", e); }
    if (typeof onAnalyze === "function") { onAnalyze(cleaned); return; }
    Alert.alert("Analyzing", `Fetching GitHub data for ${cleaned}…`);
  };

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      {/* Ambient glow */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["rgba(124,58,237,0.20)", "transparent"]}
          style={{ position: "absolute", top: -60, left: -60, width: 380, height: 380, borderRadius: 190 }}
        />
        <LinearGradient
          colors={["rgba(6,182,212,0.12)", "transparent"]}
          style={{ position: "absolute", bottom: 40, right: -60, width: 300, height: 300, borderRadius: 150 }}
        />
      </View>

      {/* Header */}
      <View style={S.header}>
        <Pressable style={S.backBtn} onPress={() => typeof onBack === "function" && onBack()}>
          <Text style={S.backIcon}>←</Text>
        </Pressable>
        <View>
          <Text style={S.pageTitle}>GitHub Dev DNA</Text>
          <Text style={S.pageSub}>Connect your repositories to unlock developer insights</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 24 }}>

          {/* GitHub hero banner */}
          <View style={[S.heroBanner, { borderColor: "rgba(165,85,247,0.3)" }]}>
            <LinearGradient
              colors={["rgba(124,58,237,0.15)", "rgba(6,182,212,0.08)", "transparent"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={S.heroBannerLeft}>
              <View style={[S.githubIcon, { backgroundColor: T.surface2 }]}>
                <Text style={S.githubIconText}>⌥</Text>
              </View>
              <View>
                <Text style={S.heroBannerTitle}>GitHub Developer Analysis</Text>
                <Text style={S.heroBannerSub}>AI-powered code quality & contribution insights</Text>
              </View>
            </View>
            <View style={[S.heroBadge, { backgroundColor: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.3)" }]}>
              <View style={[S.heroBadgeDot, { backgroundColor: T.green }]} />
              <Text style={[S.heroBadgeText, { color: T.green }]}>Live</Text>
            </View>
          </View>

          {/* Input form */}
          <View style={[S.formCard, { borderColor: T.border }]}>
            <Text style={S.formLabel}>GITHUB USERNAME</Text>
            <Animated.View style={[S.inputWrap, { borderColor }]}>
              <Text style={S.inputPrefix}>github.com / </Text>
              <TextInput
                style={[S.input, { color: T.text }]}
                value={username}
                onChangeText={setUsername}
                placeholder="your-username"
                placeholderTextColor={T.muted}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </Animated.View>

            {/* Primary CTA */}
            <Pressable onPress={handleConnectAnalyze} style={S.primaryWrap}>
              <LinearGradient
                colors={[T.accent, T.accentEnd]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={S.primaryBtn}
              >
                <Text style={S.primaryText}>⌥  Analyze My GitHub DNA</Text>
              </LinearGradient>
            </Pressable>

            {/* Divider */}
            <View style={S.orRow}>
              <View style={[S.orLine, { backgroundColor: T.border }]} />
              <Text style={S.orText}>or sign in with GitHub</Text>
              <View style={[S.orLine, { backgroundColor: T.border }]} />
            </View>

            {/* OAuth button */}
            <Pressable
              style={[S.oauthBtn, { borderColor: T.border, backgroundColor: T.surface }]}
              onPress={() => typeof onGitHubSignIn === "function" ? onGitHubSignIn() : Alert.alert("GitHub OAuth", "Connecting to GitHub…")}
            >
              <Text style={S.oauthIcon}>⌥</Text>
              <Text style={[S.oauthText, { color: T.text }]}>Continue with GitHub OAuth</Text>
            </Pressable>
          </View>

          {/* What we scan */}
          <View style={[S.infoCard, { borderColor: "rgba(124,58,237,0.3)", backgroundColor: "rgba(124,58,237,0.07)" }]}>
            <Text style={[S.infoTitle, { color: T.accent }]}>✦  What we analyze</Text>
            <View style={S.infoGrid}>
              {WHAT_WE_SCAN.map((w) => (
                <View key={w.label} style={S.infoItem}>
                  <View style={[S.infoIconWrap, { backgroundColor: T.surface2 }]}>
                    <Text style={S.infoIcon}>{w.icon}</Text>
                  </View>
                  <Text style={S.infoText}>{w.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Recent accounts */}
          {connectedAccounts.length > 0 && (
            <View style={S.recentSection}>
              <Text style={S.recentTitle}>RECENT PROFILES</Text>
              <View style={S.recentList}>
                {connectedAccounts.map((account) => (
                  <Pressable
                    key={account.handle}
                    style={[S.accountCard, { borderColor: T.borderLow, backgroundColor: T.surface }]}
                    onPress={() => {
                      const u = account.handle.replace("@", "");
                      setUsername(u);
                      if (typeof onAnalyze === "function") { onAnalyze(u); return; }
                    }}
                  >
                    <LinearGradient
                      colors={[T.accent, T.purple]}
                      style={S.accountAvatar}
                    >
                      <Text style={S.accountAvatarText}>{account.name[0]?.toUpperCase()}</Text>
                    </LinearGradient>
                    <View style={S.accountInfo}>
                      <Text style={S.accountName}>{account.name}</Text>
                      <Text style={S.accountHandle}>{account.handle}</Text>
                    </View>
                    <Text style={[S.accountChevron, { color: T.muted }]}>›</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Privacy note */}
          <Text style={S.privacyNote}>
            🔒  Read-only access to public repositories. We never request write permissions or store your code.
          </Text>

        </Animated.View>
      </ScrollView>
    </View>
  );
};

const S = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", gap: 16,
    paddingTop: Platform.OS === "ios" ? 54 : 28,
    paddingHorizontal: 20, paddingBottom: 16,
  },
  backBtn:   { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  backIcon:  { fontSize: 18, color: T.text, fontWeight: "600" },
  pageTitle: { fontSize: 22, fontWeight: "800", color: T.text, letterSpacing: -0.4 },
  pageSub:   { fontSize: 12, color: T.muted, marginTop: 2 },

  content: { paddingHorizontal: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },

  // Hero banner
  heroBanner:     { borderRadius: 20, borderWidth: 1, padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", overflow: "hidden", backgroundColor: T.surface },
  heroBannerLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  githubIcon:     { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  githubIconText: { fontSize: 26 },
  heroBannerTitle:{ fontSize: 15, fontWeight: "800", color: T.text },
  heroBannerSub:  { fontSize: 11, color: T.muted, marginTop: 2 },
  heroBadge:      { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  heroBadgeDot:   { width: 6, height: 6, borderRadius: 3 },
  heroBadgeText:  { fontSize: 11, fontWeight: "700" },

  // Form card
  formCard:  { borderRadius: 20, borderWidth: 1, padding: 22, backgroundColor: "rgba(255,255,255,0.03)", gap: 16 },
  formLabel: { fontSize: 10, fontWeight: "700", color: T.muted, letterSpacing: 1 },
  inputWrap: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1.5, backgroundColor: T.inputBg },
  inputPrefix:{ fontSize: 14, color: T.muted, paddingLeft: 16, fontWeight: "600" },
  input:     { flex: 1, paddingVertical: 15, paddingRight: 16, fontSize: 15 },

  primaryWrap: { borderRadius: 14, overflow: "hidden" },
  primaryBtn:  { paddingVertical: 17, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 15, letterSpacing: 0.1 },

  orRow:  { flexDirection: "row", alignItems: "center", gap: 12 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 12, color: T.muted },

  oauthBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1, borderRadius: 14, paddingVertical: 15 },
  oauthIcon: { fontSize: 20 },
  oauthText: { fontSize: 15, fontWeight: "700" },

  // Info card
  infoCard:  { borderRadius: 18, borderWidth: 1, padding: 18, gap: 14 },
  infoTitle: { fontSize: 13, fontWeight: "800", letterSpacing: 0.2 },
  infoGrid:  { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  infoItem:  { flexDirection: "row", alignItems: "center", gap: 8, width: "47%" },
  infoIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  infoIcon:  { fontSize: 16 },
  infoText:  { fontSize: 12, color: T.muted, flex: 1, lineHeight: 17 },

  // Recent accounts
  recentSection: { gap: 12 },
  recentTitle:   { fontSize: 10, fontWeight: "700", color: T.muted, letterSpacing: 1 },
  recentList:    { gap: 10 },
  accountCard:   { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 16, borderWidth: 1, padding: 14 },
  accountAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  accountAvatarText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  accountInfo:   { flex: 1, gap: 2 },
  accountName:   { fontSize: 14, fontWeight: "700", color: T.text },
  accountHandle: { fontSize: 12, color: T.muted },
  accountChevron:{ fontSize: 22 },

  privacyNote: { fontSize: 11, color: "rgba(113,113,122,0.7)", textAlign: "center", lineHeight: 18 },

  borderLow: { borderColor: T.borderLow },
});

export default GitHubConnectScreen;
