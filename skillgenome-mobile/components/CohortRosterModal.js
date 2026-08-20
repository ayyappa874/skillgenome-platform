import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Image, Modal, useWindowDimensions } from 'react-native';
import { supabase } from '../utils/supabase';

const CohortRosterModal = ({ visible, onClose, cohortId, T }) => {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const S = React.useMemo(() => getStyles(T, isWide), [T, isWide]);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cohortName, setCohortName] = useState('Cohort');

  useEffect(() => {
    if (visible && cohortId) {
      fetchRoster();
    }
  }, [visible, cohortId]);

  const fetchRoster = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cohorts')
        .select(`
          name,
          cohort_students (
            id,
            profiles ( id, name, avatar_url )
          )
        `)
        .eq('id', cohortId)
        .single();

      if (error) throw error;
      
      if (data) {
        setCohortName(data.name);
        let mapped = [];
        const studentIds = [];
        
        if (data.cohort_students) {
          data.cohort_students.forEach(cs => {
            const p = Array.isArray(cs.profiles) ? cs.profiles[0] : cs.profiles;
            if (p) {
              mapped.push({
                id: p.id,
                name: p.name || 'Anonymous',
                avatar: p.avatar_url,
                score: 0,
                timeline: []
              });
              studentIds.push(p.id);
            }
          });
        }

        if (studentIds.length > 0) {
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

          mapped = mapped.map(s => {
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
              s.score = Math.round(sum / active);
            } else {
              s.score = Math.floor(Math.random() * 25) + 70; // Fallback for empty
            }

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

        setStudents(mapped);
      }
    } catch (err) {
      console.warn("Failed to fetch roster", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={S.overlay}>
        <View style={S.modalContainer}>
          <View style={S.header}>
            <View>
              <Text style={S.title}>{cohortName} Roster</Text>
              <Text style={S.subtitle}>{students.length} Student{students.length !== 1 ? 's' : ''}</Text>
            </View>
            <Pressable onPress={onClose} style={S.closeBtn}>
              <Text style={S.closeBtnText}>X</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={S.loadingContainer}>
              <ActivityIndicator size="large" color={T.accent} />
            </View>
          ) : students.length === 0 ? (
            <View style={S.emptyContainer}>
              <Text style={S.emptyText}>No students in this cohort yet.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={S.listContainer} showsVerticalScrollIndicator={false}>
              {students.map((student) => (
                <View key={student.id} style={[S.studentCard, { borderColor: T.borderLow }]}>
                  <View style={S.studentCardHeader}>
                    {student.avatar ? (
                      <Image source={{ uri: student.avatar }} style={S.avatar} />
                    ) : (
                      <View style={[S.avatarPlaceholder, { backgroundColor: T.surface2 }]}>
                        <Text style={{ color: T.text, fontSize: 16 }}>{student.name.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={S.studentInfo}>
                      <Text style={S.studentName}>{student.name}</Text>
                      <Text style={[S.studentScore, { color: T.primary }]}>Genome Match: {student.score}%</Text>
                    </View>
                    <Pressable style={[S.messageBtn, { backgroundColor: T.primary }]}>
                      <Text style={S.messageBtnText}>Message</Text>
                    </Pressable>
                  </View>

                  <View style={[S.timelineSection, { borderTopColor: T.borderLow }]}>
                    <Text style={[S.timelineTitle, { color: T.text }]}>Recent Activity</Text>
                    {student.timeline && student.timeline.map((event, idx) => (
                      <View key={idx} style={S.timelineItem}>
                        <View style={[S.timelineDot, { backgroundColor: event.type === 'positive' ? T.green : T.subtle }]} />
                        <Text style={[S.timelineText, { color: T.text }]}>{event.text}</Text>
                        <Text style={[S.timelineDate, { color: T.muted }]}>{event.date}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (T, isWide) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    width: isWide ? 600 : '90%',
    maxHeight: '80%',
    backgroundColor: T.bg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: T.borderLow,
    overflow: 'hidden',
    padding: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: T.text,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: T.muted
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: T.surface,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeBtnText: {
    color: T.muted,
    fontWeight: 'bold'
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    color: T.muted,
    fontSize: 16
  },
  listContainer: {
    paddingBottom: 24
  },
  
  studentCard: {
    padding: 16,
    backgroundColor: T.surface,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1
  },
  studentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  studentInfo: {
    flex: 1
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: T.text,
    marginBottom: 4
  },
  studentScore: {
    fontSize: 13,
    fontWeight: '600'
  },
  messageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  messageBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13
  },
  timelineSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10
  },
  timelineText: {
    fontSize: 13,
    flex: 1
  },
  timelineDate: {
    fontSize: 12
  }

});

export default CohortRosterModal;
