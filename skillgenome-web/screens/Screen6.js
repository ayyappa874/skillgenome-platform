import * as React from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Animated, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getTheme } from "../utils/theme";

const Screen6 = ({ onVerify, onResend, isDarkMode = true, language = 'English' }) => {
  const T = getTheme(isDarkMode);
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = React.useState(60);
  const inputRefs = React.useRef([]);

  const fade  = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(24)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  React.useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value, index) => {
    const digits = value.replace(/[^0-9]/g, "").slice(0, otp.length);
    const nextOtp = [...otp];

    if (!digits) {
      nextOtp[index] = "";
      setOtp(nextOtp);
      return;
    }

    if (digits.length > 1) {
      digits.split("").forEach((digit, offset) => {
        if (index + offset < nextOtp.length) {
          nextOtp[index + offset] = digit;
        }
      });
      setOtp(nextOtp);
      const nextIndex = Math.min(index + digits.length, otp.length - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    nextOtp[index] = digits;
    setOtp(nextOtp);

    if (digits && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length < 6) {
      alert("Please enter the 6-digit code");
      return;
    }
    if (onVerify) onVerify(code);
  };

  const handleResendClick = () => {
    setTimer(60);
    setOtp(["", "", "", "", "", ""]);
    if (onResend) onResend();
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

          {/* Header */}
          <View style={S.headerWrap}>
            <Text style={[S.logoBadge, { color: T.accent, backgroundColor: `${T.accent}15` }]}>SkillGenome</Text>
            <Text style={[S.title, { color: T.text }]}>Enter verification code</Text>
            <Text style={[S.subtitle, { color: T.muted }]}>
              We sent a 6-digit code to your email. Enter it below to verify your account.
            </Text>
          </View>

          {/* OTP Input Grid */}
          <View style={S.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  S.otpBox,
                  {
                    backgroundColor: T.inputBg,
                    borderColor: digit ? T.accent : T.border,
                    color: T.text,
                  }
                ]}
                keyboardType="number-pad"
                maxLength={6}
                value={digit}
                onChangeText={(val) => handleOtpChange(val, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Timer & Resend */}
          <View style={S.resendRow}>
            {timer > 0 ? (
              <Text style={[S.timerText, { color: T.muted }]}>
                Resend code in <Text style={{ color: T.accent, fontWeight: "700" }}>{timer}s</Text>
              </Text>
            ) : (
              <Pressable onPress={handleResendClick}>
                <Text style={[S.resendBtnText, { color: T.accent }]}>Resend Code</Text>
              </Pressable>
            )}
          </View>

          {/* Verify Button */}
          <Pressable onPress={handleVerify} style={S.submitWrap}>
            <LinearGradient
              colors={[T.accent, T.accentEnd]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={S.submitBtn}
            >
              <Text style={S.submitText}>Verify & Continue  →</Text>
            </LinearGradient>
          </Pressable>

        </Animated.View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  root:          { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  card: {
    width: "100%", maxWidth: 420, borderRadius: 24, borderWidth: 1,
    padding: 28, gap: 20,
  },
  headerWrap:   { gap: 6, alignItems: "flex-start" },
  logoBadge:    { fontSize: 13, fontWeight: "800", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, overflow: "hidden" },
  title:        { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  subtitle:     { fontSize: 13, lineHeight: 19 },

  otpRow:       { flexDirection: "row", justifyContent: "space-between", gap: 8, marginVertical: 6 },
  otpBox:       {
    width: 48, height: 54, borderRadius: 12, borderWidth: 1.5,
    textAlign: "center", fontSize: 20, fontWeight: "800",
  },

  resendRow:    { alignItems: "center" },
  timerText:    { fontSize: 13 },
  resendBtnText:{ fontSize: 14, fontWeight: "700" },

  submitWrap:   { borderRadius: 14, overflow: "hidden", marginTop: 4 },
  submitBtn:    { paddingVertical: 14, alignItems: "center" },
  submitText:   { color: "#fff", fontWeight: "800", fontSize: 15 },
});

export default Screen6;
