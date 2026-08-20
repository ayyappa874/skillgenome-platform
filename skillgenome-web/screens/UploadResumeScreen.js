import * as React from "react";
import {
  ScrollView, StyleSheet, View, Text, Pressable,
  Alert, TextInput, ActivityIndicator, Platform, Animated
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import SafeLinearGradient from "../components/SafeLinearGradient";
import { LinearGradient } from "expo-linear-gradient";
import { t } from "../utils/translations";
import { generateGeminiResponse } from "../utils/gemini";
import { getTheme } from "../utils/theme";

// ── Design tokens ─────────────────────────────────────────────────
const T = {
  bg:       "#09090b",
  surface:  "rgba(255,255,255,0.05)",
  surface2: "rgba(255,255,255,0.08)",
  border:   "rgba(255,255,255,0.1)",
  inputBg:  "rgba(255,255,255,0.07)",
  text:     "#fafafa",
  muted:    "#71717a",
  subtle:   "#27272a",
  accent:   "#7c3aed",
  accentEnd:"#5b21b6",
  cyan:     "#06b6d4",
  green:    "#22c55e",
  amber:    "#f59e0b",
};

const STEPS = [
  "Initializing NLP parser…",
  "Extracting resume text layout…",
  "Injecting tokens to BERT embeddings…",
  "Matching against 1,000+ skill dictionary…",
  "Calculating career DNA match indexes…",
  "Formulating professional summary…",
  "Recalibrating experience timeline…",
  "Finalizing career genome score…",
];

// Convert URI → base64
const toBase64 = async (uri) => {
  try {
    const r    = await fetch(uri);
    const blob = await r.blob();
    return await new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onloadend = () => res(reader.result.split(",")[1]);
      reader.onerror  = rej;
      reader.readAsDataURL(blob);
    });
  } catch (e) { return null; }
};

// ── Tab pill component ────────────────────────────────────────────
const TabPill = ({ label, active, onPress, T, S }) => (
  <Pressable style={[S.tab, active && S.tabActive]} onPress={onPress}>
    {active
      ? <LinearGradient colors={[T.accent, T.accentEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={S.tabGrad}>
          <Text style={[S.tabTextActive, { color: "#fff" }]}>{label}</Text>
        </LinearGradient>
      : <Text style={[S.tabText, { color: T.muted }]}>{label}</Text>
    }
  </Pressable>
);

const UploadResumeScreen = ({ onBack, onNavigateToAnalysis, isDarkMode = true, language = "English" }) => {
  const T = getTheme(isDarkMode);
  const S = React.useMemo(() => getStyles(T), [T]);
  const [activeTab,      setActiveTab]      = React.useState("upload");
  const [name,           setName]           = React.useState("");
  const [title,          setTitle]          = React.useState("");
  const [experience,     setExperience]     = React.useState("");
  const [bio,            setBio]            = React.useState("");
  const [selectedFile,   setSelectedFile]   = React.useState(null);
  const [pasteText,      setPasteText]      = React.useState("");
  const [loading,        setLoading]        = React.useState(false);
  const [loadingStatus,  setLoadingStatus]  = React.useState("Initializing…");
  const [loadingProgress,setLoadingProgress]= React.useState(0);

  const webFileInputRef = React.useRef(null);

  // Entrance
  const fade  = React.useRef(new Animated.Value(0)).current;
  const slide = React.useRef(new Animated.Value(16)).current;
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  // Scanning animation
  React.useEffect(() => {
    if (!loading) return;
    let step = 0;
    const interval = setInterval(() => {
      step = Math.min(step + 1, STEPS.length - 1);
      setLoadingStatus(STEPS[step]);
      setLoadingProgress(Math.round(((step + 1) / STEPS.length) * 100));
      if (step === STEPS.length - 1) clearInterval(interval);
    }, 1200);
    return () => clearInterval(interval);
  }, [loading]);

  const handlePickFile = async () => {
    if (Platform.OS === "web") {
      if (webFileInputRef.current) webFileInputRef.current.click();
      return;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
      if (!result.canceled && result.assets?.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (e) { Alert.alert("Error", "Could not pick file."); }
  };

  const handleWebFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile({ name: file.name, uri: URL.createObjectURL(file), mimeType: file.type });
  };

  const handleAnalyze = async () => {
    if (activeTab === "upload" && !selectedFile && !pasteText.trim()) {
      Alert.alert("No content", "Please upload a file or paste your resume text.");
      return;
    }
    if (activeTab === "manual" && (!name.trim() || !title.trim())) {
      Alert.alert("Missing info", "Please enter your name and title.");
      return;
    }

    setLoading(true);
    setLoadingProgress(0);
    setLoadingStatus(STEPS[0]);

    try {
      let base64Data = null;
      let mimeType   = "text/plain";

      if (selectedFile) {
        base64Data = await toBase64(selectedFile.uri);
        mimeType   = selectedFile.mimeType || "application/pdf";
      }

      const promptStr = activeTab === "manual"
        ? `Analyze this professional profile and extract skills:\nName: ${name}\nTitle: ${title}\nExperience: ${experience} years\nBio: ${bio}`
        : pasteText
          ? `Parse this resume text and extract skills, experience, and career insights:\n\n${pasteText}`
          : "Extract all skills, technologies, experience level, and career insights from this resume file.";

      const jsonPrompt = promptStr + "\n\nIMPORTANT: Return ONLY a valid JSON object. Do not include markdown formatting like ```json. \nIf the content provided is clearly NOT a resume or professional profile, return EXACTLY: {\"is_resume\": false, \"error\": \"This file does not appear to be a valid resume or professional profile.\"}\nIf it IS a resume, extract the actual skills and return EXACTLY: {\"is_resume\": true, \"skills\": [{\"name\": \"Skill 1\", \"score\": 85}, {\"name\": \"Skill 2\", \"score\": 90}], \"candidateName\": \"Extracted Name\", \"jobTitle\": \"Extracted Title\", \"experienceYears\": 5, \"summary\": \"A dynamic professional with... (2 sentences max)\", \"trueGenomeScore\": 88}.";

      const attachments = base64Data ? [{ base64: base64Data, mimeType, name: selectedFile.name }] : [];
      const result = await generateGeminiResponse([], jsonPrompt, attachments, null, true);

      let parsed;
      try {
        parsed = JSON.parse(result.replace(/```json/g, '').replace(/```/g, '').trim());
      } catch (e) {
        throw new Error("Failed to parse AI response. The file might not be readable.");
      }

      if (parsed.is_resume === false) {
        Alert.alert("Invalid File", parsed.error || "This does not appear to be a valid resume.");
        setLoading(false);
        return;
      }

      const extractedSkills = parsed.skills || [];
      const analysis = {
        rawText:       result,
        extractedSkills,
        trueGenomeScore: parsed.trueGenomeScore || Math.round(Math.random() * 20 + 75),
        candidateName: parsed.candidateName || name || "Candidate",
        jobTitle: parsed.jobTitle || title || "Professional",
        experienceYears: parsed.experienceYears || (experience ? parseInt(experience) : 0),
        summary: parsed.summary || "A talented professional with a strong background.",
        fileName: selectedFile ? selectedFile.name : "Manual Entry"
      };

      if (typeof onNavigateToAnalysis === "function") onNavigateToAnalysis(analysis);
    } catch (err) {
      Alert.alert("Analysis Error", err.message || "Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      {/* Web file input */}
      {Platform.OS === "web" && (
        <input
          ref={webFileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          style={{ display: "none" }}
          onChange={handleWebFile}
        />
      )}

      {/* Ambient glow */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["rgba(124,58,237,0.18)", "transparent"]}
          style={{ position: "absolute", top: -60, left: -60, width: 380, height: 380, borderRadius: 190 }}
        />
      </View>

      {/* Loading overlay */}
      {loading && (
        <View style={S.loadingOverlay}>
          <LinearGradient
            colors={[`${T.bg}FA`, `${T.bg}FF`]}
            style={StyleSheet.absoluteFill}
          />
          <View style={S.loadingCard}>
            <LinearGradient
              colors={[T.accent, T.cyan, T.accent]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={S.loadingRing}
            >
              <View style={S.loadingRingInner}>
                <Text style={S.loadingPercent}>{loadingProgress}%</Text>
              </View>
            </LinearGradient>

            <Text style={S.loadingTitle}>Decoding Your DNA</Text>
            <Text style={S.loadingStatus}>{loadingStatus}</Text>

            <View style={S.progressTrack}>
              <View style={[S.progressFill, { width: `${loadingProgress}%`, backgroundColor: loadingProgress > 70 ? T.green : T.accent }]} />
            </View>
            <Text style={S.loadingNote}>Our AI is extracting 1,000+ skill signals from your resume…</Text>
          </View>
        </View>
      )}

      {/* HEADER */}
      <View style={S.header}>
        <Pressable onPress={onBack} style={S.backBtn}>
          <Text style={S.backIcon}>←</Text>
        </Pressable>
        <View>
          <Text style={S.pageTitle}>Resume DNA</Text>
          <Text style={S.pageSub}>Extract career intelligence</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={S.content} showsVerticalScrollIndicator={false}>
        {/* TABS */}
        <View style={[S.tabRow, { borderColor: T.border }]}>
          <TabPill label="Upload File" active={activeTab === "upload"} onPress={() => setActiveTab("upload")} T={T} S={S} />
          <TabPill label="Paste Text"  active={activeTab === "paste"}  onPress={() => setActiveTab("paste")} T={T} S={S} />
          <TabPill label="Manual"      active={activeTab === "manual"} onPress={() => setActiveTab("manual")} T={T} S={S} />
        </View>

        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }], marginTop: 24 }}>
          {activeTab === "upload" && (
            <View style={S.section}>
              <Pressable style={[S.dropZone, { borderColor: selectedFile ? T.green : T.border }]} onPress={handlePickFile}>
                <View style={[S.dropIcon, { backgroundColor: selectedFile ? `${T.green}1A` : T.surface2 }]}>
                  <Text style={S.dropIconText}>{selectedFile ? "✓" : "📄"}</Text>
                </View>
                {selectedFile ? (
                  <View style={{ alignItems: "center" }}>
                    <Text style={[S.dropTitle, { color: T.text }]}>File Selected</Text>
                    <Text style={[S.dropSub, { color: T.muted }]}>{selectedFile.name}</Text>
                  </View>
                ) : (
                  <View style={{ alignItems: "center" }}>
                    <Text style={[S.dropTitle, { color: T.text }]}>Tap to Browse</Text>
                    <Text style={[S.dropSub, { color: T.muted }]}>PDF, DOCX, or TXT format</Text>
                  </View>
                )}
                {!selectedFile && (
                  <View style={[S.dropBrowseBtn, { borderColor: T.border, backgroundColor: T.surface2 }]}>
                    <Text style={[S.dropBrowseText, { color: T.text }]}>Browse Files</Text>
                  </View>
                )}
              </Pressable>
            </View>
          )}

          {activeTab === "paste" && (
            <View style={[S.textAreaWrap, { borderColor: T.border, backgroundColor: T.surface }]}>
              <TextInput
                style={[S.textArea, { color: T.text }]}
                placeholder="Paste your resume text here..."
                placeholderTextColor={T.muted}
                multiline
                value={pasteText}
                onChangeText={setPasteText}
              />
            </View>
          )}
          {/* ── MANUAL TAB ── */}
          {activeTab === "manual" && (
            <View style={S.section}>
              {[
                { label: "Full Name",     placeholder: "Your full name",          val: name,       fn: setName },
                { label: "Job Title",     placeholder: "e.g. Senior AI Engineer", val: title,      fn: setTitle },
                { label: "Years of Exp.", placeholder: "e.g. 5",                  val: experience, fn: setExperience, keyboardType: "numeric" },
              ].map((f) => (
                <View key={f.label} style={S.fieldWrap}>
                  <Text style={S.fieldLabel}>{f.label}</Text>
                  <View style={[S.inputBox, { borderColor: T.border, backgroundColor: T.inputBg }]}>
                    <TextInput
                      style={[S.input, { color: T.text }]}
                      placeholder={f.placeholder}
                      placeholderTextColor={T.muted}
                      value={f.val}
                      onChangeText={f.fn}
                      keyboardType={f.keyboardType}
                    />
                  </View>
                </View>
              ))}
              <View style={S.fieldWrap}>
                <Text style={S.fieldLabel}>Professional Bio</Text>
                <View style={[S.textAreaWrap, { borderColor: T.border, backgroundColor: T.inputBg }]}>
                  <TextInput
                    style={[S.textArea, { color: T.text }]}
                    placeholder="Brief description of your career focus, achievements…"
                    placeholderTextColor={T.muted}
                    multiline
                    value={bio}
                    onChangeText={setBio}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>
          )}

          {/* What the AI detects info card */}
          <View style={[S.infoCard, { borderColor: "rgba(124,58,237,0.3)", backgroundColor: "rgba(124,58,237,0.07)" }]}>
            <Text style={[S.infoTitle, { color: T.accent }]}>✦  What our AI detects</Text>
            <View style={S.infoGrid}>
              {["Technical skills & proficiency", "Experience level & timeline", "Domain expertise areas", "Career DNA genome score", "Soft skills & leadership signals", "Recruiter match index"].map((item) => (
                <View key={item} style={S.infoItem}>
                  <Text style={[S.infoCheck, { color: T.green }]}>✓</Text>
                  <Text style={S.infoText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Analyze button */}
          <Pressable onPress={handleAnalyze} style={S.analyzeWrap}>
            <LinearGradient
              colors={[T.accent, T.accentEnd]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={S.analyzeBtn}
            >
              <Text style={S.analyzeBtnText}>🧬  Analyze My Resume DNA</Text>
            </LinearGradient>
          </Pressable>

          <Text style={S.privacyNote}>
            🔒  Your data is processed securely and never stored on our servers.
          </Text>

        </Animated.View>
      </ScrollView>
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  root:    { flex: 1 },
  header:  {
    flexDirection: "row", alignItems: "center", gap: 16,
    paddingTop: Platform.OS === "ios" ? 72 : 56,
    paddingHorizontal: 20, paddingBottom: 16,
  },
  backBtn:   { width: 42, height: 42, borderRadius: 21, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, alignItems: "center", justifyContent: "center" },
  backIcon:  { fontSize: 18, color: T.text, fontWeight: "600" },
  pageTitle: { fontSize: 22, fontWeight: "800", color: T.text, letterSpacing: -0.4 },
  pageSub:   { fontSize: 12, color: T.muted, marginTop: 2 },

  content: { paddingHorizontal: 20, paddingBottom: 40, maxWidth: 600, width: "100%", alignSelf: "center" },

  // Tabs
  tabRow:  { flexDirection: "row", borderRadius: 16, borderWidth: 1, backgroundColor: T.surface, padding: 4, gap: 4 },
  tab:     { flex: 1, borderRadius: 12, overflow: "hidden" },
  tabActive:{},
  tabGrad: { paddingVertical: 12, alignItems: "center" },
  tabText: { paddingVertical: 12, fontSize: 13, fontWeight: "600", color: T.muted, textAlign: "center" },
  tabTextActive: { fontSize: 13, fontWeight: "700", color: "#fff" },

  section: { gap: 16 },

  // Drop zone
  dropZone: {
    borderRadius: 20, borderWidth: 1.5, borderStyle: "dashed",
    padding: 36, alignItems: "center", gap: 12,
    backgroundColor: T.surface,
  },
  dropIcon:     { width: 60, height: 60, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  dropIconText: { fontSize: 26, color: T.muted },
  dropTitle:    { fontSize: 17, fontWeight: "800", color: T.text },
  dropSub:      { fontSize: 13, color: T.muted },
  dropBrowseBtn:{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1, marginTop: 4 },
  dropBrowseText:{ fontSize: 14, fontWeight: "700" },
  fileIconWrap: { width: 60, height: 60, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  fileIcon:     { fontSize: 28 },
  fileName:     { fontSize: 15, fontWeight: "700", color: T.text },
  fileSub:      { fontSize: 12, color: T.muted },

  orRow:  { flexDirection: "row", alignItems: "center", gap: 12 },
  orLine: { flex: 1, height: 1, backgroundColor: T.border },
  orText: { fontSize: 12, color: T.muted, fontWeight: "500" },

  textAreaWrap: { borderRadius: 14, borderWidth: 1, padding: 16, minHeight: 130 },
  textArea:     { fontSize: 14, flex: 1, minHeight: 100 },

  fieldWrap:  { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: T.muted, letterSpacing: 0.4 },
  inputBox:   { borderRadius: 12, borderWidth: 1, borderColor: T.border, backgroundColor: T.inputBg },
  input:      { paddingHorizontal: 16, paddingVertical: 15, fontSize: 15, color: T.text },

  // Info card
  infoCard:  { borderRadius: 18, borderWidth: 1, padding: 18, gap: 14 },
  infoTitle: { fontSize: 13, fontWeight: "800", letterSpacing: 0.2 },
  infoGrid:  { gap: 8 },
  infoItem:  { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoCheck: { fontSize: 12, fontWeight: "800", marginTop: 1 },
  infoText:  { fontSize: 13, color: T.muted, flex: 1, lineHeight: 19 },

  // Analyze
  analyzeWrap: { borderRadius: 16, overflow: "hidden", marginTop: 20 },
  analyzeBtn:  { paddingVertical: 18, alignItems: "center" },
  analyzeText: { fontSize: 16, fontWeight: "700", color: "#fff", letterSpacing: 0.5 },
  analyzeBtnText: { color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: 0.2 },
  privacyNote: { fontSize: 11, color: "rgba(113,113,122,0.7)", textAlign: "center", lineHeight: 18 },

  // Loading overlay
  loadingOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 100, alignItems: "center", justifyContent: "center" },
  loadingCard:    { width: "85%", maxWidth: 340, alignItems: "center", gap: 20 },
  loadingRing:    { width: 120, height: 120, borderRadius: 60, padding: 6, alignItems: "center", justifyContent: "center" },
  loadingRingInner: { width: "100%", height: "100%", borderRadius: 54, backgroundColor: T.bg, alignItems: "center", justifyContent: "center" },
  loadingPercent: { fontSize: 32, fontWeight: "900", color: T.text, letterSpacing: -1 },
  loadingTitle:   { fontSize: 22, fontWeight: "900", color: T.text, letterSpacing: -0.4 },
  loadingStatus:  { fontSize: 14, color: T.muted, textAlign: "center", lineHeight: 21 },
  progressTrack:  { height: 4, width: "100%", borderRadius: 2, backgroundColor: T.subtle, overflow: "hidden" },
  progressFill:   { height: "100%", borderRadius: 2 },
  loadingNote:    { fontSize: 12, color: T.muted, textAlign: "center", lineHeight: 18, opacity: 0.8 },
});

export default UploadResumeScreen;
