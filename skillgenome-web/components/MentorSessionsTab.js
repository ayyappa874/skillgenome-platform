import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { supabase } from '../utils/supabase';


const MentorSessionsTab = ({ profile, T, onJoinLive }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Creation Modal State
  const [showCreate, setShowCreate] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [selectedCohortId, setSelectedCohortId] = useState('');
  const [mentorCohorts, setMentorCohorts] = useState([]);
  const [recommended, setRecommended] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      // First get cohorts
      const { data: cohortsData, error: cohortsError } = await supabase
        .from('cohorts')
        .select('id, name')
        .eq('mentor_id', profile.id);
        
      if (cohortsError) throw cohortsError;
      setMentorCohorts(cohortsData || []);
      
      if (cohortsData && cohortsData.length > 0) {
        if (!selectedCohortId) setSelectedCohortId(cohortsData[0].id);
        const cohortIds = cohortsData.map(c => c.id);
        const { data, error } = await supabase
          .from('mentor_sessions')
          .select('*, cohorts(name)')
          .in('cohort_id', cohortIds)
          .order('scheduled_for', { ascending: true });
          
        if (error) throw error;
        setSessions(data || []);
      }
    } catch (err) {
      console.warn("Error fetching sessions", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendation = async (cohortId) => {
    try {
      const { data, error } = await supabase
        .from('cohorts')
        .select(`
          cohort_students ( profiles ( id ) )
        `)
        .eq('id', cohortId)
        .single();
        
      if (error || !data) return;
      
      const studentIds = [];
      if (data.cohort_students) {
        data.cohort_students.forEach(cs => {
          const p = Array.isArray(cs.profiles) ? cs.profiles[0] : cs.profiles;
          if (p) studentIds.push(p.id);
        });
      }

      if (studentIds.length === 0) {
        setRecommended(null);
        return;
      }

      const [resRes, gitRes, thoughtRes, emoRes] = await Promise.all([
        supabase.from('resume_analyses').select('user_id, analysis_data').in('user_id', studentIds),
        supabase.from('github_analyses').select('user_id, analysis_data').in('user_id', studentIds),
        supabase.from('thought_analyses').select('user_id, analysis_data').in('user_id', studentIds),
        supabase.from('emotions').select('user_id, analysis_data').in('user_id', studentIds)
      ]);

      const sum = { resume: 0, github: 0, thought: 0, emotion: 0 };
      const count = { resume: 0, github: 0, thought: 0, emotion: 0 };

      if (resRes.data) resRes.data.forEach(d => { 
        const r = d.analysis_data;
        if (r) {
          const extracted = r.extractedSkills || [];
          const rScore = r.trueGenomeScore || (extracted.length > 0 ? Math.round(extracted.reduce((a, x) => a + (x.score || 0), 0) / extracted.length) : 85);
          sum.resume += rScore; count.resume++; 
        }
      });
      if (gitRes.data) gitRes.data.forEach(d => { if (d.analysis_data?.score) { sum.github += d.analysis_data.score; count.github++; }});
      if (thoughtRes.data) thoughtRes.data.forEach(d => { if (d.analysis_data?.overall_score) { sum.thought += d.analysis_data.overall_score; count.thought++; }});
      if (emoRes.data) emoRes.data.forEach(d => { if (d.analysis_data?.eq_score) { sum.emotion += d.analysis_data.eq_score; count.emotion++; }});

      const avgResume = count.resume > 0 ? Math.round(sum.resume / count.resume) : 0;
      const avgGithub = count.github > 0 ? Math.round(sum.github / count.github) : 0;
      const avgThought = count.thought > 0 ? Math.round(sum.thought / count.thought) : 0;
      const avgEmotion = count.emotion > 0 ? Math.round(sum.emotion / count.emotion) : 0;

      const gaps = [
        { skill: 'Resume & Experience', gap: Math.max(0, 85 - avgResume), avg: avgResume },
        { skill: 'Code Contribution', gap: Math.max(0, 80 - avgGithub), avg: avgGithub },
        { skill: 'Thought Process', gap: Math.max(0, 80 - avgThought), avg: avgThought },
        { skill: 'Emotional Intelligence', gap: Math.max(0, 85 - avgEmotion), avg: avgEmotion }
      ].filter(g => g.avg > 0);

      if (gaps.length > 0) {
        const biggestGap = [...gaps].sort((a,b) => b.gap - a.gap)[0];
        setRecommended({
          title: biggestGap.skill,
          reason: `${studentIds.length} ${studentIds.length === 1 ? 'student has' : 'students have'} a ${biggestGap.gap}% average gap below target in ${biggestGap.skill}. Strongly recommended.`
        });
      } else {
        setRecommended(null);
      }
    } catch (err) {
      console.warn("Error fetching recommendation", err);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchSessions();
    }
  }, [profile?.id]);

  useEffect(() => {
    if (selectedCohortId) {
      fetchRecommendation(selectedCohortId);
    }
  }, [selectedCohortId]);

  const handleDeleteSession = async (sessionId) => {
    Alert.alert("Delete Session", "Are you sure you want to delete this session?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            const { error } = await supabase.from('mentor_sessions').delete().eq('id', sessionId);
            if (error) throw error;
            fetchSessions();
          } catch (err) {
            Alert.alert("Error", err.message);
          }
      }}
    ]);
  };

  const handleCreateSession = async () => {
    if (!newTopic) return Alert.alert('Error', 'Please enter a topic');
    if (!selectedCohortId) return Alert.alert('Error', 'Please select a cohort');
    
    try {
      const { error } = await supabase
        .from('mentor_sessions')
        .insert({
          cohort_id: selectedCohortId,
          topic: newTopic,
          status: 'Scheduled',
          scheduled_for: new Date(Date.now() + 86400000).toISOString() 
        });
        
      if (error) throw error;
      Alert.alert('Success', 'Session Scheduled!');
      setShowCreate(false);
      setNewTopic('');
      fetchSessions();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={S.container}>
      <View style={S.headerRow}>
        <Text style={[S.title, { color: T.text }]}>Schedule & Sessions</Text>
        <Pressable style={[S.createBtn, { backgroundColor: T.accent }]} onPress={() => setShowCreate(true)}>
          <Text style={S.createBtnText}>+ New Session</Text>
        </Pressable>
      </View>

      <ScrollView style={S.list} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={{ color: T.muted }}>Loading sessions...</Text>
        ) : sessions.length === 0 ? (
          <View style={[S.emptyState, { backgroundColor: T.surface2, borderColor: T.borderLow }]}>
            <Text style={{ color: T.muted }}>No sessions scheduled yet.</Text>
          </View>
        ) : (
          sessions.map(s => (
            <View key={s.id} style={[S.card, { backgroundColor: T.surface, borderColor: T.borderLow }]}>
              <View style={S.cardHeader}>
                <View>
                  <Text style={[S.cardTitle, { color: T.text }]}>{s.topic}</Text>
                  <Text style={[S.cardTopic, { color: T.muted }]}>Cohort: {s.cohorts?.name || 'Unknown'}</Text>
                </View>
                <View style={[S.statusBadge, { backgroundColor: `${T.accent}20` }]}>
                  <Text style={[S.statusText, { color: T.accent }]}>{s.status.toUpperCase()}</Text>
                </View>
              </View>
              <View style={S.cardFooter}>
                <Text style={{ color: T.muted, fontSize: 13 }}>📅 {new Date(s.scheduled_for).toLocaleString()}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable style={[S.joinBtn, { backgroundColor: T.surface2, borderColor: T.border }]} onPress={() => handleDeleteSession(s.id)}>
                    <Text style={{ color: T.red, fontWeight: '700', fontSize: 13 }}>Delete</Text>
                  </Pressable>
                  {s.status === 'Scheduled' && (
                    <Pressable style={[S.joinBtn, { backgroundColor: T.surface2, borderColor: T.border }]} onPress={() => onJoinLive && onJoinLive(s)}>
                      <Text style={{ color: T.text, fontWeight: '700', fontSize: 13 }}>Enter Live Room</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Basic Create Modal Inline for now */}
      <Modal visible={showCreate} transparent animationType="fade">
        <View style={S.modalOverlay}>
          <View style={[S.modal, { backgroundColor: T.bg, borderColor: T.border }]}>
            <Text style={[S.modalTitle, { color: T.text }]}>Schedule Session</Text>
            
            {recommended && (
              <Pressable 
                style={[S.recommendationBox, { backgroundColor: `${T.accent}10`, borderColor: T.accent }]}
                onPress={() => {
                  setNewTopic(recommended.title);
                }}
              >
                <Text style={[S.recLabel, { color: T.accent }]}>✨ RECOMMENDED TOPIC</Text>
                <Text style={[S.recTitle, { color: T.text }]}>{recommended.title}</Text>
                <Text style={[S.recReason, { color: T.muted }]}>{recommended.reason}</Text>
                <Text style={[S.recAction, { color: T.accent }]}>Tap to use this topic</Text>
              </Pressable>
            )}

            <View style={{ gap: 8, marginBottom: 16 }}>
              {mentorCohorts.map(c => (
                <Pressable 
                  key={c.id} 
                  style={[S.cohortSelect, selectedCohortId === c.id ? { borderColor: T.accent, backgroundColor: `${T.accent}10` } : { borderColor: T.borderLow, backgroundColor: T.surface2 }]}
                  onPress={() => setSelectedCohortId(c.id)}
                >
                  <Text style={{ color: selectedCohortId === c.id ? T.accent : T.text, fontWeight: '600' }}>{c.name}</Text>
                </Pressable>
              ))}
            </View>

            <TextInput 
              style={[S.input, { color: T.text, borderColor: T.borderLow }]}
              placeholder="Session Topic"
              placeholderTextColor={T.subtle}
              value={newTopic}
              onChangeText={setNewTopic}
            />
            
            <View style={S.modalActions}>
              <Pressable style={{ padding: 12 }} onPress={() => setShowCreate(false)}>
                <Text style={{ color: T.text }}>Cancel</Text>
              </Pressable>
              <Pressable style={[S.createBtn, { backgroundColor: T.accent }]} onPress={handleCreateSession}>
                <Text style={S.createBtnText}>Schedule</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const S = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  createBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  
  list: { flex: 1 },
  emptyState: { padding: 40, alignItems: 'center', borderRadius: 16, borderWidth: 1, borderStyle: 'dashed' },
  
  card: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16, gap: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardTopic: { fontSize: 13, marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '800' },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 16 },
  joinBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },

  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modal: { width: '90%', maxWidth: 400, padding: 24, borderRadius: 20, borderWidth: 1, gap: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  cohortSelect: { padding: 12, borderRadius: 10, borderWidth: 1 },
  input: { borderWidth: 1, padding: 14, borderRadius: 12, fontSize: 15 },
  
  recommendationBox: { padding: 16, borderRadius: 12, borderWidth: 1, gap: 6 },
  recLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  recTitle: { fontSize: 15, fontWeight: '800' },
  recReason: { fontSize: 12, lineHeight: 18 },
  recAction: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 8 }
});

export default MentorSessionsTab;
