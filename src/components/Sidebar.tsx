"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, Settings, Mic, Smartphone, Share2, Inbox, DollarSign, Briefcase, FileText, Map, Truck, LogOut, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function Sidebar() {
  const [role, setRole] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('Hard Hat Solutions');
  const [tier, setTier] = useState<number>(1);
  const [isTrial, setIsTrial] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    async function fetchRole() {
      try {
        const res = await fetch('/api/me');
        if (!res.ok) { setRole('unknown'); return; }
        const data = await res.json();
        setRole(data.role || 'unknown');
        if (data.companyName) setCompanyName(data.companyName);
        if (data.tier) setTier(data.tier);
        if (data.isTrial) setIsTrial(data.isTrial);
        if (data.userEmail) setUserEmail(data.userEmail);
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

  // For 14-day Free Trial users, we hide heavy ops/financials to keep the "Aha!" moment clean
  const setDevTier = async (newTier: number | null) => {
    try {
      await fetch('/api/dev/set-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: newTier })
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const showHeavyFeatures = !isTrial && !isRestricted && !isSales;

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
          {/* Switch hidden for trial users */}
          {userEmail.toLowerCase().includes('jakob') && (
            <div className="relative group">
              <button className="text-xs text-gray-500 hover:text-white px-2 cursor-pointer ml-1">
                ⚙️ Dev Switch
              </button>
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-gray-800 border border-gray-700 rounded shadow-xl py-1 z-50">
                <button onClick={() => setDevTier(1)} className="block w-full text-left px-4 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-gray-700">Tier 1</button>
                <button onClick={() => setDevTier(2)} className="block w-full text-left px-4 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-gray-700">Tier 2</button>
                <button onClick={() => setDevTier(3)} className="block w-full text-left px-4 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-gray-700">Tier 3</button>
                <div className="border-t border-gray-700 my-1"></div>
                <button onClick={() => setDevTier(null)} className="block w-full text-left px-4 py-1.5 text-xs text-red-400 hover:bg-gray-700">Reset</button>
              </div>
            </div>
          )}
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
            {!isRestricted && tier > 1 && (
              <Link href="/chat" className={itemClass('/chat')}>
                <MessageSquare size={18} /><span>AI Employee Chat</span>
              </Link>
            )}

            {/* SALES & CRM */}
            {sectionLabel('Sales & CRM')}
            {(!isRestricted) && (
              <Link href="/crm" className={itemClass('/crm')}>
                <Users size={18} /><span>Lead Pipeline</span>
              </Link>
            )}
            <Link href="/canvassing" className={itemClass('/canvassing')}>
              <Map size={18} /><span>D2D Canvassing</span>
            </Link>
            {!isRestricted && (
              <Link href="/projects" className={itemClass('/projects')}>
                <Users size={18} /><span>Customer Archive</span>
              </Link>
            )}
            {!isRestricted && (
              <Link href="/jobs" className={itemClass('/jobs')}>
                <Briefcase size={18} /><span>{isTrial ? 'Jobs & Invoices' : 'Job Archive'}</span>
              </Link>
            )}

            {/* OPERATIONS */}
            {showHeavyFeatures && sectionLabel('Operations')}
            {showHeavyFeatures && (
              <Link href="/dispatch" className={itemClass('/dispatch')}>
                <Calendar size={18} /><span>Schedule & Dispatch</span>
              </Link>
            )}
            {showHeavyFeatures && (
              <Link href="/permits" className={itemClass('/permits')}>
                <FileText size={18} /><span>Permits & Docs</span>
              </Link>
            )}

            {/* FIELD WORK */}
            {sectionLabel('Field Work')}
            <Link href="/field-app" className={itemClass('/field-app')}>
              <Smartphone size={18} /><span>Mobile App</span>
            </Link>
            {showHeavyFeatures && (
              <Link href="/supply-runner" className={itemClass('/supply-runner')}>
                <Truck size={18} /><span>Supply Runner</span>
              </Link>
            )}

            {/* FINANCIALS */}
            {showHeavyFeatures && sectionLabel('Financials')}
            {showHeavyFeatures && (
              <Link href="/financials" className={itemClass('/financials')}>
                <DollarSign size={18} /><span>Financial Command</span>
              </Link>
            )}
            {showHeavyFeatures && (
              <Link href="/marketing" className={itemClass('/marketing')}>
                <Share2 size={18} /><span>Marketing ROI</span>
              </Link>
            )}
            
          </nav>

          <div className="p-4 pb-12 md:pb-4 bg-gray-900 border-t border-gray-800 space-y-1">
            {showHeavyFeatures && (
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
