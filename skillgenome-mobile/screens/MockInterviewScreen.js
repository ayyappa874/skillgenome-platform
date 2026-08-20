import * as React from "react";
import { View, Text, StyleSheet, Pressable, Animated, Platform, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { CameraView } from "expo-camera";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { getTheme } from "../utils/theme";
import { transcribeAudioClientSide, generateInterviewResponse } from "../utils/gemini";

// Helper to get backend URL for cross-platform (web vs mobile)
const getLocalBackendUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8000`;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
};



const MockInterviewScreen = ({
  onBack, onEndSession, onNextQuestion,
  role = 'Senior AI Engineer', company = 'Google DeepMind',
  isDarkMode = true, sessionConfig
}) => {
  const T = getTheme(isDarkMode);
  
  const [running, setRunning] = React.useState(true);
  const [timeRemaining, setTimeRemaining] = React.useState(585);
  const [answer, setAnswer] = React.useState("");
  
  const pulse = React.useRef(new Animated.Value(1)).current;
  const [isListening, setIsListening] = React.useState(false);
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  
  const [voiceConfidence, setVoiceConfidence] = React.useState(0);
  const [voiceStress, setVoiceStress] = React.useState(0);

  const [confidence, setConfidence] = React.useState(75);
  const [stress, setStress] = React.useState(20);

  const getInitMessage = () => {
    return `Welcome to your quick drill session for the ${role} position here at ${company}! Could you walk me through a specific instance where you had to diagnose and resolve a severe technical issue while scaling a complex system?`;
  };

  const [chatHistory, setChatHistory] = React.useState([
    {
      id: "init",
      role: "ai",
      text: getInitMessage()
    }
  ]);
  const scrollViewRef = React.useRef(null);
  const cameraRef = React.useRef(null);
  const recordingRef = React.useRef(null);
  // Timers and Animation
  React.useEffect(() => {
    if (running) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();

      const timer = setInterval(() => {
        setTimeRemaining(p => {
          if (p <= 1) { clearInterval(timer); setRunning(false); return 0; }
          return p - 1;
        });
      }, 1000);
      return () => { clearInterval(timer); pulse.stopAnimation(); };
    }
  }, [running, pulse]);
  
  // Permissions for Audio & Initial Speech
  React.useEffect(() => {
    (async () => {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      } catch (err) {
        console.warn("Audio permissions error", err);
      }
    })();
    
    // Speak first message
    Speech.speak(chatHistory[0].text, { rate: 0.95 });
    
    return () => {
        Speech.stop();
    };
  }, []);
  
  // Real Emotion Detection Loop
  React.useEffect(() => {
    if (running) {
      const emotionTimer = setInterval(async () => {
        if (cameraRef.current) {
          try {
            const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.2, scale: 0.5 });
            const backendUrl = getLocalBackendUrl();
            const response = await fetch(`${backendUrl}/api/emotion/analyze`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ base64_image: photo.base64 })
            });
            const data = await response.json();
            if (data.derived_metrics) {
              setConfidence(data.derived_metrics.confident_score);
              setStress(data.derived_metrics.stressed_score);
            }
          } catch (e) {
            console.log("Emotion backend fetch failed", e);
          }
        }
      }, 3000);
      return () => clearInterval(emotionTimer);
    }
  }, [running]);

  const toggleMic = async () => {
    if (isListening) {
      // Stop recording
      setIsListening(false);
      try {
        if (Platform.OS === 'web' && window.webAudioRecorder && window.webAudioRecorder.state === 'recording') {
            window.webAudioRecorder.stop();
        } else if (recordingRef.current) {
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            recordingRef.current = null;
            transcribeAudio(uri);
        }
      } catch (err) {
        console.warn("Stop recording failed", err);
      }
    } else {
      // Stop any AI speech when user starts talking
      Speech.stop();
      // Start recording
      setAnswer("");
      setIsListening(true);
      
      if (Platform.OS === 'web') {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            let options = { mimeType: 'audio/webm' };
            if (!MediaRecorder.isTypeSupported('audio/webm')) {
                options = { mimeType: 'audio/mp4' };
                if (!MediaRecorder.isTypeSupported('audio/mp4')) {
                    options = {};
                }
            }
            const mediaRecorder = new MediaRecorder(stream, options);
            window.webAudioRecorder = mediaRecorder;
            const chunks = [];
            mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
            mediaRecorder.onstop = () => {
                stream.getTracks().forEach(track => track.stop());
                const blob = new Blob(chunks, { type: options.mimeType || 'audio/webm' });
                const audioUri = URL.createObjectURL(blob);
                transcribeAudio(audioUri, blob);
            };
            mediaRecorder.start();
        } catch (e) {
            console.warn("Web audio recording failed", e);
            setIsListening(false);
        }
      } else {
        try {
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            recordingRef.current = recording;
        } catch (err) {
            console.warn("Failed to start recording", err);
            setIsListening(false);
        }
      }
    }
  };

  const transcribeAudio = async (uri, blobData = null) => {
      setIsTranscribing(true);
      try {
          const mimeType = Platform.OS === 'web' ? 'audio/webm' : 'audio/m4a';
          const text = await transcribeAudioClientSide(uri, mimeType, blobData);
          
          if (text) {
              setAnswer(text);
          } else {
              setAnswer("Error: Could not transcribe audio. Please type your answer.");
          }
      } catch (err) {
          console.warn("Client transcription failed:", err);
          setAnswer("Error processing audio locally.");
      } finally {
          setIsTranscribing(false);
      }
  };

  const handleSend = async () => {
    if (!answer.trim()) return;
    
    if (isListening) {
      toggleMic(); // Just stop it, user manually typed over or sent mid-record
    }
    
    const newChat = [...chatHistory, { id: Date.now().toString(), role: "user", text: answer.trim() }];
    setChatHistory(newChat);
    setAnswer("");
    Speech.stop();

    // Call Gemini API in real-time
    const response = await generateInterviewResponse(newChat, role);
    
    // Add Analysis first
    const analysisMsg = {
      id: (Date.now() + 1).toString(),
      role: "analysis",
      text: `${response.analysis}\n\nVisual Confidence: ${confidence}% | Visual Stress: ${stress}%`
    };
    
    setChatHistory(prev => [...prev, analysisMsg]);

    // Add actual next question after 1s delay for realism
    setTimeout(() => {
      const questionMsg = {
        id: (Date.now() + 2).toString(),
        role: "ai",
        text: response.next_question
      };
      setChatHistory(prev => [...prev, questionMsg]);
      Speech.speak(response.next_question, { rate: 0.95 });
    }, 1000);
  };
  
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const secs = s % 60;
    return `${m}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const S = React.useMemo(() => getStyles(T), [T]);

  return (
    <View style={[S.root, { backgroundColor: "#f8fafc" }]}>
      
      {/* Header */}
      <View style={S.header}>
        <Pressable style={S.iconBtn} onPress={onBack}>
          <Text style={S.iconBtnText}>✕</Text>
        </Pressable>
        <View style={S.timerBadge}>
          <Animated.Text style={[S.timerDot, running && { opacity: pulse, color: "#f43f5e" }]}>●</Animated.Text>
          <Text style={S.timerText}>{formatTime(timeRemaining)}</Text>
        </View>
        <Pressable style={S.endBtn} onPress={onEndSession}>
          <Text style={S.endBtnText}>End</Text>
        </Pressable>
      </View>

      {/* Main Container */}
      <View style={S.content}>
        
        {/* Split Video Cards */}
        <View style={S.videoRow}>
          
          {/* AI Recruiter Card */}
          <View style={[S.videoCard, { backgroundColor: "#fff" }]}>
            <View style={S.aiAvatarWrapper}>
              <View style={S.aiAvatarBox}>
                <Text style={S.aiAvatarIcon}>🤖</Text>
              </View>
            </View>
            <View style={S.cardLabel}>
              <Text style={S.cardLabelText}>AI Recruiter ({role})</Text>
            </View>
          </View>

          {/* User Camera Card */}
          <View style={[S.videoCard, { backgroundColor: "#000" }]}>
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="front" mute={true} />
            
            {/* Live Metrics Overlay */}
            <View style={S.metricsOverlay}>
              <View style={[S.metricBadge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                <Text style={[S.metricValue, { color: confidence > 70 ? "#4ade80" : "#fff" }]}>{confidence}%</Text>
                <Text style={S.metricTitle}>CONFIDENT</Text>
              </View>
              <View style={[S.metricBadge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                <Text style={[S.metricValue, { color: stress > 40 ? "#f87171" : "#fff" }]}>{stress}%</Text>
                <Text style={S.metricTitle}>STRESSED</Text>
              </View>
            </View>

            <View style={[S.cardLabel, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
              <Text style={[S.cardLabelText, { color: "#fff" }]}>You (Live Analysis)</Text>
            </View>
          </View>
        </View>

        {/* Question & Chat Area */}
        <ScrollView 
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({animated: true})}
          style={S.chatContainer} 
          contentContainerStyle={{ padding: 20, gap: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {chatHistory.map((msg) => {
            if (msg.role === 'ai') {
              return (
                <View key={msg.id} style={S.aiMessage}>
                  <Text style={S.aiMessageText}>{msg.text}</Text>
                </View>
              )
            } else if (msg.role === 'analysis') {
              return (
                <View key={msg.id} style={S.analysisMessage}>
                  <Text style={S.analysisMessageText}>{msg.text}</Text>
                </View>
              )
            } else {
              return (
                <View key={msg.id} style={S.userMessage}>
                  <Text style={S.userMessageText}>{msg.text}</Text>
                </View>
              )
            }
          })}
        </ScrollView>

        {/* Input Area */}
        <View style={S.inputRow}>
          <Pressable style={S.recordBtn} onPress={toggleMic} disabled={isTranscribing}>
            {isTranscribing ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Animated.View style={[S.recordInner, isListening && { transform: [{ scale: pulse }] }]}>
                  <Text style={{ fontSize: 24, textAlign: 'center' }}>{isListening ? "⏹️" : "🎙️"}</Text>
                </Animated.View>
            )}
          </Pressable>
          
          <View style={[S.textInputContainer, (isListening || isTranscribing) && { borderColor: "#ef4444" }]}>
            <TextInput
              style={S.textInput}
              placeholder={isTranscribing ? "Transcribing voice via backend..." : isListening ? "Recording voice... (tap stop to transcribe)" : "Type answer or tap mic"}
              placeholderTextColor="#94a3b8"
              multiline
              value={answer}
              onChangeText={setAnswer}
            />
          </View>

          <Pressable style={[S.sendBtn, !answer && { opacity: 0.5 }]} onPress={handleSend}>
            <Text style={S.sendIcon}>↑</Text>
          </Pressable>
        </View>

      </View>
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "ios" ? 54 : 28, paddingHorizontal: 20 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  iconBtnText: { fontSize: 18, color: "#000", fontWeight: "600" },
  
  timerBadge: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: "#fff", shadowColor: "#000", shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  timerDot: { fontSize: 12 },
  timerText: { fontSize: 16, fontWeight: "800", color: "#000", fontVariant: ["tabular-nums"] },
  
  endBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, backgroundColor: "#ffe4e6" },
  endBtnText: { fontSize: 15, fontWeight: "700", color: "#e11d48" },

  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },

  videoRow: { flexDirection: "row", gap: 12, height: "30%", minHeight: 200 },
  videoCard: { flex: 1, borderRadius: 24, overflow: "hidden", shadowColor: "#000", shadowOffset: {width:0, height:4}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, position: "relative" },
  
  aiAvatarWrapper: { flex: 1, alignItems: "center", justifyContent: "center" },
  aiAvatarBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  aiAvatarIcon: { fontSize: 50 },

  cardLabel: { position: "absolute", bottom: 12, left: 12, backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  cardLabelText: { fontSize: 12, fontWeight: "700", color: "#fff" },

  metricsOverlay: { position: "absolute", top: 12, right: 12, gap: 8 },
  metricBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignItems: "center" },
  metricValue: { fontSize: 14, fontWeight: "800", color: "#fff" },
  metricTitle: { fontSize: 9, fontWeight: "700", color: "#fff", letterSpacing: 1 },

  chatContainer: { flex: 1, backgroundColor: "#fff", borderRadius: 24, marginTop: 12, shadowColor: "#000", shadowOffset: {width:0, height:4}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  aiMessage: { alignSelf: 'flex-start', backgroundColor: '#f1f5f9', padding: 16, borderRadius: 16, maxWidth: '90%' },
  aiMessageText: { fontSize: 15, color: '#1e293b', lineHeight: 24, fontWeight: "500" },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#7c3aed', padding: 16, borderRadius: 16, maxWidth: '85%' },
  userMessageText: { fontSize: 15, color: '#fff', lineHeight: 24 },
  analysisMessage: { alignSelf: 'stretch', backgroundColor: '#1e293b', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  analysisMessageText: { fontSize: 13, color: '#e2e8f0', lineHeight: 20, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 12, marginTop: 12 },
  recordBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#ef4444", alignItems: "center", justifyContent: "center" },
  recordInner: { width: 56, height: 56, alignItems: "center", justifyContent: "center" },
  textInputContainer: { flex: 1, backgroundColor: "#fff", borderRadius: 24, paddingHorizontal: 20, paddingVertical: 16, borderWidth: 1.5, borderColor: "#e2e8f0", minHeight: 56, maxHeight: 120 },
  textInput: { fontSize: 15, color: "#1e293b" },
  sendBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#7c3aed", alignItems: "center", justifyContent: "center" },
  sendIcon: { fontSize: 24, color: "#fff", fontWeight: "800" },
});

export default MockInterviewScreen;
