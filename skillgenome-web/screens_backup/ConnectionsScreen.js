import * as React from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import { Color, FontFamily, FontSize, Padding, StyleVariable, Border } from "../GlobalStyles";
import { supabase } from "../utils/supabase";
import { t } from "../utils/translations";
import GlassCard from '../components/UI/GlassCard';

const ConnectionsScreen = ({ onBack, isDarkMode = true, language = 'English' }) => {
  const [activeTab, setActiveTab] = React.useState(0);
  const tabs = [
    t(language, "all"),
    t(language, "coStudents"),
    t(language, "mentors"),
    t(language, "pending"),
    t(language, "suggested")
  ];
  const [people, setPeople] = React.useState([]);
  const [suggested, setSuggested] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  const styles = React.useMemo(() => getStyles(isDarkMode), [isDarkMode]);

  const updateLocalStatus = (personId, newStatus) => {
    setPeople(prev => {
      const exists = prev.some(item => item.id === personId);
      if (exists) {
        if (newStatus === "Connect") {
          const item = prev.find(i => i.id === personId);
          if (item) {
            setSuggested(s => [...s, { ...item, status: newStatus }]);
          }
          return prev.filter(i => i.id !== personId);
        }
        return prev.map(item => item.id === personId ? { ...item, status: newStatus } : item);
      } else {
        if (newStatus === "Connected" || newStatus === "Pending") {
          const item = suggested.find(i => i.id === personId);
          if (item) {
            setSuggested(s => s.filter(i => i.id !== personId));
            return [...prev, { ...item, status: newStatus }];
          }
        }
      }
      return prev;
    });

    setSuggested(prev => {
      const exists = prev.some(item => item.id === personId);
      if (exists) {
        if (newStatus === "Connected" || newStatus === "Pending") {
          const item = prev.find(i => i.id === personId);
          if (item) {
            setPeople(p => [...p, { ...item, status: newStatus }]);
          }
          return prev.filter(i => i.id !== personId);
        }
        return prev.map(item => item.id === personId ? { ...item, status: newStatus } : item);
      } else {
        if (newStatus === "Connect") {
          const item = people.find(i => i.id === personId);
          if (item) {
            setPeople(p => p.filter(i => i.id !== personId));
            return [...prev, { ...item, status: newStatus }];
          }
        }
      }
      return prev;
    });
  };

  React.useEffect(() => {
    const fetchDynamicConnections = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setPeople([]);
          setSuggested([]);
          return;
        }

        // Fetch current user's own profile to get their skills
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('skills')
          .eq('id', user.id)
          .single();

        const mySkills = (myProfile?.skills || []).map(s => s.toLowerCase().trim());

        const { data: allProfiles, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user.id);

        if (profError) throw profError;

        const { data: reqData, error: reqError } = await supabase
          .from('mentorship_requests')
          .select('*')
          .or(`student_id.eq.${user.id},mentor_id.eq.${user.id}`);

        if (reqError) throw reqError;
        const requests = reqData || [];

        if (allProfiles && allProfiles.length > 0) {
          const palettes = [
            ["#38bdf8", "#7c3aed"],
            ["#a855f7", "#ec4899"],
            ["#3b82f6", "#10b981"],
            ["#f59e0b", "#ef4444"],
            ["#14b8a6", "#6366f1"],
          ];

          const mapped = allProfiles.map((profile, index) => {
            const initials = profile.name ? profile.name.charAt(0).toUpperCase() : "U";
            const tone = palettes[index % palettes.length];
            const mutual = Math.floor(Math.random() * 8) + 1;

            // Compute skill-overlap score using Jaccard similarity
            const theirSkills = (profile.skills || []).map(s => s.toLowerCase().trim());
            const shared = mySkills.filter(s => theirSkills.includes(s));
            const union = Array.from(new Set([...mySkills, ...theirSkills]));
            const score = union.length > 0
              ? Math.round((shared.length / union.length) * 100)
              : Math.floor(Math.random() * 30) + 50; // fallback if no skills stored

            const req = requests.find(r =>
              (r.student_id === user.id && r.mentor_id === profile.id) ||
              (r.mentor_id === user.id && r.student_id === profile.id)
            );

            let status = "Connect";
            if (req) {
              if (req.status === 'accepted') status = "Connected";
              else if (req.status === 'pending') status = "Pending";
            }

            return {
              id: profile.id,
              name: profile.name,
              userRole: profile.role || 'student',
              role: profile.title || (profile.role === 'mentor' ? 'Expert Mentor' : 'Software Candidate'),
              scoreLabel: `Genome Score: ${score}%`,
              mutual: mutual,
              status: status,
              initials: initials,
              tone: tone,
              badge: `${score}% matched`,
              skillScore: score,
              sharedSkills: shared,
            };
          });

          const connectionPeople = mapped.filter(item => item.status === "Connected" || item.status === "Pending");
          // Sort suggestions by skill overlap descending — highest match first
          const recommendedSuggested = mapped
            .filter(item => item.status === "Connect")
            .sort((a, b) => b.skillScore - a.skillScore);

          setPeople(connectionPeople);
          setSuggested(recommendedSuggested);
        } else {
          setPeople([]);
          setSuggested([]);
        }
      } catch (err) {
        console.warn("[ConnectionsScreen] Exception fetching connections from DB:", err.message);
        setPeople([]);
        setSuggested([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicConnections();
  }, []);



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
        const { error } = await supabase
          .from('mentorship_requests')
          .insert({
            student_id: user.id,
            mentor_id: personId,
            message: "Hi, let's connect and share skill genomes!",
            status: 'pending'
          });

        if (!error) {
          updateLocalStatus(personId, "Pending");
        }
      } else if (currentItem.status === "Pending") {
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
            const { error } = await supabase
              .from('mentorship_requests')
              .update({ status: 'accepted' })
              .eq('id', req.id);

            if (!error) {
              updateLocalStatus(personId, "Connected");
            }
          } else {
            const { error } = await supabase
              .from('mentorship_requests')
              .delete()
              .eq('id', req.id);

            if (!error) {
              updateLocalStatus(personId, "Connect");
            }
          }
        }
      } else if (currentItem.status === "Connected") {
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

          if (!error) {
            updateLocalStatus(personId, "Connect");
          }
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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => typeof onBack === "function" && onBack()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.topBarTitle}>{t(language, "connections")}</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={t(language, "searchConnectionsPlaceholder")}
          placeholderTextColor={isDarkMode ? (Color.colorBlue42 || "#5a5a7a") : "#64748b"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Text style={{ color: Color.colorCyan50, fontSize: 12, marginRight: 4 }}>{t(language, "clear")}</Text>
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
          <Text style={styles.loadingText}>{t(language, "syncingConnections")}</Text>
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
                    ? t(language, "connected") 
                    : (person.status === "Pending" ? t(language, "pending") : t(language, "connect"));
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
                    ? t(language, "connected") 
                    : (person.status === "Pending" ? t(language, "pending") : t(language, "connect"));
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
                <Text style={styles.noResultsText}>{t(language, "noConnections")}</Text>
              </View>
            )}
          </View>

          <Text style={styles.suggestedTitle}>{t(language, "suggested").toUpperCase() + " " + t(language, "connections").toUpperCase()}</Text>

          {suggestedStudents.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Suggested Co-Students</Text>
              <View style={styles.suggestedGrid}>
                {suggestedStudents.map((item) => {
                  const isConnected = item.status === "Connected";
                  const displayStatus = isConnected ? t(language, "connected") : t(language, "connect");
                  return (
                    <View key={item.id} style={styles.suggestedCard}>
                      <View style={styles.suggestedBadgeWrap}>
                        <Text style={styles.suggestedBadge}>{item.badge}</Text>
                      </View>
                      <View style={[styles.suggestedAvatar, { backgroundColor: item.tone[0] }]}>
                        <View style={[styles.suggestedAvatarGlow, { backgroundColor: item.tone[1] }]} />
                        <Text style={styles.avatarText}>{item.initials}</Text>
                      </View>
                      <Text style={styles.suggestedName}>{item.name}</Text>
                      <Text style={styles.suggestedRole}>{item.role}</Text>
                      <Text style={styles.suggestedMutual}>{item.mutual} mutual connections</Text>

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
                        style={[styles.suggestedActionButton, isConnected && styles.actionButtonConnected]}
                        onPress={() => toggleConnection(item.id, true)}
                      >
                        <Text style={[styles.actionButtonText, isConnected && styles.actionButtonTextConnected]}>
                          {displayStatus}
                        </Text>
                      </Pressable>
                    </View>
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
                  const isConnected = item.status === "Connected";
                  const displayStatus = isConnected ? t(language, "connected") : t(language, "connect");
                  return (
                    <View key={item.id} style={styles.suggestedCard}>
                      <View style={styles.suggestedBadgeWrap}>
                        <Text style={styles.suggestedBadge}>{item.badge}</Text>
                      </View>
                      <View style={[styles.suggestedAvatar, { backgroundColor: item.tone[0] }]}>
                        <View style={[styles.suggestedAvatarGlow, { backgroundColor: item.tone[1] }]} />
                        <Text style={styles.avatarText}>{item.initials}</Text>
                      </View>
                      <Text style={styles.suggestedName}>{item.name}</Text>
                      <Text style={styles.suggestedRole}>{item.role}</Text>
                      <Text style={styles.suggestedMutual}>{item.mutual} mutual connections</Text>

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
                        style={[styles.suggestedActionButton, isConnected && styles.actionButtonConnected]}
                        onPress={() => toggleConnection(item.id, true)}
                      >
                        <Text style={[styles.actionButtonText, isConnected && styles.actionButtonTextConnected]}>
                          {displayStatus}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {filteredSuggested.length === 0 && (
            <View style={styles.noResultsCard}>
              <Text style={styles.noResultsText}>{t(language, "noSuggestions")}</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
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
      paddingTop: 48,
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
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: elementBg,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: borderStyle,
    },
    backText: {
      color: textPrimary,
      fontSize: 18,
      fontWeight: "700",
    },
    topBarTitle: {
      color: textPrimary,
      fontSize: 15,
      fontFamily: FontFamily.soraBold || "System",
      fontWeight: StyleVariable.fontWeight700 || "800",
    },
    topBarSpacer: {
      width: 40,
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
