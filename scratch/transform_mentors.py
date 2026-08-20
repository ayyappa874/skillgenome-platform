import re

filepath = "c:/Users/ASUS/Desktop/skill - Copy/skillgenome/screens/MentorsScreen.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update MentorsScreen signature and insert getStyles hook
old_screen_sig = """const MentorsScreen = ({ 
  onBack, 
  onOpenNext, 
  onOpenDailyQuiz, 
  onOpenDailyLearning, 
  jobs = [], 
  onSelectJob,
  profile = {},
  skills = [],
  resumeAnalysis = null,
  githubAnalysis = null,
  thoughtAnalysis = null,
  emotionAnalysis = null,
  onOpenChat
}) => {"""

new_screen_sig = """const MentorsScreen = ({ 
  onBack, 
  onOpenNext, 
  onOpenDailyQuiz, 
  onOpenDailyLearning, 
  jobs = [], 
  onSelectJob,
  profile = {},
  skills = [],
  resumeAnalysis = null,
  githubAnalysis = null,
  thoughtAnalysis = null,
  emotionAnalysis = null,
  onOpenChat,
  isDarkMode = true,
  language = 'English'
}) => {
  const styles = React.useMemo(() => getStyles(isDarkMode), [isDarkMode]);"""

if old_screen_sig in content:
    content = content.replace(old_screen_sig, new_screen_sig)
    print("MentorsScreen signature updated.")
else:
    print("ERROR: MentorsScreen signature not found!")

# 2. Update MentorCard signature
old_card_sig = """const MentorCard = ({ 
  name, 
  role, 
  company, 
  rating, 
  bio, 
  status, 
  isRecommended, 
  reviews = [], 
  onChatPress, 
  onRequestPress, 
  onWithdrawPress,
  onSubmitReview 
}) => {"""

new_card_sig = """const MentorCard = ({ 
  name, 
  role, 
  company, 
  rating, 
  bio, 
  status, 
  isRecommended, 
  reviews = [], 
  onChatPress, 
  onRequestPress, 
  onWithdrawPress,
  onSubmitReview,
  isDarkMode = true
}) => {"""

if old_card_sig in content:
    content = content.replace(old_card_sig, new_card_sig)
    print("MentorCard signature updated.")
else:
    print("ERROR: MentorCard signature not found!")

# 3. Update MentorCard instantiation inside MentorsScreen render to pass isDarkMode={isDarkMode}
old_instantiation = """                    onChatPress={() => typeof onOpenChat === 'function' && onOpenChat(mentor)}
                      onRequestPress={() => handleOpenRequest(mentor)}
                      onWithdrawPress={() => handleWithdrawRequest(mentor)}
                      onSubmitReview={(ratingVal, textVal) => handleSubmitReview(mentor.id, ratingVal, textVal)}
                    />"""

new_instantiation = """                    onChatPress={() => typeof onOpenChat === 'function' && onOpenChat(mentor)}
                      onRequestPress={() => handleOpenRequest(mentor)}
                      onWithdrawPress={() => handleWithdrawRequest(mentor)}
                      onSubmitReview={(ratingVal, textVal) => handleSubmitReview(mentor.id, ratingVal, textVal)}
                      isDarkMode={isDarkMode}
                    />"""

if old_instantiation in content:
    content = content.replace(old_instantiation, new_instantiation)
    print("MentorCard instantiation in render updated.")
else:
    # Try alternate indentation format
    old_inst_2 = """                      onChatPress={() => typeof onOpenChat === 'function' && onOpenChat(mentor)}
                      onRequestPress={() => handleOpenRequest(mentor)}
                      onWithdrawPress={() => handleWithdrawRequest(mentor)}
                      onSubmitReview={(ratingVal, textVal) => handleSubmitReview(mentor.id, ratingVal, textVal)}
                    />"""
    new_inst_2 = """                      onChatPress={() => typeof onOpenChat === 'function' && onOpenChat(mentor)}
                      onRequestPress={() => handleOpenRequest(mentor)}
                      onWithdrawPress={() => handleWithdrawRequest(mentor)}
                      onSubmitReview={(ratingVal, textVal) => handleSubmitReview(mentor.id, ratingVal, textVal)}
                      isDarkMode={isDarkMode}
                    />"""
    if old_inst_2 in content:
        content = content.replace(old_inst_2, new_inst_2)
        print("MentorCard instantiation (format 2) in render updated.")
    else:
        print("ERROR: MentorCard instantiation in render not found!")

# 4. Replace hardcoded style variables inside MentorCard render
replacements_in_card = [
    (
        "borderColor: 'rgba(255, 255, 255, 0.08)'",
        "borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#cbd5e1'"
    ),
    (
        "color: Color.colorWhiteSolid || \"#ffffff\"",
        "color: isDarkMode ? (Color.colorWhiteSolid || \"#ffffff\") : '#0f172a'"
    ),
    (
        "backgroundColor: 'rgba(255, 255, 255, 0.01)'",
        "backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.01)' : '#f8fafc'"
    ),
    (
        "borderColor: 'rgba(255, 255, 255, 0.06)'",
        "borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#cbd5e1'"
    ),
    (
        "color: '#9AA0B2'",
        "color: isDarkMode ? '#9AA0B2' : '#334155'"
    ),
    (
        "backgroundColor: 'rgba(0, 212, 255, 0.02)'",
        "backgroundColor: isDarkMode ? 'rgba(0, 212, 255, 0.02)' : 'rgba(0, 212, 255, 0.04)'"
    ),
    (
        "borderColor: 'rgba(0, 212, 255, 0.12)'",
        "borderColor: isDarkMode ? 'rgba(0, 212, 255, 0.12)' : 'rgba(0, 212, 255, 0.25)'"
    ),
    (
        """                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: 8,
                  padding: 8,
                  color: Color.colorWhiteSolid || "#ffffff",
                  fontSize: 11.5,
                  minHeight: 48,
                  textAlignVertical: 'top'
                }}""",
        """                style={{
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
                  borderWidth: 1,
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#cbd5e1',
                  borderRadius: 8,
                  padding: 8,
                  color: isDarkMode ? (Color.colorWhiteSolid || "#ffffff") : '#0f172a',
                  fontSize: 11.5,
                  minHeight: 48,
                  textAlignVertical: 'top'
                }}"""
    ),
    (
        "placeholderTextColor=\"#5a5a7a\"",
        "placeholderTextColor={isDarkMode ? \"#5a5a7a\" : \"#64748b\"}"
    ),
    (
        "placeholderTextColor: '#5a5a7a'",
        "placeholderTextColor: isDarkMode ? '#5a5a7a' : '#64748b'"
    )
]

for old_val, new_val in replacements_in_card:
    if old_val in content:
        content = content.replace(old_val, new_val)
        print(f"Replaced card inline style: {old_val[:40]}...")
    else:
        print(f"INFO: Card style pattern not found: {old_val[:40]}")

# 5. Extract and rewrite styles block
styles_start_pattern = "const styles = StyleSheet.create({"
styles_start_idx = content.find(styles_start_pattern)

if styles_start_idx != -1:
    print(f"Found styles stylesheet start at index {styles_start_idx}.")
    
    before_styles = content[:styles_start_idx]
    styles_content = content[styles_start_idx:]
    
    # Replace style definition block
    styles_content = styles_content.replace(styles_start_pattern, """const getStyles = (isDarkMode) => {
  const bgStyle = isDarkMode ? (Color.appPrimaryBackground || '#060612') : '#f8fafc';
  const cardBg = isDarkMode ? (Color.colorBlue11 || '#1a1f30') : '#ffffff';
  const elementBg = isDarkMode ? (Color.colorBlue11 || '#1a1f30') : '#ffffff';
  const borderStyle = isDarkMode ? 'rgba(255, 255, 255, 0.07)' : '#cbd5e1';
  const borderLight = isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#cbd5e1';
  const textPrimary = isDarkMode ? (Color.colorWhiteSolid || '#ffffff') : '#0f172a';
  const textSecondary = isDarkMode ? '#9AA0B2' : '#475569';
  const textMute = isDarkMode ? '#5a5a7a' : '#64748b';
  const activeTabBg = isDarkMode ? (Color.colorBlue19 || '#232840') : '#bae6fd';
  const activeTabBorder = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#bae6fd';
  
  return StyleSheet.create({""", 1)

    # Perform dynamic replacements in stylesheet
    styles_replacements = [
        ("backgroundColor: Color.appPrimaryBackground || '#060612'", "backgroundColor: bgStyle"),
        ("backgroundColor: Color.colorBlue11 || '#1a1f30'", "backgroundColor: cardBg"),
        ("backgroundColor: Color.colorBlue11 || '#1a1f30'", "backgroundColor: cardBg"),
        ("borderColor: 'rgba(255, 255, 255, 0.07)'", "borderColor: borderStyle"),
        ("borderColor: 'rgba(255, 255, 255, 0.06)'", "borderColor: borderLight"),
        ("borderColor: 'rgba(255, 255, 255, 0.08)'", "borderColor: activeTabBorder"),
        ("color: Color.colorWhiteSolid", "color: textPrimary"),
        ("color: Color.colorWhiteSolid || '#ffffff'", "color: textPrimary"),
        ("color: '#9AA0B2'", "color: textSecondary"),
        ("color: \"#5a5a7a\"", "color: textMute"),
        ("color: '#5a5a7a'", "color: textMute"),
        ("backgroundColor: Color.colorBlue19 || '#232840'", "backgroundColor: activeTabBg"),
        ("backgroundColor: '#1a1f30'", "backgroundColor: cardBg"),
        ("backgroundColor: '#0a0d18'", "backgroundColor: cardBg"),
        ("borderColor: 'rgba(0, 212, 255, 0.15)'", "borderColor: borderStyle"),
        ("color: '#060612'", "color: isDarkMode ? '#060612' : '#0f172a'"),
        ("color: Color.appPrimaryBackground || '#060612'", "color: isDarkMode ? (Color.appPrimaryBackground || '#060612') : '#0f172a'"),
    ]

    for old_val, new_val in styles_replacements:
        styles_content = styles_content.replace(old_val, new_val)
        print(f"Replaced stylesheet value: {old_val} -> {new_val}")

    # Add closing bracket for getStyles before export statement
    export_pattern = "export default MentorsScreen;"
    export_idx = styles_content.find(export_pattern)
    if export_idx != -1:
        styles_content = styles_content[:export_idx] + "};\n\n" + styles_content[export_idx:]
        print("Styles closed and export signature corrected.")
    else:
        print("WARNING: export default statement not found at end of styles.")

    content = before_styles + styles_content

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("MentorsScreen.js transformed successfully!")
else:
    print("WARNING: StyleSheet.create pattern not found in file.")
