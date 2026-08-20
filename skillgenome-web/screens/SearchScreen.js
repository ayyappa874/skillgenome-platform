import * as React from "react";
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Platform } from "react-native";
import { Color, FontFamily, StyleVariable, Border, Padding } from "../GlobalStyles";
import { t } from "../utils/translations";
import { getTheme } from "../utils/theme";

const SearchScreen = ({ onBack, searchAll, onNavigateToScreen, isDarkMode = true, language = 'English' }) => {
  const T = getTheme(isDarkMode);
  const styles = React.useMemo(() => getStyles(T), [T]);

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
      <View style={styles.header}>
        <Pressable
          onPress={() => onBack && onBack()}
          style={[styles.backBtn, { backgroundColor: cardBg, borderColor: borderStyle }]}
        >
          <Text style={[styles.backIcon, { color: textPrimary }]}>←</Text>
        </Pressable>
        <View>
          <Text style={[styles.pageTitle, { color: textPrimary }]}>{t(language, "explore")}</Text>
        </View>
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

const getStyles = (T) => StyleSheet.create({
  root: {
    flex: 1,
    padding: Padding.padding_24,
    backgroundColor: Color.colorBlue8,
    paddingTop: 48,
  },
  header:  {
    flexDirection: "row", alignItems: "center", gap: 16,
    paddingTop: Platform.OS === "ios" ? 72 : 56,
    paddingHorizontal: 20, paddingBottom: 16,
    marginTop: -48,
    marginLeft: -24,
    marginRight: -24,
  },
  backBtn:   { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  backIcon:  { fontSize: 18, fontWeight: "600", marginTop: -2 },
  pageTitle: { fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  input: { backgroundColor: Color.colorAzure11, color: Color.colorWhiteSolid, padding: 12, borderRadius: Border.br_12, borderWidth: StyleVariable.strokeWeight1, borderColor: Color.colorBlue19, marginBottom: 12 },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Color.colorBlue19 },
  rowTitle: { color: Color.colorWhiteSolid, fontWeight: StyleVariable.fontWeight600 },
  rowSnippet: { color: Color.colorAzure65, marginTop: 4 },
});

export default SearchScreen;
