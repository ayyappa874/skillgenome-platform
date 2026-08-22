import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { getTheme } from '../utils/theme';
import { supabase } from '../utils/supabase';

const { width } = Dimensions.get('window');

export default function MentorNotificationsScreen({ profile, onBack, isDarkMode }) {
  const C = getTheme(isDarkMode);
  
  // Custom theme colors based on screenshot
  const topGradient = isDarkMode ? ['#1e1b4b', '#0f172a'] : ['#faf5ff', '#f8fafc'];
  const bottomGradient = isDarkMode ? ['#0f172a', '#083344'] : ['#f8fafc', '#ecfeff'];
  
  const [activeTab, setActiveTab] = useState('Unread');
  const tabs = ['Unread', 'Requests', 'Sessions', 'Messages', 'System'];
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentorNotifications();
    
    // Real-time subscription to mentorship requests
    const mentorChannel = supabase.channel('mentor_notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mentorship_requests', filter: `mentor_id=eq.${profile?.id}` }, payload => {
        if (payload.new.status === 'pending') {
          const newNotif = {
            id: `request_${payload.new.id}`,
            type: 'request',
            title: 'New Mentorship Request',
            message: `A student has requested your mentorship.`,
            created_at: payload.new.created_at || new Date().toISOString(),
            read: false,
            data: payload.new
          };
          setNotifications(prev => [newNotif, ...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(mentorChannel);
    };
  }, []);

  const fetchMentorNotifications = async () => {
    setLoading(true);
    try {
      if (!profile?.id) return;
      
      // Fetch system notifications (like admin approvals)
      const { data: sysNotifs, error: sysErr } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', profile.id)
        .order('created_at', { ascending: false });

      const mappedSysNotifs = (sysNotifs || []).map(n => {
        const isSystem = n.notification_type === 'system_alert';
        let displayTitle = isSystem ? 'System Alert' : 'Notification';
        let displayMessage = n.message || '';
        
        // Extract title from message if formatted like "TITLE: Message"
        if (displayMessage.includes(': ')) {
          const parts = displayMessage.split(': ');
          displayTitle = parts[0];
          displayMessage = parts.slice(1).join(': ');
        }

        return {
          id: `sys_${n.id}`,
          type: isSystem ? 'system' : (n.notification_type || 'system'),
          title: displayTitle,
          message: displayMessage,
          created_at: n.created_at,
          read: n.is_read || false,
          data: n
        };
      });

      // Fetch pending mentorship requests
      const { data: requests, error: reqErr } = await supabase
        .from('mentorship_requests')
        .select('*, profiles!mentorship_requests_student_id_fkey(name)')
        .eq('mentor_id', profile.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (reqErr) {
        console.error("Error fetching mentor requests:", reqErr);
      }
      
      const reqNotifs = (requests || []).map(r => ({
        id: `request_${r.id}`,
        type: 'request',
        title: 'New Mentorship Request',
        message: `${r.profiles?.name || 'A student'} requested your mentorship.`,
        created_at: r.created_at,
        read: false,
        data: r
      }));
      
      // Combine and sort by date
      const allNotifs = [...mappedSysNotifs, ...reqNotifs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(allNotifs);
    } catch (e) {
      console.error("Error fetching mentor notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === 'Unread') return !n.read;
    if (activeTab === 'Requests') return n.type === 'request';
    if (activeTab === 'Sessions') return n.type === 'session';
    if (activeTab === 'Messages') return n.type === 'message';
    if (activeTab === 'System') return n.type === 'system';
    return true; // All
  });

  return (
    <View style={styles.container}>
      <LinearGradient colors={topGradient} style={StyleSheet.absoluteFillObject} />
      
      <View style={[styles.header, { borderBottomColor: isDarkMode ? '#333' : '#eee' }]}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={isDarkMode ? '#fff' : '#000'} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Mentor Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {tabs.map(tab => (
            <Pressable 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tabPill, 
                { backgroundColor: isDarkMode ? '#1e293b' : '#fff' },
                activeTab === tab && { borderColor: '#8b5cf6', borderWidth: 1 }
              ]}
            >
              <Text style={[
                styles.tabText, 
                { color: activeTab === tab ? '#8b5cf6' : (isDarkMode ? '#94a3b8' : '#64748b') }
              ]}>{tab}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <LinearGradient colors={bottomGradient} style={styles.bottomGradient} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      ) : filteredNotifs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.bellIcon}>{"🔔"}</Text>
          <Text style={[styles.emptyTitle, { color: isDarkMode ? '#fff' : '#1e293b' }]}>No new notifications</Text>
          <Text style={[styles.emptySub, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>Your notifications will appear here</Text>
        </View>
      ) : (
        <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
          {filteredNotifs.map(notif => (
            <View key={notif.id} style={[styles.notifCard, { backgroundColor: isDarkMode ? '#1e293b' : '#fff' }]}>
              <View style={styles.notifIconContainer}>
                {notif.type === 'request' ? <Feather name="user-plus" size={20} color="#8b5cf6" /> : <Feather name="info" size={20} color="#3b82f6" />}
              </View>
              <View style={styles.notifTextContainer}>
                <Text style={[styles.notifTitle, { color: isDarkMode ? '#fff' : '#000' }]}>{notif.title}</Text>
                <Text style={[styles.notifMsg, { color: isDarkMode ? '#94a3b8' : '#475569' }]}>{notif.message}</Text>
                <Text style={styles.notifTime}>{new Date(notif.created_at).toLocaleDateString()}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent'
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  tabsContainer: {
    paddingVertical: 12,
    zIndex: 10,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomGradient: {
    position: 'absolute',
    top: 150,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
    zIndex: 1,
  },
  bellIcon: {
    fontSize: 80,
    marginBottom: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 15,
  },
  listContainer: {
    flex: 1,
    zIndex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  notifCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center'
  },
  notifIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notifTextContainer: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notifMsg: {
    fontSize: 14,
    lineHeight: 20,
  },
  notifTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  }
});
