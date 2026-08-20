import React from "react";
import {
  Alert, Pressable, ScrollView, StyleSheet, Text, View,
  Modal, ActivityIndicator, TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Color, FontFamily, FontSize, Padding, StyleVariable } from "../GlobalStyles";
import { getSkillRoadmap, getSkillLesson, hasOfflineRoadmap, getAvailableOfflineSkills } from "../utils/skillKnowledgeBase";

const ROADMAP_KEY_PREFIX = "SKILL_ROADMAP_V2_";
const PROGRESS_KEY_PREFIX = "SKILL_PROGRESS_V2_";
const TODAY_KEY = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
const LEVELS = ["Fresher", "Beginner", "Intermediate", "Advanced", "Proficient"];
const LEVEL_COLORS = {
  Fresher: "#06b6d4", Beginner: "#10b981", Intermediate: "#f59e0b",
  Advanced: "#8b5cf6", Proficient: "#ef4444",
};
const QUICK_SKILLS = [
  "Data Analyst", "Python Developer", "Web Developer", "Machine Learning",
  "UI/UX Designer", "React Native", "DevOps Engineer", "Digital Marketing",
];

// ── Offline Roadmap (uses knowledge base for known skills, generic for unknown) ─
const buildOfflineRoadmap = (skill) => {
  // Try knowledge base first
  const kbRoadmap = getSkillRoadmap(skill);
  if (kbRoadmap) return kbRoadmap;

  // Generic fallback for unknown skills
  const days = [
    { day: 1, level: "Fresher", dayTitle: "Introduction & Basics", topics: [
      { t: `What is ${skill}?`, d: `A clear introduction to ${skill}: what it means, where it is used, and why it matters for your career.` },
      { t: "Core Terminology", d: `The key vocabulary and technical terms you must know before starting to practice ${skill}.` },
      { t: "Industry Use Cases", d: `Real-world companies and sectors that use ${skill} and the problems it solves for them.` },
      { t: "Tools & Environment", d: `The tools, software, and environment you need to install and configure to begin practising ${skill}.` },
      { t: "Your First Exercise", d: `A beginner-friendly, guided first exercise to experience how ${skill} actually works in practice.` },
    ]},
    { day: 2, level: "Beginner", dayTitle: "Core Workflows", topics: [
      { t: "Basic Workflow", d: `The standard step-by-step workflow every beginner must master before tackling complex tasks in ${skill}.` },
      { t: "Common Patterns", d: `The most frequently used templates, approaches, and code or design patterns in ${skill}.` },
      { t: "Reading Errors", d: `How to read and understand common errors when practising ${skill} and how to fix them systematically.` },
      { t: "Guided Mini Project", d: `Build your first small working project in ${skill} by following a step-by-step guided walkthrough.` },
      { t: "Beginner Self-Assessment", d: `Test your beginner-level understanding of ${skill} with key questions and review what you know.` },
    ]},
    { day: 3, level: "Intermediate", dayTitle: "Real-World Scenarios", topics: [
      { t: "Connecting Concepts", d: `How different parts of ${skill} connect and work together to solve real production problems.` },
      { t: "Intermediate Techniques", d: `The intermediate-level techniques and best practices that experienced ${skill} practitioners rely on.` },
      { t: "Handling Edge Cases", d: `How to identify and handle edge cases, unexpected inputs, and failure scenarios in ${skill} work.` },
      { t: "Performance Awareness", d: `Understanding performance trade-offs and bottlenecks to make smarter decisions in ${skill}.` },
      { t: "Extended Project", d: `Add a real intermediate feature to your beginner project and validate it against business requirements.` },
    ]},
    { day: 4, level: "Advanced", dayTitle: "Advanced Mastery", topics: [
      { t: "Architecture & Design", d: `How to design scalable, maintainable solutions using ${skill} that hold up in production environments.` },
      { t: "Optimization Strategies", d: `Advanced optimization strategies used by senior practitioners to maximize quality and speed in ${skill}.` },
      { t: "Testing & Quality", d: `How to write tests, validate outputs, and enforce quality standards for ${skill} solutions in teams.` },
      { t: "Advanced Project", d: `Build a production-quality, end-to-end feature in ${skill} with full validation and error handling.` },
      { t: "Code Review Practice", d: `Learn how to conduct and receive code reviews for ${skill} work — giving and incorporating feedback professionally.` },
    ]},
    { day: 5, level: "Proficient", dayTitle: "Proficient Showcase", topics: [
      { t: "Leadership & Mentoring", d: `How to lead ${skill} work, mentor junior members, and set quality standards in your organization.` },
      { t: "Interview Preparation", d: `Common interview questions, design challenges, and how to confidently discuss ${skill} in job interviews.` },
      { t: "Portfolio Project", d: `Build a polished, portfolio-ready showcase in ${skill} that demonstrates full proficiency to employers.` },
      { t: "Documentation & Communication", d: `How to write clear documentation and communicate your ${skill} solutions to technical and non-technical audiences.` },
      { t: "Continuous Improvement", d: `How to stay current with ${skill} developments and continue growing professionally after achieving proficiency.` },
    ]},
  ];

  let id = 0;
  return days.flatMap((day) =>
    day.topics.map((topic) => ({
      id: ++id,
      day: day.day,
      dayTitle: day.dayTitle,
      level: day.level,
      subtopicTitle: topic.t,
      subtopicDesc: topic.d,
      parentSkill: skill,
    }))
  );
};

// ── Offline Lesson Content (uses knowledge base for known skills) ─────────────
const buildOfflineLesson = (subtopic, skill) => {
  // Try knowledge base first — this has REAL, SPECIFIC lessons
  const kbLesson = getSkillLesson(skill, subtopic.id);
  if (kbLesson) return kbLesson;

  // If the subtopic itself has a lesson field (from knowledge base roadmap)
  if (subtopic.lesson) return subtopic.lesson;

  // Generic fallback ONLY for unknown skills without knowledge base
  const title = subtopic.subtopicTitle;
  const level = subtopic.level;

  return `WHAT IT IS:
${title} is an important concept in ${skill} at the ${level} level. ${subtopic.subtopicDesc}

This topic requires hands-on learning with real examples. We recommend using the AI-generated lesson instead — tap "Change Skill" and re-select "${skill}" with an internet connection to get a detailed, specific lesson generated by AI.

HOW TO LEARN THIS:
1. Search YouTube for "${title} ${skill} tutorial" — watch a 10-15 minute video
2. Search Google for "${title} ${skill} beginner guide" — read 2-3 articles
3. Find a hands-on tutorial on freeCodeCamp, Coursera, or Kaggle
4. Practice what you learn by building something small

WHY THIS MATTERS:
${title} is a real skill that employers test in ${skill} interviews. Building practical experience with it — not just reading about it — is what makes the difference between candidates who get hired and those who don't.

PRACTICE TASK:
Search for "${title} ${skill} project" on GitHub. Find one project that uses this concept. Study the code for 20 minutes. Then try to recreate a simplified version of it yourself. Document what you learned in your own words.

NOTE: For a detailed, step-by-step lesson with code examples and specific instructions, please ensure you have internet connectivity. The AI will generate a personalized lesson covering exactly what ${title} means in ${skill}, how it works with real examples, and a specific hands-on practice task.`;
};

// ── Main Component ────────────────────────────────────────────────────────────
const DailyLearningTopicsScreen = ({onBack, profileSkills = [], userId = 'guest', isDarkMode = true, jobMatch = null}) => {
  const styles = React.useMemo(() => getStyles(isDarkMode), [isDarkMode]);
  const defaultSkill = jobMatch?.title || "Data Analyst";

  const [selectedSkill, setSelectedSkill] = React.useState(defaultSkill);
  const [skillInput, setSkillInput] = React.useState("");
  const [showSkillPicker, setShowSkillPicker] = React.useState(false);
  const [roadmap, setRoadmap] = React.useState([]);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = React.useState(false);
  const [completedIds, setCompletedIds] = React.useState([]);
  const [activeDay, setActiveDay] = React.useState(1);
  const [selectedSubtopic, setSelectedSubtopic] = React.useState(null);
  const [lessonVisible, setLessonVisible] = React.useState(false);
  const [lessonLoading, setLessonLoading] = React.useState(false);
  const [lessonContent, setLessonContent] = React.useState("");

  const todayKey = React.useMemo(() => TODAY_KEY(), []);

  // ── Load roadmap ─────────────────────────────────────────────────────────
  const loadRoadmap = React.useCallback(async (skill) => {
    setIsLoadingRoadmap(true);
    setRoadmap([]);
    try {
      // 1. Check AsyncStorage for today's progress
      const progressKey = `${PROGRESS_KEY_PREFIX}${userId}_${skill.replace(/\s+/g, "_")}`;
      const savedStr = await AsyncStorage.getItem(progressKey);
      if (savedStr) {
        const { completed } = JSON.parse(savedStr);
        setCompletedIds(completed || []);
      } else {
        setCompletedIds([]);
      }

      // 2. Check knowledge base FIRST — instant, real, specific content
      if (hasOfflineRoadmap(skill)) {
        const kbRoadmap = getSkillRoadmap(skill);
        if (kbRoadmap && kbRoadmap.length > 0) {
          setRoadmap(kbRoadmap);
          setIsLoadingRoadmap(false);
          return;
        }
      }

      // 3. Check cache for previously AI-generated roadmaps
      const cacheKey = `${ROADMAP_KEY_PREFIX}${skill.replace(/\s+/g, "_")}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        setRoadmap(JSON.parse(cached));
        setIsLoadingRoadmap(false);
        return;
      }

      // 4. Try AI for unknown skills
      const storedKey = await AsyncStorage.getItem("GEMINI_API_KEY");
      const apiKey = storedKey || "AIzaSyA7FnBEaQK9xopkeDq-RtjbXpVkBlHhtqg";

      const prompt = `You are an expert curriculum designer. Create a 5-day end-to-end learning roadmap for the skill: "${skill}".

Rules:
- Day 1 = Fresher level, Day 2 = Beginner, Day 3 = Intermediate, Day 4 = Advanced, Day 5 = Proficient
- Each day has exactly 5 SPECIFIC, REAL subtopics from ${skill} (e.g., for Data Analyst: SQL JOINs, pandas groupby, Power BI visuals — NOT generic "fundamentals")
- The subtopics must progress logically: simple on Day 1, complex on Day 5

Return ONLY valid JSON array of exactly 25 objects. Each: { "id": 1-25, "day": 1-5, "dayTitle": "4 word day theme", "level": "Fresher|Beginner|Intermediate|Advanced|Proficient", "subtopicTitle": "specific topic name max 5 words", "subtopicDesc": "one sentence about what this specific concept is and how it is applied in ${skill}" }`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      const data = await res.json();
      if (data.candidates?.[0]?.content) {
        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/\s*```json\s*/g, "").replace(/\s*```\s*/g, "").trim();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length >= 10) {
          const withSkill = parsed.map((t) => ({ ...t, parentSkill: skill }));
          setRoadmap(withSkill);
          await AsyncStorage.setItem(cacheKey, JSON.stringify(withSkill));
          setIsLoadingRoadmap(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Roadmap AI failed, using offline:", e.message);
    }
    // 4. Final fallback — generic offline roadmap
    const offline = buildOfflineRoadmap(skill);
    setRoadmap(offline);
    setIsLoadingRoadmap(false);
  }, []);

  React.useEffect(() => {
    loadRoadmap(selectedSkill);
  }, [selectedSkill, loadRoadmap]);

  // ── Persist progress ─────────────────────────────────────────────────────
  React.useEffect(() => {
    const progressKey = `sg_roadmap_progress_${userId || 'guest'}_${selectedSkill.toLowerCase().replace(/\s+/g, '_')}`;
    AsyncStorage.setItem(progressKey, JSON.stringify({ completed: completedIds, dateKey: todayKey })).catch(() => {});
  }, [completedIds, selectedSkill, todayKey, userId]);

  // ── Computed ─────────────────────────────────────────────────────────────
  const days = React.useMemo(() => {
    const map = {};
    roadmap.forEach((t) => {
      if (!map[t.day]) map[t.day] = { day: t.day, dayTitle: t.dayTitle, level: t.level, subtopics: [] };
      map[t.day].subtopics.push(t);
    });
    return Object.values(map).sort((a, b) => a.day - b.day);
  }, [roadmap]);

  const totalDays = days.length;
  const totalSubtopics = roadmap.length;
  const completedCount = completedIds.length;
  const progressPct = Math.round((completedCount / Math.max(1, totalSubtopics)) * 100);

  const isDayUnlocked = (dayNum) => {
    if (dayNum <= 1) return true;
    const prevDay = days.find((d) => d.day === dayNum - 1);
    if (!prevDay) return false;
    return prevDay.subtopics.every((s) => completedIds.includes(s.id));
  };

  // ── Open lesson ──────────────────────────────────────────────────────────
  const openLesson = async (subtopic) => {
    setSelectedSubtopic(subtopic);
    setLessonVisible(true);
    setLessonLoading(true);
    setLessonContent("");
    try {
      const cacheKey = `sg_lesson_content_${selectedSkill.toLowerCase()}_${subtopic.id}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) { setLessonContent(cached); setLessonLoading(false); return; }

      // Check knowledge base — instant, specific lessons for known skills
      const kbLesson = getSkillLesson(selectedSkill, subtopic.id);
      if (!kbLesson && subtopic.lesson) {
        setLessonContent(subtopic.lesson);
        await AsyncStorage.setItem(cacheKey, subtopic.lesson);
        setLessonLoading(false);
        return;
      }
      if (kbLesson) {
        setLessonContent(kbLesson);
        await AsyncStorage.setItem(cacheKey, kbLesson);
        setLessonLoading(false);
        return;
      }

      // For unknown skills — try AI
      const storedKey = await AsyncStorage.getItem("GEMINI_API_KEY");
      const apiKey = storedKey || "AIzaSyA7FnBEaQK9xopkeDq-RtjbXpVkBlHhtqg";

      const prompt = `You are an expert educator. Write a detailed lesson on "${subtopic.subtopicTitle}" within the skill "${selectedSkill}" for someone at the ${subtopic.level} proficiency level.

The lesson must include:
1. WHAT IT IS — Clear definition (2-3 sentences, no jargon without explanation)
2. HOW IT WORKS — Step-by-step mechanics with numbered steps or clear paragraphs
3. HOW IT HELPS — The practical business or career value with a real-world example
4. KEY THINGS TO REMEMBER — 4 bullet points of the most important takeaways
5. PRACTICE TASK — One specific hands-on task the learner can do right now

Be specific to "${subtopic.subtopicTitle}" in the context of ${selectedSkill}. Do NOT give generic advice. Write for ${subtopic.level} level.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      const data = await res.json();
      if (data.candidates?.[0]?.content) {
        const text = data.candidates[0].content.parts[0].text;
        setLessonContent(text);
        await AsyncStorage.setItem(cacheKey, text);
        setLessonLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Lesson AI failed:", e.message);
    }
    setLessonContent(buildOfflineLesson(subtopic, selectedSkill));
    setLessonLoading(false);
  };

  // ── Mark complete ────────────────────────────────────────────────────────
  const markComplete = () => {
    if (!selectedSubtopic) return;
    const id = selectedSubtopic.id;
    setCompletedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    const currentDay = days.find((d) => d.subtopics.some((s) => s.id === id));
    if (currentDay) {
      const allDone = currentDay.subtopics.every((s) => s.id === id || completedIds.includes(s.id));
      if (allDone && currentDay.day < totalDays) {
        Alert.alert("Day Complete! 🎉", `You finished Day ${currentDay.day} (${currentDay.level}). Day ${currentDay.day + 1} is now unlocked!`, [
          { text: "Continue", onPress: () => setActiveDay(currentDay.day + 1) },
        ]);
      }
    }
    setLessonVisible(false);
  };

  const applySkillChange = (skill) => {
    if (!skill.trim()) return;
    setSelectedSkill(skill.trim());
    setSkillInput("");
    setShowSkillPicker(false);
    setActiveDay(1);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Skill Roadmap</Text>
        <Pressable style={styles.changeBtn} onPress={() => setShowSkillPicker(true)}>
          <Text style={styles.changeBtnText}>Change Skill</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Skill Banner */}
        <View style={styles.skillBanner}>
          <Text style={styles.skillBannerLabel}>Learning Roadmap for</Text>
          <Text style={styles.skillBannerTitle}>{selectedSkill}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statPill}><Text style={styles.statNum}>{totalDays}</Text><Text style={styles.statLabel}>Days</Text></View>
            <View style={styles.statPill}><Text style={styles.statNum}>{totalSubtopics}</Text><Text style={styles.statLabel}>Topics</Text></View>
            <View style={styles.statPill}><Text style={styles.statNum}>{progressPct}%</Text><Text style={styles.statLabel}>Done</Text></View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.bannerHint}>Complete all 5 topics each day to unlock the next level →</Text>
        </View>

        {isLoadingRoadmap ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#25E0B5" />
            <Text style={styles.loadingText}>Building your personalized {selectedSkill.toLowerCase()} roadmap...</Text>
          </View>
        ) : (
          <>
            {/* Day selector tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={styles.dayTabs}>
                {days.map((d) => {
                  const unlocked = isDayUnlocked(d.day);
                  const isActive = d.day === activeDay;
                  const lc = LEVEL_COLORS[d.level] || "#25E0B5";
                  const dayDone = d.subtopics.every((s) => completedIds.includes(s.id));
                  return (
                    <Pressable key={d.day}
                      onPress={() => {
                        if (!unlocked) { Alert.alert("Notice", "Complete all topics in the previous day first to unlock this day."); return; }
                        setActiveDay(d.day);
                      }}
                      style={[styles.dayTab, isActive && { borderColor: lc, borderWidth: 2 }, !unlocked && styles.dayTabLocked]}
                    >
                      {dayDone && <Text style={styles.dayDoneCheck}>✓</Text>}
                      <Text style={[styles.dayTabNum, isActive && { color: lc }]}>Day {d.day}</Text>
                      <Text style={[styles.dayTabLevel, { color: lc, opacity: unlocked ? 1 : 0.4 }]}>{d.level}</Text>
                      {!unlocked && <Text style={{ fontSize: 12 }}>🔒</Text>}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Active day subtopics */}
            {days.filter((d) => d.day === activeDay).map((day) => (
              <View key={day.day}>
                <View style={styles.dayHeader}>
                  <View style={[styles.levelBadge, { backgroundColor: `${LEVEL_COLORS[day.level]}22` }]}>
                    <Text style={[styles.levelBadgeText, { color: LEVEL_COLORS[day.level] }]}>{day.level} Level</Text>
                  </View>
                  <Text style={styles.dayHeaderTitle}>Day {day.day}: {day.dayTitle}</Text>
                  <Text style={styles.dayHeaderSub}>
                    {day.subtopics.filter((s) => completedIds.includes(s.id)).length}/{day.subtopics.length} topics completed today
                  </Text>
                </View>

                {day.subtopics.map((subtopic, idx) => {
                  const done = completedIds.includes(subtopic.id);
                  const lc = LEVEL_COLORS[subtopic.level] || "#25E0B5";
                  return (
                    <Pressable key={subtopic.id} style={[styles.topicCard, done && styles.topicCardDone]} onPress={() => openLesson(subtopic)}>
                      <View style={styles.topicCardLeft}>
                        <View style={[styles.topicNum, done && { backgroundColor: "#10b981" }]}>
                          <Text style={styles.topicNumText}>{done ? "✓" : idx + 1}</Text>
                        </View>
                        <View style={styles.topicInfo}>
                          <Text style={[styles.topicTitle, done && styles.topicTitleDone]}>{subtopic.subtopicTitle}</Text>
                          <Text style={styles.topicDesc} numberOfLines={2}>{subtopic.subtopicDesc}</Text>
                        </View>
                      </View>
                      <Text style={[styles.topicArrow, { color: done ? "#10b981" : lc }]}>›</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}

            {/* Levels overview bar */}
            <View style={styles.levelsBar}>
              {LEVELS.map((lv, i) => {
                const dayForLevel = days.find((d) => d.level === lv);
                const allDone = dayForLevel?.subtopics.every((s) => completedIds.includes(s.id));
                return (
                  <React.Fragment key={lv}>
                    <View style={styles.levelStep}>
                      <View style={[styles.levelCircle, allDone && { backgroundColor: LEVEL_COLORS[lv] }]}>
                        <Text style={[styles.levelCircleText, allDone && { color: "#fff" }]}>{allDone ? "✓" : lv[0]}</Text>
                      </View>
                      <Text style={[styles.levelLabel, allDone && { color: LEVEL_COLORS[lv] }]}>{lv}</Text>
                    </View>
                    {i < LEVELS.length - 1 && <View style={styles.levelConnector} />}
                  </React.Fragment>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {/* ── Lesson Modal ──────────────────────────────────────────────────── */}
      <Modal visible={lessonVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {selectedSubtopic && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalLevel, { color: LEVEL_COLORS[selectedSubtopic.level] }]}>
                    {selectedSubtopic.level} · Day {selectedSubtopic.day} · {selectedSkill}
                  </Text>
                  <Text style={styles.modalTitle}>{selectedSubtopic.subtopicTitle}</Text>
                  <Text style={styles.modalSubtitle}>{selectedSubtopic.subtopicDesc}</Text>
                </View>
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  {lessonLoading ? (
                    <View style={styles.lessonLoading}>
                      <ActivityIndicator size="large" color="#25E0B5" />
                      <Text style={styles.lessonLoadingText}>Preparing your lesson on "{selectedSubtopic.subtopicTitle}"...</Text>
                      <Text style={styles.lessonLoadingSubText}>This includes what it is, how it works, and how it helps.</Text>
                    </View>
                  ) : (
                    <Text style={styles.lessonBody}>{lessonContent}</Text>
                  )}
                </ScrollView>
                {!lessonLoading && (
                  <View style={styles.modalFooter}>
                    <Pressable style={[styles.doneBtn, completedIds.includes(selectedSubtopic.id) && styles.doneBtnCompleted]} onPress={markComplete}>
                      <Text style={styles.doneBtnText}>
                        {completedIds.includes(selectedSubtopic.id) ? "✓ Already Completed" : "Mark as Complete ✓"}
                      </Text>
                    </Pressable>
                    <Pressable style={styles.closeBtn} onPress={() => setLessonVisible(false)}>
                      <Text style={styles.closeBtnText}>Close Lesson</Text>
                    </Pressable>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Skill Picker Modal ────────────────────────────────────────────── */}
      <Modal visible={showSkillPicker} animationType="slide" transparent>
        <Pressable style={styles.pickerOverlay} onPress={() => setShowSkillPicker(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Choose Your Skill</Text>
            <Text style={styles.pickerSubtitle}>Type any skill to get a 5-day AI-generated end-to-end roadmap</Text>
            <TextInput
              style={styles.pickerInput}
              placeholder="e.g. Data Analyst, Python, React Native..."
              placeholderTextColor="#64748b"
              value={skillInput}
              onChangeText={setSkillInput}
              autoFocus
              returnKeyType="go"
              onSubmitEditing={() => applySkillChange(skillInput)}
            />
            <Pressable style={styles.pickerGoBtn} onPress={() => applySkillChange(skillInput)}>
              <Text style={styles.pickerGoBtnText}>Generate Roadmap →</Text>
            </Pressable>
            <Text style={styles.pickerOrText}>Or choose quickly:</Text>
            <View style={styles.quickSkills}>
              {QUICK_SKILLS.map((qs) => (
                <Pressable key={qs} style={styles.quickSkillChip} onPress={() => applySkillChange(qs)}>
                  <Text style={styles.quickSkillText}>{qs}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const getStyles = (isDarkMode) => {
  const bg = isDarkMode ? "#0d0f1a" : "#f8fafc";
  const card = isDarkMode ? "#151929" : "#ffffff";
  const text = isDarkMode ? "#f1f5f9" : "#0f172a";
  const muted = isDarkMode ? "#64748b" : "#64748b";
  const border = isDarkMode ? "rgba(255,255,255,0.07)" : "#e2e8f0";
  const alt = isDarkMode ? "#1e293b" : "#f1f5f9";

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: bg, paddingTop: 44 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 10 },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: border },
    backText: { color: text, fontSize: 18, fontWeight: "700" },
    headerTitle: { color: text, fontSize: 17, fontWeight: "700" },
    changeBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "rgba(37,224,181,0.12)" },
    changeBtnText: { color: "#25E0B5", fontSize: 12, fontWeight: "600" },
    content: { paddingHorizontal: 16, paddingBottom: 60 },

    skillBanner: { backgroundColor: card, borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: border },
    skillBannerLabel: { color: muted, fontSize: 12, marginBottom: 4 },
    skillBannerTitle: { color: text, fontSize: 22, fontWeight: "800", marginBottom: 12 },
    statsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
    statPill: { backgroundColor: "rgba(37,224,181,0.1)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, alignItems: "center", minWidth: 72 },
    statNum: { color: "#25E0B5", fontSize: 18, fontWeight: "800" },
    statLabel: { color: muted, fontSize: 10 },
    progressTrack: { height: 6, borderRadius: 999, backgroundColor: alt, overflow: "hidden", marginBottom: 8 },
    progressFill: { height: "100%", borderRadius: 999, backgroundColor: "#25E0B5" },
    bannerHint: { color: muted, fontSize: 11 },

    loadingBox: { paddingVertical: 60, alignItems: "center" },
    loadingText: { marginTop: 16, color: text, fontSize: 15, fontWeight: "600", textAlign: "center" },
    loadingSubText: { marginTop: 6, color: muted, fontSize: 13, textAlign: "center" },

    dayTabs: { flexDirection: "row", gap: 10, paddingVertical: 4 },
    dayTab: { backgroundColor: card, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, alignItems: "center", minWidth: 78, borderWidth: 1, borderColor: border, gap: 2 },
    dayTabLocked: { opacity: 0.45 },
    dayDoneCheck: { color: "#10b981", fontSize: 12, fontWeight: "700" },
    dayTabNum: { color: text, fontSize: 13, fontWeight: "700" },
    dayTabLevel: { fontSize: 10, fontWeight: "600" },

    dayHeader: { marginBottom: 14 },
    levelBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, marginBottom: 8 },
    levelBadgeText: { fontSize: 12, fontWeight: "700" },
    dayHeaderTitle: { color: text, fontSize: 18, fontWeight: "800", marginBottom: 2 },
    dayHeaderSub: { color: muted, fontSize: 13 },

    topicCard: { backgroundColor: card, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: border, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    topicCardDone: { borderColor: "#10b981", backgroundColor: isDarkMode ? "#0a1a12" : "#f0fdf4" },
    topicCardLeft: { flexDirection: "row", alignItems: "flex-start", flex: 1, gap: 12 },
    topicNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(37,224,181,0.15)", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    topicNumText: { color: "#25E0B5", fontSize: 13, fontWeight: "700" },
    topicInfo: { flex: 1 },
    topicTitle: { color: text, fontSize: 15, fontWeight: "700", marginBottom: 4 },
    topicTitleDone: { color: "#10b981" },
    topicDesc: { color: muted, fontSize: 12, lineHeight: 17 },
    topicArrow: { fontSize: 22, fontWeight: "700", paddingLeft: 8 },

    levelsBar: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 24, marginBottom: 4 },
    levelStep: { alignItems: "center", gap: 4 },
    levelCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: alt, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: border },
    levelCircleText: { color: muted, fontSize: 12, fontWeight: "700" },
    levelLabel: { color: muted, fontSize: 9, fontWeight: "600" },
    levelConnector: { flex: 1, height: 2, backgroundColor: border, marginHorizontal: 4, alignSelf: "center", marginBottom: 16 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: bg, paddingTop: 44 },
    modalSheet: { backgroundColor: bg, flex: 1 },
    modalHeader: { padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: border },
    modalLevel: { fontSize: 12, fontWeight: "700", marginBottom: 4 },
    modalTitle: { color: text, fontSize: 20, fontWeight: "800", marginBottom: 4 },
    modalSubtitle: { color: muted, fontSize: 13, lineHeight: 18 },
    modalBody: { flex: 1, padding: 20 },
    lessonLoading: { paddingVertical: 50, alignItems: "center" },
    lessonLoadingText: { marginTop: 16, color: text, fontSize: 15, fontWeight: "600", textAlign: "center" },
    lessonLoadingSubText: { marginTop: 6, color: muted, fontSize: 12, textAlign: "center" },
    lessonBody: { color: text, fontSize: 15, lineHeight: 26 },
    modalFooter: { padding: 20, gap: 10 },
    doneBtn: { backgroundColor: "#25E0B5", borderRadius: 999, paddingVertical: 16, alignItems: "center" },
    doneBtnCompleted: { backgroundColor: "#10b981" },
    doneBtnText: { color: "#000", fontSize: 16, fontWeight: "700" },
    closeBtn: { backgroundColor: alt, borderRadius: 999, paddingVertical: 14, alignItems: "center" },
    closeBtnText: { color: text, fontSize: 15, fontWeight: "600" },

    // Skill Picker
    pickerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
    pickerSheet: { backgroundColor: card, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 },
    pickerTitle: { color: text, fontSize: 20, fontWeight: "800", marginBottom: 6 },
    pickerSubtitle: { color: muted, fontSize: 13, marginBottom: 16, lineHeight: 18 },
    pickerInput: { backgroundColor: alt, color: text, borderRadius: 14, padding: 14, fontSize: 15, marginBottom: 12, borderWidth: 1, borderColor: border },
    pickerGoBtn: { backgroundColor: "#25E0B5", borderRadius: 999, paddingVertical: 14, alignItems: "center", marginBottom: 16 },
    pickerGoBtnText: { color: "#000", fontSize: 15, fontWeight: "700" },
    pickerOrText: { color: muted, fontSize: 13, marginBottom: 10 },
    quickSkills: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingBottom: 24 },
    quickSkillChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: alt, borderWidth: 1, borderColor: border },
    quickSkillText: { color: text, fontSize: 13 },
  });
};

export default DailyLearningTopicsScreen;
