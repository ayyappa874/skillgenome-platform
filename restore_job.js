const fs = require('fs');
const log = fs.readFileSync('C:/Users/ASUS/.gemini/antigravity-ide/brain/9b60934a-1508-4103-9054-d02e62dcfec3/.system_generated/tasks/task-2000.log', 'utf8');

let extracted = log.split('Output:\r\n\t\t\t\t<truncated 240 lines>\r\n')[1] || log.split('Output:\r\n\t\t\t\t')[1];
extracted = extracted.split('\r\n\r\n\r\nLog: file')[0].trim();

// Unfortunately, task-2000 output is truncated. 
// It starts at:           </View>\n        ) : visibleJobs.length === 0 ? (
