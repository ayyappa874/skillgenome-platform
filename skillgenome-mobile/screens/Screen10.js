import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Switch, Platform, Animated, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getTheme } from "../utils/theme";

const Screen10 = ({ onNext, onBack, isDarkMode = true, language = 'English' }) => {
  
  const T = getTheme(isDarkMode);
  const S = React.useMemo(() => getStyles(T), [T]);
  const [notifications, setNotifications] = useState(false);
  const [camera, setCamera] = useState(false);
  const [mic, setMic] = useState(false);
  const [location, setLocation] = useState(false);

  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleToggle = (type, val, setter) => {
    setter(val);
    if (val) {
      if (Platform.OS === "web") {
        try {
          if (type === "camera" && navigator.mediaDevices?.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
              .then(s => s.getTracks().forEach(t => t.stop()))
              .catch(() => setter(false));
          } else if (type === "mic" && navigator.mediaDevices?.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
              .then(s => s.getTracks().forEach(t => t.stop()))
              .catch(() => setter(false));
          }
        } catch (e) {}
      }
    }
  };

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      <View style={S.header}>
        {onBack ? (
          <Pressable style={[S.iconBtn, { backgroundColor: T.surface, borderColor: T.border }]} onPress={onBack}>
            <Text style={[S.iconBtnText, { color: T.text }]}>←</Text>
          </Pressable>
        ) : <View style={{ width: 42 }} />}
        <Text style={[S.pageTitle, { color: T.text }]}>Device Setup</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 20 }}>
          
          <View style={S.hero}>
            <Text style={[S.heroTitle, { color: T.text }]}>Hardware & Permissions</Text>
            <Text style={[S.heroSub, { color: T.muted }]}>Enable permissions to get the most out of your EmotionPrint and AI Mock Interviews.</Text>
          </View>

          <View style={[S.card, { borderColor: T.border, backgroundColor: T.surface }]}>
            
            <View style={[S.row, { borderColor: T.borderLow }]}>
              <View style={S.rowLeft}>
                <Text style={S.icon}>🔔</Text>
                <View>
                  <Text style={[S.rowTitle, { color: T.text }]}>Notifications</Text>
                  <Text style={[S.rowSub, { color: T.muted }]}>Daily quiz & interview reminders</Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={(val) => handleToggle("notifications", val, setNotifications)}
                trackColor={{ false: T.borderLow, true: T.accent }}
                thumbColor="#fff"
              />
            </View>

            <View style={[S.row, { borderColor: T.borderLow }]}>
              <View style={S.rowLeft}>
                <Text style={S.icon}>📷</Text>
                <View>
                  <Text style={[S.rowTitle, { color: T.text }]}>Camera</Text>
                  <Text style={[S.rowSub, { color: T.muted }]}>For EmotionPrint facial analysis</Text>
                </View>
              </View>
              <Switch
                value={camera}
                onValueChange={(val) => handleToggle("camera", val, setCamera)}
                trackColor={{ false: T.borderLow, true: T.accent }}
                thumbColor="#fff"
              />
            </View>

            <View style={[S.row, { borderColor: T.borderLow }]}>
              <View style={S.rowLeft}>
                <Text style={S.icon}>🎙️</Text>
                <View>
                  <Text style={[S.rowTitle, { color: T.text }]}>Microphone</Text>
                  <Text style={[S.rowSub, { color: T.muted }]}>For Live AI Audio Mock Interviews</Text>
                </View>
              </View>
              <Switch
                value={mic}
                onValueChange={(val) => handleToggle("mic", val, setMic)}
                trackColor={{ false: T.borderLow, true: T.accent }}
                thumbColor="#fff"
              />
            </View>

            <View style={S.row}>
              <View style={S.rowLeft}>
                <Text style={S.icon}>📍</Text>
                <View>
                  <Text style={[S.rowTitle, { color: T.text }]}>Location</Text>
                  <Text style={[S.rowSub, { color: T.muted }]}>For nearby job matches and events</Text>
                </View>
              </View>
              <Switch
                value={location}
                onValueChange={(val) => handleToggle("location", val, setLocation)}
                trackColor={{ false: T.borderLow, true: T.accent }}
                thumbColor="#fff"
              />
            </View>

          </View>

          <Pressable style={[S.continueBtn, { backgroundColor: T.accent }]} onPress={onNext}>
            <Text style={S.continueText}>Continue to Workspace →</Text>
          </Pressable>

        </Animated.View>
      </ScrollView>
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? 54 : 28, paddingHorizontal: 20, paddingBottom: 16 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  iconBtnText: { fontSize: 18, fontWeight: "600" },
  pageTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.4 },

  content: { paddingHorizontal: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },

  hero: { gap: 6, marginBottom: 10 },
  heroTitle: { fontSize: 22, fontWeight: "800" },
  heroSub: { fontSize: 13, lineHeight: 20 },

  card: { padding: 10, borderRadius: 20, borderWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  icon: { fontSize: 22 },
  rowTitle: { fontSize: 15, fontWeight: "700" },
  rowSub: { fontSize: 12, marginTop: 2 },

  continueBtn: { paddingVertical: 18, borderRadius: 16, alignItems: "center", marginTop: 10 },
  continueText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});

export default Screen10;
