const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-web/App.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Imports
if (!content.includes('import AdminDashboardScreen')) {
  const importBlock = `
import AdminDashboardScreen from "./screens/AdminDashboardScreen";
import AdminNotificationsScreen from "./screens/AdminNotificationsScreen";
import MentorDashboardScreen from "./screens/MentorDashboardScreen";
import MentorNotificationsScreen from "./screens/MentorNotificationsScreen";
`;
  content = content.replace('import Screen29 from "./screens/Screen29";', 'import Screen29 from "./screens/Screen29";' + importBlock);
}

// 2. Add Maintenance Check to Login
if (!content.includes('MAINTENANCE MODE')) {
  const loginTarget = 'const resolvedName = profileData?.name || data.user.user_metadata?.full_name || email.split(\\'@\\')[0];';
  const loginReplacement = loginTarget + `\n
      const { data: settings } = await supabase.from('platform_settings').select('maintenance_mode').eq('id', 1).single();
      if (settings?.maintenance_mode && resolvedRole !== 'admin') {
        Alert.alert('MAINTENANCE MODE', 'SkillGenome is currently undergoing maintenance. Please check back later.');
        await supabase.auth.signOut();
        return;
      }
  `;
  content = content.replace(loginTarget, loginReplacement);

  const signupTarget = "setAuthFlowType('signup');";
  const signupReplacement = signupTarget + `\n
    const { data: settings } = await supabase.from('platform_settings').select('maintenance_mode').eq('id', 1).single();
    if (settings?.maintenance_mode) {
      Alert.alert('MAINTENANCE MODE', 'Signups are temporarily paused for maintenance. Please check back later.');
      return;
    }
  `;
  content = content.replace(signupTarget, signupReplacement);
}

// 3. Add Routing for 100, 101, 102
if (!content.includes('currentScreen === 100')) {
  const routeTarget = '{currentScreen === 10 && profile?.role === \\'mentor\\' ? (';
  const routeReplacement = `
        {currentScreen === 100 && (
          <AdminDashboardScreen
            profile={profile}
            onNavigate={(screenId) => setCurrentScreen(screenId)}
            onLogout={handleLogout}
          />
        )}
        {currentScreen === 101 && (
          <AdminNotificationsScreen
            onNavigate={(screenId) => setCurrentScreen(screenId)}
            profile={profile}
          />
        )}
        {currentScreen === 102 && (
          <MentorNotificationsScreen
            onNavigate={(screenId) => setCurrentScreen(screenId)}
            profile={profile}
          />
        )}
        ` + routeTarget;
  content = content.replace(routeTarget, routeReplacement);
}

fs.writeFileSync(path, content);
console.log("Web App.js perfectly patched!");
