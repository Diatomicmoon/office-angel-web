const fs = require('fs');

const filePath = '/home/jakob/.openclaw/workspace/office-angel-web/src/app/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

if (content.includes('sales@hardhat-solutions.com')) {
  content = content.replace('sales@hardhat-solutions.com', 'sale@hardhat-solutions.com');
  fs.writeFileSync(filePath, content);
  console.log(`Updated email to sale@ in ${filePath}`);
} else {
  console.log('Email not found in file');
}
