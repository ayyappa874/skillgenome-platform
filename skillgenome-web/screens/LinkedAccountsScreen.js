import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Animated, Alert } from "react-native";
import { getTheme } from "../utils/theme";

const LinkedAccountsScreen = ({ onBack, isDarkMode = true, language = 'English' }) => {
  const T = getTheme(isDarkMode);
  const [accounts, setAccounts] = useState([
    { id: "github", name: "GitHub", connected: true, username: "@devuser" },
    { id: "linkedin", name: "LinkedIn", connected: false, username: "" },
    { id: "google", name: "Google", connected: true, username: "user@gmail.com" },
  ]);

  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const toggleConnect = (id) => {
    setAccounts(prev => prev.map(a => {
      if (a.id === id) {
        const nextState = !a.connected;
        Alert.alert(nextState ? "Connected" : "Disconnected", `${a.name} account ${nextState ? 'linked' : 'unlinked'}.`);
        return { ...a, connected: nextState };
      }
      return a;
    }));
  };

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      <View style={S.header}>
        <Pressable style={[S.iconBtn, { backgroundColor: T.surface, borderColor: T.border }]} onPress={onBack}>
          <Text style={[S.iconBtnText, { color: T.text }]}>←</Text>
        </Pressable>
        <Text style={[S.pageTitle, { color: T.text }]}>Linked Accounts</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 14 }}>
          
          {accounts.map(a => (
            <View key={a.id} style={[S.row, { borderColor: T.border, backgroundColor: T.surface }]}>
              <View style={S.info}>
                <Text style={[S.name, { color: T.text }]}>{a.name}</Text>
                <Text style={[S.sub, { color: T.muted }]}>{a.connected ? a.username || "Connected" : "Not connected"}</Text>
              </View>
              <Pressable
                style={[
                  S.btn,
                  a.connected ? { backgroundColor: T.surface2, borderColor: T.border } : { backgroundColor: T.accent }
                ]}
                onPress={() => toggleConnect(a.id)}
              >
                <Text style={[S.btnText, { color: a.connected ? T.text : "#fff" }]}>
                  {a.connected ? "Disconnect" : "Connect"}
                </Text>
              </Pressable>
            </View>
          ))}

        </Animated.View>
      </ScrollView>
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? 54 : 28, paddingHorizontal: 20, paddingBottom: 16 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  iconBtnText: { fontSize: 18, fontWeight: "600" },
  pageTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.4 },

  content: { paddingHorizontal: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 18, borderRadius: 18, borderWidth: 1 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "800" },
  sub: { fontSize: 13, marginTop: 2 },
  btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  btnText: { fontSize: 13, fontWeight: "700" },
});

export default LinkedAccountsScreen;
