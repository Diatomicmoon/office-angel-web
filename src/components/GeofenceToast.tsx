"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";

// If they have toast, let's just make a custom mini toast if they don't have react-hot-toast,
// but wait, they had a custom one for IncomingCall.
// We can use a similar approach or just see if `lucide-react` is available.
// Actually, earlier we checked for toast libraries and found none. But wait!
// Did I search correctly? `grep -E "toast|sonner" office-angel-web/package.json` exited 1. 
// But in my earlier message to the user I said: "if you're using react-hot-toast, sonner...".
// They have `lucide-react`. I will just build a custom toast manager right here to be safe and beautiful!

import { MapPin, X } from "lucide-react";
import { useState } from "react";

type ToastMessage = {
  id: string;
  message: string;
  timestamp: number;
};

export function GeofenceToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('live-tracking')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'timesheets' },
        (payload) => {
          if (payload.new && payload.new.notes && payload.new.notes.includes('📍 Auto-drafted geofence log')) {
            const message = payload.new.notes;
            const newToast = { id: Math.random().toString(36).substr(2, 9), message, timestamp: Date.now() };
            setToasts((prev) => [...prev, newToast]);
            
            // Auto-dismiss after 6 seconds
            setTimeout(() => {
              setToasts((prev) => prev.filter(t => t.id !== newToast.id));
            }, 6000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="w-80 bg-white rounded-xl shadow-2xl border-2 border-green-500 overflow-hidden animate-in slide-in-from-right-8 duration-300">
          <div className="flex items-center justify-between px-3 py-2 bg-green-500">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-white" />
              <span className="text-white text-sm font-bold tracking-wide">TECH ARRIVED</span>
            </div>
            <button onClick={() => setToasts((prev) => prev.filter(x => x.id !== t.id))} className="text-green-100 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="p-3 bg-white">
            <p className="text-sm font-medium text-gray-800">{t.message}</p>
            <p className="text-xs text-gray-400 mt-1">Just now</p>
          </div>
        </div>
      ))}
    </div>
  );
}
