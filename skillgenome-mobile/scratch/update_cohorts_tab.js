const fs = require('fs');
const path = 'c:/Users/ASUS/OneDrive/Desktop/skill genome/skillgenome-mobile/components/MentorCohortsTab.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports
content = content.replace(
  "import { supabase } from '../utils/supabase';",
  "import { supabase } from '../utils/supabase';\nimport CohortRosterModal from './CohortRosterModal';\nimport CohortReportsModal from './CohortReportsModal';"
);

// 2. Add state
const oldState = `  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);`;

const newState = `  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeRosterCohortId, setActiveRosterCohortId] = useState(null);
  const [activeReportsCohortId, setActiveReportsCohortId] = useState(null);`;

content = content.replace(oldState, newState);

// 3. Update the Pressables to use internal state instead of props
const oldCardPressable = `onPress={() => onViewRoster && onViewRoster(c.id)}`;
const newCardPressable = `onPress={() => setActiveRosterCohortId(c.id)}`;
content = content.split(oldCardPressable).join(newCardPressable);

const oldReportsPressable = `onPress={() => onViewReports && onViewReports(c.id)}`;
const newReportsPressable = `onPress={() => setActiveReportsCohortId(c.id)}`;
content = content.split(oldReportsPressable).join(newReportsPressable);

// 4. Render modals at the bottom
const oldEnd = `    </View>
  );
};`;

const newEnd = `      {/* Modals */}
      <CohortRosterModal 
        visible={!!activeRosterCohortId} 
        onClose={() => setActiveRosterCohortId(null)} 
        cohortId={activeRosterCohortId} 
        T={T} 
      />
      
      <CohortReportsModal 
        visible={!!activeReportsCohortId} 
        onClose={() => setActiveReportsCohortId(null)} 
        cohortId={activeReportsCohortId} 
        T={T} 
      />
    </View>
  );
};`;

content = content.replace(oldEnd, newEnd);

// Also remove onViewRoster and onViewReports from signature
content = content.replace(
  "const MentorCohortsTab = ({ profile, T, onCreateCohort, onViewRoster, onViewReports }) => {",
  "const MentorCohortsTab = ({ profile, T, onCreateCohort }) => {"
);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated MentorCohortsTab.js");
