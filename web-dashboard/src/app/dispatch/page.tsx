import Link from "next/link";

import { AppHeader } from "@/components/AppHeader";
import { Job, jobs } from "@/lib/demoData";

function StatusColumn({ title, items }: { title: string; items: Job[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-white/60">{items.length}</div>
      </div>

      <div className="mt-3 space-y-2">
        {items.map((j) => (
          <Link
            key={j.id}
            href={`/jobs/${j.id}`}
            className="block rounded-xl border border-white/10 bg-black/20 p-3 hover:bg-black/30 transition"
          >
            <div className="text-sm font-semibold">{j.title}</div>
            <div className="mt-1 text-xs text-white/60">
              {j.customer} • {j.address}
              {j.scheduledFor ? ` • ${j.scheduledFor}` : ""}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function DispatchPage() {
  const byStatus = {
    New: jobs.filter((j) => j.status === "New"),
    Scheduled: jobs.filter((j) => j.status === "Scheduled"),
    "In Progress": jobs.filter((j) => j.status === "In Progress"),
    Completed: jobs.filter((j) => j.status === "Completed"),
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dispatch Board</h1>
            <p className="mt-1 text-sm text-white/70">
              Pipeline view for sales demos: lead → schedule → job execution.
            </p>
          </div>
          <Link
            href="/inbox"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
          >
            Back to Inbox
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatusColumn title="New" items={byStatus.New} />
          <StatusColumn title="Scheduled" items={byStatus.Scheduled} />
          <StatusColumn title="In Progress" items={byStatus["In Progress"]} />
          <StatusColumn title="Completed" items={byStatus.Completed} />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/20 to-white/5 p-5">
          <div className="text-sm font-semibold">Sales-demo script (30 seconds)</div>
          <ol className="mt-2 list-decimal pl-5 text-sm text-white/75 space-y-1">
            <li>Start in Inbox: show inbound text.</li>
            <li>Click “Ask triage questions” (shows what the AI asks).</li>
            <li>Jump to Dispatch Board and open a job.</li>
            <li>Hit an “AI Tool” button to show instant output.</li>
          </ol>
        </div>
      </main>
    </div>
  );
}

