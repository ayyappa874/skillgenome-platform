import * as React from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator, Platform } from "react-native";
import { Color, FontFamily, FontSize, Padding, StyleVariable, Border } from "../GlobalStyles";
import { supabase } from "../utils/supabase";
import GlassCard from '../components/UI/GlassCard';
import { LinearGradient } from "expo-linear-gradient";

const ConnectionsScreen = ({onBack, connections = [], suggestedConnections = [], isDarkMode = true, language = 'English' }) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const tabs = [
    "All",
    "Co-Students",
    "Mentors",
    "Pending",
    "Suggested"
  ];
  const [people, setPeople] = React.useState([]);
  const [suggested, setSuggested] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  const styles = React.useMemo(() => getStyles(isDarkMode), [isDarkMode]);

  const updateLocalStatus = (personId, newStatus) => {
    // Optimistic UI: Just update the status in place so the button text changes instantly.
    // We do not physically move the cards between Network and Suggested arrays until a full page reload,
    // avoiding the jarring experience of cards disappearing instantly when clicked.
    setPeople(prev => prev.map(p => p.id === personId ? { ...p, status: newStatus } : p));
    setSuggested(prev => prev.map(s => s.id === personId ? { ...s, status: newStatus } : s));
  };

  React.useEffect(() => {
    if (connections || suggestedConnections) {
      const palettes = [
        ["#38bdf8", "#7c3aed"],
        ["#a855f7", "#ec4899"],
        ["#3b82f6", "#10b981"],
        ["#f59e0b", "#ef4444"],
        ["#14b8a6", "#6366f1"],
      ];

      const mapProfile = (p, index) => {
        const initials = p.name ? p.name.charAt(0).toUpperCase() : "U";
        const tone = palettes[index % palettes.length];
        
        return {
          id: p.id || p.user_id,
          name: p.name || 'Anonymous',
          userRole: p.userRole || p.role || 'student', 
          role: p.role || p.current_role || 'Member',
          scoreLabel: `Genome Score: ${p.genome_score || p.total_score || 50}`,
          mutual: p.mutual_connections || Math.floor(Math.random() * 8) + 1,
          status: p.status || "Connected", // Default connected if no status found
          initials: initials,
          tone: tone,
          badge: p.match_score ? `${p.match_score}% matched` : '',
          skillScore: p.match_score || 0,
          sharedSkills: p.sharedSkills || p.matched_skills || [],
          matchReason: p.match_reason || ''
        };
      };

      setPeople((connections || []).map(mapProfile));
      setSuggested((suggestedConnections || []).map(mapProfile));
      setLoading(false);
    }
  }, [connections, suggestedConnections]);

  const toggleConnection = async (personId, fromSuggested = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let currentItem = null;
      if (fromSuggested) {
        currentItem = suggested.find(item => item.id === personId);
      } else {
        currentItem = people.find(item => item.id === personId);
      }

      if (!currentItem) return;

      if (currentItem.status === "Connect") {
        // Optimistic update
        updateLocalStatus(personId, "Pending");
        
        const { error } = await supabase
          .from('mentorship_requests')
          .insert({
            student_id: user.id,
            mentor_id: personId,
            message: "Hi, let's connect and share skill genomes!",
            status: 'pending'
          });

        if (error) {
          console.error("Failed to insert mentorship request:", error);
          // Revert on error
          updateLocalStatus(personId, "Connect");
        }
      } else if (currentItem.status === "Pending" || currentItem.status === "Accept") {
        const { data: reqs } = await supabase
          .from('mentorship_requests')
          .select('*')
          .or(`student_id.eq.${user.id},mentor_id.eq.${user.id}`);

        const req = reqs?.find(r => 
          (r.student_id === user.id && r.mentor_id === personId) ||
          (r.mentor_id === user.id && r.student_id === personId)
        );

        if (req) {
          if (req.mentor_id === user.id) {
            updateLocalStatus(personId, "Connected");
            const { error } = await supabase
              .from('mentorship_requests')
              .update({ status: 'accepted' })
              .eq('id', req.id);

            if (error) updateLocalStatus(personId, currentItem.status);
          } else {
            updateLocalStatus(personId, "Connect");
            const { error } = await supabase
              .from('mentorship_requests')
              .delete()
              .eq('id', req.id);

            if (error) updateLocalStatus(personId, currentItem.status);
          }
        }
      } else if (currentItem.status === "Connected") {
        updateLocalStatus(personId, "Connect");
        const { data: reqs } = await supabase
          .from('mentorship_requests')
          .select('*')
          .or(`student_id.eq.${user.id},mentor_id.eq.${user.id}`);

        const req = reqs?.find(r => 
          (r.student_id === user.id && r.mentor_id === personId) ||
          (r.mentor_id === user.id && r.student_id === personId)
        );

        if (req) {
          const { error } = await supabase
            .from('mentorship_requests')
            .delete()
            .eq('id', req.id);

          if (error) updateLocalStatus(personId, "Connected");
        }
      }
    } catch (err) {
      console.warn("[ConnectionsScreen] Error toggling connection in DB:", err.message);
    }
  };

  // Filter based on active tab and search query
  // activeTab indices:
  // 0: All
  // 1: Co-Students
  // 2: Mentors
  // 3: Pending
  // 4: Suggested
  let visiblePeople = people;
  if (activeTab === 1) {
    visiblePeople = people.filter(p => p.userRole === 'student');
  } else if (activeTab === 2) {
    visiblePeople = people.filter(p => p.userRole === 'mentor');
  } else if (activeTab === 3) {
    visiblePeople = people.filter(p => p.status === 'Pending');
  } else if (activeTab === 4) {
    visiblePeople = [];
  }

  let visibleSuggested = suggested;
  if (activeTab === 1) {
    visibleSuggested = suggested.filter(p => p.userRole === 'student');
  } else if (activeTab === 2) {
    visibleSuggested = suggested.filter(p => p.userRole === 'mentor');
  } else if (activeTab === 3) {
    visibleSuggested = [];
  } else if (activeTab === 4) {
    visibleSuggested = suggested;
  }

  const filteredPeople = visiblePeople.filter(
    (person) =>
      person.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSuggested = visibleSuggested.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const students = filteredPeople.filter(p => p.userRole === 'student');
  const mentors = filteredPeople.filter(p => p.userRole === 'mentor');

  const suggestedStudents = filteredSuggested.filter(p => p.userRole === 'student');
  const suggestedMentors = filteredSuggested.filter(p => p.userRole === 'mentor');

  return (
    <View style={{ flex: 1, backgroundColor: styles.screen.backgroundColor || (isDarkMode ? "#060612" : "#f8fafc") }}>
      {/* Ambient glow matching Resume DNA */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={isDarkMode ? ["rgba(124,58,237,0.18)", "transparent"] : ["rgba(124,58,237,0.08)", "transparent"]}
          style={{ position: "absolute", top: -60, left: -60, width: 380, height: 380, borderRadius: 190 }}
        />
        <LinearGradient
          colors={isDarkMode ? ["rgba(56,189,248,0.12)", "transparent"] : ["rgba(56,189,248,0.06)", "transparent"]}
          style={{ position: "absolute", bottom: -80, right: -40, width: 300, height: 300, borderRadius: 150 }}
        />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => typeof onBack === "function" && onBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <View>
          <Text style={styles.pageTitle}>Connections</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search members, titles, or skills..."
          placeholderTextColor={isDarkMode ? (Color.colorBlue42 || "#5a5a7a") : "#64748b"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Text style={{ color: Color.colorCyan50, fontSize: 12, marginRight: 4 }}>Clear</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.tabsRow}>
        {tabs.map((tab, index) => (
          <Pressable
            key={tab}
            style={[styles.filterTab, activeTab === index && styles.filterTabActive]}
            onPress={() => setActiveTab(index)}
          >
            <Text style={[styles.filterTabText, activeTab === index && styles.filterTabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Color.colorCyan50} />
          <Text style={styles.loadingText}>Syncing dynamic connections...</Text>
        </View>
      ) : (
        <>
          <View style={styles.listSection}>
            {students.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>Co-Students</Text>
                {students.map((person) => {
                  const isConnected = person.status === "Connected";
                  const displayStatus = person.status === "Connected" 
                    ? "Connected" 
                    : (person.status === "Pending" ? "Pending" : "Connect");
                  return (
                    <GlassCard key={person.id} style={styles.personCard} isDarkMode={isDarkMode} intensity="low">
                      <View style={[styles.avatar, { backgroundColor: person.tone[0] }]}>
                        <View style={[styles.avatarGlow, { backgroundColor: person.tone[1] }]} />
                        <Text style={styles.avatarText}>{person.initials}</Text>
                      </View>

                      <View style={styles.personInfo}>
                        <Text style={styles.personName}>{person.name}</Text>
                        <Text style={styles.personRole}>{person.role}</Text>
                        <Text style={styles.personScore}>{person.scoreLabel}</Text>
                        <Text style={styles.personMutual}>{person.mutual} mutual connections</Text>
                      </View>

                      <Pressable
                        style={[styles.actionButton, isConnected && styles.actionButtonConnected]}
                        onPress={() => toggleConnection(person.id)}
                      >
                        <Text style={[styles.actionButtonText, isConnected && styles.actionButtonTextConnected]}>
                          {displayStatus}
                        </Text>
                      </Pressable>
                    </GlassCard>
                  );
                })}
              </>
            )}

            {mentors.length > 0 && (
              <>
                <Text style={[styles.sectionHeader, { marginTop: 16 }]}>Mentors</Text>
                {mentors.map((person) => {
                  const isConnected = person.status === "Connected";
                  const displayStatus = person.status === "Connected" 
                    ? "Connected" 
                    : (person.status === "Pending" ? "Pending" : "Connect");
                  return (
                    <GlassCard key={person.id} style={styles.personCard} isDarkMode={isDarkMode} intensity="low">
                      <View style={[styles.avatar, { backgroundColor: person.tone[0] }]}>
                        <View style={[styles.avatarGlow, { backgroundColor: person.tone[1] }]} />
                        <Text style={styles.avatarText}>{person.initials}</Text>
                      </View>

                      <View style={styles.personInfo}>
                        <Text style={styles.personName}>{person.name}</Text>
                        <Text style={styles.personRole}>{person.role}</Text>
                        <Text style={styles.personScore}>{person.scoreLabel}</Text>
                        <Text style={styles.personMutual}>{person.mutual} mutual connections</Text>
                      </View>

                      <Pressable
                        style={[styles.actionButton, isConnected && styles.actionButtonConnected]}
                        onPress={() => toggleConnection(person.id)}
                      >
                        <Text style={[styles.actionButtonText, isConnected && styles.actionButtonTextConnected]}>
                          {displayStatus}
                        </Text>
                      </Pressable>
                    </GlassCard>
                  );
                })}
              </>
            )}

            {filteredPeople.length === 0 && (
              <View style={styles.noResultsCard}>
                <Text style={styles.noResultsText}>No connections found matching your query.</Text>
              </View>
            )}
          </View>

          <Text style={styles.suggestedTitle}>{"Suggested".toUpperCase() + " " + "Connections".toUpperCase()}</Text>

          {suggestedStudents.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Suggested Co-Students</Text>
              <View style={styles.suggestedGrid}>
                {suggestedStudents.map((item) => {
                  const displayStatus = item.status === "Connected" 
                    ? "Connected" || "Connected"
                    : (item.status === "Pending" ? "Pending" || "Pending" 
                      : (item.status === "Accept" ? "Accept" : "Connect" || "Connect"));
                  return (
                    <GlassCard key={item.id} style={styles.suggestedCard} isDarkMode={isDarkMode} intensity="low">
                      <View style={styles.suggestedBadgeWrap}>
                        <Text style={styles.suggestedBadge}>🌟 {item.badge}</Text>
                      </View>
                      <View style={[styles.suggestedAvatar, { backgroundColor: item.tone[0] }]}>
                        <View style={[styles.suggestedAvatarGlow, { backgroundColor: item.tone[1] }]} />
                        <Text style={styles.avatarText}>{item.initials}</Text>
                      </View>
                      <Text style={styles.suggestedName}>{item.name}</Text>
                      <Text style={styles.suggestedRole}>{item.role}</Text>
                      
                      <View style={styles.matchReasonBox}>
                        <Text style={styles.matchReasonText}>{item.matchReason}</Text>
                      </View>

                      {item.sharedSkills && item.sharedSkills.length > 0 && (
                        <View style={styles.sharedSkillsRow}>
                          {item.sharedSkills.slice(0, 2).map((sk, i) => (
                            <View key={i} style={styles.skillChip}>
                              <Text style={styles.skillChipText}>{sk}</Text>
                            </View>
                          ))}
                          {item.sharedSkills.length > 2 && (
                            <Text style={styles.skillChipMore}>+{item.sharedSkills.length - 2}</Text>
                          )}
                        </View>
                      )}

                      <Pressable
                        style={[styles.suggestedActionButton, item.status === "Connected" && styles.actionButtonConnected]}
                        onPress={() => toggleConnection(item.id, true)}
                      >
                        <Text style={[styles.actionButtonText, item.status === "Connected" && styles.actionButtonTextConnected]}>
                          {displayStatus}
                        </Text>
                      </Pressable>
                    </GlassCard>
                  );
                })}
              </View>
            </>
          )}

          {suggestedMentors.length > 0 && (
            <>
              <Text style={[styles.sectionHeader, { marginTop: 16 }]}>Suggested Mentors</Text>
              <View style={styles.suggestedGrid}>
                {suggestedMentors.map((item) => {
                  const displayStatus = item.status === "Connected" 
                    ? "Connected" || "Connected"
                    : (item.status === "Pending" ? "Pending" || "Pending" 
                      : (item.status === "Accept" ? "Accept" : "Connect" || "Connect"));
                  return (
                    <GlassCard key={item.id} style={styles.suggestedCard} isDarkMode={isDarkMode} intensity="low">
                      <View style={styles.suggestedBadgeWrap}>
                        <Text style={styles.suggestedBadge}>🌟 {item.badge}</Text>
                      </View>
                      <View style={[styles.suggestedAvatar, { backgroundColor: item.tone[0] }]}>
                        <View style={[styles.suggestedAvatarGlow, { backgroundColor: item.tone[1] }]} />
                        <Text style={styles.avatarText}>{item.initials}</Text>
                      </View>
                      <Text style={styles.suggestedName}>{item.name}</Text>
                      <Text style={styles.suggestedRole}>{item.role}</Text>
                      
                      <View style={styles.matchReasonBox}>
                        <Text style={styles.matchReasonText}>{item.matchReason}</Text>
                      </View>

                      {item.sharedSkills && item.sharedSkills.length > 0 && (
                        <View style={styles.sharedSkillsRow}>
                          {item.sharedSkills.slice(0, 2).map((sk, i) => (
                            <View key={i} style={styles.skillChip}>
                              <Text style={styles.skillChipText}>{sk}</Text>
                            </View>
                          ))}
                          {item.sharedSkills.length > 2 && (
                            <Text style={styles.skillChipMore}>+{item.sharedSkills.length - 2}</Text>
                          )}
                        </View>
                      )}

                      <Pressable
                        style={[styles.suggestedActionButton, item.status === "Connected" && styles.actionButtonConnected]}
                        onPress={() => toggleConnection(item.id, true)}
                      >
                        <Text style={[styles.actionButtonText, item.status === "Connected" && styles.actionButtonTextConnected]}>
                          {displayStatus}
                        </Text>
                      </Pressable>
                    </GlassCard>
                  );
                })}
              </View>
            </>
          )}

          {filteredSuggested.length === 0 && (
            <View style={styles.noResultsCard}>
              <Text style={styles.noResultsText}>No suggestions found matching your query.</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
    </View>
  );
};

const getStyles = (isDarkMode) => {
  const bgStyle = isDarkMode ? (Color.colorBlue8 || "#060612") : "#f8fafc";
  const cardBg = isDarkMode ? (Color.colorBlue11 || "#111524") : "#ffffff";
  const elementBg = isDarkMode ? (Color.colorBlue15 || "#1a1f30") : "#ffffff";
  const borderStyle = isDarkMode ? (Color.colorWhite7 || "rgba(255, 255, 255, 0.06)") : "#cbd5e1";
  const textPrimary = isDarkMode ? (Color.colorGrey97 || "#ffffff") : "#0f172a";
  const textSecondary = isDarkMode ? (Color.colorBlue42 || "#9AA0B2") : "#475569";
  const textTertiary = isDarkMode ? (Color.colorBlue65 || "#5a5a7a") : "#64748b";

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: bgStyle,
    },
    content: {
      paddingTop: 0,
      paddingBottom: 30,
      paddingHorizontal: 14,
      gap: 14,
    },
    sectionHeader: {
      fontSize: 12,
      fontFamily: FontFamily.soraBold,
      color: textPrimary,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 6,
      marginTop: 8,
    },
    header:  {
      flexDirection: "row", alignItems: "center", gap: 16,
      paddingTop: Platform.OS === 'web' ? 20 : (Platform.OS === 'ios' ? 72 : 56),
      paddingBottom: 16,
    },
    backBtn: {
      width: 42, height: 42, borderRadius: 21, backgroundColor: elementBg, borderWidth: 1, borderColor: borderStyle, alignItems: "center", justifyContent: "center" 
    },
    backIcon: { 
      fontSize: 18, color: textPrimary, fontWeight: "600", marginTop: -2 
    },
    pageTitle: { 
      fontSize: 24, fontWeight: "900", color: textPrimary, letterSpacing: -0.5 
    },
    searchWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: elementBg,
      borderWidth: 1,
      borderColor: borderStyle,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    searchIcon: {
      fontSize: 15,
    },
    searchInput: {
      flex: 1,
      color: textPrimary,
      fontFamily: FontFamily.soraRegular || "System",
      padding: 0,
    },
    tabsRow: {
      flexDirection: "row",
      gap: 10,
      flexWrap: "wrap",
    },
    filterTab: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: borderStyle,
      backgroundColor: elementBg,
    },
    filterTabActive: {
      borderColor: Color.colorCyan50,
      backgroundColor: isDarkMode ? "rgba(0, 212, 255, 0.10)" : "rgba(0, 212, 255, 0.05)",
    },
    filterTabText: {
      color: textTertiary,
      fontSize: 12,
      fontFamily: FontFamily.soraSemiBold || "System",
    },
    filterTabTextActive: {
      color: Color.colorCyan50,
    },
    listSection: {
      gap: 12,
    },
    personCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 14,
      borderRadius: 18,
      backgroundColor: cardBg,
      borderWidth: 1,
      borderColor: borderStyle,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    avatarGlow: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      opacity: 0.45,
    },
    avatarText: {
      color: Color.colorWhiteSolid || "#ffffff",
      fontSize: 18,
      fontFamily: FontFamily.soraBold || "System",
      fontWeight: "700",
    },
    personInfo: {
      flex: 1,
      gap: 2,
    },
    personName: {
      color: textPrimary,
      fontSize: 14,
      fontFamily: FontFamily.soraBold || "System",
      fontWeight: "700",
    },
    personRole: {
      color: textSecondary,
      fontSize: 11,
      fontFamily: FontFamily.soraRegular || "System",
    },
    personScore: {
      color: Color.colorCyan50,
      fontSize: 11,
      fontFamily: FontFamily.soraSemiBold || "System",
    },
    personMutual: {
      color: textSecondary,
      fontSize: 11,
      fontFamily: FontFamily.soraRegular || "System",
    },
    actionButton: {
      minWidth: 90,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: Color.colorCyan50,
      alignItems: "center",
      justifyContent: "center",
    },
    actionButtonConnected: {
      backgroundColor: isDarkMode ? (Color.colorBlue15 || "#1a1f30") : "#e2e8f0",
      borderWidth: 1,
      borderColor: borderStyle,
    },
    actionButtonText: {
      color: Color.colorBlue8 || "#060612",
      fontSize: 12,
      fontFamily: FontFamily.soraBold || "System",
      fontWeight: "700",
    },
    actionButtonTextConnected: {
      color: textPrimary,
    },
    suggestedTitle: {
      marginTop: 4,
      color: textTertiary,
      fontSize: 12,
      fontFamily: FontFamily.soraBold || "System",
      fontWeight: "700",
      letterSpacing: 1,
    },
    suggestedGrid: {
      flexDirection: "row",
      gap: 12,
    },
    suggestedCard: {
      flex: 1,
      padding: 12,
      borderRadius: 18,
      backgroundColor: cardBg,
      borderWidth: 1,
      borderColor: borderStyle,
      alignItems: "center",
      gap: 8,
    },
    suggestedBadgeWrap: {
      width: "100%",
      alignItems: "flex-start",
    },
    suggestedBadge: {
      color: Color.colorSpringGreen39 || "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.14)",
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
      fontSize: 10,
      fontFamily: FontFamily.soraSemiBold || "System",
    },
    suggestedAvatar: {
      width: 44,
      height: 44,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    suggestedAvatarGlow: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      opacity: 0.45,
    },
    suggestedName: {
      color: textPrimary,
      fontSize: 14,
      fontFamily: FontFamily.soraBold || "System",
      fontWeight: "700",
      textAlign: "center",
    },
    suggestedRole: {
      color: textSecondary,
      fontSize: 11,
      fontFamily: FontFamily.soraRegular || "System",
      textAlign: "center",
    },
    suggestedMutual: {
      color: textSecondary,
      fontSize: 11,
      fontFamily: FontFamily.soraRegular || "System",
      textAlign: "center",
    },
    sharedSkillsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 4,
      marginTop: 5,
    },
    skillChip: {
      backgroundColor: isDarkMode ? "rgba(0, 212, 255, 0.12)" : "rgba(0, 130, 200, 0.08)",
      borderWidth: 1,
      borderColor: isDarkMode ? "rgba(0, 212, 255, 0.3)" : "rgba(0, 130, 200, 0.25)",
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    skillChipText: {
      color: Color.colorCyan50 || "#00d4ff",
      fontSize: 9,
      fontFamily: FontFamily.soraSemiBold || "System",
      textTransform: "capitalize",
    },
    skillChipMore: {
      color: textTertiary,
      fontSize: 9,
      fontFamily: FontFamily.soraRegular || "System",
      alignSelf: "center",
    },

    suggestedActionButton: {
      minWidth: 90,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: Color.colorCyan50,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
    },
    loadingWrap: {
      paddingVertical: 40,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    loadingText: {
      color: Color.colorCyan50,
      fontSize: 13,
      fontWeight: "600",
    },
    noResultsCard: {
      padding: 24,
      borderRadius: 18,
      backgroundColor: cardBg,
      borderWidth: 1,
      borderColor: borderStyle,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    noResultsText: {
      color: textTertiary,
      fontSize: 12.5,
      textAlign: "center",
    },
  });
};

export default ConnectionsScreen;
