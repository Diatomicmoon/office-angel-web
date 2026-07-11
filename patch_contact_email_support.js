const fs = require('fs');

const filePath = '/home/jakob/.openclaw/workspace/office-angel-web/src/app/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

if (content.includes('sale@hardhat-solutions.com')) {
  content = content.replace('sale@hardhat-solutions.com', 'support@hardhat-solutions.com');
  fs.writeFileSync(filePath, content);
  console.log(`Updated email to support@ in ${filePath}`);
} else {
  console.log('Email not found in file');
}
