import fs from 'fs';

let content = fs.readFileSync('/home/jakob/.openclaw/workspace/office-angel-web/src/components/dashboard/NewBuildsTab.tsx', 'utf8');

// The user wants the data to be straight facts, but the UI/UX can still be a bit more engaging ("not so professional" / "fun").
// Let's add a bit of color back to the 'Completed Construction' badge so it isn't just plain grey, but keep the text factual.

content = content.replace(
  `{isCountyRecord ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          Completed Construction
                        </span>
                      )`,
  `{isCountyRecord ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Completed Construction
                        </span>
                      )`
);

fs.writeFileSync('/home/jakob/.openclaw/workspace/office-angel-web/src/components/dashboard/NewBuildsTab.tsx', content);
