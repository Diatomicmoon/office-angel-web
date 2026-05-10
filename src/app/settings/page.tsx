"use client";

import { useState, useEffect } from "react";
import { Phone, Bot, PhoneForwarded, Save, CheckCircle2, AlertTriangle, Mic, Clock } from "lucide-react";

type Settings = {
  id: string;
  name: string;
  phone_number: string;
  ai_enabled: boolean;
  forward_to_phone: string | null;
  schedule_start_minute?: number | null;
  schedule_end_minute?: number | null;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [forwardPhone, setForwardPhone] = useState("");
  const [schedStart, setSchedStart] = useState("08:00");
  const [schedEnd, setSchedEnd] = useState("17:00");

  useEffect(() => {
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

  if (loading) return <div className="flex-1 flex items-center justify-center text-gray-400 p-8">Loading settings...</div>;
  if (!settings) return <div className="flex-1 p-8 text-gray-400">Could not load settings.</div>;

  const aiOn = settings.ai_enabled !== false;

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
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

      {/* Co-Pilot info box */}
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
    </div>
  );
}
