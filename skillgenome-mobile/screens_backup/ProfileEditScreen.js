import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Platform, Animated, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getTheme } from "../utils/theme";

const ProfileEditScreen = ({ onBack, profile = {}, onSaveProfile, isDarkMode = true }) => {
  const T = getTheme(isDarkMode);
  const [name, setName] = useState(profile.name || "");
  const [title, setTitle] = useState(profile.title || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [location, setLocation] = useState(profile.location || "");

  const fade = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSave = () => {
    if (typeof onSaveProfile === 'function') {
      onSaveProfile({ ...profile, name, title, bio, location });
      Alert.alert("Success", "Profile updated successfully!");
      if (onBack) onBack();
    }
  };

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      <View style={S.header}>
        <Pressable style={[S.iconBtn, { backgroundColor: T.surface, borderColor: T.border }]} onPress={onBack}>
          <Text style={[S.iconBtnText, { color: T.text }]}>←</Text>
        </Pressable>
        <Text style={[S.pageTitle, { color: T.text }]}>Edit Profile</Text>
        <Pressable style={[S.saveBtnHeader, { backgroundColor: T.accent }]} onPress={handleSave}>
          <Text style={S.saveTextHeader}>Save</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], gap: 16 }}>
          
          <View style={S.fieldGroup}>
            <Text style={[S.label, { color: T.muted }]}>FULL NAME</Text>
            <TextInput
              style={[S.input, { color: T.text, backgroundColor: T.surface, borderColor: T.border }]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Ayyappa"
              placeholderTextColor={T.muted}
            />
          </View>

          <View style={S.fieldGroup}>
            <Text style={[S.label, { color: T.muted }]}>PROFESSIONAL TITLE</Text>
            <TextInput
              style={[S.input, { color: T.text, backgroundColor: T.surface, borderColor: T.border }]}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Senior AI Engineer"
              placeholderTextColor={T.muted}
            />
          </View>

          <View style={S.fieldGroup}>
            <Text style={[S.label, { color: T.muted }]}>LOCATION</Text>
            <TextInput
              style={[S.input, { color: T.text, backgroundColor: T.surface, borderColor: T.border }]}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Remote / San Francisco"
              placeholderTextColor={T.muted}
            />
          </View>

          <View style={S.fieldGroup}>
            <Text style={[S.label, { color: T.muted }]}>BIO</Text>
            <TextInput
              style={[S.input, S.textArea, { color: T.text, backgroundColor: T.surface, borderColor: T.border }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={T.muted}
              multiline
            />
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
  saveBtnHeader: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  saveTextHeader: { color: "#fff", fontWeight: "700", fontSize: 14 },

  content: { paddingHorizontal: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },
  fieldGroup: { gap: 8 },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginLeft: 4 },
  input: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1, fontSize: 15 },
  textArea: { height: 120, textAlignVertical: "top" },
});

export default ProfileEditScreen;
