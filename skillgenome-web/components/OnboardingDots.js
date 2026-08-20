import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Color } from "../GlobalStyles";

const OnboardingDots = ({ activeIndex = 0 }) => {
  return (
    <View style={styles.container}>
      {[0, 1, 2].map((index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === activeIndex ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 20,
  },
  dot: {
    borderRadius: 999,
  },
  dotActive: {
    width: 44,
    height: 12,
    backgroundColor: Color.colorCyan50,
  },
  dotInactive: {
    width: 12,
    height: 12,
    backgroundColor: Color.colorBlue19,
  },
});

export default OnboardingDots;
