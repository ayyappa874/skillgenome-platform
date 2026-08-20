import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, useWindowDimensions, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../utils/supabase';

const MentorProfileTab = ({ profile, onUpdateProfile, T }) => {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [name, setName] = useState(profile.name || '');
  const [title, setTitle] = useState(profile.title || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [maxCohorts, setMaxCohorts] = useState(2);
  const [domains, setDomains] = useState(profile.skills ? profile.skills.map(s => s.name || s) : ['Machine Learning', 'System Design']);
  const [newDomain, setNewDomain] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [avatarBase64, setAvatarBase64] = useState(profile.avatarUrl || profile.avatar_url || '');
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);

  useEffect(() => {
    setName(profile.name || '');
    setTitle(profile.title || '');
    setBio(profile.bio || '');
    if (profile.skills && Array.isArray(profile.skills)) {
        setDomains(profile.skills.map(s => s.name || s));
    }
    if (profile.avatarUrl || profile.avatar_url) {
      setAvatarBase64(profile.avatarUrl || profile.avatar_url);
    }
  }, [profile]);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setIsAvatarLoading(true);
        const base64Str = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setAvatarBase64(base64Str);
        
        await supabase.from('profiles').update({ avatar_url: base64Str }).eq('id', profile.id);
        if (onUpdateProfile) onUpdateProfile({ ...profile, avatarUrl: base64Str, avatar_url: base64Str });
        Alert.alert('Success', 'Avatar updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    } finally {
      setIsAvatarLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const newSkills = domains.map(d => ({ name: d, score: 95 }));
      const { error } = await supabase.from('profiles').update({
        name: name.trim(),
        title: title.trim(),
        bio: bio.trim(),
        skills: newSkills
      }).eq('id', profile.id);

      if (error) throw error;
      if (onUpdateProfile) onUpdateProfile({ ...profile, name: name.trim(), title: title.trim(), bio: bio.trim(), skills: newSkills });
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={S.container}>
      <Text style={[S.title, { color: T.text, marginBottom: 24 }]}>Mentor Profile</Text>

      <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
        <View style={[S.grid, { flexDirection: isWide ? 'row' : 'column' }]}>
          
          <View style={[S.card, { backgroundColor: T.surface, borderColor: T.borderLow, flex: 1 }]}>
            <Text style={[S.sectionTitle, { color: T.text }]}>Public Information</Text>
            
            <View style={S.avatarSection}>
              <View style={[S.avatar, { backgroundColor: T.surface2, overflow: 'hidden' }]}>
                {avatarBase64 ? (
                  <Image source={{ uri: avatarBase64 }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Text style={{ color: T.text, fontSize: 32, fontWeight: '800' }}>{name?.[0] || 'M'}</Text>
                )}
              </View>
              <Pressable onPress={pickImage} disabled={isAvatarLoading} style={[S.uploadBtn, { borderColor: T.border }]}>
                <Text style={{ color: T.text, fontWeight: '600' }}>{isAvatarLoading ? 'Uploading...' : 'Change Avatar'}</Text>
              </Pressable>
            </View>

            <View style={S.inputGroup}>
              <Text style={[S.label, { color: T.muted }]}>Full Name</Text>
              <TextInput style={[S.input, { color: T.text, backgroundColor: T.surface2, borderColor: T.borderLow }]} value={name} onChangeText={setName} />
            </View>

            <View style={S.inputGroup}>
              <Text style={[S.label, { color: T.muted }]}>Current Role / Title</Text>
              <TextInput style={[S.input, { color: T.text, backgroundColor: T.surface2, borderColor: T.borderLow }]} value={title} onChangeText={setTitle} />
            </View>

            <View style={S.inputGroup}>
              <Text style={[S.label, { color: T.muted }]}>Bio</Text>
              <TextInput 
                style={[S.input, { color: T.text, backgroundColor: T.surface2, borderColor: T.borderLow, height: 100 }]} 
                multiline
                textAlignVertical="top"
                value={bio} 
                onChangeText={setBio}
                placeholder="I help aspiring software engineers master full-stack development and system design."
                placeholderTextColor={T.muted}
              />
            </View>
          </View>

          <View style={[S.card, { backgroundColor: T.surface, borderColor: T.borderLow, flex: 1 }]}>
            <Text style={[S.sectionTitle, { color: T.text }]}>Mentorship Settings</Text>

            <View style={S.inputGroup}>
              <Text style={[S.label, { color: T.muted }]}>Maximum Concurrent Cohorts</Text>
              <View style={S.pillSelector}>
                {[1, 2, 3, 4].map(num => (
                  <Pressable key={num} onPress={() => setMaxCohorts(num)} style={[S.pill, maxCohorts === num ? { backgroundColor: T.accent } : { backgroundColor: T.surface2 }]}>
                    <Text style={{ color: maxCohorts === num ? '#fff' : T.text, fontWeight: '700' }}>{num}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={S.inputGroup}>
              <Text style={[S.label, { color: T.muted }]}>Top Mentorship Domains</Text>
              <View style={S.tagContainer}>
                {domains.map(tag => (
                  <Pressable key={tag} onPress={() => setDomains(domains.filter(d => d !== tag))} style={[S.tag, { backgroundColor: `${T.accent}20` }]}>
                    <Text style={{ color: T.accent, fontWeight: '600', fontSize: 12 }}>{tag} ✕</Text>
                  </Pressable>
                ))}
              </View>
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <TextInput 
                  style={[S.input, { color: T.text, backgroundColor: T.surface2, borderColor: T.borderLow, flex: 1, marginRight: 8, paddingVertical: 8 }]} 
                  value={newDomain} onChangeText={setNewDomain} placeholder="Add Domain" placeholderTextColor={T.muted}
                />
                <Pressable onPress={() => { if(newDomain.trim()) { setDomains([...domains, newDomain.trim()]); setNewDomain(''); } }} style={[S.tag, { backgroundColor: T.surface2, borderColor: T.border, borderWidth: 1, justifyContent: 'center' }]}><Text style={{ color: T.text }}>Add</Text></Pressable>
              </View>
            </View>
            
            <View style={[S.verificationBox, { backgroundColor: `${T.green}10`, borderColor: T.green }]}>
              <Text style={{ color: T.green, fontSize: 18, marginBottom: 8 }}>✓ Verified Expert</Text>
              <Text style={{ color: T.text, fontSize: 13, lineHeight: 20 }}>Your background has been verified by the SkillGenome team. This badge is visible to all students.</Text>
            </View>

            <Pressable onPress={handleSave} disabled={isSaving} style={[S.saveBtn, { backgroundColor: isSaving ? T.muted : T.accent }]}>
              {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '800', textAlign: 'center' }}>Save Changes</Text>}
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

const S = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  scroll: { flex: 1 },
  grid: { gap: 24 },
  
  card: { padding: 24, borderRadius: 20, borderWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 24 },
  
  avatarSection: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  uploadBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 15 },
  
  pillSelector: { flexDirection: 'row', gap: 12 },
  pill: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  
  verificationBox: { padding: 16, borderRadius: 12, borderWidth: 1, marginTop: 24, marginBottom: 24 },
  
  saveBtn: { padding: 16, borderRadius: 12 }
});

export default MentorProfileTab;
