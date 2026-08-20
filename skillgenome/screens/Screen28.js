import * as React from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { Color, StyleVariable, Padding, Border } from "../GlobalStyles";
import { getTheme } from "../utils/theme";

const Radio = ({ label, selected, onPress, isDarkMode = true, styles }) => (
  <TouchableOpacity style={styles.radioRow} onPress={onPress}>
    <View
      style={[
        styles.radioOuter,
        selected && styles.radioOuterSelected,
        { borderColor: isDarkMode ? "rgba(255,255,255,0.18)" : "#cbd5e1" },
      ]}
    >
      {selected && <View style={styles.radioInner} />}
    </View>
    <Text style={[styles.radioLabel, { color: isDarkMode ? "#ffffff" : "#0f172a" }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const AttachChip = ({ icon, label, active, onPress, isDarkMode, styles }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.attachChip,
      {
        backgroundColor: active
          ? isDarkMode
            ? "rgba(0,212,255,0.15)"
            : "rgba(0,130,200,0.10)"
          : isDarkMode
          ? "rgba(255,255,255,0.05)"
          : "#f1f5f9",
        borderColor: active
          ? Color.colorCyan50 || "#00d4ff"
          : isDarkMode
          ? "rgba(255,255,255,0.10)"
          : "#cbd5e1",
      },
    ]}
  >
    <Text
      style={[
        styles.attachChipLabel,
        {
          color: active
            ? Color.colorCyan50 || "#00d4ff"
            : isDarkMode
            ? "rgba(255,255,255,0.75)"
            : "#475569",
        },
      ]}
    >
      {icon}  {label}
    </Text>
  </TouchableOpacity>
);

const Screen28 = ({ onBack, onPost, isDarkMode = true, language = "English" }) => {
  const T = getTheme(isDarkMode);
  const styles = React.useMemo(() => getStyles(T), [T]);

  const [text, setText] = React.useState("");
  const [skillsText, setSkillsText] = React.useState("");
  const [visibility, setVisibility] = React.useState("public");
  const [bold, setBold] = React.useState(false);
  const [italic, setItalic] = React.useState(false);
  const [underline, setUnderline] = React.useState(false);
  const [images, setImages] = React.useState([]);
  const [video, setVideo] = React.useState(null);
  const [docFile, setDocFile] = React.useState(null);
  const [picking, setPicking] = React.useState(false);

  const bg = isDarkMode ? Color.colorBlue8 || "#060612" : "#f8fafc";
  const card = isDarkMode ? Color.colorBlue15 || "#1a1f30" : "#ffffff";
  const border = isDarkMode ? "rgba(255,255,255,0.08)" : "#cbd5e1";
  const tp = isDarkMode ? "#ffffff" : "#0f172a";
  const ts = isDarkMode ? "rgba(255,255,255,0.45)" : "#64748b";
  const accent = Color.colorCyan50 || "#00d4ff";

  // Convert a URI (blob or file) to a persistent base64 data URI
  const toBase64 = async (uri, mimeType) => {
    try {
      if (Platform.OS === 'web' || uri.startsWith('blob:') || uri.startsWith('http')) {
        const response = await fetch(uri);
        const blob = await response.blob();
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        let mime = mimeType || "application/octet-stream";
        if (!mimeType) {
          if (uri.endsWith(".png")) mime = "image/png";
          else if (uri.endsWith(".jpg") || uri.endsWith(".jpeg")) mime = "image/jpeg";
          else if (uri.endsWith(".mp4")) mime = "video/mp4";
          else if (uri.endsWith(".pdf")) mime = "application/pdf";
        }
        return `data:${mime};base64,${base64}`;
      }
    } catch (e) {
      return uri; // fallback: return original if conversion fails
    }
  };

  const pickImages = async () => {
    try {
      setPicking(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Allow access to your photo library.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.75,
        selectionLimit: 4,
        base64: true, // request base64 directly when available
      });
      if (!result.canceled && result.assets) {
        const converted = await Promise.all(
          result.assets.map(async (a) => {
            // Use base64 directly if provided by expo-image-picker
            if (a.base64) {
              const mime = a.mimeType || "image/jpeg";
              return { uri: `data:${mime};base64,${a.base64}` };
            }
            // Otherwise convert the blob/file URI
            const dataUri = await toBase64(a.uri, a.mimeType);
            return { uri: dataUri };
          })
        );
        setImages((prev) => [...prev, ...converted].slice(0, 4));
        setVideo(null);
      }
    } catch (e) {
      Alert.alert("Error", "Could not open photo library.");
    } finally {
      setPicking(false);
    }
  };

  const pickVideo = async () => {
    try {
      setPicking(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Allow access to your media library.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.75,
        base64: false, // videos are too large for base64
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const a = result.assets[0];
        // Convert blob URI to persistent base64 data URI for web compatibility
        let persistentUri = a.uri;
        if (a.uri && a.uri.startsWith('blob:')) {
          try {
            persistentUri = await toBase64(a.uri);
          } catch (_) { persistentUri = a.uri; }
        }
        setVideo({ uri: persistentUri, name: a.fileName || "video.mp4", mimeType: a.mimeType || "video/mp4" });
        setImages([]);
      }
    } catch (e) {
      Alert.alert("Error", "Could not open video library.");
    } finally {
      setPicking(false);
    }
  };

  const pickDocument = async () => {
    try {
      setPicking(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "text/plain",
        ],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const a = result.assets[0];
        // Convert blob URI to persistent base64 data URI for web compatibility
        let persistentUri = a.uri;
        if (a.uri && a.uri.startsWith('blob:')) {
          try {
            persistentUri = await toBase64(a.uri);
          } catch (_) { persistentUri = a.uri; }
        }
        setDocFile({ uri: persistentUri, name: a.name, mimeType: a.mimeType });
      }
    } catch (e) {
      Alert.alert("Error", "Could not open document picker.");
    } finally {
      setPicking(false);
    }
  };

  const submitPost = () => {
    if (!text.trim()) return;
    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (typeof onPost === "function") {
      onPost({
        content: text,
        skills,
        visibility,
        images: images.map((i) => i.uri),
        video: video ? video.uri : null,
        document: docFile ? { uri: docFile.uri, name: docFile.name } : null,
      });
    }
    if (typeof onBack === "function") onBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: bg, borderBottomColor: border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => typeof onBack === "function" && onBack()}
        >
          <Text style={[styles.backTxt, { color: tp }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: tp }]}>CREATE POST</Text>
        <TouchableOpacity
          style={[styles.postBtn, !text.trim() && styles.postBtnDisabled]}
          disabled={!text.trim()}
          onPress={submitPost}
        >
          <Text style={styles.postBtnTxt}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.heading, { color: tp }]}>What do you want to share?</Text>

        {/* Formatting bar */}
        <View style={[styles.toolbar, { backgroundColor: card, borderColor: border }]}>
          <TouchableOpacity
            onPress={() => setBold(!bold)}
            style={[styles.toolBtn, bold && { backgroundColor: "rgba(0,212,255,0.15)" }]}
          >
            <Text style={[styles.toolTxt, { color: bold ? accent : tp, fontWeight: "900" }]}>B</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setItalic(!italic)}
            style={[styles.toolBtn, italic && { backgroundColor: "rgba(0,212,255,0.15)" }]}
          >
            <Text style={[styles.toolTxt, { color: italic ? accent : tp, fontStyle: "italic" }]}>I</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setUnderline(!underline)}
            style={[styles.toolBtn, underline && { backgroundColor: "rgba(0,212,255,0.15)" }]}
          >
            <Text
              style={[styles.toolTxt, { color: underline ? accent : tp, textDecorationLine: "underline" }]}
            >
              U
            </Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: border }]} />
          <TouchableOpacity style={styles.toolBtn}>
            <Text style={[styles.toolTxt, { color: ts }]}>Link</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn}>
            <Text style={[styles.toolTxt, { color: ts }]}>{"</>"}</Text>
          </TouchableOpacity>
        </View>

        {/* Text area */}
        <TextInput
          style={[
            styles.textArea,
            { color: tp, backgroundColor: card, borderColor: border },
            bold && { fontWeight: "700" },
            italic && { fontStyle: "italic" },
            underline && { textDecorationLine: "underline" },
          ]}
          multiline
          numberOfLines={6}
          placeholder="Share an insight, achievement, or resource..."
          placeholderTextColor={ts}
          value={text}
          onChangeText={setText}
          selectionColor={accent}
        />

        {/* Attach buttons */}
        <Text style={[styles.sectionLabel, { color: tp }]}>Add to post</Text>
        <View style={styles.attachRow}>
          <AttachChip
            icon="🖼️"
            label="Image"
            active={images.length > 0}
            onPress={pickImages}
            isDarkMode={isDarkMode}
          />
           styles={styles}
          />
           styles={styles}
          />
        </View>

        {picking && (
          <View style={styles.pickRow}>
            <ActivityIndicator color={accent} size="small" />
            <Text style={[styles.pickTxt, { color: ts }]}>  Opening picker...</Text>
          </View>
        )}

        {/* Image previews */}
        {images.length > 0 && (
          <View style={styles.imgSection}>
            <View style={styles.imgHeader}>
              <Text style={[styles.imgLabel, { color: tp }]}>
                {images.length} image{images.length > 1 ? "s" : ""} selected
              </Text>
              <TouchableOpacity onPress={() => setImages([])}>
                <Text style={styles.removeAll}>Remove all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((img, i) => (
                <View key={i} style={styles.thumbWrap}>
                  <Image source={{ uri: img.uri }} style={styles.thumb} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.removeThumb}
                    onPress={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    <Text style={styles.removeThumbTxt}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 4 && (
                <TouchableOpacity
                  style={[styles.addMore, { borderColor: border, backgroundColor: card }]}
                  onPress={pickImages}
                >
                  <Text style={[styles.addMoreTxt, { color: ts }]}>+ More</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}

        {/* Video preview */}
        {video && (
          <View style={[styles.mediaRow, { backgroundColor: card, borderColor: border }]}>
            <Text style={[styles.mediaIcon, { color: "#818cf8" }]}>🎬</Text>
            <View style={styles.mediaInfo}>
              <Text style={[styles.mediaName, { color: tp }]} numberOfLines={1}>
                {video.name}
              </Text>
              <Text style={[styles.mediaType, { color: ts }]}>Video selected</Text>
            </View>
            <TouchableOpacity
              onPress={() => setVideo(null)}
              style={[styles.mediaRemove, { backgroundColor: "rgba(239,68,68,0.15)" }]}
            >
              <Text style={{ color: "#ef4444", fontWeight: "800", fontSize: 12 }}>X</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Document preview */}
        {docFile && (
          <View style={[styles.mediaRow, { backgroundColor: card, borderColor: border }]}>
            <Text style={[styles.mediaIcon, { color: "#facc15" }]}>📄</Text>
            <View style={styles.mediaInfo}>
              <Text style={[styles.mediaName, { color: tp }]} numberOfLines={1}>
                {docFile.name}
              </Text>
              <Text style={[styles.mediaType, { color: ts }]}>
                {docFile.mimeType && docFile.mimeType.includes("pdf")
                  ? "PDF Document"
                  : docFile.mimeType && docFile.mimeType.includes("word")
                  ? "Word Document"
                  : docFile.mimeType && docFile.mimeType.includes("presentation")
                  ? "Presentation"
                  : "Document"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setDocFile(null)}
              style={[styles.mediaRemove, { backgroundColor: "rgba(239,68,68,0.15)" }]}
            >
              <Text style={{ color: "#ef4444", fontWeight: "800", fontSize: 12 }}>X</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Skill tags */}
        <Text style={[styles.sectionLabel, { color: tp }]}>Skill tags</Text>
        <TextInput
          style={[styles.tagsInput, { color: tp, backgroundColor: card, borderColor: border }]}
          placeholder="e.g. Python, React, Machine Learning"
          placeholderTextColor={ts}
          value={skillsText}
          onChangeText={setSkillsText}
        />

        {/* Visibility */}
        <Text style={[styles.sectionLabel, { color: tp }]}>Who can see this?</Text>
        <View style={[styles.visBox, { backgroundColor: card, borderColor: border }]}>
          <Radio
            label="Public - anyone can see this"
            selected={visibility === "public"}
            onPress={() => setVisibility("public")}
            isDarkMode={isDarkMode}
          />
          <Radio
            label="Connections only"
            selected={visibility === "connections"}
            onPress={() => setVisibility("connections")}
            isDarkMode={isDarkMode}
          />
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 84,
    paddingHorizontal: 16,
    paddingTop: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  backBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  backTxt: { fontSize: 15, fontWeight: "700" },
  title: { fontSize: 14, fontWeight: "800", letterSpacing: 0.8 },
  postBtn: {
    backgroundColor: Color.colorCyan50 || "#00d4ff",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  postBtnDisabled: { opacity: 0.38 },
  postBtnTxt: { color: "#060612", fontWeight: "800", fontSize: 13 },

  content: { padding: 20 },
  heading: { fontSize: 18, fontWeight: "700", marginBottom: 14 },

  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginBottom: 10,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    flexWrap: "wrap",
  },
  divider: { width: 1, height: 18, marginHorizontal: 4 },
  toolBtn: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8 },
  toolTxt: { fontSize: 13 },

  textArea: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    textAlignVertical: "top",
    minHeight: 140,
    marginBottom: 20,
    fontSize: 15,
    lineHeight: 22,
  },

  sectionLabel: { fontSize: 13, fontWeight: "700", marginBottom: 8, marginTop: 4 },

  attachRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  attachChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  attachChipLabel: { fontSize: 12, fontWeight: "700" },

  pickRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  pickTxt: { fontSize: 12 },

  imgSection: { marginBottom: 16 },
  imgHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  imgLabel: { fontSize: 12, fontWeight: "600" },
  removeAll: { color: "#ef4444", fontSize: 12, fontWeight: "600" },
  thumbWrap: { marginRight: 8, position: "relative" },
  thumb: { width: 90, height: 90, borderRadius: 10 },
  removeThumb: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 99,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  removeThumbTxt: { color: "#fff", fontSize: 9, fontWeight: "800" },
  addMore: {
    width: 90,
    height: 90,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addMoreTxt: { fontSize: 11, textAlign: "center" },

  mediaRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 10,
  },
  mediaIcon: { fontSize: 14, fontWeight: "800" },
  mediaInfo: { flex: 1 },
  mediaName: { fontSize: 13, fontWeight: "600" },
  mediaType: { fontSize: 11, marginTop: 2 },
  mediaRemove: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  tagsInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
  },

  visBox: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 10 },
  radioRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioOuterSelected: { borderColor: Color.colorCyan50 || "#00d4ff" },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Color.colorCyan50 || "#00d4ff",
  },
  radioLabel: { fontSize: 13 },
});

export default Screen28;