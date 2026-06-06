import fs from 'fs';
const path = './src/app/canvassing/page.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /import \{ Plus, Map, List, Flame, Snowflake, AlertCircle, XCircle, Phone, HardHat \} from "lucide-react";/,
  `import { Plus, Map, List, Flame, Snowflake, AlertCircle, XCircle, Phone, HardHat, Home } from "lucide-react";`
);

fs.writeFileSync(path, code);
console.log("Fixed type 6");
