import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { RefreshCw, MapPin, HardHat, CalendarDays, Home, CheckCircle2, Search, CheckSquare } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function NewBuildsTab({ companyId: initialCompanyId, fixedMode }: { companyId?: string, fixedMode?: 'csv' | 'permits' | null }) {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | undefined>(initialCompanyId);
  
  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [showKnocked, setShowKnocked] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'csv' | 'permits'>(fixedMode || 'all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!companyId) {
      const fetchCompany = async () => {
        try {
          const fallbackCompanyId = "cd7a06ec-5292-4d9f-8713-5139f5823dfe";
          const { data, error } = await supabase.from('companies').select('id').limit(1);
          if (!isMounted) return;
          if (data && data.length > 0) {
            setCompanyId(data[0].id);
          } else {
            setCompanyId(fallbackCompanyId);
          }
        } catch (err) {
          if (isMounted) setLoading(false);
        }
      };
      fetchCompany();
    }
    return () => { isMounted = false; };
  }, [companyId]);

  useEffect(() => {
    if (companyId) fetchLeads();
  }, [companyId]);

  const fetchLeads = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('new_build_permits')
        .select('*')
        .eq('company_id', companyId)
        .order('permit_date', { ascending: false });

      if (data) setLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsKnocked = async (id: string) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from('new_build_permits')
      .update({ status: 'knocked' })
      .eq('id', id);
      
    if (!error) {
      setLeads(leads.map(l => l.id === id ? { ...l, status: 'knocked' } : l));
    }
    setUpdatingId(null);
  };

  const calculateTimeline = (permitDate: string, estimatedCompletion: string, lead: any) => {
    const today = new Date();
    const completion = new Date(estimatedCompletion);
    const statusLower = (lead?.status || '').toLowerCase();
    
    if (statusLower.includes('complete') || statusLower.includes('final') || today > completion) return { status: 'Completed / Move-in', color: 'bg-green-100 text-green-800' };
    if (statusLower.includes('rough')) return { status: 'Rough-Ins / Drywall', color: 'bg-blue-100 text-blue-800' };
    
    const start = new Date(permitDate);
    const totalDays = (completion.getTime() - start.getTime()) / (1000 * 3600 * 24);
    const daysPassed = (today.getTime() - start.getTime()) / (1000 * 3600 * 24);
    const progress = daysPassed / totalDays;

    if (progress < 0.2) return { status: 'Foundation / Framing', color: 'bg-yellow-100 text-yellow-800' };
    if (progress < 0.7) return { status: 'Rough-Ins / Drywall', color: 'bg-blue-100 text-blue-800' };
    return { status: 'Finishes / Pre-Close', color: 'bg-purple-100 text-purple-800' };
  };

  // Apply filters
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // 1. Filter by knocked status
      if (!showKnocked && lead.status === 'knocked') return false;
      
      // 2. Filter by Data Source Mode (CSV vs Active Permits)
      const isCountyRecord = lead.permit_date === '2026-01-01';
      if (viewMode === 'csv' && !isCountyRecord) return false;
      if (viewMode === 'permits' && isCountyRecord) return false;
      
      // 3. Filter by search query (address, city, zip)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const addressMatch = (lead.property_address || '').toLowerCase().includes(query);
        const cityMatch = (lead.city || '').toLowerCase().includes(query);
        const zipMatch = (lead.zip_code || '').toLowerCase().includes(query);
        const builderMatch = (lead.contractor_name || '').toLowerCase().includes(query);
        
        if (!addressMatch && !cityMatch && !zipMatch && !builderMatch) return false;
      }
      
      return true;
    });
  }, [leads, searchQuery, showKnocked, viewMode]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Construction Leads</h2>
          <p className="text-muted-foreground text-gray-500">
            Raw permit data and county tax records for new construction.
          </p>
        </div>
        <button 
          onClick={fetchLeads} 
          className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
        {/* Top row of filters: Data buckets */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${viewMode === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            All Leads
          </button>
          <button 
            onClick={() => setViewMode('permits')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${viewMode === 'permits' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
          >
            <CalendarDays className="h-4 w-4" />
            Active Scraped Permits (Live)
          </button>
          <button 
            onClick={() => setViewMode('csv')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${viewMode === 'csv' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
          >
            <HardHat className="h-4 w-4" />
            County CSV (Historical/Dirt Lots)
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-gray-100 pt-4 mt-2">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Filter by city, zip, address, or builder..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              checked={showKnocked}
              onChange={(e) => setShowKnocked(e.target.checked)}
            />
            Show completed (knocked)
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">Loading new builds...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            No new construction permits found matching your filters.
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const phase = calculateTimeline(lead.permit_date, lead.estimated_completion_date, lead);
            const isKnocked = lead.status === 'knocked';
            const isCountyRecord = lead.permit_date === '2026-01-01';
            
            return (
              <div key={lead.id} className={`overflow-hidden border rounded-xl shadow-sm transition-all ${isKnocked ? 'border-gray-200 bg-gray-50 opacity-70' : 'border-gray-200 bg-white'}`}>
                <div className={`p-4 border-b ${isKnocked ? 'border-gray-200 bg-gray-100' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <h3 className={`text-lg font-semibold flex items-start gap-2 ${isKnocked ? 'text-gray-600' : 'text-gray-900'}`}>
                        <Home className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{lead.property_address}</span>
                      </h3>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {lead.city}, {lead.state} {lead.zip_code}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <HardHat className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="font-medium text-gray-700">Builder:</span>
                      <span className="text-gray-900 truncate max-w-[120px]">{lead.contractor_name}</span>
                    </div>
                    {isCountyRecord ? (
                      <span className="text-[10px] font-bold tracking-wider uppercase text-green-700 bg-green-100 px-2 py-1 rounded-full">
                        County CSV
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold tracking-wider uppercase text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                        Live Permit
                      </span>
                    )}
                  </div>
                  
                  <div className={`grid grid-cols-2 gap-4 text-sm p-3 rounded-lg border ${isKnocked ? 'bg-gray-100 border-gray-200' : 'bg-gray-50 border-gray-100'}`}>
                    {isCountyRecord ? (
                      <>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Data Source</div>
                          <div className="font-medium text-gray-900">County Tax Record</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Year Built</div>
                          <div className="font-medium text-gray-900">{lead.notes?.match(/Year Built (\d+)/)?.[1] || 'Unknown'}</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Permit Issued</div>
                          <div className="font-medium text-gray-900">
                            {lead.permit_date ? new Date(lead.permit_date).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Permit Close / Est. Finish</div>
                          <div className="font-medium text-gray-900">
                            {lead.estimated_completion_date ? new Date(lead.estimated_completion_date).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 uppercase">Phase</span>
                      {isCountyRecord ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Completed Construction
                        </span>
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${phase.color}`}>
                          {phase.status}
                        </span>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => markAsKnocked(lead.id)}
                      disabled={isKnocked || updatingId === lead.id}
                      className={`w-full py-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                        isKnocked 
                          ? 'bg-green-100 text-green-700 cursor-default' 
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isKnocked ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Checked Off
                        </>
                      ) : (
                        <>
                          {updatingId === lead.id ? 'Updating...' : 'Mark as Visited'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
