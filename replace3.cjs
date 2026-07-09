const fs = require('fs');
let content = fs.readFileSync('src/components/ReportForm.tsx', 'utf8');

content = content.replace(/dark:text-slate-400 dark:text-slate-500/g, 'dark:text-slate-400');
// Remove white text on image
content = content.replace(/className="w-full dark:text-white dark:placeholder-slate-500 h-full/g, 'className="w-full h-full');

fs.writeFileSync('src/components/ReportForm.tsx', content);
