import fs from 'fs';

const path = 'office-angel-web/src/app/api/call-finished/route.ts';
let code = fs.readFileSync(path, 'utf8');

const injection = `
        const toolCalls = payload.message?.artifact?.toolCalls || [];
        const wasJobBookedByTool = toolCalls.some(tc => tc?.function?.name === 'book_appointment');

        if (wasJobBookedByTool) {
           console.log('[CALL FINISHED] Job was already booked by Vapi tool mid-call. Skipping duplicate job creation.');
           // Still link the call log to the most recently created job for this customer
           const { data: latestJob } = await supabase
             .from('jobs')
             .select('id')
             .eq('company_id', companyId)
             .order('created_at', { ascending: false })
             .limit(1)
             .single();
             
           if (latestJob && callLogId) {
              await supabase.from('call_logs').update({
                meta: {
                  ...(baseRow.meta || {}),
                  structured: {
                    ...((baseRow.meta || {}).structured || {}),
                    job_id: latestJob.id,
                  },
                },
              }).eq('id', callLogId);
           }
        } else {
`;

// we need to find where job creation starts. 
// "let job: any = null;" is a good anchor.
const anchor = "let job: any = null;";
code = code.replace(anchor, injection + "\n          " + anchor);

// Add the closing brace for the else block after the job creation logic
const endAnchor = "console.error('Job creation/linking failed (non-fatal):', e);\n      }";
code = code.replace(endAnchor, endAnchor + "\n        }");

fs.writeFileSync(path, code);
console.log("Patched call-finished with tool check");
