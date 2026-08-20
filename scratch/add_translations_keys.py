filepath = "c:/Users/ASUS/Desktop/skill - Copy/skillgenome/utils/translations.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# English keys to insert before the last closing brace of the English dictionary
# Hindi keys to insert before the last closing brace of the Hindi dictionary
# Telugu keys to insert before the last closing brace of the Telugu dictionary

# Let's find the closing brace of English, which is right before "Hindi: {"
english_end_idx = content.find("Hindi: {")
if english_end_idx != -1:
    # Look backwards for the last closing brace of the English dictionary
    brace_idx = content.rfind("}", 0, english_end_idx)
    if brace_idx != -1:
        english_keys = """
    welcomeBack: "Welcome back,",
    yourDashboardIsReady: "Your dashboard is ready",
    home: "Home",
    aiChatShort: "AI Chat",
    explore: "Explore",
    community: "Community",
    back: "Back",
    search: "Search",
    createPost: "Create Post",
    post: "Post",
    share: "Share",
    delete: "Delete",
    comments: "Comments",
    chat: "Chat",
    messages: "Messages",
    studyGroup: "Study Group",
    connections: "Connections",
    suggested: "Suggested",
    all: "All",
    pending: "Pending",
    connect: "Connect",
    disconnect: "Disconnect",
    requestMentorship: "Request Mentorship",
    requested: "Requested",
    openChat: "Open Chat",
    send: "Send",
    invite: "Invite",
    """
        content = content[:brace_idx] + english_keys + content[brace_idx:]
        print("English translation keys added.")

# Re-read index for Hindi end (since content size changed)
hindi_end_idx = content.find("Telugu: {")
if hindi_end_idx != -1:
    brace_idx = content.rfind("}", 0, hindi_end_idx)
    if brace_idx != -1:
        hindi_keys = """
    welcomeBack: "आपका स्वागत है,",
    yourDashboardIsReady: "आपका डैशबोर्ड तैयार है",
    home: "होम",
    aiChatShort: "एआई चैट",
    explore: "खोज",
    community: "कम्युनिटी",
    back: "पीछे",
    search: "खोजें",
    createPost: "पोस्ट बनाएं",
    post: "पोस्ट",
    share: "साझा करें",
    delete: "हटाएं",
    comments: "टिप्पणियाँ",
    chat: "चैट",
    messages: "संदेश",
    studyGroup: "अध्ययन समूह",
    connections: "कनेक्शन",
    suggested: "सुझाए गए",
    all: "सभी",
    pending: "लंबित",
    connect: "कनेक्ट",
    disconnect: "डिस्कनेक्ट",
    requestMentorship: "मेंटरशिप का अनुरोध करें",
    requested: "अनुरोध किया गया",
    openChat: "चैट खोलें",
    send: "भेजें",
    invite: "आमंत्रित करें",
    """
        content = content[:brace_idx] + hindi_keys + content[brace_idx:]
        print("Hindi translation keys added.")

# Find Telugu end, which is right before "export const t = "
telugu_end_idx = content.find("export const t = ")
if telugu_end_idx != -1:
    brace_idx = content.rfind("}", 0, telugu_end_idx)
    if brace_idx != -1:
        telugu_keys = """
    welcomeBack: "మళ్లీ స్వాగతం,",
    yourDashboardIsReady: "మీ డ్యాష్‌బోర్డ్ సిద్ధంగా ఉంది",
    home: "హోమ్",
    aiChatShort: "AI చాట్",
    explore: "అన్వేషణ",
    community: "కమ్యూనిటీ",
    back: "వెనుకకు",
    search: "శోధన",
    createPost: "పోస్ట్ సృష్టించు",
    post: "పోస్ట్",
    share: "భాగస్వామ్యం",
    delete: "తొలగించు",
    comments: "వ్యాఖ్యలు",
    chat: "చాట్",
    messages: "సందేశాలు",
    studyGroup: "అధ్యయనం సమూహం",
    connections: "కనెక్షన్లు",
    suggested: "సూచించబడినవి",
    all: "అన్నీ",
    pending: "పెండింగ్‌లో ఉన్నవి",
    connect: "కనెక్ట్",
    disconnect: "డిస్‌కనెక్ట్",
    requestMentorship: "మెంటర్‌షిప్ అభ్యర్థించు",
    requested: "అభ్యర్థించబడింది",
    openChat: "చాట్ ఓపెన్ చేయి",
    send: "పంపించు",
    invite: "ఆహ్వానించండి",
    """
        content = content[:brace_idx] + telugu_keys + content[brace_idx:]
        print("Telugu translation keys added.")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("translations.js updated successfully!")
