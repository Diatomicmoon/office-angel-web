"use client";

import { MapPin, Search, BarChart3, TrendingUp, TrendingDown, Star, Globe, Smartphone, Camera, CalendarCheck, Send, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { NotWired } from "@/components/NotWired";

export default function Marketing() {
  const [postStatus, setPostStatus] = useState("Drafting...");
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePost = async () => {
    setIsPublishing(true);
    setPostStatus("Publishing...");
    
    try {
      const res = await fetch("/api/google-marketing/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: "5341bfb2-8fce-4c7a-9a30-20e6aba60a8a", // Defaulting to your testing tenant
          text: "Just finished up a massive 200 Amp service upgrade for a great customer in Maple Grove! ⚡ If you're dealing with an old Federal Pacific panel or need more power for an EV charger, give us a call. We are fully licensed, insured, and ready to roll. \n\n#Electrician #MapleGroveMN #PanelUpgrade #HomeImprovement #TradeVolt",
          platforms: ["gmb", "facebook"]
        })
      });

      if (res.ok) {
        setPostStatus("Published to GMB & Facebook ✓");
      } else {
        setPostStatus("Failed to publish");
      }
    } catch (e) {
      setPostStatus("Error publishing");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-2rem)] overflow-y-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">SEO & Marketing AI</h1>
          <p className="text-gray-500 mt-2">Google Business Profile analytics, local ranking heatmaps, and auto-generated social posts.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.location.href = '/api/auth/meta?companyId=1'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Globe size={18} /> Connect Facebook
          </button>
          <button 
            onClick={() => window.location.href = '/api/google-marketing/auth?companyId=1'}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Globe size={18} /> Connect Google
          </button>
        </div>
      </div>

      {/* Top Stats: Google Business Profile */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Google Search Views</h3>
          <p className="text-3xl font-bold text-gray-900">4,281</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-green-600">
            <TrendingUp size={14} /> +12% vs last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Map Route Requests</h3>
          <p className="text-3xl font-bold text-gray-900">142</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-green-600">
            <TrendingUp size={14} /> +5% vs last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Website Clicks</h3>
          <p className="text-3xl font-bold text-gray-900">856</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-red-600">
            <TrendingDown size={14} /> -2% vs last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Average Rating</h3>
          <p className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            4.9 <Star size={24} className="fill-yellow-400 text-yellow-400" />
          </p>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-medium text-gray-500">
            Based on 144 total reviews
          </div>
        </div>
      </div>

      {/* Middle Grid: SEO Heatmap & Social Auto-Poster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Local SEO Grid / Heatmap */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-[500px]">
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center z-10">
            <div>
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPin size={18} className="text-red-500" />
                Local Search Grid (Keyword: "Electrician Near Me")
              </h2>
            </div>
            <select className="bg-white border border-gray-300 text-sm rounded-md px-3 py-1">
              <option>Electrician Near Me</option>
              <option>Panel Upgrade</option>
              <option>EV Charger Installer</option>
            </select>
          </div>
          
          <div className="flex-1 relative bg-gray-100 flex items-center justify-center p-8 overflow-hidden">
            {/* Map Background (Mocked static image style via CSS) */}
            <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://maps.wikimedia.org/osm-intl/12/983/1472.png')] bg-cover bg-center">
            </div>
            
            {/* 3x3 SEO Grid Overlay */}
            <div className="relative z-10 grid grid-cols-3 gap-2 w-full max-w-sm pointer-events-none">
              {[2, 1, 1, 3, 1, 2, 7, 4, 3].map((rank, i) => (
                <div key={i} className={`aspect-square rounded-full flex flex-col items-center justify-center border-4 shadow-lg transform transition-transform pointer-events-auto hover:scale-110 cursor-pointer ${
                  rank <= 3 ? 'bg-green-500 border-white text-white' : 
                  rank <= 5 ? 'bg-yellow-400 border-white text-white' : 'bg-red-500 border-white text-white'
                }`}>
                  <span className="text-2xl font-black">{rank}</span>
                </div>
              ))}
            </div>

            {/* AI SEO Suggestion Overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur border border-gray-200 p-4 rounded-xl shadow-lg">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-1">
                <Search size={16} className="text-blue-600" /> AI Ranking Analysis
              </h4>
              <p className="text-xs text-gray-700">
                You are ranking <strong>#1</strong> in the center of town, but dropping to <strong>#7</strong> in the Southwest quadrant. 
                <strong className="text-blue-600 ml-1 cursor-pointer hover:underline">Generate a geo-tagged post about "Southwest Service Calls" to boost ranking here.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Social Media & GMB Auto-Poster */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[500px]">
          <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Smartphone size={18} className="text-blue-600" />
                AI Social & GMB Update Generator
              </h2>
            </div>
          </div>
          
          <div className="p-6 flex-1 flex flex-col space-y-6 overflow-y-auto">
            
            {/* Source Image */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Upload Job Photo</label>
              <div className="h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer relative overflow-hidden group">
                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white font-bold text-sm z-10">Change Photo</div>
                {/* Fake uploaded photo */}
                <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover" alt="Electrical Panel" />
              </div>
            </div>

            {/* AI Generated Text */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-bold text-gray-700">AI Generated Caption</label>
                <button className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
                  <RefreshCw size={12} /> Regenerate
                </button>
              </div>
              <textarea 
                className="w-full p-4 border border-gray-300 rounded-xl text-sm text-gray-800 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                rows={5}
                defaultValue="Just finished up a massive 200 Amp service upgrade for a great customer in Maple Grove! ⚡ If you're dealing with an old Federal Pacific panel or need more power for an EV charger, give us a call. We are fully licensed, insured, and ready to roll. \n\n#Electrician #MapleGroveMN #PanelUpgrade #HomeImprovement #TradeVolt"
              ></textarea>
            </div>

          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex gap-2">
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1"><Globe size={12}/> Google Business</span>
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1"><Globe size={12}/> Facebook</span>
            </div>
            
            {postStatus.includes("Published") ? (
              <button className="bg-green-100 text-green-700 px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2">
                <CheckCircle2 size={16} /> {postStatus}
              </button>
            ) : (
              <button 
                onClick={handlePost}
                className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
              >
                <Send size={16} /> Post Update Now
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
