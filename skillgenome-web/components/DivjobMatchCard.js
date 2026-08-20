import * as React from "react";
import { useMemo } from 'react';
import { Text, StyleSheet, View } from "react-native";
import { Border, Color, StyleVariable, Padding, FontSize, FontFamily } from "../GlobalStyles";

const getStyleValue = (key, value) => {
  if (value === undefined) return;
  return { [key]: value === 'unset' ? undefined : value };
};

const DivjobMatchCard = ({ jobTitle, matchPercent, textColor, isDarkMode = true }) => {
  const percentStyle = useMemo(() => {
    return {
      ...getStyleValue('color', textColor)
    };
  }, [textColor]);

  const cardBg = isDarkMode ? Color.colorBlue11 : '#ffffff';
  const borderStyle = isDarkMode ? Color.colorWhite7 : '#cbd5e1';
  const textPrimary = isDarkMode ? Color.colorWhiteSolid : '#0f172a';

  return (
    <View style={[styles.jobCard, { backgroundColor: cardBg, borderColor: borderStyle }]}>
      <View style={styles.jobTitleContainer}>
        <Text style={[styles.jobTitle, { color: textPrimary }]}>{jobTitle}</Text>
      </View>
      <View style={styles.matchPercentContainer}>
        <Text style={[styles.matchPercent, percentStyle]}>{matchPercent}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  jobCard: {
    flex: 1,
    borderRadius: Border.br_14,
    backgroundColor: Color.colorBlue11,
    borderStyle: "solid",
    borderColor: Color.colorWhite7,
    borderWidth: StyleVariable.strokeWeight1,
    justifyContent: "center",
    paddingHorizontal: Padding.padding_10,
    paddingVertical: Padding.padding_14,
    gap: StyleVariable.itemSpacingXxs,
    alignItems: "center"
  },
  jobTitleContainer: {
    alignSelf: "stretch",
    alignItems: "center"
  },
  jobTitle: {
    fontSize: FontSize.fs_10_4,
    fontWeight: StyleVariable.fontWeight700,
    fontFamily: FontFamily.soraBold,
    color: Color.colorBlue65,
    textAlign: "left"
  },
  matchPercentContainer: {
    alignSelf: "stretch",
    alignItems: "center"
  },
  matchPercent: {
    fontSize: FontSize.fs_17_6,
    fontWeight: StyleVariable.fontWeight800,
    fontFamily: FontFamily.soraExtraBold,
    color: Color.colorCyan50,
    textAlign: "left"
  }
});

export default DivjobMatchCard;
