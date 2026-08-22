import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Animated, useWindowDimensions, Alert, Image, Modal, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../utils/supabase";
import { getTheme } from "../utils/theme";
import CohortCreationWizard from "../components/CohortCreationWizard";
import MentorSessionsTab from "../components/MentorSessionsTab";
import MentorLiveSession from "../components/MentorLiveSession";
import MentorMessagesTab from "../components/MentorMessagesTab";
import MentorCohortsTab from "../components/MentorCohortsTab";
import MentorStudentsTab from "../components/MentorStudentsTab";
import MentorReportsTab from "../components/MentorReportsTab";
import MentorStudentDetailModal from "../components/MentorStudentDetailModal";
import MentorAvailabilityTab from "../components/MentorAvailabilityTab";
import MentorLibraryTab from "../components/MentorLibraryTab";
import MentorProfileTab from "../components/MentorProfileTab";
import MentorHelpTab from "../components/MentorHelpTab";

const getColors = (isDarkMode) => isDarkMode ? ({
  bg: "#07111f",
  surface: "#101826",
  surface2: "#162033",
  border: "rgba(255,255,255,0.06)",
  borderLow: "rgba(255,255,255,0.06)",
  text: "#f8fafc",
  muted: "#9aa7bf",
  subtle: "#475569",
  violet: "#8b5cf6",
  blue: "#3b82f6",
  accent: "#8b5cf6",
  cyan: "#38bdf8",
  amber: "#fbbf24",
  red: "#f43f5e",
  green: "#34d399"
}) : ({
  bg: "#f8fafc",
  surface: "#ffffff",
  surface2: "#f1f5f9",
  border: "#e2e8f0",
  borderLow: "#f1f5f9",
  text: "#0f172a",
  muted: "#64748b",
  subtle: "#94a3b8",
  violet: "#8b5cf6",
  blue: "#3b82f6",
  accent: "#8b5cf6",
  cyan: "#0ea5e9",
  amber: "#f59e0b",
  red: "#e11d48",
  green: "#10b981"
});

export default function MentorDashboardScreen({ profile = { name: "Mentor", title: "Principal Engineer", verified: true }, onUpdateProfile, onLogout, onOpenSettings, onOpenProfile, onOpenMentorNotifications, isDarkMode = true, language = 'English' }) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isWide = isWeb && width >= 1024;

  const T = getColors(isDarkMode);
  const S = React.useMemo(() => getStyles(T, isWide), [T, isWide]);

  const [activeCategory, setActiveCategory] = React.useState("workspace");
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [selectedCohortId, setSelectedCohortId] = React.useState(null);
  const [showWizard, setShowWizard] = React.useState(false);
  const [activeLiveSession, setActiveLiveSession] = React.useState(null);
  const [activeStudent, setActiveStudent] = React.useState(null);

  const [showDeclineModal, setShowDeclineModal] = React.useState(false);
  const [declineReason, setDeclineReason] = React.useState("");
  const [selectedRequestId, setSelectedRequestId] = React.useState(null);

  const [dashboardData, setDashboardData] = React.useState({
    activeCohortsCount: 0,
    totalMentees: 0,
    pendingRequests: [],
    upcomingSessionsCount: 0,
    todaySessions: [],
    cohortHealth: [],
    loading: true
  });

  React.useEffect(() => {
    if (!profile?.id) return;

    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true }));

        // Fetch active cohorts
        const { data: cohortsData, error: cohortsError } = await supabase
          .from('cohorts')
          .select('id, name')
          .eq('mentor_id', profile.id);

        if (cohortsError) throw cohortsError;

        // Fetch upcoming sessions count and today's sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('mentor_sessions')
          .select('id, scheduled_for, topic, cohorts(name, duration_weeks)')
          .in('cohort_id', cohortsData ? cohortsData.map(c => c.id) : [])
          .eq('status', 'Scheduled');

        let sessionsCount = sessionsData ? sessionsData.length : 0;
        let todaySessions = [];
        if (sessionsData) {
          const today = new Date();
          todaySessions = sessionsData.filter(s => {
            const d = new Date(s.scheduled_for);
            return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
          });
        }

        const { count: acceptedMenteesCount } = await supabase
          .from('mentorship_requests')
          .select('id', { count: 'exact', head: true })
          .eq('mentor_id', profile.id)
          .eq('status', 'accepted');

        const totalMenteesCount = acceptedMenteesCount || 0;

        // Fetch pending mentorship requests
        const { data: requestsData } = await supabase
          .from('mentorship_requests')
          .select('id, student_id, status, profiles!student_id(name, avatar_url, title)')
          .eq('mentor_id', profile.id)
          .eq('status', 'pending');

        const cohortHealth = cohortsData ? cohortsData.map(c => ({
          name: c.name,
          health: Math.floor(Math.random() * 30) + 70 // Mocked health logic
        })) : [];

        setDashboardData({
          activeCohortsCount: cohortsData?.length || 0,
          totalMentees: totalMenteesCount,
          pendingRequests: requestsData || [],
          upcomingSessionsCount: sessionsCount || 0,
          todaySessions,
          cohortHealth,
          loading: false
        });
      } catch (err) {
        console.warn("Failed to fetch mentor dashboard stats", err);
        setDashboardData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();

    const requestsSubscription = supabase
      .channel(`mentorship_requests_channel_${profile.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentorship_requests', filter: `mentor_id=eq.${profile.id}` }, payload => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(requestsSubscription);
    };
  }, [profile?.id]);

  const handleAcceptRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('mentorship_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);
      if (error) throw error;

      // Update UI optimistically to remove the accepted request
      setDashboardData(prev => ({
        ...prev,
        pendingRequests: prev.pendingRequests.filter(r => r.id !== requestId)
      }));

      Alert.alert("Success", "Mentorship request accepted!");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleDeclineRequestClick = (id) => {
    setSelectedRequestId(id);
    setDeclineReason("");
    setShowDeclineModal(true);
  };

  const handleDeclineSubmit = async () => {
    if (!selectedRequestId) return;
    try {
      const { error } = await supabase
        .from('mentorship_requests')
        .update({ status: 'declined', message: declineReason })
        .eq('id', selectedRequestId);
      if (error) throw error;

      setDashboardData(prev => ({
        ...prev,
        pendingRequests: prev.pendingRequests.filter(r => r.id !== selectedRequestId)
      }));

      setShowDeclineModal(false);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const NAV_CATEGORIES = [
    { id: "workspace", icon: "📊", label: "Workspace" },
    { id: "communication", icon: "💬", label: "Communication" },
    { id: "analytics", icon: "📈", label: "Analytics" },
    { id: "tools", icon: "⚙️", label: "Tools" },
  ];

  const SUB_TABS = {
    workspace: [
      { id: "dashboard", label: "Dashboard" },
      { id: "cohorts", label: "My Cohorts" },
      { id: "students", label: "List of Students" },
      { id: "accepted", label: "Accepted Students" },
    ],
    communication: [
      { id: "sessions", label: "Sessions" },
      { id: "messages", label: "Messages" },
    ],
    analytics: [
      { id: "reports", label: "Reports" },
    ],
    tools: [
      { id: "library", label: "Resource Library" },
      { id: "availability", label: "Availability" },
      { id: "profile", label: "My Profile" },
      { id: "help", label: "Help" },
    ]
  };

  const handleCategoryPress = (catId) => {
    setActiveCategory(catId);
    setActiveTab(SUB_TABS[catId][0].id);
  };

  // Using real data from Supabase
  const STATS = [
    { label: "Active Cohorts", val: dashboardData.activeCohortsCount.toString(), c: T.cyan },
    { label: "Total Mentees", val: dashboardData.totalMentees.toString(), c: T.accent },
    { label: "Upcoming Sessions", val: dashboardData.pendingRequests.length.toString(), c: T.amber },
  ];

  const renderTopBar = () => (
    <View style={S.topBar}>
      <View style={S.topBarLeft}>
        <Text style={S.logoText}>SkillGenome OS <Text style={{ color: T.accent }}>· Mentor</Text></Text>
      </View>

      <View style={S.topBarRight}>
        <Pressable style={S.iconBtn} onPress={onOpenMentorNotifications}><Text style={S.iconText}>🔔</Text></Pressable>
        <Pressable style={S.iconBtn} onPress={() => setShowWizard(true)}><Text style={S.iconText}>➕</Text></Pressable>
        <Pressable style={S.iconBtn} onPress={onOpenSettings}><Text style={S.iconText}>⚙️</Text></Pressable>

        <Pressable style={S.profileChip} onPress={() => { setActiveCategory("tools"); setActiveTab("profile"); }}>
          {profile.avatarUrl || profile.avatar_url ? (
            <Image source={{ uri: profile.avatarUrl || profile.avatar_url }} style={[S.avatarSm, { resizeMode: 'cover' }]} />
          ) : (
            <LinearGradient colors={[T.accent, T.purple]} style={S.avatarSm}>
              <Text style={S.avatarTextSm}>{profile.name?.[0]}</Text>
            </LinearGradient>
          )}
          {isWide && (
            <View>
              <Text style={S.profileName}>{profile.name} {profile.verified && "✓"}</Text>
              <Text style={S.profileRole}>{profile.title}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );

  const renderLeftNav = () => (
    <ScrollView style={S.leftNav} showsVerticalScrollIndicator={false}>
      {NAV_CATEGORIES.map(cat => (
        <View key={cat.id} style={{ marginBottom: 12 }}>
          <Pressable
            style={[S.navCat, activeCategory === cat.id && S.navCatActiveContainer]}
            onPress={() => handleCategoryPress(cat.id)}
          >
            {activeCategory === cat.id ? (
              <LinearGradient colors={['#9b51e0', '#6f42c1']} style={S.navCatGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={S.navIcon}>{cat.icon}</Text>
                <Text style={[S.navCatLabel, S.navCatLabelActive]}>{cat.label}</Text>
              </LinearGradient>
            ) : (
              <View style={S.navCatInner}>
                <Text style={S.navIcon}>{cat.icon}</Text>
                <Text style={S.navCatLabel}>{cat.label}</Text>
              </View>
            )}
          </Pressable>

          {activeCategory === cat.id && (
            <View style={S.subTabsContainer}>
              {SUB_TABS[cat.id].map(sub => (
                <Pressable
                  key={sub.id}
                  style={[S.subTab, activeTab === sub.id && S.subTabActive]}
                  onPress={() => { setActiveTab(sub.id); setSelectedCohortId(null); }}
                >
                  <Text style={[S.subTabLabel, activeTab === sub.id && S.subTabLabelActive]}>{sub.label}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderRightPanel = () => (
    <View style={S.rightPanel}>
      <View style={S.widgetCard}>
        <Text style={S.widgetTitle}>TODAY'S SESSIONS</Text>
        <View style={S.widgetContent}>
          {dashboardData.todaySessions.length === 0 ? (
            <Text style={{ color: T.muted }}>No sessions today.</Text>
          ) : (
            dashboardData.todaySessions.map(s => (
              <View key={s.id} style={S.sessionRow}>
                <Text style={S.sessionTime}>{new Date(s.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                <View style={S.sessionInfo}>
                  <Text style={S.sessionTitle}>{s.topic}</Text>
                  <Text style={S.sessionSub}>{s.cohorts?.name}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      <View style={S.widgetCard}>
        <Text style={S.widgetTitle}>PENDING ACTIONS</Text>
        <View style={S.widgetContent}>
          {dashboardData.pendingRequests.length === 0 ? (
            <Text style={{ color: T.muted }}>No pending actions.</Text>
          ) : (
            dashboardData.pendingRequests.map(r => {
              const profileObj = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
              const studentName = profileObj?.name || 'A student';
              const avatar = profileObj?.avatar_url;
              return (
                <View key={r.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: 12, backgroundColor: T.surface2, borderRadius: 12 }}>
                  <Pressable onPress={() => onOpenUserProfile && onOpenUserProfile(r.student_id)} style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
                    {avatar ? (
                      <Image source={{ uri: avatar }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} />
                    ) : (
                      <View style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: T.accent, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{studentName.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: T.text, fontWeight: '700', fontSize: 14 }}>{studentName}</Text>
                      <Text style={{ color: T.muted, fontSize: 12 }}>wants to connect</Text>
                    </View>
                  </Pressable>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable
                      onPress={() => handleDeclineRequestClick(r.id)}
                      style={{ backgroundColor: T.surface, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: T.borderLow }}
                    >
                      <Text style={{ color: T.text, fontSize: 12, fontWeight: 'bold' }}>Decline</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleAcceptRequest(r.id)}
                      style={{ backgroundColor: T.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
                    >
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Accept</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
          <Text style={[S.alertText, { marginTop: 8 }]}>• {dashboardData.upcomingSessionsCount} upcoming sessions</Text>
        </View>
      </View>

      <View style={S.widgetCard}>
        <Text style={S.widgetTitle}>COHORT HEALTH</Text>
        <View style={S.widgetContent}>
          {dashboardData.cohortHealth.length === 0 ? (
            <View style={{ alignItems: 'center', gap: 12 }}>
              <Text style={{ color: T.muted, textAlign: 'center' }}>No active cohorts yet.</Text>
              <Pressable style={{ backgroundColor: T.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }} onPress={() => setShowWizard(true)}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Create Cohort</Text>
              </Pressable>
            </View>
          ) : (
            dashboardData.cohortHealth.map((c, i) => (
              <View key={i} style={S.healthRow}>
                <Text style={S.healthLabel}>{c.name}</Text>
                <Text style={[S.healthScore, { color: c.health >= 80 ? T.green : T.amber }]}>{c.health}/100</Text>
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  );

  const renderDashboardCenter = () => (
    <View style={S.centerContent}>
      <Text style={S.pageTitle}>Welcome back, {profile.name}</Text>
      <Text style={S.pageSub}>Here's a quick overview of your mentoring activity.</Text>

      <View style={S.statsGrid}>
        {STATS.map(s => (
          <View key={s.label} style={S.statBox}>
            <Text style={[S.statVal, { color: s.c }]}>{s.val}</Text>
            <Text style={S.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={S.recentSection}>
        <Text style={S.sectionHeader}>RECENT ACTIVITY</Text>
        <View style={S.emptyState}>
          <Text style={S.emptyText}>No recent activity yet.</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[S.root, { backgroundColor: 'transparent' }]}>
      {/* Background Glows */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient colors={[`${T.violet}15`, "transparent"]} style={{ position: 'absolute', top: -100, left: -50, width: 400, height: 400, borderRadius: 200 }} />
        <LinearGradient colors={[`${T.blue}12`, "transparent"]} style={{ position: 'absolute', bottom: -50, right: -100, width: 300, height: 300, borderRadius: 150 }} />
      </View>

      {renderTopBar()}

      {isWide ? (
        <View style={S.mainLayout}>
          <View style={S.leftCol}>{renderLeftNav()}</View>
          <ScrollView style={S.centerCol} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
            {activeTab === 'dashboard' ? renderDashboardCenter() :
              activeTab === 'sessions' ? <MentorSessionsTab profile={profile} T={T} onJoinLive={(s) => setActiveLiveSession(s)} /> :
                activeTab === 'messages' ? <MentorMessagesTab profile={profile} T={T} /> :
                  activeTab === 'cohorts' ? <MentorCohortsTab profile={profile} T={T} onCreateCohort={() => setShowWizard(true)} /> :
                    activeTab === 'students' ? <MentorStudentsTab profile={profile} T={T} mode="cohort" onSelectStudent={setActiveStudent} selectedCohortId={selectedCohortId} /> :
                      activeTab === 'accepted' ? <MentorStudentsTab profile={profile} T={T} mode="accepted" onSelectStudent={setActiveStudent} /> :
                        activeTab === 'reports' ? <MentorReportsTab profile={profile} T={T} selectedCohortId={selectedCohortId} /> :
                          activeTab === 'library' ? <MentorLibraryTab profile={profile} T={T} /> :
                            activeTab === 'availability' ? <MentorAvailabilityTab profile={profile} T={T} /> :
                              activeTab === 'profile' ? <MentorProfileTab profile={profile} onUpdateProfile={onUpdateProfile} T={T} /> :
                                activeTab === 'help' ? <MentorHelpTab T={T} /> : (
                                  <View style={S.centerContent}><Text style={S.pageTitle}>{SUB_TABS[activeCategory]?.find(n => n.id === activeTab)?.label}</Text></View>
                                )}
          </ScrollView>
          {activeTab === 'dashboard' && (
            <ScrollView style={S.rightCol} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
              {renderRightPanel()}
            </ScrollView>
          )}
        </View>
      ) : (
        <View style={S.mainLayoutMobile}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.mobileCatNav}>
            {NAV_CATEGORIES.map(cat => (
              <Pressable
                key={cat.id}
                style={[S.mobileCatItemContainer, activeCategory === cat.id && S.mobileCatItemActiveContainer]}
                onPress={() => handleCategoryPress(cat.id)}
              >
                {activeCategory === cat.id ? (
                  <LinearGradient colors={['#9b51e0', '#6f42c1']} style={S.mobileCatGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={[S.mobileCatLabel, S.mobileCatLabelActive]}>{cat.icon} {cat.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={S.mobileCatItem}>
                    <Text style={S.mobileCatLabel}>{cat.icon} {cat.label}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.mobileSubNav}>
            {SUB_TABS[activeCategory].map(sub => (
              <Pressable
                key={sub.id}
                style={[S.mobileSubItem, activeTab === sub.id && S.mobileSubItemActive]}
                onPress={() => { setActiveTab(sub.id); setSelectedCohortId(null); }}
              >
                <Text style={[S.mobileSubLabel, activeTab === sub.id && S.mobileSubLabelActive]}>{sub.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={S.centerColMobileContent} showsVerticalScrollIndicator={false}>
            {activeTab === 'dashboard' ? renderDashboardCenter() :
              activeTab === 'sessions' ? <MentorSessionsTab profile={profile} T={T} onJoinLive={(s) => setActiveLiveSession(s)} /> :
                activeTab === 'messages' ? <MentorMessagesTab profile={profile} T={T} /> :
                  activeTab === 'cohorts' ? <MentorCohortsTab profile={profile} T={T} onCreateCohort={() => setShowWizard(true)} /> :
                    activeTab === 'students' ? <MentorStudentsTab profile={profile} T={T} mode="cohort" onSelectStudent={setActiveStudent} selectedCohortId={selectedCohortId} /> :
                      activeTab === 'accepted' ? <MentorStudentsTab profile={profile} T={T} mode="accepted" onSelectStudent={setActiveStudent} /> :
                        activeTab === 'reports' ? <MentorReportsTab profile={profile} T={T} selectedCohortId={selectedCohortId} /> :
                          activeTab === 'library' ? <MentorLibraryTab profile={profile} T={T} /> :
                            activeTab === 'availability' ? <MentorAvailabilityTab profile={profile} T={T} /> :
                              activeTab === 'profile' ? <MentorProfileTab profile={profile} onUpdateProfile={onUpdateProfile} T={T} /> :
                                activeTab === 'help' ? <MentorHelpTab T={T} /> : (
                                  <View style={S.centerContent}><Text style={S.pageTitle}>{SUB_TABS[activeCategory]?.find(n => n.id === activeTab)?.label}</Text></View>
                                )}
            {activeTab === 'dashboard' && <View style={{ marginTop: 40 }}>{renderRightPanel()}</View>}
          </ScrollView>
        </View>
      )}

      <CohortCreationWizard
        visible={showWizard}
        onClose={() => setShowWizard(false)}
        mentorProfile={profile}
        T={T}
        onCohortCreated={() => setActiveTab('cohorts')}
      />

      {activeLiveSession && (
        <MentorLiveSession
          session={activeLiveSession}
          mentorProfile={profile}
          T={T}
          onClose={() => setActiveLiveSession(null)}
        />
      )}

      {activeStudent && (
        <MentorStudentDetailModal
          student={activeStudent}
          onClose={() => setActiveStudent(null)}
          onViewFullProfile={() => {
            setActiveStudent(null);
            if (onOpenUserProfile) onOpenUserProfile(activeStudent.id);
          }}
          T={T}
        />
      )}

      <Modal visible={showDeclineModal} transparent animationType="fade">
        <View style={S.modalOverlay}>
          <View style={[S.modalContent, { backgroundColor: T.surface }]}>
            <Text style={[S.modalTitle, { color: T.text }]}>Decline Request</Text>
            <Text style={[S.modalSub, { color: T.muted }]}>Provide a reason for declining this request. This will be shown to the student.</Text>
            <TextInput
              style={[S.textInput, { color: T.text, backgroundColor: T.bg, borderColor: T.borderLow }]}
              placeholder="e.g. I am currently at capacity..."
              placeholderTextColor={T.subtle}
              value={declineReason}
              onChangeText={setDeclineReason}
              multiline
            />
            <View style={S.modalActions}>
              <Pressable style={S.modalBtnCancel} onPress={() => setShowDeclineModal(false)}>
                <Text style={S.modalBtnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={S.modalBtnConfirm} onPress={handleDeclineSubmit}>
                <Text style={S.modalBtnConfirmText}>Decline</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const getStyles = (T, isWide) => StyleSheet.create({
  root: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 400, borderRadius: 16, padding: 24, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  modalSub: { fontSize: 14, marginBottom: 16, lineHeight: 20 },
  textInput: { borderWidth: 1, borderRadius: 8, padding: 12, height: 100, textAlignVertical: 'top', fontSize: 14, marginBottom: 24 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalBtnCancel: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  modalBtnCancelText: { color: T.muted, fontWeight: '600' },
  modalBtnConfirm: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: T.red },
  modalBtnConfirmText: { color: '#fff', fontWeight: 'bold' },
  glowTopLeft: { position: "absolute", top: -100, left: -100, width: 500, height: 500, borderRadius: 250 },
  glowBottomRight: { position: "absolute", bottom: -100, right: -100, width: 400, height: 400, borderRadius: 200 },

  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: isWide ? 24 : 16, paddingTop: Platform.OS === 'ios' ? 54 : 40, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: T.borderLow, backgroundColor: T.surface },
  topBarLeft: { flexDirection: "row", alignItems: "center", flexShrink: 1, marginRight: 10 },
  logoText: { fontSize: isWide ? 18 : 16, fontWeight: "800", color: T.text, letterSpacing: -0.5 },

  topBarRight: { flexDirection: "row", alignItems: "center", gap: isWide ? 16 : 8 },
  iconBtn: { width: isWide ? 36 : 32, height: isWide ? 36 : 32, borderRadius: 18, backgroundColor: T.surface2, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: T.borderLow },
  iconText: { fontSize: isWide ? 16 : 14 },

  profileChip: { flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: isWide ? 8 : 4, borderLeftWidth: 1, borderLeftColor: T.borderLow },
  avatarSm: { width: isWide ? 36 : 32, height: isWide ? 36 : 32, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarTextSm: { fontSize: isWide ? 16 : 14, fontWeight: "800", color: "#fff" },
  profileName: { fontSize: 13, fontWeight: "700", color: T.text },
  profileRole: { fontSize: 11, color: T.muted },

  mainLayout: { flex: 1, flexDirection: "row", width: "100%", paddingHorizontal: isWide ? 40 : 0 },
  leftCol: { width: 280, borderRightWidth: 1, borderRightColor: T.borderLow, paddingVertical: 32 },
  centerCol: { flex: 1, paddingHorizontal: isWide ? 40 : 32, paddingVertical: 24 },
  rightCol: { width: 340, padding: 24, borderLeftWidth: 1, borderLeftColor: T.borderLow },

  mainLayoutMobile: { flex: 1, flexDirection: "column" },
  mobileCatNav: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: T.borderLow, paddingHorizontal: 16, paddingVertical: 12 },
  mobileCatItemContainer: { marginRight: 8 },
  mobileCatItemActiveContainer: {},
  mobileCatItem: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 24, backgroundColor: 'transparent' },
  mobileCatGradient: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 24 },
  mobileCatLabel: { fontSize: 16, fontWeight: "600", color: T.muted },
  mobileCatLabelActive: { color: "#ffffff", fontWeight: "700" },

  mobileSubNav: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: T.borderLow, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: 'rgba(0,0,0,0.2)' },
  mobileSubItem: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, marginRight: 8 },
  mobileSubItemActive: { backgroundColor: T.accent },
  mobileSubLabel: { fontSize: 13, fontWeight: "600", color: T.muted },
  mobileSubLabelActive: { color: '#fff', fontWeight: "700" },

  centerColMobileContent: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 100 },

  leftNav: { flex: 1, paddingHorizontal: 16 },
  navCat: { marginBottom: 6 },
  navCatActiveContainer: {},
  navCatInner: { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 18, paddingHorizontal: 24, borderRadius: 16 },
  navCatGradient: { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 18, paddingHorizontal: 24, borderRadius: 16 },
  navIcon: { fontSize: 26 },
  navCatLabel: { fontSize: 18, fontWeight: "600", color: T.muted },
  navCatLabelActive: { color: "#ffffff", fontWeight: "800" },

  subTabsContainer: { marginLeft: 24, marginTop: 8, paddingLeft: 20, borderLeftWidth: 2, borderLeftColor: T.borderLow, gap: 6 },
  subTab: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 },
  subTabActive: { backgroundColor: `${T.accent}20` },
  subTabLabel: { fontSize: 15, fontWeight: "600", color: T.muted },
  subTabLabelActive: { color: T.accent, fontWeight: "800" },

  centerContent: { flex: 1 },
  pageTitle: { fontSize: isWide ? 28 : 24, fontWeight: "900", color: T.text, letterSpacing: -0.5 },
  pageSub: { fontSize: isWide ? 15 : 14, color: T.muted, marginTop: 6, marginBottom: 24 },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 32 },
  statBox: { flex: 1, minWidth: 110, padding: 16, borderRadius: 20, backgroundColor: T.surface, borderWidth: 1, borderColor: T.borderLow, gap: 8 },
  statVal: { fontSize: 28, fontWeight: "900", letterSpacing: -1 },
  statLabel: { fontSize: 11, fontWeight: "700", color: T.muted, textTransform: "uppercase" },

  sectionHeader: { fontSize: 11, fontWeight: "800", color: T.subtle, letterSpacing: 1.5, marginBottom: 16 },
  emptyState: { padding: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: T.surface2, borderWidth: 1, borderColor: T.borderLow, borderStyle: "dashed" },
  emptyText: { color: T.muted, fontSize: 14, fontWeight: "500" },

  rightPanel: { gap: 24 },
  widgetCard: { gap: 12 },
  widgetTitle: { fontSize: 11, fontWeight: "800", color: T.subtle, letterSpacing: 1.2 },
  widgetContent: { padding: 16, borderRadius: 16, backgroundColor: T.surface, borderWidth: 1, borderColor: T.borderLow, gap: 12 },

  sessionRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  sessionTime: { fontSize: 14, fontWeight: "800", color: T.accent },
  sessionInfo: { flex: 1 },
  sessionTitle: { fontSize: 14, fontWeight: "700", color: T.text },
  sessionSub: { fontSize: 12, color: T.muted, marginTop: 2 },

  alertText: { fontSize: 13, color: T.text, fontWeight: "500", lineHeight: 20 },

  healthRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  healthLabel: { fontSize: 14, fontWeight: "600", color: T.text },
  healthScore: { fontSize: 14, fontWeight: "800" },
});


