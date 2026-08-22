import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions, Dimensions, Alert } from 'react-native';
import RadarChart from './RadarChart';

const MentorStudentDetailModal = ({ student, onClose, onViewFullProfile, T }) => {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const [activeTab, setActiveTab] = useState('overview');
  const [scheduled, setScheduled] = useState(false);

  if (!student) return null;

  const getRiskColor = (risk) => {
    if (risk === 'High') return T.red;
    if (risk === 'Medium') return T.amber;
    return T.green;
  };
  const riskColor = getRiskColor(student.risk);
  
  const studentGaps = [
    { skill: 'Resume', avg: student.resume_score || 85, target: 90 },
    { skill: 'GitHub', avg: student.github_score || 75, target: 80 },
    { skill: 'Thought', avg: student.thought_score || 82, target: 85 },
    { skill: 'Emotion', avg: student.emotion_score || 78, target: 85 }
  ];

  const mockTimeline = [
    { date: 'Aug 15', text: 'Missed 1-on-1 session', type: 'negative' },
    { date: 'Aug 12', text: 'Completed React Hooks Quiz (Score: 85%)', type: 'positive' },
    { date: 'Aug 05', text: 'Joined ML Batch Jan 2026', type: 'neutral' },
  ];

  const renderOverview = () => (
    <View style={S.tabContent}>
      <View style={S.statsGrid}>
        <View style={[S.statBox, { backgroundColor: T.surface2 }]}>
          <Text style={[S.statVal, { color: T.accent }]}>{student.genome}</Text>
          <Text style={[S.statLabel, { color: T.muted }]}>Genome Score</Text>
        </View>
        <View style={[S.statBox, { backgroundColor: T.surface2 }]}>
          <Text style={[S.statVal, { color: T.green }]}>{student.target}</Text>
          <Text style={[S.statLabel, { color: T.muted }]}>Target Score</Text>
        </View>
        <View style={[S.statBox, { backgroundColor: T.surface2 }]}>
          <Text style={[S.statVal, { color: student.health > 75 ? T.green : T.amber }]}>{student.health}</Text>
          <Text style={[S.statLabel, { color: T.muted }]}>Activity Health</Text>
        </View>
      </View>

      <Text style={[S.sectionTitle, { color: T.text }]}>Skill Gap Radar</Text>
      <RadarChart gaps={studentGaps} T={T} size={250} />

      <Text style={[S.sectionTitle, { color: T.text }]}>Chronological Progress</Text>
      <View style={S.timeline}>
        {(student.timeline || mockTimeline).map((item, i) => (
          <View key={i} style={S.timelineItem}>
            <View style={[S.timelineDot, { 
              backgroundColor: item.type === 'positive' ? T.green : item.type === 'negative' ? T.red : T.muted 
            }]} />
            {i !== (student.timeline || mockTimeline).length - 1 && <View style={[S.timelineLine, { backgroundColor: T.borderLow }]} />}
            <Text style={[S.timelineDate, { color: T.muted }]}>{item.date}</Text>
            <Text style={[S.timelineText, { color: T.text }]}>{item.text}</Text>
          </View>
        ))}
      </View>

      <Pressable onPress={onViewFullProfile} style={[S.actionBtn, { backgroundColor: T.surface2, borderColor: T.borderLow, borderWidth: 1, marginTop: 12 }]}>
        <Text style={{ color: T.text, fontWeight: '700' }}>View Full Public Profile</Text>
      </Pressable>
    </View>
  );

  const renderBurnout = () => (
    <View style={S.tabContent}>
      <View style={[S.burnoutHero, { backgroundColor: `${riskColor}10`, borderColor: riskColor }]}>
        <Text style={[S.burnoutProb, { color: riskColor }]}>{student.risk === 'High' ? '85%' : student.risk === 'Medium' ? '45%' : '12%'}</Text>
        <Text style={[S.burnoutLabel, { color: riskColor }]}>BURNOUT PROBABILITY</Text>
      </View>

      <Text style={[S.sectionTitle, { color: T.text }]}>Engagement Metrics</Text>
      <View style={[S.metricRow, { borderBottomColor: T.borderLow }]}>
        <Text style={{ color: T.text }}>Consecutive Days Absent</Text>
        <Text style={{ color: T.red, fontWeight: '800' }}>3 Days</Text>
      </View>
      <View style={[S.metricRow, { borderBottomColor: T.borderLow }]}>
        <Text style={{ color: T.text }}>Assignment Completion Rate</Text>
        <Text style={{ color: T.amber, fontWeight: '800' }}>65% (Drops by 15%)</Text>
      </View>
      <View style={S.metricRow}>
        <Text style={{ color: T.text }}>Session Participation</Text>
        <Text style={{ color: T.green, fontWeight: '800' }}>Active</Text>
      </View>

      <Pressable 
        onPress={() => setScheduled(true)}
        style={({ pressed }) => [
          S.actionBtn, 
          { backgroundColor: scheduled ? T.green : T.accent },
          T.cardShadow,
          pressed && !scheduled && { opacity: 0.8, transform: [{ scale: 0.98 }] }
        ]}
        disabled={scheduled}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
          {scheduled ? "Check-in Scheduled! ✓" : "Schedule Check-in"}
        </Text>
      </Pressable>
    </View>
  );

  return (
    <View style={S.overlay}>
      <View style={[S.modal, { backgroundColor: T.bg, borderColor: T.border, width: isWide ? '70%' : '95%', height: isWide ? '85%' : '90%' }, T.cardShadow]}>
        
        {/* Header */}
        <View style={[S.header, { borderBottomColor: T.borderLow }]}>
          <View style={S.studentHeader}>
            <View style={[S.avatar, { backgroundColor: T.surface2 }]}><Text style={[S.avatarText, { color: T.text }]}>{student.name[0]}</Text></View>
            <View>
              <Text style={[S.name, { color: T.text }]}>{student.name}</Text>
              <Text style={[S.cohort, { color: T.muted }]}>{student.cohort}</Text>
            </View>
          </View>
          <Pressable onPress={onClose} style={S.closeBtn}><Text style={{ color: T.muted, fontSize: 24 }}>✕</Text></Pressable>
        </View>

        {/* Content */}
        <View style={[S.main, { flexDirection: isWide ? 'row' : 'column' }]}>
          {/* Side Nav */}
          <View style={[S.sideNav, { borderRightWidth: isWide ? 1 : 0, borderBottomWidth: isWide ? 0 : 1, borderColor: T.borderLow, flexDirection: isWide ? 'column' : 'row' }]}>
            {['overview', 'burnout risk'].map(tab => (
              <Pressable 
                key={tab} 
                style={[S.navTab, activeTab === tab && { backgroundColor: T.surface2 }, !isWide && { flex: 1, alignItems: 'center' }]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[S.navTabText, { color: activeTab === tab ? T.text : T.muted }]}>{tab.toUpperCase()}</Text>
                {tab === 'burnout risk' && student.risk === 'High' && <View style={[S.alertDot, { backgroundColor: T.red }]} />}
              </Pressable>
            ))}
          </View>

          {/* Tab Content */}
          <ScrollView style={S.contentScroll} contentContainerStyle={{ padding: 24 }}>
            {activeTab === 'overview' ? renderOverview() : renderBurnout()}
          </ScrollView>
        </View>

      </View>
    </View>
  );
};

const S = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 3000 },
  modal: { maxWidth: 1000, borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1 },
  studentHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800' },
  cohort: { fontSize: 14, marginTop: 4 },
  closeBtn: { padding: 8 },

  main: { flex: 1 },
  sideNav: { width: 220 },
  navTab: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  navTabText: { fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  alertDot: { width: 8, height: 8, borderRadius: 4 },

  contentScroll: { flex: 1 },
  tabContent: { gap: 24 },
  
  statsGrid: { flexDirection: 'row', gap: 16 },
  statBox: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
  statVal: { fontSize: 28, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 4 },

  sectionTitle: { fontSize: 18, fontWeight: '800', marginTop: 12 },
  
  mockRadar: { height: 250, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed' },

  timeline: { paddingLeft: 16 },
  timelineItem: { position: 'relative', paddingLeft: 24, paddingBottom: 24 },
  timelineDot: { position: 'absolute', left: -4, top: 2, width: 12, height: 12, borderRadius: 6, zIndex: 2 },
  timelineLine: { position: 'absolute', left: 1, top: 14, bottom: 0, width: 2, zIndex: 1 },
  timelineDate: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  timelineText: { fontSize: 15, lineHeight: 22 },

  burnoutHero: { padding: 32, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  burnoutProb: { fontSize: 48, fontWeight: '900' },
  burnoutLabel: { fontSize: 14, fontWeight: '800', letterSpacing: 1.5, marginTop: 8 },

  metricRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1 },
  
  actionBtn: { padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 16 }
});

export default MentorStudentDetailModal;
