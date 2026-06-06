import fs from 'fs';
const path = './src/app/canvassing/page.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /const \[view, setView\] = useState<"list" \| "builds" \| "map" \| "territories">/,
  `const [view, setView] = useState<"list" | "builds" | "expected" | "map" | "territories">`
);

fs.writeFileSync(path, code);
console.log("Fixed type 3");
