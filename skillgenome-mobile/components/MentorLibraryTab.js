import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, useWindowDimensions, Alert, ActivityIndicator, Modal, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../utils/supabase';

const MentorLibraryTab = ({ profile, T }) => {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [search, setSearch] = useState('');

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [newResTitle, setNewResTitle] = useState('');
  const [newResUrl, setNewResUrl] = useState('');

  const [uploadType, setUploadType] = useState('link'); // 'link' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);


  const fetchResources = async () => {
    if (!profile?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mentor_resources')
        .select('*')
        .eq('mentor_id', profile.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setResources(data || []);
    } catch (err) {
      console.warn('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [profile?.id]);

  
  const handleUpload = () => {
    setNewResTitle('');
    setNewResUrl('');
    setSelectedFile(null);
    setUploadType('link');
    setModalVisible(true);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'video/*'],
        copyToCacheDirectory: true
      });
      if (result.canceled) return;
      if (result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        if (!newResTitle) setNewResTitle(result.assets[0].name.split('.')[0]);
      }
    } catch (e) {
      console.warn(e);
    }
  };


  
  const handleSaveResource = async () => {
    if (!newResTitle.trim()) return Alert.alert("Error", "Please enter a Title.");
    
    let finalUrl = '';
    let finalType = 'Link';

    if (uploadType === 'link') {
      if (!newResUrl.trim()) return Alert.alert("Error", "Please enter a URL.");
      finalUrl = newResUrl.trim();
    } else {
      if (!selectedFile) return Alert.alert("Error", "Please select a file.");
      
      try {
        if (Platform.OS === 'web') {
          let blob;
          if (selectedFile.file) {
            blob = selectedFile.file;
          } else {
            const r = await fetch(selectedFile.uri);
            blob = await r.blob();
          }
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (err) => reject(new Error("FileReader failed: " + err));
            reader.readAsDataURL(blob);
          });
          finalUrl = base64;
        } else {
          const base64Data = await FileSystem.readAsStringAsync(selectedFile.uri, { encoding: FileSystem.EncodingType.Base64 });
          const mimeType = selectedFile.mimeType || 'application/octet-stream';
          finalUrl = `data:${mimeType};base64,${base64Data}`;
        }
      } catch (e) {
        return Alert.alert("Upload Error", "Failed to encode file (" + Platform.OS + "): " + (e.message || String(e)));
      }

      if (selectedFile.mimeType?.includes('pdf') || selectedFile.name?.endsWith('.pdf')) finalType = 'PDF';
      else if (selectedFile.mimeType?.includes('video')) finalType = 'Video';
      else finalType = 'Document';
    }

    try {
      const { error } = await supabase.from('mentor_resources').insert({
        mentor_id: profile.id,
        title: newResTitle.trim(),
        url: finalUrl,
        type: finalType
      });
      if (error) throw error;
      setModalVisible(false);
      fetchResources();
    } catch(e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleDeleteResource = (id) => {
    Alert.alert("Delete Resource", "Are you sure you want to remove this file?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          const { error } = await supabase.from('mentor_resources').delete().eq('id', id);
          if (error) throw error;
          fetchResources();
        } catch(e) {
          Alert.alert("Error", e.message);
        }
      }}
    ]);
  };


  return (
    <View style={S.container}>
      <View style={S.headerRow}>
        <Text style={[S.title, { color: T.text }]}>Resource Library</Text>
        <View style={S.actions}>
          <TextInput
            style={[S.searchInput, { color: T.text, backgroundColor: T.surface, borderColor: T.borderLow }]}
            placeholder="Search resources..."
            placeholderTextColor={T.subtle}
            value={search}
            onChangeText={setSearch}
          />
          <Pressable style={[S.uploadBtn, { backgroundColor: T.accent }]} onPress={handleUpload}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>+ Upload</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>
        <View style={S.grid}>
          {loading ? (
            <ActivityIndicator size="large" color={T.accent} style={{ marginTop: 40, width: '100%' }} />
          ) : resources.length === 0 ? (
            <View style={{ alignItems: 'center', width: '100%', marginTop: 40 }}>
              <Text style={{ color: T.muted }}>No resources added yet. Click + Upload to add one.</Text>
            </View>
          ) : (
          resources.map(res => (
            <View key={res.id} style={[S.card, { backgroundColor: T.surface, borderColor: T.borderLow, width: isWide ? '48%' : '100%' }]}>
              <View style={S.cardHeader}>
                <View style={S.typeIcon}>
                  <Text style={{ fontSize: 24 }}>{res.type === 'PDF' ? '📄' : '🔗'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[S.resTitle, { color: T.text }]} numberOfLines={1}>{res.title}</Text>
                  <Text style={[S.resAdded, { color: T.muted }]}>Added {new Date(res.created_at).toLocaleDateString()}</Text>
                </View>
                <Pressable style={S.menuBtn} onPress={() => handleDeleteResource(res.id)}>
                  <Text style={{ color: T.red || '#ff4444', fontSize: 18 }}>🗑</Text>
                </Pressable>
              </View>

              <View style={S.cohortsList}>
                <Text style={{ color: T.text, fontSize: 13, fontWeight: '700', marginBottom: 8 }}>Available to:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  <View style={[S.cohortBadge, { backgroundColor: T.surface2 }]}>
                    <Text style={{ color: T.muted, fontSize: 12, fontWeight: '600' }}>All Active Cohorts</Text>
                  </View>
                </View>
              </View>
            </View>
          )))}
        </View>
      </ScrollView>

      
      {/* Custom Upload Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={S.modalOverlay}>
          <View style={[S.modalContent, { backgroundColor: T.surface, borderColor: T.borderLow }]}>
            <Text style={[S.modalTitle, { color: T.text }]}>Add New Resource</Text>
            
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <Pressable 
                style={{ flex: 1, paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: uploadType === 'link' ? T.accent : 'transparent', alignItems: 'center' }}
                onPress={() => setUploadType('link')}
              >
                <Text style={{ color: uploadType === 'link' ? T.accent : T.muted, fontWeight: '700' }}>Add Link</Text>
              </Pressable>
              <Pressable 
                style={{ flex: 1, paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: uploadType === 'file' ? T.accent : 'transparent', alignItems: 'center' }}
                onPress={() => setUploadType('file')}
              >
                <Text style={{ color: uploadType === 'file' ? T.accent : T.muted, fontWeight: '700' }}>Upload File</Text>
              </Pressable>
            </View>
            
            <TextInput
              style={[S.modalInput, { color: T.text, backgroundColor: T.surface2, borderColor: T.borderLow }]}
              placeholder="Resource Title"
              placeholderTextColor={T.subtle}
              value={newResTitle}
              onChangeText={setNewResTitle}
            />
            
            {uploadType === 'link' ? (
              <TextInput
                style={[S.modalInput, { color: T.text, backgroundColor: T.surface2, borderColor: T.borderLow }]}
                placeholder="URL (e.g. https://react.dev)"
                placeholderTextColor={T.subtle}
                value={newResUrl}
                onChangeText={setNewResUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            ) : (
              <Pressable 
                style={[S.modalInput, { backgroundColor: T.surface2, borderColor: T.borderLow, borderStyle: 'dashed', alignItems: 'center', paddingVertical: 24 }]}
                onPress={pickDocument}
              >
                <Text style={{ fontSize: 24, marginBottom: 8 }}>📄</Text>
                {selectedFile ? (
                  <Text style={{ color: T.accent, fontWeight: '700', textAlign: 'center' }}>{selectedFile.name}</Text>
                ) : (
                  <Text style={{ color: T.muted, textAlign: 'center' }}>Tap to select PDF or Document</Text>
                )}
              </Pressable>
            )}

            <View style={S.modalActions}>
              <Pressable style={S.modalBtn} onPress={() => setModalVisible(false)}>
                <Text style={{ color: T.muted, fontWeight: '700' }}>Cancel</Text>
              </Pressable>
              <Pressable style={[S.modalBtn, { backgroundColor: T.accent }]} onPress={handleSaveResource}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Add Resource</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const S = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  actions: { flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap' },
  searchInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, width: 220, fontSize: 14 },
  uploadBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  
  scroll: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  
  card: { padding: 20, borderRadius: 16, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  typeIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  resTitle: { fontSize: 16, fontWeight: '800' },
  resAdded: { fontSize: 12, marginTop: 4 },
  menuBtn: { padding: 8 },

  cohortsList: { paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  cohortBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 400, padding: 24, borderRadius: 20, borderWidth: 1 },
  modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8 },
  modalInput: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 15 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  modalBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }
});

export default MentorLibraryTab;
