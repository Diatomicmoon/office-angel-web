import fs from 'fs';
const path = './src/app/canvassing/page.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /import \{ List, Map, Plus, XCircle, HardHat \} from "lucide-react";/,
  `import { List, Map, Plus, XCircle, HardHat, Home } from "lucide-react";`
);

fs.writeFileSync(path, code);
console.log("Fixed type 5");
