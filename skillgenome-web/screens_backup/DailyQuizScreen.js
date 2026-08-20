import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Color, FontFamily, FontSize, Padding, StyleVariable } from "../GlobalStyles";
import { supabase } from "../utils/supabase";
import { t } from "../utils/translations";

const questionBank = [
  {
    id: 1,
    prompt: "Which React hook is used for side effects like data fetching?",
    options: ["useMemo", "useEffect", "useRef", "useReducer"],
    answer: "useEffect",
    category: "React",
  },
  {
    id: 2,
    prompt: "What does SQL primarily help you do?",
    options: ["Style interfaces", "Manage databases", "Compile code", "Animate screens"],
    answer: "Manage databases",
    category: "Database",
  },
  {
    id: 3,
    prompt: "Which skill is most directly used for building APIs in this app stack?",
    options: ["FastAPI", "Photoshop", "Figma", "Excel"],
    answer: "FastAPI",
    category: "Backend",
  },
  {
    id: 4,
    prompt: "What is the main reason to use version control?",
    options: ["Make apps lighter", "Track and collaborate on code", "Replace testing", "Design mockups"],
    answer: "Track and collaborate on code",
    category: "Git",
  },
  {
    id: 5,
    prompt: "Which is a good way to improve interview answers?",
    options: ["Use one-word responses", "Tell a project story with impact", "Avoid numbers", "Skip preparation"],
    answer: "Tell a project story with impact",
    category: "Interview",
  },
  {
    id: 6,
    prompt: "What does responsive design focus on?",
    options: ["Static images", "Multiple screen sizes", "Faster internet", "Typing speed"],
    answer: "Multiple screen sizes",
    category: "Frontend",
  },
  {
    id: 7,
    prompt: "Which tool helps you store and query structured data?",
    options: ["Database", "Browser", "Terminal", "Canvas"],
    answer: "Database",
    category: "Database",
  },
  {
    id: 8,
    prompt: "What is a portfolio most useful for?",
    options: ["Hiding skills", "Showing project proof", "Changing font sizes", "Avoiding feedback"],
    answer: "Showing project proof",
    category: "Career",
  },
  {
    id: 9,
    prompt: "Why learn APIs early?",
    options: ["They make UI slower", "They connect frontend and backend", "They only help designers", "They remove data"],
    answer: "They connect frontend and backend",
    category: "Backend",
  },
  {
    id: 10,
    prompt: "What is one benefit of daily practice?",
    options: ["No need to review", "Better recall and confidence", "Less understanding", "More confusion"],
    answer: "Better recall and confidence",
    category: "Habit",
  },
  {
    id: 11,
    prompt: "Which metric is most useful when improving a job application profile?",
    options: ["Profile color", "Skill match percentage", "Phone battery", "App icon size"],
    answer: "Skill match percentage",
    category: "Career",
  },
  {
    id: 12,
    prompt: "What should you do before a mock interview?",
    options: ["Skip preparation", "Review your projects", "Ignore the role", "Change your name"],
    answer: "Review your projects",
    category: "Interview",
  },
  {
    id: 13,
    prompt: "What does a good Git commit message describe?",
    options: ["Random thoughts", "What changed and why", "Only file size", "Nothing useful"],
    answer: "What changed and why",
    category: "Git",
  },
  {
    id: 14,
    prompt: "Why are learning topics useful every day?",
    options: ["They replace practice", "They keep momentum and reduce gaps", "They remove the need for projects", "They make interviews shorter"],
    answer: "They keep momentum and reduce gaps",
    category: "Habit",
  },
  {
    id: 15,
    prompt: "Which habit helps you improve faster over time?",
    options: ["Skipping feedback", "Tracking progress", "Practicing once a month", "Avoiding repetition"],
    answer: "Tracking progress",
    category: "Growth",
  },
];

const practiceDurations = [
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "15 min", value: 15 },
];

const questionCounts = [5, 10, 15];

const hashString = (text) =>
  text.split("").reduce((sum, character) => (sum * 31 + character.charCodeAt(0)) % 2147483647, 7);

const shuffleWithSeed = (items, seed) => {
  const next = [...items];
  let randomState = seed || 1;

  for (let index = next.length - 1; index > 0; index -= 1) {
    randomState = (randomState * 48271) % 2147483647;
    const swapIndex = randomState % (index + 1);
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const DailyQuizScreen = ({ onBack, onOpenResults, isDarkMode = true, language = 'English' }) => {
  const bgStyle = isDarkMode ? Color.colorBlue8 || '#0d0d1a' : '#f8fafc';
  const cardBg = isDarkMode ? Color.colorBlue11 || '#161a22' : '#ffffff';
  const borderStyle = isDarkMode ? Color.colorCyan5015 || 'rgba(0, 212, 255, 0.15)' : '#cbd5e1';
  const textPrimary = isDarkMode ? Color.colorGrey97 || '#ffffff' : '#0f172a';
  const textSecondary = isDarkMode ? Color.colorBlue65 || '#94a3b8' : '#475569';
  const pillBg = isDarkMode ? Color.colorBlue19 || '#2e3448' : '#e2e8f0';
  
  const headerTitleText = language === "Hindi" ? "दैनिक प्रश्नोत्तरी" : (language === "Telugu" ? "రోజువారీ క్విజ్" : "Daily Quiz");
  const heroLabelText = language === "Hindi" ? "आज की चुनौती" : (language === "Telugu" ? "నేటి సవాలు" : "Today’s challenge");
  const heroTitleText = language === "Hindi" ? "दैनिक प्रश्नोत्तरी हर दिन बदलती है" : (language === "Telugu" ? "రోజువారీ క్విజ్ ప్రతిరోజూ మారుతుంది" : "Daily quiz resets every day");
  const questionsCountText = language === "Hindi" ? "कितने प्रश्न?" : (language === "Telugu" ? "ఎన్ని ప్రశ్నలు?" : "How many questions?");
  const durationText = language === "Hindi" ? "कितने समय अभ्यास करें?" : (language === "Telugu" ? "ఎంత సమయం ప్రాక్టీస్ చేయాలి?" : "How long to practice?");
  const generateQuizText = language === "Hindi" ? "आज की प्रश्नोत्तरी तैयार करें" : (language === "Telugu" ? "నేటి క్విజ్‌ని సృష్టించండి" : "Generate today’s quiz");
  
  const [questionCount, setQuestionCount] = React.useState(5);
  const [practiceMinutes, setPracticeMinutes] = React.useState(10);
  const [dayKey, setDayKey] = React.useState(getTodayKey);
  const [selectedAnswers, setSelectedAnswers] = React.useState({});
  const [completed, setCompleted] = React.useState(false);
  const [score, setScore] = React.useState(null);

  const [dailyQuestions, setDailyQuestions] = React.useState([]);

  React.useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .limit(questionCount);

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped = data.map((item) => ({
            id: item.id,
            prompt: item.question,
            options: item.options || [],
            answer: item.correct_option,
            category: item.subject
          }));
          setDailyQuestions(mapped);
        } else {
          // Empty DB fallback
          const seededQuestions = shuffleWithSeed(questionBank, hashString(dayKey));
          setDailyQuestions(seededQuestions.slice(0, questionCount));
        }
      } catch (e) {
        console.log("Error loading quizzes:", e.message);
        // Offline / Error fallback
        const seededQuestions = shuffleWithSeed(questionBank, hashString(dayKey));
        setDailyQuestions(seededQuestions.slice(0, questionCount));
      }
    };

    fetchQuestions();
    setSelectedAnswers({});
    setScore(null);
    setCompleted(false);
  }, [dayKey, questionCount, practiceMinutes]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      const today = getTodayKey();
      setDayKey((current) => (current === today ? current : today));
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = dailyQuestions.length ? Math.round((answeredCount / dailyQuestions.length) * 100) : 0;

  const handleSelectAnswer = (questionId, option) => {
    if (completed) {
      return;
    }

    setSelectedAnswers((current) => ({
      ...current,
      [questionId]: option,
    }));
  };

  const handleStartPractice = () => {
    Alert.alert(
      "Practice ready",
      `You selected ${questionCount} questions for ${practiceMinutes} minutes. Today’s quiz has been refreshed.`
    );
    setSelectedAnswers({});
    setScore(null);
    setCompleted(false);
  };

  const handleMarkComplete = async () => {
    const nextScore = dailyQuestions.reduce(
      (total, item) => total + (selectedAnswers[item.id] === item.answer ? 1 : 0),
      0
    );
    setScore(nextScore);
    setCompleted(true);

    const scorePercent = Math.round((nextScore / dailyQuestions.length) * 100);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('quiz_results').insert([{
          user_id: user.id,
          subject: dailyQuestions[0]?.category || 'General',
          correct_answers: nextScore,
          total_questions: dailyQuestions.length,
          score_percent: scorePercent
        }]);
        if (error) console.log("Database save quiz result error:", error.message);
        else console.log("Quiz result successfully persisted to Supabase!");
      }
    } catch (e) {
      console.log("Error logging quiz result:", e.message);
    }

    const rewardMessage =
      nextScore === dailyQuestions.length
        ? "Perfect score. You unlocked a streak boost."
        : "Nice work. Review the highlighted answers and try again tomorrow.";

    Alert.alert("Daily quiz complete", `${nextScore}/${dailyQuestions.length} correct. ${rewardMessage}`);

    if (typeof onOpenResults === "function") {
      onOpenResults({
        score: nextScore,
        totalQuestions: dailyQuestions.length,
        questionCount,
        practiceMinutes,
        dayKey,
        answeredCount,
        perfect: nextScore === dailyQuestions.length,
      });
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setScore(null);
    setCompleted(false);
  };

  const getScoreLabel = () => {
    if (score === null) return `0/${dailyQuestions.length}`;
    return `${score}/${dailyQuestions.length}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: bgStyle }]}>
      <View style={[styles.header, { borderBottomWidth: isDarkMode ? 0 : 1, borderBottomColor: '#cbd5e1' }]}>
        <Pressable style={[styles.backButton, { backgroundColor: isDarkMode ? Color.colorBlue11 : '#e2e8f0' }]} onPress={onBack}>
          <Text style={[styles.backText, { color: textPrimary }]}>←</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>{headerTitleText}</Text>
        <Pressable style={[styles.backButton, { backgroundColor: isDarkMode ? Color.colorBlue11 : '#e2e8f0' }]} onPress={handleResetQuiz}>
          <Text style={[styles.backText, { color: textPrimary }]}>↺</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: cardBg, borderColor: borderStyle }]}>
          <Text style={styles.heroLabel}>{heroLabelText}</Text>
          <Text style={[styles.heroTitle, { color: textPrimary }]}>{heroTitleText}</Text>
          <Text style={[styles.heroCopy, { color: textSecondary }]}>
            Pick how long you want to practice and how many questions you want to answer. The quiz updates daily with a fresh mix from your career topics.
          </Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.progressPill}>
              <Text style={styles.progressPillText}>{dailyQuestions.length} {language === "Hindi" ? "प्रश्न" : (language === "Telugu" ? "ప్రశ్నలు" : "questions")}</Text>
            </View>
            <View style={[styles.progressPillAlt, { backgroundColor: pillBg }]}>
              <Text style={[styles.progressPillTextAlt, { color: textPrimary }]}>{practiceMinutes} {language === "Hindi" ? "मिनट अभ्यास" : (language === "Telugu" ? "నిమిషాల ప్రాక్టీస్" : "min practice")}</Text>
            </View>
            <View style={[styles.progressPillAlt, { backgroundColor: pillBg }]}>
              <Text style={[styles.progressPillTextAlt, { color: textPrimary }]}>{language === "Hindi" ? "स्कोर" : (language === "Telugu" ? "స్కోర్" : "Score")} {getScoreLabel()}</Text>
            </View>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: pillBg }]}>
            <View style={[styles.progressFill, { width: `${Math.max(progressPercent, 12)}%` }]} />
          </View>
        </View>

        <View style={[styles.selectorCard, { backgroundColor: cardBg, borderColor: borderStyle }]}>
          <Text style={[styles.selectorLabel, { color: textPrimary }]}>{questionsCountText}</Text>
          <View style={styles.selectorRow}>
            {questionCounts.map((count) => (
              <Pressable
                key={count}
                onPress={() => setQuestionCount(count)}
                style={[styles.selectorButton, { backgroundColor: pillBg }, questionCount === count && styles.selectorButtonActive]}
              >
                <Text style={[styles.selectorButtonText, { color: textPrimary }, questionCount === count && styles.selectorButtonTextActive]}>
                  {count}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.selectorLabel, { color: textPrimary }]}>{durationText}</Text>
          <View style={styles.selectorRow}>
            {practiceDurations.map((duration) => (
              <Pressable
                key={duration.value}
                onPress={() => setPracticeMinutes(duration.value)}
                style={[styles.selectorButton, { backgroundColor: pillBg }, practiceMinutes === duration.value && styles.selectorButtonActive]}
              >
                <Text style={[styles.selectorButtonText, { color: textPrimary }, practiceMinutes === duration.value && styles.selectorButtonTextActive]}>
                  {duration.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.startPracticeButton} onPress={handleStartPractice}>
            <Text style={styles.startPracticeButtonText}>{generateQuizText}</Text>
          </Pressable>
        </View>

        <View style={[styles.dailyNoteCard, { backgroundColor: pillBg }]}>
          <Text style={styles.dailyNoteLabel}>Daily rotation</Text>
          <Text style={[styles.dailyNoteText, { color: textPrimary }]}>
            New question set for {dayKey}. The set changes automatically when the date changes.
          </Text>
        </View>

        {dailyQuestions.map((item, index) => (
          <View key={item.id} style={[styles.card, { backgroundColor: cardBg, borderWidth: isDarkMode ? 0 : 1, borderColor: borderStyle, borderStyle: 'solid' }]}>
            <View style={styles.questionHeaderRow}>
              <Text style={styles.questionIndex}>Question {index + 1}</Text>
              <Text style={[styles.questionCategory, { color: textSecondary }]}>{item.category}</Text>
            </View>
            <Text style={[styles.questionText, { color: textPrimary }]}>{item.prompt}</Text>

            <View style={styles.optionsWrap}>
              {item.options.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => handleSelectAnswer(item.id, option)}
                  style={[
                    styles.optionChip, { backgroundColor: pillBg },
                    selectedAnswers[item.id] === option && styles.optionChipSelected,
                    completed && option === item.answer && styles.optionChipCorrect,
                    completed && selectedAnswers[item.id] === option && selectedAnswers[item.id] !== item.answer && styles.optionChipWrong,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText, { color: textPrimary },
                      selectedAnswers[item.id] === option && styles.optionTextSelected,
                      completed && option === item.answer && styles.optionTextCorrect,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.answerHint, { color: textSecondary }]}>
              {completed
                ? selectedAnswers[item.id] === item.answer
                  ? "Correct"
                  : `Correct answer: ${item.answer}`
                : selectedAnswers[item.id]
                  ? `Selected: ${selectedAnswers[item.id]}`
                  : "Tap an option to answer"}
            </Text>
          </View>
        ))}

        <Pressable style={styles.completeButton} onPress={handleMarkComplete}>
          <Text style={styles.completeButtonText}>
            {completed
              ? (language === "Hindi" ? "पूर्ण" : (language === "Telugu" ? "పూర్తయింది" : "Completed"))
              : (language === "Hindi" ? "पूर्ण घोषित करें" : (language === "Telugu" ? "పూర్తయినట్లు గుర్తు చేయండి" : "Mark as Complete"))}
          </Text>
        </Pressable>

        <View style={[styles.engagementCard, { backgroundColor: cardBg, borderColor: borderStyle }]}>
          <Text style={styles.engagementLabel}>Engagement bonus</Text>
          <Text style={[styles.engagementText, { color: textPrimary }]}>
            Come back daily to keep your streak alive, get new questions, and unlock better recommendations.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.colorBlue8,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Color.colorAzure11,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: Color.colorWhiteSolid,
    fontSize: 18,
    fontWeight: StyleVariable.fontWeight700,
  },
  headerTitle: {
    color: Color.colorGrey97,
    fontFamily: FontFamily.soraBold,
    fontSize: FontSize.fs_17_6,
    fontWeight: StyleVariable.fontWeight700,
  },
  content: {
    paddingHorizontal: Padding.padding_16,
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: Color.colorBlue11,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Color.colorCyan5015,
  },
  heroLabel: {
    color: Color.colorCyan50,
    fontFamily: FontFamily.interSemiBold,
    fontSize: 12,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: Color.colorGrey97,
    fontFamily: FontFamily.soraBold,
    fontSize: 24,
    marginBottom: 8,
  },
  heroCopy: {
    color: Color.colorBlue65,
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
    backgroundColor: Color.colorCyan5015,
  },
  progressPillAlt: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Color.colorBlue19,
  },
  progressPillText: {
    color: Color.colorCyan50,
    fontFamily: FontFamily.interSemiBold,
  },
  progressPillTextAlt: {
    color: Color.colorGrey97,
    fontFamily: FontFamily.interSemiBold,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: Color.colorBlue19,
    marginTop: 14,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: Color.colorCyan50,
  },
  selectorCard: {
    backgroundColor: Color.colorBlue11,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Color.colorCyan5015,
  },
  selectorLabel: {
    color: Color.colorGrey97,
    fontSize: 13,
    fontFamily: FontFamily.interSemiBold,
    marginBottom: 10,
  },
  selectorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  selectorButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: Color.colorBlue19,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectorButtonActive: {
    backgroundColor: Color.colorCyan5015,
    borderColor: Color.colorCyan50,
  },
  selectorButtonText: {
    color: Color.colorGrey97,
    fontFamily: FontFamily.interSemiBold,
  },
  selectorButtonTextActive: {
    color: Color.colorCyan50,
  },
  startPracticeButton: {
    backgroundColor: Color.colorViolet58,
    borderRadius: 18,
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 4,
  },
  startPracticeButtonText: {
    color: Color.colorWhiteSolid,
    fontSize: 15,
    fontFamily: FontFamily.interSemiBold,
  },
  dailyNoteCard: {
    backgroundColor: Color.colorBlue19,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  dailyNoteLabel: {
    color: Color.colorCyan50,
    fontSize: 12,
    fontFamily: FontFamily.interSemiBold,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  dailyNoteText: {
    color: Color.colorGrey97,
    fontSize: 13,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Color.colorBlue11,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  questionIndex: {
    color: Color.colorCyan50,
    fontSize: 12,
    fontFamily: FontFamily.interSemiBold,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  questionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  questionCategory: {
    color: Color.colorBlue65,
    fontSize: 12,
    fontFamily: FontFamily.interSemiBold,
  },
  questionText: {
    color: Color.colorGrey97,
    fontSize: 16,
    fontFamily: FontFamily.interSemiBold,
    marginBottom: 12,
    lineHeight: 22,
  },
  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionChip: {
    backgroundColor: Color.colorBlue19,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  optionChipSelected: {
    borderWidth: 1,
    borderColor: Color.colorCyan50,
    backgroundColor: Color.colorCyan5015,
  },
  optionChipCorrect: {
    borderWidth: 1,
    borderColor: Color.colorSpringGreen39,
    backgroundColor: Color.colorSpringGreen3912,
  },
  optionChipWrong: {
    borderWidth: 1,
    borderColor: Color.colorRose60,
    backgroundColor: Color.colorRose6050,
  },
  optionText: {
    color: Color.colorGrey97,
    fontSize: 13,
  },
  optionTextSelected: {
    color: Color.colorCyan50,
    fontFamily: FontFamily.interSemiBold,
  },
  optionTextCorrect: {
    color: Color.colorSpringGreen39,
    fontFamily: FontFamily.interSemiBold,
  },
  answerHint: {
    color: Color.colorBlue65,
    marginTop: 12,
    fontSize: 13,
  },
  completeButton: {
    backgroundColor: Color.colorCyan50,
    borderRadius: 18,
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 6,
  },
  completeButtonText: {
    color: Color.colorBlue5,
    fontSize: 15,
    fontFamily: FontFamily.interSemiBold,
  },
  engagementCard: {
    backgroundColor: Color.colorBlue11,
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Color.colorCyan5015,
  },
  engagementLabel: {
    color: Color.colorCyan50,
    fontSize: 12,
    fontFamily: FontFamily.interSemiBold,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  engagementText: {
    color: Color.colorGrey97,
    fontSize: 13,
    lineHeight: 20,
  },
});

export default DailyQuizScreen;