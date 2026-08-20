import * as React from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Animated, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getTheme } from "../utils/theme";

const Screen5 = ({ onBack, onSendResetLink, onContinue, isDarkMode = true, language = 'English' }) => {
  const T = getTheme(isDarkMode);
  const [email, setEmail] = React.useState("");
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const fade  = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(24)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSendResetLink = () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }
    setIsSubmitted(true);
    if (onSendResetLink) {
      onSendResetLink(email);
    }
  };

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
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

      <KeyboardAwareScrollView
        contentContainerStyle={S.scrollContent}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[S.card, { backgroundColor: T.surface, borderColor: T.border, opacity: fade, transform: [{ translateY: slide }] }, T.cardShadow]}>

          {/* Top Bar */}
          <View style={S.topBar}>
            <Pressable style={[S.iconBtn, { backgroundColor: T.surface2, borderColor: T.border }]} onPress={onBack}>
              <Text style={[S.iconBtnText, { color: T.text }]}>←</Text>
            </Pressable>
            <Text style={[S.logoBadge, { color: T.accent, backgroundColor: `${T.accent}15` }]}>SkillGenome</Text>
          </View>

          {!isSubmitted ? (
            <>
              {/* Heading */}
              <View style={S.headingWrap}>
                <Text style={[S.title, { color: T.text }]}>Reset password</Text>
                <Text style={[S.subtitle, { color: T.muted }]}>
                  Enter the email address associated with your account and we'll send you a password reset link.
                </Text>
              </View>

              {/* Email Input */}
              <View style={S.fieldWrap}>
                <Text style={[S.fieldLabel, { color: T.muted }]}>Email Address</Text>
                <View style={[S.inputBox, { borderColor: focused ? T.accent : T.border, backgroundColor: T.inputBg }]}>
                  <TextInput
                    style={[S.input, { color: T.text }]}
                    placeholder="you@example.com"
                    placeholderTextColor={T.muted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <Pressable onPress={handleSendResetLink} style={S.submitWrap}>
                <LinearGradient
                  colors={[T.accent, T.accentEnd]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={S.submitBtn}
                >
                  <Text style={S.submitText}>Send Reset Link  →</Text>
                </LinearGradient>
              </Pressable>
            </>
          ) : (
            <>
              {/* Success State */}
              <View style={S.successWrap}>
                <View style={[S.successIconWrap, { backgroundColor: `${T.green}18` }]}>
                  <Text style={S.successIcon}>📧</Text>
                </View>
                <Text style={[S.title, { color: T.text, textAlign: "center" }]}>Check your inbox</Text>
                <Text style={[S.subtitle, { color: T.muted, textAlign: "center" }]}>
                  We've sent password reset instructions to <Text style={{ color: T.text, fontWeight: "700" }}>{email}</Text>.
                </Text>
              </View>

              <Pressable onPress={onContinue} style={S.submitWrap}>
                <LinearGradient
                  colors={[T.accent, T.accentEnd]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={S.submitBtn}
                >
                  <Text style={S.submitText}>Continue to Verification  →</Text>
                </LinearGradient>
              </Pressable>
            </>
          )}

        </Animated.View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const S = StyleSheet.create({
  root:          { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  card: {
    width: "100%", maxWidth: 420, borderRadius: 24, borderWidth: 1,
    padding: 28, gap: 20,
  },
  topBar:        { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  iconBtn:       { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  iconBtnText:   { fontSize: 18, fontWeight: "600" },
  logoBadge:     { fontSize: 13, fontWeight: "800", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, overflow: "hidden" },
  
  headingWrap:   { gap: 6 },
  title:         { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  subtitle:      { fontSize: 13, lineHeight: 20 },

  fieldWrap:     { gap: 6 },
  fieldLabel:    { fontSize: 12, fontWeight: "600" },
  inputBox:      { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, paddingHorizontal: 14 },
  input:         { flex: 1, paddingVertical: 12, fontSize: 14 },

  submitWrap:    { borderRadius: 14, overflow: "hidden", marginTop: 4 },
  submitBtn:     { paddingVertical: 14, alignItems: "center" },
  submitText:    { color: "#fff", fontWeight: "800", fontSize: 15 },

  successWrap:   { alignItems: "center", gap: 12, paddingVertical: 10 },
  successIconWrap:{ width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  successIcon:   { fontSize: 32 },
});

export default Screen5;
