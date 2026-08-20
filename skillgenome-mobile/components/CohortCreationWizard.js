import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import { supabase } from '../utils/supabase';

const CohortCreationWizard = ({ visible, onClose, mentorProfile, onCohortCreated, T }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form Data
  const [name, setName] = useState('');
  const [domain, setDomain] = useState(mentorProfile?.domain || 'Software Engineering');
  const [duration, setDuration] = useState(4); // 4, 8, 12 weeks
  const [selectedSkills, setSelectedSkills] = useState([]);
  
  const [suggestedStudents, setSuggestedStudents] = useState([]);
  
  React.useEffect(() => {
    async function fetchStudents() {
      if (!mentorProfile?.id) return;
      
      const { data, error } = await supabase
        .from('mentorship_requests')
        .select(`
          id,
          student_id,
          profiles!student_id (
            id,
            name
          )
        `)
        .eq('mentor_id', mentorProfile.id)
        .eq('status', 'accepted');
        
      if (error || !data || data.length === 0) {
        setSuggestedStudents([]);
        return;
      }
      
      const formatted = data.map(req => {
        const p = Array.isArray(req.profiles) ? req.profiles[0] : req.profiles;
        if (!p) return null;
        return {
          id: p.id,
          name: p.name || 'Anonymous',
          genome: Math.floor(Math.random() * 20) + 70, // Placeholder
          match: Math.floor(Math.random() * 20) + 70 // Placeholder
        };
      }).filter(Boolean);
      
      setSuggestedStudents(formatted);
    }
    if (visible) fetchStudents();
  }, [visible, mentorProfile]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  if (!visible) return null;

  const handleNext = () => {
    if (step === 1 && !name) {
      Alert.alert('Error', 'Please enter a cohort name.');
      return;
    }
    setStep(2);
  };

  const handleToggleStudent = (id) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(prev => prev.filter(sId => sId !== id));
    } else {
      if (selectedStudents.length >= 30) {
        Alert.alert('Limit Reached', 'A cohort can only have up to 30 students.');
        return;
      }
      setSelectedStudents(prev => [...prev, id]);
    }
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      
      // 1. Create Cohort
      const { data: cohortData, error: cohortError } = await supabase
        .from('cohorts')
        .insert({
          mentor_id: mentorProfile.id,
          name: name,
          domain: domain,
          duration_weeks: duration
        })
        .select()
        .single();
        
      if (cohortError) throw cohortError;
      
      // 2. Add Students to cohort_students
      if (selectedStudents.length > 0) {
        const studentInserts = selectedStudents.map(studentId => ({
          cohort_id: cohortData.id,
          student_id: studentId
        }));
        const { error: mapError } = await supabase.from('cohort_students').insert(studentInserts);
        if (mapError) throw mapError;
      }
      Alert.alert('Success', `Cohort "${name}" has been published with ${selectedStudents.length} students!`);
      if (onCohortCreated) onCohortCreated();
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={S.overlay}>
      <View style={[S.modal, { backgroundColor: T.bg, borderColor: T.border }]}>
        
        <View style={S.header}>
          <Text style={[S.title, { color: T.text }]}>Create New Cohort</Text>
          <Pressable onPress={onClose}><Text style={{ color: T.muted, fontSize: 20 }}>✕</Text></Pressable>
        </View>

        <ScrollView style={S.content}>
          {step === 1 && (
            <View style={S.stepContainer}>
              <Text style={[S.stepTitle, { color: T.text }]}>Step 1: Cohort Details</Text>
              
              <Text style={[S.label, { color: T.muted }]}>Cohort Name</Text>
              <TextInput 
                style={[S.input, { color: T.text, borderColor: T.borderLow }]} 
                placeholder="e.g. ML Batch Jan 2026"
                placeholderTextColor={T.subtle}
                value={name}
                onChangeText={setName}
              />
              
              <Text style={[S.label, { color: T.muted, marginTop: 16 }]}>Duration</Text>
              <View style={S.row}>
                {[4, 8, 12].map(w => (
                  <Pressable 
                    key={w} 
                    style={[S.pillBtn, duration === w ? { backgroundColor: T.accent } : { backgroundColor: T.surface2 }]}
                    onPress={() => setDuration(w)}
                  >
                    <Text style={[S.pillText, duration === w ? { color: '#fff' } : { color: T.text }]}>{w} Weeks</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[S.label, { color: T.muted, marginTop: 16 }]}>Domain / Focus</Text>
              <TextInput 
                style={[S.input, { color: T.text, borderColor: T.borderLow }]} 
                value={domain}
                onChangeText={setDomain}
              />
            </View>
          )}

          {step === 2 && (
            <View style={S.stepContainer}>
              <Text style={[S.stepTitle, { color: T.text }]}>Step 2: Student Assignment</Text>
              <Text style={[S.subText, { color: T.muted }]}>Selected: {selectedStudents.length} / 30 max</Text>

              <View style={S.list}>
                {suggestedStudents.map(student => (
                  <Pressable 
                    key={student.id} 
                    style={[S.studentCard, { borderColor: selectedStudents.includes(student.id) ? T.accent : T.borderLow, backgroundColor: T.surface }]}
                    onPress={() => handleToggleStudent(student.id)}
                  >
                    <View style={S.studentInfo}>
                      <Text style={[S.studentName, { color: T.text }]}>{student.name}</Text>
                      <Text style={[S.studentStats, { color: T.muted }]}>Genome: {student.genome} · Match: {student.match}%</Text>
                    </View>
                    <View style={[S.checkbox, selectedStudents.includes(student.id) && { backgroundColor: T.accent, borderColor: T.accent }]}>
                      {selectedStudents.includes(student.id) && <Text style={S.checkMark}>✓</Text>}
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={S.footer}>
          {step === 2 && (
            <Pressable style={[S.actionBtn, { backgroundColor: T.surface2 }]} onPress={() => setStep(1)}>
              <Text style={[S.actionText, { color: T.text }]}>Back</Text>
            </Pressable>
          )}
          {step === 1 ? (
            <Pressable style={[S.actionBtn, { backgroundColor: T.accent }]} onPress={handleNext}>
              <Text style={[S.actionText, { color: '#fff' }]}>Next: Assign Students</Text>
            </Pressable>
          ) : (
            <Pressable style={[S.actionBtn, { backgroundColor: T.accent }]} onPress={handlePublish} disabled={loading}>
              <Text style={[S.actionText, { color: '#fff' }]}>{loading ? 'Publishing...' : 'Publish Cohort'}</Text>
            </Pressable>
          )}
        </View>

      </View>
    </View>
  );
};

const S = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)'
  },
  title: { fontSize: 20, fontWeight: '800' },
  content: { padding: 24 },
  stepContainer: { gap: 8 },
  stepTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  subText: { fontSize: 13, marginBottom: 16 },
  
  label: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  
  row: { flexDirection: 'row', gap: 10 },
  pillBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20 },
  pillText: { fontSize: 14, fontWeight: '600' },

  list: { gap: 10 },
  studentCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1 },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: '700' },
  studentStats: { fontSize: 13, marginTop: 4 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: '#fff', fontSize: 14, fontWeight: '800' },

  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)'
  },
  actionBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  actionText: { fontSize: 15, fontWeight: '700' }
});

export default CohortCreationWizard;
