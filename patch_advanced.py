import re

with open('skillgenome/screens/Screen11_patched.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace Welcome Card
code = code.replace(
    '<View style={[styles.welcomeCard, { backgroundColor: cardBg, borderColor: borderStyle }]}>',
    '<GlassCard style={styles.welcomeCard} isDarkMode={isDarkMode}>'
).replace(
    '''            </Text>
          </View>

          <View style={[styles.scoreCard''',
    '''            </Text>
          </GlassCard>

          <View style={[styles.scoreCard'''
)

# Replace Score Card
code = code.replace(
    '<View style={[styles.scoreCard, { backgroundColor: cardBg, borderColor: borderStyle }]}>',
    '<GlassCard style={styles.scoreCard} isDarkMode={isDarkMode} glowColor={isDarkMode ? "rgba(0, 212, 255, 0.5)" : "rgba(0, 212, 255, 0.8)"}>'
).replace(
    '''            </View>
          </View>

          <View style={styles.modulesStatusSection}>''',
    '''            </View>
          </GlassCard>

          <View style={styles.modulesStatusSection}>'''
)

# Replace Genome Score Badge with Animated Ring
genome_badge = '''              <View style={[styles.scoreBadge, { backgroundColor: scoreInnerBg, borderColor: borderStyle }]}>
                <Text style={styles.scoreBadgeNumber}>{computedGenomeScore}</Text>
                <Text style={[styles.scoreBadgeLabel, { color: textSecondary }]}>GENOME</Text>
              </View>'''
animated_genome_badge = '''              <View style={[styles.scoreBadge, { backgroundColor: 'transparent', borderWidth: 0 }]}>
                <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: 70, opacity: 0.8, backgroundColor: isDarkMode ? 'rgba(0, 212, 255, 0.2)' : 'rgba(0, 212, 255, 0.1)', shadowColor: '#00d4ff', shadowOpacity: 0.8, shadowRadius: 20 }]} />
                <BlurView intensity={20} tint="light" style={[StyleSheet.absoluteFill, { borderRadius: 70, overflow: 'hidden' }]} />
                <View style={[StyleSheet.absoluteFill, { borderRadius: 70, borderWidth: 2, borderColor: 'rgba(0, 212, 255, 0.4)' }]} />
                <Text style={[styles.scoreBadgeNumber, { textShadowColor: 'rgba(0, 212, 255, 0.8)', textShadowRadius: 15 }]}>{computedGenomeScore}</Text>
                <Text style={[styles.scoreBadgeLabel, { color: textSecondary }]}>GENOME</Text>
              </View>'''
code = code.replace(genome_badge, animated_genome_badge)

# Replace Module Cards to use GlassCard structure
resume_card = '''              <AnimatedPressable
                style={[
                  styles.moduleStatusCard,
                  { backgroundColor: cardBg, borderColor: borderStyle },
                  isResumeCompleted && {
                    borderColor: isDarkMode ? "rgba(0, 212, 255, 0.4)" : "rgba(0, 212, 255, 0.6)",
                    backgroundColor: isDarkMode ? "rgba(0, 212, 255, 0.04)" : "rgba(0, 212, 255, 0.08)"
                  }
                ]}'''
resume_glass = '''              <AnimatedPressable style={[styles.moduleStatusCard, { padding: 0, borderWidth: 0, backgroundColor: 'transparent' }]} onPress={() => { if (typeof onOpenUploadResume === "function") onOpenUploadResume(); }}>
                <GlassCard style={{ flex: 1, padding: 0 }} isDarkMode={isDarkMode} glowColor="#00D4FF">'''

github_card = '''              <AnimatedPressable
                style={[
                  styles.moduleStatusCard,
                  { backgroundColor: cardBg, borderColor: borderStyle },
                  isGitHubCompleted && {
                    borderColor: isDarkMode ? "rgba(0, 212, 255, 0.4)" : "rgba(0, 212, 255, 0.6)",
                    backgroundColor: isDarkMode ? "rgba(0, 212, 255, 0.04)" : "rgba(0, 212, 255, 0.08)"
                  }
                ]}'''
github_glass = '''              <AnimatedPressable style={[styles.moduleStatusCard, { padding: 0, borderWidth: 0, backgroundColor: 'transparent' }]} onPress={() => { if (typeof onOpenGitHubConnect === "function") onOpenGitHubConnect(); }}>
                <GlassCard style={{ flex: 1, padding: 0 }} isDarkMode={isDarkMode} glowColor="#4CAF50">'''

thought_card = '''              <AnimatedPressable
                style={[
                  styles.moduleStatusCard,
                  { backgroundColor: cardBg, borderColor: borderStyle },
                  isThoughtCompleted && {
                    borderColor: isDarkMode ? "rgba(0, 212, 255, 0.4)" : "rgba(0, 212, 255, 0.6)",
                    backgroundColor: isDarkMode ? "rgba(0, 212, 255, 0.04)" : "rgba(0, 212, 255, 0.08)"
                  }
                ]}'''
thought_glass = '''              <AnimatedPressable style={[styles.moduleStatusCard, { padding: 0, borderWidth: 0, backgroundColor: 'transparent' }]} onPress={() => { if (typeof onOpenThoughtPrint === "function") onOpenThoughtPrint(); }}>
                <GlassCard style={{ flex: 1, padding: 0 }} isDarkMode={isDarkMode} glowColor="#FF9800">'''

emotion_card = '''              <AnimatedPressable
                style={[
                  styles.moduleStatusCard,
                  { backgroundColor: cardBg, borderColor: borderStyle },
                  isEmotionCompleted && {
                    borderColor: isDarkMode ? "rgba(0, 212, 255, 0.4)" : "rgba(0, 212, 255, 0.6)",
                    backgroundColor: isDarkMode ? "rgba(0, 212, 255, 0.04)" : "rgba(0, 212, 255, 0.08)"
                  }
                ]}'''
emotion_glass = '''              <AnimatedPressable style={[styles.moduleStatusCard, { padding: 0, borderWidth: 0, backgroundColor: 'transparent' }]} onPress={() => { if (typeof onOpenEmotionPrint === "function") onOpenEmotionPrint(); }}>
                <GlassCard style={{ flex: 1, padding: 0 }} isDarkMode={isDarkMode} glowColor="#9C27B0">'''

# Inject module cards
code = re.sub(r'<AnimatedPressable[^>]*onPress=\{[^>]*onOpenUploadResume[^>]*\}>', resume_glass, code)
code = re.sub(r'<AnimatedPressable[^>]*onPress=\{[^>]*onOpenGitHubConnect[^>]*\}>', github_glass, code)
code = re.sub(r'<AnimatedPressable[^>]*onPress=\{[^>]*onOpenThoughtPrint[^>]*\}>', thought_glass, code)
code = re.sub(r'<AnimatedPressable[^>]*onPress=\{[^>]*onOpenEmotionPrint[^>]*\}>', emotion_glass, code)

# Close GlassCard tags before the AnimatedPressable closing tag
code = code.replace('</AnimatedPressable>', '</GlassCard>\n              </AnimatedPressable>')

# Ensure floating dock nav
nav = '''      <View style={[styles.bottomNav, { backgroundColor: bottomNavBg, borderTopColor: borderStyle }]}>'''
floating_nav = '''      <BlurView intensity={isDarkMode ? 40 : 80} tint={isDarkMode ? "dark" : "light"} style={[styles.bottomNav, { backgroundColor: isDarkMode ? 'rgba(20,25,35,0.6)' : 'rgba(255,255,255,0.7)', borderTopColor: 'transparent', position: 'absolute', bottom: 20, left: 20, right: 20, borderRadius: 30, borderWidth: 1, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)', overflow: 'hidden' }]}>'''
code = code.replace(nav, floating_nav)
code = code.replace('</View>\n    </View>', '</BlurView>\n    </View>')

# Update styling for nav to fit floating dock
code = code.replace(
    'paddingBottom: 20,',
    'paddingBottom: 100,'
)

with open('skillgenome/screens/Screen11_final.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Advanced patch complete.")
