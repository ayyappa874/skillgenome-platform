import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const parseColor = (input) => {
  if (typeof input !== "string") {
    return { r: 255, g: 255, b: 255, a: 1 };
  }

  const value = input.trim();
  if (value.startsWith("#")) {
    const normalized = value.length === 4
      ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
      : value;
    const parsed = Number.parseInt(normalized.slice(1), 16);
    if (Number.isNaN(parsed)) {
      return { r: 255, g: 255, b: 255, a: 1 };
    }

    return {
      r: (parsed >> 16) & 255,
      g: (parsed >> 8) & 255,
      b: parsed & 255,
      a: 1,
    };
  }

  const rgbaMatch = value.match(/rgba?\(([^)]+)\)/i);
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(",").map((part) => part.trim());
    const r = Number.parseFloat(parts[0]);
    const g = Number.parseFloat(parts[1]);
    const b = Number.parseFloat(parts[2]);
    const a = parts.length > 3 ? Number.parseFloat(parts[3]) : 1;
    if ([r, g, b, a].some((part) => Number.isNaN(part))) {
      return { r: 255, g: 255, b: 255, a: 1 };
    }

    return {
      r: clamp(Math.round(r), 0, 255),
      g: clamp(Math.round(g), 0, 255),
      b: clamp(Math.round(b), 0, 255),
      a: clamp(a, 0, 1),
    };
  }

  return { r: 255, g: 255, b: 255, a: 1 };
};

const toRgba = ({ r, g, b, a }) => `rgba(${r}, ${g}, ${b}, ${a})`;

const mixColor = (start, end, t) => ({
  r: Math.round(start.r + (end.r - start.r) * t),
  g: Math.round(start.g + (end.g - start.g) * t),
  b: Math.round(start.b + (end.b - start.b) * t),
  a: start.a + (end.a - start.a) * t,
});

const normalizeStops = (colors, locations) => {
  const safeColors = Array.isArray(colors) && colors.length > 0 ? colors : ["transparent"];
  const parsedColors = safeColors.map(parseColor);

  if (!Array.isArray(locations) || locations.length !== parsedColors.length) {
    return parsedColors.map((color, index) => ({
      color,
      position: parsedColors.length === 1 ? 0 : index / (parsedColors.length - 1),
    }));
  }

  return parsedColors.map((color, index) => ({
    color,
    position: clamp(Number.parseFloat(locations[index]), 0, 1),
  }));
};

const buildPalette = (colors, locations, steps = 24) => {
  const stops = normalizeStops(colors, locations);
  const palette = [];

  for (let index = 0; index < steps; index += 1) {
    const position = steps === 1 ? 0 : index / (steps - 1);
    let leftStop = stops[0];
    let rightStop = stops[stops.length - 1];

    for (let stopIndex = 0; stopIndex < stops.length - 1; stopIndex += 1) {
      const current = stops[stopIndex];
      const next = stops[stopIndex + 1];
      if (position >= current.position && position <= next.position) {
        leftStop = current;
        rightStop = next;
        break;
      }
    }

    const range = rightStop.position - leftStop.position || 1;
    const localT = clamp((position - leftStop.position) / range, 0, 1);
    palette.push(toRgba(mixColor(leftStop.color, rightStop.color, localT)));
  }

  return palette;
};

const getAngle = (start, end) => {
  const safeStart = Array.isArray(start) && start.length === 2 ? start : [0, 0];
  const safeEnd = Array.isArray(end) && end.length === 2 ? end : [1, 1];
  const dx = safeEnd[0] - safeStart[0];
  const dy = safeEnd[1] - safeStart[1];
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

const SafeLinearGradient = ({ colors = [], locations, style, start, end, children, ...rest }) => {
  if (Platform.OS !== "android") {
    return (
      <ExpoLinearGradient colors={colors} locations={locations} style={style} start={start} end={end} {...rest}>
        {children}
      </ExpoLinearGradient>
    );
  }

  const palette = buildPalette(colors, locations, 24);

  return (
    <View style={[style, { overflow: "hidden" }]} {...rest}>
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              flexDirection: "row",
              overflow: "hidden",
            },
          ]}
        >
          {palette.map((color, index) => (
            <View key={`${index}-${color}`} style={{ flex: 1, backgroundColor: color }} />
          ))}
        </View>
      </View>
      {children}
    </View>
  );
};

export default SafeLinearGradient;