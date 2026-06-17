const fs = require('fs');
const file = 'src/app/crm/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/created_at: string;\n};/g, "created_at: string;\n  isWeb?: boolean;\n};");
fs.writeFileSync(file, code);
console.log('Patched Lead Type');
