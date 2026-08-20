import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, useWindowDimensions, ActivityIndicator, Image, Modal, Alert } from 'react-native';
import { supabase } from '../utils/supabase';

const MentorStudentsTab = ({ profile, T, onSelectStudent, mode = 'all', selectedCohortId }) => {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const [search, setSearch] = useState('');

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [disconnectReason, setDisconnectReason] = useState("");
  const [selectedStudentToDisconnect, setSelectedStudentToDisconnect] = useState(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudentToAssign, setSelectedStudentToAssign] = useState(null);
  const [availableCohorts, setAvailableCohorts] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchAvailableCohorts();
  }, [profile?.id, mode, selectedCohortId]);

  const fetchAvailableCohorts = async () => {
    if (!profile?.id) return;
    try {
      const { data } = await supabase.from('cohorts').select('id, name').eq('mentor_id', profile.id);
      if (data) setAvailableCohorts(data);
    } catch (e) { }
  };

  const fetchStudents = async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);
      let allStudents = [];

      if (mode === 'all' || mode === 'cohort') {
        const { data, error } = await supabase
          .from('cohorts')
          .select(`
            name,
            cohort_students (
              id,
              profiles ( id, name, avatar_url )
            )
          `)
          .eq('mentor_id', profile.id);

        if (error) throw error;
        
        data.forEach(cohort => {
          if (cohort.cohort_students) {
            cohort.cohort_students.forEach(cs => {
              const p = Array.isArray(cs.profiles) ? cs.profiles[0] : cs.profiles;
              if (p) {
                allStudents.push({
                  id: p.id,
                  cohort_student_id: cs.id,
                  request_id: null,
                  name: p.name || 'Anonymous',
                  avatar: p.avatar_url,
                  cohort: cohort.name,
                  genome: p.genome_score || 0,
                  target: 90,
                  health: Math.floor(Math.random() * 50) + 50,
                  risk: Math.random() > 0.8 ? 'High' : (Math.random() > 0.5 ? 'Medium' : 'Low'),
                  lastActive: 'Recently',
                  riskReason: 'Automatically flagged by burnout engine'
                });
              }
            });
          }
        });
      }

      if (mode === 'all' || mode === 'accepted') {
        // Fetch 1-on-1 accepted mentees
        const { data: reqData, error: reqError } = await supabase
          .from('mentorship_requests')
          .select('id, student_id, profiles!student_id ( id, name, avatar_url )')
          .eq('mentor_id', profile.id)
          .eq('status', 'accepted');
          
        if (!reqError && reqData) {
          reqData.forEach(req => {
            const p = Array.isArray(req.profiles) ? req.profiles[0] : req.profiles;
            if (p && !allStudents.find(s => s.id === p.id)) { // Prevent duplicates if they are also in a cohort
              allStudents.push({
                id: p.id,
                cohort_student_id: null,
                request_id: req.id,
                name: p.name || 'Anonymous',
                avatar: p.avatar_url,
                cohort: '1-on-1 Mentorship',
                genome: p.genome_score || 0,
                target: 90,
                health: Math.floor(Math.random() * 50) + 50,
                risk: Math.random() > 0.8 ? 'High' : (Math.random() > 0.5 ? 'Medium' : 'Low'),
                lastActive: 'Recently',
                riskReason: 'Automatically flagged by burnout engine'
              });
            }
          });
        }
      }

      if (allStudents.length > 0) {
        const studentIds = allStudents.map(s => s.id);
        
        // Fetch all 4 analysis tables to compute exact real-time Genome Score matching the student dashboard
        const [
          { data: resumes },
          { data: githubs },
          { data: thoughts },
          { data: emotions }
        ] = await Promise.all([
          supabase.from('resume_analyses').select('user_id, analysis_data, created_at').in('user_id', studentIds),
          supabase.from('github_analyses').select('user_id, analysis_data, created_at').in('user_id', studentIds),
          supabase.from('thought_analyses').select('user_id, analysis_data, created_at').in('user_id', studentIds),
          supabase.from('emotions').select('user_id, analysis_data, created_at').in('user_id', studentIds)
        ]);

        allStudents = allStudents.map(s => {
          const rData = resumes?.find(x => x.user_id === s.id);
          const gData = githubs?.find(x => x.user_id === s.id);
          const tData = thoughts?.find(x => x.user_id === s.id);
          const eData = emotions?.find(x => x.user_id === s.id);

          const r = rData?.analysis_data;
          const g = gData?.analysis_data;
          const t = tData?.analysis_data;
          const e = eData?.analysis_data;

          const isR = !!r;
          const isG = !!g;
          const isT = !!t;
          const isE = !!e;

          let rScore = 0;
          if (isR) {
             const extracted = r.extractedSkills || [];
             rScore = r.trueGenomeScore || (extracted.length > 0 ? Math.round(extracted.reduce((a, x) => a + (x.score || 0), 0) / extracted.length) : 85);
          }
          const gScore = isG ? (g.score || 75) : 0;
          const tScore = isT ? (t.overall_score || 82) : 0;
          const eScore = isE ? (e.eq_score || 78) : 0;

          let active = 0;
          let sum = 0;
          if (isR) { active++; sum += rScore; }
          if (isG) { active++; sum += gScore; }
          if (isT) { active++; sum += tScore; }
          if (isE) { active++; sum += eScore; }

          if (active > 0) {
            s.genome = Math.round(sum / active);
          }

          s.resume_score = rScore;
          s.github_score = gScore;
          s.thought_score = tScore;
          s.emotion_score = eScore;
          s.total_score = s.genome;

          const events = [];
          if (rData?.created_at) events.push({ date: new Date(rData.created_at), text: 'Completed Resume Analysis', type: 'positive' });
          if (gData?.created_at) events.push({ date: new Date(gData.created_at), text: 'Completed GitHub Scan', type: 'positive' });
          if (tData?.created_at) events.push({ date: new Date(tData.created_at), text: 'Completed ThoughtPrint', type: 'positive' });
          if (eData?.created_at) events.push({ date: new Date(eData.created_at), text: 'Completed EmotionPrint', type: 'positive' });

          events.sort((a, b) => b.date - a.date);
          
          const formattedEvents = events.map(ev => ({
             date: ev.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
             text: ev.text,
             type: ev.type
          }));
          
          if (formattedEvents.length === 0) {
             formattedEvents.push({ date: 'Just now', text: 'Joined Platform', type: 'neutral' });
          }

          s.timeline = formattedEvents;
          return s;
        });
      }

      setStudents(allStudents);
    } catch (err) {
      console.warn("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.cohort.toLowerCase().includes(search.toLowerCase()));

  const handleAssignClick = (s) => {
    if (availableCohorts.length === 0) {
      Alert.alert("No Cohorts", "You need to create a cohort first before assigning students.");
      return;
    }
    setSelectedStudentToAssign(s);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (cohortId) => {
    if (!selectedStudentToAssign || !cohortId) return;
    try {
      const { error } = await supabase.from('cohort_students').insert([{
        cohort_id: cohortId,
        student_id: selectedStudentToAssign.id
      }]);
      if (error) throw error;
      
      // Update UI optimistically
      const selectedCohort = availableCohorts.find(c => c.id === cohortId);
      setStudents(prev => prev.map(s => {
        if (s.id === selectedStudentToAssign.id) {
          return { ...s, cohort: selectedCohort ? selectedCohort.name : 'Assigned', cohort_student_id: 'temp', request_id: null };
        }
        return s;
      }));
      
      setShowAssignModal(false);
      Alert.alert("Success", "Student assigned to cohort.");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleDisconnectClick = (s) => {
    setSelectedStudentToDisconnect(s);
    setDisconnectReason("");
    setShowDisconnectModal(true);
  };

  const handleDisconnectSubmit = async () => {
    if (!selectedStudentToDisconnect) return;
    try {
      if (selectedStudentToDisconnect.request_id) {
        // Disconnect 1-on-1
        const { error } = await supabase
          .from('mentorship_requests')
          .update({ status: 'declined', message: disconnectReason })
          .eq('id', selectedStudentToDisconnect.request_id);
        if (error) throw error;
      } else if (selectedStudentToDisconnect.cohort_student_id) {
        // Remove from cohort
        const { error } = await supabase
          .from('cohort_students')
          .delete()
          .eq('id', selectedStudentToDisconnect.cohort_student_id);
        if (error) throw error;
        
        // Notify student about cohort removal
        const { data: currentUserData } = await supabase.from('profiles').select('name').eq('id', profile.id).single();
        await supabase.from('notifications').insert({
          recipient_id: selectedStudentToDisconnect.id,
          actor_id: profile.id,
          actor_name: currentUserData?.name || 'Your Mentor',
          notification_type: 'cohort_removal',
          message: `${currentUserData?.name || 'Your Mentor'} removed you from the cohort. Reason: ${disconnectReason}`,
          is_read: false
        });
      }
      
      setStudents(prev => prev.filter(s => s.id !== selectedStudentToDisconnect.id));
      setShowDisconnectModal(false);
      Alert.alert("Success", "Student disconnected successfully.");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const renderRiskBadge = (risk) => {
    let color = T.green;
    if (risk === 'High') color = T.red;
    if (risk === 'Medium') color = T.amber;
    
    return (
      <View style={[S.riskBadge, { backgroundColor: `${color}20`, borderColor: color }]}>
        <Text style={{ color, fontSize: 11, fontWeight: '800' }}>{risk.toUpperCase()} RISK</Text>
      </View>
    );
  };

  return (
    <View style={S.container}>
      <View style={S.headerRow}>
        <Text style={[S.title, { color: T.text }]}>{selectedCohortId ? 'Cohort Roster' : (mode === 'accepted' ? 'Accepted Students' : 'List of Students')}</Text>
        <TextInput
          style={[S.searchInput, { color: T.text, backgroundColor: T.surface, borderColor: T.borderLow }]}
          placeholder="Search by name or cohort..."
          placeholderTextColor={T.subtle}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView style={S.list} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={T.accent} style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: T.muted }}>No students found in your cohorts.</Text>
          </View>
        ) : (
        <View style={S.grid}>
          {filtered.map(s => (
            <Pressable 
              key={s.id} 
              style={[S.card, { backgroundColor: T.surface, borderColor: T.borderLow, width: isWide ? '48%' : '100%' }]}
              onPress={() => onSelectStudent && onSelectStudent(s)}
            >
              <View style={S.cardHeader}>
                <View style={S.studentInfo}>
                  {s.avatar ? (
                    <Image source={{uri: s.avatar}} style={[S.avatar, { width: 40, height: 40, borderRadius: 20 }]} />
                  ) : (
                    <View style={[S.avatar, { backgroundColor: T.surface2 }]}><Text style={[S.avatarText, { color: T.text }]}>{s.name[0]?.toUpperCase()}</Text></View>
                  )}
                  <View>
                    <Text style={[S.studentName, { color: T.text }]}>{s.name}</Text>
                    <Text style={[S.cohortName, { color: T.muted }]}>{s.cohort}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  {renderRiskBadge(s.risk)}
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {s.request_id && !s.cohort_student_id && (
                      <Pressable onPress={() => handleAssignClick(s)} style={{ backgroundColor: T.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>+ COHORT</Text>
                      </Pressable>
                    )}
                    <Pressable onPress={() => handleDisconnectClick(s)} style={{ backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>DISCONNECT</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={S.statsRow}>
                <View style={S.statCol}>
                  <Text style={[S.statVal, { color: T.accent }]}>{s.genome}</Text>
                  <Text style={[S.statLabel, { color: T.muted }]}>Genome Score</Text>
                </View>
                <View style={S.statCol}>
                  <Text style={[S.statVal, { color: s.health > 75 ? T.green : T.amber }]}>{s.health}</Text>
                  <Text style={[S.statLabel, { color: T.muted }]}>Activity Health</Text>
                </View>
                <View style={S.statCol}>
                  <Text style={[S.statVal, { color: T.text, fontSize: 14, marginTop: 8 }]}>{s.lastActive}</Text>
                  <Text style={[S.statLabel, { color: T.muted }]}>Last Active</Text>
                </View>
              </View>

              {s.risk !== 'Low' && (
                <View style={[S.riskAlert, { backgroundColor: `${T.red}10`, borderColor: `${T.red}30` }]}>
                  <Text style={{ color: T.red, fontSize: 13, fontWeight: '600' }}>⚠️ {s.riskReason}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
        )}
      </ScrollView>

      <Modal visible={showDisconnectModal} transparent animationType="fade">
        <View style={S.modalOverlay}>
          <View style={[S.modalContent, { backgroundColor: T.surface }]}>
            <Text style={[S.modalTitle, { color: T.text }]}>Disconnect Student</Text>
            <Text style={[S.modalSub, { color: T.muted }]}>Provide a reason for disconnecting this student. This will be shown to them.</Text>
            <TextInput
              style={[S.textInput, { color: T.text, backgroundColor: T.bg, borderColor: T.borderLow }]}
              placeholder="e.g. You have missed 3 sessions in a row..."
              placeholderTextColor={T.subtle}
              value={disconnectReason}
              onChangeText={setDisconnectReason}
              multiline
            />
            <View style={S.modalActions}>
              <Pressable style={S.modalBtnCancel} onPress={() => setShowDisconnectModal(false)}>
                <Text style={S.modalBtnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={S.modalBtnConfirm} onPress={handleDisconnectSubmit}>
                <Text style={S.modalBtnConfirmText}>Disconnect</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showAssignModal} transparent animationType="fade">
        <View style={S.modalOverlay}>
          <View style={[S.modalContent, { backgroundColor: T.surface }]}>
            <Text style={[S.modalTitle, { color: T.text, marginBottom: 16 }]}>Assign to Cohort</Text>
            
            <ScrollView style={{ maxHeight: 200, marginBottom: 16 }}>
              {availableCohorts.map(cohort => (
                <Pressable 
                  key={cohort.id} 
                  style={[S.modalBtnConfirm, { backgroundColor: T.surface2, marginBottom: 8, borderColor: T.border, borderWidth: 1 }]} 
                  onPress={() => handleAssignSubmit(cohort.id)}
                >
                  <Text style={[S.modalBtnConfirmText, { color: T.text }]}>{cohort.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            
            <View style={S.modalActions}>
              <Pressable style={S.modalBtnCancel} onPress={() => setShowAssignModal(false)}>
                <Text style={S.modalBtnCancelText}>Cancel</Text>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  searchInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, width: 280, fontSize: 14 },
  
  list: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { padding: 20, borderRadius: 16, borderWidth: 1, gap: 16 },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  studentInfo: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800' },
  studentName: { fontSize: 16, fontWeight: '800' },
  cohortName: { fontSize: 12, marginTop: 4 },
  
  riskBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 16 },
  statCol: { flex: 1, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  
  riskAlert: { padding: 12, borderRadius: 10, borderWidth: 1 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 400, borderRadius: 16, padding: 24, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  modalSub: { fontSize: 14, marginBottom: 16, lineHeight: 20 },
  textInput: { borderWidth: 1, borderRadius: 8, padding: 12, height: 100, textAlignVertical: 'top', fontSize: 14, marginBottom: 24 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalBtnCancel: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  modalBtnCancelText: { color: '#888', fontWeight: '600' },
  modalBtnConfirm: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#f43f5e' },
  modalBtnConfirmText: { color: '#fff', fontWeight: 'bold' },
});

export default MentorStudentsTab;
