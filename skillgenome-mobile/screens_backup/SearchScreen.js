import * as React from "react";
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from "react-native";
import { Color, FontFamily, StyleVariable, Border, Padding } from "../GlobalStyles";
import { t } from "../utils/translations";

const SearchScreen = ({ onBack, searchAll, onNavigateToScreen, isDarkMode = true, language = 'English' }) => {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState([]);

  const bgStyle = isDarkMode ? Color.colorBlue8 : '#f8fafc';
  const cardBg = isDarkMode ? Color.colorAzure11 : '#ffffff';
  const borderStyle = isDarkMode ? Color.colorBlue19 : '#cbd5e1';
  const textPrimary = isDarkMode ? Color.colorWhiteSolid : '#0f172a';
  const textSecondary = isDarkMode ? Color.colorAzure65 : '#475569';

  React.useEffect(() => {
    if (typeof searchAll === 'function') {
      try {
        setResults(searchAll(query));
      } catch (e) {
        console.warn('search failed', e);
        setResults([]);
      }
    }
  }, [query]);

  return (
    <View style={[styles.root, { backgroundColor: bgStyle }]}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => onBack && onBack()}
          style={[styles.backButton, { backgroundColor: cardBg, borderColor: borderStyle }]}
        >
          <Text style={[styles.back, { color: textPrimary }]}>←</Text>
        </Pressable>
        <Text style={[styles.title, { color: textPrimary }]}>{t(language, "explore")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <TextInput
        placeholder={t(language, "searchExplorePlaceholder")}
        placeholderTextColor={textSecondary}
        value={query}
        onChangeText={setQuery}
        style={[styles.input, { color: textPrimary, backgroundColor: cardBg, borderColor: borderStyle }]}
      />

      <FlatList
        data={results}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.row, { borderBottomColor: borderStyle }]}
            onPress={() => {
              if (typeof onNavigateToScreen === 'function') onNavigateToScreen(item.route, item.payload || {});
            }}
          >
            <Text style={[styles.rowTitle, { color: textPrimary }]}>{item.title}</Text>
            <Text style={[styles.rowSnippet, { color: textSecondary }]}>{item.snippet}</Text>
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: Padding.padding_24,
    backgroundColor: Color.colorBlue8,
    paddingTop: 48,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingVertical: 8 },
  backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: StyleVariable.strokeWeight1, alignItems: 'center', justifyContent: 'center' },
  back: { color: Color.colorAzure65, fontFamily: FontFamily.interRegular, fontSize: 18, fontWeight: StyleVariable.fontWeight700 },
  headerSpacer: { width: 40 },
  title: { color: Color.colorWhiteSolid, fontWeight: StyleVariable.fontWeight700, fontSize: StyleVariable.fontSize16 },
  input: { backgroundColor: Color.colorAzure11, color: Color.colorWhiteSolid, padding: 12, borderRadius: Border.br_12, borderWidth: StyleVariable.strokeWeight1, borderColor: Color.colorBlue19, marginBottom: 12 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Color.colorBlue19 },
  rowTitle: { color: Color.colorWhiteSolid, fontWeight: StyleVariable.fontWeight600 },
  rowSnippet: { color: Color.colorAzure65, marginTop: 4 },
});

export default SearchScreen;
