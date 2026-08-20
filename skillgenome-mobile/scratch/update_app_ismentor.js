const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js';
let content = fs.readFileSync(path, 'utf8');

// Add isMentor to mappedConversations
const mappedOld = `                partnerId: otherParticipant.id,
                partnerRole: otherParticipant.title || otherParticipant.role
              };`;
const mappedNew = `                partnerId: otherParticipant.id,
                partnerRole: otherParticipant.title || otherParticipant.role,
                isMentor: otherParticipant.role === 'mentor'
              };`;
content = content.replace(mappedOld, mappedNew);

// Add isMentor to suggestedConversations
const suggestedOld = `          isPeerSuggest: true,
          peerProfile: peer
        }));`;
const suggestedNew = `          isPeerSuggest: true,
          peerProfile: peer,
          isMentor: peer.role === 'mentor'
        }));`;
content = content.replace(suggestedOld, suggestedNew);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated App.js with isMentor mapping");
