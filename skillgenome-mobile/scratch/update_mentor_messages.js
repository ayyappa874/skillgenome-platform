const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/components/MentorMessagesTab.js';
let content = fs.readFileSync(path, 'utf8');

const fetchMessagesOld = `    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const { data, error } = await supabase
          .from('mentor_messages')
          .select('*')
          .eq('mentor_id', profile.id)
          .eq('student_id', activeChat.id)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        console.warn('Error fetching messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();`;

const fetchMessagesNew = `    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        
        // Find existing conversation
        const { data: myConvs } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('profile_id', profile.id);
          
        let convId = null;
        if (myConvs && myConvs.length > 0) {
          const { data: sharedConvs } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .in('conversation_id', myConvs.map(c => c.conversation_id))
            .eq('profile_id', activeChat.id);
            
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
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.warn('Error fetching messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();`;

content = content.replace(fetchMessagesOld, fetchMessagesNew);

const handleSendOld = `    try {
      const { error } = await supabase.from('mentor_messages').insert({
        mentor_id: profile.id,
        student_id: activeChat.id,
        message: textToSend,
        sender_type: 'mentor'
      });
      if (error) throw error;
    } catch (err) {
      console.warn("Error sending message", err);
    }`;

const handleSendNew = `    try {
      let convId = activeChat.conversationId;
      
      if (!convId) {
        const { data: newConv } = await supabase.from('conversations').insert({ type: 'mentorship' }).select().single();
        if (newConv) {
          convId = newConv.id;
          activeChat.conversationId = convId;
          await supabase.from('conversation_participants').insert([
            { conversation_id: convId, profile_id: profile.id },
            { conversation_id: convId, profile_id: activeChat.id }
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
    }`;

content = content.replace(handleSendOld, handleSendNew);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated MentorMessagesTab to use conversations schema");
