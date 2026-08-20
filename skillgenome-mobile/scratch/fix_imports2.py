import sys
import re

with open('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/Screen11Native.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_top = """import * as React from "react";
import {
  Text, StyleSheet, View, Image,
  Pressable, Animated, useWindowDimensions, Platform, Easing, Linking
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { getTheme } from "../utils/theme";
import { supabase } from "../utils/supabase";

const getColors = (isDarkMode) => isDarkMode ? ({
  bg: "#07111f",
  surface: "#101826",
  surface2: "#162033",
  border: "rgba(255,255,255,0.06)",
  borderStrong: "rgba(255,255,255,0.12)",
  text: "#f8fafc",
  muted: "#9aa7bf",
  violet: "#8b5cf6",
  violetDeep: "#5b21b6",
  teal: "#2dd4bf",
  cyan: "#38bdf8",
  rose: "#fb7185",
  amber: "#fbbf24",
  green: "#34d399",
  purple: "#a78bfa",
}) : ({
  bg: "#f5f7ff",
  surface: "#ffffff",
  surface2: "#f8fafc",
  border: "rgba(15, 23, 42, 0.07)",
  borderStrong: "rgba(15, 23, 42, 0.12)",
  text: "#111827",
  muted: "#64748b",
  violet: "#7c3aed",
  violetDeep: "#5b21b6",
  teal: "#14b8a6",
  cyan: "#0ea5e9",
  rose: "#e11d48",
  amber: "#d97706",
  green: "#10b981",
  purple: "#8b5cf6",
});
"""

match = re.search(r'const MODULES', content)
if match:
    rest_of_file = "\n" + content[match.start():]
    new_content = new_top + rest_of_file
    with open('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/screens/Screen11Native.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Fixed successfully.')
else:
    print('Regex failed to match.')
