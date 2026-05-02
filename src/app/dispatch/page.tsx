"use client";

import { Calendar as CalendarIcon, Clock, Users, Plus, ChevronLeft, ChevronRight, User, MapPin, Navigation, AlertCircle, Sun, CloudRain, Zap, Truck, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

// Twin Cities coordinates
const center = {
  lat: 44.9778,
  lng: -93.2650
};

export default function Dispatch() {
  const [viewMode, setViewMode] = useState<'day' | 'map'>('day');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 p-8 h-[calc(100vh-2rem)] flex flex-col">

      {/* Header & Weather/Traffic Banner */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dispatch & Routing</h1>
          <p className="text-gray-500 mt-2">Live truck tracking, AI routing, and schedule management.</p>
        </div>
        <div className="flex gap-4 items-center">
          {/* Weather Widget */}
          <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg flex items-center gap-3">
            <Sun size={20} className="text-yellow-500" />
            <div>
              <p className="text-xs font-bold text-blue-900">72° Clear</p>
              <p className="text-[10px] text-blue-700">Perfect for roof/solar work</p>
            </div>
          </div>
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Users size={18} />
            Filter Crews
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Plus size={18} />
            Manual Book
          </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Thursday, May 2, 2026</h2>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('day')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'day' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Day View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Map View
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex gap-6 overflow-hidden">

        {/* Left Sidebar: AI Parking Lot (Unassigned) */}
        <div className="w-80 bg-gray-50 rounded-xl border border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-200 bg-white rounded-t-xl flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              AI Parking Lot
            </h3>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">2 Pending</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            <p className="text-xs text-gray-500 mb-2">Jobs caught by AI needing manual assignment (requires specific skills or parts).</p>

            {/* Unassigned Ticket 1 */}
            <div className="bg-white p-3 rounded-lg border border-red-200 shadow-sm cursor-grab hover:shadow-md hover:border-red-300">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded uppercase tracking-wider">Emergency</span>
                <span className="text-xs font-medium text-gray-500">2h ago</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Solar Inverter Fault</h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">Customer reports smoking from SolarEdge inverter. Needs master tech.</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">Requires: Master/Solar</span>
              </div>
            </div>

            {/* Unassigned Ticket 2 */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm cursor-grab hover:shadow-md hover:border-gray-300">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded uppercase tracking-wider">Estimate</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">EV Charger Install</h4>
              <p className="text-xs text-gray-500 mt-1">Tesla Wall Connector. Needs quote.</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <MapPin size={12} /> Edina, MN
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: The Dispatch Board */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col relative">

          {viewMode === 'map' ? (
            <div className="flex-1 relative overflow-hidden bg-gray-100">
              
              {/* Floating UI Overlay */}
              <div className="absolute top-4 left-4 bg-white p-3 rounded-xl shadow-md border border-gray-200 z-10 w-64">
                <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2"><Navigation size={16} className="text-blue-600"/> Live Fleet Tracking</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Mike (Truck 1)</span>
                    <span className="font-bold text-gray-700">On Site</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> Dave (Truck 2)</span>
                    <span className="font-bold text-gray-700">En Route</span>
                  </div>
                </div>
              </div>

              {/* The Actual Google Map */}
              <APIProvider apiKey={apiKey}>
                <div style={{ width: '100%', height: '100%' }}>
                  <Map
                    defaultCenter={center}
                    defaultZoom={11}
                    disableDefaultUI={true}
                    gestureHandling={'greedy'}
                  >
                    {/* Mike's Marker (Wayzata / Minnetonka area) */}
                    <Marker 
                      position={{ lat: 44.9680, lng: -93.4682 }} 
                      label={{ text: "M", color: "white", fontWeight: "bold" }}
                    />
                    
                    {/* Dave's Marker (Maple Grove area) */}
                    <Marker 
                      position={{ lat: 45.0722, lng: -93.4554 }} 
                      label={{ text: "D", color: "white", fontWeight: "bold" }}
                    />

                    {/* Office Marker */}
                    <Marker 
                      position={{ lat: 44.9778, lng: -93.2650 }} 
                    />
                  </Map>
                </div>
              </APIProvider>

            </div>
          ) : (
            <div className="flex-1 flex overflow-x-auto relative">

              {/* Time Sidebar */}
            <div className="w-20 border-r border-gray-200 bg-gray-50 flex flex-col sticky left-0 z-20">
              <div className="h-20 border-b border-gray-200 bg-gray-50"></div> {/* Spacer for header */}
              {["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM"].map((time) => (
                <div key={time} className="h-32 border-b border-gray-200 text-right pr-3 pt-2 relative">
                  <span className="text-xs font-medium text-gray-500 absolute -top-2.5 right-3 bg-gray-50 px-1">{time}</span>
                </div>
              ))}
            </div>

            {/* Tech Columns Container */}
            <div className="flex-1 flex min-w-max relative bg-gray-50/30">

              {/* Current Time Line Mock */}
              <div className="absolute left-0 right-0 top-[280px] h-0.5 bg-red-500 z-10 flex items-center">
                <div className="h-2 w-2 rounded-full bg-red-500 -ml-1"></div>
              </div>

              {/* Tech 1: Mike */}
              <div className="w-[300px] border-r border-gray-200 relative">
                <div className="h-20 border-b border-gray-200 bg-white p-3 sticky top-0 z-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center relative">
                      <Truck size={18} className="text-blue-600" />
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 leading-tight">Mike</h4>
                      <p className="text-xs text-gray-500">Truck 1 • Master</p>
                    </div>
                  </div>
                </div>

                <div className="relative h-[1024px]">
                  {/* Grid Lines */}
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-32 border-b border-gray-100 w-full absolute" style={{ top: `${i * 128}px` }}></div>
                  ))}

                  {/* Drive Time Indicator */}
                  <div className="absolute left-3 right-3 top-[30px] h-[20px] border-l-2 border-dashed border-gray-300 flex items-center pl-2">
                    <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1"><Navigation size={10}/> 15m drive</span>
                  </div>

                  {/* Job Card: On Site */}
                  <div className="absolute left-2 right-2 top-[50px] h-[180px] bg-blue-50 border-2 border-blue-400 rounded-lg p-3 shadow-md flex flex-col z-10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded animate-pulse">ON SITE</span>
                      <span className="text-xs text-blue-800 font-medium">8:30 - 10:00</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">200A Service Upgrade Eval</p>
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1"><MapPin size={12}/> Maple Grove, MN</p>
                    <div className="mt-auto pt-2 border-t border-blue-200 flex justify-between items-center">
                      <span className="text-xs font-semibold text-blue-700">AI Booked</span>
                      <CheckCircle2 size={14} className="text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tech 2: Dave */}
              <div className="w-[300px] border-r border-gray-200 relative">
                <div className="h-20 border-b border-gray-200 bg-white p-3 sticky top-0 z-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center relative">
                      <Truck size={18} className="text-green-600" />
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-blue-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 leading-tight">Dave</h4>
                      <p className="text-xs text-gray-500">Truck 2 • Journeyman</p>
                    </div>
                  </div>
                </div>

                <div className="relative h-[1024px]">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-32 border-b border-gray-100 w-full absolute" style={{ top: `${i * 128}px` }}></div>
                  ))}

                  {/* Job Card: En Route */}
                  <div className="absolute left-2 right-2 top-[220px] h-[256px] bg-white border border-gray-300 rounded-lg p-3 shadow-sm flex flex-col z-10 hover:shadow-md hover:border-blue-300 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <Navigation size={10} /> EN ROUTE
                      </span>
                      <span className="text-xs text-gray-600 font-medium">10:00 - 1:00</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">Commercial Rough-in</p>
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1"><MapPin size={12}/> Minnetonka, MN</p>
                    <div className="mt-auto pt-2 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><CalendarIcon size={12}/> Apple Cal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tech 3: Sarah */}
              <div className="w-[300px] border-r border-gray-200 relative">
                <div className="h-20 border-b border-gray-200 bg-white p-3 sticky top-0 z-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center relative">
                      <User size={18} className="text-purple-600" />
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-gray-300 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 leading-tight">Sarah</h4>
                      <p className="text-xs text-gray-500">Estimator</p>
                    </div>
                  </div>
                </div>

                <div className="relative h-[1024px]">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-32 border-b border-gray-100 w-full absolute" style={{ top: `${i * 128}px` }}></div>
                  ))}

                  {/* Job Card: Scheduled Future */}
                  <div className="absolute left-2 right-2 top-[512px] h-[128px] bg-purple-50 border border-purple-200 rounded-lg p-3 shadow-sm flex flex-col z-10 hover:shadow-md transition-all opacity-80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">SCHEDULED</span>
                      <span className="text-xs text-purple-800 font-medium">12:00 - 1:00</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">New Build Consultation</p>
                    <p className="text-xs text-purple-600 mt-1">AI Booked • High Value Lead</p>
                  </div>
                </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}