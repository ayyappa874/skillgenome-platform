const fs = require('fs');

const code = \import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, Linking, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Color, FontFamily, FontSize, Padding, Border, StyleVariable } from "../GlobalStyles";

const jobMatches = [
  {
    id: 1,
    company: "Google",
    title: "AI Engineer",
    location: "Bangalore",
    employmentType: "Full-time",
    workMode: "Remote",
    salaryInr: "?28,00,000 - ?40,00,000",
    matchColor: "#25E0B5",
    requiredSkills: ["Python", "Machine Learning", "NLP", "FastAPI"],
  },
  {
    id: 2,
    company: "Google",
    title: "Full Stack Developer",
    location: "Remote",
    employmentType: "Full-time",
    workMode: "Remote",
    salaryInr: "?18,00,000 - ?32,00,000",
    matchColor: "#8B5CF6",
    requiredSkills: ["React", "JavaScript", "TypeScript", "APIs"],
  },
  {
    id: 3,
    company: "Microsoft",
    title: "Data Scientist",
    location: "Hyderabad",
    employmentType: "Full-time",
    workMode: "On-site",
    salaryInr: "?22,00,000 - ?36,00,000",
    matchColor: "#25E0B5",
    requiredSkills: ["Python", "SQL", "Statistics", "Machine Learning"],
  },
];

const normalizeSkill = (skill) => (skill || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const getRecommendation = (job, profileSkills = []) => {
  const normalizedProfileSkills = new Set(profileSkills.map(normalizeSkill));
  const matchedSkills = (job.requiredSkills || []).filter((skill) => normalizedProfileSkills.has(normalizeSkill(skill)));
  const matchPercent = Math.min(98, Math.round(40 + (matchedSkills.length / Math.max(1, (job.requiredSkills || []).length)) * 60));

  return {
    matchedSkills,
    matchPercent,
  };
};

const JobCard = ({ job, matchPercent, matchedSkills, onPress, onApply, styles }) => (
  <Pressable style={styles.card} onPress={onPress}>
    <View style={styles.cardTopRow}>
      <View style={[styles.logoWrap, job.color ? { backgroundColor: job.color } : null]}>
        <Text style={[styles.logoText, job.color ? { color: '#ffffff' } : { color: Color.colorCyan50 }]}>
          {job.logoText || (job.company ? job.company[0].toUpperCase() : "J")}
        </Text>
      </View>

      <View style={styles.titleWrap}>
        <Text style={styles.jobTitle}>{job.title}</Text>
        <Text style={styles.company}>{job.company}</Text>
      </View>

      <View style={[styles.matchRing, { borderColor: job.matchColor || '#25E0B5' }]}>
        <Text style={[styles.matchText, { color: job.matchColor || '#25E0B5' }]}>{matchPercent}%</Text>
      </View>
    </View>

    <View style={styles.metaRow}>
      <Text style={styles.metaText}>?? {job.location}</Text>
      <Text style={styles.metaText}>?? {job.salaryInr}</Text>
    </View>

    <View style={styles.metaRow}>
      <Text style={styles.metaText}>??? {job.employmentType || "Full-time"}</Text>
      <Text style={styles.metaText}>?? {job.workMode || "Remote"}</Text>
    </View>

    <View style={styles.tagsRow}>
      {(job.requiredSkills || []).map((skill, index) => (
        <View key={skill} style={[styles.tag, { backgroundColor: ["#10B981", "#8B5CF6", "#14B8A6", "#25E0B5"][index % 4] }]}>
          <Text style={styles.tagText}>{skill}</Text>
        </View>
      ))}
    </View>

    <Text style={styles.skillsLabel}>Skills required</Text>

    <Text style={styles.matchingText}>
      Matched with your profile: {matchedSkills.length > 0 ? matchedSkills.join(", ") : "Add more matching skills to improve this score"}
    </Text>

    {job.url && (
      <Pressable
        style={styles.applyButton}
        onPress={() => {
          if (typeof onApply === 'function') {
            onApply(job);
          } else {
            Linking.openURL(job.url).catch((err) =>
              Alert.alert("Error", "Could not open job application link.")
            );
          }
        }}
      >
        <Text style={styles.applyText}>Apply</Text>
      </Pressable>
    )}
  </Pressable>
);

const JobMatchesScreen = ({ onBack, onOpenNext, profileSkills = [], jobs = [], loadingJobs = false, onOpenJobDetail, onApply, isDarkMode = true, language = 'English' }) => {
  const styles = React.useMemo(() => getStyles(isDarkMode), [isDarkMode]);
  const [activeFilter, setActiveFilter] = React.useState("Remote");
  const [sortDescending, setSortDescending] = React.useState(true);
  const [locationAllowed, setLocationAllowed] = React.useState(true);

  React.useEffect(() => {
    const checkLocationPermission = async () => {
      try {
        const stored = await AsyncStorage.getItem("@device_setup_permissions");
        if (stored) {
          const config = JSON.parse(stored);
          if (config.locationEnabled === false) {
            setLocationAllowed(false);
          }
        }
      } catch (err) {
        console.warn("JobMatchesScreen: Failed to load permission settings:", err);
      }
    };
    checkLocationPermission();
  }, []);

  const filterOptions = [
    { id: "remote", label: "Remote", icon: "?" },
    { id: "full-time", label: "Full-time", icon: "?" },
    { id: "location", label: "Location", icon: "??" },
  ];

  const locationOptions = ["All", "Remote", "Bangalore", "Hyderabad", "Mumbai"];

  const activeJobs = (jobs && jobs.length > 0) ? jobs : jobMatches;

  const scoredJobs = activeJobs.map((job) => ({
    ...job,
    ...getRecommendation(job, profileSkills),
  }));

  const visibleJobs = scoredJobs
    .filter((job) => {
      if (!activeFilter || activeFilter === "All") return true;
      if (activeFilter === "Remote") return job.workMode === "Remote";
      if (activeFilter === "Full-time") return job.employmentType === "Full-time";
      return job.location && job.location.toLowerCase().includes(activeFilter.toLowerCase());
    })
    .sort((leftJob, rightJob) => {
      const leftScore = leftJob.matchPercent;
      const rightScore = rightJob.matchPercent;
      return sortDescending ? rightScore - leftScore : leftScore - rightScore;
    });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => typeof onBack === "function" && onBack()}>
          <Text style={styles.backText}>?</Text>
        </Pressable>
        <Text style={styles.headerTitle}>JOB MATCHES</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <View style={styles.filtersRow}>
        <View style={styles.filterIcon}>
          <Text style={styles.filterIconText}>?</Text>
        </View>
        {filterOptions.map((filter) => {
          const isActive = activeFilter === filter.label || (filter.id === 'location' && !['Remote','Full-time'].includes(activeFilter) && activeFilter !== 'All');

          return (
            <Pressable
              key={filter.id}
              style={[styles.filterPill, isActive && styles.filterPillActive]}
              onPress={() => {
                if (filter.id === 'location') {
                  Alert.alert(
                    'Choose location',
                    null,
                    locationOptions.map((loc) => ({ text: loc, onPress: () => setActiveFilter(loc) })).concat({ text: 'Cancel', style: 'cancel' })
                  );
                  return;
                }
                setActiveFilter(filter.label);
              }}
            >
              <Text style={isActive ? styles.filterPillActiveText : styles.filterPillText}>
                {filter.icon} {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sortRow}>
        <Text style={styles.sortText}>Sort by Match %</Text>
        <Pressable
          onPress={() => {
            const nextSortDescending = !sortDescending;
            setSortDescending(nextSortDescending);
            Alert.alert("Sort", \Sorted \ by match %.\);
          }}
        >
          <Text style={styles.sortAction}>Sort All ?</Text>
        </Pressable>
      </View>

      <Text style={styles.activeFilterText}>Selected filter: {activeFilter}</Text>

      {!locationAllowed && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningBannerText}>
            ?? Local Job Matching is Disabled. Showing remote and generic matches. Enable Location permission in Settings/Device Setup for proximity matching.
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loadingJobs ? (
          <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={Color.colorCyan50} />
            <Text style={{ color: isDarkMode ? (Color.colorBlue42 || '#64748b') : '#64748b', marginTop: 12, fontFamily: FontFamily.soraRegular || 'System' }}>Fetching real-time jobs...</Text>
          </View>
        ) : visibleJobs.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: isDarkMode ? (Color.colorBlue42 || '#64748b') : '#64748b', fontFamily: FontFamily.soraRegular || 'System' }}>No matching live jobs found.</Text>
          </View>
        ) : (
          visibleJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              matchPercent={job.matchPercent}
              matchedSkills={job.matchedSkills}
              onPress={() => {
                if (typeof onOpenJobDetail === "function") return onOpenJobDetail(job);

                return Alert.alert(
                  job.title,
                  \\ · \\\nMatch \%\\nRequired skills: \\
                );
              }}
              onApply={onApply}
              styles={styles}
            />
          ))
        )}

        <Pressable style={styles.footerButton} onPress={() => typeof onOpenNext === "function" && onOpenNext()}>
          <Text style={styles.footerButtonText}>Next</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const getStyles = (isDarkMode) => {
  const bgStyle = isDarkMode ? Color.colorBlue8 || "#0d0d1a" : "#f8fafc";
  const cardBg = isDarkMode ? Color.colorBlue11 || "#1a1f30" : "#ffffff";
  const textPrimary = isDarkMode ? Color.colorWhiteSolid || "#ffffff" : "#0f172a";
  const textSecondary = isDarkMode ? Color.colorGrey97 || "#ffffff" : "#334155";
  const textMute = isDarkMode ? Color.colorBlue42 || "#64748b" : "#64748b";
  const borderStyle = isDarkMode ? Color.colorWhite7 || "rgba(255, 255, 255, 0.07)" : "#cbd5e1";
  const activeTabBg = isDarkMode ? Color.colorBlue19 || "#232840" : "#e0f2fe";
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bgStyle,
    paddingTop: 44,
  },
  header: {
    paddingHorizontal: Padding.padding_16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cardBg,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: textPrimary,
    fontSize: 18,
    fontWeight: StyleVariable.fontWeight700,
  },
  headerTitle: {
    color: textSecondary,
    fontFamily: FontFamily.soraBold,
    fontSize: 16,
    fontWeight: StyleVariable.fontWeight700,
  },
  headerRightSpacer: {
    width: 36,
  },
  filtersRow: {
    paddingHorizontal: Padding.padding_16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  filterIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cardBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: borderStyle,
  },
  filterIconText: {
    color: isDarkMode ? (Color.colorBlue42 || '#64748b') : '#64748b',
    fontSize: 16,
  },
  filterPill: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: cardBg,
    borderWidth: 1,
    borderColor: borderStyle,
    justifyContent: "center",
  },
  filterPillActive: {
    backgroundColor: activeTabBg,
    borderColor: Color.colorCyan50,
  },
  filterPillText: {
    color: isDarkMode ? (Color.colorBlue42 || '#64748b') : '#64748b',
    fontFamily: FontFamily.soraRegular,
    fontSize: 12,
  },
  filterPillActiveText: {
    color: Color.colorCyan50,
    fontFamily: FontFamily.soraBold,
    fontSize: 12,
  },
  sortRow: {
    paddingHorizontal: Padding.padding_16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  activeFilterText: {
    paddingHorizontal: Padding.padding_16,
    color: isDarkMode ? (Color.colorBlue42 || '#64748b') : '#64748b',
    fontSize: 11,
    marginBottom: 8,
  },
  sortText: {
    color: isDarkMode ? (Color.colorBlue42 || '#64748b') : '#64748b',
    fontSize: 12,
    fontFamily: FontFamily.soraRegular,
  },
  sortAction: {
    color: Color.colorCyan50,
    fontSize: 12,
    fontFamily: FontFamily.soraBold,
    fontWeight: StyleVariable.fontWeight700,
  },
  list: {
    paddingHorizontal: Padding.padding_16,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    backgroundColor: cardBg,
    borderRadius: Border.br_16,
    borderWidth: 1,
    borderColor: borderStyle,
    padding: 16,
    minHeight: 170,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Color.colorWhiteSolid,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: Color.colorCyan50,
    fontFamily: FontFamily.soraBold,
    fontSize: 16,
  },
  titleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  jobTitle: {
    color: textSecondary,
    fontFamily: FontFamily.soraBold,
    fontSize: 16,
    fontWeight: StyleVariable.fontWeight700,
  },
  company: {
    color: isDarkMode ? (Color.colorBlue42 || '#64748b') : '#64748b',
    fontFamily: FontFamily.soraRegular,
    fontSize: 12,
    marginTop: 2,
  },
  matchRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  matchText: {
    fontSize: 11,
    fontFamily: FontFamily.soraBold,
    fontWeight: StyleVariable.fontWeight700,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 10,
  },
  metaText: {
    color: isDarkMode ? (Color.colorBlue42 || '#64748b') : '#64748b',
    fontFamily: FontFamily.soraRegular,
    fontSize: 11,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagText: {
    color: textPrimary,
    fontSize: 11,
    fontFamily: FontFamily.soraBold,
  },
  skillsLabel: {
    color: isDarkMode ? (Color.colorBlue42 || '#64748b') : '#64748b',
    fontSize: 11,
    fontFamily: FontFamily.soraRegular,
    marginTop: 12,
  },
  matchingText: {
    color: textSecondary,
    fontSize: 11,
    fontFamily: FontFamily.soraRegular,
    marginTop: 8,
    lineHeight: 16,
  },
  applyButton: {
    alignSelf: "flex-end",
    marginTop: 12,
    backgroundColor: Color.colorCyan50,
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRadius: Border.br_12,
  },
  applyText: {
    color: Color.colorBlue8,
    fontFamily: FontFamily.soraBold,
    fontSize: 13,
    fontWeight: StyleVariable.fontWeight700,
  },
  footerButton: {
    marginTop: 6,
    marginBottom: 18,
    alignSelf: "center",
    backgroundColor: activeTabBg,
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Color.colorCyan50,
  },
  footerButtonText: {
    color: Color.colorCyan50,
    fontFamily: FontFamily.soraBold,
    fontSize: 12,
    fontWeight: StyleVariable.fontWeight700,
  },
  warningBanner: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
    borderRadius: Border.br_12,
    padding: 12,
    marginHorizontal: Padding.padding_16,
    marginBottom: 12,
  },
  warningBannerText: {
    color: "#ff6b6b",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: FontFamily.soraRegular || "System",
  },
});
};

export default JobMatchesScreen;
\;
fs.writeFileSync('skillgenome/screens/JobMatchesScreen.js', code);
fs.writeFileSync('../skill - Copy/skillgenome/screens/JobMatchesScreen.js', code);
console.log('Successfully recreated JobMatchesScreen.js');
