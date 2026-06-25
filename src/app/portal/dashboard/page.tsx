'use client';
import { MapPin, Phone, MessageSquare, Star, Wrench, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CustomerPortalDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wrench className="text-white w-4 h-4" />
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">Hard Hat Electric</span>
        </div>
        <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Job #4829
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6 mt-4">
        
        {/* Live Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-blue-600 p-6 text-white text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-3 backdrop-blur-sm">
              <MapPin className="w-8 h-8 text-white animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold mb-1">Your Pro is on the way!</h2>
            <p className="text-blue-100 font-medium">Estimated Arrival: 2:45 PM (12 mins)</p>
          </div>
          
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80" 
                alt="Technician" 
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shadow-sm"
              />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Mike Johnson</h3>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium text-gray-900">4.9</span>
                  <span>(128 jobs)</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-green-500" /> Background Checked
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-200 transition">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-100 transition">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative pt-2">
              <div className="flex mb-2 items-center justify-between">
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">En Route</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Working</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Done</div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-100">
                <div style={{ width: "33%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Service Details</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Wrench className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Issue Reported</p>
                <p className="text-sm text-gray-600">Main breaker panel upgrade and EV charger installation quote.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Service Address</p>
                <p className="text-sm text-gray-600">1234 Maple Wood Dr, Waconia, MN</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Required (Example of Invoice) */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-sm border border-gray-800 p-6 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <FileText className="w-24 h-24" />
           </div>
           <h3 className="font-bold text-lg mb-1 relative z-10">Invoice Ready</h3>
           <p className="text-gray-300 text-sm mb-4 relative z-10">Your diagnostic fee is ready for payment.</p>
           <button className="bg-white text-gray-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition w-full flex items-center justify-between relative z-10">
             Pay $150.00 <ArrowRight className="w-4 h-4" />
           </button>
        </div>

      </div>
    </div>
  );
}
