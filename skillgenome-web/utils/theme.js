import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const getTheme = (isDarkMode) => ({
  bg:          isDarkMode ? "#09090b" : "#ffffff",
  surface:     isDarkMode ? "rgba(255,255,255,0.05)" : "#ffffff",
  surface2:    isDarkMode ? "rgba(255,255,255,0.08)" : "#f8fafc",
  border:      isDarkMode ? "rgba(255,255,255,0.12)" : "#e2e8f0",
  borderLow:   isDarkMode ? "rgba(255,255,255,0.06)" : "#f1f5f9",
  text:        isDarkMode ? "#fafafa" : "#0f172a",
  muted:       isDarkMode ? "#a1a1aa" : "#475569",
  subtle:      isDarkMode ? "#27272a" : "#94a3b8",
  accent:      "#7c3aed",
  accentEnd:   "#5b21b6",
  accentLight: isDarkMode ? "rgba(124,58,237,0.15)" : "#f3e8ff",
  accentText:  isDarkMode ? "#a78bfa" : "#6d28d9",
  cyan:        "#06b6d4",
  cyanLight:   isDarkMode ? "rgba(6,182,212,0.15)" : "#e0f2fe",
  green:       "#22c55e",
  greenLight:  isDarkMode ? "rgba(34,197,94,0.15)" : "#dcfce7",
  amber:       "#f59e0b",
  amberLight:  isDarkMode ? "rgba(245,158,11,0.15)" : "#fef3c7",
  rose:        "#f43f5e",
  roseLight:   isDarkMode ? "rgba(244,63,94,0.15)" : "#ffe4e6",
  purple:      "#a855f7",
  purpleLight: isDarkMode ? "rgba(168,85,247,0.15)" : "#f3e8ff",
  cardShadow:  isDarkMode ? {} : {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  chipBg:      isDarkMode ? "rgba(255,255,255,0.06)" : "#f1f5f9",
  inputBg:     isDarkMode ? "rgba(255,255,255,0.07)" : "#ffffff",
});
