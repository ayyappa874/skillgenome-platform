import * as React from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Platform, Image, Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { getTheme } from '../utils/theme';
import GlassCard from '../components/UI/GlassCard';
import { supabase } from '../utils/supabase';
import { fetchNotifications, markNotificationAsRead } from '../utils/communityHelpers';

const NotificationsScreen = ({
  onBack, isDarkMode = true, currentUserId = null
}) => {
  
  const T = getTheme(isDarkMode);
  const S = React.useMemo(() => getStyles(T, isDarkMode), [T, isDarkMode]);
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [filter, setFilter] = React.useState('all'); // all, unread, likes, comments, mentions, connections

  React.useEffect(() => {
    loadNotifications();
    
    // Subscribe to new notifications
    if (currentUserId) {
      const subscription = supabase
        .channel(`notifications:${currentUserId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${currentUserId}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setNotifications(prev => [payload.new, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setNotifications(prev =>
                prev.map(n => n.id === payload.new.id ? payload.new : n)
              );
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [currentUserId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      if (!currentUserId) {
        setNotifications([]);
        return;
      }
      const result = await fetchNotifications(currentUserId);
      if (Array.isArray(result)) {
        setNotifications(result);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notification) => {
    if (notification.is_read) return;
    
    try {
      const result = await markNotificationAsRead(notification.id);
      if (result.success) {
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const handleAcceptGroupInvite = async (notification) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const groupId = notification.link_id; // link_id contains study_group_id
      if (!groupId) return;

      // Insert member
      const { error } = await supabase.from('study_group_members').insert([{
        study_group_id: groupId,
        user_id: user.id,
        role: 'member'
      }]);
      
      if (error && error.code !== '23505') throw error; // ignore duplicate key

      // Delete the notification
      await handleDeleteNotification(notification.id);
      Alert.alert("Success", "You have joined the group!");
    } catch (error) {
      console.error('Error accepting group invite:', error);
      Alert.alert("Error", "Could not join the group. You might already be a member.");
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'likes') return n.notification_type === 'like';
    if (filter === 'comments') return n.notification_type === 'comment';
    if (filter === 'mentions') return n.notification_type === 'mention';
    if (filter === 'connections') return n.notification_type === 'connection_request';
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'mention': return '@️';
      case 'connection_request': return '🤝';
      case 'group_invite': return '👥';
      default: return '🔔';
    }
  };

  const getNotificationTitle = (notification) => {
    const { notification_type, actor_name = 'Someone' } = notification;
    switch (notification_type) {
      case 'like':
        return `${actor_name} liked your post`;
      case 'comment':
        return `${actor_name} commented on your post`;
      case 'mention':
        return `${actor_name} mentioned you`;
      case 'connection_request':
        return `${actor_name} sent you a connection request`;
      case 'group_invite':
        return `${actor_name} invited you to a group`;
      default:
        return notification.message || 'New notification';
    }
  };

  const renderNotification = (notification) => (
    <Pressable
      key={notification.id}
      onPress={() => handleMarkAsRead(notification)}
    >
      <LinearGradient
        colors={[
          notification.is_read ? T.surface : 'rgba(99, 102, 241, 0.1)',
          notification.is_read ? T.surface : 'rgba(79, 172, 254, 0.05)'
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[S.notificationCard, !notification.is_read && { borderLeftWidth: 3, borderLeftColor: T.accent }]}
      >
        <View style={S.notificationContent}>
          <View style={S.notificationHeader}>
            <View style={S.notificationIcon}>
              <Text style={S.notificationIconText}>{getNotificationIcon(notification.notification_type)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[S.notificationTitle, !notification.is_read && S.notificationTitleBold]}>
                {getNotificationTitle(notification)}
              </Text>
              <Text style={S.notificationTime}>
                {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString()}
              </Text>
            </View>
            <Pressable
              onPress={() => handleDeleteNotification(notification.id)}
              style={S.deleteButton}
            >
              <Text style={S.deleteButtonText}>✕</Text>
            </Pressable>
          </View>
          {notification.notification_type === 'group_invite' && (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, marginLeft: 56 }}>
              <Pressable onPress={() => handleAcceptGroupInvite(notification)} style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: T.accent, borderRadius: 6 }}>
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>Accept</Text>
              </Pressable>
              <Pressable onPress={() => handleDeleteNotification(notification.id)} style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6 }}>
                <Text style={{ color: T.text, fontSize: 13, fontWeight: 'bold' }}>Decline</Text>
              </Pressable>
            </View>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );

  const filterTabs = ['all', 'unread', 'likes', 'comments', 'mentions', 'connections'];

  return (
    <View style={[S.container, { backgroundColor: T.bg }]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient colors={[`${T.accent}22`, `${T.accent}00`]} style={S.glow1} />
        <LinearGradient colors={[`${T.cyan || '#00d2ff'}18`, `${T.cyan || '#3a7bd5'}00`]} style={S.glow2} />
      </View>
      <View style={S.header}>
        <Pressable onPress={onBack} style={S.backButton}>
          <Feather name="arrow-left" size={24} color={T.text} />
        </Pressable>
        <Text style={S.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={S.filterScroll}
        contentContainerStyle={S.filterContent}
      >
        {filterTabs.map(tab => (
          <Pressable
            key={tab}
            onPress={() => setFilter(tab)}
            style={[S.filterTab, filter === tab && S.filterTabActive]}
          >
            <Text style={[S.filterTabText, filter === tab && S.filterTabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        style={S.notificationsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.accent} />}
      >
        {loading ? (
          <View style={S.centerContainer}>
            <ActivityIndicator size="large" color={T.accent} />
          </View>
        ) : filteredNotifications.length > 0 ? (
          <View style={S.notificationsContainer}>
            {filteredNotifications.map(renderNotification)}
          </View>
        ) : (
          <View style={S.emptyContainer}>
            <Text style={S.emptyIcon}>🔔</Text>
            <Text style={S.emptyTitle}>No notifications</Text>
            <Text style={S.emptySubtitle}>
              {filter === 'unread' ? 'You\'re all caught up!' : 'Your notifications will appear here'}
            </Text>
          </View>
        )}
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
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'ios' ? 72 : 56,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: T.border,
    },
    backButton: {
      padding: 8,
    },
    backButtonText: {
      color: T.accent,
      fontSize: 14,
      fontWeight: '600',
    },
    headerTitle: {
      color: T.text,
      fontSize: 18,
      fontWeight: 'bold',
    },
    filterScroll: {
      borderBottomWidth: 1,
      borderBottomColor: T.border,
    },
    filterContent: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 8,
    },
    filterTab: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: T.surface,
      borderWidth: 1,
      borderColor: T.border,
    },
    filterTabActive: {
      backgroundColor: T.accent,
      backgroundColor: T.surface,
      borderColor: T.accent,
    },
    filterTabTextActive: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    filterTabText: {
      color: T.muted,
      fontSize: 12,
      fontWeight: '600',
    },
    notificationsList: {
      flex: 1,
    },
    notificationsContainer: {
      padding: 12,
      gap: 12,
    },
    notificationCard: {
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: T.border,
    },
    notificationContent: {
      gap: 8,
    },
    notificationHeader: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'flex-start',
    },
    notificationIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    notificationIconText: {
      fontSize: 20,
    },
    notificationTitle: {
      color: T.text,
      fontSize: 14,
      fontWeight: '500',
    },
    notificationTitleBold: {
      fontWeight: '700',
    },
    notificationTime: {
      color: T.muted,
      fontSize: 12,
      marginTop: 4,
    },
    deleteButton: {
      padding: 4,
    },
    deleteButtonText: {
      color: T.muted,
      fontSize: 18,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 200,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 300,
      gap: 12,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 8,
    },
    emptyTitle: {
      color: T.text,
      fontSize: 16,
      fontWeight: '600',
    },
    emptySubtext: {
      fontSize: 14,
      color: T.muted,
      textAlign: 'center',
    },
    glow1: { position: 'absolute', top: 0, left: 0, right: 0, height: 400 },
    glow2: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 400 },
  });

export default NotificationsScreen;
