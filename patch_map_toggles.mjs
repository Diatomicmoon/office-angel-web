import fs from 'fs';
const path = './src/app/canvassing/page.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('mapFilter')) {
  code = code.replace(
    /const \[view, setView\] = useState/,
    `const [mapFilter, setMapFilter] = useState<'all' | 'unknocked' | 'knocked'>('all');\n  const [view, setView] = useState`
  );

  code = code.replace(
    /visits=\{visits\}/,
    `visits={visits.filter(v => {
              if (mapFilter === 'all') return true;
              const isKnocked = ['hot', 'warm', 'not_interested', 'do_not_knock'].includes(v.interest_level);
              if (mapFilter === 'knocked') return isKnocked;
              return !isKnocked;
            })}`
  );

  code = code.replace(
    /<div className="absolute top-4 left-1\/2 -translate-x-1\/2 z-\[1000\] bg-white\/90 px-4 py-2 rounded-full shadow-md text-sm font-medium border text-center pointer-events-none">[\s\S]*?<\/div>/,
    `<div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex gap-2">
              <button onClick={() => setMapFilter('all')} className={\`px-3 py-1.5 rounded-full shadow-md text-xs font-medium border \${mapFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white/90 text-gray-700'}\`}>All Pins</button>
              <button onClick={() => setMapFilter('unknocked')} className={\`px-3 py-1.5 rounded-full shadow-md text-xs font-medium border \${mapFilter === 'unknocked' ? 'bg-blue-600 text-white' : 'bg-white/90 text-gray-700'}\`}>Unknocked Only</button>
              <button onClick={() => setMapFilter('knocked')} className={\`px-3 py-1.5 rounded-full shadow-md text-xs font-medium border \${mapFilter === 'knocked' ? 'bg-blue-600 text-white' : 'bg-white/90 text-gray-700'}\`}>Knocked Only</button>
            </div>`
  );
  
  fs.writeFileSync(path, code);
  console.log("Patched map filters");
}
