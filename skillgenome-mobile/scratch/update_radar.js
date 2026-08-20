const fs = require('fs');
const reportsPath = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/components/CohortReportsModal.js';
const detailPath = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/components/MentorStudentDetailModal.js';

let reportsContent = fs.readFileSync(reportsPath, 'utf8');
let detailContent = fs.readFileSync(detailPath, 'utf8');

// 1. Remove inline RadarChart from CohortReportsModal and import it
const radarChartRegex = /const RadarChart = \(\{ gaps, T \}\) => \{[\s\S]*?^};/m;
reportsContent = reportsContent.replace(radarChartRegex, "import RadarChart from './RadarChart';");

// 2. Remove react-native-svg import from CohortReportsModal
reportsContent = reportsContent.replace("import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';", "");

// 3. Fix the property paths in fetchReports inside CohortReportsModal
const oldProps = `          if (resRes.data) resRes.data.forEach(d => { if (d.analysis_data?.overall_score) { sum.resume += d.analysis_data.overall_score; count.resume++; }});
          if (gitRes.data) gitRes.data.forEach(d => { if (d.analysis_data?.overall_score) { sum.github += d.analysis_data.overall_score; count.github++; }});
          if (thoughtRes.data) thoughtRes.data.forEach(d => { if (d.analysis_data?.adaptabilityScore) { sum.thought += d.analysis_data.adaptabilityScore; count.thought++; }});
          if (emoRes.data) emoRes.data.forEach(d => { if (d.analysis_data?.eqScore) { sum.emotion += d.analysis_data.eqScore; count.emotion++; }});`;

const newProps = `          if (resRes.data) resRes.data.forEach(d => { 
            const r = d.analysis_data;
            if (r) {
              const extracted = r.extractedSkills || [];
              const rScore = r.trueGenomeScore || (extracted.length > 0 ? Math.round(extracted.reduce((a, x) => a + (x.score || 0), 0) / extracted.length) : 85);
              sum.resume += rScore; count.resume++; 
            }
          });
          if (gitRes.data) gitRes.data.forEach(d => { if (d.analysis_data?.score) { sum.github += d.analysis_data.score; count.github++; }});
          if (thoughtRes.data) thoughtRes.data.forEach(d => { if (d.analysis_data?.overall_score) { sum.thought += d.analysis_data.overall_score; count.thought++; }});
          if (emoRes.data) emoRes.data.forEach(d => { if (d.analysis_data?.eq_score) { sum.emotion += d.analysis_data.eq_score; count.emotion++; }});`;

reportsContent = reportsContent.replace(oldProps, newProps);

fs.writeFileSync(reportsPath, reportsContent, 'utf8');

// 4. Update MentorStudentDetailModal.js
// Import RadarChart
detailContent = detailContent.replace(
  "import { View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions, Dimensions } from 'react-native';",
  "import { View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions, Dimensions } from 'react-native';\nimport RadarChart from './RadarChart';"
);

// Define gaps
const oldGetRisk = `  const riskColor = getRiskColor(student.risk);`;
const newGetRisk = `  const riskColor = getRiskColor(student.risk);
  
  const studentGaps = [
    { skill: 'Resume', avg: student.resume_score || 85, target: 90 },
    { skill: 'GitHub', avg: student.github_score || 75, target: 80 },
    { skill: 'Thought', avg: student.thought_score || 82, target: 85 },
    { skill: 'Emotion', avg: student.emotion_score || 78, target: 85 }
  ];`;

detailContent = detailContent.replace(oldGetRisk, newGetRisk);

// Replace placeholder
const oldPlaceholder = `<View style={[S.mockRadar, { backgroundColor: T.surface2, borderColor: T.borderLow }]}>
        <Text style={{ color: T.muted }}>[ Radar Chart Visualization ]</Text>
        <Text style={{ color: T.muted, fontSize: 12, marginTop: 8 }}>Student vs Cohort Average</Text>
      </View>`;

const newPlaceholder = `<RadarChart gaps={studentGaps} T={T} size={250} />`;

detailContent = detailContent.replace(oldPlaceholder, newPlaceholder);

fs.writeFileSync(detailPath, detailContent, 'utf8');

console.log("Updated both modals");
