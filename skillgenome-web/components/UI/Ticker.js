import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const COMPANIES = [
  "Google", "Apple", "Microsoft", "Amazon", "Meta",
  "Netflix", "Tesla", "Nvidia", "Samsung", "IBM",
  "Intel", "Adobe", "Salesforce", "Uber", "Spotify",
  "Goldman Sachs", "JPMorgan", "McKinsey", "Deloitte", "Airbnb"
];

const Ticker = () => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [setWidth, setSetWidth] = useState(0);

  useEffect(() => {
    if (!setWidth) return;
    translateX.setValue(0);
    const scrollAnimation = Animated.loop(
      Animated.timing(translateX, {
        toValue: -setWidth,
        duration: setWidth * 24, // speed: px per ms
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    scrollAnimation.start();
    return () => scrollAnimation.stop();
  }, [setWidth]);

  const renderRow = (onLayout) => (
    <View style={styles.track} onLayout={onLayout}>
      {COMPANIES.map((company, index) => (
        <View key={index} style={styles.tickItem}>
          <Text style={styles.tickText}>{company}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.tickerSection}>
      <Text style={styles.tickerLabel}>CAREER DNA MATCHED AT</Text>
      <View style={styles.tickerMask}>
        <Animated.View style={[styles.tickerMover, { transform: [{ translateX }] }]}>
          {renderRow((e) => setSetWidth(e.nativeEvent.layout.width))}
          {renderRow()}
        </Animated.View>
        <LinearGradient
          colors={["#090b12", "transparent", "transparent", "#090b12"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tickerSection: {
    marginTop: 78,
    position: "relative",
  },
  tickerLabel: {
    fontFamily: "monospace",
    fontSize: 11,
    letterSpacing: 2,
    color: "#8d93a8",
    textAlign: "center",
    marginBottom: 16,
  },
  tickerMask: {
    position: "relative",
    overflow: "hidden",
  },
  tickerMover: {
    flexDirection: "row",
    width: 4000, 
  },
  track: {
    flexDirection: "row",
    alignItems: "center",
  },
  tickItem: {
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.08)",
  },
  tickText: {
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "600",
    color: "#eef1f6",
    letterSpacing: 0.5,
  },
});

export default Ticker;
