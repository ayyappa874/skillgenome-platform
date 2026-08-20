import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { getTheme } from '../utils/theme';
import { analyzeEmotionVideo } from '../utils/gemini';

const EmotionPrintInputScreen = ({ onComplete, onBack, isDarkMode = true }) => {
  const T = getTheme(isDarkMode);
  const S = useMemo(() => getStyles(T), [T]);
  
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  
  const cameraRef = useRef(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [status, setStatus] = useState('Ready to scan');
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [recordingStartTime, setRecordingStartTime] = useState(null);

  useEffect(() => {
    if (!cameraPermission?.granted) requestCameraPermission();
    if (!microphonePermission?.granted) requestMicrophonePermission();
  }, [cameraPermission, microphonePermission]);

  useEffect(() => {
    if (isRecording || isAnalyzing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
    }
  }, [isRecording, isAnalyzing]);

  const handleRecord = async () => {
    if (!cameraPermission?.granted || !microphonePermission?.granted) {
      alert("Camera and microphone permissions are required.");
      return;
    }
    
    if (isRecording) {
      if (Platform.OS === 'web' && window.webMediaRecorder && window.webMediaRecorder.state === 'recording') {
        window.webMediaRecorder.stop();
      } else {
        cameraRef.current?.stopRecording();
      }
      return;
    }

    if (Platform.OS === 'web') {
      try {
        setIsRecording(true);
        setRecordingStartTime(Date.now());
        setStatus("Recording facial markers...");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        // Try webm first, fallback to generic
        let options = { mimeType: 'video/webm' };
        if (!MediaRecorder.isTypeSupported('video/webm')) {
            options = { mimeType: 'video/mp4' };
            if (!MediaRecorder.isTypeSupported('video/mp4')) {
                options = {};
            }
        }
        
        const mediaRecorder = new MediaRecorder(stream, options);
        window.webMediaRecorder = mediaRecorder;
        const recordedChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunks.push(event.data);
          }
        };
        
        mediaRecorder.onstop = async () => {
          // Small delay to ensure all chunks are processed
          await new Promise(r => setTimeout(r, 100));
          const blob = new Blob(recordedChunks, { type: options.mimeType || 'video/webm' });
          const videoUri = URL.createObjectURL(blob);
          
          const actualDuration = Math.max(1, Math.round((Date.now() - recordingStartTime) / 1000));
          
          setIsRecording(false);
          setIsAnalyzing(true);
          setStatus("Analyzing AI micro-expressions & tone...");
          
          try {
            const result = await analyzeEmotionVideo(videoUri, actualDuration, "Neutral");
            if (onComplete) {
              onComplete({ ...result, videoUri });
            }
          } catch(e) {
            alert("Analysis failed: " + e.message);
            setIsRecording(false);
            setIsAnalyzing(false);
            setStatus("Ready to scan");
          }
          
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start(500); // 500ms timeslices for robust chunking
      } catch (e) {
        alert("Web recording failed: " + e.message);
        setIsRecording(false);
        setStatus("Ready to scan");
      }
      return;
    }

    if (cameraRef.current) {
      setIsRecording(true);
      setRecordingStartTime(Date.now());
      setStatus("Recording facial markers...");
      
      try {
        const videoRecordPromise = cameraRef.current.recordAsync();
        const videoData = await videoRecordPromise;
        
        const actualDuration = Math.max(1, Math.round((Date.now() - recordingStartTime) / 1000));
        
        setIsRecording(false);
        setIsAnalyzing(true);
        setStatus("Analyzing AI micro-expressions & tone...");
        
        const result = await analyzeEmotionVideo(videoData.uri, actualDuration, "Neutral");
        
        if (onComplete) {
          onComplete({ ...result, videoUri: videoData.uri });
        }
      } catch (e) {
        alert("Recording failed: " + e.message);
        setIsRecording(false);
        setIsAnalyzing(false);
        setStatus("Ready to scan");
      }
    }
  };

  if (!cameraPermission || !microphonePermission) {
    return <View style={[S.root, { backgroundColor: T.bg, justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color={T.accent} /></View>;
  }

  return (
    <View style={[S.root, { backgroundColor: T.bg }]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[isDarkMode ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.10)", "transparent"]}
          style={{ position: "absolute", top: -60, left: -60, width: 380, height: 380, borderRadius: 190 }}
        />
      </View>

      <View style={S.header}>
        <Pressable style={S.backBtn} onPress={onBack}>
          <Text style={S.backIcon}>←</Text>
        </Pressable>
        <Text style={S.headerTitle}>⚙ EmotionPrint</Text>
      </View>

      <View style={S.content}>
        <View style={S.radarWrap}>
          <Animated.View style={[S.radarRing, { backgroundColor: isRecording ? 'rgba(244, 63, 94, 0.2)' : T.surface, transform: [{ scale: pulseAnim }] }]} />
          
          <View style={[S.cameraFrame, { backgroundColor: T.surface2, borderColor: isRecording ? T.rose : T.border, borderWidth: 2 }]}>
            {cameraPermission.granted ? (
              <CameraView 
                ref={cameraRef}
                style={StyleSheet.absoluteFill} 
                facing="front"
                mode="video"
                mute={false}
              />
            ) : (
              <Text style={S.cameraIcon}>📷</Text>
            )}
            {isAnalyzing && (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={T.accent} />
              </View>
            )}
          </View>
        </View>

        <Text style={[S.statusText, { color: T.text }]}>{status}</Text>
        <Text style={[S.subText, { color: T.muted }]}>
          {isRecording ? 'Look at the camera and speak naturally. Click Stop when finished.' : isAnalyzing ? 'Processing OpenCV and Librosa pipeline...' : 'Capture your real-time emotional state using our ML vision models.'}
        </Text>
        
        <View style={{ width: '100%', marginTop: 20 }}>
          <Pressable 
            style={[S.scanBtnWrap, (isAnalyzing || (!cameraPermission.granted)) && { opacity: 0.5 }]} 
            onPress={handleRecord}
            disabled={isAnalyzing || !cameraPermission.granted}
          >
            <LinearGradient
              colors={isRecording ? [T.rose, '#e11d48'] : [T.accent, T.accentEnd]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={S.scanBtn}
            >
              <Text style={S.scanBtnText}>
                {isRecording ? 'Stop Recording' : isAnalyzing ? 'Analyzing...' : 'Start Scan'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const getStyles = (T) => StyleSheet.create({
  root: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 72 : 56, 
    paddingBottom: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: T.border 
  },
  backBtn: { 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    backgroundColor: T.surface, 
    borderWidth: 1, 
    borderColor: T.border, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 16 
  },
  backIcon: { fontSize: 18, color: T.text, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: T.text },

  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, marginTop: -40, maxWidth: 600, width: '100%', alignSelf: 'center' },
  
  radarWrap: { width: '100%', aspectRatio: 4 / 3, alignItems: 'center', justifyContent: 'center', marginBottom: 40, position: 'relative' },
  radarRing: { position: 'absolute', width: '100%', aspectRatio: 4 / 3, borderRadius: 28 },
  cameraFrame: { width: '100%', aspectRatio: 4 / 3, borderRadius: 24, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cameraIcon: { fontSize: 50 },

  statusText: { fontSize: 24, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  subText: { fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20, marginBottom: 30 },

  scanBtnWrap: { borderRadius: 16, overflow: 'hidden', width: '100%' },
  scanBtn: { paddingVertical: 18, alignItems: 'center', width: '100%' },
  scanBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.5 }
});

export default EmotionPrintInputScreen;
