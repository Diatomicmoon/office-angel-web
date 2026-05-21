"use client";
import { useState } from "react";
import { Clock, MapPin, Truck, CheckCircle2 } from "lucide-react";

export default function FieldAppMockup() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [autoPunchStatus, setAutoPunchStatus] = useState("Waiting for geofence...");

  const handleClockInOut = () => {
     setIsClockedIn(!isClockedIn);
     if (!isClockedIn) {
        setAutoPunchStatus("Geofence active. 500ft radius monitored.");
     } else {
        setAutoPunchStatus("Waiting for next job...");
     }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gray-900 text-white p-4 pt-12 flex justify-between items-center shadow-md">
         <div>
           <h1 className="font-bold text-lg">Office Angel Field App</h1>
           <p className="text-xs text-gray-400">Crew Alpha</p>
         </div>
         <div className="flex gap-2">
           <Truck size={20} className="text-gray-400" />
         </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
         
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
            </div>
         </div>

         {/* Geofence / Timesheet Card */}
         <div className={`rounded-xl shadow-sm border overflow-hidden transition-colors ${isClockedIn ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
            <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
               
               <button 
                 onClick={handleClockInOut}
                 className={`w-48 h-48 rounded-full flex flex-col items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${isClockedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
               >
                 <Clock size={48} className="mb-2 opacity-80" />
                 <span className="text-2xl font-bold uppercase tracking-wide">
                   {isClockedIn ? "Clock Out" : "Clock In"}
                 </span>
               </button>

               {isClockedIn ? (
                 <div className="flex items-center gap-2 text-green-800 text-sm font-medium bg-green-100 px-4 py-2 rounded-full mt-4">
                   <CheckCircle2 size={16} /> {autoPunchStatus}
                 </div>
               ) : (
                 <div className="text-gray-500 text-sm mt-4">
                   Tap to start payroll timer.
                 </div>
               )}

            </div>
         </div>

      </div>
    </div>
  );
}
