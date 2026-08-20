import React from 'react';
import { Modal, View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { getTheme } from '../utils/theme';

export default function LegalModal({ visible, type, onClose, isDarkMode }) {
  const T = getTheme(isDarkMode);

  const content = {
    terms: {
      title: "Terms of Service",
      body: `Welcome to SkillGenome!\n\n1. Acceptance of Terms\nBy accessing or using the SkillGenome application, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.\n\n2. User Accounts\n- You must provide accurate information when creating an account.\n- You are responsible for safeguarding your password and any activities under your account.\n- SkillGenome reserves the right to suspend or terminate accounts that violate these terms.\n\n3. Mentorship & Interactions\nSkillGenome facilitates connections between students and mentors. We do not guarantee employment or specific career outcomes. Users are expected to maintain professional conduct in all interactions.\n\n4. AI Mentor & Data\nThe AI Mentor provides guidance based on available data. While we strive for accuracy, AI-generated advice should not replace professional judgment.\n\n5. Intellectual Property\nThe Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of SkillGenome.\n\n6. Changes to Terms\nWe reserve the right to modify or replace these Terms at any time. We will provide notice of any significant changes.\n\nLast updated: ${new Date().toLocaleDateString()}`
    },
    privacy: {
      title: "Privacy Policy",
      body: `Your privacy is important to SkillGenome.\n\n1. Information We Collect\n- Personal Information: Name, email address, job title, and professional background when you register.\n- Usage Data: Information on how you interact with the AI Mentor, your learning topics, and quiz results.\n- Device Data: Device type, operating system, and IP address for security purposes.\n\n2. How We Use Your Information\n- To provide and maintain our Service.\n- To personalize your AI Mentor experience and generate your Career Genome.\n- To notify you about changes to our Service and provide customer support.\n- To match you with appropriate mentors or job opportunities.\n\n3. Data Security\nWe implement enterprise-grade security (SOC2 Compliant) to protect your personal information. However, no method of transmission over the Internet is 100% secure.\n\n4. Sharing of Data\nWe do not sell your personal data. We may share data with trusted third-party service providers (like Supabase and OpenAI) strictly for the purpose of operating our service.\n\n5. Your Rights\nYou have the right to access, update, or delete your personal information at any time through your account settings.\n\nLast updated: ${new Date().toLocaleDateString()}`
    }
  };

  const activeContent = content[type] || content.terms;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
        <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]}>
          <View style={[styles.header, { borderBottomColor: T.border }]}>
            <Text style={[styles.title, { color: T.text }]}>{activeContent.title}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={[styles.closeText, { color: T.accent }]}>Done</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.body, { color: T.text }]}>{activeContent.body}</Text>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  container: { height: '85%', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  title: { fontSize: 20, fontWeight: 'bold' },
  closeBtn: { padding: 8 },
  closeText: { fontSize: 16, fontWeight: '800' },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 60 },
  body: { fontSize: 15, lineHeight: 24 }
});
