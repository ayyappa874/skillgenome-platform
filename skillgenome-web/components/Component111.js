import * as React from "react";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { Color, FontFamily, StyleVariable } from "../GlobalStyles";

/**
 * Component111 - Hexagon chart component for 8-Dimension Genome Score
 * Displays a radial hexagon with dimension labels and gradients
 */
const Component111 = ({ variant = 1 }) => {
  return (
    <View style={styles.component1}>
      <Image
        style={[styles.vectorIcon, styles.vectorIconLayout3]}
        contentFit="cover"
        source={require("../assets/Vector10.png")}
      />
      <Image
        style={[styles.vectorIcon2, styles.vectorIconLayout3]}
        contentFit="cover"
        source={require("../assets/Vector11.png")}
      />
      <Image
        style={[styles.vectorIcon3, styles.vectorIconLayout3]}
        contentFit="cover"
        source={require("../assets/Vector10.png")}
      />
      <Image
        style={styles.vectorIcon4}
        contentFit="cover"
        source={require("../assets/Vector12.png")}
      />
      <Image
        style={[styles.vectorIcon5, styles.vectorIconPosition1]}
        contentFit="cover"
        source={require("../assets/Vector13.png")}
      />
      <Image
        style={[styles.vectorIcon6, styles.vectorIconPosition]}
        contentFit="cover"
        source={require("../assets/Vector14.png")}
      />
      <Image
        style={styles.vectorIcon7}
        contentFit="cover"
        source={require("../assets/Vector15.png")}
      />
      <Image
        style={[styles.vectorIcon8, styles.vectorIconLayout]}
        contentFit="cover"
        source={require("../assets/Vector16.png")}
      />
      <Image
        style={[styles.vectorIcon9, styles.vectorIconLayout]}
        contentFit="cover"
        source={require("../assets/Vector17.png")}
      />
      <Text style={[styles.bb, styles.bbTypo]}>BB</Text>
      <Text style={[styles.qa, styles.qaTypo]}>QA</Text>
      <Text style={[styles.text, styles.qaTypo]}>60</Text>
      <Text style={[styles.text2, styles.bbTypo]}>1.0</Text>
      <Text style={[styles.eq, styles.eqTypo]}>EQ</Text>
      <Text style={[styles.nr, styles.eqTypo]}>NR</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  vectorIconLayout3: {
    maxHeight: "100%",
    maxWidth: "100%",
    position: "absolute",
    overflow: "hidden"
  },
  vectorIconPosition1: {
    top: "31.82%",
    bottom: "50%"
  },
  vectorIconPosition: {
    bottom: "31.81%",
    top: "50%"
  },
  vectorIconLayout: {
    right: "50%",
    width: "27.27%",
    height: "18.18%",
    maxHeight: "100%",
    maxWidth: "100%",
    left: "22.73%",
    position: "absolute",
    overflow: "hidden"
  },
  iconLayout: {
    backgroundColor: "transparent",
    height: "100%",
    width: "100%",
    maxHeight: "100%",
    maxWidth: "100%",
    overflow: "hidden"
  },
  bbTypo: {
    textAlign: "center",
    color: Color.colorWhite50,
    fontFamily: FontFamily.interRegular,
    fontSize: 9,
    left: "47.27%",
    position: "absolute"
  },
  qaTypo: {
    textAlign: "left",
    left: "80.91%",
    color: Color.colorWhite50,
    fontFamily: FontFamily.interRegular,
    fontSize: 9,
    position: "absolute"
  },
  eqTypo: {
    textAlign: "right",
    left: "11.36%",
    color: Color.colorWhite50,
    fontFamily: FontFamily.interRegular,
    fontSize: 9,
    position: "absolute"
  },
  component1: {
    height: 220,
    width: 220,
    overflow: "hidden"
  },
  vectorIcon: {
    height: "72.73%",
    width: "54.55%",
    left: "22.73%",
    bottom: "13.63%",
    right: "22.73%",
    top: "13.64%",
    maxHeight: "100%",
    maxWidth: "100%"
  },
  vectorIcon2: {
    height: "50%",
    width: "37.27%",
    top: "25%",
    right: "31.36%",
    bottom: "25%",
    left: "31.36%"
  },
  vectorIcon3: {
    height: "27.27%",
    width: "20%",
    top: "36.37%",
    right: "40%",
    bottom: "36.36%",
    left: "40%"
  },
  vectorIcon4: {
    left: "50%",
    bottom: "50%",
    right: "49.55%",
    width: "0.45%",
    height: "36.36%",
    maxHeight: "100%",
    maxWidth: "100%",
    top: "13.64%",
    position: "absolute",
    overflow: "hidden"
  },
  vectorIcon5: {
    width: "27.27%",
    height: "18.18%",
    left: "50%",
    maxHeight: "100%",
    maxWidth: "100%",
    right: "22.73%",
    position: "absolute",
    overflow: "hidden"
  },
  vectorIcon6: {
    width: "27.27%",
    height: "18.18%",
    left: "50%",
    maxHeight: "100%",
    maxWidth: "100%",
    right: "22.73%",
    position: "absolute",
    overflow: "hidden"
  },
  vectorIcon7: {
    top: "50%",
    left: "50%",
    right: "49.55%",
    width: "0.45%",
    height: "36.36%",
    maxHeight: "100%",
    maxWidth: "100%",
    bottom: "13.63%",
    position: "absolute",
    overflow: "hidden"
  },
  vectorIcon8: {
    bottom: "31.81%",
    top: "50%"
  },
  vectorIcon9: {
    top: "31.82%",
    bottom: "50%"
  },
  bb: {
    top: "5.91%"
  },
  qa: {
    top: "26.82%"
  },
  text: {
    top: "66.36%"
  },
  text2: {
    top: "87.73%"
  },
  eq: {
    top: "66.36%"
  },
  nr: {
    top: "26.82%"
  }
});

export default Component111;
