"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Phone, Users, Calendar, Settings, Activity, Mic, Archive, Smartphone, Share2, Inbox, DollarSign, Briefcase, FileText, Map, Truck, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function Sidebar() {
  const [role, setRole] = useState<string>('owner');
  
  useEffect(() => {
    async function fetchRole() {
      try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
        const { data: userRes } = await supabase.auth.getUser();
        if (userRes?.user) {
          const { data } = await supabase.from('company_memberships').select('role').eq('user_id', userRes.user.id).limit(1);
          if (data && data.length > 0) {
            setRole(data[0].role);
          }
        }
      } catch (err) {
        console.error("Failed to fetch role", err);
      }
    }
    fetchRole();
  }, []);
  
  const isFieldRep = role === 'field_rep';

  const pathname = usePathname();
  const itemClass = (href: string) => {
    const active = pathname === href;
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${active ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`;
  };

  return (
    <div className="w-64 shrink-0 bg-gray-900 text-white flex flex-col h-screen md:sticky md:top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Activity className="text-blue-500" />
          Hard Hat Solutions
        </h1>
        <p className="text-gray-400 text-xs mt-1">Hardhat Holdings LLC</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-2 mt-4 pb-4">
        {!isFieldRep && (
          <Link href="/dashboard" className={itemClass('/dashboard')}>
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
        )}
        {!isFieldRep && (
          <Link href="/call-logs" className={itemClass('/call-logs')}>
            <Phone size={20} />
            <span>Call Logs</span>
          </Link>
        )}
        {!isFieldRep && (
          <Link href="/co-pilot" className={itemClass('/co-pilot')}>
            <Mic size={20} />
            <span className="flex items-center gap-2">
              Co-Pilot Mode 
              <span className="bg-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Beta</span>
            </span>
          </Link>
        )}
        {!isFieldRep && (
          <Link href="/crm" className={itemClass('/crm')}>
            <Users size={20} />
            <span>Leads & CRM</span>
          </Link>
        )}
        <Link href="/canvassing" className={itemClass('/canvassing')}>
          <Map size={20} />
          <span>Door-to-Door CRM</span>
        </Link>
        {!isFieldRep && (
          <Link href="/projects" className={itemClass('/projects')}>
            <Archive size={20} />
            <span>Customers</span>
          </Link>
        )}
        {!isFieldRep && (
          <Link href="/jobs" className={itemClass('/jobs')}>
            <Briefcase size={20} />
            <span>Job Archive</span>
          </Link>
        )}
        <Link href="/timesheets" className={itemClass('/timesheets')}>
          <Clock size={20} />
          <span>Timesheets & Payroll</span>
        </Link>
        {!isFieldRep && (
          <Link href="/dispatch" className={itemClass('/dispatch')}>
            <Calendar size={20} />
            <span>Dispatch</span>
          </Link>
        )}
        {!isFieldRep && (
          <Link href="/scheduling-inbox" className={itemClass('/scheduling-inbox')}>
            <Inbox size={20} />
            <span>Scheduling Inbox</span>
          </Link>
        )}
        {!isFieldRep && (
          <Link href="/permits" className={itemClass('/permits')}>
            <FileText size={20} />
            <span>Permits & Inspections</span>
          </Link>
        )}
        {!isFieldRep && (
          <Link href="/pricing" className={itemClass('/pricing')}>
            <DollarSign size={20} />
            <span>Material Cost Engine</span>
          </Link>
        )}
        {!isFieldRep && (
          <Link href="/inbox" className={itemClass('/inbox')}>
            <Inbox size={20} />
            <span>AI Inbox & Docs</span>
          </Link>
        )}
        <Link href="/field-app" className={itemClass('/field-app')}>
          <Smartphone size={20} />
          <span>Field App (Techs)</span>
        </Link>
        {!isFieldRep && (
          <Link href="/marketing" className={itemClass('/marketing')}>
            <Share2 size={20} />
            <span>SEO & Marketing</span>
          </Link>
        )}
        {!isFieldRep && (
          <Link href="/receipts" className={itemClass('/receipts')}>
            <FileText size={20} />
            <span>Receipt Inbox</span>
          </Link>
        )}
        {!isFieldRep && (
          <Link href="/supply-runner" className={itemClass('/supply-runner')}>
            <Truck size={20} />
            <span>Supply Runner</span>
          </Link>
        )}
        {!isFieldRep && (
          <Link href="/financials" className={itemClass('/financials')}>
            <DollarSign size={20} />
            <span>Financial Command</span>
          </Link>
        )}
      </nav>

      {!isFieldRep && (
        <div className="p-4 border-t border-gray-800">
          <Link href="/settings" className={itemClass('/settings')}>
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </div>
      )}
    </div>
  );
}
