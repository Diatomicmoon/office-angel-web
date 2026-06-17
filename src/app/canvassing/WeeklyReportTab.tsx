import { useState, useMemo } from 'react';
import { Calendar, TrendingUp, Target, User as UserIcon, MapPin, Flame } from 'lucide-react';

interface Visit {
  id: string;
  interest_level?: string;
  notes?: string;
  sales_rep_name?: string;
  visited_at?: string;
  created_at?: string;
  resident_name?: string;
  address?: string;
}

export default function WeeklyReportTab({ visits }: { visits: Visit[] }) {
  const [selectedRep, setSelectedRep] = useState<string | null>(null);

  // Calculate the start of the current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, etc.
  const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const startOfWeek = new Date(now.setDate(diffToMonday));
  startOfWeek.setHours(0, 0, 0, 0);

  const stats = useMemo(() => {
    const weeklyVisits = visits.filter(v => {
      // Must be a manual knock or have a rep note
      const isNewBuild = v.interest_level === 'new_build' || (v.notes && v.notes.includes('Source: County CSV Import'));
      const isUnknockedLead = v.interest_level === 'unknocked_lead';
      const hasRepNote = v.notes?.includes('[Rep:');
      const isManuallyLogged = !isNewBuild && !isUnknockedLead;

      if (!hasRepNote && !['demo_set', 'hot', 'go_back', 'warm', 'not_interested'].includes(v.interest_level || '') && !isManuallyLogged) {
        return false;
      }

      const vDate = new Date(v.visited_at || v.created_at || new Date());
      return vDate >= startOfWeek;
    });

    const dailyCounts = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
    let totalKnocks = 0;
    let totalDemos = 0;

    const repStats: Record<string, { knocks: number, demos: number, list: Visit[] }> = {};

    weeklyVisits.forEach(v => {
      const vDate = new Date(v.visited_at || v.created_at || new Date());
      const dayName = vDate.toLocaleDateString('en-US', { weekday: 'short' });
      if (dailyCounts[dayName as keyof typeof dailyCounts] !== undefined) {
        dailyCounts[dayName as keyof typeof dailyCounts]++;
      }

      totalKnocks++;
      const isDemo = ['demo_set', 'hot', 'contacted'].includes(v.interest_level || '');
      if (isDemo) totalDemos++;

      let rep = v.sales_rep_name || "Unknown Rep";
      const match = v.notes?.match(/\[Rep:\s*(.*?)\]/);
      if (match && match[1]) rep = match[1];
      rep = rep.replace('Efficiency', '').trim();

      if (!repStats[rep]) repStats[rep] = { knocks: 0, demos: 0, list: [] };
      repStats[rep].knocks++;
      if (isDemo) repStats[rep].demos++;
      repStats[rep].list.push(v);
    });

    return { totalKnocks, totalDemos, dailyCounts, repStats };
  }, [visits]);

  return (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Weekly Performance Report
          </h2>
          <p className="text-gray-500 mt-1 text-sm">Stats since Monday ({startOfWeek.toLocaleDateString()})</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-center">
            <div className="text-sm font-semibold text-blue-800">Total Doors</div>
            <div className="text-2xl font-black text-blue-600">{stats.totalKnocks}</div>
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-2 text-center">
            <div className="text-sm font-semibold text-orange-800">Demos Set</div>
            <div className="text-2xl font-black text-orange-600">{stats.totalDemos}</div>
          </div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-gray-400" /> Daily Breakdown
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {Object.entries(stats.dailyCounts).map(([day, count]) => {
            // Calculate a simple height percentage based on max value (fallback to 1 if all 0)
            const maxVal = Math.max(...Object.values(stats.dailyCounts), 1);
            const heightPct = Math.max((count / maxVal) * 100, 5); // min 5% to show bar

            return (
              <div key={day} className="flex flex-col items-center gap-2">
                <div className="h-32 w-full bg-gray-50 rounded-lg flex items-end justify-center p-1 relative group">
                  <div 
                    className="w-full bg-blue-500 rounded-md transition-all duration-500 ease-out group-hover:bg-blue-400"
                    style={{ height: `${heightPct}%` }}
                  ></div>
                  <span className="absolute top-1 text-xs font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {count}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-600">{day}</span>
                <span className="text-xs font-bold text-gray-900">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rep Breakdown */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-gray-400" /> Rep Scorecard
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(stats.repStats)
            .sort((a, b) => b[1].knocks - a[1].knocks)
            .map(([repName, data]) => (
              <div 
                key={repName} 
                onClick={() => setSelectedRep(selectedRep === repName ? null : repName)}
                className={`border rounded-xl p-5 cursor-pointer transition-all ${selectedRep === repName ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300 hover:shadow-sm bg-white'}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-900 text-lg">{repName}</h4>
                  <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                    {data.knocks} Knocks
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-medium text-gray-700">{data.demos} Demos Set</span>
                  <span className="text-gray-400 ml-auto">({((data.demos / Math.max(data.knocks, 1)) * 100).toFixed(0)}% Close Rate)</span>
                </div>
              </div>
            ))}
        </div>
        {Object.keys(stats.repStats).length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No active reps found for this week.
          </div>
        )}
      </div>

      {/* Selected Rep Drilldown */}
      {selectedRep && stats.repStats[selectedRep] && (
        <div className="mt-6 bg-gray-50 border border-gray-100 rounded-xl p-5 animate-in slide-in-from-top-4 duration-300">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" /> 
            {selectedRep}&apos;s Knocks This Week
          </h4>
          <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
            {stats.repStats[selectedRep].list.map(v => {
              const isDemo = ['demo_set', 'hot', 'contacted'].includes(v.interest_level || '');
              return (
                <div key={v.id} className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{v.address || 'Unknown Address'}</div>
                    <div className="text-xs text-gray-500">{new Date(v.visited_at || v.created_at || '').toLocaleString()}</div>
                  </div>
                  {isDemo ? (
                     <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-md">Demo Set</span>
                  ) : (
                     <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-md capitalize">{(v.interest_level || 'Unknown').replace(/_/g, ' ')}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
