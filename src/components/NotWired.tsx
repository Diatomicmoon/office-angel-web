"use client";

import Link from "next/link";

export function NotWired({
  title = "Not wired to live data yet",
  subtitle = "This screen is still demo UI. We can connect it to Supabase next.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6 h-[calc(100vh-2rem)] overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-2">{subtitle}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <p className="text-sm text-gray-700">
          Right now, only <span className="font-semibold">Dashboard</span> is pulling real data.
          If you want, we’ll wire this screen next (queries + empty states + actions).
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/dashboard" className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold text-sm">
            Back to Dashboard
          </Link>
          <Link href="/dispatch" className="bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm border border-gray-200">
            Dispatch
          </Link>
        </div>
      </div>
    </div>
  );
}
