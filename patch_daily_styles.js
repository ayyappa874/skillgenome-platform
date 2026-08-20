const fs = require('fs');
let code = fs.readFileSync('skillgenome/screens/DailyLearningTopicsScreen.js', 'utf8');

const missingStyles = `  completedText: {
    color: "#10B981",
    fontSize: 13,
    fontFamily: FontFamily.interSemiBold,
  },
  summaryCard: {
    backgroundColor: altBg,
    borderRadius: 20,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: borderStyle,
  },
  summaryLabel: {
    color: textSecondary,
    fontSize: 15,
    fontFamily: FontFamily.soraBold,
    marginBottom: 6,
  },
  summaryText: {
    color: textMute,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: Color.colorCyan50 || "#25E0B5",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  startButtonText: {
    color: "#000000",
    fontSize: 16,
    fontFamily: FontFamily.soraBold,
  }`;

code = code.replace(/  completedText: \{\s*color: \"#10B981\",\s*fontSize: 13,\s*fontFamily: FontFamily\.interSemiBold,\s*\}/, missingStyles);

fs.writeFileSync('skillgenome/screens/DailyLearningTopicsScreen.js', code);
fs.writeFileSync('../skill - Copy/skillgenome/screens/DailyLearningTopicsScreen.js', code);
console.log('Added missing styles for summaryCard and startButton!');
