"use client";

import { Clock, Plus, Filter, Download, ArrowRight, User, Calendar, CheckSquare, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

type Timesheet = {
  id: string;
  technician_id: string;
  technicians?: { name: string };
  clock_in: string;
  clock_out: string | null;
  status: 'pending' | 'approved' | 'synced';
};

export default function TimesheetsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'synced'>('pending');
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const fetchTimesheets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/timesheets');
      const data = await res.json();
      if (data._setup_required) {
        setSetupRequired(true);
      } else {
        setTimesheets(data.timesheets || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/timesheets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'approved' })
      });
      if (res.ok) {
        setTimesheets(ts => ts.map(t => t.id === id ? { ...t, status: 'approved' } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveAll = async () => {
    const pendingIds = timesheets.filter(t => t.status === 'pending' && t.clock_out).map(t => t.id);
    if (pendingIds.length === 0) return;
    try {
      const res = await fetch('/api/timesheets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: pendingIds, status: 'approved' })
      });
      if (res.ok) {
        setTimesheets(ts => ts.map(t => pendingIds.includes(t.id) ? { ...t, status: 'approved' } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calculateHours = (inStr: string, outStr: string | null) => {
    if (!outStr) return { total: 0, text: 'Working...' };
    const d1 = new Date(inStr);
    const d2 = new Date(outStr);
    const diff = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60);
    return { total: diff, text: `${diff.toFixed(2)} hrs` };
  };

  const pendingCount = timesheets.filter(t => t.status === 'pending').length;
  
  let totalWeekHours = 0;
  timesheets.forEach(t => {
    if (t.clock_out) {
       totalWeekHours += calculateHours(t.clock_in, t.clock_out).total;
    }
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      
      {setupRequired && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <h3 className="font-bold">Database Table Missing</h3>
            <p className="text-sm">You need to run the SQL migration to create the <code>timesheets</code> table.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Timesheets & Payroll</h1>
          <p className="text-muted-foreground">Review geofenced hours and sync to QuickBooks.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchTimesheets} className="bg-white border text-gray-700 px-3 py-2 rounded-md font-medium flex items-center gap-2 text-sm shadow-sm hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="bg-white border text-gray-700 px-4 py-2 rounded-md font-medium flex items-center gap-2 text-sm shadow-sm hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md font-medium flex items-center gap-2 text-sm shadow-sm disabled:opacity-50">
             Sync to QuickBooks <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <div className="text-sm text-muted-foreground font-medium mb-1">Total Hours (This Week)</div>
          <div className="text-2xl font-bold">{totalWeekHours.toFixed(1)}</div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm bg-orange-50/50">
          <div className="text-sm text-orange-600 font-medium mb-1">Overtime Hours</div>
          <div className="text-2xl font-bold text-orange-700">{Math.max(0, totalWeekHours - 40).toFixed(1)}</div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <div className="text-sm text-muted-foreground font-medium mb-1">Pending Approval</div>
          <div className="text-2xl font-bold">{pendingCount}</div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm bg-green-50/50">
          <div className="text-sm text-green-700 font-medium mb-1">Est. Payroll Liability</div>
          <div className="text-2xl font-bold text-green-800">${(totalWeekHours * 35).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col">
         
         <div className="border-b border-gray-100 flex p-2 gap-2 bg-gray-50/50">
            <button 
               onClick={() => setActiveTab('pending')}
               className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'pending' ? 'bg-white shadow-sm border border-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
            >
               Pending Review ({pendingCount})
            </button>
            <button 
               onClick={() => setActiveTab('approved')}
               className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'approved' ? 'bg-white shadow-sm border border-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
            >
               Approved
            </button>
            <button 
               onClick={() => setActiveTab('synced')}
               className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'synced' ? 'bg-white shadow-sm border border-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
            >
               Synced to QBO
            </button>
         </div>

         <div className="p-4 flex justify-between items-center bg-white border-b border-gray-100">
            <div className="flex gap-2">
               <button className="text-sm border px-3 py-1.5 rounded-md text-gray-600 font-medium flex items-center gap-2 hover:bg-gray-50">
                  <Filter className="w-4 h-4" /> Filter Date
               </button>
               <button className="text-sm border px-3 py-1.5 rounded-md text-gray-600 font-medium flex items-center gap-2 hover:bg-gray-50">
                  <User className="w-4 h-4" /> All Techs
               </button>
            </div>
            {activeTab === 'pending' && (
               <button onClick={handleApproveAll} className="text-sm bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-md font-medium hover:bg-blue-100">
                  Approve All Pending
               </button>
            )}
         </div>

         <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
               <tr>
                  <th className="p-4 font-medium">Technician</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Clock In</th>
                  <th className="p-4 font-medium">Clock Out</th>
                  <th className="p-4 font-medium">Total Hours</th>
                  <th className="p-4 font-medium">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {loading ? (
                 <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">Loading timesheets...</td>
                 </tr>
               ) : timesheets.filter(t => t.status === activeTab).map(sheet => {
                 const name = sheet.technicians?.name || "Unknown Tech";
                 const hours = calculateHours(sheet.clock_in, sheet.clock_out);
                 return (
                  <tr key={sheet.id} className="hover:bg-gray-50/50">
                     <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                           {name.charAt(0)}
                        </div>
                        {name}
                     </td>
                     <td className="p-4">{new Date(sheet.clock_in).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                     <td className="p-4 text-gray-500">{new Date(sheet.clock_in).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit'})}</td>
                     <td className="p-4 text-gray-500">{sheet.clock_out ? new Date(sheet.clock_out).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit'}) : '--:--'}</td>
                     <td className="p-4">
                        <span className={`font-bold ${hours.total > 8 ? 'text-orange-600' : 'text-gray-900'}`}>{hours.text}</span>
                     </td>
                     <td className="p-4">
                        {sheet.status === 'pending' ? (
                           <div className="flex gap-2">
                              {sheet.clock_out ? (
                                <button onClick={() => handleApprove(sheet.id)} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-bold hover:bg-green-100 transition-colors">Approve</button>
                              ) : (
                                <span className="px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded text-xs font-bold">Active</span>
                              )}
                           </div>
                        ) : sheet.status === 'approved' ? (
                           <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded text-xs font-bold uppercase tracking-wide">Approved</span>
                        ) : (
                           <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase tracking-wide">Synced</span>
                        )}
                     </td>
                  </tr>
                 );
               })}
               {!loading && timesheets.filter(t => t.status === activeTab).length === 0 && (
                  <tr>
                     <td colSpan={6} className="p-8 text-center text-gray-500">No timesheets found for this view.</td>
                  </tr>
               )}
            </tbody>
         </table>

      </div>
    </div>
  );
}
