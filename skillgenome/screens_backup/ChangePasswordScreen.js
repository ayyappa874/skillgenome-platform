import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Platform, Animated, Alert } from "react-native";
import { getTheme } from "../utils/theme";

const ChangePasswordScreen = ({ onBack, isDarkMode = true }) => {
  const T = getTheme(isDarkMode);
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleUpdate = () => {
    if (!currPass || !newPass) {
      Alert.alert("Error", "Please fill in all password fields.");
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    Alert.alert("Success", "Password updated successfully!");
    if (onBack) onBack();
  };

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      <View style={S.header}>
        <Pressable style={[S.iconBtn, { backgroundColor: T.surface, borderColor: T.border }]} onPress={onBack}>
          <Text style={[S.iconBtnText, { color: T.text }]}>←</Text>
        </Pressable>
        <Text style={[S.pageTitle, { color: T.text }]}>Change Password</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 16 }}>
          
          <View style={S.fieldGroup}>
            <Text style={[S.label, { color: T.muted }]}>CURRENT PASSWORD</Text>
            <TextInput
              style={[S.input, { color: T.text, backgroundColor: T.surface, borderColor: T.border }]}
              secureTextEntry
              value={currPass}
              onChangeText={setCurrPass}
            />
          </View>

          <View style={S.fieldGroup}>
            <Text style={[S.label, { color: T.muted }]}>NEW PASSWORD</Text>
            <TextInput
              style={[S.input, { color: T.text, backgroundColor: T.surface, borderColor: T.border }]}
              secureTextEntry
              value={newPass}
              onChangeText={setNewPass}
            />
          </View>

          <View style={S.fieldGroup}>
            <Text style={[S.label, { color: T.muted }]}>CONFIRM NEW PASSWORD</Text>
            <TextInput
              style={[S.input, { color: T.text, backgroundColor: T.surface, borderColor: T.border }]}
              secureTextEntry
              value={confirmPass}
              onChangeText={setConfirmPass}
            />
          </View>

          <Pressable style={[S.updateBtn, { backgroundColor: T.accent }]} onPress={handleUpdate}>
            <Text style={S.updateText}>Update Password</Text>
          </Pressable>

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
  fieldGroup: { gap: 8 },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginLeft: 4 },
  input: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1, fontSize: 15 },
  updateBtn: { paddingVertical: 16, borderRadius: 16, alignItems: "center", marginTop: 16 },
  updateText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});

export default ChangePasswordScreen;
