import * as React from "react";
import { Alert, ScrollView, Text, StyleSheet, View, Image, Pressable, TextInput, FlatList, Animated, Dimensions, Easing } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import SafeLinearGradient from "../components/SafeLinearGradient";
import { FontFamily, StyleVariable, Color, Padding, Border, Width, Height } from "../GlobalStyles";
import { t } from "../utils/translations";


const { width, height } = Dimensions.get('window');

// --- PREMIUM ANIMATED COMPONENTS ---

const AnimatedPressable = ({ children, style, onPress, ...props }) => {
  const scale = React.useRef(new Animated.Value(1)).current;
  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 5,
      tension: 100
    }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 100
    }).start();
  };
  return (
    <Animated.View style={[{ transform: [{ scale }] }]}>
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} style={style} {...props}>
        {children}
      </Pressable>
    </Animated.View>
  );
};

const GlassCard = ({ children, style, glowColor, isDarkMode }) => {
  return (
    <View style={[style, { overflow: 'visible' }]}>
      {/* Ambient Glow */}
      {glowColor && (
        <View style={{
          position: 'absolute',
          top: 10, left: 10, right: 10, bottom: -10,
          backgroundColor: glowColor,
          opacity: isDarkMode ? 0.15 : 0.25,
          borderRadius: 20,
          transform: [{ scale: 0.95 }]
        }} />
      )}
      <BlurView intensity={isDarkMode ? 30 : 60} tint={isDarkMode ? "dark" : "light"} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />
      <View style={{
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.4)",
        backgroundColor: isDarkMode ? "rgba(20,25,35,0.4)" : "rgba(255,255,255,0.5)",
      }} />
      <View style={{ padding: 18, zIndex: 2 }}>{children}</View>
    </View>
  );
};

// --- MAIN SCREEN ---
const Screen11 = ({ onOpenTimeline, onOpenSettings, onOpenUploadResume, onOpenGitHubConnect, onOpenEmotionPrint, onOpenThoughtPrint, onOpenThoughtPrintResults, onOpenEmotionPrintResults, onOpenCommunity, onOpenMentors, onOpenStudyGroup, onOpenInterviewPrep, onOpenProfile, onOpenExplore, onOpenAIChat, profile = {}, resumeAnalysis, githubAnalysis, thoughtAnalysis, emotionAnalysis, journalEntries = [], recordingDuration = 0, searchAll, onNavigateToScreen, isDarkMode = true, language = 'English' }) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const [lastAction, setLastAction] = React.useState("Tap an action below.");
  const [avatarFailed, setAvatarFailed] = React.useState(false);

  const getSkillIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes("python")) return "🐍";
    if (lower.includes("react") || lower.includes("javascript") || lower.includes("typescript") || lower.includes("html") || lower.includes("css")) return "💻";
    if (lower.includes("ai") || lower.includes("nlp") || lower.includes("learning") || lower.includes("bert") || lower.includes("llm")) return "🤖";
    if (lower.includes("docker") || lower.includes("kubernetes") || lower.includes("aws") || lower.includes("devops") || lower.includes("git")) return "⚙️";
    if (lower.includes("sql") || lower.includes("database") || lower.includes("data") || lower.includes("nosql")) return "📊";
    return "🧬";
  };

  const getSkillColor = (index) => {
    const colors = ["#4CAF50", "#9C27B0", "#E91E63", "#00D4FF", "#8B5CF6"];
    return colors[index % colors.length];
  };

  const skillsToDisplay = (resumeAnalysis && resumeAnalysis.extractedSkills && resumeAnalysis.extractedSkills.length > 0) 
    ? resumeAnalysis.extractedSkills.slice(0, 3) 
    : [];

  const resumeSkills = skillsToDisplay.map((skill, index) => ({
    icon: getSkillIcon(skill.name),
    name: skill.name,
    percent: `${skill.score}%`,
    color: getSkillColor(index)
  }));

  const isResumeCompleted = !!resumeAnalysis;
  let resumeScore = 0;
  if (isResumeCompleted) {
    if (resumeAnalysis.trueGenomeScore) {
      resumeScore = resumeAnalysis.trueGenomeScore;
    } else if (resumeAnalysis.extractedSkills && resumeAnalysis.extractedSkills.length > 0) {
      const sum = resumeAnalysis.extractedSkills.reduce((acc, s) => acc + (s.score || 0), 0);
      resumeScore = Math.round(sum / resumeAnalysis.extractedSkills.length);
    } else {
      resumeScore = 85;
    }
  }

  const isGitHubCompleted = !!githubAnalysis;
  const githubScore = isGitHubCompleted ? (githubAnalysis.score || 75) : 0;

  const isThoughtCompleted = (journalEntries && journalEntries.length > 0) || !!thoughtAnalysis;
  const thoughtScore = isThoughtCompleted ? (thoughtAnalysis?.adaptabilityScore || 82) : 0;

  const isEmotionCompleted = recordingDuration > 0 || !!emotionAnalysis;
  const emotionScore = isEmotionCompleted ? (emotionAnalysis?.eqScore || 78) : 0;

  let totalScoreSum = 0;
  let activeModules = 0;

  if (isResumeCompleted) {
    totalScoreSum += resumeScore;
    activeModules += 1;
  }
  if (isGitHubCompleted) {
    totalScoreSum += githubScore;
    activeModules += 1;
  }
  if (isThoughtCompleted) {
    totalScoreSum += thoughtScore;
    activeModules += 1;
  }
  if (isEmotionCompleted) {
    totalScoreSum += emotionScore;
    activeModules += 1;
  }

  const computedGenomeScore = activeModules > 0 
    ? Math.round(totalScoreSum / activeModules) 
    : 0;

  const handleActionPress = (title, message) => {
    setLastAction(title);
    Alert.alert(title, message);
  };

  const handleNavPress = (tabIndex, title, message) => {
    setActiveTab(tabIndex);
    setLastAction(title);
    Alert.alert(title, message);
  };

  // Theme overrides
  const bgStyle = isDarkMode ? Color.colorBlue8 || '#0d0d1a' : '#f8fafc';
  const cardBg = isDarkMode ? Color.colorAzure11 || '#161a22' : '#ffffff';
  const borderStyle = isDarkMode ? Color.colorBlue19 || '#232840' : '#e2e8f0';
  const textPrimary = isDarkMode ? Color.colorWhiteSolid || '#ffffff' : '#0f172a';
  const textSecondary = isDarkMode ? Color.colorAzure65 || '#94a3b8' : '#475569';
  const scoreInnerBg = isDarkMode ? Color.colorBlue19 || '#232840' : '#f1f5f9';
  const bottomNavBg = isDarkMode ? Color.colorAzure11 || '#161a22' : '#ffffff';

  return (
    <View style={[styles.root, { backgroundColor: bgStyle }]}>
      {/* Premium Background Blobs */}
      <View style={StyleSheet.absoluteFill}>
         <View style={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: isDarkMode ? 'rgba(0, 212, 255, 0.15)' : 'rgba(0, 212, 255, 0.2)', filter: 'blur(60px)' }} />
         <View style={{ position: 'absolute', top: 300, right: -150, width: 350, height: 350, borderRadius: 175, backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.2)', filter: 'blur(60px)' }} />
         <View style={{ position: 'absolute', bottom: -50, left: 50, width: 250, height: 250, borderRadius: 125, backgroundColor: isDarkMode ? 'rgba(233, 30, 99, 0.1)' : 'rgba(233, 30, 99, 0.15)', filter: 'blur(60px)' }} />
      </View>

      <ScrollView
        style={[styles.scrollview, { backgroundColor: bgStyle }]}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.welcomeBack, { color: textSecondary }]}>{t(language, "welcomeBack")}</Text>
              <Text style={[styles.userName, { color: textPrimary }]}>{profile.name || 'Ayyappa'}.</Text>
            </View>
            <Pressable onPress={() => { if (typeof onOpenProfile === 'function') onOpenProfile(); }}>
              {profile.avatarUrl && !avatarFailed ? (
                <Image
                  source={{ uri: profile.avatarUrl }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <SafeLinearGradient
                  style={styles.avatarGradient}
                  locations={[0, 0.5, 1]}
                  colors={[Color.colorCyan50, Color.colorViolet58, Color.colorRose60]}
                >
                  <Text style={styles.avatarText}>{(profile.name && profile.name[0]) || 'A'}</Text>
                </SafeLinearGradient>
              )}
            </Pressable>
          </View>

          <GlassCard style={styles.welcomeCard} isDarkMode={isDarkMode}>
            <Text style={[styles.welcomeCardTitle, { color: textPrimary }]}>{t(language, "yourDashboardIsReady")}</Text>
            <Text style={[styles.welcomeCardText, { color: textSecondary }]}>
              Review your skill score, open AI chat or interview prep, or jump into the next action.
            </Text>
          </GlassCard>

          <GlassCard style={styles.scoreCard} isDarkMode={isDarkMode} glowColor={isDarkMode ? "rgba(0, 212, 255, 0.5)" : "rgba(0, 212, 255, 0.8)"}>
            <View style={styles.profileRow}>
              <View style={styles.profileAvatar}>
                {profile.avatarUrl && !avatarFailed ? (
                  <Image
                    source={{ uri: profile.avatarUrl }}
                    style={styles.profileAvatarImage}
                    resizeMode="cover"
                    onError={() => setAvatarFailed(true)}
                  />
                ) : (
                  <Image
                    source={require("../assets/icon.png")}
                    style={styles.profileAvatarImage}
                    resizeMode="cover"
                  />
                )}
              </View>
              <View style={styles.profileTextWrap}>
                <Text style={[styles.profileName, { color: textPrimary }]}>{profile.name || 'Ayyappa'}</Text>
                <Text style={[styles.profileSubtitle, { color: textSecondary }]}>{profile.title || 'AI Engineer'}</Text>
              </View>
            </View>

            <View style={styles.scoreInner}>
              <View style={[styles.scoreBadge, { backgroundColor: 'transparent', borderWidth: 0 }]}>
                <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: 70, opacity: 0.8, backgroundColor: isDarkMode ? 'rgba(0, 212, 255, 0.2)' : 'rgba(0, 212, 255, 0.1)', shadowColor: '#00d4ff', shadowOpacity: 0.8, shadowRadius: 20 }]} />
                <BlurView intensity={20} tint="light" style={[StyleSheet.absoluteFill, { borderRadius: 70, overflow: 'hidden' }]} />
                <View style={[StyleSheet.absoluteFill, { borderRadius: 70, borderWidth: 2, borderColor: 'rgba(0, 212, 255, 0.4)' }]} />
                <Text style={[styles.scoreBadgeNumber, { textShadowColor: 'rgba(0, 212, 255, 0.8)', textShadowRadius: 15 }]}>{computedGenomeScore}</Text>
                <Text style={[styles.scoreBadgeLabel, { color: textSecondary }]}>GENOME</Text>
              </View>
              <View style={styles.scoreLabel}>
                <Text style={[styles.scoreTitle, { color: textSecondary }]}>{t(language, "genomeScore")}</Text>
                <Text style={[styles.scoreValue, { color: textPrimary }]}>({computedGenomeScore}/100)</Text>
              </View>
            </View>
          </GlassCard>

          <View style={styles.modulesStatusSection}>
            <Text style={[styles.resumeSectionTitle, { color: textPrimary }]}>🧬 Genome Core Modules</Text>
            <Text style={[styles.resumeSectionSubtitle, { color: textSecondary }]}>
              Sync all 4 neural dimensions to unlock your comprehensive Skill Genome Rating.
            </Text>

            <View style={styles.modulesGrid}>
              <Pressable
                style={[
                  styles.moduleStatusCard,
                  { backgroundColor: cardBg, borderColor: borderStyle },
                  isResumeCompleted && {
                    borderColor: isDarkMode ? "rgba(0, 212, 255, 0.4)" : "rgba(0, 212, 255, 0.6)",
                    backgroundColor: isDarkMode ? "rgba(0, 212, 255, 0.04)" : "rgba(0, 212, 255, 0.08)"
                  }
                ]}
                onPress={() => {
                  if (typeof onOpenUploadResume === "function") onOpenUploadResume();
                }}
              >
                <View style={styles.moduleCardHeader}>
                  <Text style={styles.moduleIcon}>📄</Text>
                  <Text style={[styles.moduleStatusIndicator, isResumeCompleted ? styles.statusCompleted : styles.statusPending]}>
                    {isResumeCompleted ? "✅ Active" : ""}
                  </Text>
                </View>
                <Text style={[styles.moduleCardTitle, { color: textPrimary }]}>Resume DNA</Text>
                <Text style={styles.moduleCardScore}>
                  {isResumeCompleted ? `${resumeScore}/100` : "--/100"}
                </Text>
                <Text style={[styles.moduleCardDesc, { color: textSecondary }]}>
                  Skills & career DNA parsed from PDF.
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.moduleStatusCard,
                  { backgroundColor: cardBg, borderColor: borderStyle },
                  isGitHubCompleted && {
                    borderColor: isDarkMode ? "rgba(0, 212, 255, 0.4)" : "rgba(0, 212, 255, 0.6)",
                    backgroundColor: isDarkMode ? "rgba(0, 212, 255, 0.04)" : "rgba(0, 212, 255, 0.08)"
                  }
                ]}
                onPress={() => {
                  if (typeof onOpenGitHubConnect === "function") onOpenGitHubConnect();
                }}
              >
                <View style={styles.moduleCardHeader}>
                  <Text style={styles.moduleIcon}>⚙️</Text>
                  <Text style={[styles.moduleStatusIndicator, isGitHubCompleted ? styles.statusCompleted : styles.statusPending]}>
                    {isGitHubCompleted ? "✅ Connected" : ""}
                  </Text>
                </View>
                <Text style={[styles.moduleCardTitle, { color: textPrimary }]}>GitHub Repos</Text>
                <Text style={styles.moduleCardScore}>
                  {isGitHubCompleted ? `${githubScore}/100` : "--/100"}
                </Text>
                <Text style={[styles.moduleCardDesc, { color: textSecondary }]}>
                  Repository insights & dev ratings.
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.moduleStatusCard,
                  { backgroundColor: cardBg, borderColor: borderStyle },
                  isThoughtCompleted && {
                    borderColor: isDarkMode ? "rgba(0, 212, 255, 0.4)" : "rgba(0, 212, 255, 0.6)",
                    backgroundColor: isDarkMode ? "rgba(0, 212, 255, 0.04)" : "rgba(0, 212, 255, 0.08)"
                  }
                ]}
                onPress={() => {
                  if (typeof onOpenThoughtPrint === "function") onOpenThoughtPrint();
                }}
              >
                <View style={styles.moduleCardHeader}>
                  <Text style={styles.moduleIcon}>🧠</Text>
                  <Text style={[styles.moduleStatusIndicator, isThoughtCompleted ? styles.statusCompleted : styles.statusPending]}>
                    {isThoughtCompleted ? "✅ Scanned" : ""}
                  </Text>
                </View>
                <Text style={[styles.moduleCardTitle, { color: textPrimary }]}>ThoughtPrint</Text>
                <Text style={styles.moduleCardScore}>
                  {isThoughtCompleted ? `${thoughtScore}/100` : "--/100"}
                </Text>
                <Text style={[styles.moduleCardDesc, { color: textSecondary }]}>
                  Cognitive and sentiment scans.
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.moduleStatusCard,
                  { backgroundColor: cardBg, borderColor: borderStyle },
                  isEmotionCompleted && {
                    borderColor: isDarkMode ? "rgba(0, 212, 255, 0.4)" : "rgba(0, 212, 255, 0.6)",
                    backgroundColor: isDarkMode ? "rgba(0, 212, 255, 0.04)" : "rgba(0, 212, 255, 0.08)"
                  }
                ]}
                onPress={() => {
                  if (typeof onOpenEmotionPrint === "function") onOpenEmotionPrint();
                }}
              >
                <View style={styles.moduleCardHeader}>
                  <Text style={styles.moduleIcon}>🎭</Text>
                  <Text style={[styles.moduleStatusIndicator, isEmotionCompleted ? styles.statusCompleted : styles.statusPending]}>
                    {isEmotionCompleted ? "✅ Measured" : ""}
                  </Text>
                </View>
                <Text style={[styles.moduleCardTitle, { color: textPrimary }]}>EmotionPrint</Text>
                <Text style={styles.moduleCardScore}>
                  {isEmotionCompleted ? `${emotionScore}/100` : "--/100"}
                </Text>
                <Text style={[styles.moduleCardDesc, { color: textSecondary }]}>
                  Vocal prosody & facial composure.
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.actionStatusCard, { backgroundColor: cardBg, borderColor: borderStyle }]}>
            <Text style={[styles.actionStatusLabel, { color: textSecondary }]}>Last action</Text>
            <Text style={[styles.actionStatusValue, { color: textPrimary }]}>{lastAction}</Text>
          </View>

          <View style={styles.actionsContainer}>
            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                setLastAction("Upload Resume");
                if (typeof onOpenUploadResume === "function") onOpenUploadResume();
              }}
            >
              <Text style={styles.primaryButtonText}>
                Upload Resume {isResumeCompleted ? `✅ (${resumeScore}/100)` : "⚠️"}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, { backgroundColor: cardBg, borderColor: borderStyle }]}
              onPress={() => {
                setLastAction("Analyze GitHub");
                if (typeof onOpenGitHubConnect === "function") onOpenGitHubConnect();
                else handleActionPress("Analyze GitHub", "This opens the GitHub analysis flow.");
              }}
            >
              <Text style={[styles.secondaryButtonText, { color: textPrimary }]}>
                Analyze GitHub {isGitHubCompleted ? `✅ (${githubScore}/100)` : "⚠️"}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, { backgroundColor: cardBg, borderColor: borderStyle }]}
              onPress={() => {
                setLastAction("Thought Print");
                if (typeof onOpenThoughtPrint === "function") onOpenThoughtPrint();
                else handleActionPress("Thought Print", "Open Thought Print insights and reflections.");
              }}
            >
              <Text style={[styles.secondaryButtonText, { color: textPrimary }]}>
                Thought Print {isThoughtCompleted ? `✅ (${thoughtScore}/100)` : "⚠️"}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, { backgroundColor: cardBg, borderColor: borderStyle }]}
              onPress={() => {
                setLastAction("Emotion Print");
                if (typeof onOpenEmotionPrint === "function") onOpenEmotionPrint();
                else handleActionPress("Emotion Print", "Open Emotion Print trends and mood patterns.");
              }}
            >
              <Text style={[styles.secondaryButtonText, { color: textPrimary }]}>
                Emotion Print {isEmotionCompleted ? `✅ (${emotionScore}/100)` : "⚠️"}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, { backgroundColor: cardBg, borderColor: borderStyle }]}
              onPress={() => {
                setLastAction("Interview Prep");
                if (typeof onOpenInterviewPrep === "function") onOpenInterviewPrep();
                else handleActionPress("Interview Prep", "This opens the interview preparation flow.");
              }}
            >
              <Text style={[styles.secondaryButtonText, { color: textPrimary }]}>Interview{"\n"}Prep</Text>
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, { backgroundColor: cardBg, borderColor: borderStyle }]}
              onPress={() => {
                setLastAction("Career Stimulation");
                if (typeof onOpenMentors === "function") onOpenMentors();
                else handleActionPress("Career Stimulation", "Open career stimulation tools and recommendations.");
              }}
            >
              <Text style={[styles.secondaryButtonText, { color: textPrimary }]}>Career{"\n"}Stimulation</Text>
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, { backgroundColor: cardBg, borderColor: borderStyle }]}
              onPress={() => {
                if (typeof onOpenTimeline === "function") onOpenTimeline();
                else handleActionPress("Open Timeline", "Navigation not available");
              }}
            >
              <Text style={[styles.secondaryButtonText, { color: textPrimary }]}>Timeline</Text>
            </Pressable>
          </View>

          <View style={styles.resumeSection}>
            <Text style={[styles.resumeSectionTitle, { color: textPrimary }]}>Top skills from your resume</Text>
            <Text style={[styles.resumeSectionSubtitle, { color: textSecondary }]}>
              Based on the uploaded resume, these are the strongest skills detected.
            </Text>

            {resumeSkills.length > 0 ? (
              <View style={styles.skillsSection}>
                {resumeSkills.map((skill) => (
                  <View key={skill.name} style={[styles.skillCard, { backgroundColor: cardBg, borderColor: borderStyle }]}>
                    <Text style={styles.skillIcon}>{skill.icon}</Text>
                    <Text style={[styles.skillName, { color: textPrimary }]}>{skill.name}</Text>
                    <Text style={[styles.skillPercent, { color: skill.color }]}>{skill.percent}</Text>
                    <View style={[styles.progressBar, { backgroundColor: skill.color }]} />
                  </View>
                ))}
              </View>
            ) : (
              <View style={[styles.emptySkillsCard, { backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.02)" : "rgba(0,0,0,0.02)", borderColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0,0,0,0.08)" }]}>
                <Text style={[styles.emptySkillsText, { color: textSecondary }]}>
                  🧬 No skills parsed yet. Tap "Upload Resume" above to initialize your Career Genome Score!
                </Text>
              </View>
            )}
          </View>

          {githubAnalysis ? (
            <View style={styles.resumeSection}>
              <Text style={[styles.resumeSectionTitle, { color: textPrimary }]}>GitHub Repository Insights</Text>
              <Text style={[styles.resumeSectionSubtitle, { color: textSecondary }]}>
                Based on @{githubAnalysis.username}, we analyzed your public code repositories.
              </Text>

              <View style={styles.skillsSection}>
                <View style={[styles.skillCard, { backgroundColor: cardBg, borderColor: borderStyle }]}>
                  <Text style={styles.skillIcon}>⚙️</Text>
                  <Text style={[styles.skillName, { color: textPrimary }]}>Public Repos</Text>
                  <Text style={[styles.skillPercent, { color: Color.colorCyan50 }]}>
                    {githubAnalysis.publicRepos || 0} Repos
                  </Text>
                  <View style={[styles.progressBar, { backgroundColor: Color.colorCyan50 }]} />
                </View>

                <View style={[styles.skillCard, { backgroundColor: cardBg, borderColor: borderStyle }]}>
                  <Text style={styles.skillIcon}>💻</Text>
                  <Text style={[styles.skillName, { color: textPrimary }]}>Top Languages</Text>
                  <Text style={[styles.skillPercent, { color: Color.colorSpringGreen39 }]}>
                    {githubAnalysis.languages ? githubAnalysis.languages.slice(0, 3).join(", ") : "None"}
                  </Text>
                  <View style={[styles.progressBar, { backgroundColor: Color.colorSpringGreen39 }]} />
                </View>

                <View style={[styles.skillCard, { backgroundColor: cardBg, borderColor: borderStyle }]}>
                  <Text style={styles.skillIcon}>⭐</Text>
                  <Text style={[styles.skillName, { color: textPrimary }]}>Developer Rating</Text>
                  <Text style={[styles.skillPercent, { color: Color.colorViolet58 }]}>
                    {githubAnalysis.score}/100 Score
                  </Text>
                  <View style={[styles.progressBar, { backgroundColor: Color.colorViolet58 }]} />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.resumeSection}>
              <Text style={[styles.resumeSectionTitle, { color: textPrimary }]}>GitHub Repository Insights</Text>
              <Text style={[styles.resumeSectionSubtitle, { color: textSecondary }]}>
                Connect your GitHub account to analyze your repositories and unlock dev ratings.
              </Text>
              <View style={[styles.emptySkillsCard, { backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.02)" : "rgba(0,0,0,0.02)", borderColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0,0,0,0.08)" }]}>
                <Text style={[styles.emptySkillsText, { color: textSecondary }]}>
                  ⚙️ No GitHub account connected yet. Tap "Analyze GitHub" above to unlock repository insights!
                </Text>
              </View>
            </View>
          )}

          {thoughtAnalysis && (
            <View style={[styles.insightCard, { backgroundColor: cardBg, borderColor: borderStyle }]}>
              <View style={styles.insightHeader}>
                <Text style={[styles.insightTitle, { color: textPrimary }]}>🧠 ThoughtPrint Insights</Text>
                <View style={[styles.insightScoreBadge, { borderColor: Color.colorCyan50, borderWidth: 1 }]}>
                  <Text style={[styles.insightScoreText, { color: Color.colorCyan50 }]}>
                    Score: {thoughtAnalysis.adaptabilityScore}/100
                  </Text>
                </View>
              </View>
              <Text style={[styles.insightSubtitle, { color: textSecondary }]}>
                Cognitive profiles mapped using sliding negation sentiment analysis and BERT semantic classification.
              </Text>
              
              <View style={styles.metricsGrid}>
                <View style={[styles.metricItem, { backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.01)" : "rgba(0,0,0,0.02)", borderColor: isDarkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(0,0,0,0.08)" }]}>
                  <Text style={[styles.metricLabel, { color: textSecondary }]}>Cognitive Style</Text>
                  <Text style={[styles.metricValue, { color: textPrimary }]}>{thoughtAnalysis.cognitiveStyle || "N/A"}</Text>
                </View>
                <View style={[styles.metricItem, { backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.01)" : "rgba(0,0,0,0.02)", borderColor: isDarkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(0,0,0,0.08)" }]}>
                  <Text style={[styles.metricLabel, { color: textSecondary }]}>Stress Level</Text>
                  <Text style={[styles.metricValue, { color: thoughtAnalysis.stressLevel > 65 ? "#E94B4B" : "#4CAF50" }]}>
                    {thoughtAnalysis.stressLevel}%
                  </Text>
                </View>
                <View style={[styles.metricItem, { backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.01)" : "rgba(0,0,0,0.02)", borderColor: isDarkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(0,0,0,0.08)" }]}>
                  <Text style={[styles.metricLabel, { color: textSecondary }]}>Valence/Sentiment</Text>
                  <Text style={[styles.metricValue, { color: textPrimary }]}>{thoughtAnalysis.sentiment}% Pos</Text>
                </View>
              </View>

              <Pressable 
                style={[styles.previewBtn, { backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(0,0,0,0.03)", borderColor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0,0,0,0.1)" }]} 
                onPress={() => typeof onOpenThoughtPrintResults === 'function' && onOpenThoughtPrintResults()}
              >
                <Text style={[styles.previewBtnText, { color: textPrimary }]}>Preview Entry →</Text>
              </Pressable>
            </View>
          )}

          {emotionAnalysis && (
            <View style={[styles.insightCard, { backgroundColor: cardBg, borderColor: borderStyle }]}>
              <View style={styles.insightHeader}>
                <Text style={[styles.insightTitle, { color: textPrimary }]}>🎭 EmotionPrint Insights</Text>
                <View style={[styles.insightScoreBadge, { borderColor: "#8B5CF6", borderWidth: 1 }]}>
                  <Text style={[styles.insightScoreText, { color: "#8B5CF6" }]}>
                    EQ Score: {emotionAnalysis.eqScore}/100
                  </Text>
                </View>
              </View>
              <Text style={[styles.insightSubtitle, { color: textSecondary }]}>
                Expression micro-gestures and voice acoustics stabilized via OpenCV, DeepFace, MediaPipe, and Librosa.
              </Text>

              <View style={styles.metricsGrid}>
                <View style={[styles.metricItem, { backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.01)" : "rgba(0,0,0,0.02)", borderColor: isDarkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(0,0,0,0.08)" }]}>
                  <Text style={[styles.metricLabel, { color: textSecondary }]}>Primary Expression</Text>
                  <Text style={[styles.metricValue, { color: Color.colorCyan50 }]}>
                    {emotionAnalysis.selectedMood || "Neutral"}
                  </Text>
                </View>
                <View style={[styles.metricItem, { backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.01)" : "rgba(0,0,0,0.02)", borderColor: isDarkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(0,0,0,0.08)" }]}>
                  <Text style={[styles.metricLabel, { color: textSecondary }]}>Voice Projection</Text>
                  <Text style={[styles.metricValue, { color: textPrimary }]}>
                    {emotionAnalysis.voiceAnalysis?.confidence || "Moderate"}
                  </Text>
                </View>
                <View style={[styles.metricItem, { backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.01)" : "rgba(0,0,0,0.02)", borderColor: isDarkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(0,0,0,0.08)" }]}>
                  <Text style={[styles.metricLabel, { color: textSecondary }]}>Vocal Stress</Text>
                  <Text style={[styles.metricValue, { color: emotionAnalysis.voiceAnalysis?.stressRaw > 60 ? "#E94B4B" : "#4CAF50" }]}>
                    {emotionAnalysis.voiceAnalysis?.stressRaw || 0}%
                  </Text>
                </View>
              </View>

              <Pressable 
                style={[styles.previewBtn, { backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(0,0,0,0.03)", borderColor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0,0,0,0.1)" }]} 
                onPress={() => typeof onOpenEmotionPrintResults === 'function' && onOpenEmotionPrintResults()}
              >
                <Text style={[styles.previewBtnText, { color: textPrimary }]}>Preview Entry →</Text>
              </Pressable>
            </View>
          )}

          <View style={[styles.miniChartCard, { backgroundColor: cardBg, borderColor: borderStyle }]}>
            <Text style={[styles.miniChartTitle, { color: textSecondary }]}>Mini-chart</Text>
            <Image
              style={styles.chartImage}
              source={require("../assets/Component-13.png")}
              resizeMode="cover"
            />
          </View>
        </View>
      </ScrollView>

      <BlurView intensity={isDarkMode ? 40 : 80} tint={isDarkMode ? "dark" : "light"} style={[styles.bottomNav, { backgroundColor: isDarkMode ? 'rgba(20,25,35,0.6)' : 'rgba(255,255,255,0.7)', borderTopColor: 'transparent', position: 'absolute', bottom: 20, left: 20, right: 20, borderRadius: 30, borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)', overflow: 'hidden' }]}>
        <Pressable
          style={[styles.navItem, activeTab === 0 && styles.navItemActive]}
          onPress={() => handleNavPress(0, "Home", "You are already on the home screen.")}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navLabel, activeTab === 0 && styles.navLabelActive, activeTab !== 0 && { color: textSecondary }]}>{t(language, "home")}</Text>
          {activeTab === 0 && <View style={styles.navDot} />}
        </Pressable>

        <Pressable
          style={[styles.navItem, activeTab === 1 && styles.navItemActive]}
          onPress={() => {
            setLastAction("AI Chat");
            if (typeof onOpenAIChat === "function") onOpenAIChat();
          }}
        >
          <Text style={styles.navIcon}>💬</Text>
          <Text style={[styles.navLabel, activeTab === 1 && styles.navLabelActive, activeTab !== 1 && { color: textSecondary }]}>{t(language, "aiChatShort")}</Text>
        </Pressable>

        <Pressable
          style={[styles.navItem, activeTab === 2 && styles.navItemActive]}
          onPress={() => {
            setActiveTab(2);
            setLastAction('Open Explore');
            if (typeof onOpenExplore === 'function') onOpenExplore();
          }}
        >
          <Text style={styles.navIcon}>🔎</Text>
          <Text style={[styles.navLabel, activeTab === 2 && styles.navLabelActive, activeTab !== 2 && { color: textSecondary }]}>{t(language, "explore")}</Text>
        </Pressable>

        <Pressable
          style={[styles.navItem, activeTab === 3 && styles.navItemActive]}
          onPress={() => {
            setActiveTab(3);
            if (typeof onOpenCommunity === "function") onOpenCommunity();
            else handleActionPress("Community", "Connect with other developers and share skills.");
          }}
        >
          <Text style={styles.navIcon}>🌐</Text>
          <Text style={[styles.navLabel, activeTab === 3 && styles.navLabelActive, activeTab !== 3 && { color: textSecondary }]}>{t(language, "community")}</Text>
        </Pressable>

        <Pressable
          style={[styles.navItem, activeTab === 4 && styles.navItemActive]}
          onPress={() => {
            setActiveTab(4);
            if (typeof onOpenSettings === "function") onOpenSettings();
            else handleActionPress("Settings", "Navigation not available");
          }}
        >
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={[styles.navLabel, activeTab === 4 && styles.navLabelActive, activeTab !== 4 && { color: textSecondary }]}>{t(language, "settings")}</Text>
        </Pressable>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Color.colorBlue8,
    paddingTop: 12,
  },
  scrollview: {
    flex: 1,
    backgroundColor: Color.colorBlue8,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 100,
    paddingTop: 8,
  },
  container: {
    flex: 1,
    paddingHorizontal: Padding.padding_24,
    paddingTop: 32,
    gap: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  welcomeBack: {
    fontSize: StyleVariable.fontSize14,
    color: Color.colorAzure65,
    fontFamily: FontFamily.interRegular,
  },
  userName: {
    fontSize: StyleVariable.itemSpacingS,
    fontWeight: StyleVariable.fontWeight800,
    fontFamily: FontFamily.interExtraBold,
    color: Color.colorWhiteSolid,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  avatarGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    fontSize: StyleVariable.fontSize18,
    fontWeight: StyleVariable.fontWeight700,
    fontFamily: FontFamily.interBold,
    color: Color.colorWhiteSolid,
  },
  welcomeCard: {
    backgroundColor: Color.colorAzure11,
    borderWidth: StyleVariable.strokeWeight1,
    borderColor: Color.colorBlue19,
    borderRadius: Border.br_14,
    padding: 16,
    gap: 6,
  },
  welcomeCardTitle: {
    fontSize: StyleVariable.fontSize16,
    fontWeight: StyleVariable.fontWeight700,
    fontFamily: FontFamily.interBold,
    color: Color.colorWhiteSolid,
  },
  welcomeCardText: {
    fontSize: StyleVariable.fontSize12,
    fontFamily: FontFamily.interRegular,
    color: Color.colorAzure65,
    lineHeight: 18,
  },
  resumeSection: {
    gap: 10,
  },
  resumeSectionTitle: {
    fontSize: StyleVariable.fontSize16,
    fontWeight: StyleVariable.fontWeight700,
    fontFamily: FontFamily.interBold,
    color: Color.colorWhiteSolid,
  },
  resumeSectionSubtitle: {
    fontSize: StyleVariable.fontSize12,
    fontFamily: FontFamily.interRegular,
    color: Color.colorAzure65,
    lineHeight: 18,
  },
  scoreCard: {
    backgroundColor: Color.colorAzure11,
    borderWidth: StyleVariable.strokeWeight1,
    borderColor: Color.colorBlue19,
    borderRadius: Border.br_14,
    padding: 18,
    alignItems: "center",
    gap: 14,
  },
  profileRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    justifyContent: "flex-start",
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  profileAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 999,
  },
  profileAvatarText: {
    fontSize: StyleVariable.fontSize18,
    fontWeight: StyleVariable.fontWeight700,
    fontFamily: FontFamily.interBold,
    color: Color.colorWhiteSolid,
  },
  profileTextWrap: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: StyleVariable.fontSize16,
    fontWeight: StyleVariable.fontWeight700,
    fontFamily: FontFamily.interBold,
    color: Color.colorWhiteSolid,
  },
  profileSubtitle: {
    fontSize: StyleVariable.fontSize11,
    fontFamily: FontFamily.interRegular,
    color: Color.colorAzure65,
  },
  scoreInner: {
    alignItems: "center",
    gap: 12,
  },
  scoreBadge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Color.colorBlue19,
    borderWidth: 1,
    borderColor: Color.colorBlue23,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreBadgeNumber: {
    fontSize: 42,
    fontWeight: "800",
    color: Color.colorCyan50,
    fontFamily: FontFamily.interBold,
  },
  scoreBadgeLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Color.colorAzure65,
    letterSpacing: 1.5,
    marginTop: 2,
    textTransform: "uppercase",
  },
  scoreLabel: {
    alignItems: "center",
    gap: 4,
  },
  scoreTitle: {
    fontSize: StyleVariable.fontSize11,
    color: Color.colorAzure65,
    fontFamily: FontFamily.interMedium,
    fontWeight: StyleVariable.fontWeight500,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: StyleVariable.fontWeight800,
    fontFamily: FontFamily.interExtraBold,
    color: Color.colorWhiteSolid,
    letterSpacing: -1,
  },
  skillsSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  skillCard: {
    flex: 1,
    minWidth: 104,
    maxWidth: 132,
    padding: 16,
    backgroundColor: Color.colorAzure11,
    borderWidth: StyleVariable.strokeWeight1,
    borderColor: Color.colorBlue19,
    borderRadius: Border.br_14,
    gap: 10,
    alignItems: "flex-start",
  },
  skillIcon: {
    fontSize: StyleVariable.fontSize22,
  },
  skillName: {
    fontSize: StyleVariable.itemSpacing12,
    fontWeight: StyleVariable.fontWeight600,
    fontFamily: FontFamily.interSemiBold,
    color: Color.colorWhiteSolid,
  },
  skillPercent: {
    fontSize: StyleVariable.fontSize11,
    color: Color.colorCyan50,
    fontFamily: FontFamily.interRegular,
  },
  progressBar: {
    width: 70,
    height: Height.height_3,
    borderRadius: Border.br_2,
  },
  miniChartCard: {
    backgroundColor: Color.colorAzure11,
    borderWidth: StyleVariable.strokeWeight1,
    borderColor: Color.colorBlue19,
    borderRadius: Border.br_14,
    padding: 16,
    gap: 12,
  },
  miniChartTitle: {
    fontSize: StyleVariable.itemSpacing12,
    fontWeight: StyleVariable.fontWeight500,
    fontFamily: FontFamily.interMedium,
    color: Color.colorAzure65,
  },
  chartImage: {
    width: "100%",
    height: 80,
    borderRadius: 12,
  },
  actionStatusCard: {
    backgroundColor: Color.colorAzure11,
    borderWidth: StyleVariable.strokeWeight1,
    borderColor: Color.colorBlue19,
    borderRadius: Border.br_14,
    padding: 16,
    gap: 4,
  },
  actionStatusLabel: {
    fontSize: StyleVariable.fontSize11,
    fontFamily: FontFamily.interMedium,
    color: Color.colorAzure65,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  actionStatusValue: {
    fontSize: StyleVariable.fontSize14,
    fontWeight: StyleVariable.fontWeight600,
    fontFamily: FontFamily.interSemiBold,
    color: Color.colorWhiteSolid,
  },
  searchArea: {
    marginTop: 12,
    backgroundColor: Color.colorAzure11,
    borderWidth: StyleVariable.strokeWeight1,
    borderColor: Color.colorBlue19,
    borderRadius: Border.br_12,
    padding: 12,
    gap: 8,
  },
  searchInput: {
    backgroundColor: Color.colorBlue8,
    color: Color.colorWhiteSolid,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Border.br_8,
    borderWidth: StyleVariable.strokeWeight1,
    borderColor: Color.colorBlue19,
    marginBottom: 8,
  },
  searchResults: {
    maxHeight: 220,
  },
  searchRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Color.colorBlue19,
  },
  searchRowTitle: {
    color: Color.colorWhiteSolid,
    fontWeight: StyleVariable.fontWeight600,
    fontSize: StyleVariable.fontSize13,
  },
  searchRowSnippet: {
    color: Color.colorAzure65,
    fontSize: StyleVariable.fontSize11,
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: Color.colorCyan50,
    borderRadius: Border.br_12,
    minHeight: 64,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: StyleVariable.fontSize13,
    fontWeight: StyleVariable.fontWeight700,
    fontFamily: FontFamily.interBold,
    color: Color.colorBlackSolid,
    textAlign: "center",
    lineHeight: 18,
  },
  secondaryButton: {
    width: "100%",
    backgroundColor: Color.colorAzure11,
    borderWidth: StyleVariable.strokeWeight1,
    borderColor: Color.colorBlue19,
    borderRadius: Border.br_12,
    minHeight: 64,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: StyleVariable.fontSize14,
    fontWeight: StyleVariable.fontWeight600,
    fontFamily: FontFamily.interSemiBold,
    color: Color.colorWhiteSolid,
    textAlign: "center",
    lineHeight: 19,
  },
  bottomNav: {
    backgroundColor: Color.colorBlue8,
    borderTopWidth: StyleVariable.strokeWeight1,
    borderTopColor: Color.colorBlue19,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: Padding.padding_20,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  navItemActive: {
    opacity: 1,
  },
  navIcon: {
    fontSize: 22,
  },
  navLabel: {
    fontSize: 9,
    fontFamily: FontFamily.interRegular,
    color: Color.colorAzure47,
    marginTop: 4,
  },
  navLabelActive: {
    color: Color.colorCyan50,
  },
  navDot: {
    width: 4,
    height: 6,
    backgroundColor: Color.colorCyan50,
    borderRadius: 2,
    marginTop: 4,
  },
  emptySkillsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderWidth: StyleVariable.strokeWeight1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderStyle: "dashed",
    borderRadius: Border.br_14,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  emptySkillsText: {
    fontFamily: FontFamily.interMedium,
    fontSize: StyleVariable.fontSize12,
    color: Color.colorAzure65,
    textAlign: "center",
    lineHeight: 18,
  },
  insightCard: {
    backgroundColor: Color.colorAzure11,
    borderWidth: StyleVariable.strokeWeight1,
    borderColor: Color.colorBlue19,
    borderRadius: Border.br_14,
    padding: 16,
    gap: 8,
    marginBottom: 8,
    width: "100%",
  },
  insightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  insightTitle: {
    fontSize: StyleVariable.fontSize16 || 16,
    fontWeight: StyleVariable.fontWeight700 || "700",
    fontFamily: FontFamily.interBold,
    color: Color.colorWhiteSolid,
  },
  insightScoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  insightScoreText: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: FontFamily.interBold,
  },
  insightSubtitle: {
    fontSize: 12,
    fontFamily: FontFamily.interRegular,
    color: Color.colorAzure65,
    lineHeight: 17,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    width: "100%",
  },
  metricItem: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.01)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 8,
    padding: 8,
  },
  metricLabel: {
    fontSize: 9,
    color: Color.colorAzure65,
    fontFamily: FontFamily.interMedium,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: Color.colorWhiteSolid,
    marginTop: 2,
    fontFamily: FontFamily.interSemiBold,
  },
  previewBtn: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  previewBtnText: {
    fontSize: 12,
    fontFamily: FontFamily.interSemiBold,
    color: Color.colorWhiteSolid,
    fontWeight: "600",
  },
  modulesStatusSection: {
    gap: 10,
    marginBottom: 8,
    width: "100%",
  },
  modulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 6,
    width: "100%",
  },
  moduleStatusCard: {
    flexBasis: "47%",
    flexGrow: 1,
    minWidth: 140,
    padding: 14,
    backgroundColor: Color.colorAzure11,
    borderWidth: 1,
    borderColor: Color.colorBlue19,
    borderRadius: Border.br_14,
    gap: 4,
    alignItems: "flex-start",
  },
  moduleStatusCardCompleted: {
    borderColor: "rgba(0, 212, 255, 0.4)",
    backgroundColor: "rgba(0, 212, 255, 0.04)",
  },
  moduleCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 4,
  },
  moduleIcon: {
    fontSize: 20,
  },
  moduleStatusIndicator: {
    fontSize: 9,
    fontWeight: "600",
    fontFamily: FontFamily.interSemiBold,
  },
  statusCompleted: {
    color: Color.colorSpringGreen39,
  },
  statusPending: {
    color: Color.colorOrange50,
  },
  moduleCardTitle: {
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: FontFamily.interBold,
    color: Color.colorWhiteSolid,
  },
  moduleCardScore: {
    fontSize: 18,
    fontWeight: "800",
    fontFamily: FontFamily.interExtraBold,
    color: Color.colorCyan50,
    marginVertical: 2,
  },
  moduleCardDesc: {
    fontSize: 10,
    fontFamily: FontFamily.interRegular,
    color: Color.colorAzure65,
    lineHeight: 14,
  },
});

export default Screen11;
