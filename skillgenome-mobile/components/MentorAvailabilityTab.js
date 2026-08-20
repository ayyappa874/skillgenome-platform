import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions, ActivityIndicator, Modal, Alert } from 'react-native';
import { supabase } from '../utils/supabase';

const MentorAvailabilityTab = ({ profile, T }) => {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const [slots, setSlots] = useState({
    'Mon': [{ time: '10:00:00', active: true }, { time: '14:00:00', active: false }],
    'Tue': [{ time: '16:00:00', active: true }, { time: '17:00:00', active: true }],
    'Wed': [{ time: '10:00:00', active: false }, { time: '11:00:00', active: false }],
    'Thu': [{ time: '14:00:00', active: true }],
    'Fri': [{ time: '09:00:00', active: true }, { time: '13:00:00', active: true }]
  });
  const [loadingSlots, setLoadingSlots] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSlotDay, setNewSlotDay] = useState('Mon');
  const [newSlotTime, setNewSlotTime] = useState('09:00:00');
  const [isSavingSlot, setIsSavingSlot] = useState(false);
  const PRESET_TIMES = ['09:00:00', '10:00:00', '11:00:00', '12:00:00', '13:00:00', '14:00:00', '15:00:00', '16:00:00', '17:00:00', '18:00:00'];

  useEffect(() => {
    if (!profile?.id) return;
    const fetchBookings = async () => {
      try {
        setLoadingBookings(true);
        const { data, error } = await supabase
          .from('mentor_bookings')
          .select('id, topic, status, scheduled_for, profiles!student_id(name)')
          .eq('mentor_id', profile.id)
          .order('scheduled_for', { ascending: true });
        
        if (error) throw error;
        setBookings(data || []);
      } catch (err) {
        console.warn('Error fetching bookings:', err);
      } finally {
        setLoadingBookings(false);
      }
    };

    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);
        const { data, error } = await supabase
          .from('mentor_availability')
          .select('*')
          .eq('mentor_id', profile.id);
          
        if (error) throw error;
        
        const newSlots = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [] };
        if (data && data.length > 0) {
          data.forEach(s => {
            if (newSlots[s.day_of_week]) {
              newSlots[s.day_of_week].push({ id: s.id, time: s.start_time, active: s.is_active });
            }
          });
          Object.keys(newSlots).forEach(day => newSlots[day].sort((a,b) => a.time.localeCompare(b.time)));
          setSlots(newSlots);
        } else {
          setSlots(newSlots); // Just empty
        }
      } catch (err) {
        console.warn('Error fetching slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBookings();
    fetchSlots();
  }, [profile?.id]);

  const handleAddSlot = async () => {
    try {
      setIsSavingSlot(true);
      const { error } = await supabase.from('mentor_availability').insert({
        mentor_id: profile.id,
        day_of_week: newSlotDay,
        start_time: newSlotTime,
        is_active: true
      });
      if (error) throw error;
      
      setIsModalOpen(false);
      // refetch slots manually
      const { data } = await supabase.from('mentor_availability').select('*').eq('mentor_id', profile.id);
      if (data) {
        const newSlots = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [] };
        data.forEach(s => {
          if (newSlots[s.day_of_week]) {
            newSlots[s.day_of_week].push({ id: s.id, time: s.start_time, active: s.is_active });
          }
        });
        Object.keys(newSlots).forEach(day => newSlots[day].sort((a,b) => a.time.localeCompare(b.time)));
        setSlots(newSlots);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setIsSavingSlot(false);
    }
  };

  const deleteSlot = (slotId, day, idx) => {
    Alert.alert('Delete Slot', 'Are you sure you want to remove this slot?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          const newSlots = { ...slots };
          newSlots[day].splice(idx, 1);
          setSlots(newSlots);
          await supabase.from('mentor_availability').delete().eq('id', slotId);
      }}
    ]);
  };

  const toggleSlot = async (day, idx) => {
    const slot = slots[day][idx];
    const newActiveState = !slot.active;
    
    // Optimistic UI update
    const newSlots = { ...slots };
    newSlots[day][idx].active = newActiveState;
    setSlots(newSlots);

    if (slot.id) {
      try {
        await supabase
          .from('mentor_availability')
          .update({ is_active: newActiveState })
          .eq('id', slot.id);
      } catch (err) {
        console.warn('Error updating slot:', err);
      }
    }
  };

  const formatTime = (timeStr) => {
    // timeStr is like "14:00:00"
    const [h, m] = timeStr.split(':');
    let hh = parseInt(h, 10);
    const ampm = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12 || 12;
    return `${hh}:${m} ${ampm}`;
  };

  return (
    <View style={S.container}>
      <View style={S.headerRow}>
        <Text style={[S.title, { color: T.text }]}>Availability & 1-on-1s</Text>
      </View>

      <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
        <View style={[S.grid, { flexDirection: isWide ? 'row' : 'column' }]}>
          
          {/* Left: Booked Sessions */}
          <View style={S.col}>
            <Text style={[S.sectionTitle, { color: T.text }]}>Upcoming Bookings</Text>
            {loadingBookings ? (
              <ActivityIndicator color={T.accent} style={{ marginTop: 20 }} />
            ) : bookings.length === 0 ? (
              <View style={[S.emptyBox, { borderColor: T.borderLow }]}><Text style={{ color: T.muted }}>No upcoming 1-on-1s.</Text></View>
            ) : (
              bookings.map(b => {
                const studentName = Array.isArray(b.profiles) ? b.profiles[0]?.name : b.profiles?.name;
                const dateObj = new Date(b.scheduled_for);
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateStr = dateObj.toLocaleDateString();
                const bType = b.topic.toLowerCase().includes('mock') ? 'Mock' : '1-on-1';

                return (
                  <View key={b.id} style={[S.bookingCard, { backgroundColor: T.surface, borderColor: T.borderLow }]}>
                    <View style={S.bookingHeader}>
                      <Text style={[S.bookingStudent, { color: T.text }]}>{studentName || 'Student'}</Text>
                      <View style={[S.bookingType, { backgroundColor: bType === 'Mock' ? `${T.accent}20` : `${T.green}20` }]}>
                        <Text style={{ color: bType === 'Mock' ? T.accent : T.green, fontSize: 10, fontWeight: '800' }}>{bType.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={[S.bookingTopic, { color: T.muted }]}>{b.topic}</Text>
                    <View style={S.bookingFooter}>
                      <Text style={{ color: T.text, fontWeight: '700' }}>🕒 {dateStr}, {timeStr}</Text>
                      <Pressable style={[S.joinBtn, { backgroundColor: T.accent }]}><Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Join</Text></Pressable>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Right: Availability Setter */}
          <View style={S.col}>
            <View style={S.headerRowSmall}>
              <Text style={[S.sectionTitle, { color: T.text }]}>My Weekly Slots</Text>
              <Pressable onPress={() => setIsModalOpen(true)} style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: `${T.accent}20`, borderRadius: 8 }}>
                <Text style={{ color: T.accent, fontWeight: '800' }}>+ Add Slot</Text>
              </Pressable>
            </View>
            <View style={[S.card, { backgroundColor: T.surface, borderColor: T.borderLow }]}>
              <Text style={[S.cardSub, { color: T.muted }]}>Green slots are open for students to book.</Text>
              
              {loadingSlots ? (
                <ActivityIndicator color={T.accent} style={{ marginTop: 20 }} />
              ) : days.map(day => (
                <View key={day} style={[S.dayRow, { borderBottomColor: T.borderLow }]}>
                  <Text style={[S.dayLabel, { color: T.text }]}>{day}</Text>
                  <View style={S.slotsContainer}>
                    {slots[day].map((slot, i) => (
                      <Pressable 
                        key={i} 
                        style={[S.slotBadge, slot.active ? { backgroundColor: `${T.green}20`, borderColor: T.green } : { backgroundColor: T.surface2, borderColor: T.borderLow }]}
                        onPress={() => toggleSlot(day, i)}
                        onLongPress={() => deleteSlot(slot.id, day, i)}
                      >
                        <Text style={{ color: slot.active ? T.green : T.muted, fontSize: 12, fontWeight: '700' }}>{formatTime(slot.time)}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>

        </View>
      </ScrollView>
      {/* Add Slot Overlay */}
      {isModalOpen && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
          <View style={{ backgroundColor: T.surface, padding: 24, borderRadius: 16, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: T.borderLow }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: T.text, marginBottom: 20 }}>Add Availability Slot</Text>
            
            <Text style={{ color: T.text, fontWeight: '700', marginBottom: 8 }}>Select Day</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {days.map(d => (
                <Pressable key={d} onPress={() => setNewSlotDay(d)} style={[{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1 }, newSlotDay === d ? { backgroundColor: T.accent, borderColor: T.accent } : { backgroundColor: T.surface2, borderColor: T.border }]}>
                  <Text style={{ color: newSlotDay === d ? '#fff' : T.text, fontWeight: '700' }}>{d}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={{ color: T.text, fontWeight: '700', marginBottom: 8 }}>Select Time</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {PRESET_TIMES.map(pt => (
                <Pressable key={pt} onPress={() => setNewSlotTime(pt)} style={[{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 }, newSlotTime === pt ? { backgroundColor: T.accent, borderColor: T.accent } : { backgroundColor: T.surface2, borderColor: T.border }]}>
                  <Text style={{ color: newSlotTime === pt ? '#fff' : T.text, fontWeight: '600', fontSize: 13 }}>{formatTime(pt)}</Text>
                </Pressable>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable onPress={() => setIsModalOpen(false)} style={{ flex: 1, padding: 16, borderRadius: 12, backgroundColor: T.surface2, alignItems: 'center' }}>
                <Text style={{ color: T.text, fontWeight: '700' }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleAddSlot} disabled={isSavingSlot} style={{ flex: 1, padding: 16, borderRadius: 12, backgroundColor: T.accent, alignItems: 'center' }}>
                {isSavingSlot ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Save Slot</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const S = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  headerRowSmall: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  
  scroll: { flex: 1 },
  grid: { gap: 24 },
  col: { flex: 1 },
  
  emptyBox: { padding: 32, alignItems: 'center', borderWidth: 1, borderRadius: 16, borderStyle: 'dashed' },
  
  bookingCard: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingStudent: { fontSize: 16, fontWeight: '800' },
  bookingType: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  bookingTopic: { fontSize: 13, marginTop: 4, marginBottom: 16 },
  bookingFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  joinBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },

  card: { padding: 20, borderRadius: 16, borderWidth: 1 },
  cardSub: { fontSize: 13, marginBottom: 24 },
  
  dayRow: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1, alignItems: 'center' },
  dayLabel: { width: 40, fontWeight: '800' },
  slotsContainer: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 }
});

export default MentorAvailabilityTab;
