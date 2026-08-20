const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js';
let content = fs.readFileSync(path, 'utf8');

// Replace mappedConversations block
const oldMapped = `                partnerId: otherParticipant.id,
                partnerRole: otherParticipant.title || otherParticipant.role
              };`;
const newMapped = `                partnerId: otherParticipant.id,
                partnerRole: otherParticipant.title || otherParticipant.role,
                isMentor: otherParticipant.role === 'mentor'
              };`;

content = content.replace(oldMapped, newMapped);

// Replace suggestedConversations block
const oldSuggested = `          isPeerSuggest: true,
          peerProfile: peer
        }));`;
const newSuggested = `          isPeerSuggest: true,
          peerProfile: peer,
          isMentor: peer.role === 'mentor'
        }));`;

content = content.replace(oldSuggested, newSuggested);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated isMentor properly");
