import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Animated, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { getTheme } from "../utils/theme";
import { supabase } from "../utils/supabase";

const LibraryScreen = ({ onBack, profile = {}, isDarkMode = true, language = 'English' }) => {
  const T = getTheme(isDarkMode);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    const loadData = async () => {
      try {
        const uid = profile?.id || profile?.uid || 'default';
        let rawSessions = [];

        // Try Supabase first
        try {
          const { data, error } = await supabase
            .from('ai_chat_sessions')
            .select('session_data')
            .eq('user_id', uid)
            .order('updated_at', { ascending: false })
            .limit(1);
          if (!error && data && data.length > 0 && data[0].session_data) {
            rawSessions = typeof data[0].session_data === 'string'
              ? JSON.parse(data[0].session_data)
              : data[0].session_data;
          }
        } catch(e) {}

        // Fallback to local
        if (rawSessions.length === 0) {
          const stored = await AsyncStorage.getItem(`ai_chat_sessions_${uid}`);
          if (stored) {
            rawSessions = JSON.parse(stored);
          }
        }

        if (rawSessions.length > 0) {
          const formatted = rawSessions.map(s => {
            const size = JSON.stringify(s).length;
            const sizeStr = size < 1024 ? `${size} B` : size < 1048576 ? `${(size/1024).toFixed(1)} KB` : `${(size/1048576).toFixed(2)} MB`;
            
            const d = new Date(s.updatedAt);
            const today = new Date();
            const yest = new Date(today); yest.setDate(yest.getDate() - 1);
            
            const dateStr = d.toDateString() === today.toDateString() ? "Today" 
                          : d.toDateString() === yest.toDateString() ? "Yesterday" 
                          : d.toLocaleDateString();
            return { ...s, sizeDisplay: sizeStr, dateDisplay: dateStr };
          });
          setSessions(formatted);
        }
      } catch (e) { console.warn("Load error", e); }
    };
    loadData();
  }, [profile]);

  const executeDelete = async (id) => {
    try {
      const uid = profile?.uid || 'default';
      const stored = await AsyncStorage.getItem(`ai_chat_sessions_${uid}`);
      if (stored) {
        const updated = JSON.parse(stored).filter(s => s.id !== id);
        await AsyncStorage.setItem(`ai_chat_sessions_${uid}`, JSON.stringify(updated));
        setSessions(prev => prev.filter(s => s.id !== id));
      }
    } catch (e) { console.warn(e); }
  };

  const handleDelete = (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm("Delete this chat history permanently?")) executeDelete(id);
    } else {
      Alert.alert("Delete", "Permanently delete this chat?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => executeDelete(id) }
      ]);
    }
  };

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["rgba(124,58,237,0.15)", "transparent"]}
          style={{ position: "absolute", top: -80, right: -60, width: 340, height: 340, borderRadius: 170 }}
        />
      </View>

      <View style={S.header}>
        <Pressable onPress={onBack} style={S.backBtn}>
          <Text style={S.backIcon}>←</Text>
        </Pressable>
        <View>
          <Text style={S.pageTitle}>Library</Text>
          <Text style={S.pageSub}>Saved Chats & Analysis</Text>
        </View>
      </View>

      <View style={S.tabRow}>
        {["All", "Resumes", "Interviews"].map(t => (
          <Pressable key={t} onPress={() => setActiveTab(t)} style={[S.tab, activeTab === t && S.tabActive]}>
            <Text style={[S.tabText, activeTab === t && S.tabTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 12 }}>
          
          {sessions.length === 0 ? (
            <View style={S.emptyState}>
              <Text style={S.emptyIcon}>📂</Text>
              <Text style={S.emptyTitle}>No saved files</Text>
              <Text style={S.emptySub}>Your saved chats and analysis will appear here.</Text>
            </View>
          ) : (
            sessions.map((s, i) => (
              <View key={s.id || i} style={[S.card, { borderColor: T.border, backgroundColor: T.surface }]}>
                <View style={S.cardLeft}>
                  <View style={[S.cardIconWrap, { backgroundColor: `${T.accent}20` }]}>
                    <Text style={S.cardIcon}>💬</Text>
                  </View>
                  <View style={S.cardInfo}>
                    <Text style={S.cardTitle}>{s.title || "Untitled Session"}</Text>
                    <Text style={S.cardMeta}>{s.dateDisplay} · {s.sizeDisplay}</Text>
                  </View>
                </View>
                <Pressable style={S.delBtn} onPress={() => handleDelete(s.id)}>
                  <Text style={S.delIcon}>🗑️</Text>
                </Pressable>
              </View>
            ))
          )}

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

  tabRow: { flexDirection: "row", paddingHorizontal: 20, gap: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: T.borderLow },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 14 },
  tabActive: { backgroundColor: T.surface, borderWidth: 1, borderColor: T.border },
  tabText: { fontSize: 14, color: T.muted, fontWeight: "600" },
  tabTextActive: { color: T.text, fontWeight: "700" },

  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },

  emptyState: { padding: 40, alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 20, borderWidth: 1, borderColor: T.borderLow, borderStyle: "dashed", marginTop: 20 },
  emptyIcon: { fontSize: 32 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: T.text },
  emptySub: { fontSize: 13, color: T.muted, textAlign: "center" },

  card: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 16, borderWidth: 1 },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  cardIconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardIcon: { fontSize: 18 },
  cardInfo: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: T.text },
  cardMeta: { fontSize: 12, color: T.muted },
  delBtn: { padding: 8 },
  delIcon: { fontSize: 18 },
});

export default LibraryScreen;
