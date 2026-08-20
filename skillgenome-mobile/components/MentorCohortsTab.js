import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../utils/supabase';
import CohortRosterModal from './CohortRosterModal';
import CohortReportsModal from './CohortReportsModal';

const MentorCohortsTab = ({ profile, T, onCreateCohort }) => {
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [priority, setPriority] = useState('Normal');

  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeRosterCohortId, setActiveRosterCohortId] = useState(null);
  const [activeReportsCohortId, setActiveReportsCohortId] = useState(null);

  useEffect(() => {
    fetchCohorts();
  }, [profile?.id]);

  const fetchCohorts = async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);
      // Fetch cohorts and their students
      const { data, error } = await supabase
        .from('cohorts')
        .select(`
          *,
          cohort_students ( id )
        `)
        .eq('mentor_id', profile.id);

      if (error) throw error;
      
      const mapped = data.map(c => ({
        id: c.id,
        name: c.name,
        students: c.cohort_students ? c.cohort_students.length : 0,
        health: Math.floor(Math.random() * 30) + 70, // Mocked health for MVP
        nextSession: 'TBD'
      }));
      setCohorts(mapped);
    } catch (err) {
      console.warn("Error fetching cohorts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = () => {
    if (!broadcastMessage.trim()) return Alert.alert('Error', 'Message cannot be empty');
    Alert.alert(
      'Broadcast Sent',
      `Your ${priority} priority announcement has been sent to all cohorts.`,
      [{ text: 'OK', onPress: () => { setShowBroadcast(false); setBroadcastMessage(''); } }]
    );
  };

  const handleDeleteCohort = (cohortId, cohortName) => {
    Alert.alert(
      "Disband Cohort",
      `Are you sure you want to permanently delete the cohort "${cohortName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Disband", 
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase.from('cohorts').delete().eq('id', cohortId);
              if (error) throw error;
              setCohorts(prev => prev.filter(c => c.id !== cohortId));
              Alert.alert("Success", "Cohort has been disbanded.");
            } catch (err) {
              Alert.alert("Error", "Failed to delete cohort.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={S.container}>
      <View style={S.headerRow}>
        <Text style={[S.title, { color: T.text }]}>My Cohorts</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable style={[S.broadcastBtn, { backgroundColor: T.accent }]} onPress={() => setShowBroadcast(true)}>
            <Text style={S.broadcastBtnText}>📢 Broadcast Announcement</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={S.list} showsVerticalScrollIndicator={false}>
        {onCreateCohort && (
          <Pressable 
            style={[S.createCard, { borderColor: T.cyan, backgroundColor: `${T.cyan}10` }]}
            onPress={onCreateCohort}
          >
            <Text style={[S.createCardIcon, { color: T.cyan }]}>+</Text>
            <Text style={[S.createCardText, { color: T.cyan }]}>Create New Cohort</Text>
          </Pressable>
        )}

        {loading ? (
          <ActivityIndicator size="large" color={T.accent} style={{ marginTop: 40 }} />
        ) : cohorts.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: T.muted }}>No cohorts found.</Text>
          </View>
        ) : (
          cohorts.map(c => (
          <Pressable 
            key={c.id} 
            style={[S.card, { backgroundColor: T.surface, borderColor: T.borderLow }]}
            onPress={() => setActiveRosterCohortId(c.id)}
          >
            <View style={S.cardHeader}>
              <Text style={[S.cardTitle, { color: T.text }]}>{c.name}</Text>
              <View style={[S.healthBadge, { backgroundColor: c.health >= 80 ? `${T.green}20` : `${T.amber}20` }]}>
                <Text style={{ color: c.health >= 80 ? T.green : T.amber, fontWeight: '800', fontSize: 12 }}>
                  Health: {c.health}/100
                </Text>
              </View>
            </View>
            
            <View style={S.cardBody}>
              <Text style={{ color: T.muted }}>👥 {c.students} Students</Text>
              <Text style={{ color: T.muted }}>📅 Next Session: {c.nextSession}</Text>
            </View>
            
            <View style={[S.cardFooter, { borderTopColor: 'rgba(255,255,255,0.1)' }]}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable style={[S.actionBtn, { borderColor: T.border }]} onPress={() => setActiveRosterCohortId(c.id)}>
                  <Text style={{ color: T.text, fontWeight: '600' }}>View Roster</Text>
                </Pressable>
                <Pressable style={[S.actionBtn, { borderColor: T.border }]} onPress={() => setActiveReportsCohortId(c.id)}>
                  <Text style={{ color: T.text, fontWeight: '600' }}>View Reports</Text>
                </Pressable>
              </View>
              <Pressable style={[S.actionBtn, { borderColor: T.border, backgroundColor: `${T.rose || '#ef4444'}15` }]} onPress={() => handleDeleteCohort(c.id, c.name)}>
                <Text style={{ color: T.rose || '#ef4444', fontWeight: '700' }}>Disband</Text>
              </Pressable>
            </View>
          </Pressable>
        )))}
      </ScrollView>

      {showBroadcast && (
        <View style={S.modalOverlay}>
          <View style={[S.modal, { backgroundColor: T.bg, borderColor: T.border }]}>
            <Text style={[S.modalTitle, { color: T.text }]}>New Announcement</Text>
            <Text style={[S.modalSub, { color: T.muted }]}>This will push a notification to all students in your active cohorts.</Text>
            
            <Text style={[S.label, { color: T.text, marginTop: 16 }]}>Priority</Text>
            <View style={S.priorityRow}>
              {['Normal', 'Important', 'Urgent'].map(p => (
                <Pressable 
                  key={p} 
                  style={[S.priorityBtn, priority === p ? { backgroundColor: T.accent } : { backgroundColor: T.surface2 }]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={{ color: priority === p ? '#fff' : T.text, fontWeight: '600', fontSize: 12 }}>{p}</Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={[S.input, { color: T.text, borderColor: T.borderLow, backgroundColor: T.surface }]}
              multiline
              numberOfLines={4}
              placeholder="Type your announcement here..."
              placeholderTextColor={T.subtle}
              value={broadcastMessage}
              onChangeText={setBroadcastMessage}
              textAlignVertical="top"
            />
            
            <View style={S.modalActions}>
              <Pressable style={{ padding: 12 }} onPress={() => setShowBroadcast(false)}>
                <Text style={{ color: T.text }}>Cancel</Text>
              </Pressable>
              <Pressable style={[S.sendBtn, { backgroundColor: T.accent }]} onPress={handleBroadcast}>
                <Text style={S.sendBtnText}>Send Now</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
      {/* Modals */}
      <CohortRosterModal 
        visible={!!activeRosterCohortId} 
        onClose={() => setActiveRosterCohortId(null)} 
        cohortId={activeRosterCohortId} 
        T={T} 
      />
      
      <CohortReportsModal 
        visible={!!activeReportsCohortId} 
        onClose={() => setActiveReportsCohortId(null)} 
        cohortId={activeReportsCohortId} 
        T={T} 
      />
    </View>
  );
};

const S = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  broadcastBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  broadcastBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  createBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  createBtnText: { color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 22 },
  
  createCard: { padding: 30, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', marginBottom: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 12 },
  createCardIcon: { fontSize: 32, fontWeight: '400', lineHeight: 36 },
  createCardText: { fontSize: 20, fontWeight: '700' },
  
  list: { flex: 1 },
  card: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 },
  cardTitle: { fontSize: 18, fontWeight: '800' },
  healthBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  cardBody: { gap: 8, marginBottom: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', paddingTop: 16, borderTopWidth: 1 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },

  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modal: { width: '90%', maxWidth: 500, padding: 24, borderRadius: 24, borderWidth: 1 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalSub: { fontSize: 13, marginTop: 4 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  
  priorityRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  priorityBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  
  input: { borderWidth: 1, borderRadius: 16, padding: 16, minHeight: 120, fontSize: 15 },
  
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 24 },
  sendBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  sendBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 }
});

export default MentorCohortsTab;
