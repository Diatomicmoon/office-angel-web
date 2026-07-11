const fs = require('fs');

const filePath = '/home/jakob/.openclaw/workspace/office-angel-web/src/app/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

if (content.includes('support@hardhat-solutions.com')) {
  content = content.replace('support@hardhat-solutions.com', 'sales@hardhat-solutions.com');
  fs.writeFileSync(filePath, content);
  console.log(`Updated email in ${filePath}`);
} else {
  console.log('Email not found in file');
}
