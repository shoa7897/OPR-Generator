const fs = require('fs');
let content = fs.readFileSync('src/components/ReportForm.tsx', 'utf8');

content = content.replace(/bg-white dark:bg-slate-800 dark:bg-slate-800/g, 'bg-white dark:bg-slate-800');

fs.writeFileSync('src/components/ReportForm.tsx', content);
