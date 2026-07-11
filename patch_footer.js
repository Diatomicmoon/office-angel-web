const fs = require('fs');

const filePath = '/home/jakob/.openclaw/workspace/office-angel-web/src/app/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('Contact: support@hardhat-solutions.com')) {
  content = content.replace(
    '<p>© 2026 Hard Hat Holdings LLC. All rights reserved.</p>',
    '<p>© 2026 Hard Hat Holdings LLC. All rights reserved.</p>\n        <p className="mt-1">Contact: support@hardhat-solutions.com | (612) 324-5110</p>'
  );
  fs.writeFileSync(filePath, content);
  console.log('Footer updated');
} else {
  console.log('Footer already updated');
}
