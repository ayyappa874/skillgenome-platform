import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { supabase } from '../utils/supabase';
import { Color, Padding, Border } from '../GlobalStyles';
import { Feather } from '@expo/vector-icons';
import { t } from '../utils/translations';
import StudentLiveSession from '../components/StudentLiveSession';

const StudentSessionsScreen = ({ onBack, profile, isDarkMode, language }) => {
  const S = React.useMemo(() => getStyles(isDarkMode), [isDarkMode]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    if (profile?.id) {
      fetchSessions();
      
      const channel = supabase.channel(`student_sessions_${profile.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cohort_students', filter: `student_id=eq.${profile.id}` }, () => {
          fetchSessions();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cohort_sessions' }, () => {
          // In a real app, filter by cohort_id, but here we'll just refetch on any session change
          // since Supabase doesn't support OR filters in Realtime yet easily without multiple channels
          fetchSessions();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile?.id]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      // First get cohorts student belongs to
      const { data: cohortsData, error: cohortsError } = await supabase
        .from('cohort_students')
        .select('cohort_id')
        .eq('student_id', profile.id);
        
      if (cohortsError) throw cohortsError;
      
      if (cohortsData && cohortsData.length > 0) {
        const cohortIds = cohortsData.map(c => c.cohort_id);
        
        // Fetch sessions for those cohorts
        const { data, error } = await supabase
          .from('mentor_sessions')
          .select('*, cohorts(name, mentor_id, profiles!mentor_id(name))')
          .in('cohort_id', cohortIds)
          .order('scheduled_for', { ascending: true });
          
        if (error) throw error;
        setSessions(data || []);
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.warn("Error fetching student sessions", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={S.container}>
      <View style={{ flex: 1, width: "100%", maxWidth: 600, alignSelf: "center" }}>
        <View style={S.header}>
        <Pressable style={S.backButton} onPress={onBack}>
          <Feather name="arrow-left" size={24} color={isDarkMode ? "#ffffff" : "#0f172a"} />
        </Pressable>
        <Text style={S.title}>Live Sessions</Text>
      </View>

      <ScrollView style={S.list} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={{ color: isDarkMode ? Color.colorBlue42 : "#64748b", padding: 16 }}>Loading sessions...</Text>
        ) : sessions.length === 0 ? (
          <View style={S.emptyState}>
            <Text style={{ color: isDarkMode ? Color.colorBlue42 : "#64748b" }}>You have no upcoming sessions right now.</Text>
          </View>
        ) : (
          sessions.map(s => (
            <View key={s.id} style={S.card}>
              <View style={S.cardHeader}>
                <View>
                  <Text style={S.cardTitle}>{s.topic}</Text>
                  <Text style={S.cardTopic}>
                    Mentor: {s.cohorts?.profiles?.name || 'Unknown'} (Cohort: {s.cohorts?.name || 'Unknown'})
                  </Text>
                </View>
                <View style={S.statusBadge}>
                  <Text style={S.statusText}>{s.status.toUpperCase()}</Text>
                </View>
              </View>
              <View style={S.cardFooter}>
                <Text style={{ color: isDarkMode ? Color.colorBlue42 : "#64748b", fontSize: 13 }}>
                  📅 {new Date(s.scheduled_for).toLocaleString()}
                </Text>
                {(s.status === 'Scheduled' || s.status === 'Live') && (
                  <Pressable style={S.joinBtn} onPress={() => setActiveSession(s)}>
                    <Text style={{ color: isDarkMode ? "#ffffff" : "#111827", fontWeight: '700', fontSize: 13 }}>Join Live Room</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
      </View>

      {activeSession && (
        <StudentLiveSession studentId={profile.id} 
          session={activeSession} 
          T={{ 
            bg: isDarkMode ? "#0f172a" : "#f8fafc", 
            surface: isDarkMode ? "#1e293b" : "#ffffff", 
            surface2: isDarkMode ? "#334155" : "#f1f5f9",
            text: isDarkMode ? "#f8fafc" : "#0f172a", 
            muted: isDarkMode ? "#94a3b8" : "#64748b",
            subtle: isDarkMode ? "#475569" : "#cbd5e1",
            borderLow: isDarkMode ? "rgba(255,255,255,0.05)" : "#e2e8f0",
            border: isDarkMode ? "rgba(255,255,255,0.1)" : "#e2e8f0",
            accent: "#00D4FF",
            primary: "#7c3aed",
            green: "#10b981",
            red: "#ef4444"
          }} 
          onClose={() => setActiveSession(null)} 
        />
      )}
    </View>
  );
};

const getStyles = (isDarkMode) => {
  const bgStyle = isDarkMode ? (Color.colorBlue8 || "#060612") : "#f8fafc";
  const elementBg = isDarkMode ? (Color.colorAzure11 || "#1a1f30") : "#ffffff";
  const borderStyle = isDarkMode ? (Color.colorWhite7 || "rgba(255, 255, 255, 0.06)") : "#cbd5e1";
  const textPrimary = isDarkMode ? (Color.colorGrey97 || "#ffffff") : "#0f172a";
  
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: bgStyle },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      paddingTop: Platform.OS === "ios" ? 72 : 56,
      paddingHorizontal: Padding.padding_16,
      paddingBottom: 24,
    },
    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: elementBg,
      borderWidth: 1,
      borderColor: borderStyle,
      alignItems: "center",
      justifyContent: "center",
    },
    backText: {
      color: textPrimary,
      fontSize: 18,
      fontWeight: "600",
      marginTop: -2,
    },
    title: {
      fontSize: 24,
      fontWeight: "900",
      color: textPrimary,
      letterSpacing: -0.5,
    },
    list: { flex: 1, paddingHorizontal: 16 },
    emptyState: { padding: 40, alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: borderStyle, borderStyle: 'dashed', backgroundColor: elementBg },
    card: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: borderStyle, backgroundColor: elementBg, marginBottom: 16, gap: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 },
    cardTitle: { fontSize: 16, fontWeight: '800', color: textPrimary },
    cardTopic: { fontSize: 13, marginTop: 4, color: isDarkMode ? Color.colorBlue42 : "#64748b" },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: "rgba(124, 58, 237, 0.2)" },
    statusText: { fontSize: 11, fontWeight: '800', color: "#7c3aed" },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderTopWidth: 1, borderTopColor: borderStyle, paddingTop: 16 },
    joinBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: borderStyle, backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9" }
  });
};

export default StudentSessionsScreen;
