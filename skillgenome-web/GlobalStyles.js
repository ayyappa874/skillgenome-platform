/* Fonts */
export const FontFamily = {
  fontFamilyFont1: "Inter",
  interBold: "Inter-Bold",
  interExtraBold: "Inter-ExtraBold",
  interMedium: "Inter-Medium",
  interRegular: "Inter-Regular",
  interSemiBold: "Inter-SemiBold",
  soraBold: "Sora-Bold",
  soraExtraBold: "Sora-ExtraBold",
  soraSemiBold: "Sora-SemiBold",
  soraRegular: "Sora-Regular",
};

/* Colors */
export const Color = {
  colorAzure11: "#161a22",
  colorAzure35: "#0077b5",
  colorAzure40: "#0a66c2",
  colorAzure47: "#00a4ef",
  colorAzure65: "#94a3b8",
  colorBlackSolid: "#000",
  colorBlue8: "#0d0d1a",
  colorBlue15: "#1a1f30",
  colorBlue16: "#1e2235",
  colorBlue19: "#232840",
  colorBlue23: "#2e3448",
  colorBlue5: "#060612",
  colorBlue42: "#5a5a7a",
  colorBlue65: "#9494b8",
  colorCyan50: "#00d4ff",
  colorCyan503: "rgba(0, 229, 255, 0.03)",
  colorCyan5015: "rgba(0, 212, 255, 0.15)",
  colorCyan5020: "rgba(0, 212, 255, 0.2)",
  colorCyan5030: "rgba(0, 212, 255, 0.3)",
  colorCyan5050: "rgba(0, 212, 255, 0.5)",
  colorCyan506: "rgba(0, 229, 255, 0.06)",
  colorCyan508: "rgba(0, 212, 255, 0.08)",
  colorGrey97: "#f0f4ff",
  colorWhite7: "rgba(255, 255, 255, 0.07)",
  colorOrange50: "#ff9900",
  colorRed56: "#ea4335",
  colorRose60: "#ec4899",
  colorRose6050: "rgba(236, 72, 153, 0.5)",
  colorSpringGreen39: "#10b981",
  colorSpringGreen3912: "rgba(16, 185, 129, 0.12)",
  colorViolet58: "#7c3aed",
  colorViolet580: "rgba(124, 58, 237, 0)",
  colorViolet5812: "rgba(124, 58, 237, 0.12)",
  colorViolet5830: "rgba(124, 58, 237, 0.3)",
  colorViolet5840: "rgba(124, 58, 237, 0.4)",
  colorViolet5850: "rgba(124, 58, 237, 0.5)",
  colorWhiteSolid: "#fff",
  appPrimaryBackground: "#060612",
  appPrimaryOverlay: "rgba(6, 6, 18, 0.35)",

  // Enterprise Modern Tokens
  primaryGradientStart: "#00d4ff",
  primaryGradientEnd: "#7c3aed",
  darkBg: "#080b14",
  darkCardBg: "rgba(18, 24, 38, 0.75)",
  darkBorder: "rgba(255, 255, 255, 0.12)",
  lightBg: "#f8fafc",
  lightCardBg: "rgba(255, 255, 255, 0.9)",
  lightBorder: "rgba(0, 0, 0, 0.08)",
};

/* Style Variables */
export const StyleVariable = {
  fontSize8: 8,
  fontSize11: 11,
  fontSize13: 13,
  fontSize14: 14,
  fontSize15: 15,
  fontSize16: 16,
  fontSize18: 18,
  fontSize20: 20,
  fontSize22: 22,
  fontSize24: 24,
  fontSize26: 26,
  fontSize32: 32,
  fontSize36: 36,
  fontWeight400: 400,
  fontWeight500: 500,
  fontWeight600: 600,
  fontWeight700: 700,
  fontWeight800: 800,
  itemSpacing5: 5,
  itemSpacing6: 6,
  itemSpacing10: 10,
  itemSpacing12: 12,
  itemSpacingXs: 8,
  itemSpacingXxs: 4,
  letterSpacing03: 0.3,
  letterSpacing1: 1,
  strokeWeight12: 12,
  itemSpacing707: 70.7,
  letterSpacing02: 0.2,
  letterSpacing05: 0.5,
  lineHeight208: 20.8,
  lineHeight224: 22.4,
  opacity100: 1,
  strokeWeight1: 1,
  strokeWeight2: 2,
  strokeWeight3: 3,
  strokeWeight10: 10,
};

/* Paddings */
export const Padding = {
  padding_0: 0,
  padding_2: 2,
  padding_4: 4,
  padding_10: 10,
  padding_12: 12,
  padding_14: 14,
  padding_16: 16,
  padding_18: 18,
  padding_20: 20,
  padding_24: 24,
  padding_40: 40,
};

/* border radiuses */
export const Border = {
  br_2: 2,
  br_8: 8,
  br_12: 12,
  br_14: 14,
  br_16: 16,
  br_20: 20,
  br_circle: 9999,
};

/* box shadows */
export const BoxShadow = {
  interRegular: "inset 0px 0px 0px rgba(255, 255, 255, 0.05)",
  interExtraBold: "inset 0px 0px 0px rgba(255, 255, 255, 0.05)",
  cardGlowDark: "0px 8px 32px rgba(0, 212, 255, 0.15)",
  cardGlowLight: "0px 8px 24px rgba(0, 0, 0, 0.06)",
};

/* width */
export const Width = {
  width_16: 16,
  width_22: 22,
  width_36: 36,
  maxWebWidth: 1280,
  sidebarWidth: 260,
};

/* height */
export const Height = {
  height_1: 1,
  height_3: 3,
  height_12: 12,
  height_22: 22,
  height_36: 36,
  height_844: 844,
};

export const FontSize = {
  fs_9_6: 10,
  fs_10_4: 10,
  fs_17_6: 18,
};

export const LineHeight = {
  lh_16: 16,
};

export const getThemeColors = (isDarkMode) => ({
  background: isDarkMode ? Color.darkBg : Color.lightBg,
  cardBackground: isDarkMode ? Color.darkCardBg : Color.lightCardBg,
  borderColor: isDarkMode ? Color.darkBorder : Color.lightBorder,
  textPrimary: isDarkMode ? Color.colorWhiteSolid : "#0f172a",
  textSecondary: isDarkMode ? Color.colorAzure65 : "#64748b",
  accent: Color.colorCyan50,
  accentViolet: Color.colorViolet58,
  navBackground: isDarkMode ? "rgba(13, 13, 26, 0.85)" : "rgba(255, 255, 255, 0.85)",
});
