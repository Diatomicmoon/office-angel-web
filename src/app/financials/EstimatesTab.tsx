"use client";
import { useState, useEffect, useCallback } from "react";
import { FileText, Plus, CheckCircle, Clock, AlertCircle, Search, Trash2, Sparkles, Send } from "lucide-react";
import { getCookie } from 'cookies-next';

export default function EstimatesTab() {
  const [view, setView] = useState<"list" | "create">("list");
  const [estimates, setEstimates] = useState<any[]>([]);

  const fetchEstimates = useCallback(async () => {
    try {
      const res = await fetch('/api/estimates');
      const json = await res.json();
      if (json.estimates) setEstimates(json.estimates);
    } catch (err) {
      console.error('Error fetching estimates:', err);
    }
  }, []);

  useEffect(() => {
    fetchEstimates();
  }, [fetchEstimates]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case "pending": return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3" /> Pending</span>;
      default: return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (view === "create") {
    return <EstimateBuilder onCancel={() => setView("list")} onSave={() => { setView("list"); fetchEstimates(); }} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Estimates</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            Draft proposals, send magic links, and get 1-tap approvals.
          </p>
        </div>
        <button 
          onClick={() => setView("create")}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700 transition shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create Estimate
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search estimates..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 pl-6">Est ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date Created</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {estimates.map((est, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition">
                  <td className="p-4 pl-6 font-medium text-gray-900">E-{est.id.substring(0, 8)}</td>
                  <td className="p-4 text-gray-600 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                      {est.customer_name?.charAt(0) || '?'}
                    </div>
                    {est.customer_name}
                  </td>
                  <td className="p-4 text-gray-500">{new Date(est.created_at).toLocaleDateString()}</td>
                  <td className="p-4 font-medium text-gray-900">${Number(est.amount).toFixed(2)}</td>
                  <td className="p-4">{getStatusBadge(est.status)}</td>
                  <td className="p-4 text-right pr-6">
                    <a href={`/portal/estimate/${est.id}`} target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline text-sm">
                      View Portal
                    </a>
                  </td>
                </tr>
              ))}
              {estimates.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No estimates found. Create one to get started!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EstimateBuilder({ onCancel, onSave }: { onCancel: () => void, onSave: () => void }) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [jobId, setJobId] = useState('');
  const [items, setItems] = useState<{ desc: string, qty: number | '', rate: number | '' }[]>([{ desc: '', qty: 1, rate: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicPrompt, setMagicPrompt] = useState('');
  const [magicLoading, setMagicLoading] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + ((Number(item.qty) || 0) * (Number(item.rate) || 0)), 0);
  const total = subtotal;

  const addItem = () => setItems([...items, { desc: '', qty: 1, rate: '' }]);

  const handleMagicWrite = async () => {
    if (!magicPrompt) return;
    setMagicLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/invoice-magic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: magicPrompt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate items');
      if (data.items && data.items.length > 0) {
        setItems(data.items);
        setMagicPrompt('');
      }
    } catch (err: any) {
      setError('AI could not generate estimate: ' + err.message);
    } finally {
      setMagicLoading(false);
    }
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, idx) => idx !== index));
    }
  };

  const updateItem = (index: number, field: keyof typeof items[0], value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleSaveDraft = async () => {
    setError(null);
    setLoading(true);

    const company_id = getCookie('oa_company_id');

    if (!company_id) {
      setError('Company ID not found. Please log in.');
      setLoading(false);
      return;
    }

    if (!customerName) {
      setError('Please provide a Customer Name.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/estimates/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          job_id: jobId.trim() || undefined,
          items,
          isDraft: true, // we tell backend not to send SMS
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to save draft');
        return;
      }

      onSave(); // go back to list
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEstimate = async () => {
    setError(null);
    setLoading(true);

    const company_id = getCookie('oa_company_id');

    if (!company_id) {
      setError('Company ID not found. Please log in.');
      setLoading(false);
      return;
    }

    if (!customerName) {
      setError('Please provide a Customer Name.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/estimates/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          job_id: jobId.trim() || undefined,
          items,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to create estimate');
        return;
      }

      alert(`Estimate created! Magic Link: ${result.magic_link}`);
      onSave();
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6 text-sm font-medium text-gray-500">
        <button onClick={onCancel} className="hover:text-gray-900">Estimates</button>
        <span>/</span>
        <span className="text-gray-900">Draft Proposal</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name / Company</label>
                  <input 
                    type="text" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. John Doe" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job ID (Optional, for Portal Link)</label>
                  <input 
                    type="text" 
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    placeholder="e.g. 550e8400-e29b-..." 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (For SMS Link)</label>
                  <input 
                    type="tel" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(555) 123-4567" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="john@example.com" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
             <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
               <div className="flex items-start gap-3">
                 <Sparkles className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                 <div className="flex-1">
                   <label className="block text-sm font-semibold text-indigo-900 mb-1">
                     Magic Write Estimate
                   </label>
                   <div className="flex flex-col sm:flex-row gap-2 mt-2">
                     <input 
                       type="text" 
                       value={magicPrompt}
                       onChange={(e) => setMagicPrompt(e.target.value)}
                       placeholder="e.g. Full panel upgrade, pulling permits, materials included. $2500" 
                       className="flex-1 px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                       onKeyDown={(e) => e.key === 'Enter' && handleMagicWrite()}
                     />
                     <button 
                       onClick={handleMagicWrite}
                       disabled={magicLoading || !magicPrompt}
                       className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 whitespace-nowrap"
                     >
                       {magicLoading ? 'Writing...' : 'Generate'}
                     </button>
                   </div>
                 </div>
               </div>
             </div>

            <div className="space-y-4 sm:space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start gap-3 bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border sm:border-none border-gray-100">
                  <div className="w-full sm:flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1 sm:hidden">Description</label>
                    <input 
                      type="text" 
                      placeholder="Description"
                      value={item.desc}
                      onChange={(e) => updateItem(idx, 'desc', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="w-full sm:w-24">
                    <label className="block text-xs font-medium text-gray-500 mb-1 sm:hidden">Qty</label>
                    <input 
                      type="number" 
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => updateItem(idx, 'qty', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="w-full sm:w-32 relative">
                    <label className="block text-xs font-medium text-gray-500 mb-1 sm:hidden">Rate</label>
                    <span className="absolute left-3 top-2 sm:top-2 text-gray-400 mt-5 sm:mt-0">$</span>
                    <input 
                      type="number" 
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) => updateItem(idx, 'rate', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="w-full sm:w-32 pt-2 text-right font-medium text-gray-900 flex justify-end items-center gap-2">
                    <span className="sm:hidden text-gray-500 font-normal mr-2">Amount:</span>
                    ${((Number(item.qty) || 0) * (Number(item.rate) || 0)).toFixed(2)}
                    {items.length > 1 && (
                      <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 ml-2 bg-red-50 hover:bg-red-100 p-1 rounded-md transition">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addItem} className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>
            <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="text-base font-bold text-gray-900">Total Estimate</span>
              <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
            </div>
          </div>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">{error}</div>}
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => {
                // We'll just call the same save logic but maybe mark it as draft
                // For now, let's just save it exactly the same without sending SMS
                const isDraft = true;
                handleSaveDraft();
              }}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save to Drafts'}
            </button>

            <button 
              onClick={handleSendEstimate}
              disabled={loading}
              className="w-full bg-[#3E70A1] text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[#2c537a] transition shadow-md disabled:opacity-50"
            >
              {loading ? 'Sending...' : <><Send className="w-4 h-4" /> Send to Client</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
