"use client";

import { useState } from "react";

import { canned } from "@/lib/cannedAi";

type ToolKey = "reply" | "materials" | "estimate";

const labels: Record<ToolKey, string> = {
  reply: "AI Draft Reply",
  materials: "Generate Material List",
  estimate: "Estimate Notes",
};

const outputs: Record<ToolKey, string> = {
  reply: canned.draftReply,
  materials: canned.materialList,
  estimate: canned.estimateNotes,
};

export function JobAiTools() {
  const [active, setActive] = useState<ToolKey | null>(null);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">AI Tools (Demo)</div>
          <div className="text-xs text-white/60">Canned outputs — no backend required.</div>
        </div>
        <div className="text-xs text-white/50">Demo Mode</div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(labels).map(([k, label]) => {
          const key = k as ToolKey;
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => setActive(isActive ? null : key)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition border ${
                isActive
                  ? "bg-emerald-500 text-emerald-950 border-emerald-400"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {active && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-xs font-semibold text-white/70">Output</div>
          <pre className="mt-2 whitespace-pre-wrap text-sm text-white/85 leading-6">
            {outputs[active]}
          </pre>
        </div>
      )}
    </section>
  );
}

