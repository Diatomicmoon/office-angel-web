import fs from 'fs';

let content = fs.readFileSync('/home/jakob/.openclaw/workspace/office-angel-web/src/components/dashboard/NewBuildsTab.tsx', 'utf8');

// Also remove the "Phase" badge completely for CSV records, and make the Live permits less fluffy
const oldPhase = `<span className={\`px-2.5 py-0.5 rounded-full text-xs font-medium \${isCountyRecord ? 'bg-gray-100 text-gray-800' : phase.color}\`}>
                        {isCountyRecord ? 'Built (2024-2026)' : phase.status}
                      </span>`;

const newPhase = `{isCountyRecord ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          Completed Construction
                        </span>
                      ) : (
                        <span className={\`px-2.5 py-0.5 rounded-full text-xs font-medium \${phase.color}\`}>
                          {phase.status}
                        </span>
                      )}`;

content = content.replace(oldPhase, newPhase);

// Remove the estimated timeline colors/fluff if they are just estimates, but keep them for now as rough indicators,
// just make sure the wording is strict.
content = content.replace("Move-in Window", "Completed / Move-in");

fs.writeFileSync('/home/jakob/.openclaw/workspace/office-angel-web/src/components/dashboard/NewBuildsTab.tsx', content);
console.log("Patched NewBuildsTab.tsx UI for strictly facts part 2");
