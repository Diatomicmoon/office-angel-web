"use client";

import { useState, useEffect } from "react";
import { Phone, Bot, PhoneForwarded, Save, CheckCircle2, AlertTriangle, Mic, Clock } from "lucide-react";

export type Settings = {
  id: string;
  name: string;
  phone_number: string;
  ai_enabled: boolean;
  forward_to_phone: string | null;
  schedule_start_minute?: number | null;
  schedule_end_minute?: number | null;
  webhook_secret?: string | null;
  calendar_webhook_url?: string | null;
  inbox_token?: string | null;
  quickbooks_realm_id?: string | null;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [forwardPhone, setForwardPhone] = useState("");
  const [schedStart, setSchedStart] = useState("08:00");
  const [schedEnd, setSchedEnd] = useState("17:00");
  const [calendarWebhook, setCalendarWebhook] = useState("");
  const [webhookSecret, setWebhookSecret] = useState<string | null>(null);
  const [inboxToken, setInboxToken] = useState<string | null>(null);
  const [qbMessage, setQbMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Check URL for QuickBooks OAuth status
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "quickbooks_connected") {
      setQbMessage({ type: 'success', text: 'Successfully connected to QuickBooks Online!' });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get("error")) {
      setQbMessage({ type: 'error', text: `QuickBooks connection failed: ${params.get("error")}` });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    fetch("/api/settings")
      .then((r) => r.json())
      .then((json) => {
        setSettings(json.settings);
        setForwardPhone(json.settings?.forward_to_phone || "");
        const toHHMM = (m?: number | null, fallback = "08:00") => {
          if (typeof m !== 'number' || !Number.isFinite(m)) return fallback;
          const hh = String(Math.floor(m / 60)).padStart(2, '0');
          const mm = String(m % 60).padStart(2, '0');
          return `${hh}:${mm}`;
        };
        setSchedStart(toHHMM(json.settings?.schedule_start_minute, "08:00"));
        setSchedEnd(toHHMM(json.settings?.schedule_end_minute, "17:00"));
        setCalendarWebhook(json.settings?.calendar_webhook_url || "");
        setWebhookSecret(json.settings?.webhook_secret || null);
        setInboxToken(json.settings?.inbox_token || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleAI = async () => {
    if (!settings) return;
    const next = !settings.ai_enabled;
    setSettings((s) => s ? { ...s, ai_enabled: next } : s);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ai_enabled: next }),
    });
  };

  const saveForwardPhone = async () => {
    if (!settings) return;
    setSaving(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ forward_to_phone: forwardPhone || null }),
    });
    setSettings((s) => s ? { ...s, forward_to_phone: forwardPhone || null } : s);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const saveSchedulingHours = async () => {
    if (!settings) return;
    const toMin = (hhmm: string) => {
      const [h, m] = hhmm.split(":").map((x) => Number(x));
      if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
      return h * 60 + m;
    };
    const startMin = toMin(schedStart);
    const endMin = toMin(schedEnd);
    if (startMin === null || endMin === null) return;
    setSaving(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedule_start_minute: startMin, schedule_end_minute: endMin }),
    });
    setSettings((s) => s ? { ...s, schedule_start_minute: startMin, schedule_end_minute: endMin } : s);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const saveCalendarWebhook = async () => {
    if (!settings) return;
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calendar_webhook_url: calendarWebhook || null }),
    });
    setSettings((s) => s ? { ...s, calendar_webhook_url: calendarWebhook || null } : s);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const rotateWidgetSecret = async () => {
    setSaving(true);
    const r = await fetch('/api/settings', { method: 'POST' });
    const j = await r.json().catch(() => ({}));
    if (j?.webhook_secret) setWebhookSecret(j.webhook_secret);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const disconnectQuickBooks = async () => {
    if (!confirm("Are you sure you want to disconnect QuickBooks? Your financial dashboard will stop syncing.")) return;
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        quickbooks_realm_id: null, 
        quickbooks_access_token: null, 
        quickbooks_refresh_token: null, 
        quickbooks_token_expires_at: null 
      }),
    });
    setSettings((s) => s ? { ...s, quickbooks_realm_id: null } : s);
    setQbMessage({ type: 'success', text: 'QuickBooks disconnected successfully.' });
    setSaving(false);
  };

if (loading) return <div className="flex-1 flex items-center justify-center text-gray-400 p-4 md:p-8">Loading settings...</div>;
  if (!settings) return <div className="flex-1 p-8 text-gray-400">Could not load settings.</div>;

  const aiOn = settings.ai_enabled !== false;

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      {qbMessage && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${qbMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {qbMessage.type === 'success' ? <CheckCircle2 className="mt-0.5 shrink-0 text-green-600" size={20} /> : <AlertTriangle className="mt-0.5 shrink-0 text-red-600" size={20} />}
          <div>
            <h3 className="font-semibold">{qbMessage.type === 'success' ? 'Connection Successful' : 'Connection Error'}</h3>
            <p className="text-sm mt-1">{qbMessage.text}</p>
          </div>
        </div>
      )}
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-2">Control how Office Angel handles your inbound calls.</p>
      </div>

      {/* AI Call Handler Toggle */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Bot size={18} className="text-blue-600" /> AI Call Handler
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            When ON, Sarah (AI) answers all calls automatically. When OFF, calls ring to your dispatcher's phone — AI listens silently in the background.
          </p>
        </div>

        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${aiOn ? "bg-blue-100" : "bg-gray-100"}`}>
              {aiOn ? <Bot size={28} className="text-blue-600" /> : <Phone size={28} className="text-gray-500" />}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">
                {aiOn ? "AI is handling all calls" : "Human dispatcher mode"}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {aiOn
                  ? "Sarah answers every call, transcribes, and saves to your dashboard."
                  : "Calls ring to your phone. AI listens and fills the job ticket silently."}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={toggleAI}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none ${aiOn ? "bg-blue-600" : "bg-gray-300"}`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${aiOn ? "translate-x-9" : "translate-x-1"}`}
            />
          </button>
        </div>

        {/* Status badge */}
        <div className={`mx-6 mb-6 rounded-lg p-3 flex items-center gap-2 text-sm font-medium ${aiOn ? "bg-blue-50 border border-blue-200 text-blue-800" : "bg-yellow-50 border border-yellow-200 text-yellow-800"}`}>
          {aiOn
            ? <><CheckCircle2 size={16} className="text-blue-600" /> Sarah is live on <span className="font-mono mx-1">{settings.phone_number || "(612) 324-5110"}</span> right now.</>
            : <><Mic size={16} className="text-yellow-600" /> Co-Pilot mode active — AI will transcribe while your team handles the call.</>
          }
        </div>
      </div>

      {/* Forward-to Phone (Co-Pilot mode) */}
      <div className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-opacity ${aiOn ? "opacity-50 pointer-events-none" : "opacity-100 border-gray-200"}`}>
        <div className="p-5 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <PhoneForwarded size={18} className="text-purple-600" /> Dispatcher Phone Number
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            When AI is OFF, inbound calls ring this number. The AI joins silently as a note-taker.
          </p>
        </div>
        <div className="p-6 space-y-4">
          {!aiOn && !settings.forward_to_phone && (
            <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              No dispatcher number set. Calls will fall back to AI until you add one.
            </div>
          )}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={forwardPhone}
                onChange={(e) => setForwardPhone(e.target.value)}
                placeholder="+16125551234"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-mono"
              />
            </div>
            <button
              onClick={saveForwardPhone}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {saved ? <><CheckCircle2 size={16} /> Saved!</> : saving ? "Saving..." : <><Save size={16} /> Save</>}
            </button>
          </div>
          <p className="text-xs text-gray-400">Enter in E.164 format: +1XXXXXXXXXX</p>
        </div>
      </div>

      {/* Scheduling Hours */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Clock size={18} className="text-blue-600" /> Scheduling Hours
          </h2>
          <p className="text-sm text-gray-500 mt-1">Office Angel will only suggest times inside this window (Chicago time).</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Start</label>
              <input type="time" value={schedStart} onChange={(e) => setSchedStart(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">End</label>
              <input type="time" value={schedEnd} onChange={(e) => setSchedEnd(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black" />
            </div>
          </div>
          <button
            onClick={saveSchedulingHours}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {saved ? <><CheckCircle2 size={16} /> Saved!</> : saving ? "Saving..." : <><Save size={16} /> Save Hours</>}
          </button>
        </div>
      </div>

      {/* Website widget + Calendar hook */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900">Website Widget + Calendar</h2>
          <p className="text-sm text-gray-500 mt-1">Configure your site chat widget and external calendar sync.</p>
        </div>
        <div className="p-6 space-y-6">
          
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-900">Website Widget Secret</label>
            <div className="flex gap-3">
              <input 
                type="text" 
                readOnly 
                value={webhookSecret || 'Not generated'} 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-600"
              />
              <button 
                onClick={rotateWidgetSecret}
                disabled={saving}
                className="whitespace-nowrap px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Generate New
              </button>
            </div>
            <p className="text-xs text-gray-500">Use this token to embed the chat widget on your own website.</p>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-900">Zapier / Make Calendar Webhook</label>
            <div className="flex gap-3">
              <input 
                type="url" 
                value={calendarWebhook}
                onChange={(e) => setCalendarWebhook(e.target.value)}
                placeholder="https://hooks.zapier.com/..." 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-black"
              />
              <button 
                onClick={saveCalendarWebhook}
                disabled={saving}
                className="whitespace-nowrap px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
              >
                Save URL
              </button>
            </div>
            <p className="text-xs text-gray-500">Office Angel will POST job data to this URL when a job is scheduled.</p>
          </div>

        </div>
      </div>

      {!aiOn && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 space-y-2">
          <h3 className="font-semibold text-purple-900 flex items-center gap-2">
            <Mic size={16} /> How Co-Pilot mode works
          </h3>
          <ul className="text-sm text-purple-800 space-y-1.5 list-disc list-inside">
            <li>Customer calls your Office Angel number</li>
            <li>Your dispatcher's phone rings — answer like a normal call</li>
            <li>AI joins the conference silently — <strong>the caller cannot hear it</strong></li>
            <li>Real-time transcription appears on the <strong>Co-Pilot page</strong></li>
            <li>When the call ends, a full summary + job ticket saves automatically</li>
          </ul>
        </div>
      )}

      {/* QuickBooks Integration */}
      <div id="quickbooks" className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-12">
        <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
               QuickBooks Online
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Sync material receipts directly to your chart of accounts.
            </p>
          </div>
          {settings.quickbooks_realm_id ? (
            <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1">
              <CheckCircle2 size={12} /> Connected
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-500 border border-gray-200 px-3 py-1 text-xs font-bold rounded-full">
              Not Connected
            </span>
          )}
        </div>
        <div className="p-6">
          {settings.quickbooks_realm_id ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Active Connection</p>
                <p className="text-xs text-gray-500 mt-1">Company ID: {settings.quickbooks_realm_id}</p>
              </div>
              <button 
                onClick={disconnectQuickBooks} disabled={saving}
                className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors border border-red-100"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-full border border-gray-100">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#2CA01C"/>
                  <path d="M12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5Z" fill="white"/>
                 </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Connect to QuickBooks Online</p>
                <p className="text-xs text-gray-500 mt-1 max-w-sm">
                  Authorize Office Angel to read your Chart of Accounts and automatically push material receipts as Bills.
                </p>
              </div>
              <a 
                href="/api/quickbooks/auth"
                className="text-sm font-bold text-white bg-[#2CA01C] hover:bg-[#268a18] px-6 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                Connect to QuickBooks
              </a>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
