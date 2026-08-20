import * as React from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import { Color, FontFamily, FontSize, Padding, StyleVariable, Border } from "../GlobalStyles";
import { supabase } from "../utils/supabase";
import { t } from "../utils/translations";
import GlassCard from '../components/UI/GlassCard';
import { LinearGradient } from "expo-linear-gradient";

const getTheme = (isDark) => ({
  background: isDark ? "#0f172a" : "#f8fafc",
  surface: isDark ? "#1e293b" : "#ffffff",
  surfaceLight: isDark ? "#334155" : "#f1f5f9",
  text: isDark ? "#f8fafc" : "#0f172a",
  textDim: isDark ? "#94a3b8" : "#64748b",
  border: isDark ? "#334155" : "#e2e8f0",
  primary: "#38bdf8",
  accent: "#818cf8",
  success: "#10b981",
  danger: "#ef4444"
});

const ConnectionsScreen = ({ onBack, isDarkMode = true, language = 'English', connections = [], suggestedConnections = [], currentUserId = null, onConnectionsUpdated, onOpenProfile }) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const tabs = [
    t(language, "all") || "All",
    t(language, "coStudents") || "Co-Students",
    t(language, "mentors") || "Mentors",
    t(language, "requests") || "Requests",
    t(language, "suggested") || "Suggested"
  ];
  const [people, setPeople] = React.useState([]);
  const [suggested, setSuggested] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase.channel(`connections_channel_${currentUserId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentorship_requests', filter: `mentor_id=eq.${currentUserId}` }, () => {
        if (typeof onConnectionsUpdated === 'function') onConnectionsUpdated();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentorship_requests', filter: `student_id=eq.${currentUserId}` }, () => {
        if (typeof onConnectionsUpdated === 'function') onConnectionsUpdated();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, onConnectionsUpdated]);

  const C = React.useMemo(() => getTheme(isDarkMode), [isDarkMode]);
  const styles = React.useMemo(() => getStyles(isDarkMode, C), [isDarkMode, C]);

  React.useEffect(() => {
    if (connections && Array.isArray(connections)) {
      const palettes = [
        ["#38bdf8", "#7c3aed"],
        ["#a855f7", "#ec4899"],
        ["#3b82f6", "#10b981"],
        ["#f59e0b", "#ef4444"],
        ["#14b8a6", "#6366f1"],
      ];

      const mappedConnections = connections.map((conn, index) => ({
        id: conn.id || conn.user_id,
        name: conn.name || 'Anonymous',
        role: conn.role || 'Member',
        genome_score: conn.genome_score || conn.total_score || 50,
        match_score: conn.match_score || 0,
        initials: conn.name ? conn.name.charAt(0).toUpperCase() : 'U',
        tone: palettes[index % palettes.length],
        userRole: conn.userRole || 'student',
        status: conn.status || 'Connected'
      }));

      setPeople(mappedConnections);
    }
  }, [connections]);

  React.useEffect(() => {
    if (suggestedConnections && Array.isArray(suggestedConnections)) {
      const palettes = [
        ["#38bdf8", "#7c3aed"],
        ["#a855f7", "#ec4899"],
        ["#3b82f6", "#10b981"],
        ["#f59e0b", "#ef4444"],
        ["#14b8a6", "#6366f1"],
      ];

      const mappedSuggested = suggestedConnections.map((conn, index) => ({
        ...conn,
        initials: conn.name ? conn.name.charAt(0).toUpperCase() : 'U',
        tone: palettes[index % palettes.length]
      }));

      setSuggested(mappedSuggested);
      setLoading(false);
    }
  }, [suggestedConnections]);

  const updateLocalStatus = (personId, newStatus) => {
    setPeople(prev => prev.map(p => p.id === personId ? { ...p, status: newStatus } : p));
    setSuggested(prev => prev.map(s => s.id === personId ? { ...s, status: newStatus } : s));
  };

  const toggleConnection = async (personId, fromSuggested = false, isReject = false) => {
    try {
      if (!currentUserId) {
        console.error('No current user ID');
        return;
      }

      let currentItem = null;
      if (fromSuggested) {
        currentItem = suggested.find(item => item.id === personId);
      } else {
        currentItem = people.find(item => item.id === personId);
      }
      
      if (!currentItem && fromSuggested === false) {
          currentItem = suggested.find(item => item.id === personId);
      }
      if (!currentItem && fromSuggested === true) {
          currentItem = people.find(item => item.id === personId);
      }

      if (!currentItem) {
        console.error("Item not found");
        return;
      }

      if (currentItem.status === "Connect") {
        updateLocalStatus(personId, "Pending");

        const { error } = await supabase
          .from('mentorship_requests')
          .insert({
            student_id: currentUserId,
            mentor_id: personId,
            message: "Hi, let's connect and share skill genomes!",
            status: 'pending'
          });

        if (error) {
          console.error("Failed to send request:", error);
          updateLocalStatus(personId, "Connect");
          return;
        }

        const { data: currentUserData } = await supabase.from('profiles').select('name').eq('id', currentUserId).single();
        await supabase.from('notifications').insert({
          recipient_id: personId, actor_id: currentUserId,
          actor_name: currentUserData?.name || 'Someone',
          notification_type: 'connection_request',
          message: `${currentUserData?.name || 'Someone'} sent you a connection request`,
          is_read: false
        }).then(({ error }) => { if (error) console.log(error); });

        if (onConnectionsUpdated) onConnectionsUpdated();

      } else if (currentItem.status === "Pending") {
        updateLocalStatus(personId, "Connect");

        const { error: cancelError } = await supabase
          .from('mentorship_requests')
          .delete()
          .or(`and(student_id.eq.${currentUserId},mentor_id.eq.${personId}),and(student_id.eq.${personId},mentor_id.eq.${currentUserId})`);

        if (cancelError) {
          console.error("Failed to cancel request:", cancelError);
          updateLocalStatus(personId, "Pending");
          return;
        }
        if (onConnectionsUpdated) onConnectionsUpdated();

      } else if (currentItem.status === "Accept") {
        if (isReject) {
          updateLocalStatus(personId, "Connect");

          const { error: rejectError } = await supabase
            .from('mentorship_requests')
            .delete()
            .or(`and(student_id.eq.${personId},mentor_id.eq.${currentUserId}),and(student_id.eq.${currentUserId},mentor_id.eq.${personId})`);

          if (rejectError) {
            console.error("Failed to reject connection:", rejectError);
            updateLocalStatus(personId, "Accept");
            return;
          }
          if (onConnectionsUpdated) onConnectionsUpdated();
        } else {
          updateLocalStatus(personId, "Connected");

          const { error: acceptError } = await supabase
            .from('mentorship_requests')
            .update({ status: 'accepted' })
            .or(`and(student_id.eq.${personId},mentor_id.eq.${currentUserId}),and(student_id.eq.${currentUserId},mentor_id.eq.${personId})`);

          if (acceptError) {
            console.error("Failed to accept connection:", acceptError);
            updateLocalStatus(personId, "Accept");
            return;
          }

          const { data: currentUserData } = await supabase.from('profiles').select('name').eq('id', currentUserId).single();
          await supabase.from('notifications').insert({
            recipient_id: personId, actor_id: currentUserId,
            actor_name: currentUserData?.name || 'Someone',
            notification_type: 'connection_accepted',
            message: `${currentUserData?.name || 'Someone'} accepted your connection request`,
            is_read: false
          }).then(({ error }) => { if (error) console.log(error); });
          
          if (onConnectionsUpdated) onConnectionsUpdated();
        }

      } else if (currentItem.status === "Connected") {
        updateLocalStatus(personId, "Connect");

        const { error: disconnectError } = await supabase
          .from('mentorship_requests')
          .delete()
          .or(`and(student_id.eq.${personId},mentor_id.eq.${currentUserId}),and(student_id.eq.${currentUserId},mentor_id.eq.${personId})`);

        if (disconnectError) {
          console.error("Failed to disconnect:", disconnectError);
          updateLocalStatus(personId, "Connected");
          return;
        }
        if (onConnectionsUpdated) onConnectionsUpdated();
      }
    } catch (err) {
      console.error("Exception in toggleConnection:", err);
    }
  };

  const renderPersonCard = (item, isSuggested = false) => {
    return (
      <View key={item.id} style={styles.cardWrapper}>
        <GlassCard isDarkMode={isDarkMode} intensity="medium" style={styles.card}>
          <Pressable onPress={() => onOpenProfile && onOpenProfile(item.id)} style={styles.cardContent}>
            <LinearGradient colors={item.tone || ["#38bdf8", "#7c3aed"]} style={styles.avatarGradient}>
              <Text style={styles.avatarText}>{item.initials}</Text>
            </LinearGradient>
            
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardRole}>{item.role}</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statBadge}>
                  <Text style={styles.statLabel}>Match</Text>
                  <Text style={styles.statValue}>{item.match_score || item.match || 0}%</Text>
                </View>
                <View style={[styles.statBadge, { backgroundColor: `${C.accent}20` }]}>
                  <Text style={[styles.statLabel, { color: C.accent }]}>Score</Text>
                  <Text style={[styles.statValue, { color: C.text }]}>{item.genome_score || 0}</Text>
                </View>
              </View>
            </View>

              <View style={styles.actionColumn}>
                {item.status === "Declined" ? (
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={{ color: C.danger, fontSize: 13, fontWeight: '700' }}>Declined</Text>
                    {item.declineReason ? (
                       <Text style={{ color: C.textDim, fontSize: 10, maxWidth: 100, textAlign: 'right' }} numberOfLines={2}>
                         {item.declineReason}
                       </Text>
                    ) : null}
                  </View>
                ) : item.status === "Accept" ? (
                  <View style={{flexDirection: 'column', gap: 6}}>
                    <Pressable 
                      style={[styles.actionBtn, { backgroundColor: C.success }]}
                      onPress={(e) => { e.stopPropagation(); toggleConnection(item.id, isSuggested, false); }}
                    >
                      <Text style={[styles.actionBtnText, { color: '#fff' }]}>Accept</Text>
                    </Pressable>
                    <Pressable 
                      style={[styles.actionBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.danger }]}
                      onPress={(e) => { e.stopPropagation(); toggleConnection(item.id, isSuggested, true); }}
                    >
                      <Text style={[styles.actionBtnText, { color: C.danger }]}>Decline</Text>
                    </Pressable>
                  </View>
                ) : (
                <Pressable 
                  style={[
                    styles.actionBtn, 
                    item.status === "Connected" ? { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.border } : 
                    item.status === "Pending" ? { backgroundColor: C.surfaceLight } : { backgroundColor: C.primary }
                  ]}
                  onPress={(e) => { e.stopPropagation(); toggleConnection(item.id, isSuggested); }}
                >
                  <Text style={[
                    styles.actionBtnText,
                    item.status === "Connected" ? { color: C.textDim } :
                    item.status === "Pending" ? { color: C.text } : { color: '#fff' }
                  ]}>{item.status}</Text>
                </Pressable>
              )}
            </View>
          </Pressable>
        </GlassCard>
      </View>
    );
  };

  const getFilteredPeople = () => {
    let filtered = [];
    if (activeTab === 0) {
      filtered = people.filter(p => p.status === "Connected");
    } else if (activeTab === 1) {
      filtered = people.filter(p => p.status === "Connected" && p.userRole === "student");
    } else if (activeTab === 2) {
      const connectedMentors = people.filter(p => p.status === "Connected" && p.userRole === "mentor");
      const suggestedMentors = suggested.filter(s => s.userRole === "mentor" && (s.status === "Connect" || s.status === "Pending" || s.status === "Accept"));
      filtered = [...connectedMentors, ...suggestedMentors];
    } else if (activeTab === 3) {
      filtered = people.filter(p => p.status === "Accept" || p.status === "Pending");
    } else if (activeTab === 4) {
      filtered = suggested.filter(s => s.status === "Connect" || s.status === "Pending" || s.status === "Accept");
      return filtered;
    }
    
    if (searchQuery) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  };

  return (
    <View style={styles.container}>
      {/* Ambient glow */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["rgba(124,58,237,0.18)", "transparent"]}
          style={{ position: "absolute", top: -60, left: -60, width: 380, height: 380, borderRadius: 190 }}
        />
      </View>
      
      <View style={{ flex: 1, width: "100%", maxWidth: 600, alignSelf: "center" }}>
        <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t(language, "network") || "Network"}</Text>
        <View style={{width: 40}} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search connections..."
            placeholderTextColor={C.textDim}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {tabs.map((tab, idx) => (
          <Pressable 
            key={idx} 
            style={[styles.tab, activeTab === idx && styles.activeTab]}
            onPress={() => setActiveTab(idx)}
          >
            <Text style={[styles.tabText, activeTab === idx && styles.activeTabText]}>
              {tab}
            </Text>
          </Pressable>
        ))}
        <View style={{width: 20}} />
      </ScrollView>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={C.primary} style={{marginTop: 50}} />
        ) : (
          getFilteredPeople().map(person => renderPersonCard(person, activeTab === 4))
        )}
        
        {!loading && getFilteredPeople().length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>👥</Text>
            <Text style={styles.emptyStateText}>No connections found</Text>
          </View>
        )}
      </ScrollView>
      </View>
    </View>
  );
};

const getStyles = (isDark, C) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 24, color: C.text },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.text },
  searchContainer: { paddingHorizontal: 20, paddingBottom: 15 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, paddingHorizontal: 15, height: 48 },
  searchIcon: { fontSize: 16, marginRight: 10, color: C.textDim },
  searchInput: { flex: 1, color: C.text, fontSize: 16 },
  tabsContainer: { paddingHorizontal: 20, marginBottom: 20, maxHeight: 40 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: C.surface, marginRight: 10, height: 36, justifyContent: 'center' },
  activeTab: { backgroundColor: C.primary },
  tabText: { color: C.textDim, fontWeight: '600' },
  activeTabText: { color: '#fff' },
  content: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 100 },
  cardWrapper: { marginBottom: 15 },
  card: { borderRadius: 16, overflow: 'hidden' },
  cardContent: { padding: 15, flexDirection: 'row', alignItems: 'center' },
  avatarGradient: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 4 },
  cardRole: { fontSize: 13, color: C.textDim, marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBadge: { backgroundColor: C.surfaceLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', gap: 4, alignItems: 'center' },
  statLabel: { fontSize: 10, color: C.textDim, textTransform: 'uppercase', fontWeight: '700' },
  statValue: { fontSize: 12, color: C.text, fontWeight: '700' },
  actionColumn: { marginLeft: 15, justifyContent: 'center' },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignItems: 'center', justifyContent: 'center', minWidth: 90 },
  actionBtnText: { fontWeight: '600', fontSize: 13 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyStateIcon: { fontSize: 48, marginBottom: 15, opacity: 0.5 },
  emptyStateText: { fontSize: 16, color: C.textDim, fontWeight: '500' }
});

export default ConnectionsScreen;
