import React from "react";
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getTheme } from "../../utils/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const TermsModal = ({ visible, onClose, isDarkMode = true, activeTab = "terms" }) => {
  const T = getTheme(isDarkMode);
  const [tab, setTab] = React.useState(activeTab || "terms");

  React.useEffect(() => {
    if (activeTab) setTab(activeTab);
  }, [activeTab]);

  if (!visible) return null;

  const content = (
    <View style={[styles.overlay, { backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.85)" : "rgba(15, 23, 42, 0.65)" }]}>
      <View style={[styles.modalCard, { backgroundColor: isDarkMode ? "#0d0f17" : "#ffffff", borderColor: isDarkMode ? "rgba(255, 255, 255, 0.15)" : "#e2e8f0" }]}>
        
        {/* Header Bar */}
        <View style={[styles.header, { borderBottomColor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0" }]}>
          <View style={styles.headerTitleRow}>
            <LinearGradient colors={["#7c3aed", "#06b6d4"]} style={styles.badgeIcon}>
              <Text style={styles.badgeText}>SG</Text>
            </LinearGradient>
            <View>
              <Text style={[styles.headerTitle, { color: isDarkMode ? "#ffffff" : "#0f172a" }]}>
                {tab === "terms" ? "Terms of Service" : "Privacy Policy"}
              </Text>
              <Text style={[styles.headerSub, { color: isDarkMode ? "#94a3b8" : "#64748b" }]}>
                SkillGenome Platform Guidelines & User Agreement
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "#f1f5f9" }]}>
            <Text style={[styles.closeBtnText, { color: isDarkMode ? "#ffffff" : "#0f172a" }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View style={[styles.tabBar, { backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : "#f1f5f9" }]}>
          <TouchableOpacity 
            onPress={() => setTab("terms")} 
            style={[styles.tabItem, tab === "terms" && { backgroundColor: isDarkMode ? "#7c3aed" : "#7c3aed" }]}
          >
            <Text style={[styles.tabText, tab === "terms" ? { color: "#ffffff", fontWeight: "800" } : { color: isDarkMode ? "#94a3b8" : "#64748b" }]}>
              Terms of Service
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setTab("privacy")} 
            style={[styles.tabItem, tab === "privacy" && { backgroundColor: isDarkMode ? "#7c3aed" : "#7c3aed" }]}
          >
            <Text style={[styles.tabText, tab === "privacy" ? { color: "#ffffff", fontWeight: "800" } : { color: isDarkMode ? "#94a3b8" : "#64748b" }]}>
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Content Body */}
        <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={true}>
          {tab === "terms" ? (
            <View style={styles.sectionContainer}>
              <Text style={[styles.introText, { color: isDarkMode ? "#cbd5e1" : "#334155" }]}>
                Welcome to <Text style={{ color: "#7c3aed", fontWeight: "800" }}>SkillGenome</Text>. By creating an account or accessing our platform, you agree to these Terms of Service governing AI career intelligence, skill benchmarking, and personalized mentoring.
              </Text>

              <SectionItem 
                icon="🧬" 
                title="1. AI Career Intelligence & Genome Scores" 
                text="SkillGenome uses proprietary machine learning algorithms to compute your Genome Score (0–1000). Your score is dynamically calculated based on verified technical skills, project submissions, daily quiz performance, and market demand alignment. Scores are advisory for professional guidance."
                isDarkMode={isDarkMode}
              />

              <SectionItem 
                icon="🤖" 
                title="2. AI Mentor Twin & Simulation Engines" 
                text="Our AI Mentor Twin provides automated career recommendations, resume diagnostics, and simulation paths. While our models aim for maximum market accuracy, career decisions are ultimately user choices. SkillGenome is not liable for external hiring outcomes."
                isDarkMode={isDarkMode}
              />

              <SectionItem 
                icon="💼" 
                title="3. User Accounts & Verification" 
                text="You are responsible for maintaining the confidentiality of your credentials. Students and Mentors must provide accurate registration details. Mentor profiles may undergo automated or manual verification prior to granting full mentor badge status."
                isDarkMode={isDarkMode}
              />

              <SectionItem 
                icon="🤝" 
                title="4. Community Conduct & Study Groups" 
                text="Members must maintain respectful, constructive communication in public study groups, code discussions, and mentor rooms. Harassment, spam, or plagiarism of project repositories is strictly prohibited and subject to account suspension."
                isDarkMode={isDarkMode}
              />

              <SectionItem 
                icon="⚡" 
                title="5. Service Updates & System Availability" 
                text="We continuously improve SkillGenome algorithms and features. We reserve the right to deploy updates, maintain system availability, and refine scoring parameters to match evolving industry trends."
                isDarkMode={isDarkMode}
              />
            </View>
          ) : (
            <View style={sectionContainer}>
              <Text style={[styles.introText, { color: isDarkMode ? "#cbd5e1" : "#334155" }]}>
                Your privacy and data security are paramount at <Text style={{ color: "#06b6d4", fontWeight: "800" }}>SkillGenome</Text>. This policy explains how we collect, process, and protect your information.
              </Text>

              <SectionItem 
                icon="🔒" 
                title="1. Data Collection & Processing" 
                text="We collect profile data (name, email, role, skills), resume contents, quiz responses, and ThoughtPrint logs solely to generate personalized career genomes, skill radar charts, and job matches."
                isDarkMode={isDarkMode}
              />

              <SectionItem 
                icon="🛡️" 
                title="2. Supabase RLS & Database Security" 
                text="All user records are secured using enterprise-grade Supabase Row-Level Security (RLS). Your private journal entries, project drafts, and personal notes are accessible only by your authenticated account."
                isDarkMode={isDarkMode}
              />

              <SectionItem 
                icon="🚫" 
                title="3. No Third-Party Selling" 
                text="SkillGenome NEVER sells your personal data, email address, or uploaded resume files to third-party ad networks or brokers. Data is processed strictly for platform career matching and AI twin features."
                isDarkMode={isDarkMode}
              />

              <SectionItem 
                icon="🗑️" 
                title="4. Account Deletion & Data Rights" 
                text="You maintain full ownership of your data. You may request account deletion or export your profile and project history at any time from your account settings."
                isDarkMode={isDarkMode}
              />
            </View>
          )}
        </ScrollView>

        {/* Footer Action */}
        <View style={[styles.footer, { borderTopColor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0" }]}>
          <TouchableOpacity onPress={onClose} style={styles.agreeBtnWrap}>
            <LinearGradient colors={["#7c3aed", "#06b6d4"]} style={styles.agreeBtn}>
              <Text style={styles.agreeBtnText}>I Understand & Agree</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );

  if (Platform.OS === "web") {
    return content;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {content}
    </Modal>
  );
};

const SectionItem = ({ icon, title, text, isDarkMode }) => (
  <View style={[styles.sectionBox, { backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#f8fafc", borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "#e2e8f0" }]}>
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={[styles.sectionTitle, { color: isDarkMode ? "#ffffff" : "#0f172a" }]}>{title}</Text>
    </View>
    <Text style={[styles.sectionText, { color: isDarkMode ? "#94a3b8" : "#475569" }]}>{text}</Text>
  </View>
);

const sectionContainer = {
  gap: 14,
  paddingBottom: 20
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 620,
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 20,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  badgeIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: "800",
  },
  tabBar: {
    flexDirection: "row",
    padding: 6,
    gap: 6,
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 14,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
  },
  scrollBody: {
    padding: 20,
    maxHeight: 400,
  },
  sectionContainer: {
    gap: 14,
    paddingBottom: 20,
  },
  introText: {
    fontSize: 13.5,
    lineHeight: 21,
    marginBottom: 8,
  },
  sectionBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    flex: 1,
  },
  sectionText: {
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  agreeBtnWrap: {
    borderRadius: 14,
    overflow: "hidden",
  },
  agreeBtn: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  agreeBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
});

export default TermsModal;
