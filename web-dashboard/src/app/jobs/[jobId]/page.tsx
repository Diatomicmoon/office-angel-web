import Link from "next/link";
import { notFound } from "next/navigation";

import { AppHeader } from "@/components/AppHeader";
import { JobAiTools } from "@/components/JobAiTools";
import { getJob } from "@/lib/demoData";

export default async function JobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = getJob(jobId);
  if (!job) return notFound();

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs text-white/60">Job</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{job.title}</h1>
            <div className="mt-2 text-sm text-white/70">
              <span className="font-semibold text-white/85">{job.customer}</span> • {job.phone} •
              {" "}{job.address}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
              Status: <span className="text-white/90 font-semibold">{job.status}</span>
            </div>
            {job.scheduledFor ? (
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
                Scheduled: <span className="text-white/90 font-semibold">{job.scheduledFor}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold">Notes</div>
            <ul className="mt-3 list-disc pl-5 text-sm text-white/75 space-y-1">
              {job.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10 transition">
                Add Photo (demo)
              </button>
              <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10 transition">
                Add Note (demo)
              </button>
              <Link
                href="/dispatch"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10 transition"
              >
                Back to Dispatch
              </Link>
            </div>
          </section>

          <JobAiTools />
        </div>
      </main>
    </div>
  );
}

