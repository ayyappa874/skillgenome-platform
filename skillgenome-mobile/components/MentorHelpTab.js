import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';

const MentorHelpTab = ({ T }) => {
  const faqs = [
    { q: 'How is the Burnout Probability calculated?', a: 'The burnout engine analyzes consecutive absences, assignment completion decay, and sentiment analysis from chat interactions to generate a risk score.' },
    { q: 'Can I add a student manually to my cohort?', a: 'No, students are auto-matched based on skill gaps. However, you can send an invite link to a specific student from the Cohorts tab.' },
    { q: 'How do I end a live session?', a: 'Inside the live room, press the red "End Session" button. This will automatically sync your notes to the students\' feeds.' },
    { q: 'Where do I upload assignments?', a: 'Use the Resource Library to upload PDFs or Links, and then assign them to specific cohorts.' }
  ];

  return (
    <View style={S.container}>
      <Text style={[S.title, { color: T.text, marginBottom: 24 }]}>Help & Support</Text>

      <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
        <View style={[S.hero, { backgroundColor: `${T.accent}10`, borderColor: T.accent }]}>
          <Text style={{ fontSize: 40, marginBottom: 16 }}>🧑‍🏫</Text>
          <Text style={[S.heroTitle, { color: T.text }]}>Mentor Resource Center</Text>
          <Text style={[S.heroSub, { color: T.muted }]}>Everything you need to guide the next generation of engineers.</Text>
          <Pressable style={[S.contactBtn, { backgroundColor: T.accent }]}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>Contact Support</Text>
          </Pressable>
        </View>

        <Text style={[S.sectionTitle, { color: T.text }]}>Frequently Asked Questions</Text>
        <View style={S.faqList}>
          {faqs.map((faq, i) => (
            <View key={i} style={[S.faqCard, { backgroundColor: T.surface, borderColor: T.borderLow }]}>
              <Text style={[S.faqQ, { color: T.text }]}>{faq.q}</Text>
              <Text style={[S.faqA, { color: T.muted }]}>{faq.a}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const S = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  scroll: { flex: 1 },
  
  hero: { padding: 40, borderRadius: 24, borderWidth: 1, alignItems: 'center', marginBottom: 32 },
  heroTitle: { fontSize: 22, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  heroSub: { fontSize: 14, textAlign: 'center', marginBottom: 24, maxWidth: 400 },
  contactBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },

  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  
  faqList: { gap: 16, paddingBottom: 40 },
  faqCard: { padding: 20, borderRadius: 16, borderWidth: 1 },
  faqQ: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  faqA: { fontSize: 14, lineHeight: 22 }
});

export default MentorHelpTab;
