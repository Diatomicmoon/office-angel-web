const fs = require('fs');

const filePaths = [
  '/home/jakob/.openclaw/workspace/office-angel-web/src/app/page.tsx'
];

for (const filePath of filePaths) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('(763) 300-3435')) {
    content = content.replace('(763) 300-3435', '(612) 598-6260');
    fs.writeFileSync(filePath, content);
    console.log(`Updated phone in ${filePath}`);
  }
}
