const fs = require('fs');

const code = \import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, Modal, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Color, FontFamily, FontSize, Padding, StyleVariable } from "../GlobalStyles";
import { t } from "../utils/translations";

const fallbackTopics = [
  {
    id: 1,
    title: "Prompt engineering basics",
    description: "Learn how to ask better questions and guide AI outputs with clearer context.",
    level: "Beginner",
  },
  {
    id: 2,
    title: "Building production APIs",
    description: "Review API design, validation, and deployment habits for fast shipping.",
    level: "Intermediate",
  },
  {
    id: 3,
    title: "Interview storytelling",
    description: "Turn project work into concise, impact-focused answers for interviews.",
    level: "Career",
  },
  {
    id: 4,
    title: "Job-match skill gaps",
    description: "Spot missing skills in your profile and create a focused practice plan.",
    level: "Growth",
  },
];

const DailyLearningTopicsScreen = ({ onBack, isDarkMode = true, language = 'English', jobMatch }) => {
  const styles = React.useMemo(() => getStyles(isDarkMode), [isDarkMode]);
  const [activeTopicId, setActiveTopicId] = React.useState(fallbackTopics[0].id);
  const [completedTopics, setCompletedTopics] = React.useState([]);
  const [learningTopics, setLearningTopics] = React.useState(fallbackTopics);
  const [isGeneratingTimeline, setIsGeneratingTimeline] = React.useState(false);
  const [isLessonModalVisible, setIsLessonModalVisible] = React.useState(false);
  const [lessonContent, setLessonContent] = React.useState("");
  const [isLoadingLesson, setIsLoadingLesson] = React.useState(false);

  React.useEffect(() => {
    const fetchTimeline = async () => {
      setIsGeneratingTimeline(true);
      try {
        const storedKey = await AsyncStorage.getItem("GEMINI_API_KEY");
        const apiKey = storedKey || "AIzaSyA7FnBEaQK9xopkeDq-RtjbXpVkBlHhtqg";
        
        const targetRole = jobMatch?.title || "Software Engineering";
        
        const response = await fetch(\https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=\\, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: \You are an expert career coach. Generate a 4-step daily learning timeline to help someone master the skills needed for the role: "\". The 4 steps MUST strictly follow this progression: Beginner, Intermediate, Advanced, Proficient. Format the output strictly as a JSON array of 4 objects. Do not include markdown codeblocks or any other text. Each object must have: "id" (number 1 to 4), "title" (string, max 5 words), "description" (string, concise 1-sentence action plan), and "level" (string: "Beginner", "Intermediate", "Advanced", or "Proficient").\
              }]
            }]
          })
        });
        
        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          let text = data.candidates[0].content.parts[0].text;
          text = text.replace(/\\s*\\\json\\s*/g, '').replace(/\\s*\\\\\s*/g, '').trim();
          const parsed = JSON.parse(text);
          setLearningTopics(parsed);
          if (parsed.length > 0) setActiveTopicId(parsed[0].id);
        } else {
          setLearningTopics(fallbackTopics);
          setActiveTopicId(fallbackTopics[0].id);
        }
      } catch (err) {
        console.warn("Error fetching timeline:", err);
        setLearningTopics(fallbackTopics);
        setActiveTopicId(fallbackTopics[0].id);
      } finally {
        setIsGeneratingTimeline(false);
      }
    };
    fetchTimeline();
  }, [jobMatch]);

  const activeTopic = learningTopics.find((topic) => topic.id === activeTopicId) || learningTopics[0];
  const completionPercent = Math.round((completedTopics.length / Math.max(1, learningTopics.length)) * 100);

  const handleStartLearning = async () => {
    setIsLessonModalVisible(true);
    setIsLoadingLesson(true);
    setLessonContent("");
    
    try {
      const storedKey = await AsyncStorage.getItem("GEMINI_API_KEY");
      const apiKey = storedKey || "AIzaSyA7FnBEaQK9xopkeDq-RtjbXpVkBlHhtqg";
      
      const response = await fetch(\https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=\\, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: \Generate a short, practical 10-minute beginner lesson on the topic: "\". Include a brief introduction, 3 actionable bullet points, and a quick summary. Make it engaging and format it beautifully with clear spacing. Keep it concise so it can be read in 2 minutes.\
            }]
          }]
        })
      });
      
      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        setLessonContent(data.candidates[0].content.parts[0].text);
      } else {
        setLessonContent("Could not generate lesson. Please try again.");
      }
    } catch (err) {
      console.warn("Error fetching lesson:", err);
      setLessonContent("Failed to load lesson. Please check your internet connection.");
    } finally {
      setIsLoadingLesson(false);
    }
  };

  const handleMarkDone = () => {
    if (!completedTopics.includes(activeTopicId)) {
      setCompletedTopics([...completedTopics, activeTopicId]);
    }
    Alert.alert("Topic Complete", "Great job! Keep up the daily learning habit.");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>?</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{language === "Hindi" ? "????? ??????" : (language === "Telugu" ? "???????? ???????" : "Daily Learning")}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Today's Learning Path</Text>
          <Text style={styles.heroTitle}>Topics picked for your career growth</Text>
          <Text style={styles.heroCopy}>Short, practical lessons that connect directly to the jobs and interview prep in the app.</Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.progressPill}>
              <Text style={styles.progressPillText}>{completedTopics.length}/{learningTopics.length} done</Text>
            </View>
            <View style={styles.progressPillAlt}>
              <Text style={styles.progressPillTextAlt}>Progress {completionPercent}%</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: \\%\ }]} />
          </View>
        </View>

        <View style={styles.featureRow}>
          <Pressable style={styles.featureButtonPrimary} onPress={handleStartLearning}>
            <Text style={styles.featureButtonPrimaryText}>Start lesson</Text>
          </Pressable>
          <Pressable style={styles.featureButtonSecondary} onPress={handleMarkDone}>
            <Text style={styles.featureButtonSecondaryText}>Mark complete</Text>
          </Pressable>
        </View>

        {learningTopics.map((topic) => {
          const isActive = topic.id === activeTopicId;
          const isCompleted = completedTopics.includes(topic.id);

          return (
            <Pressable
              key={topic.id}
              onPress={() => setActiveTopicId(topic.id)}
              style={[
                styles.topicCard,
                isActive && styles.topicCardActive,
                isCompleted && styles.topicCardCompleted,
              ]}
            >
              <View style={styles.topicTopRow}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <View style={[styles.levelPill, isCompleted && { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Text style={[styles.levelText, isCompleted && { color: '#10B981' }]}>
                    {isCompleted ? "Done" : topic.level}
                  </Text>
                </View>
              </View>
              <Text style={styles.topicDescription}>{topic.description}</Text>
            </Pressable>
          );
        })}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Daily habit</Text>
          <Text style={styles.summaryText}>Spend 10 minutes here before checking View Jobs or Interview Prep.</Text>
        </View>

        <Pressable style={styles.startButton} onPress={onBack}>
          <Text style={styles.startButtonText}>{language === "Hindi" ? "????? ???????? ?? ???? ????" : (language === "Telugu" ? "?????? ?????????????? ?????? ????????" : "Back to Career Stimulation")}</Text>
        </Pressable>
      </ScrollView>

      {/* Lesson Modal */}
      <Modal visible={isLessonModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{activeTopic.title}</Text>
            <ScrollView style={{ flex: 1, marginVertical: 16 }}>
              {isLoadingLesson ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#25E0B5" />
                  <Text style={{ marginTop: 16, color: '#64748b' }}>AI is generating your custom lesson...</Text>
                </View>
              ) : (
                <Text style={styles.lessonText}>{lessonContent}</Text>
              )}
            </ScrollView>
            <Pressable style={styles.modalCloseButton} onPress={() => setIsLessonModalVisible(false)}>
              <Text style={styles.modalCloseText}>Close Lesson</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (isDarkMode) => {
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
  summaryCard: {
    backgroundColor: altBg,
    borderRadius: 20,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: borderStyle,
  },
  summaryLabel: {
    color: textSecondary,
    fontSize: 15,
    fontFamily: FontFamily.soraBold,
    marginBottom: 6,
  },
  summaryText: {
    color: textMute,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: Color.colorCyan50 || "#25E0B5",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  startButtonText: {
    color: "#000000",
    fontSize: 16,
    fontFamily: FontFamily.soraBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: cardBg,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: "80%",
    minHeight: "50%",
  },
  modalTitle: {
    color: textSecondary,
    fontSize: 20,
    fontFamily: FontFamily.soraBold,
    marginBottom: 12,
  },
  lessonText: {
    color: textPrimary,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: FontFamily.interRegular,
  },
  modalCloseButton: {
    backgroundColor: altBg,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseText: {
    color: textSecondary,
    fontSize: 15,
    fontFamily: FontFamily.interSemiBold,
  }
});
};

export default DailyLearningTopicsScreen;
\

fs.writeFileSync('skillgenome/screens/DailyLearningTopicsScreen.js', code);
fs.writeFileSync('../skill - Copy/skillgenome/screens/DailyLearningTopicsScreen.js', code);
console.log('Restored Daily Learning Screen perfectly!');
