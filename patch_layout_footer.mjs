import fs from 'fs';

const filePath = '/home/jakob/.openclaw/workspace/office-angel-web/src/app/layout.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// We will inject a simple footer underneath the main content block
const newMainBlock = `
          <main className="flex-1 min-w-0 flex flex-col min-h-screen">
            <div className="flex-1">
              {children}
            </div>
            <footer className="w-full text-center py-4 text-xs text-gray-500 mt-auto border-t border-gray-200">
              <a href="/privacy-policy" className="hover:underline mx-2">Privacy Policy</a> | 
              <a href="/terms" className="hover:underline mx-2">Terms & Conditions</a>
            </footer>
          </main>
`;

code = code.replace(/<main className="flex-1 min-w-0">[\s\S]*?<\/main>/, newMainBlock);

fs.writeFileSync(filePath, code);
console.log("Patched layout.tsx with footer");
