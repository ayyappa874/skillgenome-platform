import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Platform, Animated, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getTheme } from "../utils/theme";

const PortfolioScreen = ({ onBack, isDarkMode = true }) => {
  const T = getTheme(isDarkMode);
  const [projects, setProjects] = useState([
    { id: 1, title: "EmotionPrint AI", subtitle: "Python · TensorFlow", icon: "🧠" },
    { id: 2, title: "Career Genome", subtitle: "Node · MongoDB", icon: "🚀" }
  ]);
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
        <Pressable style={[S.iconBtn, { backgroundColor: T.surface, borderColor: T.border }]} onPress={onBack}>
          <Text style={[S.iconBtnText, { color: T.text }]}>←</Text>
        </Pressable>
        <Text style={[S.pageTitle, { color: T.text }]}>Portfolio Builder</Text>
        <View style={{ width: 42 }} />
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

const S = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? 54 : 28, paddingHorizontal: 20, paddingBottom: 16 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  iconBtnText: { fontSize: 18, fontWeight: "600" },
  pageTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.4 },

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
