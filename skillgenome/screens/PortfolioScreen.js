import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Platform, Animated, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getTheme } from "../utils/theme";

const PortfolioScreen = ({ onBack, isDarkMode = true }) => {
  
  const T = getTheme(isDarkMode);
  const S = React.useMemo(() => getStyles(T), [T]);
  const [projects, setProjects] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newSub, setNewSub] = useState("");

  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    setProjects(prev => [...prev, { id: Date.now(), title: newTitle, subtitle: newSub || "React · Node", icon: "💻" }]);
    setNewTitle("");
    setNewSub("");
  };

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      <View style={S.header}>
        <Pressable onPress={onBack} style={S.backBtn}>
          <Text style={S.backIcon}>←</Text>
        </Pressable>
        <View>
          <Text style={S.pageTitle}>Portfolio Builder</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 20 }}>
          
          <View style={[S.card, { borderColor: T.border, backgroundColor: T.surface }]}>
            <Text style={[S.cardHeading, { color: T.text }]}>Add New Project</Text>
            <TextInput
              style={[S.input, { color: T.text, backgroundColor: T.surface2, borderColor: T.borderLow }]}
              placeholder="Project Title"
              placeholderTextColor={T.muted}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={[S.input, { color: T.text, backgroundColor: T.surface2, borderColor: T.borderLow }]}
              placeholder="Technologies (e.g. React Native, AWS)"
              placeholderTextColor={T.muted}
              value={newSub}
              onChangeText={setNewSub}
            />
            <Pressable style={[S.addBtn, { backgroundColor: T.accent }]} onPress={handleAdd}>
              <Text style={S.addText}>Add Project</Text>
            </Pressable>
          </View>

          <Text style={[S.sectionTitle, { color: T.muted }]}>YOUR PROJECTS</Text>
          <View style={S.list}>
            {projects.map(p => (
              <View key={p.id} style={[S.projCard, { borderColor: T.border, backgroundColor: T.surface }]}>
                <View style={[S.iconBox, { backgroundColor: T.surface2 }]}>
                  <Text style={S.icon}>{p.icon}</Text>
                </View>
                <View style={S.projInfo}>
                  <Text style={[S.projTitle, { color: T.text }]}>{p.title}</Text>
                  <Text style={[S.projSub, { color: T.muted }]}>{p.subtitle}</Text>
                </View>
              </View>
            ))}
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
  },
  backBtn:   { width: 42, height: 42, borderRadius: 21, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, alignItems: "center", justifyContent: "center" },
  backIcon:  { fontSize: 18, color: T.text, fontWeight: "600", marginTop: -2 },
  pageTitle: { fontSize: 24, fontWeight: "900", color: T.text, letterSpacing: -0.5 },
  pageSub:   { fontSize: 14, color: T.muted, fontWeight: "500", marginTop: 2 },

  content: { paddingHorizontal: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },
  card: { padding: 18, borderRadius: 20, borderWidth: 1, gap: 12 },
  cardHeading: { fontSize: 16, fontWeight: "800" },
  input: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, fontSize: 14 },
  addBtn: { paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 4 },
  addText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginLeft: 4 },
  list: { gap: 12 },
  projCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1, gap: 14 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 20 },
  projInfo: { flex: 1 },
  projTitle: { fontSize: 16, fontWeight: "700" },
  projSub: { fontSize: 13, marginTop: 2 },
});

export default PortfolioScreen;
