import fs from 'fs';

const file = '/home/jakob/.openclaw/workspace/office-angel-web/src/app/canvassing/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// I'm changing it from slice(0, 5) to slice(0, 50) so you can actually see all the cities in the list!
code = code.replace(/visits\.slice\(0, 5\)/g, 'visits.slice(0, 50)');

fs.writeFileSync(file, code);
