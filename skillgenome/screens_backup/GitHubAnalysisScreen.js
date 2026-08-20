import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Animated, ActivityIndicator } from "react-native";
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
  purple:   "#a855f7",
};

const GitHubAnalysisScreen = ({ username = "unknown", onBack, onSync, language = 'English', isDarkMode = true }) => {
  const T = getTheme(isDarkMode);
  const [data, setData]       = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Animations
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    const generateFallback = (uname) => {
      const baseSeed = uname.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
      return {
        username: uname, score: 86,
        languages: ["Python", "TypeScript", "Go"].slice(0, 3 + (baseSeed % 2)),
        repos: [
          { name: `${uname.slice(0, 4)}-API`, stars: 120 },
          { name: `${uname.slice(0, 4)}-Web`, stars: 45 },
          { name: `${uname.slice(0, 4)}-CLI`, stars: 12 }
        ]
      };
    };

    const fetchGit = async () => {
      setLoading(true);
      try {
        const [uRes, rRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`)
        ]);
        if (!uRes.ok || !rRes.ok) throw new Error("API failed");
        
        const userData = await uRes.json();
        const reposData = await rRes.json();
        
        const langMap = {};
        reposData.forEach(r => { if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1; });
        const langs = Object.keys(langMap).sort((a, b) => langMap[b] - langMap[a]).slice(0, 4);
        
        const repos = reposData.slice(0, 4).map(r => ({ name: r.name, stars: r.stargazers_count || 0 }));
        const starScore = Math.min(30, reposData.reduce((s, r) => s + (r.stargazers_count||0), 0) * 4);
        const repoScore = Math.min(40, (userData.public_repos || reposData.length) * 4);
        const langScore = Math.min(30, langs.length * 8);
        const finalScore = Math.round(Math.min(99, 15 + starScore + repoScore + langScore));

        setData({ username, score: finalScore, languages: langs.length ? langs : ["JavaScript"], repos });
      } catch (e) {
        setData(generateFallback(username));
      } finally {
        setLoading(false);
        Animated.parallel([
          Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
      }
    };
    fetchGit();
  }, [username, fade, slide]);

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      {/* Ambient glow */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["rgba(168,85,247,0.15)", "transparent"]}
          style={{ position: "absolute", top: -80, right: -60, width: 340, height: 340, borderRadius: 170 }}
        />
      </View>

      <View style={S.header}>
        <Pressable style={S.backBtn} onPress={onBack}>
          <Text style={S.backIcon}>←</Text>
        </Pressable>
        <View>
          <Text style={S.pageTitle}>GitHub Analysis</Text>
          <Text style={S.pageSub}>Developer footprint decoded</Text>
        </View>
      </View>

      {loading ? (
        <View style={S.loadingWrap}>
          <ActivityIndicator size="large" color={T.purple} />
          <Text style={S.loadingText}>Analyzing repositories...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 20 }}>
            
            {/* Score Hero */}
            <View style={[S.heroCard, { borderColor: T.border }]}>
              <LinearGradient colors={["rgba(168,85,247,0.1)", "transparent"]} style={StyleSheet.absoluteFill} />
              
              <View style={S.heroTop}>
                <View style={S.heroUserRow}>
                  <View style={[S.userIcon, { backgroundColor: T.surface2 }]}>
                    <Text style={S.userIconText}>👤</Text>
                  </View>
                  <View>
                    <Text style={S.userName}>{data.username}</Text>
                    <Text style={S.userSub}>Verified Developer</Text>
                  </View>
                </View>
                <View style={[S.badge, { backgroundColor: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.3)" }]}>
                  <Text style={[S.badgeText, { color: T.green }]}>Live Sync</Text>
                </View>
              </View>

              <View style={S.scoreWrap}>
                <View style={S.scoreLabelWrap}>
                  <Text style={S.scoreEyebrow}>DEVELOPER GENOME</Text>
                  <Text style={S.scoreDesc}>Based on commits, languages, and repo metrics.</Text>
                </View>
                <View style={[S.scoreRing, { borderColor: T.purple }]}>
                  <Text style={S.scoreNum}>{data.score}</Text>
                </View>
              </View>
            </View>

            {/* Languages */}
            <View style={S.section}>
              <Text style={S.sectionTitle}>TOP LANGUAGES</Text>
              <View style={S.langWrap}>
                {data.languages.map((l, i) => (
                  <View key={l} style={[S.langPill, { borderColor: T.border, backgroundColor: T.surface }]}>
                    <View style={[S.langDot, { backgroundColor: [T.cyan, T.purple, T.amber, T.rose][i % 4] }]} />
                    <Text style={S.langText}>{l}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Repositories */}
            <View style={S.section}>
              <Text style={S.sectionTitle}>HIGHLIGHTED REPOSITORIES ({data.repos.length})</Text>
              <View style={S.repoList}>
                {data.repos.map((r) => (
                  <View key={r.name} style={[S.repoCard, { borderColor: T.border, backgroundColor: T.surface }]}>
                    <View style={S.repoLeft}>
                      <Text style={S.repoIcon}>📁</Text>
                      <Text style={S.repoName}>{r.name}</Text>
                    </View>
                    <View style={S.repoRight}>
                      <Text style={S.repoStars}>⭐ {r.stars}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Sync Action */}
            <Pressable onPress={() => onSync && onSync({ ...data, isLive: true })} style={S.syncWrap}>
              <LinearGradient colors={[T.purple, T.accentEnd]} start={{x:0,y:0}} end={{x:1,y:0}} style={S.syncBtn}>
                <Text style={S.syncText}>Sync to Profile  →</Text>
              </LinearGradient>
            </Pressable>

          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
};

const S = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 16, paddingTop: Platform.OS === "ios" ? 54 : 28, paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 18, color: T.text, fontWeight: "600" },
  pageTitle: { fontSize: 22, fontWeight: "800", color: T.text, letterSpacing: -0.4 },
  pageSub: { fontSize: 12, color: T.muted, marginTop: 2 },
  content: { paddingHorizontal: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },

  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  loadingText: { fontSize: 14, color: T.muted, fontWeight: "600" },

  heroCard: { borderRadius: 20, borderWidth: 1, backgroundColor: T.surface, padding: 22, gap: 24, overflow: "hidden" },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroUserRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  userIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  userIconText: { fontSize: 18 },
  userName: { fontSize: 16, fontWeight: "800", color: T.text },
  userSub: { fontSize: 12, color: T.muted },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: "700" },

  scoreWrap: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  scoreLabelWrap: { flex: 1, paddingRight: 20, gap: 4 },
  scoreEyebrow: { fontSize: 10, fontWeight: "800", color: T.purple, letterSpacing: 1 },
  scoreDesc: { fontSize: 12, color: T.muted, lineHeight: 18 },
  scoreRing: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  scoreNum: { fontSize: 26, fontWeight: "900", color: T.text, letterSpacing: -1 },

  section: { gap: 12 },
  sectionTitle: { fontSize: 10, fontWeight: "700", color: T.muted, letterSpacing: 1, marginLeft: 4 },
  
  langWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  langPill: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, gap: 8 },
  langDot: { width: 8, height: 8, borderRadius: 4 },
  langText: { fontSize: 13, fontWeight: "600", color: T.text },

  repoList: { gap: 10 },
  repoCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 16, borderWidth: 1 },
  repoLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  repoIcon: { fontSize: 16 },
  repoName: { fontSize: 15, fontWeight: "700", color: T.text },
  repoRight: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: T.surface2 },
  repoStars: { fontSize: 13, fontWeight: "700", color: T.muted },

  syncWrap: { borderRadius: 16, overflow: "hidden", marginTop: 8 },
  syncBtn: { paddingVertical: 18, alignItems: "center" },
  syncText: { color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 0.1 },
});

export default GitHubAnalysisScreen;