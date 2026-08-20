import * as React from "react";
import { View, Text, StyleSheet, Pressable, Animated, Platform, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getTheme } from "../utils/theme";

const Divs28 = ({ onBack, onHome, onRecordingComplete, isDarkMode = true }) => {
  const T = getTheme(isDarkMode);
  const [isRecording, setIsRecording] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  
  const pulse = React.useRef(new Animated.Value(1)).current;
  const fade = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fade]);

  React.useEffect(() => {
    let timer;
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();

      timer = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      pulse.setValue(1);
    }
    return () => { if(timer) clearInterval(timer); };
  }, [isRecording, pulse]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const secs = s % 60;
    return `${m}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      <View style={S.header}>
        <Pressable style={[S.iconBtn, { backgroundColor: T.surface, borderColor: T.border }]} onPress={onBack}>
          <Text style={[S.iconBtnText, { color: T.text }]}>✕</Text>
        </Pressable>
        <Text style={[S.title, { color: T.text }]}>EmotionPrint Capture</Text>
        <Pressable style={[S.iconBtn, { backgroundColor: T.surface, borderColor: T.border }]} onPress={onHome}>
          <Text style={[S.iconBtnText, { color: T.text }]}>⌂</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[S.content, { opacity: fade }]}>
          
          {/* Camera Frame */}
          <View style={[S.cameraFrame, { borderColor: T.border, backgroundColor: T.surface }]}>
            <View style={S.scanLineWrap}>
              {isRecording && (
                <Animated.View style={[S.scanLine, { backgroundColor: T.cyan, transform: [{ scaleY: pulse }] }]} />
              )}
            </View>
            <Text style={[S.placeholderText, { color: T.muted }]}>
              {isRecording ? "Analyzing facial micro-expressions..." : "Camera Preview Ready"}
            </Text>

            {isRecording && (
              <View style={[S.timerBadge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                <Text style={S.timerDot}>●</Text>
                <Text style={S.timerText}>{formatTime(seconds)}</Text>
              </View>
            )}
          </View>

          <Text style={[S.instruction, { color: T.muted }]}>
            Talk about your day or answer a mock interview question. We'll analyze your confidence, tone, and facial micro-expressions.
          </Text>

          <Pressable 
            style={S.recordBtnWrap}
            onPress={() => {
              if (isRecording) {
                setIsRecording(false);
                if (typeof onRecordingComplete === 'function') onRecordingComplete(null);
              } else {
                setIsRecording(true);
              }
            }}
          >
            <Animated.View style={[
              S.recordBtn,
              isRecording ? { backgroundColor: T.rose, transform: [{ scale: pulse }] } : { backgroundColor: T.accent }
            ]}>
              <Text style={S.recordIcon}>{isRecording ? "⏹" : "⏺"}</Text>
            </Animated.View>
          </Pressable>
          
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const S = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? 54 : 28, paddingHorizontal: 20, paddingBottom: 12 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  iconBtnText: { fontSize: 18, fontWeight: "600" },
  title: { fontSize: 16, fontWeight: "800", letterSpacing: -0.2 },
  
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 30, maxWidth: 500, width: "100%", alignSelf: "center" },
  content: { flex: 1, alignItems: "center", justifyContent: "space-between", gap: 16 },

  cameraFrame: { width: "100%", height: 280, maxHeight: 340, borderRadius: 24, borderWidth: 2, overflow: "hidden", alignItems: "center", justifyContent: "center", position: "relative" },
  placeholderText: { fontSize: 14, fontWeight: "600" },
  
  scanLineWrap: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center" },
  scanLine: { width: "100%", height: 2, opacity: 0.5 },

  timerBadge: { position: "absolute", top: 16, right: 16, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  timerDot: { fontSize: 12, color: "#f43f5e" },
  timerText: { fontSize: 14, fontWeight: "700", color: "#fff", fontVariant: ["tabular-nums"] },

  instruction: { fontSize: 13, textAlign: "center", lineHeight: 20, paddingHorizontal: 10 },

  recordBtnWrap: { marginTop: 10, marginBottom: 10 },
  recordBtn: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", elevation: 5, shadowColor: "#000", shadowOffset: {width:0,height:4}, shadowOpacity: 0.3, shadowRadius: 10 },
  recordIcon: { fontSize: 28, color: "#fff" },
});

export default Divs28;
