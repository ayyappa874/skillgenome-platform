import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Color } from '../../GlobalStyles';

const GlassCard = ({ children, style, isDarkMode = true, intensity = 'medium' }) => {
  const cardBg = isDarkMode ? Color.colorAzure11 || '#161a22' : '#ffffff';
  const borderStyle = isDarkMode ? Color.colorBlue19 || '#232840' : '#cbd5e1';

  let shadowOpacity = 0.04;
  let elevation = 3;
  let radius = 20;

  if (intensity === 'high') {
    shadowOpacity = 0.08;
    elevation = 6;
    radius = 24;
  } else if (intensity === 'low') {
    shadowOpacity = 0.02;
    elevation = 1;
    radius = 16;
  }

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: cardBg,
        borderColor: borderStyle,
        borderRadius: radius,
        shadowOpacity,
        elevation
      },
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  }
});

export default GlassCard;
