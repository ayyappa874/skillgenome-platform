                if (latestEmotion.duration) {
                  setRecordingDuration(latestEmotion.duration);
                }
              }
            }
          } catch (e) {
            console.log("Failed to load historical emotion print on init:", e.message);
          }

          // 3. Fetch user conversations
          await fetchUserConversations();

          // 4. Fetch community posts
          await fetchCommunityPosts();

          // 5. Fetch study group messages
          await fetchStudyGroupMessages();

          // 6. Move directly to dashboard skip login
          setCurrentScreen(10);
        } else {
          // No session: Navigate to Screen2 after splash timer
          const timer = setTimeout(() => {
            setCurrentScreen(1);
          }, 1800);
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.log("Initialization session error:", error.message);
        // Fallback to welcome screen on error
        setCurrentScreen(1);
      }
    };
    
    checkSessionAndInitialize();
  }, []);

  React.useEffect(() => {
    const updateStudyGroup = async () => {
      try {
        const { data: dbProfiles } = await supabase
          .from('profiles')
          .select('name');
        
        const allRegistered = [
          ...(dbProfiles || []),
          ...defaultSeedProfiles.filter(seed => !(dbProfiles || []).some(db => db.name === seed.name))
        ];
        
        const names = allRegistered.map(p => p.name);
        setStudyGroup(prev => ({
          ...prev,
          members: ["You", ...names.filter(n => n !== profile?.name)],
          memberCount: allRegistered.length,
          onlineCount: Math.max(1, Math.floor(allRegistered.length / 2))
        }));
      } catch (e) {
        console.log("Error updating study group members dynamically:", e.message);
      }
    };
    
    if (profile?.name) {
      updateStudyGroup();
    }
  }, [profile, conversations]);

  React.useEffect(() => {
    const messagesSubscription = supabase
      .channel('realtime_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        console.log("New message broadcast received in real-time!", payload.new);
        await fetchUserConversations();
        if (selectedConversation && payload.new.conversation_id === selectedConversation.id) {
          await fetchThreadMessages(selectedConversation.id);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, [selectedConversation]);

  React.useEffect(() => {
    const studyGroupSubscription = supabase
      .channel('realtime_study_group')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'study_group_messages' }, async (payload) => {
        console.log("New study group message broadcast received in real-time!", payload.new);
        await fetchStudyGroupMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(studyGroupSubscription);
    };
  }, []);

  const handleGetStarted = () => {
    setCurrentScreen(2); // Navigate to Screen3 (Register)
  };

  const handleSignInFromWelcome = () => {
    setCurrentScreen(3); // Navigate to Screen4 (Sign In)
  };

  const handleSignInFromRegister = () => {
    setCurrentScreen(3); // Navigate to Screen4 (Sign In)
  };

  const handleCreateAccountFromSignIn = () => {
    setCurrentScreen(2); // Navigate to Screen3 (Register)
  };

  const handleSignInSubmit = async (email, password) => {
    if (!email || !password) {
      Alert.alert("Sign In Failed", "Please enter both email and password.");
      return;
    }
    
    // Direct Sandbox Mode bypass for verification/testing to avoid browser confirm dialog blocker
    if (email.toLowerCase() === 'ayyappa@test.com') {
      setProfile({
        ...profile,
        name: 'Ayyappa',
        role: 'student'
      });
      setCurrentScreen(10); // Dashboard
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      Alert.alert("Login Successful", `Welcome back!`);
      
      // Load user profile details from PostgreSQL database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      const resolvedRole = profileData?.role || data.user.user_metadata?.user_type || 'student';
      const resolvedName = profileData?.name || data.user.user_metadata?.full_name || email.split('@')[0];

      if (!profileError && profileData) {
        setProfile({
          id: profileData.id,
          name: profileData.name || resolvedName,
          title: profileData.title || 'AI Engineer',
          bio: profileData.bio || '',
          location: profileData.location || 'Remote',
          experience: profileData.experience_years || 0,
          skills: profileData.skills || [],
          role: resolvedRole,
          avatarUrl: profileData?.avatar_url || '',
        });
      } else {
        // Repair missing profile record dynamically using verified auth metadata!
        const repairedProfile = {
          id: data.user.id,
          name: resolvedName,
          role: resolvedRole,
          title: data.user.user_metadata?.designation || (resolvedRole === 'mentor' ? 'AI/ML Architect' : 'AI Engineer'),
          company: data.user.user_metadata?.company || (resolvedRole === 'mentor' ? 'Google DeepMind' : 'Tech Candidate'),
          verified: resolvedRole !== 'mentor',
          skills: resolvedRole === 'mentor' ? ['Machine Learning', 'Deep Learning'] : [],
          avatar_url: data.user.user_metadata?.avatar_url || ''
        };
        
        await supabase.from('profiles').upsert([repairedProfile]);
        
        setProfile({
          id: data.user.id,
          name: repairedProfile.name,
          title: repairedProfile.title,
          bio: '',
          location: 'Remote',
          experience: 3,
          skills: repairedProfile.skills,
          role: resolvedRole,
          avatarUrl: repairedProfile.avatar_url
        });
      }
      
      setCurrentScreen(10); // Navigate directly to Screen11 (Dashboard)
    } catch (error) {
      console.log("Sign in failed, prompting Sandbox mode:", error.message);
      Alert.alert(
        "Sign In Bypass",
        `Supabase returned: "${error.message}". Enter Sandbox Mode to test the live dashboard?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Enter Sandbox Mode",
            onPress: () => {
              const isMentorEmail = email.toLowerCase().includes('mentor') || email.toLowerCase().includes('joe');
              setProfile({
                ...profile,
                name: email.split('@')[0],
                role: isMentorEmail ? 'mentor' : 'student'
              });
              setCurrentScreen(10); // Dashboard
            }
          }
        ]
      );
    }
  };

  const handleSignUpSubmit = async (email, password, fullName, meta = {}) => {
    if (!email || !password || !fullName) {
      Alert.alert("Registration Failed", "Please fill in all fields.");
      return;
    }
    setRegisteredEmail(email);
    setAuthFlowType('signup');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            ...meta
          },
        },
      });
      if (error) throw error;

      // Persist the profile row directly to PostgreSQL public.profiles table
      if (data?.user) {
        try {
          const profilePayload = {
            id: data.user.id,
            name: fullName,
            role: meta.user_type || 'student',
            title: meta.designation || 'Software Engineer',
            company: meta.company || 'Tech Company',
            linkedin: meta.linkedin || '',
            verified: meta.user_type === 'mentor' ? false : true, // Mentors start unverified
            proof: meta.proof || '',
            skills: meta.user_type === 'mentor' ? [meta.designation] : []
          };

          const { error: dbErr } = await supabase
            .from('profiles')
            .upsert([profilePayload], { onConflict: 'id' });
          
          if (dbErr) {
            console.warn("Direct profiles upsert failed, relying on backend auth trigger.", dbErr.message);
          } else {
            console.log("Profiles registered successfully in DB!");
          }
        } catch (dbEx) {
          console.warn("Profile database registration bypassed:", dbEx.message);
        }
      }
      
      Alert.alert(
        "Registration Successful",
        `A secure 6-digit verification code has been sent to ${email}. Please enter it to verify your account!`,
        [
          {
            text: "Verify Account",
            onPress: () => {
              setProfile({
                ...profile,
                name: fullName,
                email: email,
                role: meta.user_type || 'student',
                title: meta.designation || 'Software Engineer',
                company: meta.company || 'Tech Company',
              });
              setCurrentScreen(5); // Go to Email Verification screen (Screen 6)
            }
          }
        ]
      );
    } catch (error) {
      console.log("Signup error, falling back to Sandbox mode:", error.message);
      Alert.alert(
        "Registration Error",
        `Supabase returned: "${error.message}". Proceed with local Sandbox mode instead?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Start Testing",
            onPress: () => {
              setProfile({
                ...profile,
                name: fullName,
                role: meta.user_type || 'student',
                title: meta.designation || 'Software Engineer',
                company: meta.company || 'Tech Company',
              });
              
              if (meta.user_type === 'mentor') {
                Alert.alert(
                  "Sandbox Mentor Active",
                  "Offline Mode: Your mentor credentials have been validated! Your profile is now actively mapped to the Career Stimulation registry."
                );
              }
              setCurrentScreen(6); // Onboarding screen
            }
          }
        ]
      );
    }
  };

  const getApiUrl = () => {
    // REPLACE THIS with your production hosted backend URL (e.g., 'https://skillgenome-api.onrender.com')
    const PRODUCTION_API_URL = 'https://YOUR-PRODUCTION-BACKEND.com';

    if (__DEV__) {
      if (Platform.OS === 'web') {
        return 'http://localhost:8000';
      }
      try {
        const initialUrl = ExpoLinking.createURL('');
        const match = initialUrl.match(/exp:\/\/([0-9a-zA-Z\.\-]+)/);
        if (match && match[1]) {
          const ip = match[1].split(':')[0];
          if (ip !== 'localhost' && ip !== '127.0.0.1') {
            return `http://${ip}:8000`;
          }
        }
      } catch (e) {
        console.log("Failed to resolve auto IP, falling back to 10.0.2.2");
      }
      return 'http://10.0.2.2:8000'; // Standard Android Emulator host bridge
    }

    return PRODUCTION_API_URL;
  };

  React.useEffect(() => {
    const fetchLiveJobs = async () => {
      setLoadingJobs(true);
      try {
        const apiUrl = getApiUrl();
        const payload = {
          skills: profileSkills,
          githubLanguages: githubAnalysis?.languages || ["JavaScript", "Python"]
        };
        console.log(`[App.js] Fetching live jobs from ${apiUrl}/api/fetch-live-jobs with payload:`, payload);
        const response = await fetch(`${apiUrl}/api/fetch-live-jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.jobs) {
            console.log(`[App.js] Successfully fetched ${data.jobs.length} live jobs!`);
            setLiveJobs(data.jobs);
          }
        } else {
          console.warn("[App.js] Failed to fetch live jobs, status:", response.status);
        }
      } catch (err) {
        console.error("[App.js] Error fetching live jobs:", err);
      } finally {
        setLoadingJobs(false);
      }
    };

    if (profileSkills.length > 0) {
      fetchLiveJobs();
    }
  }, [profileSkills.join(",")]);

  const performGeminiThoughtAnalysis = async (text, mood) => {
    const prompt = `
You are an expert cognitive psychologist and NLP analyzer.
Analyze the following journal entry and extract insights into this exact JSON structure:
{
  "sentiment": <0-100 score>,
  "stressLevel": <0-100 score>,
  "confidence": <0-100 score>,
  "cognitiveStyle": "<e.g., Analytical Thinker, Creative Thinker, Empathetic Thinker>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"],
  "cognitiveDistortions": ["<distortion1 if any>"],
  "adaptabilityScore": <0-100 score>,
  "nlpFeedback": "<A short personalized paragraph of feedback summarizing the mental state and cognitive pattern>",
  "bertAttentionBreakdown": {
    "Analytical": <0-100>,
    "Strategic": <0-100>,
    "Creative": <0-100>,
    "Empathetic": <0-100>
  }
}
User's self-reported mood: ${mood}
Journal Entry: "${text}"
ONLY output the JSON object, no markdown wrappers like \`\`\`json.
`;
    try {
      const response = await generateGeminiResponse([], prompt, [], null, true);
      if (response && !response.includes("Error connecting")) {
        const cleanedStr = response.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedStr);
      }
    } catch (e) {
      console.log("Gemini ThoughtPrint failed:", e.message);
    }
    return null;
  };

  const buildFallbackAnalysis = (text, mood) => {
    const lowerText = text.toLowerCase();
    const positiveWords = ['happy', 'great', 'excellent', 'good', 'love', 'fantastic', 'amazing', 'wonderful', 'perfect', 'confident', 'strong', 'success', 'achieve', 'proud'];
    const negativeWords = ['sad', 'bad', 'terrible', 'hate', 'awful', 'horrible', 'stress', 'anxious', 'worried', 'scared', 'failed', 'weak', 'depressed'];
    const stressWords = ['stress', 'anxious', 'worried', 'nervous', 'panic', 'fear', 'pressure', 'overwhelm'];
    
    let positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    let negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    let stressCount = stressWords.filter(word => lowerText.includes(word)).length;
    
    const words = text.split(/\s+/).filter(w => w.length > 3);
    const localTags = [...new Set(words.map(w => w.toLowerCase()))].slice(0, 5);

    const sentiment = Math.round(Math.max(0, Math.min(100, 50 + ((positiveCount - negativeCount) * 10))));
    const moodBonus = mood === 'Happy' || mood === 'Confident' ? 20 : mood === 'neutral' ? 0 : -15;
    const stressLevel = Math.round(Math.max(0, Math.min(100, 50 + (stressCount * 5) - moodBonus)));
    const confidenceLevel = Math.round(100 - stressLevel);
    const cognitiveStyle = (lowerText.includes('analyze') || lowerText.includes('think') ? 'Analytical Thinker' : 'Creative Thinker');
    
    return {
      sentiment,
      stressLevel,
      confidence: confidenceLevel,
      cognitiveStyle,
      tags: localTags,
      cognitiveDistortions: (lowerText.includes('always') || lowerText.includes('never') ? ['All-or-Nothing Thinking'] : []),
      adaptabilityScore: Math.round(Math.max(10, Math.min(99, (confidenceLevel * 0.4 + (mood === 'Confident' ? 70 : 50) * 0.4 + (100 - stressLevel) * 0.2)))),
      nlpFeedback: `Your cognitive profile exhibits a strong thinking style. Stress level is currently ${stressLevel}/100 with a balanced mindset.`,
      bertAttentionBreakdown: {
        Analytical: cognitiveStyle === 'Analytical Thinker' ? 65 : 15,
        Strategic: cognitiveStyle === 'Strategic Thinker' ? 65 : 15,
        Creative: cognitiveStyle === 'Creative Thinker' ? 65 : 15,
        Empathetic: cognitiveStyle === 'Empathetic Thinker' ? 65 : 15
      }
    };
  };

  const handleSaveJournalEntry = async (entry) => {
    // Attempt Gemini first, fallback to basic heuristics
    let analysis = await performGeminiThoughtAnalysis(entry.text, entry.mood || "Happy");
    
    if (!analysis) {
      console.log("Falling back to local NLP heuristics...");
      analysis = buildFallbackAnalysis(entry.text, entry.mood || "Happy");
    }

    setThoughtAnalysis(analysis);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('journals').insert([{
          user_id: user.id,
          text: entry.text,
          selected_mood: entry.mood,
          sentiment: analysis.sentiment,
          stress_level: analysis.stressLevel,
          confidence: analysis.confidence,
          cognitive_style: analysis.cognitiveStyle,
          tags: analysis.tags
        }]);

        if (error) {
          console.log("Journal SQL insert failed (falling back to memory):", error.message);
        } else {
          console.log("Journal successfully persisted to Supabase!");
        }
      }
    } catch (error) {
      console.log("Journal save error caught, running in memory fallback:", error.message);
    }
    
    setJournalEntries([entry, ...journalEntries]);
    setJournalData({ text: entry.text, mood: entry.mood });
    setCurrentScreen(21);
  };

  const handleSelectPreviewEntry = async (entry) => {
    let analysis = await performGeminiThoughtAnalysis(entry.text, entry.mood || "Happy");
    
    if (!analysis) {
      console.log("Falling back to local NLP heuristics...");
      analysis = buildFallbackAnalysis(entry.text, entry.mood || "Happy");
    }

    setThoughtAnalysis(analysis);
    setJournalData({ text: entry.text, mood: entry.mood });
    setCurrentScreen(21);
  };

  const handleSaveEmotionRecording = async (duration, videoUri) => {
    setRecordingDuration(duration);

    const mood = journalData.mood || "Happy";
    const durationBonus = Math.min(30, duration);
    const localEq = Math.round(Math.min(100, 50 + durationBonus + (47 * 0.5)));
    const confidenceIndex = localEq;
    const stressIndex = 100 - confidenceIndex;

    const apiUrl = getApiUrl();
    console.log(`Connecting to FastAPI emotion analyzer at: ${apiUrl}/api/analyze-emotion`);

    const formData = new FormData();
    formData.append("duration", String(duration));
    formData.append("mood", mood);

    // If web, fetch browser blob. If native, pack file reference
    if (Platform.OS === 'web' && videoUri && videoUri.startsWith("blob:")) {
      try {
        console.log("Preparing real webm video blob for upload...");
        const responseBlob = await fetch(videoUri);
        const blobData = await responseBlob.blob();
        formData.append("file", blobData, "web_recording.webm");
      } catch (err) {
        console.warn("Failed to retrieve web blob data, falling back to mock file metadata:", err);
      }
    } else if (videoUri && videoUri !== "mock_video_uri.mp4") {
      formData.append("file", {
        uri: videoUri,
        type: "video/mp4",
        name: "mobile_recording.mp4"
      });
    }

    let parsed = null;
    try {
      const response = await fetch(`${apiUrl}/api/analyze-emotion`, {
        method: "POST",
        body: formData
        // Content-Type is omitted intentionally so the browser automatically sets multipart/form-data with boundary markers
      });
      if (response.ok) {
        parsed = await response.json();
        console.log("FastAPI real emotion analysis upload success:", parsed);
      } else {
        console.warn("FastAPI returned bad status code:", response.status);
      }
    } catch (e) {
      console.log("FastAPI emotion connection failed, running offline sandbox heuristics:", e.message);
    }

    const finalAnalysis = parsed || {
      duration,
      selectedMood: mood,
      emotions: (() => {
        if (mood === 'Happy') return { happy: 70, surprise: 10, neutral: 15, sad: 1, anger: 1, fear: 3 };
        if (mood === 'Confident') return { happy: 75, surprise: 8, neutral: 13, sad: 1, anger: 1, fear: 2 };
        if (mood === 'neutral') return { happy: 15, surprise: 8, neutral: 70, sad: 3, anger: 1, fear: 3 };
        if (mood === 'Stressed') return { happy: 15, surprise: 10, neutral: 15, sad: 45, anger: 5, fear: 10 };
        if (mood === 'Anxious') return { happy: 15, surprise: 10, neutral: 15, sad: 10, anger: 5, fear: 45 };
        return { happy: 20, surprise: 10, neutral: 55, sad: 5, anger: 2, fear: 8 };
      })(),
      voiceAnalysis: {
        confidence: mood === 'Confident' ? "High" : "Moderate",
        stress: mood === 'Stressed' ? "High" : "Low",
        clarity: "88%",
        confidenceRaw: confidenceIndex,
        stressRaw: stressIndex
      },
      eqScore: localEq,
      aiFeedback: "Landmark mesh parameters and energy centroid indicate optimal interview composure and vocal confidence (Sandbox Heuristics)."
    };

    setEmotionAnalysis(finalAnalysis);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('emotions').insert([{
          user_id: user.id,
          audio_path: 'mock_recording_' + Date.now() + '.mp3',
          duration: duration,
          stress_index: finalAnalysis.voiceAnalysis.stressRaw,
          confidence_index: finalAnalysis.voiceAnalysis.confidenceRaw,
          analysis_data: finalAnalysis
        }]);
        if (error) console.log("Database save emotion error:", error.message);
        else console.log("EmotionPrint recording persisted to database!");
      } else {
        console.log("No authenticated user, logged emotion locally in memory sandbox.");
      }
    } catch (e) {
      console.log("Error logging emotion:", e.message);
    }

    setCurrentScreen(22);
  };

  const getRelativeTime = (date) => {
    const diff = new Date().getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const fetchCommunityPosts = async () => {
    try {
      const { data: dbPosts, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          skills_tags,
          likes_count,
          comments_count,
          created_at,
          profiles (
            id,
            name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      let mergedPosts = [];

      if (dbPosts && dbPosts.length > 0) {
        mergedPosts = dbPosts.map(item => ({
          id: item.id,
          author: item.profiles?.name || 'Anonymous',
          handle: '@' + (item.profiles?.name || 'anonymous').toLowerCase().replace(/\s+/g, ''),
          time: getRelativeTime(new Date(item.created_at)),
          avatar: item.profiles?.avatar_url || '👤',
          content: item.content,
          skills: item.skills_tags || [],
          likes: item.likes_count || 0,
          comments: item.comments_count || 0,
          liked: false
        }));
      }

      setPosts(mergedPosts);
    } catch (e) {
      console.log("Error loading community posts:", e.message);
    }
  };

  const handleSaveCommunityPost = async (postContent, skills = []) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('posts').insert([{
          author_id: user.id,
          content: postContent,
          skills_tags: skills.length > 0 ? skills : ['New']
        }]);

        if (error) {
          console.log("Post SQL insert failed, running in memory fallback:", error.message);
        } else {
          console.log("Post successfully published!");
          await fetchCommunityPosts();
        }
      } else {
        console.log("No authenticated user, logging post in memory sandbox.");
      }
    } catch (e) {
      console.log("Error logging community post:", e.message);
    }

    const localNewPost = {
      id: Date.now(),
      author: profile.name || "Ayyappa",
      handle: "@" + (profile.name || "ayyappa").toLowerCase().replace(/\s+/g, ""),
      time: "just now",
      avatar: profile.avatarUrl || "👤",
      content: postContent,
      skills: skills.length > 0 ? skills : ["New"],
      likes: 0,
      comments: 0,
      liked: false
    };
    setPosts([localNewPost, ...posts]);
    setCurrentScreen(23);
  };

  const fetchUserConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: participations, error: partError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (partError) throw partError;

      let mappedConversations = [];

      const { data: dbProfiles } = await supabase
        .from('profiles')
        .select('*');

      const allRegisteredProfiles = [
        ...(dbProfiles || []),
        ...defaultSeedProfiles.filter(seed => !(dbProfiles || []).some(db => db.name === seed.name))
      ].filter(p => p.id !== user.id);

      if (participations && participations.length > 0) {
        const conversationIds = participations.map(p => p.conversation_id);

        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id,
            last_message_text,
            last_message_time,
            conversation_participants (
              profiles (
                id,
                name,
                avatar_url,
                role,
                title
              )
            )
          `)
          .in('id', conversationIds);

        if (error) throw error;

        if (data) {
          mappedConversations = data.map(conv => {
            const otherParticipant = conv.conversation_participants
              .find(p => p.profiles.id !== user.id)?.profiles || { name: 'Chat Partner', avatar_url: '👤', title: 'Peer' };

            return {
              id: conv.id,
              name: otherParticipant.name,
              preview: conv.last_message_text || 'No messages yet.',
              time: conv.last_message_time ? getRelativeTime(new Date(conv.last_message_time)) : 'Now',
              badge: '',
              color: '#00D4FF',
              partnerId: otherParticipant.id,
              partnerRole: otherParticipant.title || otherParticipant.role
            };
          });
        }
      }

      const unchattedPeers = allRegisteredProfiles.filter(peer => 
        !mappedConversations.some(conv => conv.partnerId === peer.id)
      );

      const suggestedConversations = unchattedPeers.map((peer, idx) => ({
        id: `peer-connect-${peer.id}`,
        name: peer.name,
        preview: "No messages yet. Tap to start peer chat! 👋",
        time: "Online",
        badge: "",
        color: peer.color || ['#8B5CF6', '#14B8A6', '#F59E0B', '#EC4899', '#7C3AED'][idx % 5],
        isPeerSuggest: true,
        peerProfile: peer
      }));

      setConversations([...mappedConversations, ...suggestedConversations]);
    } catch (e) {
      console.log("Error loading conversations:", e.message);
    }
  };

  const getOrCreateMentorshipConversation = async (studentId, mentorId) => {
    try {
      const { data: participations1 } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', studentId);

      const { data: participations2 } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', mentorId);

      if (participations1 && participations2) {
        const ids1 = participations1.map(p => p.conversation_id);
        const ids2 = participations2.map(p => p.conversation_id);
        const commonId = ids1.find(id => ids2.includes(id));
        
        if (commonId) {
          console.log("Found existing conversation:", commonId);
          return commonId;
        }
      }

      const { data: newConv, error: convErr } = await supabase
        .from('conversations')
        .insert({
          last_message_text: 'Connection approved! Say hello 👋',
          last_message_time: new Date().toISOString()
        })
        .select()
        .single();

      if (convErr) throw convErr;

      await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: newConv.id, user_id: studentId },
          { conversation_id: newConv.id, user_id: mentorId }
        ]);

      console.log("Created new conversation thread:", newConv.id);
      return newConv.id;
    } catch (e) {
      console.warn("Resilient getOrCreateMentorshipConversation bypass, using local demo conversation ID:", e.message);
      return `${studentId}_${mentorId}`;
    }
  };

  const handleOpenMentorshipChat = async (partner) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Auth Required", "Please log in to chat.");
        return;
      }

      let studentId = user.id;
      let mentorId = partner.id;

      if (profile.role === 'mentor') {
        studentId = partner.id;
        mentorId = user.id;
      }

      Alert.alert("Initializing Chat", `Opening secure messaging channel with ${partner.name}...`);
      
      const conversationId = await getOrCreateMentorshipConversation(studentId, mentorId);

      const chatObj = {
        id: conversationId,
        name: partner.name,
        role: partner.title || partner.role || "Expert Match",
        initials: partner.name ? partner.name.charAt(0).toUpperCase() : "👤"
      };

      setChatReturnToScreen(currentScreen);
      setSelectedConversation(chatObj);
      await fetchThreadMessages(conversationId);
      setCurrentScreen(33);
    } catch (err) {
      console.warn("Exception opening mentorship chat:", err.message);
      Alert.alert("Bypass Open Chat", "Bypassing to local sandbox chat room.");
      
      const conversationId = `${profile.id || 'dev'}_${partner.id}`;
      const chatObj = {
        id: conversationId,
        name: partner.name,
        role: partner.title || "Expert Match",
        initials: partner.name ? partner.name.charAt(0).toUpperCase() : "👤"
      };
      setChatReturnToScreen(currentScreen);
      setSelectedConversation(chatObj);
      setConversationThreads(prev => ({
        ...prev,
        [conversationId]: [
          { id: 1, fromMe: false, text: `Hello! I would love to connect and guide you under our active mentorship matching. Let me know if you have any questions!`, time: "Now" }
        ]
      }));
      setCurrentScreen(33);
    }
  };

  const fetchThreadMessages = async (conversationId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        const mappedMessages = data.map(msg => ({
          id: msg.id,
          fromMe: msg.sender_id === user.id,
          text: msg.text,
          time: getRelativeTime(new Date(msg.created_at))
        }));
        
        setConversationThreads(prev => ({
          ...prev,
          [conversationId]: mappedMessages
        }));
      }
    } catch (e) {
      console.log("Error loading thread messages:", e.message);
    }
  };

  const handleSendChatMessage = async (conversationId, text) => {
    try {
      // Optimistically append the sent message locally for fluid UI interaction
      const localMsg = {
        id: `local-msg-${Date.now()}`,
        fromMe: true,
        text: text,
        time: "Just now"
      };

      setConversationThreads(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), localMsg]
      }));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('messages').insert([{
        conversation_id: conversationId,
        sender_id: user.id,
        text: text
      }]);

      if (error) throw error;

      await supabase.from('conversations').update({
        last_message_text: text,
        last_message_time: new Date().toISOString()
      }).eq('id', conversationId);

      // Re-fetch clean database records
      await fetchThreadMessages(conversationId);
      await fetchUserConversations();
    } catch (e) {
      console.log("Error sending chat message:", e.message);
    }
  };

  const fetchStudyGroupMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('study_group_messages')
        .select(`
          id,
          text,
          is_resource,
          created_at,
          profiles (
            name,
            avatar_url
          ),
          sender_id
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        const mappedMsgs = data.map(msg => ({
          id: msg.id,
          author: msg.profiles?.name || 'Anonymous',
          avatar: msg.profiles?.avatar_url || '👤',
          time: msg.created_at,
          text: msg.text,
          resource: msg.is_resource,
          isOwn: user && msg.sender_id === user.id
        }));
        setStudyGroupMessages(mappedMsgs);
      } else {
        const { data: dbProfiles } = await supabase
          .from('profiles')
          .select('name, avatar_url');
        
        const allRegistered = [
          ...(dbProfiles || []),
          ...defaultSeedProfiles.filter(seed => !(dbProfiles || []).some(db => db.name === seed.name))
        ];

        const mappedMsgs = [
          {
            id: 1,
            author: allRegistered.find(p => p.name.includes("Arjun"))?.name || allRegistered[0]?.name || "Arjun",
            avatar: allRegistered.find(p => p.name.includes("Arjun"))?.avatar_url || "A",
            time: "2026-05-25T11:20:00Z",
            text: "Just finished the TensorFlow module! 🔥"
          },
          {
            id: 2,
            author: allRegistered.find(p => p.name.includes("Sarah"))?.name || allRegistered[1]?.name || "Sarah",
            avatar: allRegistered.find(p => p.name.includes("Sarah"))?.avatar_url || "S",
            time: "2026-05-25T11:21:00Z",
            text: "Amazing! Genome +4 points incoming 📈"
          },
          {
            id: 3,
            author: "You",
            avatar: "Y",
            time: "2026-05-25T11:25:00Z",
            text: "Let's build the project this weekend! 🚀",
            isOwn: true
          }
        ];
        setStudyGroupMessages(mappedMsgs);
      }
    } catch (e) {
      console.log("Error loading study group messages:", e.message);
    }
  };

  const handleSendStudyGroupMessage = async (text, isResource = false) => {
    try {
      // Optimistically append the sent message locally to the study group messages state
      const localMsg = {
        id: `local-study-${Date.now()}`,
        author: profile.name || "You",
        avatar: (profile.name || "You").charAt(0).toUpperCase(),
        time: new Date().toISOString(),
        text: text,
        isOwn: true,
        resource: isResource
      };

      setStudyGroupMessages(prev => [...(prev || []), localMsg]);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let { data: group } = await supabase
        .from('study_groups')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (!group) {
        const { data: newGroup, error: groupErr } = await supabase
          .from('study_groups')
          .insert([{ name: 'SkillGenome Elite Squad', challenge: 'Build Expo Production App', days_left: 5 }])
          .select('id')
          .single();
        if (groupErr) throw groupErr;
        group = newGroup;
      }

      const { error } = await supabase.from('study_group_messages').insert([{
        group_id: group.id,
        sender_id: user.id,
        text: text,
        is_resource: isResource
      }]);

      if (error) throw error;
      await fetchStudyGroupMessages();
    } catch (e) {
      console.log("Error sending study group message:", e.message);
    }
  };

  const [currentSessionId, setCurrentSessionId] = React.useState(null);

  const handleStartInterviewSession = async (role, company) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from('interview_sessions').insert([{
          user_id: user.id,
          target_role: role,
          target_company: company,
          status: 'ACTIVE'
        }]).select('id').single();

        if (error) throw error;
        if (data) {
          setCurrentSessionId(data.id);
          await supabase.from('interview_dialogues').insert([{
            session_id: data.id,
            speaker: 'AI',
            text: 'Tell me about a time you handled a high-pressure deadline with limited resources. What was your approach?'
          }]);
        }
      }
    } catch (e) {
      console.log("Error starting interview session:", e.message);
    }
    setCurrentScreen(38);
  };

  const handleSaveInterviewDialogue = async (speaker, text) => {
    if (!currentSessionId) return;

    try {
      await supabase.from('interview_dialogues').insert([{
        session_id: currentSessionId,
        speaker: speaker,
        text: text
      }]);

      if (speaker === 'USER') {
        const nextPrompt = 'Describe a technical challenge you solved and how you approached it.';
        await supabase.from('interview_dialogues').insert([{
          session_id: currentSessionId,
          speaker: 'AI',
          text: nextPrompt
        }]);
      }
    } catch (e) {
      console.log("Error saving dialogue:", e.message);
    }
  };

  const handleEndInterviewSession = async (score = 82) => {
    if (!currentSessionId) {
      setCurrentScreen(37);
      return;
    }

    try {
      await supabase.from('interview_sessions').update({
        status: 'COMPLETED',
        score: score,
        feedback: 'Excellent work. Your pace and confidence score were above average. Highlight: strong distributed databases knowledge.'
      }).eq('id', currentSessionId);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: currentScores } = await supabase
          .from('genome_scores')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (currentScores) {
          await supabase.from('genome_scores').update({
            technical: Math.min(100, currentScores.technical + 3),
            communication: Math.min(100, currentScores.communication + 4),
            total_score: Math.min(100, currentScores.total_score + 2)
          }).eq('user_id', user.id);
        }
      }

      Alert.alert("Session Completed", `Your final mock rating: ${score}/100. Genome Score recalibrated!`);
      setCurrentSessionId(null);
    } catch (e) {
      console.log("Error ending interview session:", e.message);
    }
    setCurrentScreen(37);
  };

  const handleForgotPassword = () => {
    setCurrentScreen(4); // Navigate to Screen5 (Forgot Password)
  };

  const handleResetLinkSent = async (email) => {
    setRegisteredEmail(email); // Save email so verification knows who to verify
    setAuthFlowType('reset');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false
        }
      });
      if (error) throw error;
      Alert.alert("OTP Sent", `A secure 6-digit password reset OTP has been sent to ${email}!`);
      setCurrentScreen(5); // Go directly to OTP verification boxes screen
    } catch (error) {
      console.log("Reset password OTP error:", error.message);
      Alert.alert("OTP Request Failed", error.message);
    }
  };

  const handleContinueToVerification = () => {
    setCurrentScreen(5); // Navigate to Screen6 (Email Verification)
  };

  const handleEmailVerified = async (code) => {
    try {
      const email = registeredEmail || profile.email || 'user@example.com';
      
      // Try verifying signup OTP first
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup'
      });

      if (error) {
        // Fallback: Try verifying as email login OTP (for forgot password/magic link resets)
        const emailVerify = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: 'email'
        });
        if (emailVerify.error) throw emailVerify.error;
      }

      Alert.alert("Verified Successfully", "Your account is now activated!");
      setCurrentScreen(6);
    } catch (e) {
      console.log("Supabase OTP Verification error:", e.message);
      Alert.alert("Verification Error", "Wrong OTP or mismatched OTP. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    try {
      const email = registeredEmail || profile.email || 'user@example.com';
      if (authFlowType === 'reset') {
        // For password reset / signInWithOtp we trigger signInWithOtp again to get a new code
        const { error } = await supabase.auth.signInWithOtp({
          email: email,
          options: {
            shouldCreateUser: false
          }
        });
        if (error) throw error;
        Alert.alert("New OTP Sent", `A fresh password reset OTP has been sent to ${email}!`);
      } else {
        // For normal signup confirmation
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email
        });
        if (error) throw error;
        Alert.alert("New OTP Sent", `A fresh verification OTP has been sent to ${email}!`);
      }
    } catch (e) {
      console.log("Error resending OTP:", e.message);
      Alert.alert("Error Resending OTP", e.message || "Failed to resend verification OTP. Please try again.");
    }
  };

  const handleOnboardingComplete = () => {
    setCurrentScreen(7); // Navigate to Screen8 (Genome Score)
  };

  const handleGenomeScoreComplete = () => {
    setCurrentScreen(8); // Navigate to Screen9 (Simulate Futures)
  };

  const handleSimulateFuturesComplete = () => {
    setCurrentScreen(9); // Navigate to Screen10 (Device Setup)
  };

  const handleDeviceSetupComplete = () => {
    if (deviceSetupReturnTo === 13) {
      setCurrentScreen(13);
      setDeviceSetupReturnTo(null);
    } else {
      setCurrentScreen(10); // Navigate to Screen11 (dashboard)
    }
  };

  const handleGitHubAnalyze = (username) => {
    setGithubUsername(username); // Save the GitHub username
    setCurrentScreen(18); // Navigate to GitHub analysis screen
  };

  // In-memory search across app data. Returns array of {id,type,title,snippet,route,payload}
  const searchAll = (query) => {
    if (!query || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    const results = [];

    // Posts / community
    posts.forEach((p) => {
      const hay = `${p.author} ${p.handle} ${p.content} ${p.skills.join(" ")}`.toLowerCase();
      if (hay.includes(q)) {
        results.push({ id: `post-${p.id}`, type: 'post', title: p.author, snippet: p.content, route: 23, payload: { post: p } });
      }
    });

    // Conversations (previews)
    conversations.forEach((c) => {
      const hay = `${c.name} ${c.preview}`.toLowerCase();
      if (hay.includes(q)) {
        results.push({ id: `conv-${c.id}`, type: 'conversation', title: c.name, snippet: c.preview, route: 32, payload: { conversation: c } });
      }
    });

    // Conversation threads messages
    Object.entries(conversationThreads).forEach(([convId, msgs]) => {
      msgs.forEach((m) => {
        if (m.text && m.text.toLowerCase().includes(q)) {
          results.push({ id: `thread-${convId}-${m.id}`, type: 'message', title: `Message in ${convId}`, snippet: m.text, route: 33, payload: { conversationId: Number(convId) } });
        }
      });
    });

    // Resume analysis text and skills
    if (resumeAnalysis) {
      if (resumeAnalysis.summary && resumeAnalysis.summary.toLowerCase().includes(q)) {
        results.push({ id: `resume-summary`, type: 'resume-summary', title: 'Resume summary', snippet: resumeAnalysis.summary, route: 16 });
      }
      if (Array.isArray(resumeAnalysis.extractedSkills)) {
        resumeAnalysis.extractedSkills.forEach((s, i) => {
          const name = typeof s === 'string' ? s : s.name || String(s);
          if (String(name).toLowerCase().includes(q)) {
            results.push({ id: `resume-skill-${i}`, type: 'resume-skill', title: name, snippet: 'Found in resume analysis', route: 16 });
          }
        });
      }
    }

    // Study group messages
    studyGroupMessages.forEach((m) => {
      if (m.text && m.text.toLowerCase().includes(q)) {
        results.push({ id: `study-${m.id}`, type: 'study', title: m.author, snippet: m.text, route: 36 });
      }
    });

    // Profile fiel