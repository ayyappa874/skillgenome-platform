import re

# 1. Transform DailyQuizScreen.js
filepath_quiz = "c:/Users/ASUS/Desktop/skill - Copy/skillgenome/screens/DailyQuizScreen.js"
with open(filepath_quiz, "r", encoding="utf-8") as f:
    quiz_content = f.read()

old_quiz_sig = "const DailyQuizScreen = ({ onBack, onOpenResults }) => {"
new_quiz_sig = """const DailyQuizScreen = ({ onBack, onOpenResults, isDarkMode = true, language = 'English' }) => {
  const bgStyle = isDarkMode ? Color.colorBlue8 || '#0d0d1a' : '#f8fafc';
  const cardBg = isDarkMode ? Color.colorBlue11 || '#161a22' : '#ffffff';
  const borderStyle = isDarkMode ? Color.colorCyan5015 || 'rgba(0, 212, 255, 0.15)' : '#cbd5e1';
  const textPrimary = isDarkMode ? Color.colorGrey97 || '#ffffff' : '#0f172a';
  const textSecondary = isDarkMode ? Color.colorBlue65 || '#94a3b8' : '#475569';
  const pillBg = isDarkMode ? Color.colorBlue19 || '#2e3448' : '#e2e8f0';"""

if old_quiz_sig in quiz_content:
    quiz_content = quiz_content.replace(old_quiz_sig, new_quiz_sig)
    
    # Inline style replacements in DailyQuizScreen.js JSX
    quiz_content = quiz_content.replace('<View style={styles.container}>', '<View style={[styles.container, { backgroundColor: bgStyle }]}>')
    quiz_content = quiz_content.replace('<View style={styles.header}>', "<View style={[styles.header, { borderBottomWidth: isDarkMode ? 0 : 1, borderBottomColor: '#cbd5e1' }]}>")
    quiz_content = quiz_content.replace('<Pressable style={styles.backButton} onPress={onBack}>', "<Pressable style={[styles.backButton, { backgroundColor: isDarkMode ? Color.colorBlue11 : '#e2e8f0' }]} onPress={onBack}>")
    quiz_content = quiz_content.replace('<Pressable style={styles.backButton} onPress={handleResetQuiz}>', "<Pressable style={[styles.backButton, { backgroundColor: isDarkMode ? Color.colorBlue11 : '#e2e8f0' }]} onPress={handleResetQuiz}>")
    quiz_content = quiz_content.replace('<Text style={styles.backText}>←</Text>', '<Text style={[styles.backText, { color: textPrimary }]}>←</Text>')
    quiz_content = quiz_content.replace('<Text style={styles.backText}>↺</Text>', '<Text style={[styles.backText, { color: textPrimary }]}>↺</Text>')
    quiz_content = quiz_content.replace('<Text style={styles.headerTitle}>Daily Quiz</Text>', '<Text style={[styles.headerTitle, { color: textPrimary }]}>Daily Quiz</Text>')
    quiz_content = quiz_content.replace('<View style={styles.heroCard}>', '<View style={[styles.heroCard, { backgroundColor: cardBg, borderColor: borderStyle }]}>')
    quiz_content = quiz_content.replace('<Text style={styles.heroTitle}>Daily quiz resets every day</Text>', '<Text style={[styles.heroTitle, { color: textPrimary }]}>Daily quiz resets every day</Text>')
    quiz_content = quiz_content.replace('<Text style={styles.heroCopy}>', '<Text style={[styles.heroCopy, { color: textSecondary }]}>')
    quiz_content = quiz_content.replace('<View style={styles.progressPillAlt}>', '<View style={[styles.progressPillAlt, { backgroundColor: pillBg }]}>')
    quiz_content = quiz_content.replace('<Text style={styles.progressPillTextAlt}>', '<Text style={[styles.progressPillTextAlt, { color: textPrimary }]}>')
    quiz_content = quiz_content.replace('<View style={styles.progressTrack}>', '<View style={[styles.progressTrack, { backgroundColor: pillBg }]}>')
    quiz_content = quiz_content.replace('<View style={styles.selectorCard}>', '<View style={[styles.selectorCard, { backgroundColor: cardBg, borderColor: borderStyle }]}>')
    quiz_content = quiz_content.replace('<Text style={styles.selectorLabel}>How many questions?</Text>', '<Text style={[styles.selectorLabel, { color: textPrimary }]}>How many questions?</Text>')
    quiz_content = quiz_content.replace('<Text style={styles.selectorLabel}>How long to practice?</Text>', '<Text style={[styles.selectorLabel, { color: textPrimary }]}>How long to practice?</Text>')
    
    # Selector Buttons
    quiz_content = quiz_content.replace('style={[styles.selectorButton, questionCount === count && styles.selectorButtonActive]}', 'style={[styles.selectorButton, { backgroundColor: pillBg }, questionCount === count && styles.selectorButtonActive]}')
    quiz_content = quiz_content.replace('style={[styles.selectorButton, practiceMinutes === duration.value && styles.selectorButtonActive]}', 'style={[styles.selectorButton, { backgroundColor: pillBg }, practiceMinutes === duration.value && styles.selectorButtonActive]}')
    quiz_content = quiz_content.replace('style={[styles.selectorButtonText, questionCount === count && styles.selectorButtonTextActive]}', 'style={[styles.selectorButtonText, { color: textPrimary }, questionCount === count && styles.selectorButtonTextActive]}')
    quiz_content = quiz_content.replace('style={[styles.selectorButtonText, practiceMinutes === duration.value && styles.selectorButtonTextActive]}', 'style={[styles.selectorButtonText, { color: textPrimary }, practiceMinutes === duration.value && styles.selectorButtonTextActive]}')
    
    quiz_content = quiz_content.replace('<View style={styles.dailyNoteCard}>', '<View style={[styles.dailyNoteCard, { backgroundColor: pillBg }]}>')
    quiz_content = quiz_content.replace('<Text style={styles.dailyNoteText}>', '<Text style={[styles.dailyNoteText, { color: textPrimary }]}>')
    quiz_content = quiz_content.replace('style={styles.card}', "style={[styles.card, { backgroundColor: cardBg, borderWidth: isDarkMode ? 0 : 1, borderColor: borderStyle, borderStyle: 'solid' }]}")
    quiz_content = quiz_content.replace('<Text style={styles.questionCategory}>{item.category}</Text>', '<Text style={[styles.questionCategory, { color: textSecondary }]}>{item.category}</Text>')
    quiz_content = quiz_content.replace('<Text style={styles.questionText}>{item.prompt}</Text>', '<Text style={[styles.questionText, { color: textPrimary }]}>{item.prompt}</Text>')
    
    # Options
    quiz_content = quiz_content.replace('style={[\n                    styles.optionChip,\n                    selectedAnswers[item.id] === option && styles.optionChipSelected,\n                    completed && option === item.answer && styles.optionChipCorrect,\n                    completed && selectedAnswers[item.id] === option && selectedAnswers[item.id] !== item.answer && styles.optionChipWrong,\n                  ]}', 'style={[\n                    styles.optionChip, { backgroundColor: pillBg },\n                    selectedAnswers[item.id] === option && styles.optionChipSelected,\n                    completed && option === item.answer && styles.optionChipCorrect,\n                    completed && selectedAnswers[item.id] === option && selectedAnswers[item.id] !== item.answer && styles.optionChipWrong,\n                  ]}')
    quiz_content = quiz_content.replace('style={[\n                      styles.optionText,\n                      selectedAnswers[item.id] === option && styles.optionTextSelected,\n                      completed && option === item.answer && styles.optionTextCorrect,\n                    ]}', 'style={[\n                      styles.optionText, { color: textPrimary },\n                      selectedAnswers[item.id] === option && styles.optionTextSelected,\n                      completed && option === item.answer && styles.optionTextCorrect,\n                    ]}')
    quiz_content = quiz_content.replace('<Text style={styles.answerHint}>', '<Text style={[styles.answerHint, { color: textSecondary }]}>')
    quiz_content = quiz_content.replace('<View style={styles.engagementCard}>', '<View style={[styles.engagementCard, { backgroundColor: cardBg, borderColor: borderStyle }]}>')
    quiz_content = quiz_content.replace('<Text style={styles.engagementText}>', '<Text style={[styles.engagementText, { color: textPrimary }]}>')

    with open(filepath_quiz, "w", encoding="utf-8") as f:
        f.write(quiz_content)
    print("DailyQuizScreen.js refactored successfully.")
else:
    print("DailyQuizScreen.js signature already updated or not found.")

# 2. Transform DailyQuizResultsScreen.js
filepath_results = "c:/Users/ASUS/Desktop/skill - Copy/skillgenome/screens/DailyQuizResultsScreen.js"
with open(filepath_results, "r", encoding="utf-8") as f:
    results_content = f.read()

old_res_sig = "const DailyQuizResultsScreen = ({ result, onBack, onPracticeAgain }) => {"
new_res_sig = """const DailyQuizResultsScreen = ({ result, onBack, onPracticeAgain, isDarkMode = true, language = 'English' }) => {
  const bgStyle = isDarkMode ? Color.colorBlue8 || '#0d0d1a' : '#f8fafc';
  const cardBg = isDarkMode ? Color.colorBlue5 || '#060612' : '#ffffff';
  const innerCardBg = isDarkMode ? Color.colorBlue16 || '#1e2235' : '#f1f5f9';
  const borderStyle = isDarkMode ? Color.colorOrange50 || '#ff9900' : '#cbd5e1';
  const textPrimary = isDarkMode ? Color.colorGrey97 || '#ffffff' : '#0f172a';
  const textSecondary = isDarkMode ? Color.colorBlue65 || '#94a3b8' : '#475569';
  const pillBg = isDarkMode ? Color.colorBlue19 || '#2e3448' : '#e2e8f0';"""

if old_res_sig in results_content:
    results_content = results_content.replace(old_res_sig, new_res_sig)
    
    results_content = results_content.replace('<View style={styles.container}>', '<View style={[styles.container, { backgroundColor: bgStyle }]}>')
    results_content = results_content.replace('<View style={styles.card}>', '<View style={[styles.card, { backgroundColor: cardBg, borderColor: isDarkMode ? Color.colorOrange50 : borderStyle }]}>')
    results_content = results_content.replace('<Text style={styles.mainTitle}>{won ? "You Won!" : "Nice Try!"}</Text>', "<Text style={[styles.mainTitle, { color: isDarkMode ? Color.colorOrange50 : '#ff9900' }]}>{won ? 'You Won!' : 'Nice Try!'}</Text>")
    results_content = results_content.replace('<Text style={styles.subtitle}>', '<Text style={[styles.subtitle, { color: textSecondary }]}>')
    results_content = results_content.replace('<View style={styles.scoreBlockPrimary}>', '<View style={[styles.scoreBlockPrimary, { backgroundColor: pillBg, borderColor: borderStyle }]}>')
    results_content = results_content.replace('<View style={styles.scoreBlockSecondary}>', '<View style={[styles.scoreBlockSecondary, { backgroundColor: innerCardBg, borderColor: isDarkMode ? Color.colorBlue23 : borderStyle }]}>')
    
    results_content = results_content.replace('<Text style={styles.scoreLabel}>You</Text>', '<Text style={[styles.scoreLabel, { color: textSecondary }]}>You</Text>')
    results_content = results_content.replace('<Text style={styles.scoreLabel}>Challenge</Text>', '<Text style={[styles.scoreLabel, { color: textSecondary }]}>Challenge</Text>')
    results_content = results_content.replace('<Text style={styles.scoreMeta}>{percent}% correct</Text>', '<Text style={[styles.scoreMeta, { color: textSecondary }]}>{percent}% correct</Text>')
    results_content = results_content.replace('<Text style={styles.scoreMeta}>Questions missed</Text>', '<Text style={[styles.scoreMeta, { color: textSecondary }]}>Questions missed</Text>')
    results_content = results_content.replace('<Text style={styles.scoreValue}>{score}</Text>', "<Text style={[styles.scoreValue, { color: isDarkMode ? Color.colorOrange50 : '#ff9900' }]}>{score}</Text>")
    results_content = results_content.replace('<Text style={styles.scoreValueSecondary}>{Math.max(totalQuestions - score, 0)}</Text>', '<Text style={[styles.scoreValueSecondary, { color: textPrimary }]}>{Math.max(totalQuestions - score, 0)}</Text>')
    results_content = results_content.replace('<Text style={styles.vsText}>VS</Text>', '<Text style={[styles.vsText, { color: textSecondary }]}>VS</Text>')
    
    results_content = results_content.replace('<View style={styles.rewardCard}>', '<View style={[styles.rewardCard, { backgroundColor: innerCardBg }]}>')
    results_content = results_content.replace('<View style={styles.rewardItem}>', '<View style={[styles.rewardItem, { backgroundColor: pillBg }]}>')
    results_content = results_content.replace('<Text style={styles.rewardValue}>+{score * 3} XP</Text>', '<Text style={[styles.rewardValue, { color: textPrimary }]}>+{score * 3} XP</Text>')
    results_content = results_content.replace('<Text style={styles.rewardValue}>+{Math.max(1, totalQuestions - score)} XP</Text>', '<Text style={[styles.rewardValue, { color: textPrimary }]}>+{Math.max(1, totalQuestions - score)} XP</Text>')
    results_content = results_content.replace('<Text style={styles.rewardValue}>{won ? "React Pro" : "Retry"}</Text>', '<Text style={[styles.rewardValue, { color: textPrimary }]}>{won ? "React Pro" : "Retry"}</Text>')
    results_content = results_content.replace('<Text style={styles.rewardLabel}>You</Text>', '<Text style={[styles.rewardLabel, { color: textSecondary }]}>You</Text>')
    results_content = results_content.replace('<Text style={styles.rewardLabel}>Practice gain</Text>', '<Text style={[styles.rewardLabel, { color: textSecondary }]}>Practice gain</Text>')
    results_content = results_content.replace('<Text style={styles.rewardLabel}>{won ? "New badge" : "Keep going"}</Text>', '<Text style={[styles.rewardLabel, { color: textSecondary }]}>{won ? "New badge" : "Keep going"}</Text>')
    
    results_content = results_content.replace('<View style={styles.summaryCard}>', "<View style={[styles.summaryCard, { backgroundColor: isDarkMode ? Color.colorBlue11 : '#f8fafc', borderStyle: 'solid', borderWidth: isDarkMode ? 0 : 1, borderColor: '#e2e8f0' }]}>")
    results_content = results_content.replace('<Text style={styles.summaryTitle}>Today’s summary</Text>', '<Text style={[styles.summaryTitle, { color: textPrimary }]}>Today’s summary</Text>')
    results_content = results_content.replace('<Text style={styles.summaryText}>', '<Text style={[styles.summaryText, { color: textSecondary }]}>')
    results_content = results_content.replace('<Pressable style={styles.secondaryButton} onPress={onPracticeAgain}>', '<Pressable style={[styles.secondaryButton, { backgroundColor: pillBg, borderColor: borderStyle }]} onPress={onPracticeAgain}>')
    results_content = results_content.replace('<Text style={styles.secondaryButtonText}>Practice Again</Text>', "<Text style={[styles.secondaryButtonText, { color: isDarkMode ? Color.colorOrange50 : '#ff9900' }]}>Practice Again</Text>")
    results_content = results_content.replace('<Text style={styles.backButtonText}>Back to Career Stimulation</Text>', '<Text style={[styles.backButtonText, { color: textSecondary }]}>Back to Career Stimulation</Text>')

    with open(filepath_results, "w", encoding="utf-8") as f:
        f.write(results_content)
    print("DailyQuizResultsScreen.js refactored successfully.")
else:
    print("DailyQuizResultsScreen.js signature already updated or not found.")
