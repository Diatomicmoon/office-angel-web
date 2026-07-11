const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'dispatch', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The issue is this line where it falls back to 1020 minutes (17:00 or 5 PM):
// const startMin = typeof s.schedule_start_minute === 'number' ? s.schedule_start_minute : 480;
// const endMin = typeof s.schedule_end_minute === 'number' ? s.schedule_end_minute : 1020;
// Let's bump the default endMin to 1260 (21:00 or 9 PM)

content = content.replace(
  /const endMin = typeof s\.schedule_end_minute === 'number' \? s\.schedule_end_minute : 1020;/g,
  `const endMin = typeof s.schedule_end_minute === 'number' ? s.schedule_end_minute : 1260; // 9:00 PM`
);

fs.writeFileSync(filePath, content);
console.log("Patched successfully");
