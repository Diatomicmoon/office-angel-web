const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src', 'app', 'dispatch', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix the syntax error:
// const [mobileTechId, setMobileTechId] = useState<string>('all');| 'map'>('day');
content = content.replace(
  /useState<string>\('all'\);\| 'map'>\('day'\);/g,
  `useState<string>('all');`
);

fs.writeFileSync(filePath, content);
console.log("Fixed");
