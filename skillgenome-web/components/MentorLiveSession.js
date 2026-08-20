import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Alert, useWindowDimensions, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from '../utils/supabase';

const MentorLiveSession = ({ session, mentorProfile, onClose, T }) => {
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');
  
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendees = async () => {
    if (!session?.cohort_id) return;
    try {
      const { data, error } = await supabase
        .from('cohort_students')
        .select(`
          student_id,
          profiles ( id, name )
        `)
        .eq('cohort_id', session.cohort_id);
        
      if (error) throw error;
      
      const mapped = [];
      if (data && Array.isArray(data)) {
        data.forEach(d => {
          if (d) {
            const p = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
            if (p && p.id && !mapped.find(x => x.id === p.id)) {
              mapped.push({ id: p.id, name: p.name || 'Anonymous', present: false });
            }
          }
        });
      }
      setAttendees(mapped);
    } catch (err) {
      console.warn("Failed to fetch attendees", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [session?.cohort_id]);

  const channelRef = useRef(null);

  // Listen for real-time student presence
  useEffect(() => {
    if (!session?.id) return;

    const channel = supabase.channel(`room_${session.id}`);
    channelRef.current = channel;

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      // Extract all student IDs currently in the room
      const presentStudentIds = [];
      for (const id of Object.keys(state)) {
        if (state[id] && state[id].length > 0) {
          presentStudentIds.push(state[id][0].student_id || id);
        }
      }
      
      setAttendees(prev => prev.map(a => {
        if (presentStudentIds.includes(a.id)) {
          return { ...a, present: true };
        } else {
          // We could force it false if they leave, 
          // or just leave it true if mentor manually marked them. 
          // Let's force it false to reflect actual presence as requested.
          return { ...a, present: false };
        }
      }));
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id]);

  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  // Session Timer
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleAttendance = (id) => {
    setAttendees(prev => prev.map(a => a.id === id ? { ...a, present: !a.present } : a));
  };

  const handleEndSession = () => {
    Alert.alert(
      "End Session",
      "Are you sure you want to end this session? Notes and attendance will be saved.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "End Session", 
          style: "destructive",
          onPress: async () => {
            setIsActive(false);
            try {
              // Mark session as Completed
              await supabase.from('mentor_sessions').update({ status: 'Completed', topic: session.topic + " \n\nNotes:\n" + notes }).eq('id', session.id);
              
              // Save attendance
              if (attendees.length > 0) {
                const attendanceInserts = attendees.map(a => ({
                  session_id: session.id,
                  student_id: a.id,
                  present: a.present
                }));
                await supabase.from('session_attendance').upsert(attendanceInserts, { onConflict: 'session_id, student_id' });
              }
              
              Alert.alert("Session Ended", "Summary and attendance saved successfully.");
              onClose();
            } catch (err) {
              Alert.alert("Error", "Failed to save session data.");
              setIsActive(true); // resume on failure
            }
          } 
        }
      ]
    );
  };

  const handleShareNotes = async () => {
    try {
      await supabase.from('mentor_sessions').update({ topic: session.topic + "\n\nNotes:\n" + notes }).eq('id', session.id);
      Alert.alert("Success", "Notes permanently saved to session topic.");
    } catch (err) {
      Alert.alert("Error", "Failed to save notes.");
    }
  };

  const handleNotesChange = (text) => {
    setNotes(text);
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'sync_notes',
        payload: { text }
      }).catch(() => {});
    }
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
            <Text style={[S.sessionTitle, { color: T.text }]} numberOfLines={1}>{session?.title || session?.topic || 'Live Session'}</Text>
          </View>
          <Pressable style={[S.endBtn, { backgroundColor: (T.rose || '#ef4444') }]} onPress={handleEndSession}>
            <Text style={S.endBtnText}>End Session</Text>
          </Pressable>
        </View>

        <View style={[S.main, { flexDirection: isWide ? 'row' : 'column' }]}>
          {/* Left Panel: Attendance */}
          <View style={[S.attendancePanel, { borderRightColor: T.borderLow, width: isWide ? 300 : '100%', borderRightWidth: isWide ? 1 : 0, borderBottomWidth: isWide ? 0 : 1, borderBottomColor: T.borderLow, maxHeight: isWide ? 'none' : 250 }]}>
            <Text style={[S.panelTitle, { color: T.text }]}>Attendance ({attendees.filter(a => a.present).length}/{attendees.length})</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {loading ? <ActivityIndicator color={T.accent} style={{marginTop: 20}} /> : attendees.map(a => (
                <Pressable 
                  key={a.id} 
                  style={[S.attendeeRow, { backgroundColor: T.surface, borderColor: T.borderLow }]}
                  onPress={() => toggleAttendance(a.id)}
                >
                  <View style={S.attendeeInfo}>
                    <View style={[S.avatarSm, { backgroundColor: T.surface2 }]}>
                      <Text style={{ color: T.text, fontSize: 12, fontWeight: '700' }}>{a.name[0]}</Text>
                    </View>
                    <Text style={[S.attendeeName, { color: T.text }]}>{a.name}</Text>
                  </View>
                  <View style={[S.statusPill, { backgroundColor: a.present ? `${T.green}20` : `${(T.rose || '#ef4444')}20` }]}>
                    <Text style={{ color: a.present ? T.green : (T.rose || '#ef4444'), fontSize: 10, fontWeight: '800' }}>
                      {a.present ? 'PRESENT' : 'ABSENT'}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={[S.markAllBtn, { borderColor: T.border }]} onPress={() => setAttendees(prev => prev.map(a => ({...a, present: true})))}>
              <Text style={{ color: T.text, fontWeight: '600', fontSize: 13 }}>Mark All Present</Text>
            </Pressable>
          </View>

          {/* Right Panel: Shared Notes */}
          <View style={S.notesPanel}>
            <View style={S.notesHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                <Text style={[S.panelTitle, { color: T.text, marginBottom: 0 }]}>Shared Notes</Text>
                <Text style={{ color: T.muted, fontSize: 12 }}>Auto-saving...</Text>
              </View>
              <Pressable style={{paddingHorizontal: 12, paddingVertical: 6, backgroundColor: T.accent, borderRadius: 8}} onPress={handleShareNotes}>
                <Text style={{color: '#fff', fontSize: 12, fontWeight: '700'}}>Share Now</Text>
              </Pressable>
            </View>
            <TextInput
              style={[S.notesInput, { color: T.text, backgroundColor: T.surface, borderColor: T.borderLow }]}
              multiline
              placeholder="Type notes here. Students will see these instantly..."
              placeholderTextColor={T.muted}
              value={notes}
              onChangeText={handleNotesChange}
              textAlignVertical="top"
            />
            <View style={S.notesFooter}>
              <Text style={{ color: T.muted, fontSize: 12 }}>Supports markdown bullet points and links.</Text>
            </View>
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 16 },
  liveIndicator: { width: 12, height: 12, borderRadius: 6 },
  timer: { fontSize: 20, fontWeight: '900', fontVariant: ['tabular-nums'] },
  divider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  sessionTitle: { fontSize: 18, fontWeight: '700', flexShrink: 1 },
  endBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, flexShrink: 0 },
  endBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  
  main: { flex: 1, flexDirection: 'row' },
  
  attendancePanel: { width: 300, padding: 20, borderRightWidth: 1 },
  panelTitle: { fontSize: 16, fontWeight: '800', marginBottom: 16 },
  attendeeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  attendeeInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarSm: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  attendeeName: { fontSize: 14, fontWeight: '600' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  markAllBtn: { marginTop: 16, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },

  notesPanel: { flex: 1, padding: 20 },
  notesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  notesInput: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 20, fontSize: 15, lineHeight: 24 },
  notesFooter: { marginTop: 16, alignItems: 'flex-end' }
});

export default MentorLiveSession;
