"use client";

import { useState } from "react";
import { Search, Filter, Phone, AlertTriangle, CheckCircle2, Play, Pause, FastForward, RotateCcw, User, MapPin, Briefcase, Calendar, FileText } from "lucide-react";

const mockCalls = [
  {
    id: 1,
    phone: "+1 (612) 555-0199",
    name: "Unregistered Caller",
    time: "2 mins ago",
    duration: "1m 45s",
    urgency: "High",
    status: "Action Required",
    audioPlaying: false,
    summary: "Customer reported a large tree branch fell on their solar array during last night's storm. Main breaker tripped, half the house is without power. Customer is panicked and needs immediate emergency dispatch.",
    extracted: {
      address: "1442 Grand Ave, St Paul, MN",
      jobType: "Emergency / Solar Damage",
      availability: "Immediately"
    },
    transcript: [
      { speaker: "AI", text: "Thank you for calling Hardhat Electric. I'm the AI scheduling assistant. How can I help you today?" },
      { speaker: "Caller", text: "Yeah, I need someone out here right away! A tree branch just smashed into our solar panels and half the house has no power!" },
      { speaker: "AI", text: "I'm so sorry to hear that. I've flagged this as an emergency. Just to be safe, please do not touch any exposed wires or panels. Can I get the address where the damage occurred?" },
      { speaker: "Caller", text: "It's 1442 Grand Ave in St Paul. Please hurry." },
      { speaker: "AI", text: "Got it, 1442 Grand Ave, St Paul. I am sending an immediate alert to our on-call dispatch team right now. They will contact you within 5 minutes with an ETA." }
    ]
  },
  {
    id: 2,
    phone: "+1 (763) 555-8822",
    name: "John Martinez",
    time: "45 mins ago",
    duration: "3m 12s",
    urgency: "Normal",
    status: "Auto-Scheduled",
    audioPlaying: false,
    summary: "New customer inquiring about a 200 Amp service upgrade for a kitchen remodel. Answered basic qualifying questions. AI successfully matched with Dave's availability and booked a site survey.",
    extracted: {
      address: "8890 Maple Ln, Maple Grove, MN",
      jobType: "200A Panel Upgrade",
      availability: "Thursday, May 2 @ 10:00 AM"
    },
    transcript: [
      { speaker: "AI", text: "Thank you for calling Hardhat Electric. I'm the AI scheduling assistant. How can I help you today?" },
      { speaker: "Caller", text: "Hi, I'm doing a kitchen remodel and my GC said I need to upgrade my panel from 100 amps to 200 amps. Can I get a quote?" },
      { speaker: "AI", text: "Absolutely. We handle 200 Amp upgrades all the time. Before we can give an exact quote, we usually send an estimator out to take a look at the existing setup. I have an opening this Thursday at 10:00 AM. Does that work for you?" },
      { speaker: "Caller", text: "Yeah, Thursday at 10 AM is perfect." },
      { speaker: "AI", text: "Great. I have that booked. What is the address for the property?" }
    ]
  }
];

export default function CallLogs() {
  const [selectedCall, setSelectedCall] = useState(mockCalls[0]);

  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Call Logs & Transcripts</h1>
          <p className="text-gray-500 mt-2">Review AI summaries, playback audio, and audit transcripts.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search phone, name..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Filter size={18} />
            Filters
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* Left Column: Call List */}
        <div className="w-1/3 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Recent Calls (Today)</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {mockCalls.map(call => (
              <div 
                key={call.id} 
                onClick={() => setSelectedCall(call)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${selectedCall.id === call.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-gray-900">{call.phone}</span>
                  <span className="text-xs text-gray-500">{call.time}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600 truncate pr-4">{call.name}</span>
                  {call.urgency === "High" ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                      <AlertTriangle size={12} /> High
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      <CheckCircle2 size={12} /> Scheduled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Call Detail View */}
        <div className="w-2/3 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          
          {/* Detail Header & Audio Player */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCall.phone}</h2>
                <p className="text-gray-500 mt-1">{selectedCall.name} • {selectedCall.time}</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 text-sm font-semibold rounded-full mb-2">
                  {selectedCall.status}
                </span>
              </div>
            </div>

            {/* Fake Audio Player */}
            <div className="bg-gray-900 rounded-lg p-3 flex items-center gap-4">
              <button className="h-10 w-10 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white transition-colors">
                <Play size={20} className="ml-1" />
              </button>
              <div className="flex-1">
                {/* Audio Waveform Mock */}
                <div className="h-6 flex items-center gap-1">
                  {Array.from({ length: 40 }).map((_, i) => {
                    // Pre-computed fake waveform heights
                    const heights = [20, 35, 80, 45, 60, 90, 30, 20, 50, 75, 100, 85, 40, 25, 65, 55, 95, 30, 20, 45, 80, 60, 35, 20, 50, 70, 90, 40, 25, 60, 85, 95, 55, 30, 45, 75, 100, 80, 40, 20];
                    return (
                      <div key={i} className="w-1.5 bg-blue-400 rounded-full" style={{ height: `${heights[i]}%` }}></div>
                    );
                  })}
                </div>
              </div>
              <div className="text-white text-sm font-mono">{selectedCall.duration}</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* AI Summary & Extraction Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText size={18} className="text-blue-600"/> 
                  AI Call Summary
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-100">
                  {selectedCall.summary}
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-600"/> 
                  Extracted Data
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Address</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedCall.extracted.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Job Type</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedCall.extracted.jobType}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Timeline / Booking</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedCall.extracted.availability}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transcript */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Full Transcript</h3>
              <div className="space-y-4">
                {selectedCall.transcript.map((line, idx) => (
                  <div key={idx} className={`flex gap-4 ${line.speaker === 'AI' ? 'bg-gray-50 p-3 rounded-lg border border-gray-100' : ''}`}>
                    <div className="w-16 flex-shrink-0">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${line.speaker === 'AI' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
                        {line.speaker}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 leading-relaxed">{line.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}