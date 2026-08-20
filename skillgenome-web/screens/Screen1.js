import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, Animated, Easing, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import HelixBackground from "../components/UI/HelixBackground";
import DNAHelix from "../components/UI/DNAHelix";
import { getTheme } from "../utils/theme";

const { width } = Dimensions.get("window");

const Screen1 = ({ isDarkMode = true, language = 'English' }) => {
  const T = getTheme(isDarkMode);
  const styles = React.useMemo(() => getStyles(T), [T]);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.45)).current;

  const [loadingText, setLoadingText] = useState("Initializing SkillGenome OS...");
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    // 1. Subtle Glow Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.45,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 2. Pulse for Logo Mark
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Smooth Progress Interval without Animated.addListener
    const startTime = Date.now();
    const duration = 2600;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      const pct = Math.floor(progress * 100);

      setProgressPercent(pct);

      if (pct < 28) {
        setLoadingText("Initializing Neural Engine...");
      } else if (pct < 62) {
        setLoadingText("Decoding Career Genome...");
      } else if (pct < 92) {
        setLoadingText("Loading AI Twin Models...");
      } else {
        setLoadingText("System Ready");
      }

      if (progress >= 1) {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#080914" : "#f8fafc" }]}>
      {/* Rich Radiant Background Gradient */}
      <LinearGradient
        colors={isDarkMode ? ["#080914", "#0f1126", "#141635"] : ["#f8fafc", "#f1f5f9", "#e2e8f0"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Bright Ambient Radial Light Spheres */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={isDarkMode ? ["rgba(124, 58, 237, 0.35)", "transparent"] : ["rgba(124, 58, 237, 0.15)", "transparent"]}
          style={styles.ambientGlowTop}
        />
        <LinearGradient
          colors={isDarkMode ? ["rgba(6, 182, 212, 0.28)", "transparent"] : ["rgba(6, 182, 212, 0.12)", "transparent"]}
          style={styles.ambientGlowBottom}
        />
      </View>

      {/* Bright Animated DNA Double Helix Backdrop */}
      <HelixBackground opacity={isDarkMode ? 0.9 : 0.45} side="center" fps={30} />

      {/* Center Hero Content with Soft Glowing Aura */}
      <Animated.View style={[
        styles.circleCard, 
        { 
          opacity: glowAnim, 
          transform: [{ scale: pulseAnim }],
          borderColor: isDarkMode ? "rgba(56, 189, 248, 0.4)" : "rgba(124, 58, 237, 0.25)",
          shadowColor: isDarkMode ? "#00f2fe" : "#7c3aed",
        }
      ]}>
        <LinearGradient
          colors={isDarkMode ? ["rgba(124, 92, 252, 0.22)", "rgba(6, 182, 212, 0.12)", "rgba(15, 17, 38, 0.75)"] : ["rgba(255, 255, 255, 0.95)", "rgba(241, 245, 249, 0.9)", "rgba(255, 255, 255, 0.98)"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.content}>
          {/* Prominent Rolling 3D DNA Helix Animation */}
          <View style={styles.helixContainer}>
            <DNAHelix size={130} rowCount={12} />
          </View>

          {/* Brand Title */}
          <Text style={[styles.title, { color: isDarkMode ? "#ffffff" : "#0f172a", textShadowColor: isDarkMode ? "rgba(56, 189, 248, 0.7)" : "rgba(124, 58, 237, 0.2)" }]}>SkillGenome</Text>
          <View style={[styles.subtitleBadge, { backgroundColor: isDarkMode ? "rgba(6, 182, 212, 0.22)" : "rgba(124, 58, 237, 0.1)", borderColor: isDarkMode ? "rgba(6, 182, 212, 0.5)" : "rgba(124, 58, 237, 0.3)" }]}>
            <Text style={[styles.subtitle, { color: isDarkMode ? "#00f2fe" : "#7c3aed" }]}>CAREER INTELLIGENCE DECODED</Text>
          </View>

          {/* Progress Tracker with text & percentage above the bar track */}
          <View style={styles.progressContainer}>
            <View style={styles.progressMeta}>
              <Text style={[styles.loadingText, { color: isDarkMode ? "#ffffff" : "#334155", textShadowColor: isDarkMode ? "rgba(0,0,0,0.9)" : "transparent" }]} numberOfLines={1}>{loadingText}</Text>
              <Text style={[styles.percentText, { color: isDarkMode ? "#00f2fe" : "#7c3aed", textShadowColor: isDarkMode ? "rgba(0, 242, 254, 0.8)" : "transparent" }]}>{progressPercent}%</Text>
            </View>

            <View style={[styles.progressBarTrack, { backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.18)" : "rgba(15, 23, 42, 0.08)", borderColor: isDarkMode ? "rgba(56, 189, 248, 0.3)" : "rgba(124, 58, 237, 0.2)" }]}>
              <LinearGradient
                colors={isDarkMode ? ["#c084fc", "#38bdf8", "#00f2fe"] : ["#7c3aed", "#a855f7", "#06b6d4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFill, { width: `${progressPercent}%`, borderRadius: 4 }]}
              />
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#080914",
  },
  ambientGlowTop: {
    position: "absolute",
    top: -100,
    left: -100,
    width: 450,
    height: 450,
    borderRadius: 225,
  },
  ambientGlowBottom: {
    position: "absolute",
    bottom: -100,
    right: -100,
    width: 450,
    height: 450,
    borderRadius: 225,
  },
  circleCard: {
    width: 360,
    height: 360,
    borderRadius: 180,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(56, 189, 248, 0.4)",
    shadowColor: "#00f2fe",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 16,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    width: "100%",
  },
  helixContainer: {
    marginBottom: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "System",
    fontSize: 32,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -0.8,
    marginBottom: 4,
    textAlign: "center",
    textShadowColor: "rgba(56, 189, 248, 0.7)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  subtitleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(6, 182, 212, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(6, 182, 212, 0.5)",
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: "System",
    fontSize: 9.5,
    fontWeight: "900",
    color: "#00f2fe",
    letterSpacing: 2,
    textAlign: "center",
  },
  progressContainer: {
    width: 270,
    gap: 8,
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "800",
    letterSpacing: 0.2,
    flex: 1,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  percentText: {
    fontSize: 14,
    color: "#00f2fe",
    fontWeight: "900",
    fontFamily: "System",
    marginLeft: 8,
    textShadowColor: "rgba(0, 242, 254, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  progressBarTrack: {
    height: 8,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
  },
});

export default Screen1;
