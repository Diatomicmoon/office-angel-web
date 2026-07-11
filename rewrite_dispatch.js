const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'dispatch', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add state for mobileTab and mobileSelectedTech
content = content.replace(
  /const \[viewMode, setViewMode\] = useState<'day' | 'map'>\('day'\);/,
  `const [viewMode, setViewMode] = useState<'day' | 'map'>('day');
  const [mobileTab, setMobileTab] = useState<'unassigned' | 'calendar' | 'map'>('calendar');
  const [mobileTechId, setMobileTechId] = useState<string>('all');`
);

// 2. Add Mobile Tabs and hide desktop buttons on mobile
content = content.replace(
  /<div className="flex flex-col lg:flex-row lg:justify-between items-start lg:items-end gap-4">/,
  `<div className="flex flex-col lg:flex-row lg:justify-between items-start lg:items-end gap-4 mb-2 lg:mb-0">`
);

content = content.replace(
  /<div className="flex flex-wrap gap-2 lg:gap-4 items-center w-full lg:w-auto">/,
  `<div className="hidden lg:flex flex-wrap gap-2 lg:gap-4 items-center w-full lg:w-auto">`
);

// We need to inject the mobile tab bar right after the Header section.
// The header ends with </div>\n      </div>\n\n      {/* Calendar Controls */}
content = content.replace(
  /<\/div>\s*<\/div>\s*\{\/\* Calendar Controls \*\/\}/,
  `</div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="flex bg-gray-200/60 p-1 rounded-xl w-full mb-4 lg:hidden relative z-20">
        <button 
          onClick={() => { setMobileTab('unassigned'); setViewMode('day'); }} 
          className={\`flex-1 px-2 py-2 rounded-lg text-xs font-bold transition-all \${mobileTab === 'unassigned' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}\`}
        >
          Unassigned <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full ml-1">{unassignedJobs.length}</span>
        </button>
        <button 
          onClick={() => { setMobileTab('calendar'); setViewMode('day'); }} 
          className={\`flex-1 px-2 py-2 rounded-lg text-xs font-bold transition-all \${mobileTab === 'calendar' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}\`}
        >
          Schedule
        </button>
        <button 
          onClick={() => { setMobileTab('map'); setViewMode('map'); }} 
          className={\`flex-1 px-2 py-2 rounded-lg text-xs font-bold transition-all \${mobileTab === 'map' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}\`}
        >
          Live Map
        </button>
      </div>

      {/* Calendar Controls */}`
);

// 3. Hide Calendar Controls if we are on 'unassigned' tab on mobile
content = content.replace(
  /<div className="bg-white p-3 md:p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">/,
  `<div className={\`bg-white p-3 md:p-4 rounded-xl border border-gray-200 shadow-sm flex-col md:flex-row items-center justify-between gap-4 md:gap-0 \${mobileTab === 'unassigned' ? 'hidden lg:flex' : 'flex'}\`}>`
);

// Hide view toggle buttons on mobile inside Calendar Controls
content = content.replace(
  /<div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">/,
  `<div className="hidden lg:flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">`
);

// 4. Wrap the left sidebar (AI Parking Lot) to hide on mobile if not 'unassigned'
content = content.replace(
  /<div className="w-full lg:w-80 h-\[350px\] lg:h-auto lg:min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col flex-shrink-0">/,
  `<div className={\`w-full lg:w-80 h-[calc(100dvh-12rem)] lg:h-auto lg:min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex-col flex-shrink-0 \${mobileTab === 'unassigned' ? 'flex' : 'hidden lg:flex'}\`}>`
);

// 5. Wrap the right side (Board or Map) to hide on mobile if 'unassigned'
content = content.replace(
  /<div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col relative min-h-0 min-w-0">/,
  `<div className={\`flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex-col relative min-h-0 min-w-0 \${mobileTab === 'unassigned' ? 'hidden lg:flex' : 'flex'}\`}>`
);

// 6. Fix Map View rendering condition
// change: {viewMode === 'map' ? (
// to: {(viewMode === 'map' || mobileTab === 'map') ? (
content = content.replace(
  /\{viewMode === 'map' \? \(/,
  `{(viewMode === 'map' || mobileTab === 'map') ? (`
);

// 7. Inject Mobile Tech Selector inside the Day View (sticky top)
const oldStickyHeader = `<div className="sticky top-0 z-40 bg-white border-b border-gray-200 flex">
                <div className="bg-gray-50 border-r border-gray-200" style={{ width: GUTTER_W, height: GRID_HEADER_PX }} />
                <div className="flex min-w-max">
                  {techs.map((tech) => (`;

const newStickyHeader = `<div className="sticky top-0 z-40 bg-white border-b border-gray-200 flex flex-col">
                
                {/* Mobile Tech Selector */}
                <div className="lg:hidden p-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                   <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dispatcher View</span>
                   <select 
                     className="bg-white border border-gray-200 rounded-lg text-xs font-bold py-1.5 px-3 text-gray-800 shadow-sm outline-none"
                     value={mobileTechId}
                     onChange={e => setMobileTechId(e.target.value)}
                   >
                     <option value="all">All Technicians</option>
                     {techs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                   </select>
                </div>

                <div className="flex">
                <div className="bg-gray-50 border-r border-gray-200 flex-shrink-0" style={{ width: GUTTER_W, height: GRID_HEADER_PX }} />
                <div className="flex min-w-max">
                  {techs.filter(t => mobileTechId === 'all' || t.id === mobileTechId).map((tech) => (`;

content = content.replace(oldStickyHeader, newStickyHeader);

// 8. Filter the techs rendered in the body columns too!
const oldBodyTechMap = `) : techs.map((tech) => {
                    // Only render jobs`;

const newBodyTechMap = `) : techs.filter(t => mobileTechId === 'all' || t.id === mobileTechId).map((tech) => {
                    // Only render jobs`;

content = content.replace(oldBodyTechMap, newBodyTechMap);

// Add missing closing div for the new sticky flex-col
const oldBodyEnd = `</div>
              </div>

              {/* Body */}`;
const newBodyEnd = `</div>
              </div>
              </div>

              {/* Body */}`;
content = content.replace(oldBodyEnd, newBodyEnd);

// Ensure column width is better on mobile: flex-1 min-w-[200px] lg:w-[300px]
content = content.replace(
  /<div key=\{tech\.id\} className="w-\[300px\] border-r border-gray-200 relative">/g,
  `<div key={tech.id} className="w-[85vw] lg:w-[300px] border-r border-gray-200 relative flex-shrink-0">`
);

content = content.replace(
  /<div key=\{tech\.id\} className="w-\[300px\] border-r border-gray-200 bg-white p-3 flex items-center" style=\{\{ height: GRID_HEADER_PX \}\}>/g,
  `<div key={tech.id} className="w-[85vw] lg:w-[300px] border-r border-gray-200 bg-white p-3 flex items-center flex-shrink-0" style={{ height: GRID_HEADER_PX }}>`
);

// Since mobileTechId="all" will show all cols side by side and they are 85vw, you can smoothly swipe horizontally like a carousel! 
// If they pick one, it fills 85vw (which leaves a little edge so they know they can't scroll).
// Let's actually make it 100% width on mobile if a specific tech is selected, or 85vw if 'all' is selected.
// To do this easily, just use CSS: `w-[calc(100vw-112px)] lg:w-[300px]` (112px is the gutter width).
content = content.replace(
  /w-\[85vw\]/g,
  `w-[calc(100vw-115px)]`
);


fs.writeFileSync(filePath, content);
console.log("Patched successfully");
