import * as React from "react";
import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Image
} from "react-native";
import SafeLinearGradient from "../components/SafeLinearGradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { FontFamily, StyleVariable, Color, Border, Height, BoxShadow, Padding } from "../GlobalStyles";

/**
 * Register Screen - User registration form with gradient button,
 * password strength indicator, and terms of service checkbox.
 */
const RegisterScreen = () => {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleCreateAccount = () => {
    if (!fullName || !email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (!termsAccepted) {
      alert("Please accept terms and conditions");
      return;
    }
    // TODO: Connect to backend registration API
    alert("Account creation in progress...");
  };

  return (
    <KeyboardAwareScrollView
      style={styles.keyboardawarescrollview}
      contentContainerStyle={styles.scrollView1Content}
    >
      <View style={styles.register}>
        <Text style={[styles.register2, styles.register2Typo]}>4. Register</Text>
      </View>

      <View style={[styles.divphone, styles.divphoneFlexBox]}>
        <View style={styles.div}>
          {/* Status bar notch (visual only) */}
          <View style={styles.divnotch} />

          {/* Header */}
          <View style={styles.divlogoTitle}>
            <Text style={[styles.skillgenomeOs, styles.skillgenomeOsClr]}>
              SkillGenome OS
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.divs4Form}>
            {/* Full Name Input */}
            <TextInput
              style={[styles.inputinputField, styles.divphoneFlexBox]}
              placeholder="Full name"
              placeholderTextColor="#00a4ef"
              value={fullName}
              onChangeText={setFullName}
            />

            {/* Email Input */}
            <TextInput
              style={[styles.div2, styles.textInputBase]}
              placeholder="Email"
              placeholderTextColor="#00a4ef"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            {/* Password Section */}
            <View style={styles.div3}>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="#00a4ef"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordBtn}>
                  <Text style={[styles.showPasswordText, { color: Color.colorCyan50 }]}>
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              </View>

              {/* Password Strength Indicator */}
              <View style={styles.divs4FlexBox}>
                <View style={[styles.divs4PwBars, styles.divs4FlexBox]}>
                  <View style={[styles.divs4PwBar, styles.divs4Layout]} />
                  <View style={[styles.divs4PwBar, styles.divs4Layout]} />
                  <View style={[styles.divs4PwBar3, styles.divs4Layout]} />
                  <View style={[styles.divs4PwBar4, styles.divs4Layout]} />
                </View>
                <Text style={[styles.mediumStrength, styles.register2Typo1]}>
                  Medium strength
                </Text>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password"
                placeholderTextColor="#00a4ef"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.showPasswordBtn}>
                <Text style={[styles.showPasswordText, { color: Color.colorCyan50 }]}>
                  {showConfirmPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>

            {/* Create Account Button */}
            <SafeLinearGradient
              style={styles.buttonGradient}
              locations={[0, 0.5, 1]}
              colors={[Color.colorCyan50, Color.colorViolet58, Color.colorRose60]}
            >
              <Pressable
                style={styles.pressableFlexBox}
                onPress={handleCreateAccount}
              >
                <Text style={[styles.createAccount, styles.skillgenomeOsClr]}>
                  Create Account
                </Text>
              </Pressable>
            </SafeLinearGradient>

            {/* Terms and Conditions */}
            <Pressable
              style={styles.divs4Termsmargin}
              onPress={() => setTermsAccepted(!termsAccepted)}
            >
              <View style={styles.divs4Terms}>
                {/* Checkbox Visual */}
                <View
                  style={[
                    styles.checkbox,
                    termsAccepted && styles.checkboxChecked
                  ]}
                >
                  {termsAccepted && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text style={styles.termsOfConditionsContainer}>
                  <Text style={styles.termsOf}>{`Terms of `}</Text>
                  <Text style={styles.conditions}>conditions</Text>
                  <Text style={styles.termsOf}>{` and `}</Text>
                  <Text style={styles.conditions}>Privacy</Text>
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Sign In Link */}
          <View style={styles.divs3Createmargin}>
            <View style={styles.divs3Create}>
              <Text style={styles.alreadyHaveAccountContainer}>
                <Text style={styles.alreadyHaveAccount}>{`Already have account? `}</Text>
                <Text style={styles.signIn}>Sign In</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView1Content: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 11,
    flex: 1
  },
  register2Typo: {
    fontFamily: FontFamily.interBold,
    fontWeight: StyleVariable.fontWeight700
  },
  divphoneFlexBox: {
    overflow: "hidden",
    alignSelf: "stretch"
  },
  skillgenomeOsClr: {
    color: Color.colorWhiteSolid,
    textAlign: "left"
  },
  divs4FlexBox: {
    gap: StyleVariable.itemSpacingXxs,
    alignSelf: "stretch"
  },
  divs4Layout: {
    borderRadius: Border.br_2,
    height: Height.height_3,
    flex: 1
  },
  register2Typo1: {
    fontSize: StyleVariable.fontSize11,
    textAlign: "left"
  },
  keyboardawarescrollview: {
    maxWidth: "100%",
    flex: 1,
    width: "100%",
    backgroundColor: Color.appPrimaryBackground
  },
  register: {
    paddingLeft: 1,
    flexDirection: "row"
  },
  register2: {
    letterSpacing: StyleVariable.strokeWeight2,
    textTransform: "uppercase",
    color: Color.colorAzure35,
    textAlign: "left",
    fontSize: StyleVariable.fontSize11
  },
  divphone: {
    height: 844,
    boxShadow: BoxShadow.interRegular,
    elevation: 0,
    borderRadius: 54,
    backgroundColor: Color.colorBlue8
  },
  div: {
    paddingTop: Padding.padding_40,
    gap: StyleVariable.fontSize32,
    zIndex: 0,
    alignSelf: "stretch",
    flex: 1
  },
  divnotch: {
    width: 126,
    height: 36,
    position: "absolute",
    marginLeft: -63,
    top: 12,
    left: "50%",
    borderRadius: 20,
    backgroundColor: Color.colorBlackSolid,
    zIndex: 2
  },
  divlogoTitle: {
    zIndex: 1,
    alignItems: "center",
    alignSelf: "stretch"
  },
  skillgenomeOs: {
    fontSize: StyleVariable.fontSize22,
    fontFamily: FontFamily.interBold,
    fontWeight: StyleVariable.fontWeight700
  },
  divs4Form: {
    paddingHorizontal: 24,
    paddingVertical: 0,
    gap: StyleVariable.fontSize14,
    zIndex: 2,
    alignSelf: "stretch"
  },
  inputinputField: {
    borderRadius: 12,
    backgroundColor: Color.colorBlue16,
    borderStyle: "solid",
    borderColor: Color.colorBlue19,
    borderWidth: StyleVariable.strokeWeight1,
    paddingLeft: Padding.padding_40,
    paddingTop: Padding.padding_14,
    paddingRight: Padding.padding_16,
    paddingBottom: Padding.padding_14,
    alignItems: "center",
    textAlign: "left",
    flexDirection: "row",
    width: "100%",
    color: Color.colorWhiteSolid,
    fontSize: StyleVariable.fontSize14,
    fontFamily: FontFamily.interRegular
  },
  textInputBase: {
    borderRadius: 12,
    backgroundColor: Color.colorBlue16,
    borderStyle: "solid",
    borderColor: Color.colorBlue19,
    borderWidth: StyleVariable.strokeWeight1,
    paddingLeft: Padding.padding_40,
    paddingTop: Padding.padding_14,
    paddingRight: Padding.padding_16,
    paddingBottom: Padding.padding_14,
    alignItems: "center",
    textAlign: "left",
    flexDirection: "row",
    width: "100%",
    color: Color.colorWhiteSolid,
    fontSize: StyleVariable.fontSize14,
    fontFamily: FontFamily.interRegular
  },
  div2: {
    justifyContent: "flex-end",
    alignItems: "center",
    alignSelf: "stretch",
    textAlign: "left",
    flexDirection: "row",
    width: "100%"
  },
  div3: {
    gap: StyleVariable.fontSize8,
    alignSelf: "stretch"
  },
  div4: {
    alignSelf: "stretch",
    textAlign: "left",
    width: "100%"
  },
  divs4PwBars: {
    alignItems: "center",
    flexDirection: "row"
  },
  divs4PwBar: {
    backgroundColor: Color.colorSpringGreen39
  },
  divs4PwBar3: {
    backgroundColor: Color.colorOrange50
  },
  divs4PwBar4: {
    backgroundColor: Color.colorBlue19
  },
  mediumStrength: {
    color: Color.colorOrange50,
    fontFamily: FontFamily.interRegular,
    textAlign: "left"
  },
  buttonGradient: {
    padding: Padding.padding_16,
    justifyContent: "center",
    borderRadius: 999,
    alignItems: "center",
    overflow: "hidden",
    alignSelf: "stretch"
  },
  pressableFlexBox: {
    backgroundColor: "transparent",
    padding: Padding.padding_16,
    justifyContent: "center",
    borderRadius: 999,
    alignItems: "center",
    alignSelf: "stretch"
  },
  createAccount: {
    fontSize: StyleVariable.fontSize16,
    letterSpacing: StyleVariable.letterSpacing02,
    fontWeight: StyleVariable.fontWeight600,
    fontFamily: FontFamily.interSemiBold
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    width: "100%",
    borderRadius: 12,
    backgroundColor: Color.colorBlue16,
    borderStyle: "solid",
    borderColor: Color.colorBlue19,
    borderWidth: StyleVariable.strokeWeight1,
  },
  passwordInput: {
    flex: 1,
    paddingLeft: Padding.padding_40,
    paddingTop: Padding.padding_14,
    paddingRight: Padding.padding_16,
    paddingBottom: Padding.padding_14,
    color: Color.colorWhiteSolid,
    fontSize: StyleVariable.fontSize14,
    fontFamily: FontFamily.interRegular,
    textAlign: "left"
  },
  showPasswordBtn: {
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center"
  },
  showPasswordText: {
    fontSize: StyleVariable.fontSize14,
    fontFamily: FontFamily.interMedium,
    fontWeight: StyleVariable.fontWeight500,
  },
  divs4Termsmargin: {
    paddingTop: 4,
    alignSelf: "stretch"
  },
  divs4Terms: {
    gap: 10,
    alignSelf: "stretch",
    flexDirection: "row"
  },
  checkbox: {
    width: 18,
    height: 19,
    borderWidth: 1,
    borderColor: Color.colorBlue19,
    borderRadius: 4,
    backgroundColor: Color.colorBlue16,
    alignItems: "center",
    justifyContent: "center"
  },
  checkboxChecked: {
    backgroundColor: Color.colorCyan50,
    borderColor: Color.colorCyan50
  },
  checkmark: {
    color: Color.colorBlue8,
    fontSize: 14,
    fontWeight: "bold"
  },
  termsOfConditionsContainer: {
    fontSize: StyleVariable.itemSpacing12,
    lineHeight: StyleVariable.fontSize18,
    fontFamily: FontFamily.interRegular,
    textAlign: "left",
    flex: 1
  },
  termsOf: {
    color: Color.colorAzure47
  },
  conditions: {
    color: Color.colorCyan50
  },
  divs3Createmargin: {
    paddingHorizontal: 0,
    paddingVertical: Padding.padding_16,
    zIndex: 3,
    alignSelf: "stretch"
  },
  divs3Create: {
    alignItems: "center",
    alignSelf: "stretch"
  },
  alreadyHaveAccountContainer: {
    fontSize: StyleVariable.fontSize13,
    textAlign: "left"
  },
  alreadyHaveAccount: {
    color: Color.colorAzure47,
    fontFamily: FontFamily.interRegular
  },
  signIn: {
    fontWeight: "500",
    fontFamily: FontFamily.interMedium,
    color: Color.colorCyan50
  }
});

export default RegisterScreen;
