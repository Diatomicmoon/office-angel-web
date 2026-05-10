import Link from 'next/link';
import { Home, Phone, Users, Calendar, Settings, Activity, Mic, Archive, Smartphone, Share2, Inbox, DollarSign, Briefcase } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-64 shrink-0 bg-gray-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Activity className="text-blue-500" />
          Office Angel
        </h1>
        <p className="text-gray-400 text-xs mt-1">Hardhat Holdings LLC</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-white bg-gray-800 rounded-lg transition-colors font-medium">
          <Home size={20} />
          <span>Dashboard</span>
        </Link>
        <Link href="/call-logs" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
          <Phone size={20} />
          <span>Call Logs</span>
        </Link>
        <Link href="/co-pilot" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Mic size={20} />
          <span className="flex items-center gap-2">
            Co-Pilot Mode 
            <span className="bg-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Beta</span>
          </span>
        </Link>
        <Link href="/crm" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Users size={20} />
          <span>Leads & CRM</span>
        </Link>
        <Link href="/projects" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Archive size={20} />
          <span>Customers</span>
        </Link>
        <Link href="/jobs" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Briefcase size={20} />
          <span>Job Archive</span>
        </Link>
        <Link href="/dispatch" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Calendar size={20} />
          <span>Dispatch</span>
        </Link>
        <Link href="/scheduling-inbox" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Inbox size={20} />
          <span>Scheduling Inbox</span>
        </Link>
        <Link href="/pricing" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <DollarSign size={20} />
          <span>Material Cost Engine</span>
        </Link>
        <Link href="/inbox" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors relative">
          <Inbox size={20} />
          <span>AI Inbox & Docs</span>
        </Link>
        <Link href="/field-app" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Smartphone size={20} />
          <span>Field App (Techs)</span>
        </Link>
        <Link href="/marketing" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Share2 size={20} />
          <span>SEO & Marketing</span>
        </Link>
        <Link href="/financials" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Activity size={20} />
          <span>Financials</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
}
