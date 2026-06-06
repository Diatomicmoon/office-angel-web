import fs from 'fs';

let content = fs.readFileSync('/home/jakob/.openclaw/workspace/office-angel-web/src/components/dashboard/NewBuildsTab.tsx', 'utf8');

// Replace the sub-text description to be strictly business
content = content.replace(
  "Pre-construction dirt lots and builder permits. Track timelines to intercept new homeowners before they move in.",
  "Raw permit data and county tax records for new construction."
);

fs.writeFileSync('/home/jakob/.openclaw/workspace/office-angel-web/src/components/dashboard/NewBuildsTab.tsx', content);
