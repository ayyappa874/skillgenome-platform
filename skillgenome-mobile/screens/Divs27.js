import * as React from "react";
import { ScrollView, Text, StyleSheet, View, Pressable, ImageBackground, Alert, Modal } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import GlassCard from '../components/UI/GlassCard';
import NeonBadge from '../components/UI/NeonBadge';
import { StyleVariable, Color, FontFamily, Padding, FontSize, Border, BoxShadow, Width, Height } from "../GlobalStyles";
import { getTheme } from "../utils/theme";

const Divs27 = ({ journalText, selectedMood, onBack, onWriteNewEntry, analysisResult, isDarkMode = true, language = 'English' }) => {
  const T = getTheme(isDarkMode);
  const styles = React.useMemo(() => getStyles(T), [T]);

  const bgStyle = isDarkMode ? Color.colorBlue8 : '#f8fafc';
  const textPrimary = isDarkMode ? '#ffffff' : '#0f172a';
  const textSecondary = isDarkMode ? '#94a3b8' : '#475569';
  const cardBg = isDarkMode ? 'rgba(26, 31, 48, 0.4)' : '#ffffff';
  const borderStyle = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#cbd5e1';

  // Analyze sentiment and stress from journal text
  const analyzeText = (text) => {
    const lowerText = text.toLowerCase();
    
    // Count positive and negative words
    const positiveWords = ['happy', 'great', 'excellent', 'good', 'love', 'fantastic', 'amazing', 'wonderful', 'perfect', 'confident', 'strong', 'success', 'achieve', 'proud'];
    const negativeWords = ['sad', 'bad', 'terrible', 'hate', 'awful', 'horrible', 'stress', 'anxious', 'worried', 'scared', 'failed', 'weak', 'depressed'];
    const stressWords = ['stress', 'anxious', 'worried', 'nervous', 'panic', 'fear', 'pressure', 'overwhelm'];
    
    let positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    let negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    let stressCount = stressWords.filter(word => lowerText.includes(word)).length;
    
    const totalWords = text.split(/\s+/).filter(w => w.length > 0).length;
    const wordLength = Math.max(totalWords, 1);
    
    // Calculate sentiment percentage (0-100)
    const sentiment = Math.max(0, Math.min(100, 50 + ((positiveCount - negativeCount) * 10)));
    
    // Calculate stress level (0-100) - inverse of positive mood
    const moodBonus = selectedMood === 'Happy' || selectedMood === 'Confident' ? 20 : selectedMood === 'neutral' ? 0 : -15;
    const stressLevel = Math.max(0, Math.min(100, 50 + (stressCount * 5) - moodBonus));
    
    // Calculate confidence level
    const confidenceLevel = 100 - stressLevel;
    
    return {
      sentiment: Math.round(sentiment),
      stressLevel: Math.round(stressLevel),
      confidenceLevel: Math.round(confidenceLevel),
      cognitiveStyle: lowerText.includes('analyze') || lowerText.includes('think') ? 'Analytical Thinker' : 'Creative Thinker'
    };
  };

  const localAnalysis = analyzeText(journalText);

  // Generate word cloud tags from journal
  const generateTags = (text) => {
    const words = text.split(/\s+/).filter(w => w.length > 3);
    const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))].slice(0, 10);
    return uniqueWords;
  };

  const localTags = generateTags(journalText);

  // Dynamic values binding from FastAPI backend or local fallback
  const sentiment = analysisResult?.sentiment ?? localAnalysis.sentiment;
  const stressLevel = analysisResult?.stressLevel ?? localAnalysis.stressLevel;
  const confidenceLevel = analysisResult?.confidence ?? localAnalysis.confidenceLevel;
  const cognitiveStyle = analysisResult?.cognitiveStyle ?? localAnalysis.cognitiveStyle;
  const displayTags = analysisResult?.tags ?? localTags;
  const cognitiveDistortions = analysisResult?.cognitiveDistortions ?? (journalText.toLowerCase().includes('always') || journalText.toLowerCase().includes('never') ? ['All-or-Nothing Thinking'] : []);
  const adaptabilityScore = analysisResult?.adaptabilityScore ?? Math.round(Math.max(10, Math.min(99, (confidenceLevel * 0.4 + 50 * 0.4 + (100 - stressLevel) * 0.2) - cognitiveDistortions.length * 8)));
  const nlpFeedback = analysisResult?.nlpFeedback ?? `Your cognitive pattern exhibits a strong alignment. Nurture cognitive adaptability as it is central to mastering high-pressure tasks.`;
  const bertAttentionBreakdown = analysisResult?.bertAttentionBreakdown ?? {
    Analytical: cognitiveStyle === 'Analytical Thinker' ? 65 : 15,
    Strategic: cognitiveStyle === 'Strategic Thinker' ? 65 : 15,
    Creative: cognitiveStyle === 'Creative Thinker' ? 65 : 15,
    Empathetic: cognitiveStyle === 'Empathetic Thinker' ? 65 : 15
  };

  const [selectedTag, setSelectedTag] = React.useState(null);

  const handleTagPress = (tag) => {
    setSelectedTag(tag);
  };

  return (
    <ScrollView style={[styles.divs27, styles.divs27Border, { backgroundColor: bgStyle }]} contentContainerStyle={styles.divs27ContainerContent}>
      <ScrollView style={styles.divscreenBody} contentContainerStyle={styles.divscreenBodyContainerContent}>
        {/* Top Bar */}
        <View style={styles.divtopBar}>
          <Pressable style={[styles.divbackBtn, styles.ringFlexBox, { backgroundColor: cardBg, borderColor: borderStyle }]} onPress={() => typeof onBack === "function" && onBack()}>
            <Text style={[styles.text2, styles.text2Typo, { color: textPrimary }]}>←</Text>
          </Pressable>
          <Text style={[styles.thoughtprint, styles.thoughtprintTypo, { color: textPrimary }]}>ThoughtPrint</Text>
        </View>

        {/* Positivity Ring */}
        <View style={[styles.divpositivityRing, styles.ringFlexBox]}>
          <View style={[styles.divgenomeRingIcon, styles.ringFlexBox]}>
            <View style={styles.divringText}>
              <Text style={[styles.text3, styles.text3Clr, { color: textPrimary }]}>{sentiment}%</Text>
              <View style={styles.divlabel}>
                <Text style={styles.positive}>
                  {sentiment > 60 ? 'Positive' : sentiment > 40 ? 'Neutral' : 'Stressed'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Metrics */}
        <GlassCard style={styles.divthoughtResult} isDarkMode={isDarkMode} intensity="high">
          <View style={styles.divmetricRow}>
            {/* Stress Level */}
            <View style={styles.divmetricItem}>
              <View style={[styles.divmetricLabel, styles.divmetricLabelSpaceBlock]}>
                <Text style={[styles.stressLevel, { color: textPrimary }]}>Stress Level</Text>
                <Text style={[styles.stressLevel, { color: textPrimary }]}>{stressLevel}/100</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${stressLevel}%` }]} />
              </View>
              <View style={styles.span}>
                <Text style={[styles.low, styles.lowTypo, { color: textSecondary }]}>
                  {stressLevel < 40 ? 'Low' : stressLevel < 70 ? 'Moderate' : 'High'}
                </Text>
              </View>
            </View>

            {/* Confidence Level */}
            <View style={styles.divmetricItem}>
              <View style={[styles.divmetricLabel, styles.divmetricLabelSpaceBlock]}>
                <Text style={[styles.stressLevel, { color: textPrimary }]}>Confidence Level</Text>
                <Text style={[styles.stressLevel, { color: textPrimary }]}>{confidenceLevel}/100</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${confidenceLevel}%`, backgroundColor: '#00d4ff' }]} />
              </View>
              <View style={styles.div2}>
                <Text style={[styles.high, styles.lowTypo, { color: textSecondary }]}>
                  {confidenceLevel > 60 ? 'High' : confidenceLevel > 40 ? 'Moderate' : 'Low'}
                </Text>
              </View>
            </View>

            {/* Mental Adaptability Index */}
            <View style={styles.divmetricItem}>
              <View style={[styles.divmetricLabel, styles.divmetricLabelSpaceBlock]}>
                <Text style={[styles.stressLevel, { color: textPrimary }]}>🧠 Cognitive Adaptability Score</Text>
                <Text style={[styles.stressLevel, { color: '#00d4ff' }]}>{adaptabilityScore}/100</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${adaptabilityScore}%`, backgroundColor: '#7c3aed' }]} />
              </View>
              <View style={styles.span}>
                <Text style={[styles.low, { color: '#00d4ff' }]}>
                  {adaptabilityScore > 75 ? 'Highly Adaptive Mindset' : adaptabilityScore > 50 ? 'Calibrated Flexibility' : 'Low Adaptability (Practice Reframing)'}
                </Text>
              </View>
            </View>
          </View>

          {/* Cognitive Badge */}
          <View style={styles.divmetricLabelSpaceBlock}>
            <NeonBadge 
              text={`Cognitive Style: ${cognitiveStyle}`} 
              color="cyan" 
              isDarkMode={isDarkMode}
              style={{ alignSelf: 'flex-start', marginTop: 16 }}
            />
          </View>
        </GlassCard>

        {/* Cognitive Distortion Patterns */}
          <GlassCard style={styles.patternsContainer} isDarkMode={isDarkMode} intensity="medium">
            <Text style={[styles.patternsTitle, { color: textPrimary }]}>⚠️ Detected Cognitive Distortion Patterns</Text>
            <View style={styles.patternsRow}>
              {cognitiveDistortions.length > 0 ? (
                cognitiveDistortions.map((dist, idx) => (
                  <NeonBadge key={idx} text={`${dist} ⚠️`} color="orange" isDarkMode={isDarkMode} />
                ))
              ) : (
                <NeonBadge text="Balanced & Calibrated Mindset ✅" color="green" isDarkMode={isDarkMode} />
              )}
            </View>
          </GlassCard>

          {/* BERT Multi-Class Token Attention Weights */}
          <GlassCard style={styles.bertContainer} isDarkMode={isDarkMode} intensity="low">
            <Text style={[styles.bertTitle, { color: textPrimary }]}>⚡ BERT Multi-Class Token Attention Weights</Text>
            {Object.entries(bertAttentionBreakdown).map(([styleName, weight], idx) => {
              const styleColors = {
                Analytical: "#00d4ff",
                Strategic: "#7c3aed",
                Creative: "#10b981",
                Empathetic: "#ec4899"
              };
              const color = styleColors[styleName] || "#00d4ff";
              return (
                <View key={idx} style={styles.bertRow}>
                  <Text style={[styles.bertLabel, { color: textPrimary }]}>{styleName}</Text>
                  <View style={styles.bertBarContainer}>
                    <View style={[styles.bertBar, { width: `${weight}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={[styles.bertValue, { color }]}>{weight}%</Text>
                </View>
              );
            })}
          </GlassCard>

          {/* AI Cognitive Analyst Insights feedback */}
          <GlassCard style={styles.insightsCard} isDarkMode={isDarkMode} intensity="medium">
            <Text style={[styles.insightsTitle, { color: textPrimary }]}>🔍 ThoughtPrint Analyst Insights</Text>
            <Text style={[styles.insightsText, { color: textSecondary }]}>{nlpFeedback}</Text>
          </GlassCard>

          {/* Word Cloud */}
          <View style={styles.divwordCloud}>
            <Text style={[styles.bertTitle, { color: textPrimary, alignSelf: 'flex-start', paddingHorizontal: 20 }]}>🏷️ Cognitive Keywords</Text>
            <View style={[styles.tagsRow1, styles.tagsRow1SpaceBlock]}>
              {displayTags.slice(0, 5).map((tag, idx) => (
                <Pressable key={idx} onPress={() => handleTagPress(tag)}>
                  <Text style={[styles.tag, idx === 2 ? styles.highlightTag : styles.tag]}>
                    {tag}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={[styles.tagsRow1, styles.tagsRow1SpaceBlock]}>
              {displayTags.slice(5, 10).map((tag, idx) => (
                <Pressable key={idx} onPress={() => handleTagPress(tag)}>
                  <Text style={[styles.tag, styles.tag]}>
                    {tag}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

        {/* Write New Entry Button */}
        <LinearGradient
          style={[styles.buttonbtnPrimary, styles.divwordCloudFlexBox]}
          locations={[0, 1]}
          colors={[Color.colorCyan50, Color.colorViolet58]}
        >
          <Pressable style={[styles.buttonbtnPrimary, styles.divwordCloudFlexBox]} onPress={() => typeof onWriteNewEntry === "function" && onWriteNewEntry()}>
            <Text style={[styles.writeNewEntry, styles.thoughtprintTypo]}>Write New Entry</Text>
          </Pressable>
        </LinearGradient>
      </ScrollView>

      {/* Tag Details Custom Modal */}
      <Modal visible={!!selectedTag} transparent={true} animationType="fade" onRequestClose={() => setSelectedTag(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg, borderColor: borderStyle }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>Theme Selected</Text>
            <Text style={[styles.modalText, { color: textSecondary }]}>
              You selected the cognitive theme: "{selectedTag}". This is a recurring element in your ThoughtPrint. Use this insight to explore this topic further in future entries!
            </Text>
            <Pressable style={styles.modalButton} onPress={() => setSelectedTag(null)}>
              <Text style={styles.modalButtonText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const getStyles = (T) => StyleSheet.create({
  divscreenBodyContainerContent: {
    flexDirection: "column",
    paddingTop: 22,
    paddingBottom: 80,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 18
  },
  divs27ContainerContent: {
    flexDirection: "column",
    paddingBottom: 141,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    flex: 1
  },
  divs27Border: {
    borderWidth: StyleVariable.strokeWeight1,
    borderStyle: "solid"
  },
  ringFlexBox: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row"
  },
  text2Typo: {
    color: Color.colorGrey97,
    fontSize: 14,
    textAlign: "left"
  },
  thoughtprintTypo: {
    fontFamily: FontFamily.soraBold,
    fontWeight: StyleVariable.fontWeight700
  },
  text3Clr: {
    color: Color.colorCyan50,
    textAlign: "left"
  },
  tagsRow1SpaceBlock: {
    paddingHorizontal: Padding.padding_20,
    alignSelf: "stretch"
  },
  divmetricLabelSpaceBlock: {
    paddingBottom: Padding.padding_1,
    flexDirection: "row"
  },
  lowTypo: {
    color: Color.colorBlue42,
    fontSize: 11,
    fontFamily: FontFamily.soraRegular
  },
  divwordCloudFlexBox: {
    borderRadius: Border.br_14,
    justifyContent: "center",
    alignItems: "center"
  },
  divs27: {
    boxShadow: BoxShadow.interSemiBold,
    elevation: 80,
    backgroundColor: Color.colorBlue8,
    borderColor: Color.colorWhite10,
    maxWidth: "100%",
    flex: 1,
    width: "100%"
  },
  divscreenBody: {
    alignSelf: "stretch",
    maxWidth: "100%",
    flex: 1
  },
  divtopBar: {
    paddingLeft: Padding.padding_20,
    paddingTop: 40,
    gap: 20,
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "stretch"
  },
  divbackBtn: {
    height: 38,
    width: 38,
    borderRadius: 12,
    backgroundColor: Color.colorBlue15,
    justifyContent: "center",
    alignItems: "center"
  },
  text2: {
    fontFamily: FontFamily.soraBold,
    fontSize: 16,
    color: Color.colorGrey97
  },
  thoughtprint: {
    color: Color.colorGrey97,
    fontSize: 16,
    textAlign: "left",
    marginLeft: 12
  },
  divpositivityRing: {
    paddingVertical: 10,
    paddingHorizontal: Padding.padding_0,
    alignSelf: "stretch"
  },
  divgenomeRingIcon: {
    paddingLeft: 46,
    paddingTop: 48,
    paddingRight: 46,
    paddingBottom: 48,
    borderWidth: 4,
    borderColor: Color.colorCyan50,
    borderRadius: 120,
    backgroundColor: "rgba(0, 212, 255, 0.07)"
  },
  divringText: {
    gap: StyleVariable.itemSpacing1,
    alignItems: "center"
  },
  text3: {
    fontSize: 26,
    fontFamily: FontFamily.soraExtraBold,
    fontWeight: StyleVariable.fontWeight800,
    color: Color.colorCyan50
  },
  divlabel: {
    alignItems: "center",
    alignSelf: "stretch"
  },
  positive: {
    color: Color.colorBlue65,
    fontSize: 12,
    fontFamily: FontFamily.soraRegular,
    textAlign: "left"
  },
  divthoughtResult: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 22,
    marginHorizontal: 16
  },
  divmetricRow: {
    gap: 12,
    alignSelf: "stretch"
  },
  divmetricItem: {
    gap: StyleVariable.itemSpacing3,
    alignSelf: "stretch"
  },
  divmetricLabel: {
    justifyContent: "space-between",
    gap: 0,
    alignSelf: "stretch"
  },
  stressLevel: {
    fontFamily: FontFamily.soraSemiBold,
    fontSize: 13,
    color: Color.colorBlue65,
    textAlign: "left",
    fontWeight: StyleVariable.fontWeight600
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Color.colorBlue15,
    overflow: "hidden",
    width: "100%",
    marginTop: 4
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#ff6b6b",
    borderRadius: 4
  },
  span: {
    alignSelf: "stretch",
    marginTop: 2
  },
  low: {
    textAlign: "left",
    alignSelf: "stretch"
  },
  div2: {
    flexDirection: "row",
    alignSelf: "stretch",
    marginTop: 2
  },
  high: {
    textAlign: "right",
    flex: 1
  },
  divcognitiveBadge2: {
    borderRadius: 20,
    backgroundColor: Color.colorCyan5010,
    borderColor: Color.colorCyan5030,
    paddingLeft: 18,
    paddingTop: 10,
    paddingRight: 14,
    paddingBottom: 8,
    borderWidth: StyleVariable.strokeWeight1,
    borderStyle: "solid",
    marginTop: 4
  },
  cognitiveStyleAnalytical: {
    fontSize: 13,
    fontFamily: FontFamily.soraBold,
    fontWeight: StyleVariable.fontWeight700
  },
  divwordCloud: {
    paddingVertical: Padding.padding_20,
    gap: 14,
    paddingHorizontal: Padding.padding_0,
    alignSelf: "stretch",
    borderRadius: Border.br_14,
    marginTop: 6
  },
  tagsRow1: {
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: Padding.padding_0,
    flexWrap: "wrap"
  },
  tag: {
    fontSize: 14,
    color: "#fff",
    fontFamily: FontFamily.soraSemiBold,
    textAlign: "center",
    backgroundColor: "rgba(124, 58, 237, 0.8)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0px 4px 10px rgba(124, 58, 237, 0.3)",
    elevation: 4
  },
  highlightTag: {
    fontSize: 15,
    color: "#fff",
    fontWeight: StyleVariable.fontWeight700,
    backgroundColor: "rgba(0, 212, 255, 0.9)",
    boxShadow: "0px 4px 12px rgba(0, 212, 255, 0.4)",
    elevation: 6
  },
  buttonbtnPrimary: {
    padding: Padding.padding_14,
    backgroundColor: "transparent",
    flexDirection: "row",
    width: "100%"
  },
  writeNewEntry: {
    letterSpacing: StyleVariable.letterSpacing03,
    fontSize: 15,
    fontWeight: StyleVariable.fontWeight700,
    textAlign: "left",
    color: Color.colorWhiteSolid
  },
  patternsContainer: {
    padding: 16,
    width: "100%",
    marginTop: 6
  },
  patternsTitle: {
    fontFamily: FontFamily.soraBold,
    fontWeight: StyleVariable.fontWeight700,
    fontSize: 13,
    color: Color.colorGrey97,
    marginBottom: 10
  },
  patternsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  patternBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1
  },
  patternBadgeWarning: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderColor: "rgba(255, 107, 107, 0.3)"
  },
  patternBadgeSuccess: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.3)"
  },
  patternBadgeTextWarning: {
    color: "#ff6b6b",
    fontFamily: FontFamily.soraSemiBold,
    fontSize: 12
  },
  patternBadgeTextSuccess: {
    color: "#10b981",
    fontFamily: FontFamily.soraSemiBold,
    fontSize: 12
  },
  bertContainer: {
    padding: 16,
    width: "100%",
    gap: 10,
    marginTop: 6
  },
  bertTitle: {
    fontFamily: FontFamily.soraBold,
    fontWeight: StyleVariable.fontWeight700,
    fontSize: 13,
    color: Color.colorGrey97,
    marginBottom: 6
  },
  bertRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 2
  },
  bertLabel: {
    width: 90,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: FontFamily.soraRegular,
    fontSize: 12
  },
  bertBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Color.colorBlue15,
    borderRadius: 4,
    overflow: "hidden",
    marginHorizontal: 10
  },
  bertBar: {
    height: "100%",
    borderRadius: 4
  },
  bertValue: {
    width: 38,
    textAlign: "right",
    fontFamily: FontFamily.soraSemiBold,
    fontSize: 12
  },
  insightsCard: {
    padding: 20,
    width: "100%",
    marginTop: 12
  },
  insightsTitle: {
    fontFamily: FontFamily.soraBold,
    fontWeight: StyleVariable.fontWeight700,
    fontSize: 15,
    marginBottom: 12
  },
  insightsText: {
    fontFamily: FontFamily.soraRegular,
    fontSize: 14,
    lineHeight: 24,
    color: Color.colorGrey97
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    boxShadow: "0px 10px 40px rgba(0,0,0,0.5)",
    elevation: 20
  },
  modalTitle: {
    fontFamily: FontFamily.soraBold,
    fontSize: 20,
    marginBottom: 12
  },
  modalText: {
    fontFamily: FontFamily.soraRegular,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 24
  },
  modalButton: {
    backgroundColor: Color.colorCyan50,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    width: "100%"
  },
  modalButtonText: {
    fontFamily: FontFamily.soraBold,
    fontSize: 16,
    color: "#ffffff"
  }
});

export default Divs27;
