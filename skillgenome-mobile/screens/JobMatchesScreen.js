import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Animated, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { t } from "../utils/translations";
import { getTheme } from "../utils/theme";

const DEFAULT_THEME = {
  accent: "#7c3aed",
  cyan: "#06b6d4",
  purple: "#a855f7",
  rose: "#fb7185",
  green: "#22c55e",
};

const generateDynamicJobs = (skills) => {
  const defaultSkills = ['React', 'Python', 'Node.js', 'Machine Learning', 'Data Science'];
  const activeSkills = (skills && skills.length > 0) ? skills : defaultSkills;
  
  return activeSkills.slice(0, 5).map((skill, index) => {
    const companies = ['Google', 'Microsoft', 'Stripe', 'Amazon', 'Meta'];
    const roles = ['Senior', 'Lead', 'Staff', 'Mid-level', 'Junior'];
    const locations = ['Remote', 'Hybrid', 'On-site'];
    const types = ['Full-time', 'Contract'];
    
    const co = companies[index % companies.length];
    
    let baseTitle = "Engineer";
    const s = skill.toLowerCase();
    if (s.includes('react') || s.includes('vue') || s.includes('angular') || s.includes('frontend')) baseTitle = "Frontend Developer";
    else if (s.includes('node') || s.includes('java') || s.includes('backend')) baseTitle = "Backend Engineer";
    else if (s.includes('data') || s.includes('sql') || s.includes('database')) baseTitle = "Data Engineer";
    else if (s.includes('machine') || s.includes('deep') || s.includes('tensor') || s.includes('ai') || s.includes('ml')) baseTitle = "AI/ML Engineer";
    else if (s.includes('python')) baseTitle = "Software Engineer";
    else baseTitle = `${skill} Specialist`;
    
    const title = `${roles[index % roles.length]} ${baseTitle}`;
    const match = Math.floor(Math.random() * 15) + 85;
    const baseSalary = 120 + (index * 15);
    
    const colors = [
      { c1: DEFAULT_THEME.accent, c2: DEFAULT_THEME.cyan },
      { c1: DEFAULT_THEME.purple, c2: DEFAULT_THEME.rose },
      { c1: DEFAULT_THEME.cyan, c2: DEFAULT_THEME.green },
      { c1: DEFAULT_THEME.green, c2: DEFAULT_THEME.accent },
      { c1: DEFAULT_THEME.rose, c2: DEFAULT_THEME.purple },
    ];
    const color = colors[index % colors.length];
    
    return {
      id: index + 1,
      co,
      title,
      loc: locations[index % locations.length],
      type: types[index % types.length],
      pay: "$" + baseSalary + "k - $" + (baseSalary + 40) + "k",
      baseSalary,
      match,
      c1: color.c1,
      c2: color.c2,
      req: [skill, activeSkills[(index + 1) % activeSkills.length] || 'SQL', 'Agile'],
      url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(title)}`
    };
  });
};

const fetchRealJobs = async (skills) => {
  try {
    const res = await fetch('https://jobicy.com/api/v2/remote-jobs?count=20&industry=programming,engineering');
    const data = await res.json();
    if (!data || !data.jobs) return null;
    
    return data.jobs.map((j, i) => {
      const match = Math.floor(Math.random() * 20) + 80;
      const baseSalary = 100 + Math.floor(Math.random() * 50);
      const colors = [
        { c1: DEFAULT_THEME.accent, c2: DEFAULT_THEME.cyan },
        { c1: DEFAULT_THEME.purple, c2: DEFAULT_THEME.rose },
        { c1: DEFAULT_THEME.cyan, c2: DEFAULT_THEME.green },
        { c1: DEFAULT_THEME.green, c2: DEFAULT_THEME.accent },
        { c1: DEFAULT_THEME.rose, c2: DEFAULT_THEME.purple },
      ];
      
      let reqs = ['Agile'];
      if (skills && skills.length > 0) {
        reqs = [skills[Math.floor(Math.random() * skills.length)], ...reqs];
      }
      
      return {
        id: j.id || (i + 1),
        co: j.companyName || 'Tech Corp',
        title: j.jobTitle || 'Software Engineer',
        loc: j.jobGeo || 'Remote',
        type: (j.jobType && j.jobType[0]) ? j.jobType[0] : 'Full-Time',
        pay: "$" + baseSalary + "k - $" + (baseSalary + 30) + "k",
        baseSalary,
        match,
        c1: colors[i % colors.length].c1,
        c2: colors[i % colors.length].c2,
        req: reqs,
        url: j.url
      };
    });
  } catch (err) {
    console.warn("Failed to fetch live jobs:", err);
    return null;
  }
};

const JobMatchesScreen = ({ onBack, onOpenJob, profileSkills = [], isDarkMode = true, language = 'English' }) => {
  const [liveJobs, setLiveJobs] = React.useState(null);
  
  React.useEffect(() => {
    fetchRealJobs(profileSkills).then(jobs => {
      if (jobs) setLiveJobs(jobs);
    });
  }, [profileSkills]);

  const JOBS = React.useMemo(() => liveJobs || generateDynamicJobs(profileSkills), [profileSkills, liveJobs]);
  
  const T = getTheme(isDarkMode);
  const S = React.useMemo(() => getStyles(T), [T]);
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;
  const [activeFilter, setActiveFilter] = React.useState('Best Match');

  const displayedJobs = React.useMemo(() => {
    let jobs = [...JOBS];
    if (activeFilter === 'Remote') {
      jobs = jobs.filter(j => j.loc === 'Remote');
    } else if (activeFilter === 'High Salary') {
      jobs.sort((a, b) => b.baseSalary - a.baseSalary);
    } else if (activeFilter === 'Recent') {
      jobs.sort((a, b) => b.id - a.id);
    } else {
      jobs.sort((a, b) => b.match - a.match);
    }
    return jobs;
  }, [JOBS, activeFilter]);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      {/* Ambient */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["rgba(6,182,212,0.15)", "transparent"]}
          style={{ position: "absolute", top: -80, right: -60, width: 340, height: 340, borderRadius: 170 }}
        />
      </View>

      <View style={S.header}>
        <Pressable style={S.backBtn} onPress={onBack}>
          <Text style={S.backIcon}>←</Text>
        </Pressable>
        <View>
          <Text style={S.pageTitle}>Career Matches</Text>
          <Text style={S.pageSub}>Based on your DNA genome</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 16 }}>
          
          <View style={S.filterRow}>
            {["Best Match", "Remote", "High Salary", "Recent"].map((f, i) => {
              const isActive = activeFilter === f;
              return (
                <Pressable key={f} onPress={() => setActiveFilter(f)} style={[S.filterChip, isActive && { borderColor: T.accent, backgroundColor: `${T.accent}15` }]}>
                  <Text style={[S.filterText, isActive && { color: T.accent, fontWeight: "700" }]}>{f}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={S.list}>
            {displayedJobs.map(j => {
              const matched = j.req.filter(s => profileSkills.map(p => (p||"").toLowerCase()).includes((s||"").toLowerCase()));
              return (
                <Pressable key={j.id} style={[S.jobCard, { borderColor: T.border }]} onPress={() => Linking.openURL(j.url || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(j.title)}`)}>
                  <View style={S.cardTop}>
                    <View style={S.cardLeft}>
                      <LinearGradient colors={[j.c1, j.c2]} style={S.logo}>
                        <Text style={S.logoText}>{j.co[0]}</Text>
                      </LinearGradient>
                      <View>
                        <Text style={S.jobTitle}>{j.title}</Text>
                        <Text style={S.jobCo}>{j.co}</Text>
                      </View>
                    </View>
                    <View style={[S.matchRing, { borderColor: j.c1 }]}>
                      <Text style={[S.matchNum, { color: j.c1 }]}>{j.match}%</Text>
                    </View>
                  </View>

                  <View style={S.metaWrap}>
                    <Text style={S.metaItem}>📍 {j.loc}</Text>
                    <Text style={S.metaItem}>💰 {j.pay}</Text>
                    <Text style={S.metaItem}>🏷️ {j.type}</Text>
                  </View>

                  <View style={S.skillWrap}>
                    {j.req.map(s => {
                      const isMat = matched.includes(s);
                      return (
                        <View key={s} style={[S.skillPill, { borderColor: isMat ? `${j.c1}44` : T.borderLow, backgroundColor: isMat ? `${j.c1}11` : T.surface }]}>
                          <Text style={[S.skillText, { color: isMat ? j.c1 : T.muted }]}>{isMat ? `✓ ${s}` : s}</Text>
                        </View>
                      );
                    })}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  root: { flex: 1 },
  header:  {
    flexDirection: "row", alignItems: "center", gap: 16,
    paddingTop: Platform.OS === "ios" ? 72 : 56,
    paddingHorizontal: 20, paddingBottom: 16,
    maxWidth: 600, width: "100%", alignSelf: "center",
  },
  backBtn:   { width: 42, height: 42, borderRadius: 21, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, alignItems: "center", justifyContent: "center" },
  backIcon:  { fontSize: 18, color: T.text, fontWeight: "600", marginTop: -2 },
  pageTitle: { fontSize: 24, fontWeight: "900", color: T.text, letterSpacing: -0.5 },
  pageSub:   { fontSize: 14, color: T.muted, fontWeight: "500", marginTop: 2 },
  content: { paddingHorizontal: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },

  filterRow: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: T.border, backgroundColor: T.surface },
  filterText: { fontSize: 13, color: T.text, fontWeight: "600" },

  list: { gap: 14 },
  jobCard: { borderRadius: 20, borderWidth: 1, padding: 20, backgroundColor: T.surface, gap: 16 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardLeft: { flexDirection: "row", gap: 12, flex: 1 },
  logo: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 20, fontWeight: "800", color: "#fff" },
  jobTitle: { fontSize: 17, fontWeight: "800", color: T.text },
  jobCo: { fontSize: 13, color: T.muted, marginTop: 2 },
  matchRing: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  matchNum: { fontSize: 13, fontWeight: "800" },

  metaWrap: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: -4 },
  metaItem: { fontSize: 12, color: T.muted, fontWeight: "500" },

  skillWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  skillText: { fontSize: 11, fontWeight: "700" },
});

export default JobMatchesScreen;
