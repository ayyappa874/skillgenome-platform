import * as React from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Platform, Image, Alert, ActivityIndicator, TextInput, RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTheme } from '../utils/theme';
import GlassCard from '../components/UI/GlassCard';
import { supabase } from '../utils/supabase';

const GroupsDiscoveryScreen = ({
  onBack, onOpenGroup, isDarkMode = true, currentUserId = null
}) => {
  
  const T = getTheme(isDarkMode);
  const S = React.useMemo(() => getStyles(T, isDarkMode), [T, isDarkMode]);
  const [groups, setGroups] = React.useState([]);
  const [filteredGroups, setFilteredGroups] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSkill, setSelectedSkill] = React.useState('all');
  const [userGroups, setUserGroups] = React.useState([]);

  const skills = ['all', 'Python', 'React', 'Machine Learning', 'System Design', 'UI/UX', 'DevOps', 'Data Science'];

  React.useEffect(() => {
    loadGroups();
    loadUserGroups();
  }, [currentUserId]);

  React.useEffect(() => {
    filterGroups();
  }, [groups, searchQuery, selectedSkill]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('study_groups')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Error', 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const loadUserGroups = async () => {
    try {
      if (!currentUserId) return;
      const { data, error } = await supabase
        .from('study_group_members')
        .select('study_group_id')
        .eq('user_id', currentUserId);

      if (error) throw error;
      setUserGroups(data?.map(m => m.study_group_id) || []);
    } catch (error) {
      console.error('Error loading user groups:', error);
    }
  };

  const filterGroups = () => {
    let filtered = groups;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(g =>
        g.name?.toLowerCase().includes(query) ||
        g.description?.toLowerCase().includes(query)
      );
    }

    // Filter by skill
    if (selectedSkill !== 'all') {
      filtered = filtered.filter(g => {
        const skills = g.skill_tags && Array.isArray(g.skill_tags) ? g.skill_tags : [];
        return skills.includes(selectedSkill);
      });
    }

    // Hide groups user is already in
    filtered = filtered.filter(g => !userGroups.includes(g.id));

    setFilteredGroups(filtered);
  };

  const handleJoinGroup = async (groupId, groupName) => {
    if (!currentUserId) {
      Alert.alert('Error', 'You must be logged in to join groups');
      return;
    }

    try {
      const { error } = await supabase
        .from('study_group_members')
        .insert([
          {
            study_group_id: groupId,
            user_id: currentUserId,
            joined_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      // Create notification for group admin
      const group = groups.find(g => g.id === groupId);
      await supabase.from('notifications').insert([
        {
          recipient_id: group.admin_id,
          actor_id: currentUserId,
          notification_type: 'group_invite',
          related_group_id: groupId,
          message: `Someone joined your group ${groupName}`,
          is_read: false
        }
      ]);

      Alert.alert('Success', `Joined "${groupName}"!`);
      setUserGroups([...userGroups, groupId]);
      loadGroups(); // Refresh to remove from discovery
    } catch (error) {
      console.error('Error joining group:', error);
      Alert.alert('Error', 'Failed to join group');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  const renderGroup = (group) => {
    const groupSkills = group.skill_tags && Array.isArray(group.skill_tags) ? group.skill_tags : [];
    const memberCount = group.member_count || 0;
    const isJoined = userGroups.includes(group.id);

    return (
      <GlassCard
        key={group.id}
        intensity="low"
        isDarkMode={isDarkMode}
        style={[S.groupCard, { opacity: isJoined ? 0.5 : 1 }]}
      >
        <View style={S.groupHeader}>
          <View style={S.groupInfo}>
            <Text style={S.groupName}>{group.name}</Text>
            <Text style={S.groupDescription} numberOfLines={2}>
              {group.description || 'No description'}
            </Text>
          </View>
          {group.cover_image && (
            <Image
              source={{ uri: group.cover_image }}
              style={S.groupImage}
            />
          )}
        </View>

        {groupSkills.length > 0 && (
          <View style={S.skillsRow}>
            {groupSkills.slice(0, 3).map((skill, idx) => (
              <LinearGradient
                key={idx}
                colors={[`${T.accent}30`, `${T.accent}10`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={S.skillTag}
              >
                <Text style={S.skillTagText}>{skill}</Text>
              </LinearGradient>
            ))}
            {groupSkills.length > 3 && (
              <Text style={S.moreSkills}>+{groupSkills.length - 3}</Text>
            )}
          </View>
        )}

        <View style={S.groupFooter}>
          <View style={S.memberInfo}>
            <Text style={S.memberCount}>👥 {memberCount} members</Text>
            {group.is_live && (
              <View style={S.liveBadge}>
                <Text style={S.liveBadgeText}>🔴 Live</Text>
              </View>
            )}
          </View>
          <Pressable
            onPress={() => handleJoinGroup(group.id, group.name)}
            disabled={isJoined}
            style={[S.joinButton, isJoined && S.joinButtonDisabled]}
          >
            <Text style={[S.joinButtonText, isJoined && S.joinButtonTextDisabled]}>
              {isJoined ? '✓ Joined' : '+ Join'}
            </Text>
          </Pressable>
        </View>
      </GlassCard>
    );
  };

  return (
    <View style={[S.container, { backgroundColor: T.bg }]}>
      <View style={S.header}>
        <Pressable onPress={onBack} style={S.backBtn}>
          <Text style={S.backIcon}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={S.pageTitle}>Discover Groups</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[S.searchContainer, { borderBottomColor: T.border }]}>
        <TextInput
          placeholder="Search groups..."
          placeholderTextColor={'#94a3b8'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[S.searchInput, { color: T.text }]}
        />
      </View>

      {/* Skills Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={S.skillsFilterScroll}
        contentContainerStyle={S.skillsFilterContent}
      >
        {skills.map(skill => (
          <Pressable
            key={skill}
            onPress={() => setSelectedSkill(skill)}
            style={[S.skillFilter, selectedSkill === skill && S.skillFilterActive]}
          >
            <Text style={[S.skillFilterText, selectedSkill === skill && S.skillFilterTextActive]}>
              {skill}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Groups List */}
      <ScrollView
        style={S.groupsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.accent} />}
      >
        {loading ? (
          <View style={S.centerContainer}>
            <ActivityIndicator size="large" color={T.accent} />
          </View>
        ) : filteredGroups.length > 0 ? (
          <View style={S.groupsContainer}>
            {filteredGroups.map(renderGroup)}
          </View>
        ) : (
          <View style={S.emptyContainer}>
            <Text style={S.emptyIcon}>🔍</Text>
            <Text style={S.emptyTitle}>No groups found</Text>
            <Text style={S.emptySubtitle}>
              {searchQuery || selectedSkill !== 'all'
                ? 'Try adjusting your filters'
                : 'Check back later for new groups'}
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
    searchContainer: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderBottomWidth: 1,
    },
    searchInput: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: T.surface,
      fontSize: 14,
    },
    skillsFilterScroll: {
      borderBottomWidth: 1,
      borderBottomColor: T.border,
      maxHeight: 50,
      minHeight: 50,
    },
    skillsFilterContent: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 8,
      alignItems: 'center',
      flexDirection: 'row',
    },
    skillFilter: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: T.surface,
      borderWidth: 1,
      borderColor: T.border,
    },
    skillFilterActive: {
      backgroundColor: T.accent,
      borderColor: T.accent,
    },
    skillFilterText: {
      color: '#94a3b8',
      fontSize: 12,
      fontWeight: '500',
    },
    skillFilterTextActive: {
      color: '#fff',
    },
    groupsList: {
      flex: 1,
    },
    groupsContainer: {
      padding: 12,
      gap: 12,
    },
    groupCard: {
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: T.border,
    },
    groupHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 8,
    },
    groupInfo: {
      flex: 1,
      gap: 4,
    },
    groupName: {
      color: T.text,
      fontSize: 15,
      fontWeight: 'bold',
    },
    groupDescription: {
      color: '#94a3b8',
      fontSize: 12,
    },
    groupImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
    },
    skillsRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
      flexWrap: 'wrap',
    },
    skillTag: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    skillTagText: {
      color: T.accent,
      fontSize: 11,
      fontWeight: '500',
    },
    moreSkills: {
      color: '#94a3b8',
      fontSize: 11,
      fontWeight: '500',
      paddingHorizontal: 8,
      alignSelf: 'center',
    },
    groupFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    memberInfo: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
    },
    memberCount: {
      color: '#94a3b8',
      fontSize: 12,
    },
    liveBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
    },
    liveBadgeText: {
      color: '#ef4444',
      fontSize: 11,
      fontWeight: '600',
    },
    joinButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: T.accent,
    },
    joinButtonDisabled: {
      backgroundColor: 'rgba(99, 102, 241, 0.3)',
    },
    joinButtonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    joinButtonTextDisabled: {
      color: T.accent,
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
    emptySubtitle: {
      color: '#94a3b8',
      fontSize: 13,
      textAlign: 'center',
    },
  });

export default GroupsDiscoveryScreen;
