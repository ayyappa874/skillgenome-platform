import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const getTheme = (isDarkMode) => ({
  bg:          isDarkMode ? "#0A0F1A" : "#ffffff", // Premium Midnight Blue
  surface:     isDarkMode ? "rgba(255, 255, 255, 0.04)" : "#ffffff",
  surface2:    isDarkMode ? "rgba(255, 255, 255, 0.07)" : "#f8fafc",
  border:      isDarkMode ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0", // Softer glass borders
  borderLow:   isDarkMode ? "rgba(255, 255, 255, 0.04)" : "#f1f5f9",
  text:        isDarkMode ? "#F8FAFC" : "#0f172a",
  muted:       isDarkMode ? "#94A3B8" : "#475569", // Better contrast for muted text
  subtle:      isDarkMode ? "#1E293B" : "#94a3b8",
  accent:      "#8B5CF6", // More vibrant purple
  accentEnd:   "#6D28D9",
  accentLight: isDarkMode ? "rgba(139, 92, 246, 0.15)" : "#f3e8ff",
  accentText:  isDarkMode ? "#C4B5FD" : "#6d28d9",
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
  cardShadow:  isDarkMode ? {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 5,
  } : {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  chipBg:      isDarkMode ? "rgba(255,255,255,0.06)" : "#f1f5f9",
  inputBg:     isDarkMode ? "rgba(255,255,255,0.05)" : "#ffffff",
});
