"use client";

import { useState } from "react";
import { Search, Filter, FileText, MapPin, Calendar, Clock, DollarSign, CheckCircle2, AlertCircle, RefreshCcw, FolderOpen, Download, PlusCircle, Phone, Mail, Sparkles } from "lucide-react";

import Link from "next/link";

export default function JobArchive() {
  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Job Archive & Customer Profiles</h1>
          <p className="text-gray-500 mt-2">Permanent record of all jobs, customer contact info, and fast re-booking.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search address, email, or name..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black w-64"
            />
          </div>
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Filter size={18} /> Filters
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 overflow-hidden flex flex-col">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <div className="col-span-3">Customer & Contact Info</div>
          <div className="col-span-3">Location & Job Scope</div>
          <div className="col-span-2">Date & Tech</div>
          <div className="col-span-2">Financials</div>
          <div className="col-span-2 text-right">Quick Actions</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          
          {/* Row 1: Completed Job */}
          <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
            
            {/* Customer Info */}
            <div className="col-span-3 flex items-start gap-3">
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <FolderOpen size={20} className="text-gray-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">John Martinez</h4>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <Phone size={12} /> (763) 555-8822
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Mail size={12} /> john.martinez@email.com
                </p>
              </div>
            </div>
            
            {/* Location & Scope */}
            <div className="col-span-3">
              <p className="text-sm font-medium text-gray-900">200A Panel Upgrade</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <MapPin size={12} /> 8890 Maple Ln, Maple Grove, MN
              </p>
            </div>

            {/* Date & Tech */}
            <div className="col-span-2">
              <p className="text-sm text-gray-900">May 1, 2026</p>
              <p className="text-xs text-gray-500 mt-1">Tech: Mike (Truck 1)</p>
            </div>

            {/* Financials */}
            <div className="col-span-2">
              <p className="text-sm font-bold text-green-600">$2,850.00</p>
              <p className="text-[10px] font-bold text-green-700 bg-green-100 inline-block px-1.5 py-0.5 rounded mt-1">PAID</p>
            </div>

            {/* Actions */}
            <div className="col-span-2 flex flex-col items-end gap-2">
              <button className="text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 border border-blue-200" title="Create a new job ticket with this customer's info already filled out.">
                <PlusCircle size={14} /> New Job
              </button>
              <div className="flex items-center gap-3 text-right mt-1">
                <button className="text-gray-400 hover:text-blue-600 transition-colors" title="Restore old job to CRM">
                  <RefreshCcw size={16} />
                </button>
                <Link href="/projects/customer-profile" className="text-xs font-medium text-blue-600 hover:text-blue-800">
                  View Full Profile
                </Link>
              </div>
            </div>

          </div>

          {/* Row 3: Lost Bid / Follow Up Opportunity */}
          <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
            
            <div className="col-span-3 flex items-start gap-3">
              <div className="h-10 w-10 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <AlertCircle size={20} className="text-red-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Robert Vance</h4>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <Phone size={12} /> (952) 555-0912
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Mail size={12} /> r.vance.home@email.com
                </p>
              </div>
            </div>
            
            <div className="col-span-3">
              <p className="text-sm font-medium text-gray-900">Basement Remodel Rough-In</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <MapPin size={12} /> 4410 Highwood Dr, Minnetonka, MN
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-sm text-gray-900">Jan 12, 2026</p>
              <p className="text-xs text-gray-500 mt-1">Status: Ghosted</p>
            </div>

            <div className="col-span-2">
              <p className="text-sm font-bold text-gray-500 strike-through line-through">$4,200.00</p>
              <p className="text-[10px] font-bold text-red-700 bg-red-100 border border-red-200 inline-block px-1.5 py-0.5 rounded mt-1">LOST BID</p>
            </div>

            <div className="col-span-2 flex flex-col items-end gap-2">
              <button className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 border border-indigo-200 w-full justify-center" title="AI Drafts a 6-month check-in email">
                <Sparkles size={14} className="text-indigo-500" /> AI Follow-Up
              </button>
              <div className="flex items-center gap-3 text-right mt-1">
                <Link href="/projects/customer-profile" className="text-xs font-medium text-blue-600 hover:text-blue-800">
                  View Full Profile
                </Link>
              </div>
            </div>

          </div>
          <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
            
            <div className="col-span-3 flex items-start gap-3 opacity-80">
              <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <FolderOpen size={20} className="text-gray-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Sarah Jenkins</h4>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <Phone size={12} /> (612) 555-0199
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Mail size={12} /> s.jenkins@email.com
                </p>
              </div>
            </div>
            
            <div className="col-span-3 opacity-80">
              <p className="text-sm font-medium text-gray-900">EV Charger Install (Tesla)</p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <MapPin size={12} /> 1442 Grand Ave, St Paul, MN
              </p>
            </div>

            <div className="col-span-2 opacity-80">
              <p className="text-sm text-gray-900">April 28, 2026</p>
              <p className="text-xs text-gray-500 mt-1">Tech: Dave (Truck 2)</p>
            </div>

            <div className="col-span-2 opacity-80">
              <p className="text-sm font-bold text-gray-900">$850.00</p>
              <p className="text-[10px] font-bold text-gray-700 bg-gray-200 inline-block px-1.5 py-0.5 rounded mt-1">COMPLETED</p>
            </div>

            <div className="col-span-2 flex flex-col items-end gap-2">
              <button className="text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 border border-blue-200" title="Create a new job ticket with this customer's info already filled out.">
                <PlusCircle size={14} /> New Job
              </button>
              <div className="flex items-center gap-3 text-right mt-1">
                <button className="text-gray-400 hover:text-blue-600 transition-colors" title="Restore old job to CRM">
                  <RefreshCcw size={16} />
                </button>
                <Link href="/projects/customer-profile" className="text-xs font-medium text-blue-600 hover:text-blue-800">
                  View Full Profile
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}