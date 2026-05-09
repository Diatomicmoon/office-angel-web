"use client";

import { Kanban, List, MapPin, Phone } from "lucide-react";
import { useState, useEffect } from "react";

type Lead = {
  id: string;
  caller_name: string;
  phone: string;
  address: string;
  job_type: string;
  urgency: string;
  summary: string;
  status: string;
  time_ago: string;
};

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits[0] === "1")
    return `(${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
  if (digits.length === 10)
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  return phone;
}

function timeAgo(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  const u = (urgency || "low").toLowerCase();
  if (u === "high")
    return (
      <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
        Emergency
      </span>
    );
  if (u === "medium")
    return (
      <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">
        Estimate
      </span>
    );
  return (
    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
      Standard
    </span>
  );
}

export default function CRM() {
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/call-logs?limit=50")
      .then((r) => r.json())
      .then((json) => {
        const mapped: Lead[] = (json.calls || []).map((c: any) => {
          const structured = c.meta?.structured || {};
          const normalized: Record<string, any> = {};

          // First pass: extract UUID-keyed objects like {name: "caller_name", result: "..."}
          Object.values(structured).forEach((item: any) => {
            if (item?.name && item?.result !== undefined && item.result !== "")
              normalized[item.name] = item.result;
          });
          // Second pass: flat string values (demo data format)
          Object.entries(structured).forEach(([, v]: any) => {
            if (typeof v !== "object" && v) {
              // already merged via keys above — skip
            }
          });
          // Direct flat keys take precedence only if non-null
          const flatKeys = ["caller_name", "address", "job_type", "job_details", "urgency"];
          flatKeys.forEach((k) => {
            if (structured[k] !== null && structured[k] !== undefined && structured[k] !== "")
              normalized[k] = structured[k];
          });

          // Caller name: structured → customer table → phone number
          const phone = c.customers?.phone_number || "";
          const callerName =
            normalized.caller_name ||
            (c.customers?.first_name && c.customers.first_name !== "New"
              ? `${c.customers.first_name} ${c.customers.last_name || ""}`.trim()
              : phone ? formatPhone(phone) : "Unknown Caller");

          const address =
            normalized.address || c.customers?.address || "Address unknown";

          // Job type: use structured value; if generic "electrical" pull first sentence of job_details
          let jobType = normalized.job_type || "";
          if (!jobType || jobType.toLowerCase() === "electrical") {
            const details = normalized.job_details || "";
            if (details) {
              // Shorten: take up to 40 chars, stop at comma or period
              jobType = details.replace(/^The caller (is |wants |requested? |need[s]? )*/i, "")
                .split(/[,.]/)[0].slice(0, 50).trim();
            } else {
              jobType = c.urgency_flag === "high" ? "Emergency" : "Service Call";
            }
          }

          const urgency = c.urgency_flag || "low";
          const status = urgency === "medium" ? "estimating" : "captured";

          return {
            id: c.id,
            caller_name: callerName,
            phone,
            address,
            job_type: jobType,
            urgency,
            summary: c.summary || "",
            status,
            time_ago: timeAgo(c.created_at),
          };
        });
        setLeads(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const captured = leads.filter((l) => l.status === "captured");
  const estimating = leads.filter((l) => l.status === "estimating");
  const scheduled = leads.filter((l) => l.status === "scheduled");

  const LeadCard = ({ lead }: { lead: Lead }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-2">
        <UrgencyBadge urgency={lead.urgency} />
        <span className="text-xs text-gray-500">{lead.time_ago}</span>
      </div>
      <h4 className="font-semibold text-gray-900 mt-2">{lead.job_type}</h4>
      <p className="text-sm text-gray-500 mt-0.5">{lead.caller_name}</p>
      {lead.summary && (
        <p className="text-xs text-gray-400 mt-2 overflow-hidden" style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>
          {lead.summary}
        </p>
      )}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
        <MapPin size={12} />
        <span className="truncate">{lead.address}</span>
      </div>
    </div>
  );

  const Column = ({
    title,
    color,
    items,
  }: {
    title: string;
    color: string;
    items: Lead[];
  }) => (
    <div className="flex-1 min-w-72 flex flex-col bg-gray-50 rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center gap-2 bg-white rounded-t-xl">
        <span className={`h-2 w-2 rounded-full ${color}`}></span>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="ml-auto text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Empty</p>
        ) : (
          items.map((l) => <LeadCard key={l.id} lead={l} />)
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col h-screen">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Leads &amp; CRM
          </h1>
          <p className="text-gray-500 mt-2">
            AI-captured leads from every inbound call, auto-sorted by urgency.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-gray-100 p-1 rounded-lg flex items-center">
            <button
              onClick={() => setViewMode("board")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                viewMode === "board"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Kanban size={16} /> Board
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <List size={16} /> List
            </button>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
            + New Lead
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Loading leads...
        </div>
      ) : viewMode === "board" ? (
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
          <Column title="AI Captured" color="bg-blue-500" items={captured} />
          <Column title="Estimating" color="bg-yellow-500" items={estimating} />
          <Column title="Scheduled" color="bg-green-500" items={scheduled} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-2">Customer</div>
            <div>Urgency</div>
            <div>Job Type / Address</div>
            <div className="text-right">Time</div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-gray-50 cursor-pointer"
              >
                <div className="col-span-2">
                  <h4 className="text-sm font-bold text-gray-900">
                    {lead.caller_name}
                  </h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Phone size={12} /> {lead.phone}
                  </p>
                </div>
                <div>
                  <UrgencyBadge urgency={lead.urgency} />
                </div>
                <div>
                  <p className="text-sm text-gray-900">{lead.job_type}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {lead.address}
                  </p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  {lead.time_ago}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
