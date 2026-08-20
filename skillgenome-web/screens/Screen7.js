import * as React from "react";
import { ScrollView, Text, StyleSheet, View, Pressable, Image, Animated, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import RadialGradient from "../components/RadialGradient";
import OnboardingDots from "../components/OnboardingDots";
import { t } from "../utils/translations";
import { getTheme } from "../utils/theme";

const Screen7 = ({ onNext, isDarkMode = true, language = 'English' }) => {
  const T = getTheme(isDarkMode);

  const fade  = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleNext = () => {
    if (typeof onNext === "function") onNext();
  };

  return (
    <View style={[S.container, { backgroundColor: T.bg }]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["rgba(124,58,237,0.18)", "transparent"]}
          style={{ position: "absolute", top: -80, right: -60, width: 340, height: 340, borderRadius: 170 }}
        />
        <LinearGradient
          colors={["rgba(6,182,212,0.10)", "transparent"]}
          style={{ position: "absolute", bottom: -60, left: -60, width: 300, height: 300, borderRadius: 150 }}
        />
      </View>

      <ScrollView 
        style={S.scrollContent}
        contentContainerStyle={S.scrollContentInner}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[S.mainCard, { opacity: fade, transform: [{ translateY: slide }] }]}>
          {/* Header */}
          <View style={S.header}>
            <Text style={[S.logoBadge, { color: T.accent, backgroundColor: `${T.accent}15` }]}>
              {t(language, "brandTitle")}
            </Text>
          </View>

          {/* Brain / Twin Card */}
          <View style={[S.card, { backgroundColor: T.surface, borderColor: T.border }, T.cardShadow]}>
            <RadialGradient
              style={S.brainContainer}
              locations={[0, 1]}
              colors={[T.accentLight, T.cyanLight]}
              cx="40%"
              cy="40%"
              rx="84.85%"
              ry="84.85%"
            >
              <Image
                source={require("../assets/Component-13.png")}
                style={S.brainImage}
                resizeMode="contain"
              />
              <View style={[S.aiLabelContainer, { backgroundColor: T.accent }]}>
                <Text style={S.aiLabel}>AI</Text>
              </View>
            </RadialGradient>
          </View>

          {/* Hero Content */}
          <View style={S.heroContent}>
            <Text style={[S.heroTitle, { color: T.text }]}>{t(language, "digitalTwinTitle")}</Text>
            <Text style={[S.heroSub, { color: T.muted }]}>
              Build your AI career counterpart that evolves continuously alongside your projects, skills, and emotional growth.
            </Text>
            <View style={S.dotsWrap}>
              <OnboardingDots activeIndex={0} />
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={S.btnContainer}>
        <Pressable onPress={handleNext} style={S.nextButton}>
          <LinearGradient
            colors={[T.accent, T.accentEnd]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={S.nextButtonGrad}
          >
            <Text style={S.nextButtonText}>{t(language, "next")}  →</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flex: 1 },
  scrollContentInner: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 24, paddingBottom: 110 },
  mainCard: { width: "100%", maxWidth: 440, gap: 24, alignItems: "center" },
  header: { alignSelf: "center" },
  logoBadge: { fontSize: 14, fontWeight: "800", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, overflow: "hidden" },
  card: {
    width: "100%", height: 260, borderRadius: 24, borderWidth: 1,
    overflow: "hidden", alignItems: "center", justifyContent: "center",
  },
  brainContainer: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center", position: "relative" },
  brainImage: { width: 180, height: 180 },
  aiLabelContainer: { position: "absolute", bottom: 16, right: 16, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  aiLabel: { color: "#fff", fontWeight: "900", fontSize: 13 },
  heroContent: { alignItems: "center", gap: 10, paddingHorizontal: 10 },
  heroTitle: { fontSize: 24, fontWeight: "800", textAlign: "center", letterSpacing: -0.5 },
  heroSub: { fontSize: 14, textAlign: "center", lineHeight: 21 },
  dotsWrap: { marginTop: 8 },
  btnContainer: { position: "absolute", bottom: 30, left: 24, right: 24, alignItems: "center" },
  nextButton: { width: "100%", maxWidth: 440, borderRadius: 16, overflow: "hidden" },
  nextButtonGrad: { paddingVertical: 16, alignItems: "center" },
  nextButtonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});

export default Screen7;
