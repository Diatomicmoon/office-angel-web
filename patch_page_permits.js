const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/canvassing/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Add import
if (!content.includes('PermitWalletTab')) {
  content = content.replace(
    'import WeeklyReportTab from "./WeeklyReportTab";',
    'import WeeklyReportTab from "./WeeklyReportTab";\nimport PermitWalletTab from "./PermitWalletTab";\nimport { ShieldCheck } from "lucide-react";'
  );
}

// 2. Add button in the nav
if (!content.includes('view === "permits"')) {
  content = content.replace(
    /className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 \${view === "report" \? "bg-background shadow-sm text-blue-600" : "text-muted-foreground"}`}\s*>\s*<Calendar className="w-4 h-4" \/> Weekly Report\s*<\/button>/g,
    `className={\`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 \${view === "report" ? "bg-background shadow-sm text-blue-600" : "text-muted-foreground"}\`}
              >
                <Calendar className="w-4 h-4" /> Weekly Report
              </button>
              <button 
                onClick={() => setView("permits")}
                className={\`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 \${view === "permits" ? "bg-background shadow-sm text-blue-600" : "text-muted-foreground"}\`}
              >
                <ShieldCheck className="w-4 h-4" /> Permits
              </button>`
  );
}

// 3. Add view rendering logic
if (!content.includes('view === "permits" ? (')) {
  content = content.replace(
    /\} else if \(view === "map"\) \{/g, // Wait, it uses ternary in JSX
    `? null : null` // Let's find exactly where it renders
  );
  
  // Actually, let's look at the render logic string.
  content = content.replace(
    /\{view === "builds" \? \(/g,
    `{view === "permits" ? (
          <PermitWalletTab />
        ) : view === "builds" ? (`
  );
}

fs.writeFileSync(pagePath, content);
console.log("Patched page.tsx successfully!");
