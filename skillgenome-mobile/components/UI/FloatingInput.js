import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Animated } from 'react-native';
import { Color, FontFamily } from '../../GlobalStyles';

const FloatingInput = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  isDarkMode = true, 
  multiline = false,
  numberOfLines = 1,
  keyboardType = "default",
  style
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const cardBg = isDarkMode ? Color.colorAzure11 || '#161a22' : '#ffffff';
  const borderStyle = isDarkMode ? Color.colorBlue19 || '#232840' : '#cbd5e1';
  const textPrimary = isDarkMode ? '#ffffff' : '#0f172a';
  const textSecondary = isDarkMode ? '#94a3b8' : '#475569';
  const activeColor = isDarkMode ? Color.colorCyan50 : '#0284c7';

  return (
    <View style={[styles.container, style]}>
      <Text style={[
        styles.label, 
        { color: isFocused || value ? activeColor : textSecondary }
      ]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          { 
            backgroundColor: cardBg, 
            color: textPrimary, 
            borderColor: isFocused ? activeColor : borderStyle,
            borderWidth: isFocused ? 2 : 1.5,
          }
        ]}
        placeholder={placeholder}
        placeholderTextColor={textSecondary}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: "100%",
  },
  label: {
    fontFamily: FontFamily.soraBold,
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    fontFamily: FontFamily.soraSemiBold,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  multiline: {
    minHeight: 140,
    textAlignVertical: "top",
    paddingTop: 16,
  }
});

export default FloatingInput;
