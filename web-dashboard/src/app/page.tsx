import Link from "next/link";

import { AppHeader } from "@/components/AppHeader";

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-lg font-semibold">{title}</div>
        <div className="text-white/40 group-hover:text-white/60 transition">→</div>
      </div>
      <div className="mt-2 text-sm text-white/70">{desc}</div>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/80">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Demo Mode
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            TradeVolt HQ — Dispatcher & Operations Demo
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            This is a clickable sales demo (mock data, no backend). Use it to show the flow: lead →
            triage → schedule → job board → job detail.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/inbox"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 transition"
            >
              Start Demo
            </Link>
            <Link
              href="/dispatch"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
            >
              Jump to Dispatch Board
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <QuickLink
            href="/inbox"
            title="Inbox"
            desc="New leads + 1-click triage questions (sales-demo friendly)."
          />
          <QuickLink
            href="/dispatch"
            title="Dispatch Board"
            desc="Pipeline board: New → Scheduled → In Progress → Completed."
          />
          <QuickLink
            href="/jobs/j-1002"
            title="Job Detail"
            desc="Show the ‘AI buttons’ (draft reply, material list, estimate notes)."
          />
        </div>
      </main>
    </div>
  );
}
