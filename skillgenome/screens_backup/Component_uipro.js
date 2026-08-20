import * as React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Color, StyleVariable, Padding, Border } from "../GlobalStyles";

const notifications = [
  {
    emoji: "⚠️",
    title: "Burnout risk elevated to 68%",
    subtitle: "The overage metrics suggest burnout risk elevated to 65%.",
    tone: "warning",
  },
  {
    emoji: "📋",
    title: "Python skill trending +12%",
    subtitle: "Python skill trending +12% and increases genome scores.",
    tone: "success",
  },
  {
    emoji: "🎯",
    title: "New job match: AI Engineer at Google 92%",
    subtitle: "New job match: AI Engineer at Google.",
    tone: "info",
  },
  {
    emoji: "💡",
    title: "Tip: Update your GitHub profile",
    subtitle: "Tone and content suggestions are ready for your GitHub profile.",
    tone: "neutral",
  },
];

const Component = ({ onNavigateHome }) => {
  return (
    <View style={styles.screenRoot}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.bell}>🔔</Text>

        <View style={styles.filterTabs}>
          <Pressable style={[styles.filterChip, styles.filterChipActive]}>
            <Text style={styles.filterChipActiveText}>All</Text>
          </Pressable>
          <Pressable style={styles.filterChip}><Text style={styles.filterChipText}>Alerts</Text></Pressable>
          <Pressable style={styles.filterChip}><Text style={styles.filterChipText}>Updates</Text></Pressable>
          <Pressable style={styles.filterChip}><Text style={styles.filterChipText}>Tips</Text></Pressable>
        </View>

        <View style={styles.list}>
          {notifications.map((item, index) => (
            <View key={index} style={[styles.card, styles[`card_${item.tone}`]]}>
              <Text style={styles.cardEmoji}>{item.emoji}</Text>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomNav}>
          <Pressable style={styles.navItem} onPress={() => { if (typeof onNavigateHome === "function") onNavigateHome(); }}>
            <Text style={styles.navIcon}>🏠</Text>
          </Pressable>
        <View style={styles.navItem}><Text style={styles.navIcon}>🔍</Text></View>
        <View style={styles.navItem}><Text style={styles.navIcon}>🔔</Text></View>
        <View style={styles.navItem}><Text style={styles.navIcon}>👤</Text></View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: Color.colorBlue8,
  },
  content: {
    paddingHorizontal: Padding.padding_20,
    paddingTop: 48,
    paddingBottom: 28,
    gap: 18,
  },
  bell: {
    alignSelf: "center",
    fontSize: 34,
    marginBottom: 6,
  },
  filterTabs: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Color.colorAzure11,
    borderWidth: StyleVariable.strokeWeight1,
    borderColor: Color.colorBlue19,
  },
  filterChipActive: {
    backgroundColor: Color.colorCyan50,
  },
  filterChipText: {
    color: Color.colorAzure65,
    fontSize: StyleVariable.fontSize13,
  },
  filterChipActiveText: {
    color: Color.colorBlackSolid,
    fontSize: StyleVariable.fontSize13,
    fontWeight: StyleVariable.fontWeight600,
  },
  list: {
    gap: 14,
  },
  bottomSpacer: {
    height: 84,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: Border.br_14,
    borderWidth: StyleVariable.strokeWeight1,
    borderColor: Color.colorBlue19,
    backgroundColor: Color.colorAzure11,
  },
  card_warning: {
    backgroundColor: Color.colorOrange508,
    borderColor: Color.colorOrange5025,
  },
  card_success: {
    backgroundColor: Color.colorSpringGreen398,
    borderColor: Color.colorSpringGreen3925,
  },
  card_info: {
    backgroundColor: Color.colorCyan508,
    borderColor: Color.colorCyan5025,
  },
  card_neutral: {
    backgroundColor: Color.colorAzure11,
  },
  cardEmoji: {
    fontSize: 20,
    marginTop: 2,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    color: Color.colorWhiteSolid,
    fontSize: StyleVariable.fontSize16,
    fontWeight: StyleVariable.fontWeight600,
    marginBottom: 6,
  },
  cardSubtitle: {
    color: Color.colorAzure47,
    fontSize: StyleVariable.fontSize11,
    lineHeight: 16,
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: Color.colorAzure8,
    borderTopWidth: StyleVariable.strokeWeight1,
    borderTopColor: Color.colorBlue19,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
  },
  navIcon: {
    fontSize: 24,
    color: Color.colorCyan50,
  },
});

export default Component;