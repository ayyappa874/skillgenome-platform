const fs = require('fs');
let code = fs.readFileSync('skillgenome/screens/DailyLearningTopicsScreen.js', 'utf8');

const newStyles = `const getStyles = (isDarkMode) => {
  const bgStyle = isDarkMode ? Color.colorBlue8 || "#0d0d1a" : "#f8fafc";
  const cardBg = isDarkMode ? Color.colorBlue11 || "#1a1f30" : "#ffffff";
  const textPrimary = isDarkMode ? Color.colorWhiteSolid || "#ffffff" : "#0f172a";
  const textSecondary = isDarkMode ? Color.colorGrey97 || "#ffffff" : "#334155";
  const textMute = isDarkMode ? Color.colorBlue42 || "#64748b" : "#64748b";
  const borderStyle = isDarkMode ? Color.colorWhite7 || "rgba(255, 255, 255, 0.07)" : "#e2e8f0";
  
  const altBg = isDarkMode ? Color.colorBlue19 || "#1a2138" : "#f8fafc";
  const highlightBg = isDarkMode ? Color.colorBlue16 || "#1c243b" : "#f1f5f9";
  const cyanAlpha = isDarkMode ? "rgba(37, 224, 181, 0.15)" : "rgba(37, 224, 181, 0.15)";
  const labelColor = isDarkMode ? "#8b5cf6" : "#6366f1";
  const trackBg = isDarkMode ? Color.colorBlue19 || "#1a2138" : "#e2e8f0";

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
    borderWidth: 1,
    borderColor: borderStyle,
  },
  backText: {
    color: textPrimary,
    fontSize: 18,
    fontWeight: StyleVariable.fontWeight700,
  },
  headerTitle: {
    color: textSecondary,
    fontFamily: FontFamily.soraBold,
    fontSize: FontSize.fs_17_6,
    fontWeight: StyleVariable.fontWeight700,
  },
  content: {
    paddingHorizontal: Padding.padding_16,
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: cardBg,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: borderStyle,
  },
  heroLabel: {
    color: labelColor,
    fontFamily: FontFamily.interSemiBold,
    fontSize: 12,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: textSecondary,
    fontFamily: FontFamily.soraBold,
    fontSize: 24,
    marginBottom: 8,
  },
  heroCopy: {
    color: textMute,
    fontSize: 14,
    lineHeight: 20,
  },
  heroStatsRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 12,
  },
  progressPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: cyanAlpha,
  },
  progressPillAlt: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: altBg,
  },
  progressPillText: {
    color: Color.colorCyan50 || "#25E0B5",
    fontFamily: FontFamily.interSemiBold,
  },
  progressPillTextAlt: {
    color: textSecondary,
    fontFamily: FontFamily.interSemiBold,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: trackBg,
    marginTop: 14,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: labelColor,
  },
  featureRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  featureButtonPrimary: {
    flex: 1,
    backgroundColor: Color.colorCyan50 || "#25E0B5",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  featureButtonPrimaryText: {
    color: "#000000",
    fontSize: 15,
    fontFamily: FontFamily.interSemiBold,
  },
  featureButtonSecondary: {
    flex: 1,
    backgroundColor: altBg,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: borderStyle,
  },
  featureButtonSecondaryText: {
    color: textSecondary,
    fontSize: 15,
    fontFamily: FontFamily.interSemiBold,
  },
  activeTopicCard: {
    backgroundColor: cardBg,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: borderStyle,
  },
  activeTopicLabel: {
    color: labelColor,
    fontFamily: FontFamily.interSemiBold,
    fontSize: 12,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  activeTopicTitle: {
    color: textSecondary,
    fontSize: 18,
    fontFamily: FontFamily.soraBold,
    marginBottom: 8,
  },
  activeTopicDescription: {
    color: textMute,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
  topicCard: {
    backgroundColor: cardBg,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: borderStyle,
  },
  topicCardActive: {
    borderColor: Color.colorCyan50 || "#25E0B5",
    backgroundColor: highlightBg,
  },
  topicCardCompleted: {
    borderColor: "#10B981",
  },
  topicTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 12,
  },
  topicTitle: {
    flex: 1,
    color: textSecondary,
    fontSize: 16,
    fontFamily: FontFamily.interSemiBold,
    lineHeight: 22,
  },
  levelPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: cyanAlpha,
  },
  levelText: {
    color: Color.colorCyan50 || "#25E0B5",
    fontSize: 11,
    fontFamily: FontFamily.interSemiBold,
  },
  topicDescription: {
    color: textMute,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  topicFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topicDuration: {
    color: textMute,
    fontSize: 12,
    fontFamily: FontFamily.interSemiBold,
  },
  actionText: {
    color: Color.colorCyan50 || "#25E0B5",
    fontSize: 13,
    fontFamily: FontFamily.interSemiBold,
  },
  completedText: {
    color: "#10B981",
    fontSize: 13,
    fontFamily: FontFamily.interSemiBold,
  }
});
};`;

code = code.replace(/const getStyles = \(isDarkMode\) => \{[\s\S]*?\}\);[\s\n]*\};/, newStyles);

fs.writeFileSync('skillgenome/screens/DailyLearningTopicsScreen.js', code);
fs.writeFileSync('../skill - Copy/skillgenome/screens/DailyLearningTopicsScreen.js', code);
console.log('Done!');
