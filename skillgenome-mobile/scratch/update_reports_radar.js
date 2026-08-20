const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/components/CohortReportsModal.js';
let content = fs.readFileSync(path, 'utf8');

// Add SVG imports
content = content.replace(
  "import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Modal, useWindowDimensions } from 'react-native';",
  "import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Modal, useWindowDimensions } from 'react-native';\nimport Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';"
);

// Add the RadarChart component logic
const radarChartComponent = `
const RadarChart = ({ gaps, T }) => {
  if (!gaps || gaps.length < 3) return null;
  
  const size = 250;
  const center = size / 2;
  const radius = size / 2.5;

  const getCoordinatesForValue = (value, index, total) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const distance = (value / 100) * radius;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle)
    };
  };

  const pointsAvg = gaps.map((g, i) => {
    const { x, y } = getCoordinatesForValue(g.avg, i, gaps.length);
    return \`\${x},\${y}\`;
  }).join(' ');

  const pointsTarget = gaps.map((g, i) => {
    const { x, y } = getCoordinatesForValue(g.target, i, gaps.length);
    return \`\${x},\${y}\`;
  }).join(' ');

  const pointsMax = gaps.map((g, i) => {
    const { x, y } = getCoordinatesForValue(100, i, gaps.length);
    return \`\${x},\${y}\`;
  }).join(' ');

  const pointsMid = gaps.map((g, i) => {
    const { x, y } = getCoordinatesForValue(50, i, gaps.length);
    return \`\${x},\${y}\`;
  }).join(' ');

  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <Svg width={size} height={size}>
        {/* Background Grids */}
        <Polygon points={pointsMax} fill={T.surface2} stroke={T.borderLow} strokeWidth="1" />
        <Polygon points={pointsMid} fill="none" stroke={T.borderLow} strokeWidth="1" strokeDasharray="4,4" />
        
        {/* Axes */}
        {gaps.map((_, i) => {
          const end = getCoordinatesForValue(100, i, gaps.length);
          return (
            <Line key={\`axis-\${i}\`} x1={center} y1={center} x2={end.x} y2={end.y} stroke={T.borderLow} strokeWidth="1" />
          );
        })}

        {/* Target Polygon */}
        <Polygon points={pointsTarget} fill="none" stroke={T.muted} strokeWidth="2" strokeDasharray="5,5" />
        
        {/* Actual Average Polygon */}
        <Polygon points={pointsAvg} fill={\`\${T.primary}40\`} stroke={T.primary} strokeWidth="2" />
        
        {/* Actual Average Points */}
        {gaps.map((g, i) => {
          const pt = getCoordinatesForValue(g.avg, i, gaps.length);
          return <Circle key={\`pt-\${i}\`} cx={pt.x} cy={pt.y} r="4" fill={T.primary} />;
        })}

        {/* Labels */}
        {gaps.map((g, i) => {
          const pt = getCoordinatesForValue(115, i, gaps.length);
          const anchor = pt.x > center + 10 ? 'start' : pt.x < center - 10 ? 'end' : 'middle';
          return (
            <SvgText 
              key={\`label-\${i}\`} 
              x={pt.x} 
              y={pt.y + 4} 
              fill={T.text} 
              fontSize="10" 
              fontWeight="bold" 
              textAnchor={anchor}
            >
              {g.skill.split(' ')[0]}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};
`;

content = content.replace("const CohortReportsModal = ", radarChartComponent + "\nconst CohortReportsModal = ");

// Render the RadarChart above the progress bars
const targetJSX = `<Text style={S.sectionTitle}>Aggregate Skill Gaps</Text>`;
const replacementJSX = `<Text style={S.sectionTitle}>Aggregate Skill Gaps</Text>\n              <RadarChart gaps={skillGaps} T={T} />`;

content = content.replace(targetJSX, replacementJSX);

fs.writeFileSync(path, content, 'utf8');
console.log("Added Radar Chart");
