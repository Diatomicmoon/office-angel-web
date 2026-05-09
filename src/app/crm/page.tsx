"use client";

import { Map as MapIcon, Kanban, List, Search, MoreVertical, DollarSign, MapPin, Zap, CheckCircle2, Navigation, Phone, AlertTriangle, Clock } from "lucide-react";
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
  value?: string;
};

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
  if (u === "high") return <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded flex items-center gap-1"><AlertTriangle size={10}/> Emergency</span>;
  if (u === "medium") return <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">Estimate</span>;
  return <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Standard</span>;
}

export default function CRM() {
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/call-logs?limit=50')
      .then(r => r.json())
      .then(json => {
        const mapped: Lead[] = (json.calls || []).map((c: any) => {
          const structured = c.meta?.structured || {};
          // Normalize UUID-keyed structured outputs
          const normalized: Record<string, any> = {};
          Object.values(structured).forEach((item: any) => {
            if (item?.name && item?.result !== undefined && item.result !== '') normalized[item.name] = item.result;
          });
          Object.entries(structured).forEach(([k, v]: any) => {
            if (typeof v !== 'object' && v) normalized[k] = v;
          });

          const callerName = normalized.caller_name || 
            (c.customers?.first_name && c.customers.first_name !== 'New' ? `${c.customers.first_name} ${c.customers.last_name || ''}`.trim() : 'Unregistered Caller');
          const address = normalized.address || c.customers?.address || 'Unknown location';
          const jobType = normalized.job_type || (c.urgency_flag === 'high' ? 'Emergency' : 'Service Call');
          const urgency = c.urgency_flag || 'low';

          // Map urgency to pipeline status
          let status = 'captured';
          if (urgency === 'medium') status = 'estimating';
          if (c.call_status === 'missed') status = 'captured';

          return {
            id: c.id,
            caller_name: callerName,
            phone: c.customers?.phone_number || '',
            address,
            job_type: jobType,
            urgency,
            summary: c.summary || '',
            status,
            time_ago: timeAgo(c.created_at),
          };
        });
        setLeads(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const captured = leads.filter(l => l.status === 'captured');
  const estimating = leads.filter(l => l.status === 'estimating');
  const scheduled = leads.filter(l => l.status === 'scheduled');

  const LeadCard = ({ lead }: { lead: Lead }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-2">
        <UrgencyBadge urgency={lead.urgency} />
        <span className="text-xs text-gray-500">{lead.time_ago}</span>
      </div>
      <h4 className="font-semibold text-gray-900 mt-2">{lead.job_type}</h4>
      <p className="text-sm text-gray-500 mt-0.5">{lead.caller_name}</p>
      {lead.summary && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{lead.summary}</p>}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
        <MapPin size={12} />
        <span className="truncate">{lead.address}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Leads & CRM</h1>
          <p className="text-gray-500 mt-2">AI-captured leads from every inbound call, auto-sorted by urgency.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-gray-100 p-1 rounded-lg flex items-center">
            <button onClick={() => setViewMode('board')} className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === 'board' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
              <Kanban size={16}/> Board
            </button>
            <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>
              <List size={16}/> List
            </button>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
            + New Lead
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">Loading leads...</div>
      ) : viewMode === 'board' ? (
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">

          {/* Column 1: AI Captured */}
          <div className="flex-1 min-w-[300px] flex flex-col bg-gray-50 rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                AI Captured
                <span className="ml-2 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{captured.length}</span>
              </h3>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {captured.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">No new leads</p> : captured.map(l => <LeadCard key={l.id} lead={l} />)}
            </div>
          </div>

          {/* Column 2: Estimating */}
          <div className="flex-1 min-w-[300px] flex flex-col bg-gray-50 rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                Estimating
                <span className="ml-2 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{estimating.length}</span>
              </h3>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {estimating.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">No leads in estimating</p> : estimating.map(l => <LeadCard key={l.id} lead={l} />)}
            </div>
          </div>

          {/* Column 3: Scheduled */}
          <div className="flex-1 min-w-[300px] flex flex-col bg-gray-50 rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Scheduled
                <span className="ml-2 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{scheduled.length}</span>
              </h3>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {scheduled.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">No scheduled jobs</p> : scheduled.map(l => <LeadCard key={l.id} lead={l} />)}
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-2">Customer / Source</div>
            <div>Urgency</div>
            <div>Job Type / Address</div>
            <div className="text-right">Time</div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {leads.map(lead => (
              <div key={lead.id} className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-gray-50 cursor-pointer">
                <div className="col-span-2">
                  <h4 className="text-sm font-bold text-gray-900">{lead.caller_name}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone size={12}/> {lead.phone}</p>
                </div>
                <div><UrgencyBadge urgency={lead.urgency} /></div>
                <div>
                  <p className="text-sm text-gray-900">{lead.job_type}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{lead.address}</p>
                </div>
                <div className="text-right text-xs text-gray-500">{lead.time_ago}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
