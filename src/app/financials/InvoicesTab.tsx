"use client";
import { useState, useEffect, useCallback } from "react";
import { getCookie } from 'cookies-next';
  import { FileText, Plus, DollarSign, Send, CheckCircle, Clock, AlertCircle, Building2, User, Search, Download, Trash2, Sparkles } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function InvoicesTab() {
  const [view, setView] = useState<"list" | "create">("list");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalCollected: 0, outstanding: 0, overdue: 0 });
  const [isDevAccount, setIsDevAccount] = useState(false);

  useEffect(() => {
    fetch("/api/companies/mine")
      .then(res => res.json())
      .then(json => {
        const ids = json.companies?.map((c: any) => c.id) || [];
        const isDev = ids.includes("5341bfb2-8fce-4c7a-9a30-20e6aba60a8a") || ids.includes("a293eb4c-6a95-40b8-8324-bc493ec6b227");
        setIsDevAccount(isDev);
      })
      .catch(() => {});
  }, []);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch('/api/invoices');
      const json = await res.json();
      if (json.invoices) {
        setInvoices(json.invoices);
        const totalCollected = json.invoices.filter((inv: any) => inv.status === 'paid').reduce((sum: number, inv: any) => sum + Number(inv.amount || 0), 0);
        const outstanding = json.invoices.filter((inv: any) => inv.status === 'pending').reduce((sum: number, inv: any) => sum + Number(inv.amount || 0), 0);
        const overdue = json.invoices.filter((inv: any) => inv.status === 'overdue').reduce((sum: number, inv: any) => sum + Number(inv.amount || 0), 0);
        setStats({ totalCollected, outstanding, overdue });
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid": return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" /> Paid</span>;
      case "pending": return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3" /> Pending</span>;
      case "overdue": return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle className="w-3 h-3" /> Overdue</span>;
      default: return null;
    }
  };

  if (view === "create") {
    return <InvoiceBuilder onCancel={() => setView("list")} onSave={() => { setView("list"); fetchInvoices(); }} />;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Invoices</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            Manage billing, send payment links, and track income via Stripe.
          </p>
        </div>
        <button 
          onClick={() => setView("create")}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-gray-800 transition shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create Invoice
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 font-medium">Total Collected</h3>
            <div className="p-2 bg-green-50 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">${stats.totalCollected.toFixed(2)}</p>
          <p className="text-sm text-green-600 font-medium mt-2">+12% from last month</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 font-medium">Outstanding</h3>
            <div className="p-2 bg-yellow-50 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">${stats.outstanding.toFixed(2)}</p>
          <p className="text-sm text-gray-500 font-medium mt-2">4 invoices pending</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 font-medium">Overdue</h3>
            <div className="p-2 bg-red-50 rounded-lg"><AlertCircle className="w-5 h-5 text-red-600" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">${stats.overdue.toFixed(2)}</p>
          <p className="text-sm text-red-600 font-medium mt-2">Action required</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 pl-6">Invoice ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date Issued</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition">
                  <td className="p-4 pl-6 font-medium text-gray-900">{inv.id.substring(0, 8)}</td>
                  <td className="p-4 text-gray-600 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                      {inv.customer_name.charAt(0)}
                    </div>
                    {inv.customer_name}
                  </td>
                  <td className="p-4 text-gray-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="p-4 font-medium text-gray-900">${inv.amount.toFixed(2)}</td>
                  <td className="p-4">{getStatusBadge(inv.status)}</td>
                  <td className="p-4 text-right pr-6">
                    <button className="text-gray-400 hover:text-gray-900 p-1 transition">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InvoiceBuilder({ onCancel, onSave }: { onCancel: () => void, onSave: () => void }) {
  const [isDevAccount, setIsDevAccount] = useState(false);

  useEffect(() => {
    fetch("/api/companies/mine")
      .then(res => res.json())
      .then(json => {
        const ids = json.companies?.map((c: any) => c.id) || [];
        const isDev = ids.includes("5341bfb2-8fce-4c7a-9a30-20e6aba60a8a") || ids.includes("a293eb4c-6a95-40b8-8324-bc493ec6b227");
        setIsDevAccount(isDev);
      })
      .catch(() => {});
  }, []);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState<{ desc: string, qty: number | '', rate: number | '' }[]>([{ desc: '', qty: 1, rate: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicPrompt, setMagicPrompt] = useState('');
  const [magicLoading, setMagicLoading] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + ((Number(item.qty) || 0) * (Number(item.rate) || 0)), 0);
  const total = subtotal; // Tax removed for now, Stripe will handle it if needed

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
        setMagicPrompt(''); // clear after success
      }
    } catch (err: any) {
      console.error(err);
      setError('AI could not generate invoice: ' + err.message);
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

  const handleSendInvoice = async () => {
    setError(null);
    setLoading(true);

    const company_id = getCookie('oa_company_id');

    if (!company_id) {
      setError('Company ID not found. Please log in to a company.');
      setLoading(false);
      return;
    }

    if (!customerName) {
      setError('Please provide a Customer Name or Company.');
      setLoading(false);
      return;
    }
    
    if (!customerEmail) {
      setError('Customer Email is required to send the Stripe payment link.');
      setLoading(false);
      return;
    }

    if (items.some(item => !item.desc)) {
      setError('All invoice items must have a description.');
      setLoading(false);
      return;
    }

    if (items.some(item => Number(item.qty) <= 0 || Number(item.rate) <= 0)) {
      setError('All invoice items must have a valid quantity and rate greater than 0.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/stripe/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          items,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to create invoice');
        return;
      }

      if (result.stripe_session_url) {
        window.location.href = result.stripe_session_url; // Redirect to Stripe Checkout
      } else {
        alert(result.message || 'Invoice created successfully!');
        onSave(); // Go back to list view and refresh
      }
    } catch (err) {
      console.error('Error sending invoice:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6 text-sm font-medium text-gray-500">
        <button onClick={onCancel} className="hover:text-gray-900">Invoices</button>
        <span>/</span>
        <span className="text-gray-900">Create New</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Builder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Bill To
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name / Company</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. John Doe" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (for payment link)</label>
                  <input 
                    type="email" 
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="john@example.com" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                  <input 
                    type="tel" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(555) 123-4567" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                 <FileText className="w-5 h-5 text-blue-600" /> Line Items
               </h2>
             </div>

             {/* Magic AI Generator */}
             <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
               <div className="flex items-start gap-3">
                 <Sparkles className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                 <div className="flex-1">
                   <label className="block text-sm font-semibold text-indigo-900 mb-1">
                     Magic Write with AI
                   </label>
                   <p className="text-xs text-indigo-700 mb-3">
                     Type a rough description of the job and price. The AI will instantly generate professional line items for you.
                   </p>
                   <div className="flex gap-2">
                     <input 
                       type="text" 
                       value={magicPrompt}
                       onChange={(e) => setMagicPrompt(e.target.value)}
                       placeholder="e.g. Cleared lot, removed 3 stumps, hauled debris. $800 total" 
                       className="flex-1 px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                       onKeyDown={(e) => e.key === 'Enter' && handleMagicWrite()}
                     />
                     <button 
                       onClick={handleMagicWrite}
                       disabled={magicLoading || !magicPrompt}
                       className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
                     >
                       {magicLoading ? 'Writing...' : 'Generate'}
                     </button>
                   </div>
                 </div>
               </div>
             </div>
            
            <div className="grid grid-cols-12 gap-3 mb-2 px-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:grid">
              <div className="col-span-5">Description</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Rate</div>
              <div className="col-span-3 text-right pr-6">Amount</div>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-start gap-3">
                  <div className="w-full sm:flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1 sm:hidden">Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Spring Cleanup"
                      value={item.desc}
                      onChange={(e) => updateItem(idx, 'desc', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                    />
                  </div>
                  <div className="w-full sm:w-24">
                    <label className="block text-xs font-medium text-gray-500 mb-1 sm:hidden">Qty</label>
                    <input 
                      type="number" 
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => updateItem(idx, 'qty', e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
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
                      className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                    />
                  </div>
                  <div className="w-full sm:w-32 pt-2 sm:pt-2 text-right font-medium text-gray-900 flex items-center justify-end gap-2">
                    <span className="sm:hidden text-gray-500 font-normal mr-2">Amount:</span>
                    ${((Number(item.qty) || 0) * (Number(item.rate) || 0)).toFixed(2)}
                    {items.length > 1 ? (
                      <button 
                        onClick={() => removeItem(idx)}
                        className="text-red-400 hover:text-red-600 p-1 ml-2 transition bg-red-50 hover:bg-red-100 rounded-md"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="w-8"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={addItem}
              className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
        </div>

        {/* Right Side: Summary & Actions */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">Total Due</span>
                <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <button 
            onClick={handleSendInvoice}
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-800 transition shadow-md shadow-gray-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : (isDevAccount ? 'Send Invoice via Stripe' : 'Save Invoice')}
          </button>
          <p className="text-xs text-center text-gray-500">
            {isDevAccount ? 'A secure payment link will be emailed to the customer.' : 'This invoice will be saved for your records.'}
          </p>
        </div>

      </div>
    </div>
  );
}
