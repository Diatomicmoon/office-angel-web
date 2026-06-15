"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  MapPin, Phone, Mail, Clock, Calendar, FileText,
  PlusCircle, ArrowLeft, Star, ShieldAlert, CheckCircle2,
  Navigation, Edit3, Save, X, Tag, AlertTriangle, ChevronRight,
} from "lucide-react";
import Link from "next/link";

type Call = {
  id: string;
  summary?: string;
  urgency_flag?: string;
  action_items?: string;
  created_at?: string;
  duration_seconds?: number;
  meta?: any;
};

type Customer = {
  id: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  property_notes?: string;
  tags?: string[];
  created_at?: string;
};

function formatPhone(phone?: string) {
  const d = (phone || "").replace(/\D/g, "");
  if (d.length === 11 && d[0] === "1") return `(${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  return phone || "—";
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtDuration(sec?: number) {
  if (!sec) return "";
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

function jobTypeFromCall(call: Call) {
  const s = call.meta?.structured || {};
  let name = "";
  Object.values(s).forEach((item: any) => {
    if (item?.name === "job_type" && item?.result) name = item.result;
  });
  if (!name && s.job_type && typeof s.job_type === "string") name = s.job_type;
  if (!name || name.toLowerCase() === "electrical") {
    // try job_details
    let details = "";
    Object.values(s).forEach((item: any) => {
      if (item?.name === "job_details" && item?.result) details = item.result;
    });
    if (!details && s.job_details && typeof s.job_details === "string") details = s.job_details;
    if (details) name = details.replace(/^The caller (is |wants |requested? |need[s]? )*/i, "").split(/[,.]/)[0].slice(0, 60).trim();
  }
  if (!name) name = call.urgency_flag === "high" ? "Emergency" : "Service Call";
  return name;
}

const PRESET_TAGS = ["Dog in yard", "VIP", "Commercial", "Repeat customer", "Gate code needed", "Call before arriving", "Weekly Mowing", "Bi-Weekly Mowing", "Seasonal Cleanup"];

function ProfileContent() {
  const params = useSearchParams();
  const id = params.get("id");

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesVal, setNotesVal] = useState("");
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ first_name: '', last_name: '', phone_number: '', email: '', address: '' });

  const load = useCallback(() => {
    if (!id) { setLoading(false); return; }
    fetch(`/api/customers?id=${id}`)
      .then((r) => r.json())
      .then((json) => {
        setCustomer(json.customer);
        setNotesVal(json.customer?.property_notes || "");
        setProfileData({
          first_name: json.customer?.first_name || '',
          last_name: json.customer?.last_name || '',
          phone_number: json.customer?.phone_number || '',
          email: json.customer?.email || '',
          address: json.customer?.address || ''
        });
        setCalls(json.calls || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const saveProfile = async () => {
    if (!customer) return;
    setSaving(true);
    await fetch("/api/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: customer.id, ...profileData }),
    });
    setCustomer((prev) => prev ? { ...prev, ...profileData } : prev);
    setSaving(false);
    setEditingProfile(false);
  };

  const saveNotes = async () => {
    if (!customer) return;
    setSaving(true);
    await fetch("/api/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: customer.id, property_notes: notesVal }),
    });
    setCustomer((prev) => prev ? { ...prev, property_notes: notesVal } : prev);
    setSaving(false);
    setEditingNotes(false);
  };

  const toggleTag = async (tag: string) => {
    if (!customer) return;
    const lowerTag = tag.toLowerCase();
    const current = customer.tags || [];
    const next = current.includes(lowerTag)
      ? current.filter((t) => t !== lowerTag)
      : [...current, lowerTag];
    setCustomer((prev) => prev ? { ...prev, tags: next } : prev);
    await fetch("/api/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: customer.id, tags: next }),
    });
  };

  const addCustomTag = async () => {
    if (!tagInput.trim() || !customer) return;
    const next = [...(customer.tags || []), tagInput.trim().toLowerCase()];
    setCustomer((prev) => prev ? { ...prev, tags: next } : prev);
    setTagInput("");
    await fetch("/api/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: customer.id, tags: next }),
    });
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">Loading customer profile...</div>;
  }

  if (!customer && id) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">Customer not found.</div>;
  }

  const name = customer?.first_name && customer.first_name !== "New"
    ? `${customer.first_name} ${customer.last_name || ""}`.trim()
    : formatPhone(customer?.phone_number);

  const initials = (customer?.first_name && customer.first_name !== "New")
    ? `${customer.first_name[0]}${(customer.last_name || "?")[0]}`.toUpperCase()
    : "?";

  const hasDogTag = (customer?.tags || []).includes("dog in yard") ||
    (customer?.property_notes || "").toLowerCase().includes("dog");

  const lifetimeCallCount = calls.length;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col min-h-screen overflow-y-auto">
      {/* Back */}
      <div className="mb-6">
        <Link href="/projects" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors w-fit">
          <ArrowLeft size={16} /> Back to Archive
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6 mb-8 flex flex-col lg:flex-row items-start justify-between gap-6">
        
        {editingProfile ? (
          <div className="flex-1 w-full flex flex-col md:flex-row gap-6">
            <div className="h-16 w-16 md:h-20 md:w-20 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" 
                  placeholder="First Name" 
                  value={profileData.first_name} 
                  onChange={e => setProfileData({...profileData, first_name: e.target.value})}
                  className="border border-gray-300 rounded px-3 py-2 text-sm flex-1 text-black"
                />
                <input 
                  type="text" 
                  placeholder="Last Name" 
                  value={profileData.last_name} 
                  onChange={e => setProfileData({...profileData, last_name: e.target.value})}
                  className="border border-gray-300 rounded px-3 py-2 text-sm flex-1 text-black"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" 
                  placeholder="Phone" 
                  value={profileData.phone_number} 
                  onChange={e => setProfileData({...profileData, phone_number: e.target.value})}
                  className="border border-gray-300 rounded px-3 py-2 text-sm flex-1 text-black"
                />
                <input 
                  type="text" 
                  placeholder="Email" 
                  value={profileData.email} 
                  onChange={e => setProfileData({...profileData, email: e.target.value})}
                  className="border border-gray-300 rounded px-3 py-2 text-sm flex-1 text-black"
                />
              </div>
              <input 
                type="text" 
                placeholder="Address" 
                value={profileData.address} 
                onChange={e => setProfileData({...profileData, address: e.target.value})}
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full text-black"
              />
              <div className="flex gap-2 pt-2">
                <button onClick={saveProfile} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
                  {saving ? "Saving..." : "Save Profile"}
                </button>
                <button onClick={() => {
                  setEditingProfile(false);
                  setProfileData({
                    first_name: customer?.first_name || '',
                    last_name: customer?.last_name || '',
                    phone_number: customer?.phone_number || '',
                    email: customer?.email || '',
                    address: customer?.address || ''
                  });
                }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 w-full lg:w-auto">
            <div className="h-16 w-16 md:h-20 md:w-20 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 break-words">
                  {name}
                </h1>
                {lifetimeCallCount >= 2 && (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap">
                    <Star size={12} className="fill-green-700" /> Repeat
                  </span>
                )}
                {hasDogTag && (
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                    🐕 Dog
                  </span>
                )}
                <button onClick={() => setEditingProfile(true)} className="ml-2 p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors" title="Edit Profile">
                  <Edit3 size={16} />
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-5 mt-3 text-sm text-gray-600">
                {customer?.phone_number && (
                  <a href={`tel:${customer.phone_number}`} className="flex items-center gap-1.5 text-blue-600 hover:underline">
                    <Phone size={15} className="text-gray-400 shrink-0" /> {formatPhone(customer.phone_number)}
                  </a>
                )}
                {customer?.email && (
                  <span className="flex items-center gap-1.5 break-all">
                    <Mail size={15} className="text-gray-400 shrink-0" /> {customer.email}
                  </span>
                )}
                {customer?.address && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(customer.address)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-600 hover:underline text-left"
                  >
                    <MapPin size={15} className="text-blue-400 shrink-0" /> <span className="line-clamp-2 sm:line-clamp-1">{customer.address}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {!editingProfile && (
          <div className="text-left sm:text-right shrink-0 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 mt-2 lg:mt-0">
            <div className="flex flex-row lg:flex-col justify-between lg:justify-start items-center lg:items-end">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Total Requests</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl sm:text-4xl font-bold text-gray-900">{lifetimeCallCount}</p>
                  <p className="text-xs text-gray-400 lg:mt-1">Since {fmtDate(customer?.created_at)}</p>
                </div>
              </div>
              <Link href={`/jobs?ghl_contact=1&name=${encodeURIComponent(name || "")}&phone=${encodeURIComponent(customer?.phone_number || "")}&address=${encodeURIComponent(customer?.address || "")}`} className="mt-0 lg:mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2">
                <PlusCircle size={16} /> Book Job
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT: Property DNA + Tags */}
        <div className="space-y-6">

          {/* Property DNA */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <ShieldAlert size={18} className="text-orange-500" />
                Property DNA
              </h2>
              {!editingNotes ? (
                <button onClick={() => setEditingNotes(true)} className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800">
                  <Edit3 size={12} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={saveNotes} disabled={saving} className="text-xs text-green-700 font-medium flex items-center gap-1">
                    <Save size={12} /> {saving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => { setEditingNotes(false); setNotesVal(customer?.property_notes || ""); }} className="text-xs text-gray-500">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="p-5">
              {editingNotes ? (
                <textarea
                  value={notesVal}
                  onChange={(e) => setNotesVal(e.target.value)}
                  className="w-full h-40 text-sm text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder={"Dog in yard — large German Shepherd, text 10 min before arriving.\nGate code: 1492#\nPanel: Square D 200A, upgraded May 2026.\nSubpanel in garage still 60A."}
                />
              ) : notesVal ? (
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {notesVal.split("\n").map((line, i) => {
                    const isDanger = /dog|warning|caution|danger|careful|lock|gate/i.test(line);
                    return (
                      <div key={i} className={isDanger ? "bg-orange-50 border border-orange-100 text-orange-800 p-2 rounded-lg mb-2 flex items-start gap-2" : "mb-1"}>
                        {isDanger && <AlertTriangle size={14} className="mt-0.5 shrink-0" />}
                        {line}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <button onClick={() => setEditingNotes(true)} className="w-full text-center text-sm text-gray-400 hover:text-blue-600 py-4 border-2 border-dashed border-gray-200 rounded-lg transition-colors">
                  + Add site notes (dog in yard, gate code, panel info...)
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Tag size={16} className="text-blue-500" /> Tags
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {PRESET_TAGS.map((tag) => {
                  const active = (customer?.tags || []).includes(tag.toLowerCase());
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                        active
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
                  placeholder="Add custom tag..."
                  className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
                <button onClick={addCustomTag} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors">
                  Add
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT: Call History Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                Interaction & Job History
                <span className="ml-auto text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{calls.length}</span>
              </h2>
            </div>

            <div className="p-6 overflow-y-auto">
              {calls.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-12">No requests recorded yet.</p>
              ) : (
                <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pb-4">
                  {calls.map((call, i) => {
                    const isHigh = call.urgency_flag === "high";
                    const isMed = call.urgency_flag === "medium";
                    const dotColor = isHigh ? "bg-red-500" : isMed ? "bg-yellow-500" : "bg-blue-500";
                    const jobType = jobTypeFromCall(call);

                    return (
                      <div key={call.id} className="relative pl-8">
                        <div className={`absolute w-5 h-5 ${dotColor} rounded-full -left-[11px] border-4 border-white flex items-center justify-center`}>
                          {isHigh
                            ? <AlertTriangle size={9} className="text-white" />
                            : <CheckCircle2 size={9} className="text-white" />}
                        </div>

                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900">{jobType}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">{fmtDate(call.created_at)}{call.duration_seconds ? ` · ${fmtDuration(call.duration_seconds)}` : ""}</p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${isHigh ? "bg-red-100 text-red-700" : isMed ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                            {isHigh ? "🚨 Emergency" : isMed ? "📋 Estimate" : "📞 Standard"}
                          </span>
                        </div>

                        {call.summary && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-700 leading-relaxed">{call.summary}</p>
                            {call.action_items && (
                              <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-2 text-sm text-yellow-800">
                                <Clock size={14} className="mt-0.5 shrink-0 text-yellow-500" />
                                <span>{call.action_items}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <Link
                          href={`/call-logs?highlight=${call.id}`}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2"
                        >
                          <FileText size={12} /> View full transcript <ChevronRight size={11} />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CustomerProfile() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
