"use client";

import { useState } from "react";
import { MapPin, Phone, Clock, CheckCircle2, Navigation, AlertTriangle, FileText, Camera, Wrench, MessageSquare, Menu, Calendar, X, Send, DollarSign } from "lucide-react";

export default function FieldApp() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Fake chat state
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "Sarah (Office)", text: "Hey Mike, customer just called. He secured the dog inside. You're good to head to the panel.", time: "9:38 AM" }
  ]);

  const handleSendChat = () => {
    if (!chatMessage.trim()) return;
    setChatHistory([...chatHistory, { sender: "You", text: chatMessage, time: "Just now" }]);
    setChatMessage("");
  };

  const handleComplete = () => {
    setIsCompleted(true);
    setShowInvoiceModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-200 py-8 flex items-center justify-center">
      {/* Mobile Device Frame */}
      <div className="w-[400px] h-[800px] bg-gray-50 rounded-[3rem] shadow-2xl border-[8px] border-gray-900 overflow-hidden relative flex flex-col">
        
        {/* Fake iOS Status Bar */}
        <div className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center text-xs font-bold z-10">
          <span>9:41 AM</span>
          <div className="flex items-center gap-2">
            <span>5G</span>
            <div className="w-6 h-3 border border-white rounded-sm relative">
              <div className="bg-white w-4 h-full absolute left-0"></div>
            </div>
          </div>
        </div>

        {/* App Header */}
        <div className="bg-blue-600 text-white px-6 pb-6 pt-2 rounded-b-3xl shadow-sm z-0">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                M
              </div>
              <div>
                <p className="font-semibold text-sm">Mike (Truck 1)</p>
                <p className="text-blue-200 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span> Clocked In
                </p>
              </div>
            </div>
            <Menu size={24} className="cursor-pointer hover:text-blue-200" />
          </div>

          <h1 className="text-2xl font-bold mb-1">
            {activeTab === 'jobs' ? 'Current Job' : 
             activeTab === 'schedule' ? 'My Schedule' :
             activeTab === 'chat' ? 'Office Chat' : 'Timecard'}
          </h1>
          <p className="text-blue-100 text-sm">
            {activeTab === 'jobs' ? 'You are scheduled to be ON SITE.' :
             activeTab === 'schedule' ? '3 Jobs remaining today.' :
             activeTab === 'chat' ? 'Direct line to Dispatch' : '42.5 hours this week'}
          </p>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 -mt-4 relative z-10 space-y-4 pb-24">
          
          {/* ---- JOBS TAB ---- */}
          {activeTab === 'jobs' && (
            <>
              {isCompleted ? (
                <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-8 text-center flex flex-col items-center justify-center h-full">
                  <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={40} className="text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Completed!</h2>
                  <p className="text-gray-500 text-sm mb-8">Invoice pushed to QuickBooks and synced with office.</p>
                  <button 
                    onClick={() => setIsCompleted(false)}
                    className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-gray-800 transition-colors"
                  >
                    Start Next Job
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        Emergency
                      </span>
                      <span className="text-gray-500 text-xs font-medium">8:30 AM - 10:00 AM</span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Solar Inverter Fault</h2>
                    
                    <div className="flex gap-3 text-sm text-gray-600 mb-5">
                      <MapPin size={18} className="text-gray-400 flex-shrink-0" />
                      <p className="leading-tight">
                        8824 Lake St<br/>
                        Wayzata, MN 55391
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <button 
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                        onClick={() => alert("Would open Apple/Google Maps with pre-loaded address.")}
                      >
                        <Navigation size={18} /> Navigate
                      </button>
                      <button 
                        className="bg-green-50 hover:bg-green-100 text-green-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                        onClick={() => alert("Would open phone dialer to call 612-555-8992.")}
                      >
                        <Phone size={18} /> Call Client
                      </button>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                      <button 
                        onClick={() => setShowInvoiceModal(true)}
                        className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-gray-800 transition-colors"
                      >
                        Complete Job & Invoice
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-5">
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                        <AlertTriangle size={14} className="text-orange-500" /> AI Job Briefing
                      </h3>
                      <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                        Customer reported main breaker keeps tripping and smells burning near the solar panel connection. <strong className="text-red-600">Possible arcing/fire risk.</strong> Do not have customer reset breaker.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                        <FileText size={14} className="text-blue-500" /> Property DNA
                      </h3>
                      <ul className="text-sm text-gray-700 space-y-2 bg-orange-50 p-3 rounded-lg border border-orange-100">
                        <li className="flex items-start gap-2">
                          <span className="font-bold text-orange-800">• DOG IN YARD:</span> 
                          <span className="text-orange-900">Text customer 10m before arrival.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold text-gray-800">• Gate Code:</span> 
                          <span className="text-gray-600">1492#</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* ---- SCHEDULE TAB ---- */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-blue-600">8:30 AM (Current)</span>
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Emergency</span>
                </div>
                <h3 className="font-bold text-gray-900">Solar Inverter Fault</h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin size={12}/> Wayzata, MN</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 opacity-75">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-gray-500">10:30 AM</span>
                </div>
                <h3 className="font-bold text-gray-900">Commercial Rough-in</h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin size={12}/> Minnetonka, MN</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 opacity-75">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-gray-500">1:00 PM</span>
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">AI Booked</span>
                </div>
                <h3 className="font-bold text-gray-900">200A Panel Swap</h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin size={12}/> Plymouth, MN</p>
              </div>
            </div>
          )}

          {/* ---- CHAT TAB ---- */}
          {activeTab === 'chat' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
              <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">S</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Sarah (Office)</h3>
                  <p className="text-[10px] text-green-600 font-medium">Online</p>
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${
                      msg.sender === 'You' 
                        ? 'bg-blue-600 text-white rounded-br-sm' 
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-gray-100 flex items-center gap-2">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Message dispatch..."
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                />
                <button 
                  onClick={handleSendChat}
                  className="h-9 w-9 bg-blue-600 rounded-full flex items-center justify-center text-white"
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </div>
            </div>
          )}

          {/* ---- TIMECARD TAB ---- */}
          {activeTab === 'timecard' && (
            <div className="space-y-4">
              <div className="bg-gray-900 text-white rounded-2xl shadow-sm p-6 text-center">
                <p className="text-gray-400 text-sm font-medium mb-1">Hours this week</p>
                <h2 className="text-4xl font-bold mb-4">42.5h</h2>
                <button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors">
                  Clock Out
                </button>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-bold text-gray-900 mb-3">Today&apos;s Punches</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                    <span className="text-green-600 font-medium flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-green-500"></div> Clock In</span>
                    <span className="text-gray-600 font-medium">7:00 AM</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                    <span className="text-orange-500 font-medium flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-orange-400"></div> Start Drive (Job 1)</span>
                    <span className="text-gray-600 font-medium">8:15 AM</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-600 font-medium flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-blue-500"></div> On Site (Job 1)</span>
                    <span className="text-gray-600 font-medium">8:30 AM</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Invoice Modal Overlay */}
        {showInvoiceModal && (
          <div className="absolute inset-0 bg-black/60 z-30 flex items-end">
            <div className="bg-white w-full h-[85%] rounded-t-3xl p-6 flex flex-col animate-[slideUp_0.2s_ease-out]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Close Out Job</h2>
                <button onClick={() => setShowInvoiceModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Job Total Amount</label>
                  <div className="relative">
                    <DollarSign size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="number" placeholder="0.00" className="w-full text-xl font-bold pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tech Notes (For Office)</label>
                  <textarea rows={4} placeholder="What did you fix?" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm"></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Attachments</label>
                  <button className="w-full bg-gray-50 border-2 border-dashed border-gray-300 text-gray-500 py-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                    <Camera size={24} />
                    <span className="text-sm font-medium">Add Photos or Receipts</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button 
                  onClick={handleComplete}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} /> Mark Complete & Send Invoice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Tab Navigation */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center absolute bottom-0 left-0 right-0 pb-8 z-20">
          <button onClick={() => setActiveTab('jobs')} className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'jobs' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <Wrench size={24} />
            <span className="text-[10px] font-bold">Jobs</span>
          </button>
          <button onClick={() => setActiveTab('schedule')} className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'schedule' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <Calendar size={24} />
            <span className="text-[10px] font-bold">Schedule</span>
          </button>
          <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center gap-1 w-16 relative transition-colors ${activeTab === 'chat' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <MessageSquare size={24} />
            {activeTab !== 'chat' && <span className="absolute -top-1 right-3 h-3 w-3 bg-red-500 border-2 border-white rounded-full"></span>}
            <span className="text-[10px] font-bold">Chat</span>
          </button>
          <button onClick={() => setActiveTab('timecard')} className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeTab === 'timecard' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <Clock size={24} />
            <span className="text-[10px] font-bold">Timecard</span>
          </button>
        </div>

      </div>
    </div>
  );
}