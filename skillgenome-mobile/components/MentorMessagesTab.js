import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, useWindowDimensions, ActivityIndicator } from 'react-native';
import { supabase } from '../utils/supabase';

const MentorMessagesTab = ({ profile, T }) => {
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    const fetchContacts = async () => {
      try {
        setLoadingContacts(true);
        // Get students in mentor's cohorts
        const { data, error } = await supabase
          .from('cohorts')
          .select('cohort_students(profiles(id, name))')
          .eq('mentor_id', profile.id);
          
        if (error) throw error;
        
        let uniqueStudents = new Map();
        data.forEach(cohort => {
          if (cohort.cohort_students) {
            cohort.cohort_students.forEach(cs => {
              const p = Array.isArray(cs.profiles) ? cs.profiles[0] : cs.profiles;
              if (p && !uniqueStudents.has(p.id)) {
                uniqueStudents.set(p.id, {
                  id: p.id,
                  name: p.name || 'Anonymous',
                  role: 'Student',
                  unread: 0,
                  lastMsg: 'Tap to chat'
                });
              }
            });
          }
        });
        setContacts(Array.from(uniqueStudents.values()));
      } catch (err) {
        console.warn('Error fetching contacts:', err);
      } finally {
        setLoadingContacts(false);
      }
    };
    fetchContacts();
  }, [profile?.id]);

  useEffect(() => {
    if (!activeChat || !profile?.id) return;
    let channel = null;
    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        
        // Find existing conversation
        const { data: myConvs } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', profile.id);
          
        let convId = null;
        if (myConvs && myConvs.length > 0) {
          const { data: sharedConvs } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .in('conversation_id', myConvs.map(c => c.conversation_id))
            .eq('user_id', activeChat.id);
            
          if (sharedConvs && sharedConvs.length > 0) {
            convId = sharedConvs[0].conversation_id;
          }
        }
        
        if (convId) {
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: true });
            
          if (error) throw error;
          
          setMessages((data || []).map(m => ({
            id: m.id,
            message: m.text,
            created_at: m.created_at,
            sender_type: m.sender_id === profile.id ? 'mentor' : 'student'
          })));
          
          // Store convId on activeChat for sending
          activeChat.conversationId = convId;
          
          channel = supabase.channel(`mentor_chat_${convId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convId}` }, payload => {
              fetchMessages();
            })
            .subscribe();

        } else {
          setMessages([]);
        }
      } catch (err) {
        console.warn('Error fetching messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [activeChat, profile?.id]);

  const handleSend = async () => {
    if (!message.trim() || !activeChat || !profile?.id) return;
    
    // Optimistic UI update
    const newMsg = {
      id: Date.now().toString(),
      sender_type: 'mentor',
      mentor_id: profile.id,
      student_id: activeChat.id,
      message: message,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMsg]);
    const textToSend = message;
    setMessage('');
    
    try {
      let convId = activeChat.conversationId;
      
      if (!convId) {
        const { data: newConv } = await supabase.from('conversations').insert({ type: 'mentorship' }).select().single();
        if (newConv) {
          convId = newConv.id;
          activeChat.conversationId = convId;
          await supabase.from('conversation_participants').insert([
            { conversation_id: convId, user_id: profile.id },
            { conversation_id: convId, user_id: activeChat.id }
          ]);
        }
      }
      
      if (convId) {
        const { error } = await supabase.from('messages').insert({
          conversation_id: convId,
          sender_id: profile.id,
          text: textToSend
        });
        
        await supabase.from('conversations').update({
          last_message_text: textToSend,
          last_message_time: new Date().toISOString()
        }).eq('id', convId);
        
        if (error) throw error;
      }
    } catch (err) {
      console.warn("Error sending message", err);
    }
  };

  return (
    <View style={S.container}>
      <Text style={[S.title, { color: T.text }]}>Messages</Text>
      
      <View style={[S.chatLayout, { borderColor: T.borderLow, flexDirection: isWide ? 'row' : 'column' }]}>
        
        {/* Left Side: Contact List */}
        {(!activeChat || isWide) && (
          <View style={[S.contactList, { borderRightColor: T.borderLow, width: isWide ? 300 : '100%', borderRightWidth: isWide ? 1 : 0 }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {loadingContacts ? (
                <ActivityIndicator color={T.accent} style={{ marginTop: 20 }} />
              ) : contacts.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: T.muted, textAlign: 'center' }}>No students in your active cohorts yet.</Text>
                </View>
              ) : (
              contacts.map(c => (
                <Pressable 
                  key={c.id} 
                  style={[S.contactItem, activeChat?.id === c.id && { backgroundColor: T.surface2 }]}
                  onPress={() => setActiveChat(c)}
                >
                  <View style={[S.avatar, { backgroundColor: T.surface }]}>
                    <Text style={[S.avatarText, { color: T.text }]}>{c.name[0]}</Text>
                  </View>
                  <View style={S.contactInfo}>
                    <Text style={[S.contactName, { color: T.text }]}>{c.name}</Text>
                    <Text style={[S.contactSub, { color: T.muted }]} numberOfLines={1}>{c.lastMsg}</Text>
                  </View>
                  {c.unread > 0 && (
                    <View style={[S.unreadBadge, { backgroundColor: T.accent }]}>
                      <Text style={S.unreadText}>{c.unread}</Text>
                    </View>
                  )}
                </Pressable>
              )))}
            </ScrollView>
          </View>
        )}

        {/* Right Side: Active Chat Area */}
        {(activeChat || isWide) && (
          <View style={[S.chatArea, { display: (!isWide && !activeChat) ? 'none' : 'flex' }]}>
            {activeChat ? (
              <>
                <View style={[S.chatHeader, { borderBottomColor: T.borderLow }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {!isWide && (
                      <Pressable onPress={() => setActiveChat(null)} style={{ marginRight: 16, padding: 8, marginLeft: -8 }}>
                        <Text style={{ color: T.accent, fontSize: 18, fontWeight: '800' }}>←</Text>
                      </Pressable>
                    )}
                    <View>
                      <Text style={[S.chatHeaderName, { color: T.text }]}>{activeChat.name}</Text>
                      <Text style={[S.chatHeaderRole, { color: T.muted }]}>{activeChat.role}</Text>
                    </View>
                  </View>
                </View>
              
              <ScrollView style={S.messageScroll} contentContainerStyle={S.messageContent} showsVerticalScrollIndicator={false}>
                {loadingMessages ? (
                  <ActivityIndicator color={T.accent} />
                ) : messages.length === 0 ? (
                  <View style={{ alignItems: 'center', marginTop: 40 }}>
                    <Text style={{ color: T.muted }}>No messages yet. Send a message to start the conversation.</Text>
                  </View>
                ) : (
                messages.map(m => {
                  const isMe = m.sender_type === 'mentor';
                  return (
                    <View key={m.id} style={[S.messageBubble, isMe ? [S.myMessage, { backgroundColor: T.accent }] : [S.theirMessage, { backgroundColor: T.surface2 }]]}>
                      <Text style={[S.messageText, { color: isMe ? '#fff' : T.text }]}>{m.message}</Text>
                      <Text style={[S.messageTime, { color: isMe ? 'rgba(255,255,255,0.7)' : T.muted }]}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                  );
                }))}
              </ScrollView>
              
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={[S.inputArea, { borderTopColor: T.borderLow, backgroundColor: T.surface }]}>
                  <TextInput
                    style={[S.input, { color: T.text, backgroundColor: T.bg, borderColor: T.borderLow }]}
                    placeholder="Type a message..."
                    placeholderTextColor={T.subtle}
                    value={message}
                    onChangeText={setMessage}
                    onSubmitEditing={handleSend}
                  />
                  <Pressable style={[S.sendBtn, { backgroundColor: T.accent }]} onPress={handleSend}>
                    <Text style={S.sendBtnText}>Send</Text>
                  </Pressable>
                </View>
              </KeyboardAvoidingView>
            </>
          ) : (
              <View style={S.emptyChat}>
                <Text style={{ color: T.muted }}>Select a conversation to start messaging</Text>
              </View>
            )}
          </View>
        )}

      </View>
    </View>
  );
};

const S = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5, marginBottom: 24 },
  
  chatLayout: { flex: 1, flexDirection: 'row', borderRadius: 20, borderWidth: 1, overflow: 'hidden', minHeight: 600 },
  
  contactList: { width: 300, borderRightWidth: 1 },
  contactItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800' },
  contactInfo: { flex: 1, marginLeft: 12 },
  contactName: { fontSize: 15, fontWeight: '700' },
  contactSub: { fontSize: 13, marginTop: 4 },
  unreadBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginLeft: 8 },
  unreadText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  chatArea: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  
  chatHeader: { padding: 20, borderBottomWidth: 1 },
  chatHeaderName: { fontSize: 18, fontWeight: '800' },
  chatHeaderRole: { fontSize: 13, marginTop: 2 },
  
  messageScroll: { flex: 1 },
  messageContent: { padding: 20, gap: 16 },
  messageBubble: { maxWidth: '75%', padding: 16, borderRadius: 16 },
  myMessage: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirMessage: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTime: { fontSize: 11, marginTop: 8, alignSelf: 'flex-end' },

  inputArea: { flexDirection: 'row', padding: 16, borderTopWidth: 1, gap: 12, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15 },
  sendBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, justifyContent: 'center' },
  sendBtnText: { color: '#fff', fontWeight: '700' }
});

export default MentorMessagesTab;
