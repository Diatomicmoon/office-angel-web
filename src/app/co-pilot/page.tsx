"use client";

import { useState, useEffect } from "react";
import { Mic, PhoneCall, User, MapPin, Zap, CheckCircle2, AlertCircle, Save, X, Activity } from "lucide-react";
import { NotWired } from "@/components/NotWired";

export default function CoPilot() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  if (!isDemoMode) {
    return (
      <NotWired
        title="Co-Pilot"
        subtitle="Co-Pilot is still demo UI right now. Next step is wiring Twilio/Vapi live transcription into Supabase + auto-fill job ticket."
      />
    );
  }

  const [isListening, setIsListening] = useState(true);
  const [transcript, setTranscript] = useState([
    { speaker: "Dispatcher (Sarah)", text: "Thanks for calling Hardhat Electric, this is Sarah." }
  ]);
  const [extractedData, setExtractedData] = useState({
    name: "Typing...",
    phone: "+1 (612) 555-8992",
    address: "Waiting for address...",
    issue: "Listening...",
    urgency: "Normal"
  });

  // Fake the live transcription typing effect for the demo
  useEffect(() => {
    if (!isListening) return;

    const sequence = [
      { delay: 2000, speaker: "Caller", text: "Hey Sarah, I've got a major issue. My main breaker keeps tripping and I smell something burning near the panel." },
      { delay: 2500, data: { issue: "Panel arcing / burning smell", urgency: "High - Fire Risk" } },
      { delay: 4000, speaker: "Dispatcher (Sarah)", text: "Oh wow, okay. Please don't touch the panel. I'm going to get someone out there right away. What's the address?" },
      { delay: 6000, speaker: "Caller", text: "It's 8824 Lake Street, over in Wayzata." },
      { delay: 6500, data: { name: "Unknown Caller", address: "8824 Lake St, Wayzata, MN" } },
      { delay: 8000, speaker: "Dispatcher (Sarah)", text: "Got it, 8824 Lake Street. I have Mike in Truck 1 about 15 minutes away from you. I'm dispatching him now." },
      { delay: 10000, speaker: "Caller", text: "Thank you so much." },
      { delay: 11000, action: () => setIsListening(false) }
    ];

    const timeouts: NodeJS.Timeout[] = [];
    
    sequence.forEach(({ delay, speaker, text, data, action }) => {
      const timeout = setTimeout(() => {
        if (speaker && text) {
          setTranscript(prev => [...prev, { speaker, text }]);
        }
        if (data) {
          setExtractedData(prev => ({ ...prev, ...data }));
        }
        if (action) {
          action();
        }
      }, delay);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [isListening]);

  return (
    <div className="max-w-7xl mx-auto p-8 h-[calc(100vh-2rem)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            Dispatcher Co-Pilot
            {isListening ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full animate-pulse border border-red-200">
                <Mic size={14} className="animate-bounce" /> LIVE LISTENING
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                <PhoneCall size={14} /> CALL ENDED
              </span>
            )}
          </h1>
          <p className="text-gray-500 mt-2">AI is silently transcribing and filling out the job ticket for you.</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-mono">
            <Activity size={16} className={isListening ? "text-green-400" : "text-gray-500"} />
            00:0{transcript.length * 4}
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex gap-8 overflow-hidden">
        
        {/* Left: Live Transcript Box */}
        <div className="w-1/2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center rounded-t-xl">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Mic size={18} className="text-blue-600" />
              Live Transcript
            </h2>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50/50">
            {transcript.map((line, idx) => (
              <div key={idx} className={`flex gap-4 ${line.speaker === 'Caller' ? '' : 'flex-row-reverse'}`}>
                <div className="flex-shrink-0 mt-1">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    line.speaker === 'Caller' ? 'bg-gray-200' : 'bg-blue-600'
                  }`}>
                    {line.speaker === 'Caller' ? <User size={16} className="text-gray-600"/> : <PhoneCall size={16} className="text-white"/>}
                  </div>
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                  line.speaker === 'Caller' 
                    ? 'bg-white border border-gray-200 rounded-tl-none' 
                    : 'bg-blue-600 text-white rounded-tr-none'
                }`}>
                  <p className="text-xs opacity-70 mb-1 font-medium">{line.speaker}</p>
                  <p className="text-sm leading-relaxed">{line.text}</p>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isListening && (
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={16} className="text-gray-600"/>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Auto-Filling Ticket */}
        <div className="w-1/2 flex flex-col gap-6">
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden relative">
            
            {/* Scanning Overlay (Looks cool for demo) */}
            {isListening && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500/20 z-10 animate-[scan_2s_ease-in-out_infinite]"></div>
            )}

            <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Zap size={18} className="text-yellow-500" />
                Auto-Filling Job Ticket
              </h2>
            </div>
            
            <div className="p-8 space-y-8 flex-1 overflow-y-auto">
              
              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Customer Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Caller ID / Phone</label>
                    <div className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg text-sm text-gray-900 font-medium">
                      {extractedData.phone}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Extracted Name</label>
                    <div className={`border px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      extractedData.name === 'Typing...' ? 'bg-blue-50 border-blue-200 text-blue-700 animate-pulse' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}>
                      {extractedData.name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Location</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Service Address</label>
                  <div className={`border px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    extractedData.address.includes('Waiting') ? 'bg-blue-50 border-blue-200 text-blue-700 animate-pulse' : 'bg-green-50 border-green-200 text-green-800'
                  }`}>
                    <MapPin size={16} className={extractedData.address.includes('Waiting') ? 'opacity-50' : ''} />
                    {extractedData.address}
                  </div>
                </div>
              </div>

              {/* Issue & Tags */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Job Scope</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Reported Issue</label>
                    <div className={`border px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[80px] ${
                      extractedData.issue === 'Listening...' ? 'bg-blue-50 border-blue-200 text-blue-700 animate-pulse' : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}>
                      {extractedData.issue}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">AI Urgency Analysis</label>
                    {extractedData.urgency === 'Normal' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                        Analyzing...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-red-700 bg-red-100 border border-red-200 px-4 py-2 rounded-lg shadow-sm">
                        <AlertCircle size={18} /> {extractedData.urgency}
                      </span>
                    )}
                  </div>
                </div>
              </div>

            </div>
            
            {/* Action Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
              <button className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm">
                Cancel
              </button>
              <button 
                disabled={isListening}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg shadow-sm flex items-center gap-2 transition-colors ${
                  isListening 
                    ? 'bg-blue-300 text-white cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Save size={16} />
                {isListening ? 'Waiting for call to end...' : 'Save & Dispatch'}
              </button>
            </div>
            
          </div>
        </div>

      </div>
      
      {/* Global Style for the cool scanning laser effect */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}
