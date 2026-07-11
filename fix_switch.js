const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'Sidebar.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /<Link href="\/select-company" className="text-\[10px\] text-gray-400 hover:text-white underline">Switch<\/Link>/g,
  `{/* Switch hidden for trial users */}`
);

fs.writeFileSync(filePath, content);
console.log("Patched Sidebar Switch");
