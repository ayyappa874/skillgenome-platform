import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Color, FontFamily, FontSize, Padding, StyleVariable } from "../GlobalStyles";
import { t } from "../utils/translations";

const DailyQuizResultsScreen = ({ result, onBack, onPracticeAgain, isDarkMode = true, language = 'English' }) => {
  const bgStyle = isDarkMode ? Color.colorBlue8 || '#0d0d1a' : '#f8fafc';
  const cardBg = isDarkMode ? Color.colorBlue5 || '#060612' : '#ffffff';
  const innerCardBg = isDarkMode ? Color.colorBlue16 || '#1e2235' : '#f1f5f9';
  const borderStyle = isDarkMode ? Color.colorOrange50 || '#ff9900' : '#cbd5e1';
  const textPrimary = isDarkMode ? Color.colorGrey97 || '#ffffff' : '#0f172a';
  const textSecondary = isDarkMode ? Color.colorBlue65 || '#94a3b8' : '#475569';
  const pillBg = isDarkMode ? Color.colorBlue19 || '#2e3448' : '#e2e8f0';
  const totalQuestions = result?.totalQuestions || 0;
  const score = result?.score || 0;
  const percent = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
  const won = result?.perfect || score >= Math.ceil(totalQuestions * 0.7);
  const minutes = result?.practiceMinutes || 10;
  const questionCount = result?.questionCount || totalQuestions;

  const handleShare = () => {
    Alert.alert("Share result", "Result sharing can be wired to native share or social share next.");
  };

  return (
    <View style={[styles.container, { backgroundColor: bgStyle }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: isDarkMode ? Color.colorOrange50 : borderStyle }]}>
          <Text style={styles.topLabel}>{language === "Hindi" ? "✕ युद्ध समाप्त!" : (language === "Telugu" ? "✕  యుद्धం ముగిసింది!" : "✕ BATTLE COMPLETE!")}</Text>
          <Text style={styles.trophy}>🏆</Text>
          <Text style={[styles.mainTitle, { color: isDarkMode ? Color.colorOrange50 : '#ff9900' }]}>{won ? (language === "Hindi" ? 'आप जीत गए!' : (language === "Telugu" ? 'మీరు గెలిచారు!' : 'You Won!')) : (language === "Hindi" ? 'अच्छा प्रयास!' : (language === "Telugu" ? 'మంచి प्रयास!' : 'Nice Try!'))}</Text>
          <Text style={[styles.subtitle, { color: textSecondary }]}>
            {language === "Hindi" ? "दैनिक प्रश्नोत्तरी चुनौती" : (language === "Telugu" ? "రోజువారీ క్విజ్ సవాలు" : "Daily Quiz Challenge")} · {minutes}m · {questionCount} {language === "Hindi" ? "प्रश्न" : (language === "Telugu" ? "ప్రశ్నలు" : "questions")}
          </Text>

          <View style={styles.scoreRow}>
            <View style={[styles.scoreBlockPrimary, { backgroundColor: pillBg, borderColor: borderStyle }]}>
              <Text style={[styles.scoreLabel, { color: textSecondary }]}>{language === "Hindi" ? "आप" : (language === "Telugu" ? "మీరు" : "You")}</Text>
              <Text style={[styles.scoreValue, { color: isDarkMode ? Color.colorOrange50 : '#ff9900' }]}>{score}</Text>
              <Text style={[styles.scoreMeta, { color: textSecondary }]}>{percent}% {language === "Hindi" ? "सही" : (language === "Telugu" ? "సరైనది" : "correct")}</Text>
            </View>

            <Text style={[styles.vsText, { color: textSecondary }]}>VS</Text>

            <View style={[styles.scoreBlockSecondary, { backgroundColor: innerCardBg, borderColor: isDarkMode ? Color.colorBlue23 : borderStyle }]}>
              <Text style={[styles.scoreLabel, { color: textSecondary }]}>{language === "Hindi" ? "चुनौती" : (language === "Telugu" ? "సవాలు" : "Challenge")}</Text>
              <Text style={[styles.scoreValueSecondary, { color: textPrimary }]}>{Math.max(totalQuestions - score, 0)}</Text>
              <Text style={[styles.scoreMeta, { color: textSecondary }]}>{language === "Hindi" ? "छूटे हुए प्रश्न" : (language === "Telugu" ? "తప్పిపోయిన ప్రశ్నలు" : "Questions missed")}</Text>
            </View>
          </View>

          <View style={[styles.rewardCard, { backgroundColor: innerCardBg }]}>
            <Text style={styles.rewardHeader}>🌟 Genome updated</Text>
            <View style={styles.rewardRow}>
              <View style={[styles.rewardItem, { backgroundColor: pillBg }]}>
                <Text style={[styles.rewardValue, { color: textPrimary }]}>+{score * 3} XP</Text>
                <Text style={[styles.rewardLabel, { color: textSecondary }]}>You</Text>
              </View>
              <View style={[styles.rewardItem, { backgroundColor: pillBg }]}>
                <Text style={[styles.rewardValue, { color: textPrimary }]}>+{Math.max(1, totalQuestions - score)} XP</Text>
                <Text style={[styles.rewardLabel, { color: textSecondary }]}>Practice gain</Text>
              </View>
              <View style={[styles.rewardItem, { backgroundColor: pillBg }]}>
                <Text style={[styles.rewardValue, { color: textPrimary }]}>{won ? "React Pro" : "Retry"}</Text>
                <Text style={[styles.rewardLabel, { color: textSecondary }]}>{won ? "New badge" : "Keep going"}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: isDarkMode ? Color.colorBlue11 : '#f8fafc', borderStyle: 'solid', borderWidth: isDarkMode ? 0 : 1, borderColor: '#e2e8f0' }]}>
            <Text style={[styles.summaryTitle, { color: textPrimary }]}>Today’s summary</Text>
            <Text style={[styles.summaryText, { color: textSecondary }]}>
              {result?.answeredCount || 0}/{totalQuestions} answered. Come back tomorrow for a fresh quiz set and a higher streak.
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <Pressable style={[styles.secondaryButton, { backgroundColor: pillBg, borderColor: borderStyle }]} onPress={onPracticeAgain}>
              <Text style={[styles.secondaryButtonText, { color: isDarkMode ? Color.colorOrange50 : '#ff9900' }]}>{language === "Hindi" ? "फिर से अभ्यास करें" : (language === "Telugu" ? "మళ్లీ ప్రాక్టీస్ చేయండి" : "Practice Again")}</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={handleShare}>
              <Text style={styles.primaryButtonText}>{language === "Hindi" ? "परिणाम साझा करें" : (language === "Telugu" ? "ఫలితాన్ని భాగస్వామ్యం చేయండి" : "Share Result")}</Text>
            </Pressable>
          </View>

          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={[styles.backButtonText, { color: textSecondary }]}>{language === "Hindi" ? "करियर सिमुलेशन पर वापस जाएं" : (language === "Telugu" ? "కెరీర్ సిమ్యులేషన్‌కు తిరిగి వెళ్లండి" : "Back to Career Stimulation")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.colorBlue8,
  },
  content: {
    padding: Padding.padding_16,
    paddingTop: 56,
    paddingBottom: 28,
  },
  card: {
    borderRadius: 28,
    backgroundColor: Color.colorBlue5,
    borderWidth: 1,
    borderColor: Color.colorOrange50,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  topLabel: {
    color: Color.colorOrange50,
    textAlign: "center",
    fontFamily: FontFamily.interSemiBold,
    fontSize: 13,
    letterSpacing: 1,
    marginTop: 2,
    marginBottom: 10,
  },
  trophy: {
    textAlign: "center",
    fontSize: 52,
    marginBottom: 8,
  },
  mainTitle: {
    color: Color.colorOrange50,
    fontFamily: FontFamily.soraBold,
    fontSize: 28,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    color: Color.colorBlue65,
    textAlign: "center",
    fontSize: 13,
    marginBottom: 18,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  scoreBlockPrimary: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: Color.colorBlue19,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Color.colorOrange50,
  },
  scoreBlockSecondary: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: Color.colorBlue16,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Color.colorBlue23,
  },
  vsText: {
    width: 38,
    textAlign: "center",
    color: Color.colorBlue65,
    fontFamily: FontFamily.interSemiBold,
    fontSize: 12,
  },
  scoreLabel: {
    color: Color.colorBlue65,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 8,
  },
  scoreValue: {
    color: Color.colorOrange50,
    fontFamily: FontFamily.soraBold,
    fontSize: 36,
    textAlign: "center",
  },
  scoreValueSecondary: {
    color: Color.colorGrey97,
    fontFamily: FontFamily.soraBold,
    fontSize: 36,
    textAlign: "center",
  },
  scoreMeta: {
    color: Color.colorBlue65,
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  rewardCard: {
    backgroundColor: Color.colorBlue16,
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
  },
  rewardHeader: {
    color: Color.colorCyan50,
    fontFamily: FontFamily.interSemiBold,
    marginBottom: 12,
    textAlign: "center",
  },
  rewardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  rewardItem: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: Color.colorBlue19,
    alignItems: "center",
  },
  rewardValue: {
    color: Color.colorWhiteSolid,
    fontFamily: FontFamily.soraBold,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 4,
  },
  rewardLabel: {
    color: Color.colorBlue65,
    fontSize: 11,
    textAlign: "center",
  },
  summaryCard: {
    borderRadius: 18,
    backgroundColor: Color.colorBlue11,
    padding: 14,
    marginBottom: 14,
  },
  summaryTitle: {
    color: Color.colorGrey97,
    fontSize: 14,
    fontFamily: FontFamily.interSemiBold,
    marginBottom: 6,
  },
  summaryText: {
    color: Color.colorBlue65,
    fontSize: 13,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: Color.colorBlue19,
    borderWidth: 1,
    borderColor: Color.colorOrange50,
  },
  secondaryButtonText: {
    color: Color.colorOrange50,
    fontFamily: FontFamily.interSemiBold,
    fontSize: 14,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: Color.colorOrange50,
  },
  primaryButtonText: {
    color: Color.colorBlue5,
    fontFamily: FontFamily.interSemiBold,
    fontSize: 14,
  },
  backButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  backButtonText: {
    color: Color.colorBlue65,
    fontSize: 13,
    fontFamily: FontFamily.interSemiBold,
  },
});

export default DailyQuizResultsScreen;