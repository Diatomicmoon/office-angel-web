import fs from 'fs';

let content = fs.readFileSync('/home/jakob/.openclaw/workspace/office-angel-web/src/components/dashboard/NewBuildsTab.tsx', 'utf8');

const oldGrid = `<div className={\`grid grid-cols-2 gap-4 text-sm p-3 rounded-lg border \${isKnocked ? 'bg-gray-100 border-gray-200' : 'bg-gray-50 border-gray-100'}\`}>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Permit Issued</div>
                      <div className="font-medium text-gray-900">
                        {lead.permit_date && lead.permit_date !== '2026-01-01' ? new Date(lead.permit_date).toLocaleDateString() : 'Historical'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Est. Completion</div>
                      <div className="font-medium text-gray-900">
                        {lead.estimated_completion_date ? new Date(lead.estimated_completion_date).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  </div>`;

const newGrid = `<div className={\`grid grid-cols-2 gap-4 text-sm p-3 rounded-lg border \${isKnocked ? 'bg-gray-100 border-gray-200' : 'bg-gray-50 border-gray-100'}\`}>
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

content = content.replace(oldGrid, newGrid);
fs.writeFileSync('/home/jakob/.openclaw/workspace/office-angel-web/src/components/dashboard/NewBuildsTab.tsx', content);
console.log("Patched NewBuildsTab.tsx UI for County Records");
