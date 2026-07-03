"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, Settings, Mic, Smartphone, Share2, Inbox, DollarSign, Briefcase, FileText, Map, Truck, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function Sidebar() {
  const [role, setRole] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('Hard Hat Solutions');
  const [tier, setTier] = useState<number>(1);

  useEffect(() => {
    async function fetchRole() {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) { setRole('unknown'); return; }
        const data = await res.json();
        setRole(data.role || 'unknown');
        if (data.companyName) setCompanyName(data.companyName);
        if (data.tier) setTier(data.tier);
      } catch (err) {
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
    return `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium ${active ? 'text-white bg-gray-800 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}`;
  };

  const sectionLabel = (text: string) => (
    <div className="px-4 pt-4 pb-1 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
      {text}
    </div>
  );

  const safeRole = (role || '').toLowerCase();
  const isOwnerOrAdmin = ['owner', 'admin'].includes(safeRole);
  const isSales = safeRole === 'sales';
  const isFieldRep = ['field_rep', 'tech', 'apprentice'].includes(safeRole);
  const isRestricted = !isOwnerOrAdmin;

  return (
    <div className="w-64 shrink-0 bg-gray-900 text-white flex flex-col h-[100dvh] md:h-screen md:sticky md:top-0 shadow-xl z-10">
      <div className="p-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <img src="/logo_square.jpg" alt="Hard Hat Solutions" className="h-8 w-8 shrink-0 object-contain rounded-md" />
          {companyName}
        </h1>
        <div className="flex items-center justify-between mt-2">
          {tier > 1 ? (
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded text-white tracking-wider border border-blue-400/30 shadow-[0_0_10px_rgba(59,130,246,0.5)]">
              AI TIER {tier} ACTIVE
            </span>
          ) : (
            <span className="bg-gray-800 text-[10px] font-bold px-2 py-0.5 rounded text-gray-300 tracking-wider border border-gray-700">
              BASIC TIER 1
            </span>
          )}
          <Link href="/select-company" className="text-[10px] text-gray-400 hover:text-white underline">Switch</Link>
        </div>
      </div>

      {role === null ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pt-2 pb-6 space-y-1 custom-scrollbar min-h-0">
            
            <Link href="/dashboard" className={itemClass('/dashboard')}>
              <Home size={18} /><span>Dashboard</span>
            </Link>

            {/* COMMUNICATIONS */}
            {!isRestricted && tier > 1 && sectionLabel('AI Communications')}
            {!isRestricted && tier > 1 && (
              <Link href="/co-pilot" className={itemClass('/co-pilot')}>
                <Mic size={18} />
                <span className="flex items-center justify-between w-full">
                  AI Co-Pilot
                  <span className="bg-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded text-white shadow-[0_0_8px_rgba(59,130,246,0.6)]">ACTIVE</span>
                </span>
              </Link>
            )}
            {!isRestricted && tier > 1 && (
              <Link href="/inbox" className={itemClass('/inbox')}>
                <Inbox size={18} /><span>AI Voice Inbox</span>
              </Link>
            )}

            {/* SALES & CRM */}
            {sectionLabel('Sales & CRM')}
            {!isRestricted && (
              <Link href="/crm" className={itemClass('/crm')}>
                <Users size={18} /><span>Lead Pipeline</span>
              </Link>
            )}
            <Link href="/canvassing" className={itemClass('/canvassing')}>
              <Map size={18} /><span>D2D Canvassing</span>
            </Link>
            {!isRestricted && (
              <Link href="/projects" className={itemClass('/projects')}>
                <Briefcase size={18} /><span>Customers & Jobs</span>
              </Link>
            )}

            {/* OPERATIONS */}
            {!isRestricted && sectionLabel('Operations')}
            {!isRestricted && (
              <Link href="/dispatch" className={itemClass('/dispatch')}>
                <Calendar size={18} /><span>Schedule & Dispatch</span>
              </Link>
            )}
            {!isRestricted && (
              <Link href="/permits" className={itemClass('/permits')}>
                <FileText size={18} /><span>Permits & Docs</span>
              </Link>
            )}

            {/* FIELD WORK */}
            {sectionLabel('Field Work')}
            <Link href="/field-app" className={itemClass('/field-app')}>
              <Smartphone size={18} /><span>Mobile App</span>
            </Link>
            {!isRestricted && !isSales && (
              <Link href="/supply-runner" className={itemClass('/supply-runner')}>
                <Truck size={18} /><span>Supply Runner</span>
              </Link>
            )}

            {/* FINANCIALS */}
            {!isRestricted && !isSales && sectionLabel('Financials')}
            {!isRestricted && !isSales && (
              <Link href="/financials" className={itemClass('/financials')}>
                <DollarSign size={18} /><span>Financial Command</span>
              </Link>
            )}
            {!isRestricted && (
              <Link href="/marketing" className={itemClass('/marketing')}>
                <Share2 size={18} /><span>Marketing ROI</span>
              </Link>
            )}
            
          </nav>

          <div className="p-4 pb-12 md:pb-4 bg-gray-900 border-t border-gray-800 space-y-1">
            {!isRestricted && !isSales && (
              <Link href="/settings" className={itemClass('/settings')}>
                <Settings size={18} /><span>Settings</span>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800/50"
            >
              <LogOut size={18} /><span>Log Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
