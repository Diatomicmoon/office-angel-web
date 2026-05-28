"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { FileText, MapPin, Building, Search, DollarSign, Calendar, Filter } from "lucide-react";

export default function PermitsPage() {
  const [permits, setPermits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPermits() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Get the current company ID from local storage or context if possible, 
      // otherwise fetch all for now in this demo view
      const { data, error } = await supabase
        .from('permits')
        .select(`
          *,
          jobs ( title )
        `)
        .order('created_at', { ascending: false });

      if (data) setPermits(data);
      setLoading(false);
    }
    fetchPermits();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Permits & Inspections</h1>
          <p className="text-gray-500">Auto-extracted from AHJ and city inspector emails.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search permits..." 
              className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 text-gray-700">
            <Filter size={18} />
            Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Active</p>
            <p className="text-3xl font-bold mt-1">{permits.filter(p => p.status === 'Active').length}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <FileText size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Fees (YTD)</p>
            <p className="text-3xl font-bold mt-1">
              ${permits.reduce((sum, p) => sum + (Number(p.fee_amount) || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
            </p>
          </div>
          <div className="bg-red-100 p-3 rounded-lg text-red-600">
            <DollarSign size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Ready for Inspection</p>
            <p className="text-3xl font-bold mt-1">0</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
            <Building size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading permits...</div>
        ) : permits.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <FileText className="text-gray-300 w-16 h-16 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No permits found</h3>
            <p className="text-gray-500 mt-2 max-w-md">
              Forward your city permit approval emails to your AI Inbox address, and they will automatically appear here with the fee amounts extracted.
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Permit #</th>
                <th className="px-6 py-4 font-semibold text-gray-600">City / AHJ</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Job Address</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Issue Date</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-right">Fee</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {permits.map(permit => (
                <tr key={permit.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium">{permit.permit_number || 'Pending'}</span>
                    {permit.permit_type && (
                      <div className="text-xs text-gray-500 mt-1">{permit.permit_type}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <Building size={16} className="text-gray-400" />
                    {permit.municipality || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-gray-400 mt-0.5" />
                      <div>
                        {permit.jobs?.title && (
                          <div className="text-xs text-blue-600 mt-1">Job: {permit.jobs.title}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(permit.created_at).toLocaleDateString() || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {permit.fee_amount ? `$${Number(permit.fee_amount).toFixed(2)}` : '--'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      permit.status === 'Closed' ? 'bg-gray-100 text-gray-700' :
                      permit.status === 'Failed' ? 'bg-red-100 text-red-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {permit.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
