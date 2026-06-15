"use client";
import { useState, useEffect } from "react";
import { Clock, MapPin, Truck, CheckCircle2, Navigation, Briefcase, Calendar, Edit2, X, Check } from "lucide-react";

export default function FieldAppMockup() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'timecard'>('timecard');
  const [timeView, setTimeView] = useState<'today' | 'week'>('today');
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [autoPunchStatus, setAutoPunchStatus] = useState("Waiting for geofence...");
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [activeTimesheetId, setActiveTimesheetId] = useState<string | null>(null);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editIn, setEditIn] = useState("");
  const [editOut, setEditOut] = useState("");

  // Manual Entry State
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualDate, setManualDate] = useState("");
  const [manualIn, setManualIn] = useState("");
  const [manualOut, setManualOut] = useState("");
  const [manualNotes, setManualNotes] = useState("");

  const [techId, setTechId] = useState<string>("8dcd18c7-e3d7-4422-9f4b-6bb4e6df2f10");
  const [techs, setTechs] = useState<{id: string, name: string}[]>([]);
  const [showTechPicker, setShowTechPicker] = useState(false);
  const [selectedTechName, setSelectedTechName] = useState<string>("Steve");

  useEffect(() => {
    // Load technician list and restore saved selection
    const saved = localStorage.getItem("fieldTechId");
    const savedName = localStorage.getItem("fieldTechName");
    if (saved) { setTechId(saved); setSelectedTechName(savedName || ""); }
    fetch("/api/technicians")
      .then(r => r.json())
      .then(json => setTechs(json.technicians || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const fetchTimesheets = async () => {
    try {
      const res = await fetch('/api/timesheets');
      const data = await res.json();
      if (data.timesheets) {
        const sorted = data.timesheets.sort((a: any, b: any) => new Date(a.clock_in).getTime() - new Date(b.clock_in).getTime());
        setTimeEntries(sorted);
        
        // Check if currently clocked in
        const active = sorted.find((t: any) => !t.clock_out);
        if (active) {
           setIsClockedIn(true);
           setActiveTimesheetId(active.id);
           setAutoPunchStatus("Geofence active. 30ft radius monitored.");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClockInOut = async () => {
     if (!isClockedIn) {
        setIsClockedIn(true);
        setAutoPunchStatus("Geofence active. 30ft radius monitored.");
        
        try {
           const res = await fetch('/api/timesheets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'clock_in', technician_id: techId })
           });
           const data = await res.json();
           if (data.timesheet) {
              setActiveTimesheetId(data.timesheet.id);
              fetchTimesheets();
           }
        } catch (err) {
           console.error(err);
        }
     } else {
        setIsClockedIn(false);
        setAutoPunchStatus("Waiting for next job...");
        
        try {
           if (activeTimesheetId) {
              await fetch('/api/timesheets', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ action: 'clock_out', id: activeTimesheetId })
              });
              setActiveTimesheetId(null);
              fetchTimesheets();
           }
        } catch (err) {
           console.error(err);
        }
     }
  };

  const formatTime = (dStr: string | null) => {
      if (!dStr) return '--:--';
      return new Date(dStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };
  
  const formatDate = (dStr: string) => {
      return new Date(dStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleEditClick = (entry: any) => {
      setEditingId(entry.id);
      
      const inDate = new Date(entry.clock_in);
      setEditIn(`${inDate.getHours().toString().padStart(2, '0')}:${inDate.getMinutes().toString().padStart(2, '0')}`);
      
      if (entry.clock_out) {
         const outDate = new Date(entry.clock_out);
         setEditOut(`${outDate.getHours().toString().padStart(2, '0')}:${outDate.getMinutes().toString().padStart(2, '0')}`);
      } else {
         setEditOut("");
      }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!manualDate || !manualIn || !manualOut) return;

      const [inY, inMo, inD] = manualDate.split('-');
      const [inH, inM] = manualIn.split(':');
      const clockIn = new Date(parseInt(inY), parseInt(inMo) - 1, parseInt(inD), parseInt(inH), parseInt(inM), 0).toISOString();

      const [outH, outM] = manualOut.split(':');
      const clockOut = new Date(parseInt(inY), parseInt(inMo) - 1, parseInt(inD), parseInt(outH), parseInt(outM), 0).toISOString();

      try {
         await fetch('/api/timesheets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
               action: 'manual_entry', 
               technician_id: techId, 
               clock_in: clockIn, 
               clock_out: clockOut,
               notes: `Manual Entry: ${manualNotes}` 
            })
         });
         setShowManualEntry(false);
         setManualDate("");
         setManualIn("");
         setManualOut("");
         setManualNotes("");
         fetchTimesheets();
      } catch (err) {
         console.error(err);
      }
  };

  const saveEdit = async (entry: any) => {
      if (!editIn) return;
      
      const inDate = new Date(entry.clock_in);
      const [inH, inM] = editIn.split(':');
      inDate.setHours(parseInt(inH), parseInt(inM), 0, 0);

      let outDate = null;
      if (editOut) {
         outDate = new Date(entry.clock_out || entry.clock_in);
         const [outH, outM] = editOut.split(':');
         outDate.setHours(parseInt(outH), parseInt(outM), 0, 0);
      }

      try {
         await fetch('/api/timesheets', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
               action: 'edit_time', 
               id: entry.id, 
               clock_in: inDate.toISOString(), 
               clock_out: outDate ? outDate.toISOString() : null 
            })
         });
         setEditingId(null);
         fetchTimesheets();
      } catch (err) {
         console.error(err);
      }
  };

  const todayStr = new Date().toDateString();
  const visibleEntries = timeView === 'today' 
    ? timeEntries.filter(e => new Date(e.clock_in).toDateString() === todayStr)
    : timeEntries;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {showManualEntry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 relative">
             <button onClick={() => setShowManualEntry(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
             <h2 className="text-xl font-bold text-gray-900 mb-4">Log Manual Time</h2>
             <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Date</label>
                  <input type="date" required value={manualDate} onChange={e => setManualDate(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Start Time</label>
                    <input type="time" required value={manualIn} onChange={e => setManualIn(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">End Time</label>
                    <input type="time" required value={manualOut} onChange={e => setManualOut(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Comment / Area</label>
                  <textarea placeholder="e.g., Northside neighborhood canvassing..." required value={manualNotes} onChange={e => setManualNotes(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm min-h-[80px]" />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                   Save Time Card
                </button>
             </form>
          </div>
        </div>
      )}

      <div className="bg-gray-900 text-white p-4 pt-12 flex justify-between items-center shadow-md">
         <div>
           <h1 className="font-bold text-lg">Hard Hat Solutions Field App</h1>
           <button onClick={() => setShowTechPicker(true)} className="text-xs text-blue-400 hover:text-blue-300 mt-0.5 flex items-center gap-1">
             👷 {selectedTechName || "Select Tech"} ›
           </button>
         </div>
         <div className="flex gap-2">
           <Truck size={20} className="text-gray-400" />
         </div>
      </div>

      {/* Tech Picker Modal */}
      {showTechPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Who are you?</h3>
            <div className="space-y-2">
              {techs.length === 0 && <p className="text-gray-500 text-sm">Loading technicians...</p>}
              {techs.map(t => (
                <button key={t.id} onClick={() => {
                  setTechId(t.id);
                  setSelectedTechName(t.name);
                  localStorage.setItem("fieldTechId", t.id);
                  localStorage.setItem("fieldTechName", t.name);
                  setShowTechPicker(false);
                }} className={`w-full text-left px-4 py-3 rounded-xl border font-medium transition-colors ${techId === t.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:bg-gray-50"}`}>
                  👷 {t.name}
                </button>
              ))}
            </div>
            <button onClick={() => setShowTechPicker(false)} className="mt-4 w-full py-3 text-gray-500 text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex-1 p-4 space-y-4">
         
         {activeTab === 'jobs' && (
            <div className="space-y-4">
               {/* Today's Schedule */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                     <h2 className="font-bold text-gray-800">Current Job</h2>
                     <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded">1:00 PM</span>
                  </div>
                  <div className="p-4 space-y-3">
                     <div>
                     <h3 className="font-bold text-gray-900 text-lg">Standard Deep Clean</h3>
                     <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                        <MapPin size={14} /> 123 Main Street, Edina MN
                     </p>
                     </div>
                     <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                     "Customer requested extra attention on the master bathroom grout."
                     </p>
                     <button className="w-full mt-2 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                        <Navigation size={18} /> Get Directions
                     </button>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'timecard' && (
            <div className="space-y-4">
               {/* Geofence / Timesheet Card */}
               <div className={`rounded-xl shadow-sm border overflow-hidden transition-colors ${isClockedIn ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                  <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                     
                     <button 
                       onClick={handleClockInOut}
                       className={`w-56 h-56 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-transform active:scale-95 ${isClockedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                     >
                       <Clock size={56} className="mb-2 opacity-80" />
                       <span className="text-3xl font-bold uppercase tracking-wide">
                         {isClockedIn ? "Clock Out" : "Clock In"}
                       </span>
                     </button>

                     {isClockedIn ? (
                       <div className="flex items-center gap-2 text-green-800 text-sm font-medium bg-green-100 px-4 py-2 rounded-full mt-6 shadow-sm border border-green-200">
                         <CheckCircle2 size={16} /> {autoPunchStatus}
                       </div>
                     ) : (
                       <div className="text-gray-500 text-sm mt-6 font-medium">
                         Tap the massive button to start payroll timer.
                       </div>
                     )}
                  </div>
               </div>

               {/* Time Log */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-4">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                     <h2 className="font-bold text-gray-800">Your Punches</h2>
                     <div className="flex items-center gap-3">
                        <button onClick={() => setShowManualEntry(true)} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                           + Manual Entry
                        </button>
                        <div className="flex bg-gray-200 p-1 rounded-lg">
                           <button onClick={() => setTimeView('today')} className={`text-xs px-3 py-1 font-bold rounded-md ${timeView === 'today' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>Today</button>
                           <button onClick={() => setTimeView('week')} className={`text-xs px-3 py-1 font-bold rounded-md ${timeView === 'week' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}>This Week</button>
                        </div>
                     </div>
                  </div>
                  {visibleEntries.length === 0 ? (
                     <div className="p-6 text-center text-gray-500 text-sm">No punches logged.</div>
                  ) : (
                     <ul className="divide-y divide-gray-100">
                        {visibleEntries.map((entry, idx) => (
                           <li key={entry.id || idx} className="p-4 flex flex-col gap-2">
                              {timeView === 'week' && (
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                  {formatDate(entry.clock_in)}
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center">
                                {editingId === entry.id ? (
                                   <div className="flex-1 flex items-center gap-2">
                                     <input type="time" value={editIn} onChange={e => setEditIn(e.target.value)} className="border rounded p-1 text-sm bg-gray-50 flex-1" />
                                     <span className="text-gray-400">-</span>
                                     <input type="time" value={editOut} onChange={e => setEditOut(e.target.value)} className="border rounded p-1 text-sm bg-gray-50 flex-1" />
                                   </div>
                                ) : (
                                   <div className="flex items-center flex-1 gap-2">
                                      <div className="flex items-center gap-2">
                                         <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                         <span className="font-medium text-gray-800 text-sm">{formatTime(entry.clock_in)}</span>
                                      </div>
                                      <div className="text-gray-300">-</div>
                                      <div className="flex items-center gap-2">
                                         <span className={`font-medium text-sm ${entry.clock_out ? 'text-gray-800' : 'text-gray-400 italic'}`}>{entry.clock_out ? formatTime(entry.clock_out) : 'Working...'}</span>
                                         <div className={`w-2 h-2 rounded-full ${entry.clock_out ? 'bg-red-500' : 'bg-gray-300 animate-pulse'}`}></div>
                                      </div>
                                   </div>
                                )}
                                
                                <div className="ml-4">
                                   {editingId === entry.id ? (
                                      <div className="flex gap-2">
                                        <button onClick={() => saveEdit(entry)} className="p-1.5 bg-green-100 text-green-700 rounded-md"><Check size={16} /></button>
                                        <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-100 text-gray-500 rounded-md"><X size={16} /></button>
                                      </div>
                                   ) : (
                                      <button onClick={() => handleEditClick(entry)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit2 size={16} /></button>
                                   )}
                                </div>
                              </div>

                              {entry.notes?.includes('Edited Manually') && (
                                 <div className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded w-max mt-1 border border-orange-200">
                                   ⚠ Manually Edited
                                 </div>
                              )}
                           </li>
                        ))}
                     </ul>
                  )}
               </div>
            </div>
         )}

      </div>

      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
         <button 
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 ${activeTab === 'jobs' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
         >
            <Briefcase size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Jobs</span>
         </button>
         <button 
            onClick={() => setActiveTab('timecard')}
            className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 ${activeTab === 'timecard' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
         >
            <Clock size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Time Card</span>
         </button>
      </div>

    </div>
  );
}
