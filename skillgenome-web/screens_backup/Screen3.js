import * as React from "react";
import {
  StyleSheet, View, Text, TextInput,
  Pressable, Animated, Alert, Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import SafeLinearGradient from "../components/SafeLinearGradient";
import WebAnimatedBackground from "../components/WebAnimatedBackground";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { t } from "../utils/translations";
import { getTheme } from "../utils/theme";

const STRENGTH_COLORS = ["#3f3f46", "#ef4444", "#f59e0b", "#22c55e", "#22c55e"];
const STRENGTH_LABELS = ["Weak", "Weak", "Fair", "Good", "Strong"];

function FocusInput({ label, rightEl, containerStyle, theme, ...props }) {
  const [focused, setFocused] = React.useState(false);
  const activeTheme = theme || {};
  const activeBorder = focused
    ? (activeTheme.accent || "#7c3aed")
    : (activeTheme.border || "rgba(255,255,255,0.1)");
  const activeBg = activeTheme.inputBg || "rgba(255,255,255,0.07)";
  const activeText = activeTheme.text || "#fafafa";
  const activeMuted = activeTheme.muted || "#71717a";

  return (
    <View style={[S.fieldWrap, containerStyle]}>
      {label && <Text style={[S.fieldLabel, { color: activeMuted }]}>{label}</Text>}
      <View style={[S.inputBox, { borderColor: activeBorder, backgroundColor: activeBg }]}>
        <TextInput
          style={[S.input, { color: activeText }]}
          placeholderTextColor={activeMuted}
          onFocus={(e) => { setFocused(true); if (props.onFocus) props.onFocus(e); }}
          onBlur={(e) => { setFocused(false); if (props.onBlur) props.onBlur(e); }}
          {...props}
        />
        {rightEl}
      </View>
    </View>
  );
}

const Screen3 = ({ onSignIn, onSignUpPress, isDarkMode = true, language = 'English' }) => {
  const T = getTheme(isDarkMode);
  const [fullName,        setFullName]        = React.useState("");
  const [email,           setEmail]           = React.useState("");
  const [password,        setPassword]        = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [termsAccepted,   setTermsAccepted]   = React.useState(false);
  const [userType,        setUserType]        = React.useState("student");
  const [showPw,          setShowPw]          = React.useState(false);
  const [showConfPw,      setShowConfPw]      = React.useState(false);
  const [company,         setCompany]         = React.useState("");
  const [designation,     setDesignation]     = React.useState("");
  const [linkedin,        setLinkedin]        = React.useState("");
  const [workEmail,       setWorkEmail]       = React.useState("");
  const [proof,           setProof]           = React.useState("");

  // Password strength logic
  const hasLower   = /[a-z]/.test(password);
  const hasUpper   = /[A-Z]/.test(password);
  const hasNumber  = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const count = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  let strength = 0;
  if (password.length > 0) {
    if (password.length < 6 || count <= 1) strength = 1;
    else if (count === 2) strength = 2;
    else if (count === 3) strength = 3;
    else strength = 4;
  }

  // Entrance
  const fade  = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(24)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleCreate = () => {
    if (!fullName || !email || !password || !confirmPassword) { Alert.alert("Error", "Please fill all fields"); return; }
    if (password !== confirmPassword) { Alert.alert("Error", "Passwords don't match"); return; }
    
    if (userType === "mentor") {
      if (!company || !designation || !linkedin || !workEmail || !proof) {
        Alert.alert("Verification Required", "All Mentor Verification fields are mandatory. Please fill them out to create a mentor account.");
        return;
      }
      if (!linkedin.toLowerCase().includes("linkedin.com/")) {
        Alert.alert("Invalid Link", "Please provide a valid LinkedIn profile URL (e.g., linkedin.com/in/username).");
        return;
      }
      if (!workEmail.includes("@") || !workEmail.includes(".")) {
        Alert.alert("Invalid Email", "Please provide a valid Work Email (Office ID) format.");
        return;
      }
    }
    
    if (!termsAccepted) { Alert.alert("Required", "Please accept the terms of service"); return; }
    if (onSignUpPress) {
      onSignUpPress(email, password, fullName, { user_type: userType, company, designation, linkedin, work_email: workEmail, proof });
    }
  };

  const criteriaItems = [
    { label: "Uppercase", met: hasUpper },
    { label: "Lowercase", met: hasLower },
    { label: "Number",    met: hasNumber },
    { label: "Symbol",    met: hasSpecial },
  ];

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      <WebAnimatedBackground isDarkMode={isDarkMode} />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {Platform.OS !== 'web' && (
          <>
            <LinearGradient
              colors={["rgba(124,58,237,0.18)", "transparent"]}
              style={{ position: "absolute", top: -80, right: -60, width: 340, height: 340, borderRadius: 170 }}
            />
            <LinearGradient
              colors={["rgba(6,182,212,0.10)", "transparent"]}
              style={{ position: "absolute", bottom: -60, left: -60, width: 300, height: 300, borderRadius: 150 }}
            />
          </>
        )}
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
            <Text style={[S.logoBadge, { color: T.accent, backgroundColor: `${T.accent}15` }]}>SkillGenome</Text>
          </View>

          {/* Heading */}
          <View style={S.headingWrap}>
            <Text style={[S.title, { color: T.text }]}>Create your account</Text>
            <Text style={[S.subtitle, { color: T.muted }]}>Start mapping your skills & unlocking career intelligence</Text>
          </View>

          {/* Account Type Toggle */}
          <View style={[S.typeToggle, { backgroundColor: T.surface2, borderColor: T.borderLow }]}>
            <Pressable
              onPress={() => setUserType("student")}
              style={[S.typeOption, userType === "student" && { backgroundColor: T.accent }]}
            >
              <Text style={[S.typeText, { color: userType === "student" ? "#fff" : T.muted }]}>
                🎓 Student / Jobseeker
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setUserType("mentor")}
              style={[S.typeOption, userType === "mentor" && { backgroundColor: T.accent }]}
            >
              <Text style={[S.typeText, { color: userType === "mentor" ? "#fff" : T.muted }]}>
                🧑‍🏫 Mentor / Hiring Manager
              </Text>
            </Pressable>
          </View>

          {/* Fields */}
          <FocusInput label="Full Name" placeholder="Your full name" value={fullName} onChangeText={setFullName} theme={T} />
          <FocusInput label="Email" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} theme={T} />

          {/* Mentor section */}
          {userType === "mentor" && (
            <View style={[S.mentorSection, { borderColor: `${T.accent}44`, backgroundColor: `${T.accent}0d` }]}>
              <View style={S.mentorHeader}>
                <View style={[S.mentorDot, { backgroundColor: T.accent }]} />
                <Text style={[S.mentorTitle, { color: T.accent }]}>Mentor Verification Required</Text>
              </View>
              {[
                { l: "Company / Employer", p: "e.g. Google, Infosys", v: company, fn: setCompany },
                { l: "Job Title",          p: "Senior Engineer",       v: designation, fn: setDesignation },
                { l: "LinkedIn URL",       p: "linkedin.com/in/...",   v: linkedin, fn: setLinkedin },
                { l: "Work Email",         p: "name@company.com",      v: workEmail, fn: setWorkEmail },
              ].map((f) => (
                <FocusInput key={f.l} label={f.l} placeholder={f.p} value={f.v} onChangeText={f.fn} theme={T} />
              ))}
              <FocusInput
                label="Verification Proof"
                placeholder="Employee ID, certificate, or brief description…"
                multiline
                value={proof} onChangeText={setProof}
                containerStyle={{ minHeight: 80 }}
                theme={T}
              />
            </View>
          )}

          {/* Password */}
          <FocusInput
            label="Password"
            placeholder="Create a strong password"
            secureTextEntry={!showPw}
            value={password} onChangeText={setPassword}
            theme={T}
            rightEl={
              <Pressable onPress={() => setShowPw(!showPw)} style={S.eyeBtn}>
                <Text style={[S.eyeText, { color: T.muted }]}>{showPw ? "Hide" : "Show"}</Text>
              </Pressable>
            }
          />

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <View style={S.strengthBlock}>
              <View style={S.strengthBars}>
                {[1, 2, 3, 4].map((n) => (
                  <View key={n} style={[S.strengthBar, {
                    backgroundColor: n <= strength ? STRENGTH_COLORS[strength] : (isDarkMode ? "rgba(255,255,255,0.1)" : "#e2e8f0")
                  }]} />
                ))}
              </View>
              <View style={S.criteriaRow}>
                {criteriaItems.map((c) => (
                  <Text key={c.label} style={[S.criteriaItem, { color: c.met ? STRENGTH_COLORS[3] : T.muted }]}>
                    {c.met ? "✓" : "·"} {c.label}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Confirm password */}
          <FocusInput
            label="Confirm Password"
            placeholder="Re-enter password"
            secureTextEntry={!showConfPw}
            value={confirmPassword} onChangeText={setConfirmPassword}
            theme={T}
            rightEl={
              <Pressable onPress={() => setShowConfPw(!showConfPw)} style={S.eyeBtn}>
                <Text style={[S.eyeText, { color: T.muted }]}>{showConfPw ? "Hide" : "Show"}</Text>
              </Pressable>
            }
          />

          {/* Terms */}
          <Pressable onPress={() => setTermsAccepted(!termsAccepted)} style={S.termsRow}>
            <View style={[S.checkbox, {
              backgroundColor: termsAccepted ? T.accent : "transparent",
              borderColor: termsAccepted ? T.accent : T.border,
            }]}>
              {termsAccepted && <Text style={S.checkmark}>✓</Text>}
            </View>
            <Text style={[S.termsText, { color: T.muted }]}>
              I agree to the <Text style={{ color: T.accent, fontWeight: "700" }}>Terms of Service</Text>
              {" "}and{" "}
              <Text style={{ color: T.accent, fontWeight: "700" }}>Privacy Policy</Text>
            </Text>
          </Pressable>

          {/* Submit */}
          <Pressable onPress={handleCreate} style={S.submitWrap}>
            <LinearGradient
              colors={[T.accent, T.accentEnd]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={S.submitBtn}
            >
              <Text style={S.submitText}>Create Account  →</Text>
            </LinearGradient>
          </Pressable>

          {/* Secondary Action */}
          <Pressable onPress={onSignIn} style={[S.secondaryBtn, { borderColor: T.border, backgroundColor: T.surface2 }]}>
            <Text style={[S.secondaryBtnText, { color: T.text }]}>Already have an account? Sign In</Text>
          </Pressable>
        </Animated.View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const S = StyleSheet.create({
  root:          { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  card: {
    width: "100%", maxWidth: 440, borderRadius: 24, borderWidth: 1,
    padding: 24, gap: 16,
  },
  topBar:        { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  logoBadge:     { fontSize: 13, fontWeight: "800", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, overflow: "hidden", flexShrink: 0 },
  signInLink:    { flexShrink: 1, alignItems: "flex-end" },
  signInLinkText:{ fontSize: 13, textAlign: "right", flexShrink: 1 },
  headingWrap:   { gap: 4 },
  title:         { fontSize: 22, fontWeight: "800", letterSpacing: -0.4 },
  subtitle:      { fontSize: 13, lineHeight: 18 },

  typeToggle:    { flexDirection: "row", borderRadius: 12, padding: 4, borderWidth: 1, gap: 4, minHeight: 52 },
  typeOption:    { flex: 1, paddingVertical: 8, paddingHorizontal: 4, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  typeText:      { fontSize: 12, fontWeight: "700", textAlign: "center" },

  fieldWrap:     { gap: 6 },
  fieldLabel:    { fontSize: 12, fontWeight: "600" },
  inputBox:      { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 12, paddingHorizontal: 14 },
  input:         { flex: 1, paddingVertical: 12, fontSize: 14 },
  eyeBtn:        { paddingLeft: 10 },
  eyeText:       { fontSize: 12, fontWeight: "600" },

  mentorSection: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 12 },
  mentorHeader:  { flexDirection: "row", alignItems: "center", gap: 8 },
  mentorDot:     { width: 8, height: 8, borderRadius: 4 },
  mentorTitle:   { fontSize: 13, fontWeight: "800" },

  strengthBlock: { gap: 6 },
  strengthBars:  { flexDirection: "row", gap: 6 },
  strengthBar:   { flex: 1, height: 4, borderRadius: 2 },
  criteriaRow:   { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  criteriaItem:  { fontSize: 11, fontWeight: "600" },

  termsRow:      { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox:      { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  checkmark:     { color: "#fff", fontSize: 12, fontWeight: "800" },
  termsText:     { fontSize: 12, flex: 1, lineHeight: 17 },

  submitWrap:    { borderRadius: 14, overflow: "hidden", marginTop: 4 },
  submitBtn:     { paddingVertical: 14, alignItems: "center" },
  submitText:    { color: "#fff", fontWeight: "800", fontSize: 15 },

  secondaryBtn:  { paddingVertical: 14, alignItems: "center", borderRadius: 14, borderWidth: 1, marginTop: 4 },
  secondaryBtnText: { fontWeight: "700", fontSize: 14 },
});

export default Screen3;
