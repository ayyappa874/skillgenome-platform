import * as React from "react";
import {
  Text, StyleSheet, View, Image,
  Pressable, Animated, useWindowDimensions, Platform, Easing, Linking
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { getTheme } from "../utils/theme";

const getColors = (isDarkMode) => isDarkMode ? ({
  bg: "#07111f",
  surface: "#101826",
  surface2: "#162033",
  border: "rgba(255,255,255,0.06)",
  borderStrong: "rgba(255,255,255,0.12)",
  text: "#f8fafc",
  muted: "#9aa7bf",
  violet: "#8b5cf6",
  violetDeep: "#5b21b6",
  teal: "#2dd4bf",
  cyan: "#38bdf8",
  rose: "#fb7185",
  amber: "#fbbf24",
  green: "#34d399",
  purple: "#a78bfa",
}) : ({
  bg: "#f5f7ff",
  surface: "#ffffff",
  surface2: "#f8fafc",
  border: "rgba(15, 23, 42, 0.07)",
  borderStrong: "rgba(15, 23, 42, 0.12)",
  text: "#111827",
  muted: "#64748b",
  violet: "#7c3aed",
  violetDeep: "#5b21b6",
  teal: "#0f766e",
  cyan: "#0284c7",
  rose: "#e11d48",
  amber: "#b45309",
  green: "#059669",
  purple: "#9333ea",
});

const MODULES = [
  { id: "resume", label: "Resume DNA", icon: "📄", scoreKey: "resumeScore", key: "isResumeCompleted", colorKey: "violet" },
  { id: "github", label: "GitHub", icon: "💻", scoreKey: "githubScore", key: "isGitHubCompleted", colorKey: "cyan" },
  { id: "thought", label: "ThoughtPrint", icon: "🧠", scoreKey: "thoughtScore", key: "isThoughtCompleted", colorKey: "rose" },
  { id: "emotion", label: "EmotionPrint", icon: "🎭", scoreKey: "emotionScore", key: "isEmotionCompleted", colorKey: "amber" },
];

const TOP_COMPANIES = [
  { name: "Google", role: "Software engineering", fit: 96, region: "US", accent: "#4f46e5" },
  { name: "Microsoft", role: "Product & AI", fit: 94, region: "US", accent: "#2563eb" },
  { name: "Amazon", role: "Operations & tech", fit: 92, region: "US", accent: "#f59e0b" },
  { name: "Meta", role: "Product design", fit: 90, region: "US", accent: "#0891b2" },
  { name: "Apple", role: "iOS & platforms", fit: 89, region: "US", accent: "#111827" },
  { name: "NVIDIA", role: "ML & systems", fit: 88, region: "US", accent: "#22c55e" },
  { name: "Adobe", role: "Experience design", fit: 87, region: "US", accent: "#ec4899" },
  { name: "Stripe", role: "Fintech engineering", fit: 85, region: "US", accent: "#0f766e" },
  { name: "OpenAI", role: "Research & product", fit: 84, region: "US", accent: "#7c3aed" },
  { name: "Goldman Sachs", role: "Technology & finance", fit: 82, region: "UK", accent: "#b45309" },
];

const QUICK_ACTIONS = [
  { id: "interview", label: "Interview prep", icon: "🎯", colorKey: "green", key: "onOpenInterviewPrep" },
  { id: "mentors", label: "Mentor matches", icon: "🚀", colorKey: "violet", key: "onOpenMentors" },
  { id: "connections", label: "My Connections", icon: "🤝", colorKey: "blue", key: "onOpenConnections" },
  { id: "sessions", label: "Live Sessions", icon: "📹", colorKey: "rose", key: "onOpenSessions" },
  { id: "timeline", label: "Timeline sync", icon: "📅", colorKey: "purple", key: "onOpenTimeline" },
  { id: "community", label: "Community", icon: "🌐", colorKey: "rose", key: "onOpenCommunity" },
  { id: "jobs", label: "Explore jobs", icon: "💼", colorKey: "amber", key: "onOpenExplore" },
  { id: "study", label: "Study group", icon: "📖", colorKey: "cyan", key: "onOpenStudyGroup" },
  { id: "quiz", label: "Daily Quiz", icon: "🧠", colorKey: "teal", key: "onOpenDailyQuiz" },
  { id: "learning", label: "Daily Learning", icon: "📚", colorKey: "purple", key: "onOpenDailyLearning" },
];

function PressCard({ style, onPress, children }) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const onIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 180, friction: 10 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 180, friction: 10 }).start();
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable onPress={onPress} onPressIn={onIn} onPressOut={onOut} style={{ flex: 1 }}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

function PulseBox({ children, style }) {
  const anim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 2500, useNativeDriver: true })
      ])
    ).start();
  }, []);
  const pulseStyle = {
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.4] }),
    shadowRadius: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 25] }),
    elevation: anim.interpolate({ inputRange: [0, 1], outputRange: [2, 10] })
  };
  return <Animated.View style={[style, pulseStyle]}>{children}</Animated.View>;
}

function GlowBar({ value, color, C, styles }) {
  const anim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(anim, { toValue: value, duration: 800, delay: 120, useNativeDriver: false }).start();
  }, [value]);
  return (
    <View style={[styles.glowTrack, { backgroundColor: C.surface2, borderColor: C.border }]}> 
      <Animated.View style={[styles.glowFillWrap, { width: anim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }) }]}> 
        <LinearGradient colors={[color, `${color}88`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}

function ScoreRing({ score, accent, C, isWide, styles }) {
  const numAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const [display, setDisplay] = React.useState(0);
  
  React.useEffect(() => {
    numAnim.addListener(({ value }) => setDisplay(Math.round(value)));
    Animated.timing(numAnim, { toValue: score, duration: 1500, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
      ])
    ).start();

    return () => numAnim.removeAllListeners();
  }, [score]);

  const size = isWide ? 220 : 180;
  
  return (
    <View style={[styles.ringWrap, { width: size, height: size, marginVertical: 20 }]}>
      {/* Outer pulsing glow */}
      <Animated.View style={[StyleSheet.absoluteFill, { 
        borderRadius: size / 2, 
        backgroundColor: accent || C.violet, 
        opacity: 0.15,
        transform: [{ scale: pulseAnim }]
      }]} />
      
      {/* Core gradient ring */}
      <LinearGradient 
        colors={[accent || C.violet, C.teal]} 
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} 
        style={[styles.ringOuter, { borderRadius: size / 2, padding: 4, width: size, height: size, alignItems: 'center', justifyContent: 'center' }]}
      > 
        {/* Inner glass/solid core */}
        <View style={[styles.ringInner, { 
          backgroundColor: C.bg, 
          borderRadius: (size - 8) / 2, 
          width: size - 8, 
          height: size - 8,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.05)'
        }]}> 
          <Text style={[styles.ringNumber, { color: C.text, fontSize: isWide ? 72 : 56, fontWeight: '900', letterSpacing: -2 }]}>{display}</Text>
          <Text style={[styles.ringUnit, { color: accent || C.violet, fontSize: 16, fontWeight: '700', marginTop: -5, textTransform: 'uppercase', letterSpacing: 2 }]}>Genome</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const Screen11 = ({ onOpenTimeline, onOpenSettings, onOpenUploadResume, onOpenGitHubConnect, onOpenEmotionPrint, onOpenThoughtPrint, onOpenCommunity, onOpenMentors, onOpenStudyGroup, onOpenInterviewPrep, onOpenProfile, onOpenExplore, onOpenAIChat, onOpenConnections, onOpenSessions, onOpenDailyQuiz, onOpenDailyLearning, profile = {}, resumeAnalysis, githubAnalysis, thoughtAnalysis, emotionAnalysis, journalEntries = [], recordingDuration = 0, topCompanies = [], onOpenJobMatches, isDarkMode = true, language = 'English' }) => {
  const T = getTheme(isDarkMode);
  const styles = React.useMemo(() => getStyles(T), [T]);

  const C = getColors(isDarkMode);
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const [activeNav, setActiveNav] = React.useState("home");

  const [mentorResources, setMentorResources] = React.useState([]);
  
  React.useEffect(() => {
    if (!profile?.id) return;
    const fetchResources = async () => {
      try {
        const { data: cohortsData } = await supabase.from('cohort_students').select('cohort_id, cohorts(mentor_id)').eq('student_id', profile.id);
        const mentorIds = cohortsData?.map(c => c.cohorts?.mentor_id).filter(Boolean) || [];
        if (mentorIds.length > 0) {
          const { data } = await supabase.from('mentor_resources').select('*').in('mentor_id', mentorIds).order('created_at', { ascending: false });
          if (data) setMentorResources(data);
        }
      } catch (e) { console.warn(e); }
    };
    fetchResources();
  }, [profile?.id]);

  const openResource = async (url) => {
    try {
      if (url) await Linking.openURL(url);
    } catch(e) {
      console.warn('Cannot open url:', url);
    }
  };


  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(24)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const isResumeCompleted = !!resumeAnalysis;
  const isGitHubCompleted = !!githubAnalysis;
  const isThoughtCompleted = (journalEntries?.length > 0) || !!thoughtAnalysis;
  const isEmotionCompleted = recordingDuration > 0 || !!emotionAnalysis;

  const extractedResume = resumeAnalysis?.extractedSkills || [];
  const resumeScore = isResumeCompleted
    ? (resumeAnalysis.trueGenomeScore || Math.round(extractedResume.reduce((a, s) => a + (s.score || 0), 0) / Math.max(1, extractedResume.length)) || 85) : 0;
  const githubScore = isGitHubCompleted ? (githubAnalysis.score || 75) : 0;
  const thoughtScore = isThoughtCompleted ? (thoughtAnalysis?.overall_score || 82) : 0;
  const emotionScore = isEmotionCompleted ? (emotionAnalysis?.eq_score || 78) : 0;

  const modState = { isResumeCompleted, isGitHubCompleted, isThoughtCompleted, isEmotionCompleted, resumeScore, githubScore, thoughtScore, emotionScore };
  const moduleScores = [isResumeCompleted && resumeScore, isGitHubCompleted && githubScore, isThoughtCompleted && thoughtScore, isEmotionCompleted && emotionScore].filter(Boolean);
  const genomeScore = moduleScores.length ? Math.round(moduleScores.reduce((a, b) => a + b, 0) / moduleScores.length) : 0;
  const activeMods = [isResumeCompleted, isGitHubCompleted, isThoughtCompleted, isEmotionCompleted].filter(Boolean).length;
  const skills = extractedResume.slice(0, 6);
  const nav = (fn) => { if (typeof fn === "function") fn(); };

  const modHandlers = {
    resume: () => nav(onOpenUploadResume),
    github: () => nav(onOpenGitHubConnect),
    thought: () => nav(onOpenThoughtPrint),
    emotion: () => nav(onOpenEmotionPrint),
  };

  const actionHandlers = {
    onOpenInterviewPrep,
    onOpenMentors,
    onOpenTimeline,
    onOpenCommunity,
    onOpenExplore,
    onOpenStudyGroup,
    onOpenConnections,
    onOpenSessions,
    onOpenDailyQuiz,
    onOpenDailyLearning,
  };

  const tier = genomeScore >= 80 ? "Elite candidate" : genomeScore >= 60 ? "Strong profile" : genomeScore >= 30 ? "Rising profile" : "Getting started";

  const navHandlers = {
    home: () => setActiveNav("home"),
    explore: () => { setActiveNav("explore"); nav(onOpenExplore); },
    ai: () => { setActiveNav("ai"); nav(onOpenAIChat); },
    community: () => { setActiveNav("community"); nav(onOpenCommunity); },
    settings: () => { setActiveNav("settings"); nav(onOpenSettings); },
  };

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}> 
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient colors={[`${C.violet}22`, `${C.violet}00`]} style={styles.glow1} />
        <LinearGradient colors={[`${C.teal}18`, `${C.teal}00`]} style={styles.glow2} />
      </View>

      <Animated.ScrollView style={{ flex: 1, opacity: fade }} contentContainerStyle={[styles.scrollContent, { paddingBottom: 150 }]} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.container, { maxWidth: isWide ? 1120 : "100%", transform: [{ translateY: slide }] }]}> 
          <View style={styles.header}>
            <View style={styles.brandWrap}>
              <LinearGradient colors={[C.violet, C.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoMark}>
                <Text style={styles.logoChar}>SG</Text>
              </LinearGradient>
              <View>
                <Text style={[styles.brandName, { color: C.text }]}>SkillGenome</Text>
                <Text style={[styles.brandSub, { color: C.muted }]}>Career intelligence</Text>
              </View>
            </View>

            <Pressable style={styles.profileBtn} onPress={() => nav(onOpenProfile)}>
              <View style={styles.headerName}>
                <Text style={[styles.nameText, { color: C.text }]}>{profile.name || "User"}</Text>
                <Text style={[styles.greetText, { color: C.muted }]}>Career profile</Text>
              </View>
              {profile.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
              ) : (
                <LinearGradient colors={[C.violet, C.teal]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
                  <Text style={styles.avatarLetter}>{profile.name?.[0]?.toUpperCase() || "A"}</Text>
                </LinearGradient>
              )}
            </Pressable>
          </View>

          <PulseBox style={[styles.heroCard, { backgroundColor: C.surface, borderColor: C.borderStrong, overflow: 'hidden' }]}> 
            <LinearGradient colors={[C.bg, C.surface]} style={StyleSheet.absoluteFill} />
            <LinearGradient colors={[`${C.violet}1A`, "transparent"]} style={[StyleSheet.absoluteFill, { opacity: 0.6 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            <View style={styles.heroTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.heroEyebrow, { color: C.muted }]}>PROFESSIONAL READINESS</Text>
                <Text style={[styles.heroTitle, { color: C.text }]}>{tier}</Text>
                <Text style={[styles.heroSubtitle, { color: C.muted }]}>Your profile is aligning well with high-growth teams and leadership-track opportunities.</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${C.green}14`, borderColor: `${C.green}32` }]}> 
                <View style={[styles.statusDot, { backgroundColor: C.green }]} />
                <Text style={[styles.statusText, { color: C.green }]}>{activeMods}/4 active</Text>
              </View>
            </View>

            <View style={[styles.heroBody, { flexDirection: isWide ? "row" : "column" }]}> 
              <ScoreRing score={genomeScore} accent={C.violet} C={C} isWide={isWide} styles={styles} />
              <View style={styles.heroStats}>
                <Text style={[styles.heroText, { color: C.muted }]}>Complete the remaining modules to unlock deeper recruiter matching and stronger company-specific fit.</Text>
                <View style={styles.miniBars}>
                  {MODULES.map((m) => {
                    const done = !!modState[m.key];
                    const score = modState[m.scoreKey];
                    const modColor = C[m.colorKey];
                    return (
                      <View key={m.id} style={styles.miniBarItem}>
                        <Text style={[styles.miniBarLabel, { color: done ? modColor : C.muted }]}>{m.label}</Text>
                        <GlowBar value={done ? score : 0} color={modColor} C={C} styles={styles} />
                        <Text style={[styles.miniBarScore, { color: done ? modColor : C.muted }]}>{done ? `${score}` : "—"}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </PulseBox>

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionEyebrow, { color: C.muted }]}>TOP 10 GLOBAL COMPANIES</Text>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Best-fit targets for your profile</Text>
          </View>

          <View style={styles.companyGrid}>
            {(topCompanies.length > 0 ? topCompanies : TOP_COMPANIES).map((company, index) => (
              <PressCard key={`${company.name}-${index}`} onPress={() => company.url ? Linking.openURL(company.url) : nav(onOpenJobMatches || onOpenExplore)} style={[styles.companyCard, { backgroundColor: C.surface, borderColor: C.border }]}> 
                <View style={styles.companyTopRow}>
                  <View style={[styles.companyLogo, { backgroundColor: `${company.accent || C.violet}16` }]}> 
                    <Text style={[styles.companyLogoText, { color: company.accent || C.violet }]}>{company.logo || company.name.slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={[styles.fitBadge, { backgroundColor: `${C.green}14`, borderColor: `${C.green}28` }]}> 
                    <Text style={[styles.fitBadgeText, { color: C.green }]}>{company.fit}%</Text>
                  </View>
                </View>
                <Text style={[styles.companyName, { color: C.text }]}>{company.name}</Text>
                <Text style={[styles.companyRole, { color: C.muted }]}>{company.role}</Text>
              </PressCard>
            ))}
          </View>

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionEyebrow, { color: C.muted }]}>CAREER DNA</Text>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Core modules</Text>
          </View>

          <View style={[styles.modulesRow, { flexDirection: isWide ? "row" : "row", flexWrap: isWide ? "nowrap" : "wrap" }]}> 
            {MODULES.map((m) => {
              const done = !!modState[m.key];
              const score = modState[m.scoreKey];
              const modColor = C[m.colorKey];
              return (
                <PressCard key={m.id} onPress={modHandlers[m.id]} style={[styles.moduleCard, { flex: isWide ? 1 : undefined, width: isWide ? undefined : "48%", borderColor: done ? `${modColor}66` : C.border, backgroundColor: done ? `${modColor}0a` : C.surface }]}> 
                  <View style={styles.moduleCardInner}>
                    <View style={styles.moduleCardTop}>
                      <View style={[styles.moduleIconWrap, { backgroundColor: done ? `${modColor}20` : C.surface2 }]}> 
                        <Text style={styles.moduleIcon}>{m.icon}</Text>
                      </View>
                      <View style={[styles.moduleBadge, { backgroundColor: done ? `${modColor}15` : C.surface2, borderColor: done ? `${modColor}44` : C.border }]}> 
                        <Text style={[styles.moduleBadgeText, { color: done ? modColor : C.muted }]}>{done ? `${score}` : "Tap"}</Text>
                      </View>
                    </View>
                    <Text style={[styles.moduleLabel, { color: C.text }]}>{m.label}</Text>
                    <Text style={[styles.moduleStatus, { color: done ? modColor : C.muted }]}>{done ? "Connected" : "Start now"}</Text>
                    <GlowBar value={done ? score : 0} color={modColor} C={C} styles={styles} />
                  </View>
                </PressCard>
              );
            })}
          </View>

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionEyebrow, { color: C.muted }]}>NEXT STEPS</Text>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Recommended actions</Text>
          </View>

          <View style={[styles.actionsGrid, isWide && { justifyContent: "flex-start", gap: 16 }]}>
            {[
                ...mentorResources.map(res => ({
                   id: res.id,
                   label: res.title,
                   icon: res.type === 'PDF' ? '📄' : res.type === 'Video' ? '🎬' : '🔗',
                   colorKey: 'amber',
                   url: res.url,
                   isResource: true
                })),
                ...QUICK_ACTIONS
              ].map((a) => {
                const modColor = C[a.colorKey] || C.amber;
                return (
                  <PressCard key={a.id} onPress={() => a.isResource ? openResource(a.url) : nav(actionHandlers[a.key])} style={[styles.actionCard, { width: isWide ? "15%" : "31%", borderColor: C.border, backgroundColor: C.surface }]}> 
                    <View style={styles.actionCardInner}>
                      <View style={[styles.actionIconWrap, { backgroundColor: `${modColor}15` }]}> 
                        <Text style={styles.actionIcon}>{a.icon}</Text>
                      </View>
                      <Text style={[styles.actionLabel, { color: C.text }]} numberOfLines={2}>{a.label}</Text>
                    </View>
                  </PressCard>
                );
              })}
              </View>

            {skills.length > 0 && (
              <>
                <View style={styles.sectionHead}>
                  <Text style={[styles.sectionEyebrow, { color: C.muted }]}>RESUME INTELLIGENCE</Text>
                  <Text style={[styles.sectionTitle, { color: C.text }]}>Top detected skills</Text>
                </View>
                <View style={styles.skillsChips}>
                  {skills.map((s, i) => {
                    const modColor = Object.values(C)[(i + 2) % 6];
                    return (
                      <View key={s.name} style={[styles.skillChip, { backgroundColor: `${modColor}12`, borderColor: `${modColor}30` }]}> 
                        <Text style={[styles.skillChipText, { color: modColor }]}>{s.name}</Text>
                        <Text style={[styles.skillChipScore, { color: C.text }]}>{s.score}</Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </Animated.View>

          {activeMods === 0 && (
            <View style={[styles.card, { borderColor: C.border, backgroundColor: C.surface, alignItems: "center" }]}> 
              <Text style={styles.emptyIcon}>🚀</Text>
              <Text style={[styles.emptyTitle, { color: C.text }]}>Start building your executive profile</Text>
              <Text style={[styles.emptySub, { color: C.muted }]}>Upload your resume to unlock your AI-generated match profile for the world’s top employers.</Text>
              <Pressable onPress={() => nav(onOpenUploadResume)} style={styles.ctaWrap}>
                <LinearGradient colors={[C.violet, C.violetDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGrad}>
                  <Text style={styles.ctaText}>Upload resume →</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}
        </Animated.ScrollView>

      <View style={styles.navContainer}>
        {Platform.OS === "web" ? (
          <View style={[styles.navBlurFallback, { backgroundColor: `${C.surface}cc`, borderColor: C.borderStrong }]}> 
            <NavContent activeNav={activeNav} navHandlers={navHandlers} C={C} styles={styles} />
          </View>
        ) : (
          <BlurView intensity={isDarkMode ? 28 : 55} tint={isDarkMode ? "dark" : "light"} style={[styles.navBlur, { borderColor: C.borderStrong }]}> 
            <NavContent activeNav={activeNav} navHandlers={navHandlers} C={C} styles={styles} />
          </BlurView>
        )}
      </View>
    </View>
  );
};

const NavContent = ({ activeNav, navHandlers, C, styles }) => (
  <View style={styles.navContentRow}>
    {[
      { id: "home", icon: "home", label: "Home", onPress: navHandlers.home },
      { id: "explore", icon: "compass", label: "Explore", onPress: navHandlers.explore },
    ].map((item) => (
      <Pressable key={item.id} style={styles.navItem} onPress={item.onPress}>
        <Feather name={item.icon} size={22} color={activeNav === item.id ? C.violet : C.muted} />
        <Text style={[styles.navLabel, { color: activeNav === item.id ? C.violet : C.muted, fontWeight: activeNav === item.id ? "800" : "600" }]}>{item.label}</Text>
      </Pressable>
    ))}

    <Pressable style={styles.navCenter} onPress={navHandlers.ai}>
      <LinearGradient colors={[C.violet, C.violetDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.navCenterBtn}>
        <Feather name="zap" size={24} color="#fff" />
      </LinearGradient>
    </Pressable>

    {[
      { id: "community", icon: "users", label: "Network", onPress: navHandlers.community },
      { id: "settings", icon: "settings", label: "Settings", onPress: navHandlers.settings },
    ].map((item) => (
      <Pressable key={item.id} style={styles.navItem} onPress={item.onPress}>
        <Feather name={item.icon} size={22} color={activeNav === item.id ? C.violet : C.muted} />
        <Text style={[styles.navLabel, { color: activeNav === item.id ? C.violet : C.muted, fontWeight: activeNav === item.id ? "800" : "600" }]}>{item.label}</Text>
      </Pressable>
    ))}
  </View>
);

const getStyles = (T) => StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  glow1: { position: "absolute", top: -150, right: -140, width: 460, height: 460, borderRadius: 230 },
  glow2: { position: "absolute", bottom: -40, left: -160, width: 420, height: 420, borderRadius: 210 },
  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 72 : 56,
    alignSelf: "center",
    width: "100%",
    gap: 20,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brandWrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoMark: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  logoChar: { fontSize: 12, fontWeight: "800", color: "#fff" },
  brandName: { fontSize: 16.5, fontWeight: "800", letterSpacing: -0.2 },
  brandSub: { fontSize: 11.5, fontWeight: "600", marginTop: 2, letterSpacing: 0.1 },
  profileBtn: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerName: { alignItems: "flex-end" },
  nameText: { fontSize: 15.5, fontWeight: "800", letterSpacing: -0.2 },
  greetText: { fontSize: 10.5, fontWeight: "700", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.6 },
  avatar: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  avatarLetter: { color: "#fff", fontWeight: "800", fontSize: 16 },
  heroCard: { borderRadius: 28, borderWidth: 1, padding: 22, gap: 18, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 22, shadowOffset: { width: 0, height: 10 } },
  heroTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  heroEyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  heroTitle: { fontSize: 24.5, fontWeight: "800", letterSpacing: -0.4, marginTop: 4 },
  heroSubtitle: { fontSize: 14, lineHeight: 20, marginTop: 6, fontWeight: "500" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: "800" },
  heroBody: { gap: 16, alignItems: "center" },
  heroStats: { flex: 1, gap: 12 },
  heroText: { fontSize: 13.5, lineHeight: 20 },
  miniBars: { gap: 10 },
  miniBarItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  miniBarLabel: { fontSize: 12, fontWeight: "700", width: 92 },
  miniBarScore: { fontSize: 12.5, fontWeight: "800", width: 30, textAlign: "right" },
  sectionHead: { gap: 4, marginTop: 4 },
  sectionEyebrow: { fontSize: 10.5, fontWeight: "800", letterSpacing: 1.3 },
  sectionTitle: { fontSize: 20.5, fontWeight: "800", letterSpacing: -0.4 },
  companyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 },
  companyCard: { width: "48%", borderRadius: 20, borderWidth: 1, padding: 14, gap: 8 },
  companyTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  companyLogo: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  companyLogoText: { fontSize: 12, fontWeight: "800" },
  fitBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  fitBadgeText: { fontSize: 11, fontWeight: "800" },
  companyName: { fontSize: 15, fontWeight: "800", letterSpacing: -0.2 },
  companyRole: { fontSize: 12.5, lineHeight: 18, fontWeight: "500" },
  companyMetaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 },
  companyMeta: { fontSize: 11, fontWeight: "600" },
  modulesRow: { gap: 12 },
  moduleCard: { borderRadius: 22, borderWidth: 1, overflow: "hidden" },
  moduleCardInner: { padding: 18, gap: 10 },
  moduleCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  moduleIconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  moduleIcon: { fontSize: 20 },
  moduleBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  moduleBadgeText: { fontSize: 12, fontWeight: "800" },
  moduleLabel: { fontSize: 14.5, fontWeight: "800" },
  moduleStatus: { fontSize: 11.5, fontWeight: "700" },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  actionCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  actionCardInner: { padding: 14, alignItems: "center", gap: 8 },
  actionIconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  actionIcon: { fontSize: 22 },
  actionLabel: { fontSize: 11.5, fontWeight: "700", textAlign: "center" },
  skillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillPill: { flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 12, paddingRight: 10, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  skillPillText: { fontSize: 13.5, fontWeight: "700" },
  skillPillBadge: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8 },
  skillPillScore: { fontSize: 11.5, fontWeight: "800" },
  card: { borderRadius: 24, borderWidth: 1, padding: 22, gap: 14, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } },
  ctaWrap: { borderRadius: 14, overflow: "hidden", marginTop: 4 },
  ctaGrad: { paddingVertical: 14, alignItems: "center" },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 14.5 },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { fontSize: 19, fontWeight: "800", textAlign: "center" },
  emptySub: { fontSize: 14, textAlign: "center", lineHeight: 21 },
  navContainer: { position: "absolute", bottom: Platform.OS === "web" ? 24 : 32, left: 20, right: 20, alignItems: "center" },
  navBlur: { borderRadius: 100, borderWidth: 1, overflow: "hidden", maxWidth: 430, width: "100%", shadowColor: "#000", shadowOpacity: 0.24, shadowRadius: 28, shadowOffset: { width: 0, height: 12 } },
  navBlurFallback: { borderRadius: 100, borderWidth: 1, overflow: "hidden", maxWidth: 430, width: "100%", shadowColor: "#000", shadowOpacity: 0.24, shadowRadius: 28, shadowOffset: { width: 0, height: 12 } },
  navContentRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 12 },
  navItem: { flex: 1, alignItems: "center", gap: 5, paddingVertical: 4 },
  navIcon: { fontSize: 18 },
  navLabel: { fontSize: 10.5, fontWeight: "600", letterSpacing: 0.2 },
  navCenter: { alignItems: "center", justifyContent: "center", paddingHorizontal: 14 },
  navCenterBtn: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center", marginTop: -24, shadowColor: "#7c3aed", shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  navCenterIcon: { color: "#fff", fontSize: 24, fontWeight: "800" },
  glowTrack: { height: 6, borderRadius: 3, overflow: "hidden", flex: 1, borderWidth: 1 },
  glowFillWrap: { height: "100%", borderRadius: 3, overflow: "hidden" },
  ringWrap: { alignItems: "center", justifyContent: "center" },
  ringOuter: { padding: 2, alignItems: "center", justifyContent: "center" },
  ringInner: { alignItems: "center", justifyContent: "center" },
  ringNumber: { fontSize: 36, fontWeight: "900", letterSpacing: -1.4 },
  ringUnit: { fontSize: 12.5, fontWeight: "700", marginTop: -2 },
});

export default Screen11;

