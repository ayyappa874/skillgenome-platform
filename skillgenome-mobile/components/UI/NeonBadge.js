import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Color, FontFamily } from '../../GlobalStyles';

const NeonBadge = ({ 
  text, 
  color = 'cyan', // 'cyan', 'green', 'violet', 'orange'
  isDarkMode = true, 
  showDot = true,
  style 
}) => {
  let themeColor = Color.colorCyan50;
  let lightThemeColor = '#0284c7';
  let bgDark = 'rgba(0, 212, 255, 0.15)';
  let bgLight = 'rgba(2, 132, 199, 0.1)';

  switch (color) {
    case 'green':
      themeColor = Color.colorSpringGreen39;
      lightThemeColor = '#059669';
      bgDark = 'rgba(16, 185, 129, 0.15)';
      bgLight = 'rgba(16, 185, 129, 0.1)';
      break;
    case 'violet':
      themeColor = Color.colorViolet58;
      lightThemeColor = '#6d28d9';
      bgDark = 'rgba(124, 58, 237, 0.15)';
      bgLight = 'rgba(124, 58, 237, 0.1)';
      break;
    case 'orange':
      themeColor = Color.colorOrange50;
      lightThemeColor = '#ea580c';
      bgDark = 'rgba(255, 153, 0, 0.15)';
      bgLight = 'rgba(234, 88, 12, 0.1)';
      break;
  }

  const activeColor = isDarkMode ? themeColor : lightThemeColor;
  const activeBg = isDarkMode ? bgDark : bgLight;

  return (
    <View style={[styles.badge, { backgroundColor: activeBg }, style]}>
      {showDot && <View style={[styles.dot, { backgroundColor: activeColor }]} />}
      <Text style={[styles.text, { color: activeColor }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: 10,
    fontFamily: FontFamily.soraBold,
  }
});

export default NeonBadge;
