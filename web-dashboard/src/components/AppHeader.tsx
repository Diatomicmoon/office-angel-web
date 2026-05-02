import Link from "next/link";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-zinc-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-emerald-950 font-black">
            TV
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">TradeVolt HQ</div>
            <div className="text-xs text-white/60">Demo Mode</div>
          </div>
        </div>

        <nav className="flex items-center gap-2 text-sm">
          <Link href="/inbox" className="rounded-lg px-3 py-2 hover:bg-white/10 transition">
            Inbox
          </Link>
          <Link href="/dispatch" className="rounded-lg px-3 py-2 hover:bg-white/10 transition">
            Dispatch
          </Link>
          <Link
            href="/jobs/j-1002"
            className="rounded-lg px-3 py-2 hover:bg-white/10 transition"
          >
            Job
          </Link>
        </nav>
      </div>
    </header>
  );
}

