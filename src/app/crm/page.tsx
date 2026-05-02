"use client";

import { Map as MapIcon, Kanban, List, Search, MoreVertical, DollarSign, MapPin, Zap, CheckCircle2, Navigation, Phone } from "lucide-react";
import { useState } from "react";
import { APIProvider, Map as GoogleMap } from "@vis.gl/react-google-maps";

export default function CRM() {
  const [viewMode, setViewMode] = useState<'board' | 'list' | 'map'>('board');

  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Leads & CRM</h1>
          <p className="text-gray-500 mt-2">Manage customer pipeline and view neighborhood sales heatmaps.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-gray-100 p-1 rounded-lg flex items-center">
            <button 
              onClick={() => setViewMode('board')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === 'board' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Kanban size={16}/> Board
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <List size={16}/> List
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <MapIcon size={16}/> Heatmap
            </button>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
            + New Lead
          </button>
        </div>
      </div>

      {viewMode === 'board' && (
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
          
          {/* Column 1: New / AI Captured */}
          <div className="flex-1 min-w-[300px] flex flex-col bg-gray-50 rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                AI Captured
                <span className="ml-2 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">3</span>
              </h3>
              <MoreVertical size={16} className="text-gray-400 cursor-pointer" />
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              {/* Card */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">Emergency</span>
                  <span className="text-xs text-gray-500">2h ago</span>
                </div>
                <h4 className="font-semibold text-gray-900">Solar Array Damage</h4>
                <p className="text-sm text-gray-500 mt-1">Unregistered Caller</p>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin size={14}/> St Paul, MN</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">Web Lead</span>
                  <span className="text-xs text-gray-500">5h ago</span>
                </div>
                <h4 className="font-semibold text-gray-900">EV Charger Install</h4>
                <p className="text-sm text-gray-500 mt-1">Sarah Jenkins</p>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin size={14}/> Edina, MN</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Estimating */}
          <div className="flex-1 min-w-[300px] flex flex-col bg-gray-50 rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                Estimating
                <span className="ml-2 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">1</span>
              </h3>
              <MoreVertical size={16} className="text-gray-400 cursor-pointer" />
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              {/* Card */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-gray-700 bg-gray-200 px-2 py-0.5 rounded">Commercial</span>
                  <span className="font-semibold text-green-600 text-sm">$4,500</span>
                </div>
                <h4 className="font-semibold text-gray-900">Lighting Retrofit</h4>
                <p className="text-sm text-gray-500 mt-1">Tech Solutions LLC</p>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin size={14}/> Minnetonka, MN</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Scheduled / Won */}
          <div className="flex-1 min-w-[300px] flex flex-col bg-gray-50 rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white rounded-t-xl">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Scheduled Jobs
                <span className="ml-2 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">2</span>
              </h3>
              <MoreVertical size={16} className="text-gray-400 cursor-pointer" />
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
               {/* Card */}
               <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm cursor-pointer hover:border-green-300 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Residential</span>
                  <span className="font-semibold text-green-600 text-sm">$2,850</span>
                </div>
                <h4 className="font-semibold text-gray-900">200A Panel Upgrade</h4>
                <p className="text-sm text-gray-500 mt-1">John Martinez</p>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin size={14}/> Maple Grove, MN</span>
                  <span className="font-medium text-blue-600">Thurs, 10 AM</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-2">Lead Name / Source</div>
            <div>Status</div>
            <div>Job Type / Value</div>
            <div className="text-right">Last Action</div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            <div className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-gray-50">
              <div className="col-span-2">
                <h4 className="text-sm font-bold text-gray-900">Unregistered Caller</h4>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone size={12}/> (612) 555-0199</p>
              </div>
              <div><span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">AI Captured (Emergency)</span></div>
              <div>
                <p className="text-sm text-gray-900">Solar Array Damage</p>
                <p className="text-xs text-gray-500 mt-0.5">St Paul, MN</p>
              </div>
              <div className="text-right text-xs text-gray-500">2h ago</div>
            </div>
            <div className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-gray-50">
              <div className="col-span-2">
                <h4 className="text-sm font-bold text-gray-900">Sarah Jenkins</h4>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Zap size={12}/> Web Widget</p>
              </div>
              <div><span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">AI Captured (Web)</span></div>
              <div>
                <p className="text-sm text-gray-900">EV Charger Install</p>
                <p className="text-xs text-gray-500 mt-0.5">Edina, MN</p>
              </div>
              <div className="text-right text-xs text-gray-500">5h ago</div>
            </div>
            <div className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-gray-50">
              <div className="col-span-2">
                <h4 className="text-sm font-bold text-gray-900">Tech Solutions LLC</h4>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Navigation size={12}/> Estimator Site Visit</p>
              </div>
              <div><span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">Estimating</span></div>
              <div>
                <p className="text-sm text-gray-900">Lighting Retrofit</p>
                <p className="text-xs text-green-600 font-bold mt-0.5">$4,500 Value</p>
              </div>
              <div className="text-right text-xs text-gray-500">Yesterday</div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'map' && (
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col relative">
          <div className="absolute top-4 left-4 bg-white p-4 rounded-xl shadow-md border border-gray-200 z-10 w-72">
            <h3 className="font-bold text-gray-900 text-sm mb-3">Sales Heatmap (MTD)</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">Edina / Minnetonka</span>
                  <span className="font-bold text-green-600">$45,200</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">Maple Grove</span>
                  <span className="font-bold text-green-600">$22,400</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">St Paul</span>
                  <span className="font-bold text-green-600">$8,900</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-4 leading-tight">
              AI suggests targeting direct mail to Minnetonka due to high concentration of $4k+ commercial lighting bids.
            </p>
          </div>

          <div 
            className="flex-1 w-full relative overflow-hidden bg-gray-100"
          >
            <div className="absolute inset-0 z-0">
              <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
                <GoogleMap 
                  defaultZoom={10} 
                  defaultCenter={{ lat: 44.9778, lng: -93.2650 }} // Minneapolis area
                  disableDefaultUI={true}
                  gestureHandling="greedy"
                />
              </APIProvider>
            </div>

            {/* Heatmap Blobs Mock */}
            <div className="absolute top-[30%] left-[20%] w-48 h-48 bg-red-500/40 rounded-full blur-2xl pointer-events-none z-10"></div>
            <div className="absolute top-[35%] left-[25%] w-32 h-32 bg-red-600/50 rounded-full blur-xl pointer-events-none z-10"></div>
            
            <div className="absolute top-[15%] right-[40%] w-32 h-32 bg-orange-500/40 rounded-full blur-xl pointer-events-none z-10"></div>
            
            <div className="absolute bottom-[30%] right-[20%] w-24 h-24 bg-yellow-400/40 rounded-full blur-xl pointer-events-none z-10"></div>
          </div>
        </div>
      )}

    </div>
  );
}