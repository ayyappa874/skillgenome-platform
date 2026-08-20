import * as React from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Platform, Image, Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTheme } from '../utils/theme';
import GlassCard from '../components/UI/GlassCard';
import { supabase } from '../utils/supabase';

const UserProfileScreen = ({
  route, onBack, onOpenMessages, isDarkMode = true, currentUserId = null
}) => {
  
  const T = getTheme(isDarkMode);
  const S = React.useMemo(() => getStyles(T, isDarkMode), [T, isDarkMode]);
  const userId = route?.params?.userId;
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isConnected, setIsConnected] = React.useState(false);
  const [connectionPending, setConnectionPending] = React.useState(false);

  React.useEffect(() => {
    if (userId) {
      loadUserProfile();
      checkConnection();
    }
  }, [userId, currentUserId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = async () => {
    try {
      if (!currentUserId) return;
      const { data, error } = await supabase
        .from('connections')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('connected_user_id', userId)
        .single();

      if (!error && data) {
        setIsConnected(true);
      }
    } catch (error) {
      // User not connected yet
    }
  };

  const handleConnect = async () => {
    if (!currentUserId) {
      Alert.alert('Error', 'You must be logged in to connect');
      return;
    }

    if (isConnected) {
      Alert.alert('Already Connected', 'You are already connected with this user');
      return;
    }

    try {
      setConnectionPending(true);
      
      // Insert connection
      const { error: connError } = await supabase.from('connections').insert([
        {
          user_id: currentUserId,
          connected_user_id: userId,
          match_score: Math.floor(Math.random() * 30 + 70),
          connected_at: new Date().toISOString()
        }
      ]);

      if (connError) {
        // If duplicate, user is already connected
        if (connError.code === '23505') {
          setIsConnected(true);
          Alert.alert('Already Connected', 'You are already connected with this user');
          return;
        }
        throw connError;
      }
      
      // Get current user name for notification
      const { data: currentUserData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', currentUserId)
        .single();

      // Create notification for the other user
      await supabase.from('notifications').insert([
        {
          recipient_id: userId,
          actor_id: currentUserId,
          actor_name: currentUserData?.name || 'Someone',
          notification_type: 'connection_request',
          message: `${currentUserData?.name || 'Someone'} connected with you`,
          is_read: false
        }
      ]).catch(err => console.log('Notification creation optional:', err));

      setIsConnected(true);
      Alert.alert('Success', `Connected with ${user?.name}!`);
    } catch (error) {
      console.error('Error connecting:', error);
      Alert.alert('Error', error.message || 'Failed to send connection request');
    } finally {
      setConnectionPending(false);
    }
  };

  const handleMessage = async () => {
    if (!currentUserId) {
      Alert.alert('Error', 'You must be logged in to message');
      return;
    }

    try {
      // Create or get conversation
      const { data: participations1 } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', currentUserId);

      const { data: participations2 } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId);

      let commonId = null;
      if (participations1 && participations2) {
        const ids1 = participations1.map(p => p.conversation_id);
        const ids2 = participations2.map(p => p.conversation_id);
        commonId = ids1.find(id => ids2.includes(id));
      }

      if (!commonId) {
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
            { conversation_id: newConv.id, user_id: currentUserId },
            { conversation_id: newConv.id, user_id: userId }
          ]);
        
        onOpenMessages?.(newConv);
      } else {
        onOpenMessages?.({ id: commonId });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', 'Failed to start conversation');
    }
  };

  if (loading) {
    return (
      <View style={[S.container, { backgroundColor: T.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={T.accent} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[S.container, { backgroundColor: T.bg || T.background }]}>
        <View style={S.header}>
          <Pressable onPress={onBack} style={S.backBtn}>
            <Text style={S.backIcon}>←</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={S.pageTitle}>Profile</Text>
          </View>
        </View>
        <View style={S.centerContainer}>
          <Text style={S.errorText}>User not found</Text>
        </View>
      </View>
    );
  }

  const skills = user.skills && Array.isArray(user.skills) ? user.skills : [];
  const scores = {
    resume: user.resume_score || 0,
    thought: user.thought_score || 0,
    emotion: user.emotion_score || 0,
    github: user.github_score || 0
  };

  return (
    <View style={[S.container, { backgroundColor: T.bg || T.background }]}>
      <View style={S.header}>
        <Pressable onPress={onBack} style={S.backBtn}>
          <Text style={S.backIcon}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={S.pageTitle}>{user.name || 'User'}</Text>
        </View>
      </View>

      <ScrollView style={S.content} contentContainerStyle={S.contentContainer}>
        {/* Profile Header */}
        <LinearGradient
          colors={[`${T.accent}20`, `${T.purple}10`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={S.headerCard}
        >
          <View style={S.avatarContainer}>
            {user.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={S.avatar} />
            ) : (
              <View style={[S.avatar, { backgroundColor: T.accent }]}>
                <Text style={S.avatarText}>{user.name?.[0] || 'U'}</Text>
              </View>
            )}
          </View>

          <Text style={S.userName}>{user.name || 'User'}</Text>
          <Text style={S.userRole}>{user.title || 'No title'}</Text>
          
          {user.location && <Text style={S.userLocation}>📍 {user.location}</Text>}
          {user.bio && <Text style={S.userBio}>{user.bio}</Text>}

          {/* Action Buttons */}
          <View style={S.actionButtonsContainer}>
            <Pressable
              onPress={handleConnect}
              disabled={isConnected || connectionPending}
              style={[S.actionButton, isConnected && S.actionButtonConnected]}
            >
              <Text style={[S.actionButtonText, isConnected && S.actionButtonTextConnected]}>
                {isConnected ? '✓ Connected' : connectionPending ? 'Sending...' : '+ Connect'}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleMessage}
              style={[S.actionButton, S.messageButton]}
            >
              <Text style={S.actionButtonText}>💬 Message</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Genome Score */}
        <GlassCard intensity="medium" isDarkMode={isDarkMode} style={S.scoreCard}>
          <View style={S.scoreHeader}>
            <Text style={S.scoreTitle}>Genome Score</Text>
            <Text style={S.scoreValue}>{user.total_score || 0}</Text>
          </View>
          <View style={S.scoreModules}>
            {[
              { label: 'Resume', score: scores.resume, color: T.accent },
              { label: 'ThoughtPrint', score: scores.thought, color: T.rose },
              { label: 'EmotionPrint', score: scores.emotion, color: T.amber },
              { label: 'GitHub', score: scores.github, color: T.purple }
            ].map((module, idx) => (
              <View key={idx} style={S.scoreModule}>
                <Text style={S.moduleLabel}>{module.label}</Text>
                <View style={S.scoreBar}>
                  <View
                    style={[
                      S.scoreBarFill,
                      { width: `${Math.min(module.score, 100)}%`, backgroundColor: module.color }
                    ]}
                  />
                </View>
                <Text style={S.moduleScore}>{module.score}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Skills */}
        {skills.length > 0 && (
          <GlassCard intensity="low" isDarkMode={isDarkMode} style={S.skillsCard}>
            <Text style={S.sectionTitle}>Skills</Text>
            <View style={S.skillsContainer}>
              {skills.slice(0, 10).map((skill, idx) => (
                <LinearGradient
                  key={idx}
                  colors={[`${T.accent}30`, `${T.accent}10`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={S.skillBadge}
                >
                  <Text style={S.skillText}>{skill}</Text>
                </LinearGradient>
              ))}
            </View>
          </GlassCard>
        )}

        {/* Additional Info */}
        <View style={S.infoContainer}>
          {user.experience && (
            <Text style={S.infoText}>
              <Text style={S.infoLabel}>Experience: </Text>
              {user.experience} years
            </Text>
          )}
          {user.joined_at && (
            <Text style={S.infoText}>
              <Text style={S.infoLabel}>Member since: </Text>
              {new Date(user.joined_at).toLocaleDateString()}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (T, isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: 16,
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'ios' ? 72 : 56,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "rgba(255,255,255,0.05)" : T.border,
    },
    backBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: T.surface,
      borderWidth: 1,
      borderColor: T.border,
      alignItems: "center",
      justifyContent: "center"
    },
    backIcon: {
      fontSize: 18,
      color: T.text,
      fontWeight: "600",
      marginTop: -2
    },
    pageTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: T.text,
      letterSpacing: -0.4
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: 16,
      gap: 16,
    },
    headerCard: {
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: T.border,
    },
    avatarContainer: {
      marginBottom: 8,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#fff',
    },
    userName: {
      color: T.text,
      fontSize: 22,
      fontWeight: 'bold',
    },
    userRole: {
      color: '#94a3b8',
      fontSize: 14,
    },
    userLocation: {
      color: '#94a3b8',
      fontSize: 13,
    },
    userBio: {
      color: T.text,
      fontSize: 13,
      textAlign: 'center',
      marginVertical: 4,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 12,
      width: '100%',
    },
    actionButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: T.accent,
      alignItems: 'center',
    },
    actionButtonConnected: {
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
    },
    messageButton: {
      backgroundColor: T.purple,
    },
    actionButtonText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
    },
    actionButtonTextConnected: {
      color: T.accent,
    },
    scoreCard: {
      borderRadius: 12,
      padding: 16,
    },
    scoreHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    scoreTitle: {
      color: T.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
    scoreValue: {
      color: T.accent,
      fontSize: 24,
      fontWeight: 'bold',
    },
    scoreModules: {
      gap: 12,
    },
    scoreModule: {
      gap: 6,
    },
    moduleLabel: {
      color: '#94a3b8',
      fontSize: 12,
      fontWeight: '500',
    },
    scoreBar: {
      height: 6,
      borderRadius: 3,
      backgroundColor: T.surface,
      overflow: 'hidden',
    },
    scoreBarFill: {
      height: '100%',
      borderRadius: 3,
    },
    moduleScore: {
      color: T.text,
      fontSize: 11,
      fontWeight: '600',
    },
    skillsCard: {
      borderRadius: 12,
      padding: 16,
    },
    sectionTitle: {
      color: T.text,
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    skillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    skillBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    skillText: {
      color: T.accent,
      fontSize: 12,
      fontWeight: '500',
    },
    infoContainer: {
      gap: 8,
    },
    infoText: {
      color: '#94a3b8',
      fontSize: 13,
    },
    infoLabel: {
      fontWeight: '600',
      color: T.text,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      color: T.text,
      fontSize: 16,
    },
  });

export default UserProfileScreen;
