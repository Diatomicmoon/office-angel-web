"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Phone, Users, Calendar, Settings, Mic, Archive, Smartphone, Share2, Inbox, DollarSign, Briefcase, FileText, Map, Truck, Clock, BarChart2, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function Sidebar() {
  const [role, setRole] = useState<string | null>(null); // null = still fetching
  const [companyName, setCompanyName] = useState<string>('Hard Hat Solutions');

  useEffect(() => {
    async function fetchRole() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );
        const { data: userRes } = await supabase.auth.getUser();
        if (!userRes?.user) { setRole('unknown'); return; }

        let foundRole: string | null = null;
        let foundCompany: string | null = null;

        const { data: memData } = await supabase
          .from('company_memberships')
          .select('role, company_id')
          .eq('user_id', userRes.user.id)
          .limit(1);

        if (memData && memData.length > 0) {
          foundRole = memData[0].role;
          foundCompany = memData[0].company_id;
        }

        if (!foundRole) {
          const { data: profData } = await supabase
            .from('profiles')
            .select('role, company_id')
            .eq('id', userRes.user.id)
            .limit(1);
          if (profData && profData.length > 0) {
            foundRole = profData[0].role;
            foundCompany = profData[0].company_id;
          }
        }

        setRole(foundRole || 'unknown');

        if (foundCompany) {
          const { data: comp } = await supabase
            .from('companies')
            .select('name')
            .eq('id', foundCompany)
            .single();
          if (comp?.name) setCompanyName(comp.name);
        }
      } catch (err) {
        console.error('Sidebar role fetch failed:', err);
        setRole('unknown');
      }
    }
    fetchRole();
  }, []);

  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const itemClass = (href: string) => {
    const active = pathname === href || pathname.startsWith(href + '/');
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${active ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`;
  };

  const safeRole = (role || '').toLowerCase();
  // Safe default: if we don't explicitly know you are an owner/admin, you get restricted.
  const isOwnerOrAdmin = ['owner', 'admin'].includes(safeRole);
  const isSales = safeRole === 'sales';
  const isFieldRep = ['field_rep', 'tech', 'apprentice'].includes(safeRole);
  
  // If you aren't an owner/admin, you are restricted by default.
  const isRestricted = !isOwnerOrAdmin;

  return (
    <div className="w-64 shrink-0 bg-gray-900 text-white flex flex-col h-[100dvh] md:h-screen md:sticky md:top-0">
      <div className="p-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <img src="/logo_square.jpg" alt="Hard Hat Solutions" className="h-8 w-8 shrink-0 object-contain rounded-md" />
          {companyName}
        </h1>
        <p className="text-gray-400 text-xs mt-2">Powered by Hard Hat Solutions</p>
      </div>

      {/* While role is still loading, show nothing to prevent flash */}
      {role === null ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <nav className="flex-1 overflow-y-auto px-4 space-y-2 mt-4 pb-4">
            <Link href="/dashboard" className={itemClass('/dashboard')}>
              <Home size={20} /><span>Dashboard</span>
            </Link>
            {!isRestricted && (
              <Link href="/call-logs" className={itemClass('/call-logs')}>
                <Phone size={20} /><span>Call Logs</span>
              </Link>
            )}
            {!isRestricted && (
              <Link href="/co-pilot" className={itemClass('/co-pilot')}>
                <Mic size={20} />
                <span className="flex items-center gap-2">
                  Co-Pilot Mode
                  <span className="bg-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Beta</span>
                </span>
              </Link>
            )}
            {!isRestricted && (
              <Link href="/crm" className={itemClass('/crm')}>
                <Users size={20} /><span>Leads & CRM</span>
              </Link>
            )}
            <Link href="/canvassing" className={itemClass('/canvassing')}>
              <Map size={20} /><span>Door-to-Door CRM</span>
            </Link>
            {!isRestricted && (
              <Link href="/projects" className={itemClass('/projects')}>
                <Archive size={20} /><span>Customers</span>
              </Link>
            )}
            {!isRestricted && (
              <Link href="/jobs" className={itemClass('/jobs')}>
                <Briefcase size={20} /><span>Job Archive</span>
              </Link>
            )}
            {!isRestricted && !isSales && (
              <Link href="/timesheets" className={itemClass('/timesheets')}>
                <Clock size={20} /><span>Timesheets & Payroll</span>
              </Link>
            )}
            {!isRestricted && (
              <Link href="/dispatch" className={itemClass('/dispatch')}>
                <Calendar size={20} /><span>Dispatch</span>
              </Link>
            )}
            {!isRestricted && (
              <Link href="/scheduling-inbox" className={itemClass('/scheduling-inbox')}>
                <Inbox size={20} /><span>Scheduling Inbox</span>
              </Link>
            )}
            {!isRestricted && (
              <Link href="/permits" className={itemClass('/permits')}>
                <FileText size={20} /><span>Permits & Inspections</span>
              </Link>
            )}
            {!isRestricted && !isSales && (
              <Link href="/pricing" className={itemClass('/pricing')}>
                <DollarSign size={20} /><span>Material Cost Engine</span>
              </Link>
            )}
            {!isRestricted && (
              <Link href="/inbox" className={itemClass('/inbox')}>
                <Inbox size={20} /><span>AI Inbox & Docs</span>
              </Link>
            )}
            <Link href="/field-app" className={itemClass('/field-app')}>
              <Smartphone size={20} /><span>Field App (Techs)</span>
            </Link>
            {!isRestricted && (
              <Link href="/marketing" className={itemClass('/marketing')}>
                <Share2 size={20} /><span>SEO & Marketing</span>
              </Link>
            )}
            {!isRestricted && !isSales && (
              <Link href="/receipts" className={itemClass('/receipts')}>
                <FileText size={20} /><span>Receipt Inbox</span>
              </Link>
            )}
            {!isRestricted && !isSales && (
              <Link href="/supply-runner" className={itemClass('/supply-runner')}>
                <Truck size={20} /><span>Supply Runner</span>
              </Link>
            )}
            {!isRestricted && !isSales && (
              <Link href="/financials" className={itemClass('/financials')}>
                <DollarSign size={20} /><span>Financial Command</span>
              </Link>
            )}
            {!isRestricted && !isSales && (
              <Link href="/weekly-recap" className={itemClass('/weekly-recap')}>
                <BarChart2 size={20} /><span>Weekly Recap</span>
              </Link>
            )}
          </nav>

          <div className="p-4 pb-12 md:pb-4 border-t border-gray-800 space-y-2">
            {!isRestricted && !isSales && (
              <Link href="/settings" className={itemClass('/settings')}>
                <Settings size={20} /><span>Settings</span>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-gray-400 hover:text-white hover:bg-gray-800/50"
            >
              <LogOut size={20} /><span>Log Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
