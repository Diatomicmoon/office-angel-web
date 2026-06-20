"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp, PhoneIncoming, Briefcase, DollarSign,
  CheckCircle2, Clock, FileText, ShieldCheck, Zap
} from "lucide-react";
import Link from "next/link";

type WeeklyData = {
  weekLabel: string;
  stats: {
    totalJobs: number;
    completedJobs: number;
    scheduledJobs: number;
    totalCalls: number;
    emergencyCalls: number;
    totalReceipts: number;
    materialSpend: number;
    totalPermits: number;
    approvedPermits: number;
  };
  chart: {
    labels: string[];
    jobs: number[];
    calls: number[];
  };
  recentJobs: { id: string; title?: string; status?: string; customer_name?: string; created_at: string }[];
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

/** Minimal inline bar chart — no external chart lib required */
function BarChart({
  labels,
  datasets,
}: {
  labels: string[];
  datasets: { label: string; data: number[]; color: string }[];
}) {
  const max = Math.max(...datasets.flatMap(d => d.data), 1);
  return (
    <div className="w-full">
      <div className="flex items-end gap-2 h-32">
        {labels.map((label, i) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: "100px" }}>
              {datasets.map(ds => {
                const pct = (ds.data[i] / max) * 100;
                return (
                  <div
                    key={ds.label}
                    title={`${ds.label}: ${ds.data[i]}`}
                    className={`w-full rounded-t-sm transition-all ${ds.color}`}
                    style={{ height: `${pct}%`, minHeight: ds.data[i] > 0 ? "4px" : "0" }}
                  />
                );
              })}
            </div>
            <span className="text-xs text-gray-400 font-medium">{label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3">
        {datasets.map(ds => (
          <div key={ds.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${ds.color}`} />
            <span className="text-xs text-gray-500">{ds.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WeeklyRecapPage() {
  const [data, setData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/weekly-recap")
      .then(r => r.json())
      .then(json => { setData(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const today = new Date();
  const isFriday = today.getDay() === 5;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-3.5rem)]">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          Loading weekly recap...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-3.5rem)]">
        <p className="text-gray-500">Failed to load recap data.</p>
      </div>
    );
  }

  const { stats, chart, recentJobs, weekLabel } = data;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-2rem)] overflow-y-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-yellow-600 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full">
              Weekly Recap
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {isFriday ? "🏁 Week in Review" : "📊 This Week So Far"}
          </h1>
          <p className="text-gray-400 mt-1 text-sm">{weekLabel}</p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Briefcase}
          label="Total Jobs"
          value={stats.totalJobs}
          sub={`${stats.completedJobs} completed`}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Jobs Closed"
          value={stats.completedJobs}
          sub={`${stats.scheduledJobs} still scheduled`}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={PhoneIncoming}
          label="Calls Handled"
          value={stats.totalCalls}
          sub={stats.emergencyCalls > 0 ? `${stats.emergencyCalls} emergency` : "No emergencies 🙌"}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          icon={DollarSign}
          label="Material Spend"
          value={`$${stats.materialSpend.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
          sub={`${stats.totalReceipts} receipt${stats.totalReceipts !== 1 ? "s" : ""} logged`}
          color="bg-orange-50 text-orange-600"
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Scheduled Jobs"
          value={stats.scheduledJobs}
          sub="on the books"
          color="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          icon={FileText}
          label="Receipts Logged"
          value={stats.totalReceipts}
          sub="via Hard Hat Solutions"
          color="bg-teal-50 text-teal-600"
        />
        <StatCard
          icon={ShieldCheck}
          label="Permits Pulled"
          value={stats.totalPermits}
          sub={`${stats.approvedPermits} approved`}
          color="bg-sky-50 text-sky-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Hustle Score"
          value={`${stats.totalJobs + stats.totalCalls}`}
          sub="jobs + calls combined"
          color="bg-pink-50 text-pink-600"
        />
      </div>

      {/* Activity Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Daily Activity</h2>
        <BarChart
          labels={chart.labels}
          datasets={[
            { label: "Jobs", data: chart.jobs, color: "bg-blue-500" },
            { label: "Calls", data: chart.calls, color: "bg-purple-400" },
          ]}
        />
      </div>

      {/* Recent Jobs */}
      {recentJobs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Jobs This Week</h2>
          <div className="divide-y divide-gray-50">
            {recentJobs.map(job => (
              <div key={job.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {job.title || "Untitled Job"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {job.customer_name || "—"} · {new Date(job.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    ["completed", "done", "closed", "Completed"].includes(job.status || "")
                      ? "bg-green-50 text-green-700 border-green-200"
                      : ["scheduled", "Scheduled"].includes(job.status || "")
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {job.status || "Open"}
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/jobs"
            className="mt-4 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all jobs →
          </Link>
        </div>
      )}

      {/* Friday Closer */}
      {isFriday && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 text-white shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🍺</span>
            <div>
              <p className="font-bold text-lg">That's a wrap — nice work this week.</p>
              <p className="text-yellow-100 text-sm mt-0.5">
                {stats.completedJobs} jobs closed · {stats.totalCalls} calls handled · go enjoy your weekend.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
