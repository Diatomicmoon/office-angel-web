"use client";

import { MapPin, Phone, Mail, Clock, DollarSign, Calendar, FileText, Image as ImageIcon, PlusCircle, ArrowLeft, Star, ShieldAlert, CheckCircle2, Navigation } from "lucide-react";
import Link from "next/link";

export default function CustomerProfile() {
  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col h-[calc(100vh-2rem)] overflow-y-auto">
      
      {/* Back Navigation */}
      <div className="mb-6">
        <Link href="/projects" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors w-fit">
          <ArrowLeft size={16} /> Back to Archive
        </Link>
      </div>

      {/* Header Profile Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8 flex items-start justify-between">
        <div className="flex gap-6">
          <div className="h-20 w-20 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-3xl font-bold flex-shrink-0">
            JM
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              John Martinez
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                <Star size={12} className="fill-green-700" /> VIP Customer
              </span>
            </h1>
            
            <div className="flex gap-6 mt-3 text-sm text-gray-600">
              <span className="flex items-center gap-1.5"><Phone size={16} className="text-gray-400" /> (763) 555-8822</span>
              <span className="flex items-center gap-1.5"><Mail size={16} className="text-gray-400" /> john.martinez@email.com</span>
              <span className="flex items-center gap-1.5 text-blue-600 font-medium cursor-pointer hover:underline">
                <MapPin size={16} className="text-blue-500" /> 8890 Maple Ln, Maple Grove, MN
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Lifetime Value</p>
          <p className="text-3xl font-bold text-gray-900">$3,950.00</p>
          <button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <PlusCircle size={16} /> Book New Job
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Property DNA & Permanent Notes */}
        <div className="space-y-8">
          
          {/* Property DNA */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <ShieldAlert size={18} className="text-orange-500" />
                Property DNA (Site Notes)
              </h2>
              <button className="text-xs text-blue-600 font-medium">Edit</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-orange-50 border border-orange-100 text-orange-800 text-sm p-3 rounded-lg flex items-start gap-2">
                <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
                <p><strong>DOG IN YARD:</strong> Large German Shepherd. Text customer 10 mins before arriving so he can bring the dog inside.</p>
              </div>
              <div className="text-sm text-gray-700 space-y-3">
                <p><strong>Gate Code:</strong> 1492#</p>
                <p><strong>Panel Info:</strong> Upgraded to 200A Square D (QO) in May 2026. Subpanel in detached garage is still 60A.</p>
                <p><strong>Water Shutoff:</strong> Buried under the rose bush on the left side of the house.</p>
              </div>
            </div>
          </div>

          {/* Media Vault Mock */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon size={18} className="text-blue-600" />
                Media Vault
              </h2>
              <button className="text-xs text-blue-600 font-medium">View All (12)</button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 hover:border-blue-400 cursor-pointer overflow-hidden relative">
                <div className="absolute inset-0 bg-blue-900/10"></div>
                <ImageIcon size={24} className="text-gray-400" />
                <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">Panel_After.jpg</span>
              </div>
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 hover:border-blue-400 cursor-pointer overflow-hidden relative">
                <div className="absolute inset-0 bg-blue-900/10"></div>
                <ImageIcon size={24} className="text-gray-400" />
                <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">Permit_Signoff.pdf</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Columns (Span 2): Job History Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
            
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                Job History Timeline
              </h2>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="relative border-l-2 border-gray-200 ml-3 space-y-10 pb-4">
                
                {/* Timeline Item 1 */}
                <div className="relative pl-8">
                  <div className="absolute w-6 h-6 bg-green-500 rounded-full -left-[13px] border-4 border-white flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">200A Panel Upgrade</h3>
                      <p className="text-sm text-gray-500 font-medium">Ticket #8842 • Completed May 1, 2026</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">$2,850.00</p>
                      <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded mt-1 inline-block">PAID</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-3">
                    <div className="flex gap-6 mb-3 text-sm text-gray-600 border-b border-gray-200 pb-3">
                      <span className="flex items-center gap-1.5"><Clock size={16} className="text-gray-400"/> 8:30 AM - 2:00 PM</span>
                      <span className="flex items-center gap-1.5"><Navigation size={16} className="text-gray-400"/> Tech: Mike (Truck 1)</span>
                      <span className="flex items-center gap-1.5"><FileText size={16} className="text-gray-400"/> Invoice: INV-2042</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>Tech Notes:</strong> Swapped out old 100A Federal Pacific panel. Installed new 200A Square D QO 42-space outdoor metermain. Ground rods driven, bonded water meter. City inspector (Bob) signed off at 1:30 PM. Customer was very happy.
                    </p>
                  </div>
                </div>

                {/* Timeline Item 2 */}
                <div className="relative pl-8">
                  <div className="absolute w-6 h-6 bg-blue-500 rounded-full -left-[13px] border-4 border-white flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">EV Charger Installation</h3>
                      <p className="text-sm text-gray-500 font-medium">Ticket #6102 • Completed Oct 14, 2025</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">$850.00</p>
                      <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded mt-1 inline-block">PAID</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-3">
                    <div className="flex gap-6 mb-3 text-sm text-gray-600 border-b border-gray-200 pb-3">
                      <span className="flex items-center gap-1.5"><Clock size={16} className="text-gray-400"/> 10:00 AM - 12:30 PM</span>
                      <span className="flex items-center gap-1.5"><Navigation size={16} className="text-gray-400"/> Tech: Dave (Truck 2)</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>Tech Notes:</strong> Installed Tesla Wall Connector in attached garage. Pulled 60A circuit from main panel in basement (about 40ft of MC cable). Commissioned charger on customer&apos;s Wi-Fi. Warned customer that main panel is old FPE and should be upgraded soon.
                    </p>
                  </div>
                </div>

                {/* Timeline Item 3 */}
                <div className="relative pl-8">
                  <div className="absolute w-6 h-6 bg-blue-500 rounded-full -left-[13px] border-4 border-white flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Emergency: Tripped Breaker</h3>
                      <p className="text-sm text-gray-500 font-medium">Ticket #5091 • Completed Jan 2, 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">$250.00</p>
                      <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded mt-1 inline-block">PAID</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}