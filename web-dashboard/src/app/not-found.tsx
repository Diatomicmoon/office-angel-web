import Link from "next/link";

import { AppHeader } from "@/components/AppHeader";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="text-sm text-white/60">404</div>
          <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
          <p className="mt-2 text-sm text-white/70">
            This is a demo app — try the Inbox or Dispatch Board.
          </p>
          <div className="mt-6 flex gap-2">
            <Link
              href="/inbox"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 transition"
            >
              Go to Inbox
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
            >
              Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

