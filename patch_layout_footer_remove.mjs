import fs from 'fs';

const filePath = '/home/jakob/.openclaw/workspace/office-angel-web/src/app/layout.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// Remove the footer from the global layout so it doesn't show up in the logged-in dashboard
const newMainBlock = `
          <main className="flex-1 min-w-0 flex flex-col min-h-screen">
            <div className="flex-1">
              {children}
            </div>
          </main>
`;

code = code.replace(/<main className="flex-1 min-w-0 flex flex-col min-h-screen">[\s\S]*?<\/main>/, newMainBlock);

fs.writeFileSync(filePath, code);
console.log("Removed global footer from layout.tsx");
