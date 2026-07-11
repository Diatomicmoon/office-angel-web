const fs = require('fs');

const filePaths = [
  '/home/jakob/.openclaw/workspace/office-angel-web/src/app/page.tsx'
];

for (const filePath of filePaths) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('(612) 324-5110')) {
    content = content.replace('(612) 324-5110', '(763) 300-3435');
    fs.writeFileSync(filePath, content);
    console.log(`Updated phone in ${filePath}`);
  }
}
