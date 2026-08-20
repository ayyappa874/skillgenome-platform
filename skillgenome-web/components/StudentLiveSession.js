import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert, ActivityIndicator, useWindowDimensions, Platform } from 'react-native';
import { supabase } from '../utils/supabase';

const StudentLiveSession = ({ session, T, onClose, studentId }) => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [timer, setTimer] = useState(0);

  // Poll for notes and attendance updates since we're the student
  useEffect(() => {
    let pollInterval = null;
    
    const fetchSessionData = async () => {
      try {
        const { data: sessionData } = await supabase
          .from('mentor_sessions')
          .select('topic, status')
          .eq('id', session.id)
          .single();
          
        if (sessionData && sessionData.topic) {
          // If the mentor ends the session, they append notes to topic. We can extract it or just show it.
          const notesMatch = sessionData.topic.split('\n\nNotes:\n');
          if (notesMatch.length > 1) {
            setNotes(notesMatch[1]);
          }
        }
        
        if (sessionData && sessionData.status === 'Completed') {
          Alert.alert("Session Ended", "The mentor has ended this live session.");
          onClose();
        }
      } catch (e) {}
    };

    const fetchAttendees = async () => {
      try {
        const { data: students, error: cohortErr } = await supabase
          .from('cohort_students')
          .select('student_id, profiles!student_id(name)')
          .eq('cohort_id', session.cohort_id);
          
        if (!cohortErr && students && Array.isArray(students)) {
          const uniqueStudents = [];
          students.forEach(s => {
            if (s && s.student_id && !uniqueStudents.find(x => x.id === s.student_id)) {
              const profileName = Array.isArray(s.profiles) 
                ? (s.profiles[0]?.name) 
                : (s.profiles?.name);
              
              uniqueStudents.push({
                id: s.student_id,
                name: profileName || 'Unknown',
                present: false
              });
            }
          });
          setAttendees(uniqueStudents);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
    fetchAttendees();
    
    // Poll every 10 seconds for session end / notes
    pollInterval = setInterval(fetchSessionData, 10000);
    
    return () => clearInterval(pollInterval);
  }, [session?.id, session?.cohort_id]);

  // Broadcast presence
  useEffect(() => {
    if (!session?.id || !studentId) return;

    const channel = supabase.channel(`room_${session.id}`, {
      config: {
        presence: {
          key: studentId,
        },
      },
    });

    channel.on('broadcast', { event: 'sync_notes' }, (payload) => {
      if (payload?.payload?.text !== undefined) {
        setNotes(payload.payload.text);
      }
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          student_id: studentId,
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id, studentId]);

  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  // Session Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(timer => timer + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <View style={[S.overlay, { zIndex: 9999, elevation: 999 }]}>
      <View style={[S.container, { backgroundColor: T.bg }]}>
        
        {/* Top Header */}
        <View style={[S.header, { borderBottomColor: T.borderLow, backgroundColor: T.surface }]}>
          <View style={S.headerLeft}>
            <View style={[S.liveIndicator, { backgroundColor: (T.rose || '#ef4444') }]} />
            <Text style={[S.timer, { color: T.text }]}>{formatTime(timer)}</Text>
            <View style={S.divider} />
            <Text style={[S.sessionTitle, { color: T.text }]}>{session?.title || session?.topic || 'Live Session'}</Text>
          </View>
          <Pressable style={[S.endBtn, { backgroundColor: T.surface2, borderWidth: 1, borderColor: T.borderLow }]} onPress={onClose}>
            <Text style={[S.endBtnText, { color: T.text }]}>Leave Room</Text>
          </Pressable>
        </View>

        <View style={[S.main, { flexDirection: isWide ? 'row' : 'column' }]}>
          {/* Left Panel: Classmates */}
          <View style={[S.attendancePanel, { borderRightColor: T.borderLow, width: isWide ? 300 : '100%', borderRightWidth: isWide ? 1 : 0, borderBottomWidth: isWide ? 0 : 1, borderBottomColor: T.borderLow, maxHeight: isWide ? 'none' : 250 }]}>
            <Text style={[S.panelTitle, { color: T.text }]}>Classmates ({attendees.length})</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {loading ? <ActivityIndicator color={T.primary} style={{marginTop: 20}} /> : attendees.map(a => (
                <View 
                  key={a.id} 
                  style={[S.attendeeRow, { backgroundColor: T.surface, borderColor: T.borderLow }]}
                >
                  <View style={S.attendeeInfo}>
                    <View style={[S.avatarSm, { backgroundColor: a.id === studentId ? T.primary : T.surface2 }]}>
                      <Text style={{ color: a.id === studentId ? '#fff' : T.text, fontSize: 12, fontWeight: '700' }}>{(a.name && a.name.length > 0) ? a.name[0] : 'U'}</Text>
                    </View>
                    <Text style={[S.attendeeName, { color: T.text }]}>{a.name} {a.id === studentId ? '(You)' : ''}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Right Panel: Shared Notes */}
          <View style={S.notesPanel}>
            <View style={S.notesHeader}>
              <Text style={[S.panelTitle, { color: T.text }]}>Mentor's Shared Notes</Text>
              <Text style={{ color: T.muted, fontSize: 12 }}>View-only</Text>
            </View>
            <TextInput
              style={[S.notesInput, { color: T.text, backgroundColor: T.surface, borderColor: T.borderLow }]}
              multiline
              editable={false}
              placeholder="Waiting for mentor to share notes..."
              placeholderTextColor={T.muted}
              value={notes}
              textAlignVertical="top"
            />
          </View>
        </View>

      </View>
    </View>
  );
};

const S = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  },
  container: {
    width: '95%',
    height: '90%',
    maxWidth: 1200,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  liveIndicator: { width: 12, height: 12, borderRadius: 6 },
  timer: { fontSize: 20, fontWeight: '900', fontVariant: ['tabular-nums'] },
  divider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  sessionTitle: { fontSize: 18, fontWeight: '700' },
  endBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  endBtnText: { fontWeight: '800', fontSize: 14 },
  
  main: { flex: 1, flexDirection: 'row' },
  
  attendancePanel: { width: 300, padding: 20, borderRightWidth: 1 },
  panelTitle: { fontSize: 16, fontWeight: '800', marginBottom: 16 },
  attendeeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  attendeeInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarSm: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  attendeeName: { fontSize: 14, fontWeight: '600' },

  notesPanel: { flex: 1, padding: 20 },
  notesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  notesInput: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 20, fontSize: 15, lineHeight: 24 },
});

export default StudentLiveSession;
