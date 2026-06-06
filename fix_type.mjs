import fs from 'fs';
const path = './src/app/canvassing/page.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /const \[newVisit, setNewVisit\] = useState\(\{/,
  `const [newVisit, setNewVisit] = useState({\n    id: "" as string | undefined,`
);

fs.writeFileSync(path, code);
console.log("Fixed type");
