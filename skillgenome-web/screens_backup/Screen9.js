import * as React from "react";
import { ScrollView, Text, StyleSheet, View, Pressable, Image, Animated, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import OnboardingDots from "../components/OnboardingDots";
import { t } from "../utils/translations";
import { getTheme } from "../utils/theme";

const Screen9 = ({ onNext, isDarkMode = true, language = 'English' }) => {
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

          {/* Simulation Graphic Card */}
          <View style={[S.card, { backgroundColor: T.surface, borderColor: T.border }, T.cardShadow]}>
            <Image
              style={S.cardImage}
              source={require("../assets/div-ob-card-margin.png")}
              resizeMode="contain"
            />
          </View>

          {/* Content Section */}
          <View style={S.contentSection}>
            <Text style={[S.title, { color: T.text }]}>{t(language, "simulateFuturesTitle")}</Text>
            <Text style={[S.description, { color: T.muted }]}>
              {t(language, "simulateFuturesDesc")}
            </Text>
            <View style={S.dotsWrap}>
              <OnboardingDots activeIndex={2} />
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
            <Text style={S.nextButtonText}>{t(language, "getStarted") || "Get Started"}  →</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
};

const S = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flex: 1 },
  scrollContentInner: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 24, paddingBottom: 110 },
  mainCard: { width: "100%", maxWidth: 440, gap: 24, alignItems: "center" },
  header: { alignSelf: "center" },
  logoBadge: { fontSize: 14, fontWeight: "800", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, overflow: "hidden" },
  card: {
    width: "100%", height: 260, borderRadius: 24, borderWidth: 1,
    overflow: "hidden", alignItems: "center", justifyContent: "center", padding: 12,
  },
  cardImage: { width: "100%", height: "100%" },
  contentSection: { alignItems: "center", gap: 10, paddingHorizontal: 10 },
  title: { fontSize: 24, fontWeight: "800", textAlign: "center", letterSpacing: -0.5 },
  description: { fontSize: 14, textAlign: "center", lineHeight: 21 },
  dotsWrap: { marginTop: 8 },
  btnContainer: { position: "absolute", bottom: 30, left: 24, right: 24, alignItems: "center" },
  nextButton: { width: "100%", maxWidth: 440, borderRadius: 16, overflow: "hidden" },
  nextButtonGrad: { paddingVertical: 16, alignItems: "center" },
  nextButtonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});

export default Screen9;
