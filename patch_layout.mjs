import fs from 'fs';
const path = './src/components/dashboard/NewBuildsTab.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">/,
  `<div className="flex flex-col gap-3">`
);

// Remove the heavy paddings and space-y to make it a compact list row
code = code.replace(
  /<div className={`p-4 border-b/g,
  `<div className={\`p-3 border-b`
);

code = code.replace(
  /<div className="p-4 space-y-4">/g,
  `<div className="p-3 space-y-3">`
);

fs.writeFileSync(path, code);
console.log("Patched layout to list");
