import * as React from "react";
import { ScrollView, Text, StyleSheet, View, TextInput, Pressable, Animated, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getTheme } from "../utils/theme";

const MOODS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😔", label: "Stressed" },
  { emoji: "😟", label: "Anxious" },
  { emoji: "😎", label: "Confident" }
];

const SCREEN26THOUGHTPRINTINPUT = ({ onBack, entries = [], onAddEntry, isDarkMode = true, language = 'English' }) => {
  
  const T = getTheme(isDarkMode);
  const S = React.useMemo(() => getStyles(T), [T]);
  const [journalText, setJournalText] = React.useState("");
  const [selectedMood, setSelectedMood] = React.useState(null);
  
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood.label);
    setJournalText(prev => prev ? `${prev} ${mood.emoji}` : mood.emoji);
  };

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[`${T.accent}15`, "transparent"]}
          style={{ position: "absolute", top: -80, right: -60, width: 340, height: 340, borderRadius: 170 }}
        />
      </View>

      <View style={S.header}>
        <Pressable style={[S.iconBtn, { backgroundColor: T.surface, borderColor: T.border }]} onPress={onBack}>
          <Text style={[S.iconBtnText, { color: T.text }]}>←</Text>
        </Pressable>
        <View>
          <Text style={[S.pageTitle, { color: T.text }]}>ThoughtPrint</Text>
          <Text style={[S.pageSub, { color: T.muted }]}>Track your cognitive flow</Text>
        </View>
      </View>

      <KeyboardAwareScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 20 }}>
          
          <View style={[S.card, { borderColor: T.border, backgroundColor: T.surface }]}>
            <Text style={[S.sectionTitle, { color: T.text }]}>How are you feeling?</Text>
            <View style={S.moodRow}>
              {MOODS.map(m => (
                <Pressable
                  key={m.label}
                  onPress={() => handleMoodSelect(m)}
                  style={[
                    S.moodPill,
                    { borderColor: T.borderLow, backgroundColor: T.surface2 },
                    selectedMood === m.label && { borderColor: T.accent, backgroundColor: `${T.accent}15` }
                  ]}
                >
                  <Text style={S.moodEmoji}>{m.emoji}</Text>
                  <Text style={[S.moodLabel, { color: selectedMood === m.label ? T.accent : T.muted }]}>{m.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={[S.card, { borderColor: T.border, backgroundColor: T.surface, flex: 1, minHeight: 280 }]}>
            <TextInput
              style={[S.input, { color: T.text }]}
              placeholder="What's on your mind? Did you learn something new? Encounter a bug?"
              placeholderTextColor={T.muted}
              multiline
              value={journalText}
              onChangeText={setJournalText}
              textAlignVertical="top"
            />
          </View>

          <Pressable 
            style={[S.saveBtn, { backgroundColor: T.accent }]}
            onPress={() => {
              if (typeof onAddEntry === 'function' && journalText) {
                onAddEntry({ text: journalText, mood: selectedMood });
                setJournalText("");
              }
            }}
          >
            <Text style={S.saveText}>Log Entry</Text>
          </Pressable>

          <View style={S.historyWrap}>
            <Text style={[S.historyTitle, { color: T.muted }]}>PAST ENTRIES</Text>
            {entries.slice(0, 3).map((e, i) => (
              <View key={i} style={[S.entryItem, { borderColor: T.borderLow, backgroundColor: T.surface2 }]}>
                <Text style={[S.entryDate, { color: T.accent }]}>{e.mood || "Neutral"}</Text>
                <Text style={[S.entryText, { color: T.text }]} numberOfLines={2}>{e.text}</Text>
              </View>
            ))}
          </View>

        </Animated.View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 16, paddingTop: Platform.OS === "ios" ? 54 : 28, paddingHorizontal: 20, paddingBottom: 16 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  iconBtnText: { fontSize: 18, fontWeight: "600" },
  pageTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.4 },
  pageSub: { fontSize: 12, marginTop: 2 },
  
  content: { paddingHorizontal: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },
  
  card: { padding: 18, borderRadius: 20, borderWidth: 1, gap: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "800" },
  
  moodRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  moodPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, gap: 6 },
  moodEmoji: { fontSize: 16 },
  moodLabel: { fontSize: 12, fontWeight: "700" },

  input: { flex: 1, fontSize: 16, lineHeight: 24 },
  
  saveBtn: { paddingVertical: 16, borderRadius: 16, alignItems: "center", marginTop: 10 },
  saveText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  historyWrap: { gap: 10, marginTop: 20 },
  historyTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginLeft: 4 },
  entryItem: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 4 },
  entryDate: { fontSize: 12, fontWeight: "700" },
  entryText: { fontSize: 14, lineHeight: 20, opacity: 0.9 },
});

export default SCREEN26THOUGHTPRINTINPUT;
