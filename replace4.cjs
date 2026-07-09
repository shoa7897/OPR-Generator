const fs = require('fs');
let content = fs.readFileSync('src/components/DraggableList.tsx', 'utf8');

content = content.replace(/bg-slate-50/g, 'bg-slate-50 dark:bg-slate-900/50');
content = content.replace(/border-slate-200/g, 'border-slate-200 dark:border-slate-700');
content = content.replace(/text-slate-400/g, 'text-slate-400 dark:text-slate-500');
content = content.replace(/text-slate-500/g, 'text-slate-500 dark:text-slate-400');
content = content.replace(/text-slate-600/g, 'text-slate-600 dark:text-slate-300');
content = content.replace(/bg-white/g, 'bg-white dark:bg-slate-800');

fs.writeFileSync('src/components/DraggableList.tsx', content);
