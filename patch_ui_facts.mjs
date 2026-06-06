import fs from 'fs';

let content = fs.readFileSync('/home/jakob/.openclaw/workspace/office-angel-web/src/components/dashboard/NewBuildsTab.tsx', 'utf8');

// The CSV records actually have the build year from the tax data in the notes (e.g. "County Tax Record: Year Built 2024")
// So instead of just saying "Already Built", let's extract the actual year from the notes if it exists.
// And we'll just show the raw data from the record, no fluff.

const oldGrid = `<div className={\`grid grid-cols-2 gap-4 text-sm p-3 rounded-lg border \${isKnocked ? 'bg-gray-100 border-gray-200' : 'bg-gray-50 border-gray-100'}\`}>
                    {isCountyRecord ? (
                      <>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Data Source</div>
                          <div className="font-medium text-gray-900">County Assessor</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Build Status</div>
                          <div className="font-medium text-gray-900">Already Built</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Permit Issued</div>
                          <div className="font-medium text-gray-900">
                            {lead.permit_date ? new Date(lead.permit_date).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Est. Completion</div>
                          <div className="font-medium text-gray-900">
                            {lead.estimated_completion_date ? new Date(lead.estimated_completion_date).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                      </>
                    )}
                  </div>`;

const newGrid = `<div className={\`grid grid-cols-2 gap-4 text-sm p-3 rounded-lg border \${isKnocked ? 'bg-gray-100 border-gray-200' : 'bg-gray-50 border-gray-100'}\`}>
                    {isCountyRecord ? (
                      <>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Data Source</div>
                          <div className="font-medium text-gray-900">County Tax Record</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Year Built</div>
                          <div className="font-medium text-gray-900">{lead.notes?.match(/Year Built (\\d+)/)?.[1] || 'Unknown'}</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Permit Issued</div>
                          <div className="font-medium text-gray-900">
                            {lead.permit_date ? new Date(lead.permit_date).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Permit Close / Est. Finish</div>
                          <div className="font-medium text-gray-900">
                            {lead.estimated_completion_date ? new Date(lead.estimated_completion_date).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                      </>
                    )}
                  </div>`;

content = content.replace(oldGrid, newGrid);
fs.writeFileSync('/home/jakob/.openclaw/workspace/office-angel-web/src/components/dashboard/NewBuildsTab.tsx', content);
console.log("Patched NewBuildsTab.tsx UI for strictly facts");
