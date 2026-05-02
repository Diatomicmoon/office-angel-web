import Link from "next/link";

import { AppHeader } from "@/components/AppHeader";
import { canned } from "@/lib/cannedAi";
import { leads } from "@/lib/demoData";

function LeadCard({
  from,
  message,
  address,
  receivedAt,
}: {
  from: string;
  message: string;
  address: string;
  receivedAt: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">{from}</div>
          <div className="text-xs text-white/60">{address} • {receivedAt}</div>
        </div>
        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
          New lead
        </div>
      </div>

      <div className="mt-3 text-sm text-white/80 leading-6">“{message}”</div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 transition">
          Ask Triage Questions
        </button>
        <Link
          href="/dispatch"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10 transition"
        >
          Create Job
        </Link>
        <Link
          href="/jobs/j-1001"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10 transition"
        >
          Open Sample Job
        </Link>
      </div>
    </div>
  );
}

export default function InboxPage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
            <p className="mt-1 text-sm text-white/70">New leads & inbound texts (demo data).</p>
          </div>
          <Link
            href="/dispatch"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
          >
            Go to Dispatch Board →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {leads.map((l) => (
            <LeadCard
              key={l.id}
              from={l.from}
              message={l.message}
              address={l.address}
              receivedAt={l.receivedAt}
            />
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="text-sm font-semibold">Demo Triage Questions (what the AI would ask)</div>
          <ul className="mt-3 list-disc pl-5 text-sm text-white/75 space-y-1">
            {canned.triageQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

