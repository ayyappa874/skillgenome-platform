import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Switch, Platform, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getTheme } from "../utils/theme";
import TermsModal from "../components/UI/TermsModal";

const SettingsScreen_uipro = ({
  onBack, onLogout, onDeleteAccount, isDarkMode = true, onToggleDarkMode,
  onOpenEditProfile, onOpenPortfolio, onOpenChangePassword, onOpenLinkedAccounts,
  onOpenHelp, onOpenDeviceSetup, onExportData, language = "English", onLanguageChange
}) => {
  const T = getTheme(isDarkMode);
  const S = getStyles(T);
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;
  const [showTermsModal, setShowTermsModal] = React.useState(false);
  const [termsTab, setTermsTab] = React.useState("terms");

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const SettingRow = ({ icon, title, sub, onPress, rightElement }) => (
    <Pressable style={[S.row, { borderColor: T.borderLow, backgroundColor: T.surface2 }]} onPress={onPress}>
      <View style={S.rowLeft}>
        <View style={[S.iconWrap, { backgroundColor: T.surface, borderColor: T.border }]}>
          <Text style={S.iconText}>{icon}</Text>
        </View>
        <View style={S.rowTextWrap}>
          <Text style={[S.rowTitle, { color: T.text }]}>{title}</Text>
          {sub && <Text style={[S.rowSub, { color: T.muted }]}>{sub}</Text>}
        </View>
      </View>
      {rightElement ? rightElement : <Text style={[S.chevron, { color: T.muted }]}>→</Text>}
    </Pressable>
  );

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[`${T.accent}15`, "transparent"]}
          style={{ position: "absolute", top: -80, right: -60, width: 340, height: 340, borderRadius: 170 }}
        />
      </View>

      <View style={S.header}>
        <Pressable onPress={onBack} style={S.backBtn}>
          <Text style={S.backIcon}>←</Text>
        </Pressable>
        <View>
          <Text style={S.pageTitle}>Settings & Preferences</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 20 }}>
          
          <View style={S.section}>
            <Text style={[S.sectionTitle, { color: T.muted }]}>ACCOUNT & PROFILE</Text>
            <View style={[S.card, { borderColor: T.border, backgroundColor: T.surface }]}>
              <SettingRow icon="👤" title="Edit Profile" sub="Name, title, bio, and skills" onPress={onOpenEditProfile} />
              <SettingRow icon="💼" title="Portfolio Builder" sub="Projects and github links" onPress={onOpenPortfolio} />
              <SettingRow icon="🔑" title="Change Password" sub="Update security credentials" onPress={onOpenChangePassword} />
              <SettingRow icon="🔗" title="Linked Accounts" sub="GitHub, LinkedIn, Google" onPress={onOpenLinkedAccounts} />
              <SettingRow icon="⬇️" title="Export My Data" sub="Download all your genome data" onPress={onExportData} />
            </View>
          </View>

          <View style={S.section}>
            <Text style={[S.sectionTitle, { color: T.muted }]}>PREFERENCES & SYSTEM</Text>
            <View style={[S.card, { borderColor: T.border, backgroundColor: T.surface }]}>
              <SettingRow
                icon="🌙"
                title="Dark Mode"
                sub="Toggle app theme mode"
                rightElement={
                  <Switch
                    value={isDarkMode}
                    onValueChange={onToggleDarkMode}
                    trackColor={{ false: T.borderLow, true: T.accent }}
                    thumbColor="#fff"
                  />
                }
              />
              <SettingRow icon="📱" title="Device Setup" sub="Permissions and hardware check" onPress={onOpenDeviceSetup} />
              <SettingRow icon="❓" title="Help & Support" sub="FAQs, feedback, and support contact" onPress={onOpenHelp} />
              <SettingRow icon="📜" title="Terms of Service" sub="Guidelines and User Agreement" onPress={() => { setShowTermsModal(true); setTermsTab("terms"); }} />
              <SettingRow icon="🔒" title="Privacy Policy" sub="Data security and collection" onPress={() => { setShowTermsModal(true); setTermsTab("privacy"); }} />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <Pressable style={[S.logoutBtn, { flex: 1, borderColor: T.rose, backgroundColor: `${T.rose}10` }]} onPress={onLogout}>
              <Text style={[S.logoutText, { color: T.rose }]}>Log Out</Text>
            </Pressable>
            <Pressable style={[S.logoutBtn, { flex: 1, borderColor: T.rose, backgroundColor: T.rose }]} onPress={onDeleteAccount}>
              <Text style={[S.logoutText, { color: "#fff" }]}>Delete Account</Text>
            </Pressable>
          </View>

        </Animated.View>
      </ScrollView>

      {/* Terms & Privacy Modal */}
      <TermsModal
        visible={showTermsModal}
        activeTab={termsTab}
        onClose={() => setShowTermsModal(false)}
        isDarkMode={isDarkMode}
      />
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  root: { flex: 1 },
  header:  {
    flexDirection: "row", alignItems: "center", gap: 16,
    paddingTop: Platform.OS === "ios" ? 72 : 56,
    paddingHorizontal: 20, paddingBottom: 16,
  },
  backBtn:   { width: 42, height: 42, borderRadius: 21, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, alignItems: "center", justifyContent: "center" },
  backIcon:  { fontSize: 18, color: T.text, fontWeight: "600", marginTop: -2 },
  pageTitle: { fontSize: 24, fontWeight: "900", color: T.text, letterSpacing: -0.5 },
  pageSub:   { fontSize: 14, color: T.muted, fontWeight: "500", marginTop: 2 },

  content: { paddingHorizontal: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },
  section: { gap: 10 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginLeft: 4 },
  card: { borderRadius: 20, borderWidth: 1, padding: 10, gap: 8 },

  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 14, borderWidth: 1 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconWrap: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  iconText: { fontSize: 18 },
  rowTextWrap: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: "700" },
  rowSub: { fontSize: 12, marginTop: 2 },
  chevron: { fontSize: 16, fontWeight: "700" },

  logoutBtn: { paddingVertical: 16, borderRadius: 16, borderWidth: 1, alignItems: "center", marginTop: 10 },
  logoutText: { fontSize: 15, fontWeight: "800" },
});

export default SettingsScreen_uipro;
