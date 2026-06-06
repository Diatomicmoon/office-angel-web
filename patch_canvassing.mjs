import fs from 'fs';
const path = './src/app/canvassing/page.tsx';
let code = fs.readFileSync(path, 'utf8');

const navBar = `<div className="bg-muted p-1 rounded-lg flex flex-wrap items-center">
              <button 
                onClick={() => setView("list")}
                className={\`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 \${view === "list" ? "bg-background shadow-sm" : "text-muted-foreground"}\`}
              >
                <List className="w-4 h-4" /> New Movers
              </button>
              <button 
                onClick={() => setView("expected")}
                className={\`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 \${view === "expected" ? "bg-background shadow-sm text-blue-600" : "text-muted-foreground"}\`}
              >
                <HardHat className="w-4 h-4" /> Expected Builds
              </button>
              <button 
                onClick={() => setView("builds")}
                className={\`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 \${view === "builds" ? "bg-background shadow-sm text-green-600" : "text-muted-foreground"}\`}
              >
                <Home className="w-4 h-4" /> New Builds
              </button>
              <button 
                onClick={() => setView("map")}
                className={\`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 \${view === "map" ? "bg-background shadow-sm text-orange-600" : "text-muted-foreground"}\`}
              >
                <Map className="w-4 h-4" /> D2D Map
              </button>
            </div>`;

code = code.replace(/<div className="bg-muted p-1 rounded-lg flex items-center">[\s\S]*?<\/div>\s*<button \s*onClick=\{\(\) => setCanvassingActive\(true\)\}/, navBar + '\n            <button onClick={() => setCanvassingActive(true)}');

code = code.replace(
  /\{view === "builds" && \(\s*<div className="bg-card border rounded-xl shadow-sm p-4">\s*<NewBuildsTab \/>\s*<\/div>\s*\)\}/,
  `{view === "expected" && (
          <div className="bg-card border rounded-xl shadow-sm p-4">
            <NewBuildsTab fixedMode="permits" />
          </div>
        )}
        {view === "builds" && (
          <div className="bg-card border rounded-xl shadow-sm p-4">
            <NewBuildsTab fixedMode="csv" />
          </div>
        )}`
);

fs.writeFileSync(path, code);
console.log("Patched Canvassing Page");
