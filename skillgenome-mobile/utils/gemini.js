import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

const getLocalBackendUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8000`;
  }
  const debuggerHost = Constants.expoConfig?.hostUri;
  const fallbackIp = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  const finalIp = debuggerHost ? debuggerHost.split(':')[0] : fallbackIp;
  return `http://${finalIp}:8000`;
};

const API_KEYS = {
  RESUME: process.env.EXPO_PUBLIC_GEMINI_RESUME_KEY || '',
  CHAT: process.env.EXPO_PUBLIC_GEMINI_CHAT_KEY || '',
  AUDIO: process.env.EXPO_PUBLIC_GEMINI_AUDIO_KEY || ''
};

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

export const generateGeminiResponse = async (history = [], newMessage = "", attachments = [], customKey = null, isJson = false) => {
  const keysToTry = customKey && customKey.trim() !== "" ? [customKey] : Object.values(API_KEYS);
  
  try {
    const contents = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text || "Hello" }]
    }));
    
    // Build the latest user message
    const currentParts = [];
    if (newMessage && newMessage.trim() !== "") {
      currentParts.push({ text: newMessage });
    }
    
    // Handle attachments (images, audio, docs)
    attachments.forEach(file => {
       if (file.base64 && file.mimeType) {
         currentParts.push({
           inlineData: {
             data: file.base64,
             mimeType: file.mimeType
           }
         });
       } else if (file.text) {
         // If it's a parsed text document
         currentParts.push({ text: `[Attached Document Content]:\n${file.text}` });
       }
    });

    if (currentParts.length === 0 && attachments.length > 0) {
      currentParts.push({ text: "Please process the attached audio or image." });
    } else if (currentParts.length === 0) {
       currentParts.push({ text: "Hello" });
    }

    contents.push({ role: 'user', parts: currentParts });

    const generationConfig = { temperature: isJson ? 0.2 : 0.7 };
    let lastError = null;

    for (const apiKey of keysToTry) {
      try {
        const isOAuth = apiKey.startsWith('AQ.') || apiKey.startsWith('ya29.');
        const url = isOAuth ? GEMINI_API_URL : `${GEMINI_API_URL}?key=${apiKey}`;
        const headers = { 'Content-Type': 'application/json' };
        
        if (isOAuth) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            contents,
            generationConfig
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`Gemini API Error with key ${apiKey.substring(0, 5)}... Status: ${response.status}`);
          lastError = new Error(`Gemini Error: ${response.status} ${errText}`);
          
          if (response.status === 503 || response.status === 429) {
            continue; // Try next key
          }
          // Continue even for 400 errors to allow testing the next key
          continue; 
        }

        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
          return data.candidates[0].content.parts[0].text;
        }
        return "I'm sorry, I couldn't generate a response.";
      } catch (err) {
        lastError = err;
        // Continue to next key on network errors
      }
    }
    
    if (isJson) throw lastError;
    return `Error connecting to AI Mentor: ${lastError?.message}`;
    
  } catch (error) {
    console.error("Gemini Request Failed:", error);
    if (isJson) throw error;
    return `Error connecting to AI Mentor: ${error.message}`;
  }
};

export const transcribeAudio = async (base64Audio, mimeType, customKey = null) => {
  const keysToTry = customKey && customKey.trim() !== "" ? [customKey] : Object.values(API_KEYS);
  try {
    const contents = [{
      role: 'user',
      parts: [
        { text: "Transcribe the following audio accurately. Output ONLY the transcription, nothing else." },
        { inlineData: { data: base64Audio, mimeType: mimeType } }
      ]
    }];

    let lastError = null;
    for (const apiKey of keysToTry) {
      try {
        const isOAuth = apiKey.startsWith('AQ.') || apiKey.startsWith('ya29.');
        const url = isOAuth ? GEMINI_API_URL : `${GEMINI_API_URL}?key=${apiKey}`;
        const headers = { 'Content-Type': 'application/json' };
        
        if (isOAuth) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({ contents, generationConfig: { temperature: 0.2 } })
        });

        if (!response.ok) {
          const errText = await response.text();
          lastError = new Error(`Transcription failed: ${response.status}`);
          if (response.status === 503 || response.status === 429) continue;
          throw lastError;
        }

        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
          return data.candidates[0].content.parts[0].text.trim();
        }
        return "";
      } catch (err) {
        lastError = err;
      }
    }
    console.error("Transcription Error:", lastError);
    return "";
  } catch (err) {
    console.error("Transcription Error:", err);
    return "";
  }
};

export const analyzeThoughtPrint = async (sessionData) => {
  try {
    const text = sessionData.open_reflection || "No reflection provided.";
    const moodScore = sessionData.q2_stress_score || 5;
    
    const prompt = `You are an elite Cognitive Analyst AI inside SkillGenome OS.
Analyze the user's thought process and mindset based on their responses.

User's self-reported stress/mood level (1-10, 10=Stressed): ${moodScore}
User's raw answers and text reflections:
"${text}"

Provide a highly accurate, dynamic psychological profile. Do not use generic fallback scores.
If they wrote very little or nothing, give them a low score (e.g., 20-40) and constructive feedback on needing more input.
Output ONLY a valid JSON object matching this schema exactly:
{
  "cognitive_style": "Analytical | Strategic | Creative | Empathetic",
  "overall_score": 85, // 0-100 Adaptability/Resilience Score
  "stress_score": 45, // 0-100 based on text/mood
  "confidence_score": 82, // 0-100 
  "burnout_risk": "High | Medium | Low",
  "positive_sentiment": 70, // 0-100
  "dominant_themes": ["Tag1", "Tag2"],
  "ai_insight": "Detailed 2-sentence psychological insight.",
  "genome_update": { "IQ": 2, "CS": 1 }
}`;

    const responseText = await generateGeminiResponse([], prompt, [], null, true);
    
    try {
      const jsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const data = JSON.parse(jsonStr);
      
      return {
        cognitive_style: data.cognitive_style || "Analytical",
        overall_score: data.overall_score || 50,
        stress_score: data.stress_score || 50,
        confidence_score: data.confidence_score || 50,
        burnout_risk: data.burnout_risk || "Medium",
        positive_sentiment: data.positive_sentiment || 50,
        dominant_themes: data.dominant_themes || ["Reflection"],
        ai_insight: data.ai_insight || "Analysis complete.",
        genome_update: data.genome_update || { "IQ": 1, "CS": 1 }
      };
    } catch (parseErr) {
      throw new Error("Failed to parse ThoughtPrint JSON: " + responseText);
    }
    
  } catch (err) {
    console.error("Gemini API failed for ThoughtPrint:", err);
    // Extreme fallback if offline
    return {
      cognitive_style: "Analytical",
      overall_score: 40,
      stress_score: 50,
      confidence_score: 40,
      burnout_risk: "Medium",
      positive_sentiment: 50,
      dominant_themes: ["Offline"],
      ai_insight: "Network offline. Could not reach Gemini AI.",
      genome_update: { "IQ": 1, "CS": 1 }
    };
  }
};

export const analyzeEmotionPrint = async (emotionData) => {
  try {
    const backendUrl = getLocalBackendUrl();
    
    // Check if emotionData contains the dummy base64 or actual data. 
    // We send it to backend api/emotion/analyze which expects a LiveEmotionPayload (base64_image).
    // If emotionData isn't base64, we might just pass a dummy base64 string.
    const base64_image = typeof emotionData === 'string' ? emotionData : "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    
    const response = await fetch(`${backendUrl}/api/emotion/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64_image })
    });
    
    if (!response.ok) {
      throw new Error("Emotion backend failed");
    }
    
    const data = await response.json();
    return {
      ai_feedback: data.message || `Primary emotion detected as ${data.primary_emotion}. Keep up the good energy!`,
      genome_update: { "EQ": 2, "CQ": 1 }
    };
  } catch (err) {
    console.error("Local Emotion API failed, falling back to Gemini logic:", err);
    
    // Fallback logic
    const prompt = `You power the EmotionPrint module inside SkillGenome OS.
The user's camera/voice just scanned the following real-time emotional state:
${JSON.stringify(emotionData, null, 2)}

Provide feedback on their composure and readiness. Output ONLY a valid JSON object matching this schema:
{
  "ai_feedback": "Detailed feedback on confidence, voice clarity, and stress.",
  "genome_update": { "EQ": 2, "CQ": 1 }
}`;

    const responseText = await generateGeminiResponse([], prompt, [], null, true);
    try {
      const jsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(jsonStr);
    } catch (parseErr) {
      throw new Error("Failed to parse EmotionPrint JSON: " + responseText);
    }
  }
};

export const analyzeEmotionVideo = async (videoUri, duration = 5, mood = "Happy") => {
  try {
    const backendUrl = getLocalBackendUrl();
    const formData = new FormData();
    
    if (Platform.OS === 'web' && videoUri && videoUri.startsWith("blob:")) {
      const responseBlob = await fetch(videoUri);
      const blobData = await responseBlob.blob();
      formData.append('file', blobData, 'emotion_scan.webm');
    } else {
      formData.append('file', {
        uri: videoUri,
        name: 'emotion_scan.mp4',
        type: 'video/mp4'
      });
    }

    formData.append('duration', String(duration));
    formData.append('mood', mood);

    const response = await fetch(`${backendUrl}/api/analyze-emotion`, {
      method: "POST",
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Emotion backend failed: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      eq_score: data.eq_score || data.sentiment || 75,
      dominant_emotions: data.emotions ? {
        happy: data.emotions.happy / 100,
        sad: data.emotions.sad / 100,
        anger: data.emotions.anger / 100,
        fear: data.emotions.fear / 100,
        surprise: data.emotions.surprise / 100,
        neutral: data.emotions.neutral / 100
      } : { 
        happy: 0.5, neutral: 0.3, stressed: 0.1, surprised: 0.05, sad: 0.05 
      },
      voice_confidence: (data.voiceAnalysis && data.voiceAnalysis.confidence) ? data.voiceAnalysis.confidence : "Moderate",
      calm_coach_trigger: (data.voiceAnalysis && data.voiceAnalysis.stressRaw > 65),
      ai_insight: data.ai_feedback || data.aiFeedback || "Analysis complete.",
      genome_update: { "EQ": 2, "CQ": 1 }
    };
  } catch (err) {
    console.error("Local Emotion API failed, falling back to dummy data:", err);
    return {
      eq_score: 82,
      dominant_emotions: { happy: 0.6, neutral: 0.3, stressed: 0.1 },
      voice_confidence: "High",
      calm_coach_trigger: false,
      ai_insight: "Network offline. Generated dummy insight based on facial tracking attempt.",
      genome_update: { "EQ": 1, "CQ": 1 }
    };
  }
};

export const transcribeAudioClientSide = async (uri, mimeType = "audio/m4a", blobData = null) => {
  try {
    let base64Audio = "";
    if (Platform.OS === 'web' && blobData) {
      base64Audio = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result;
          const b64 = result.split(',')[1];
          resolve(b64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blobData);
      });
    } else {
      base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
    return await transcribeAudio(base64Audio, mimeType);
  } catch (err) {
    console.error("Client-side transcription error:", err);
    return "";
  }
};

export const generateInterviewResponse = async (chatHistory, role) => {
    const prompt = `You are an expert AI Recruiter for a top-tier company interviewing a candidate for a ${role} position.
Review the candidate's last answer in the chat history. Provide a brief critique (YOUR DELIVERY ANALYSIS) focusing on the content of their answer, followed by a new, relevant follow-up question. 
Output ONLY a valid JSON object matching this schema exactly:
{
  "analysis": "YOUR DELIVERY ANALYSIS\\n\\n💡 Tip: <1-sentence tip>",
  "next_question": "The actual question string"
}`;

    const formattedHistory = chatHistory
       .filter(msg => msg.role !== 'analysis')
       .map(msg => ({
           sender: msg.role === 'ai' ? 'model' : 'user',
           text: msg.text
       }));
       
    const responseText = await generateGeminiResponse(formattedHistory, prompt, [], null, true);
    try {
      const jsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      return {
         analysis: "YOUR DELIVERY ANALYSIS\\n\\n💡 Tip: Good attempt, but ensure clarity in your next response.",
         next_question: "Let's move on. Could you tell me about a time you had to resolve a conflict in a team?"
      };
    }
};
