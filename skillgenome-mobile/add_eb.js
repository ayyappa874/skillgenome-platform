const fs = require('fs');
let content = fs.readFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', 'utf8');

const boundaryCode = `class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>Screen Crashed!</Text>
          <Text style={{ color: 'white', marginTop: 10 }}>{this.state.error && this.state.error.toString()}</Text>
          <Pressable onPress={() => this.props.onBack && this.props.onBack()} style={{ marginTop: 20, padding: 10, backgroundColor: 'white', borderRadius: 8 }}>
            <Text style={{ color: 'black', fontWeight: 'bold' }}>Go Back</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

`;

if (!content.includes('class ErrorBoundary')) {
  content = content.replace('const initialStudyMessages =', boundaryCode + 'const initialStudyMessages =');
  fs.writeFileSync('c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/App.js', content);
  console.log('Successfully added ErrorBoundary');
} else {
  console.log('ErrorBoundary already exists');
}
