import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';

const DNAHelix = ({ size = 120, rowCount = 14 }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [anim]);

  const rows = [];
  const dotSize = size * 0.12;
  const lineWidth = size * 0.6;
  const rowHeight = size / rowCount;

  for (let i = 0; i < rowCount; i++) {
    const phaseOffset = i * (360 / rowCount); // Distribute a full wave across the rows
    
    // Interpolate rotation: 0 -> 1 becomes phaseOffset -> 360 + phaseOffset
    const rotateY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [`${phaseOffset}deg`, `${360 + phaseOffset}deg`],
    });

    rows.push(
      <Animated.View
        key={i}
        style={[
          styles.row,
          {
            height: rowHeight,
            width: lineWidth,
            transform: [{ rotateY }],
          },
        ]}
      >
        {/* We need to offset the line center manually since transform translateX with percentages doesn't work well on all React Native versions.
            Instead, we just position it precisely. */}
        <View style={[styles.line, { width: lineWidth - dotSize, left: dotSize / 2 }]} />
        <View style={[styles.dot, styles.dotLeft, { width: dotSize, height: dotSize, borderRadius: dotSize / 2 }]} />
        <View style={[styles.dot, styles.dotRight, { width: dotSize, height: dotSize, borderRadius: dotSize / 2 }]} />
      </Animated.View>
    );
  }

  return <View style={[styles.container, { height: size, width: lineWidth }]}>{rows}</View>;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  line: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  dot: {
    position: 'absolute',
  },
  dotLeft: {
    left: 0,
    backgroundColor: '#06b6d4', // Cyan
  },
  dotRight: {
    right: 0,
    backgroundColor: '#7c3aed', // Violet
  },
});

export default DNAHelix;
