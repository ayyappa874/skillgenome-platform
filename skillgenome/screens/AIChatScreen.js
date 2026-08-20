import * as React from "react";
import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Image,
  Alert,
  Share
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Color, FontFamily, Border, Padding } from "../GlobalStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { generateGeminiResponse, transcribeAudio } from '../utils/gemini';
import { supabase } from '../utils/supabase';
import { getTheme } from "../utils/theme";


const AIChatScreen = ({ onBack, onOpenLibrary, profile = {}, resumeAnalysis, thoughtAnalysis, emotionAnalysis, getApiUrl, isDarkMode = true, language = 'English' }) => {
  const T = getTheme(isDarkMode);
  const styles = React.useMemo(() => getStyles(T), [T]);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // New session states
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [chatLoaded, setChatLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [renameState, setRenameState] = useState({ visible: false, id: null, title: "" });

  const scrollViewRef = useRef(null);

  // ── Premium design tokens (consistent with app-wide design system) ──
  const bgStyle       = isDarkMode ? "#09090b" : '#f5f7ff';
  const cardBg        = isDarkMode ? "rgba(255,255,255,0.05)" : '#ffffff';
  const borderStyle   = isDarkMode ? "rgba(255,255,255,0.1)"  : '#e2e8f0';
  const borderLightStyle = isDarkMode ? "rgba(255,255,255,0.06)" : '#f1f5f9';
  const textPrimary   = isDarkMode ? '#fafafa'  : '#0d1117';
  const textSecondary = isDarkMode ? '#71717a'  : '#5a6478';
  const shortcutBg    = isDarkMode ? "rgba(255,255,255,0.04)" : '#ffffff';
  const inputBgColor  = isDarkMode ? "rgba(255,255,255,0.07)" : '#ffffff';
  const keyDrawerBg   = isDarkMode ? "rgba(255,255,255,0.04)" : '#f1f5f9';


  const welcomeMessage = {
    id: "welcome",
    sender: "ai",
    text: `### 🚀 Welcome to your SkillGenome AI Mentor!\n\nHello **${profile.name || "Ayyappa"}**! I am your interactive AI Career Mentorship Coach. \n\nI can analyze your coding practices (Python, React Native, SQL), optimize your Resume DNA, suggest strategies to raise your facial/speech EQ score, or evaluate your BERT cognitive adaptability patterns!\n\n**What professional milestone are we mapping out today?**`,
    timestamp: new Date()
  };

  const STORAGE_KEY = `ai_chat_sessions_${profile.id || profile.uid || 'default'}`;

  useEffect(() => {
    const loadSessions = async () => {
      try {
        let loadedSessions = [];
        
        // 1. Try Supabase First
        if (profile.id || profile.uid) {
          const uid = profile.id || profile.uid;
          try {
            const { data, error } = await supabase
              .from('ai_chat_sessions')
              .select('session_data')
              .eq('user_id', uid)
              .order('updated_at', { ascending: false })
              .limit(1);
              
            if (!error && data && data.length > 0 && data[0].session_data) {
              loadedSessions = typeof data[0].session_data === 'string' 
                ? JSON.parse(data[0].session_data) 
                : data[0].session_data;
                
              // Sync back down to local storage to keep them aligned
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loadedSessions));
            }
          } catch(dbErr) {
            console.log("Could not load from DB:", dbErr);
          }
        }

        // 2. Fallback to Local Storage
        if (loadedSessions.length === 0) {
          const stored = await AsyncStorage.getItem(STORAGE_KEY);
          if (stored) {
            loadedSessions = JSON.parse(stored);
          }
        }

        if (loadedSessions.length > 0) {
          setChatSessions(loadedSessions);
          const mostRecent = loadedSessions[0];
          setActiveSessionId(mostRecent.id);
          setMessages(mostRecent.messages);
          setChatLoaded(true);
          return;
        }

        // Create initial session if none exists
        createNewSession();
      } catch (e) {
        console.warn("Error loading chat history:", e);
        createNewSession();
      }
    };
    loadSessions();
  }, [profile.uid, profile.id]);

  const saveSessions = async (newSessions) => {
    try {
      setChatSessions(newSessions);
      // 1. Save locally for instant access
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
      
      // 2. Sync to Supabase for cross-device persistence
      if (profile.id || profile.uid) {
        const uid = profile.id || profile.uid;
        try {
          await supabase.from('ai_chat_sessions').upsert([{ 
            user_id: uid, 
            session_data: JSON.stringify(newSessions),
            updated_at: new Date().toISOString()
          }], { onConflict: 'user_id' });
        } catch (dbErr) {
          console.warn("Supabase chat sync error:", dbErr);
        }
      }
    } catch (e) {
      console.warn("Failed to save sessions:", e);
    }
  };

  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAttachments(prev => [...prev, {
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
        mimeType: result.assets[0].mimeType || 'image/jpeg',
        name: 'Image Attachment',
        type: 'image'
      }]);
    }
  };

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      type: '*/*'
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      try {
        const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: FileSystem.EncodingType.Base64 });
        setAttachments(prev => [...prev, {
          uri: result.assets[0].uri,
          base64: base64,
          mimeType: result.assets[0].mimeType || 'application/pdf',
          name: result.assets[0].name,
          type: 'document'
        }]);
      } catch (err) {
        Alert.alert("Error", "Could not read document data.");
      }
    }
  };

  const toggleRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        if (isRecording) {
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
          }
          setIsRecording(false);
        } else {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64data = reader.result.split(',')[1];
              setInputText(prev => prev ? prev + " (Transcribing...)" : "(Transcribing...)");
              try {
                const transcription = await transcribeAudio(base64data, 'audio/webm', apiKey);
                setInputText(prev => {
                  const cleaned = prev.replace("(Transcribing...)", "").trim();
                  return cleaned ? cleaned + " " + transcription : transcription;
                });
              } catch (e) {
                console.error("Transcription Error:", e);
                Alert.alert("Error", "Failed to transcribe audio.");
                setInputText(prev => prev.replace("(Transcribing...)", "").trim());
              }
            };
          };

          mediaRecorder.start();
          setIsRecording(true);
        }
        return;
      }

      if (isRecording) {
        setIsRecording(false);
        if (recording) {
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
          
          setInputText(prev => prev ? prev + " (Transcribing...)" : "(Transcribing...)");
          
          const transcription = await transcribeAudio(base64, 'audio/m4a', apiKey);
          
          setInputText(prev => {
             const cleaned = prev.replace("(Transcribing...)", "").trim();
             return cleaned ? cleaned + " " + transcription : transcription;
          });
        }
      } else {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording: newRec } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRec);
        setIsRecording(true);
      }
    } catch (err) {
      console.error('Failed to start recording', err);
      setIsRecording(false);
      Alert.alert("Microphone Error", "Failed to use microphone. Make sure you have granted permissions.");
    }
  };

  const createNewSession = async () => {
    const newId = 'session_' + Date.now();
    const newSession = {
      id: newId,
      title: "New Chat",
      messages: [welcomeMessage],
      updatedAt: Date.now()
    };
    const newSessions = [newSession, ...chatSessions];
    setMessages([welcomeMessage]);
    setActiveSessionId(newId);
    setShowSidebar(false);
    await saveSessions(newSessions);
  };

  const switchSession = (sessionId) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      setMessages(session.messages);
      setShowSidebar(false);
    }
  };

  const executeDeleteSession = async (id) => {
    const updated = chatSessions.filter(s => s.id !== id);
    await saveSessions(updated);
    if (activeSessionId === id) {
      if (updated.length > 0) {
        switchSession(updated[0].id);
      } else {
        createNewSession();
      }
    }
  };

  const deleteSession = (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm("Delete this conversation?")) {
        executeDeleteSession(id);
      }
    } else {
      Alert.alert(
        "Delete Chat",
        "Delete this conversation?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => executeDeleteSession(id) }
        ]
      );
    }
  };

  const executeRenameSession = async (id, newTitle) => {
    const updated = chatSessions.map(s => s.id === id ? { ...s, title: newTitle } : s);
    await saveSessions(updated);
  };

  const shareSession = async (id) => {
    try {
      const session = chatSessions.find(s => s.id === id);
      if (!session) return;
      
      let chatText = `Chat History: ${session.title}\n\n`;
      session.messages.forEach(m => {
        const sender = m.sender === 'user' ? 'Me' : 'SkillGenome AI';
        chatText += `${sender}:\n${m.text}\n\n`;
      });
      
      await Share.share({
        message: chatText,
        title: session.title
      });
    } catch (error) {
      console.warn("Error sharing chat:", error);
    }
  };

  const togglePinSession = async (id) => {
    const updated = chatSessions.map(s => s.id === id ? { ...s, isPinned: !s.isPinned } : s);
    updated.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
    await saveSessions(updated);
  };


  const updateActiveSession = async (newMessages) => {
    const updatedSessions = chatSessions.map(session => {
      if (session.id === activeSessionId) {
        // Update title if it's still 'New Chat' and we have a user message
        let newTitle = session.title;
        if (newTitle === "New Chat" && newMessages.length > 1) {
           const firstUserMsg = newMessages.find(m => m.sender === 'user');
           if (firstUserMsg) {
              newTitle = firstUserMsg.text.substring(0, 25) + (firstUserMsg.text.length > 25 ? '...' : '');
           }
        }
        return { ...session, title: newTitle, messages: newMessages, updatedAt: Date.now() };
      }
      return session;
    });
    // Sort by most recently updated, keeping pinned on top
    updatedSessions.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
    await saveSessions(updatedSessions);
  };

  useEffect(() => {
    // Load persisted API key on mount
    const loadApiKey = async () => {
      try {
        const storedKey = await AsyncStorage.getItem("GEMINI_API_KEY");
        if (storedKey) setApiKey(storedKey);
      } catch (e) {
        console.warn("Failed to load Gemini API key:", e);
      }
    };
    loadApiKey();
  }, []);

  const saveApiKey = async (key) => {
    setApiKey(key);
    try {
      await AsyncStorage.setItem("GEMINI_API_KEY", key);
    } catch (e) {
      console.warn("Failed to save Gemini API key:", e);
    }
  };

  const handleClearChat = () => {
    if (Platform.OS === 'web') {
      const confirmClear = window.confirm("Are you sure you want to delete your chat history?");
      if (!confirmClear) return;
    } else {
      Alert.alert(
        "Delete Chat",
        "Are you sure you want to delete your chat history?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => createNewSession()
          }
        ]
      );
      return;
    }
    createNewSession();
  };


  const QUICK_PROMPTS = [
    { label: "📄 Optimize my Resume Score", query: "How do I optimize my Resume DNA score?" },
    { label: "🎭 Improve vocal & facial EQ", query: "How can I raise my EQ rating inside EmotionPrint?" },
    { label: "🧠 Uncover cognitive distortions", query: "What are cognitive distortions in my ThoughtPrint journal?" },
    { label: "📈 Raise cumulative score", query: "How is my Career Genome Score calculated?" },
    { label: "🐍 Best Python practices", query: "Give me clean, high-performance coding tips in Python." },
    { label: "💻 React Native layout tips", query: "Explain best cross-platform web/mobile render patterns." }
  ];

  useEffect(() => {
    // Smooth scroll to bottom on new message
    if (scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isTyping]);

  
  const handleSend = async (forcedText = "") => {
    const textToSend = forcedText || inputText;
    if (!textToSend.trim() && attachments.length === 0) return;

    // Use default API key or the one set in state
    const currentApiKey = apiKey && apiKey.trim() !== "" ? apiKey : null;
    
    // Add user message to UI
    const newUserMsg = { id: Date.now().toString(), text: textToSend, sender: "user", attachments: attachments };
    
    let currentSession = null;
    let updatedSessions = [...chatSessions];
    
    if (activeSessionId) {
       const idx = updatedSessions.findIndex(s => s.id === activeSessionId);
       if (idx >= 0) {
         updatedSessions[idx].messages.push(newUserMsg);
         updatedSessions[idx].timestamp = Date.now();
         currentSession = updatedSessions[idx];
       }
    } else {
       const newTitle = textToSend ? (textToSend.length > 20 ? textToSend.substring(0, 20) + "..." : textToSend) : "Media Chat";
       currentSession = {
         id: Date.now().toString(),
         title: newTitle,
         messages: [newUserMsg],
         timestamp: Date.now(),
         isPinned: false
       };
       updatedSessions = [currentSession, ...updatedSessions];
       setActiveSessionId(currentSession.id);
    }
    
    setMessages(currentSession.messages);
    setChatSessions(updatedSessions);
    await saveSessions(updatedSessions);
    
    setInputText("");
    const attachmentsToSend = [...attachments];
    setAttachments([]);
    
    setIsTyping(true);
    if (scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current.scrollToEnd({ animated: true }), 100);
    }

    try {
      // Call Gemini API
      const aiResponseText = await generateGeminiResponse(currentSession.messages.slice(0, -1), textToSend, attachmentsToSend, currentApiKey);
      
      const newAiMsg = { id: (Date.now() + 1).toString(), text: aiResponseText, sender: "ai" };
      
      const finalSessions = [...updatedSessions];
      const sIdx = finalSessions.findIndex(s => s.id === currentSession.id);
      if (sIdx >= 0) {
        finalSessions[sIdx].messages.push(newAiMsg);
        finalSessions[sIdx].timestamp = Date.now();
      }
      
      setMessages(finalSessions[sIdx].messages);
      setChatSessions(finalSessions);
      await saveSessions(finalSessions);
      
    } catch (err) {
       console.error("Chat Error:", err);
       Alert.alert("Error", err.message || "Failed to communicate with AI.");
    } finally {
       setIsTyping(false);
       if (scrollViewRef.current) {
         setTimeout(() => scrollViewRef.current.scrollToEnd({ animated: true }), 100);
       }
    }
  };

  const getOfflineMentorReply = (query) => {
    const q = query.toLowerCase();
    if (q.includes("resume") || q.includes("dns") || q.includes("dnas")) {
      return `### 📄 SkillGenome Resume DNA Optimizer (Offline Mode)

To raise your career rating and optimize your resume, follow these clinical tips:

1. **Upload Resume:** Tap **Upload Resume** on your home dashboard to extract your standard skills.
2. **Keyword Density:** Our parser scans for technical classifications (e.g. *Python, Deep Learning, React Native, SUPABASE*). Make sure these exact keywords exist in your resume rather than generic descriptions.
3. **Modular Metric Allocation:** Highlight quantitative achievements, such as *'Optimized page loads by 45% using React Native Web list pre-rendering'*`;
    }
    if (q.includes("github") || q.includes("git") || q.includes("repo")) {
      return `### ⚙️ GitHub Repository Insights & Developer Ratings (Offline Mode)

Connecting your public code repositories allows our AI compiler to evaluate real-time repository footprints:

- **Code Quality rating:** Scans languages, commit frequency, and framework varieties (e.g. FastAPI, Supabase, Docker).
- **Multi-Module recalibration:** Once connected, your public repo ratings directly influence your central Genome Score!

**Action Item:** Tap **Analyze GitHub** on the Home screen to connect your developer profile!`;
    }
    if (q.includes("emotion") || q.includes("eq") || q.includes("facial") || q.includes("voice") || q.includes("pitch")) {
      return `### 🎭 EmotionPrint & EQ Optimization (Offline Mode)

Our EmotionPrint module analyzes your webcam video using **OpenCV** frame stabilization, **DeepFace** CNN emotional valence classification, **MediaPipe** 468 Face Mesh landmark grids, and **Librosa** audio DSP pitch/jitter features:

1. **Raise your EQ Score:** To secure a high EQ rating, speak with stable, confident pitch trajectories (low Librosa jitter) and maintain symmetrical facial expressions (symmetrical Corrugator landmarks).
2. **Vocal Stress Index:** Somatic anxiety is calculated from vocal tremors and breath support metrics. Paced diaphragmatic breathing is highly recommended to stabilize projection.`;
    }
    if (q.includes("thought") || q.includes("journal") || q.includes("cognitive") || q.includes("adaptability")) {
      return `### 🧠 ThoughtPrint Cognitive journaling (Offline Mode)

ThoughtPrint maps your daily cognitive reflections using advanced Natural Language Processing (NLP):

- **BERT Attention Breakdown:** Classifies your text into 4 primary profiles (*Analytical, Strategic, Creative, or Empathetic*).
- **Cognitive Distortion Detector:** Scans for mental traps such as *Catastrophizing* or *All-or-Nothing Thinking*.
- **Flexibility Calibration:** Your Cognitive Adaptability rating directly recalibrates your genome index.`;
    }
    return `### 🚀 SkillGenome AI Career Mentor (Offline Mode)

I am your SkillGenome AI Career Advisor, built to map your professional evolution. Here is how I can guide you today:

- **Resume DNA Optimization:** Ask me *'How do I optimize my resume?'* or *'How is my Resume DNA score calculated?'*
- **Acoustic & Expression EQ:** Ask me *'What is EmotionPrint?'* or *'How can I raise my EQ rating?'*
- **Cognitive journaling:** Ask me *'What are cognitive distortions?'* or *'How does ThoughtPrint analyze my writing?'*
- **GitHub & Coding:** Ask me *'How do I connect GitHub?'* or *'Give me React Native coding advice.'*

What professional milestone are we mapping next? Drop your query, and let's optimize your Career Genome!`;
  };

  const renderTextContent = (text) => {
    // Simple custom markdown renderer supporting titles and lists
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("### ")) {
        return <Text key={idx} style={[styles.mdH3, { color: textPrimary }]}>{line.replace("### ", "")}</Text>;
      }
      if (line.startsWith("## ")) {
        return <Text key={idx} style={[styles.mdH2, { color: textPrimary }]}>{line.replace("## ", "")}</Text>;
      }
      if (line.startsWith("**") && line.endsWith("**")) {
        return <Text key={idx} style={[styles.mdBold, { color: textPrimary }]}>{line.replace(/\*\*/g, "")}</Text>;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <View key={idx} style={styles.bulletRow}>
            <Text style={[styles.bulletDot, { color: textSecondary }]}>•</Text>
            <Text style={[styles.bulletText, { color: textSecondary }]}>{line.substring(2)}</Text>
          </View>
        );
      }
      if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ")) {
        return (
          <View key={idx} style={styles.bulletRow}>
            <Text style={[styles.bulletNumber, { color: textSecondary }]}>{line.substring(0, 3)}</Text>
            <Text style={[styles.bulletText, { color: textSecondary }]}>{line.substring(3)}</Text>
          </View>
        );
      }
      
      // Inline bold parsing
      if (line.includes("**")) {
        const parts = line.split("**");
        return (
          <Text key={idx} style={[styles.messageText, { color: textPrimary }]}>
            {parts.map((p, i) => i % 2 === 1 ? <Text key={i} style={{ fontWeight: "bold", color: "#3bd1ff" }}>{p}</Text> : p)}
          </Text>
        );
      }
      
      return line.trim() ? <Text key={idx} style={[styles.messageText, { color: textPrimary }]}>{line}</Text> : <View key={idx} style={{ height: 6 }} />;
    });
  };

  return (
    <View style={[styles.root, {  backgroundColor: bgStyle }]}>
      {/* Sidebar Overlay */}
      {showSidebar && (
        <>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowSidebar(false)} />
          <View style={[styles.sidebarContainer, { position: 'absolute', zIndex: 100, top: 0, left: 0, bottom: 0, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', width: '80%' }]}>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: textPrimary }}>Chat History</Text>
              <Pressable onPress={() => setShowSidebar(false)}>
                <Text style={{ fontSize: 20, color: textPrimary }}>✕</Text>
              </Pressable>
            </View>

            {/* Search Bar */}
            <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
              <View style={[styles.sidebarSearchBox, { backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc', borderColor: isDarkMode ? '#334155' : '#e2e8f0', borderWidth: 1 }]}>
                <Text style={styles.sidebarSearchIcon}>🔍</Text>
                <TextInput 
                  style={[styles.sidebarSearchInput, { color: textPrimary }]} 
                  placeholder="Search chats..." 
                  placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"} 
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* New Conversation Button */}
            <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
               <Pressable style={{ backgroundColor: '#8b5cf6', borderRadius: 12, padding: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }} onPress={() => {
                 createNewSession();
                 setShowSidebar(false);
               }}>
                 <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginRight: 8 }}>+</Text>
                 <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>New Conversation</Text>
               </Pressable>
            </View>

            {/* Library button */}
            <Pressable style={[styles.sidebarItem, { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 20 }]} onPress={() => { setShowSidebar(false); if(typeof onOpenLibrary === "function") onOpenLibrary(); }}>
              <Text style={[styles.sidebarIcon, { width: 24, fontSize: 16, color: textPrimary }]}>📚</Text>
              <Text style={{ color: textPrimary, fontSize: 16, fontWeight: '500' }}>Library</Text>
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text style={{ color: '#94a3b8', paddingHorizontal: 16, marginBottom: 12, fontSize: 12, fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase' }}>Today</Text>
              <ScrollView>
                {chatSessions.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())).map((session) => (
                  <Pressable 
                    key={session.id} 
                    style={[styles.sidebarItem, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }, activeSessionId === session.id && { backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f3f4f6", borderRadius: 8 }]} 
                    onPress={() => switchSession(session.id)}
                  >
                    <Text style={{ fontSize: 16, color: '#8b5cf6', marginRight: 12 }}>💬</Text>
                    <Text style={{ flex: 1, color: activeSessionId === session.id ? '#8b5cf6' : textPrimary, fontWeight: activeSessionId === session.id ? '600' : '400', fontSize: 15 }} numberOfLines={1}>
                      {session.title}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <Pressable onPress={() => setRenameState({ visible: true, id: session.id, title: session.title })}>
                        <Text style={{ color: '#94a3b8', fontSize: 14 }}>✏️</Text>
                      </Pressable>
                      <Pressable onPress={() => shareSession(session.id)}>
                        <Text style={{ color: '#3b82f6', fontSize: 14 }}>📤</Text>
                      </Pressable>
                      <Pressable onPress={() => togglePinSession(session.id)}>
                        <Text style={{ color: session.isPinned ? '#8b5cf6' : '#94a3b8', fontSize: 14 }}>📌</Text>
                      </Pressable>
                      <Pressable onPress={() => deleteSession(session.id)}>
                        <Text style={{ color: '#ef4444', fontSize: 14 }}>🗑️</Text>
                      </Pressable>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </>
      )}

      {/* Main Content Area */}
      <View style={{ flex: 1, backgroundColor: bgStyle }}>
        {/* ── Premium Header ── */}
        <View style={[styles.headerBar, { backgroundColor: bgStyle, borderBottomColor: borderStyle }]}>
          {/* Left: Back + Menu */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Pressable
              style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: borderStyle, alignItems: 'center', justifyContent: 'center' }}
              onPress={() => typeof onBack === "function" && onBack()}
            >
              <Text style={{ fontSize: 18, color: textPrimary, fontWeight: '600' }}>←</Text>
            </Pressable>
            <Pressable
              style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: borderStyle, alignItems: 'center', justifyContent: 'center' }}
              onPress={() => setShowSidebar(true)}
            >
              <Text style={{ fontSize: 16, color: textPrimary }}>☰</Text>
            </Pressable>
          </View>

          {/* Center: Logo + Title */}
          <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <LinearGradient
                colors={['#7c3aed', '#06b6d4']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontSize: 15, fontWeight: '900', color: '#fff' }}>✦</Text>
              </LinearGradient>
              <Text style={{ fontSize: 17, fontWeight: '800', color: textPrimary, letterSpacing: -0.3 }}>AI Career Coach</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' }} />
              <Text style={{ fontSize: 11, color: textSecondary, fontWeight: '500' }}>Powered by Gemini</Text>
            </View>
          </View>

          {/* Right: Menu */}
          <View style={{ width: 86, flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Pressable
              style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: borderStyle, alignItems: 'center', justifyContent: 'center' }}
              onPress={() => setShowMenu(!showMenu)}
            >
              <Text style={{ fontSize: 18, color: textPrimary }}>⋮</Text>
            </Pressable>
          </View>
        </View>

      {/* Rename Modal */}
      {renameState.visible && (
        <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', zIndex: 300 }]}>
          <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} onPress={() => setRenameState({ visible: false, id: null, title: "" })} />
          <View style={{ backgroundColor: cardBg, padding: 24, borderRadius: 16, width: '80%', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: textPrimary, marginBottom: 16 }}>Rename Chat</Text>
            <TextInput
              style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', color: textPrimary, padding: 12, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: borderStyle }}
              value={renameState.title}
              onChangeText={(text) => setRenameState({ ...renameState, title: text })}
              autoFocus
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24, gap: 12 }}>
              <Pressable onPress={() => setRenameState({ visible: false, id: null, title: "" })} style={{ padding: 12 }}>
                <Text style={{ color: textSecondary, fontWeight: '600' }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={() => {
                if (renameState.title.trim()) {
                  executeRenameSession(renameState.id, renameState.title.trim());
                }
                setRenameState({ visible: false, id: null, title: "" });
              }} style={{ backgroundColor: '#8b5cf6', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 }}>
                <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* API Key Configure Drawer */}
      {showKeyInput && (
        <View style={[styles.keyDrawer, { backgroundColor: keyDrawerBg, borderBottomColor: borderStyle }]}>
          <Text style={[styles.keyDrawerTitle, { color: textPrimary }]}>Configure Google Gemini API Key</Text>
          <Text style={[styles.keyDrawerSub, { color: textSecondary }]}>
            Unlocks live, ChatGPT-grade career insights tailored to your resume, code, and EQ scores.
          </Text>
          <View style={styles.keyInputRow}>
            <TextInput
              secureTextEntry
              value={apiKey}
              onChangeText={saveApiKey}
              placeholder="Paste Google Gemini API key here..."
              placeholderTextColor="#64748b"
              style={[styles.keyTextInput, { backgroundColor: inputBgColor, color: textPrimary, borderColor: borderStyle }]}
            />
            <Pressable style={styles.keyCloseBtn} onPress={() => setShowKeyInput(false)}>
              <Text style={styles.keyCloseText}>Done</Text>
            </Pressable>
          </View>
        </View>
      )}

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={[styles.chatArea, { backgroundColor: bgStyle }]}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((m) => (
            <View 
              key={m.id} 
              style={[
                styles.messageRow, 
                m.sender === "user" ? styles.rowUser : styles.rowAi
              ]}
            >
              {m.sender === "ai" && (
                <View style={styles.aiIconBadge}>
                  <Text style={styles.aiIconText}>🤖</Text>
                </View>
              )}
              
              <View 
                style={[
                  styles.messageBubble, 
                  m.sender === "user" ? styles.bubbleUser : styles.bubbleAi,
                  m.sender === "ai" && { backgroundColor: isDarkMode ? Color.colorAzure11 || "#0d172e" : '#ffffff', borderColor: borderStyle, borderWidth: isDarkMode ? 0 : 1 }
                ]}
              >
                {m.attachments && m.attachments.length > 0 && (
                  <View style={{ marginBottom: m.text ? 8 : 0, gap: 8 }}>
                    {m.attachments.map((att, idx) => (
                      <View key={idx}>
                        {att.type === 'image' ? (
                          <Image source={{ uri: att.uri }} style={{ width: 220, height: 220, borderRadius: 12 }} resizeMode="cover" />
                        ) : (
                          <View style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 18 }}>{att.type === 'audio' ? '🎤' : '📄'}</Text>
                            <Text style={{ marginLeft: 8, color: m.sender === 'user' ? '#fff' : textPrimary, fontWeight: '600' }}>{att.name || "Attachment"}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
                {renderTextContent(m.text)}
              </View>
            </View>
          ))}

          {/* Quick Prompts under the welcome bubbles */}
          {messages.length === 1 && (
            <View style={styles.shortcutsContainer}>
              <Text style={[styles.shortcutsTitle, { color: textSecondary }]}>Quick Queries Mapped to Genome Modules:</Text>
              <View style={styles.shortcutsGrid}>
                {QUICK_PROMPTS.map((p, idx) => (
                  <Pressable 
                    key={idx} 
                    style={[styles.shortcutChip, { backgroundColor: shortcutBg, borderColor: borderStyle }]}
                    onPress={() => handleSend(p.query)}
                  >
                    <Text style={[styles.shortcutChipText, { color: textPrimary }]}>{p.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {isTyping && (
            <View style={[styles.messageRow, styles.rowAi]}>
              <View style={styles.aiIconBadge}>
                <Text style={styles.aiIconText}>🤖</Text>
              </View>
              <View style={[styles.messageBubble, styles.bubbleAi, styles.typingBubble, { backgroundColor: isDarkMode ? Color.colorAzure11 || "#0d172e" : '#ffffff', borderColor: borderStyle, borderWidth: isDarkMode ? 0 : 1 }]}>
                <Text style={[styles.typingText, { color: textSecondary }]}>AI Mentor is formulating advice...</Text>
                <View style={styles.typingDotsRow}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 8, gap: 8, flexWrap: 'wrap' }}>
            {attachments.map((att, i) => (
              <View key={i} style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)', padding: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                 <Text style={{ fontSize: 12, color: '#e2e8f0' }}>{att.type === 'audio' ? '🎤' : (att.type === 'image' ? '🖼️' : '📄')} {att.name}</Text>
                 <Pressable onPress={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} style={{ marginLeft: 6 }}>
                   <Text style={{ color: '#ef4444', fontSize: 14 }}>✕</Text>
                 </Pressable>
              </View>
            ))}
          </View>
        )}
        {/* Input bar */}

        <View style={[styles.inputBar, { backgroundColor: cardBg, borderTopColor: borderStyle, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, gap: 12 }]}>
          
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: isDarkMode ? '#222' : '#f1f5f9', borderRadius: 24, paddingHorizontal: 12, paddingVertical: 8, height: 48 }}>
             <Pressable style={{ padding: 4, marginRight: 8 }} onPress={() => Alert.alert("Upload", "Choose media type", [{text: "Image", onPress: pickImage}, {text: "Document", onPress: pickDocument}, {text: "Cancel", style: "cancel"}])}>
               <Text style={{ fontSize: 22, color: textSecondary, fontWeight: '300' }}>+</Text>
             </Pressable>
             
             <TextInput
               value={inputText}
               onChangeText={setInputText}
               placeholder="Ask anything"
               placeholderTextColor={textSecondary}
               style={{ flex: 1, color: textPrimary, fontSize: 16, padding: 0 }}
               onSubmitEditing={() => handleSend()}
               returnKeyType="send"
             />
             
             <Pressable style={{ padding: 4, marginLeft: 8 }} onPress={() => toggleRecording()}>
               <Text style={{ fontSize: 18, color: isRecording ? "#ef4444" : textSecondary }}>
                 {isRecording ? "⏹️" : "🎤"}
               </Text>
             </Pressable>
          </View>

          <Pressable 
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#8b5cf6', alignItems: 'center', justifyContent: 'center' }} 
            onPress={() => handleSend()}
          >
            <Text style={{ fontSize: 18, color: '#fff' }}>🚀</Text>
          </Pressable>
        </View>
        {/* 3-Dots Menu Dropdown */}
      {showMenu && (
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowMenu(false)}>
          <View style={[styles.menuDropdown, { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff' }]}>
            <Pressable style={styles.menuItem} onPress={() => { setShowMenu(false); handleClearChat(); }}>
              <Text style={[styles.menuItemText, { color: isDarkMode ? '#e2e8f0' : '#0f172a' }]}>🗑️ Clear Chat</Text>
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable style={styles.menuItem} onPress={() => { setShowMenu(false); setShowKeyInput(true); }}>
              <Text style={[styles.menuItemText, { color: isDarkMode ? '#e2e8f0' : '#0f172a' }]}>🔑 Set AI Key</Text>
            </Pressable>
          </View>
        </Pressable>
      )}


    </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Color.appPrimaryBackground || "#071126"
  },
  headerBar: {
    paddingTop: Platform.OS === 'ios' ? 56 : (Platform.OS === 'android' ? 38 : 24),
    paddingBottom: 16,
    paddingHorizontal: 16,
    
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    backgroundColor: "rgba(7,17,38,0.85)",
    zIndex: 10
  },
  clearButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    marginRight: 8
  },
  clearButtonText: {
    color: "#f87171",
    fontSize: 11,
    fontWeight: "700"
  },
  keyButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginRight: 10
  },
  keyButtonActive: {
    backgroundColor: "rgba(0, 212, 255, 0.15)",
    borderColor: "rgba(0, 212, 255, 0.3)"
  },
  keyButtonText: {
    color: "#00d4ff",
    fontSize: 11,
    fontWeight: "700"
  },
  keyDrawer: {
    backgroundColor: "#0d1a30",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    padding: 16,
    gap: 8
  },
  keyDrawerTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700"
  },
  keyDrawerSub: {
    color: "#94a3b8",
    fontSize: 11,
    lineHeight: 14
  },
  keyInputRow: {
    
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    alignItems: "center"
  },
  keyTextInput: {
    flex: 1,
    backgroundColor: "#071329",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    color: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 12
  },
  keyCloseBtn: {
    backgroundColor: "#00d4ff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center"
  },
  keyCloseText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "700"
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center"
  },
  backText: {
    color: "#cbd5e1",
    fontSize: 18,
    fontWeight: "700"
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 12
  },
  headerTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    fontFamily: FontFamily.interBold
  },
  statusRow: {
    
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 6
  },
  statusPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981"
  },
  statusText: {
    color: "#10b981",
    fontSize: 10,
    fontWeight: "600"
  },
  avatarMini: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: Color.colorCyan50 || "#00d4ff"
  },
  avatarImageMini: {
    width: 38,
    height: 38
  },
  avatarImageTextMini: {
    width: 38,
    height: 38,
    backgroundColor: "#1e2937",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarMiniText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700"
  },
  chatArea: {
    flex: 1
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
  },
  messageRow: {
    
    flexDirection: "row",
    width: "100%",
    gap: 8,
    marginVertical: 4
  },
  rowUser: {
    justifyContent: "flex-end"
  },
  rowAi: {
    justifyContent: "flex-start"
  },
  aiIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(139,92,246,0.15)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2
  },
  aiIconText: {
    fontSize: 14
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 16,
    padding: 14,
    gap: 6
  },
  bubbleUser: {
    backgroundColor: "rgba(0, 212, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.15)",
    borderTopRightRadius: 2,
    alignSelf: "flex-end"
  },
  bubbleAi: {
    backgroundColor: Color.colorAzure11 || "#0d172e",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderTopLeftRadius: 2,
    alignSelf: "flex-start"
  },
  messageText: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: FontFamily.interRegular
  },
  mdH3: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4,
    marginBottom: 2,
    fontFamily: FontFamily.interBold
  },
  mdH2: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 6,
    marginBottom: 4,
    fontFamily: FontFamily.interBold
  },
  mdBold: {
    fontWeight: "bold",
    color: "#3bd1ff"
  },
  bulletRow: {
    
    flexDirection: "row",
    gap: 6,
    paddingLeft: 4,
    marginVertical: 1,
    alignItems: "flex-start",
    width: "96%"
  },
  bulletDot: {
    color: "#3bd1ff",
    fontSize: 14,
    marginTop: -2
  },
  bulletNumber: {
    color: "#3bd1ff",
    fontSize: 11,
    fontWeight: "700"
  },
  bulletText: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 18,
    flex: 1
  },
  typingBubble: {
    
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12
  },
  typingText: {
    color: "#64748b",
    fontSize: 11,
    fontStyle: "italic"
  },
  typingDotsRow: {
    
    flexDirection: "row",
    gap: 4
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#8b5cf6"
  },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.7 },
  dot3: { opacity: 1.0 },
  shortcutsContainer: {
    width: "100%",
    marginTop: 10,
    paddingHorizontal: 8
  },
  shortcutsTitle: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  shortcutsGrid: {
    flexDirection: "column",
    gap: 8
  },
  shortcutChip: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: "center"
  },
  shortcutChipText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: FontFamily.interSemiBold
  },
  inputBar: {
    padding: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    backgroundColor: "rgba(7,17,38,0.95)",
    
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  textInput: {
    flex: 1,
    backgroundColor: "#071329",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    color: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 13
  },
  sendBtnContainer: {
    borderRadius: 12,
    overflow: "hidden"
  },
  sendBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  sendBtnText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 13
  },
  sidebarContainer: {
    width: 250,
    height: "100%",
    backgroundColor: "#000000", // Dark ChatGPT style
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.1)",
    paddingTop: Platform.OS === 'ios' ? 56 : (Platform.OS === 'android' ? 38 : 24),
  },
  sidebarContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  newChatBtn: {
    
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    marginBottom: 24,
  },
  sidebarNav: {
    gap: 8,
  },
  sidebarItem: {
    
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  sidebarIcon: {
    fontSize: 16,
    width: 28,
    color: "#e2e8f0",
  },
  sidebarItemText: {
    color: "#e2e8f0",
    fontSize: 15,
    fontWeight: "500",
    fontFamily: FontFamily.interMedium,
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 16,
  },
  sidebarSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 8,
    height: 38,
  },
  sidebarSearchIcon: {
    fontSize: 14,
    marginRight: 8,
    color: '#64748b',
  },
  sidebarSearchInput: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 14,
  },
  attachBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachIcon: {
    fontSize: 18,
    color: '#94a3b8',
  },
  voiceActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  micBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micIcon: {
    fontSize: 18,
  },
  waveformBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformIcon: {
    fontSize: 14,
  },
  menuDropdown: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 150,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 200,
    padding: 8,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 4,
  },
  libraryModal: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    bottom: 60,
    borderRadius: 16,
    padding: 20,
    zIndex: 200,
  },
  libraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  libraryTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  libraryTabs: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  libraryTabActive: {
    backgroundColor: '#334155',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  libraryTabTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  libraryTabText: {
    color: '#94a3b8',
    paddingVertical: 6,
  },
  libraryTableHeaders: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 8,
    marginBottom: 16,
  },
  libraryTableCol: {
    flex: 1,
    color: '#94a3b8',
    fontSize: 14,
  },
  libraryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  libraryIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  libraryRowText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
});

export default AIChatScreen;
