import re

with open('skillgenome/screens/Screen11.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add BlurView, Animated, Dimensions to imports
content = content.replace(
    'import { Alert, ScrollView, Text, StyleSheet, View, Image, Pressable, TextInput, FlatList } from "react-native";',
    'import { Alert, ScrollView, Text, StyleSheet, View, Image, Pressable, TextInput, FlatList, Animated, Dimensions, Easing } from "react-native";\nimport { BlurView } from "expo-blur";\nimport { LinearGradient } from "expo-linear-gradient";'
)

# 2. Add Animated components
content = content.replace(
    'const Screen11 = ({',
    '''
const { width, height } = Dimensions.get('window');

// --- PREMIUM ANIMATED COMPONENTS ---

const AnimatedPressable = ({ children, style, onPress, ...props }) => {
  const scale = React.useRef(new Animated.Value(1)).current;
  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 5,
      tension: 100
    }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 100
    }).start();
  };
  return (
    <Animated.View style={[{ transform: [{ scale }] }]}>
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress} style={style} {...props}>
        {children}
      </Pressable>
    </Animated.View>
  );
};

const GlassCard = ({ children, style, glowColor, isDarkMode }) => {
  return (
    <View style={[style, { overflow: 'visible' }]}>
      {/* Ambient Glow */}
      {glowColor && (
        <View style={{
          position: 'absolute',
          top: 10, left: 10, right: 10, bottom: -10,
          backgroundColor: glowColor,
          opacity: isDarkMode ? 0.15 : 0.25,
          borderRadius: 20,
          transform: [{ scale: 0.95 }]
        }} />
      )}
      <BlurView intensity={isDarkMode ? 30 : 60} tint={isDarkMode ? "dark" : "light"} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />
      <View style={{
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.4)",
        backgroundColor: isDarkMode ? "rgba(20,25,35,0.4)" : "rgba(255,255,255,0.5)",
      }} />
      <View style={{ padding: 18, zIndex: 2 }}>{children}</View>
    </View>
  );
};

// --- MAIN SCREEN ---
const Screen11 = ({'''
)

# 3. Inject Background Blobs
content = content.replace(
    '<View style={[styles.root, { backgroundColor: bgStyle }]}>',
    '''<View style={[styles.root, { backgroundColor: bgStyle }]}>
      {/* Premium Background Blobs */}
      <View style={StyleSheet.absoluteFill}>
         <View style={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: isDarkMode ? 'rgba(0, 212, 255, 0.15)' : 'rgba(0, 212, 255, 0.2)', filter: 'blur(60px)' }} />
         <View style={{ position: 'absolute', top: 300, right: -150, width: 350, height: 350, borderRadius: 175, backgroundColor: isDarkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.2)', filter: 'blur(60px)' }} />
         <View style={{ position: 'absolute', bottom: -50, left: 50, width: 250, height: 250, borderRadius: 125, backgroundColor: isDarkMode ? 'rgba(233, 30, 99, 0.1)' : 'rgba(233, 30, 99, 0.15)', filter: 'blur(60px)' }} />
      </View>
'''
)

# 4. Replace Pressable with AnimatedPressable (only for main cards to avoid breaking nav)
content = content.replace('<Pressable\\n                style={[\\n                  styles.moduleStatusCard,', '<AnimatedPressable\\n                style={[\\n                  styles.moduleStatusCard,')
content = content.replace('</Pressable>\\n\\n              <Pressable\\n                style={[\\n                  styles.moduleStatusCard,', '</AnimatedPressable>\\n\\n              <AnimatedPressable\\n                style={[\\n                  styles.moduleStatusCard,')
content = content.replace('</Pressable>\\n            </View>\\n          </View>', '</AnimatedPressable>\\n            </View>\\n          </View>')

# (Save back)
with open('skillgenome/screens/Screen11_patched.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied successfully.")
