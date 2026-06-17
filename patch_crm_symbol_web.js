const fs = require('fs');
const file = 'src/app/crm/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldStr = `const webLeads: Lead[] = jobs
          .filter((j) => !callJobIds.has(j.id))
          .filter((j) => j.status?.toLowerCase() === 'lead' || j.status?.toLowerCase() === 'estimating' || j.status?.toLowerCase() === 'scheduled')
          .map((job) => {
            const customerName = job.customers?.first_name && job.customers.first_name !== "New"
              ? \`\${job.customers.first_name} \${job.customers.last_name || ""}\`.trim() : "";
            const phone = job.customers?.phone_number || "";
            const isScheduled = Boolean(job.scheduled_start) || job.status?.toLowerCase() === 'scheduled';
            return {
              id: job.id,
              customer_id: job.customer_id || "",
              job_id: job.id,
              scheduled_start: job.scheduled_start || null,
              caller_name: customerName || (phone ? formatPhone(phone) : "Web/SMS Lead"),
              phone,
              address: job.address || "Address unknown",
              job_type: job.title || "Job Request",
              job_details: job.notes || "",
              urgency: job.priority || "low",
              summary: job.notes || "",
              action_items: "",
              transcript: null,
              recording_url: "",
              status: isScheduled ? "scheduled" : (job.status?.toLowerCase() === "estimating" ? "estimating" : "captured"),
              time_ago: timeAgo(job.created_at),
              created_at: job.created_at,
            };
          });`;

const newStr = `const webLeads: Lead[] = jobs
          .filter((j) => !callJobIds.has(j.id))
          .filter((j) => j.status?.toLowerCase() === 'lead' || j.status?.toLowerCase() === 'estimating' || j.status?.toLowerCase() === 'scheduled')
          .map((job) => {
            const customerName = job.customers?.first_name && job.customers.first_name !== "New"
              ? \`\${job.customers.first_name} \${job.customers.last_name || ""}\`.trim() : "";
            const phone = job.customers?.phone_number || "";
            const isScheduled = Boolean(job.scheduled_start) || job.status?.toLowerCase() === 'scheduled';
            
            // Mark it as a web/sms lead for the UI
            const isWeb = true;

            return {
              id: job.id,
              customer_id: job.customer_id || "",
              job_id: job.id,
              scheduled_start: job.scheduled_start || null,
              caller_name: customerName || (phone ? formatPhone(phone) : "Web/SMS Lead"),
              phone,
              address: job.address || "Address unknown",
              job_type: job.title || "Job Request",
              job_details: job.notes || "",
              urgency: job.priority || "low",
              summary: job.notes || "",
              action_items: "",
              transcript: null,
              recording_url: "",
              status: isScheduled ? "scheduled" : (job.status?.toLowerCase() === "estimating" ? "estimating" : "captured"),
              time_ago: timeAgo(job.created_at),
              created_at: job.created_at,
              isWeb,
            };
          });`;

if (code.includes(oldStr)) {
  code = code.replace(oldStr, newStr);
  fs.writeFileSync(file, code);
  console.log('Fixed web leads mapping to include isWeb flag.');
} else {
  console.log('Web leads map not found');
}
