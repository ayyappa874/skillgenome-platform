import * as React from "react";
import { StyleSheet, View, Text, ImageBackground, Image } from "react-native";
import { Color, StyleVariable } from "../GlobalStyles";

const Screen1 = () => {
  return (
    <ImageBackground style={styles.icon} source={require("../assets/1.png")}>
      <View style={styles.screenOverlay}>
        <Image style={styles.particles} resizeMode="cover" source={require("../assets/Particles.png")} />
        <View style={styles.headerLogoSection}>
          <Image style={styles.mergedAsset1Icon} resizeMode="cover" source={require("../assets/merged-asset-1.png")} />
          <Text style={styles.skillgenomeOs}>SkillGenome OS</Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  icon: {
    flex: 1,
    width: "100%"
  },
  screenOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: Color.appPrimaryOverlay
  },
  particles: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined
  },
  headerLogoSection: {
    alignItems: "center",
    justifyContent: "center"
  },
  mergedAsset1Icon: {
    width: 220,
    height: 220,
    marginBottom: 24
  },
  skillgenomeOs: {
    fontSize: StyleVariable.fontSize20,
    letterSpacing: StyleVariable.letterSpacing05,
    fontWeight: StyleVariable.fontWeight600,
    color: Color.colorWhiteSolid,
    textAlign: "left"
  }
});

export default Screen1;
