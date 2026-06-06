import fs from 'fs';

let content = fs.readFileSync('office-angel-web/src/app/canvassing/MapView.tsx', 'utf8');

const oldTooltip = `<Tooltip>
                  <div className="text-xs space-y-0.5">
                    {visit.address && <p className="font-semibold">{visit.address}</p>}
                    {visit.resident_name && <p className="text-muted-foreground">{visit.resident_name}</p>}
                    <p className="capitalize text-muted-foreground">
                      {level.replace(/_/g, " ")}
                    </p>
                  </div>
                </Tooltip>`;

const newTooltip = `<Tooltip>
                  <div className="text-xs space-y-0.5">
                    {visit.address && <p className="font-semibold">{visit.address}</p>}
                    {visit.resident_name && <p className="text-muted-foreground">{visit.resident_name}</p>}
                    <p className="capitalize text-muted-foreground">
                      {level.replace(/_/g, " ")}
                    </p>
                    {visit.notes && (
                      <p className="mt-1 border-t pt-1 text-[10px] text-muted-foreground whitespace-pre-wrap max-w-[200px]">
                        {visit.notes}
                      </p>
                    )}
                  </div>
                </Tooltip>`;

content = content.replace(oldTooltip, newTooltip);

// Also need to add `notes` to the Visit interface at the top
content = content.replace('lat?: number;', 'lat?: number;\n  notes?: string;');

fs.writeFileSync('office-angel-web/src/app/canvassing/MapView.tsx', content);
console.log("Patched MapView Tooltip.");
