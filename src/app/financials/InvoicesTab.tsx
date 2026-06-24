"use client";
import { useState, useEffect, useCallback } from "react";
import { getCookie } from 'cookies-next';
import { FileText, Plus, DollarSign, Send, CheckCircle, Clock, AlertCircle, Building2, User, Search, Download } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function InvoicesTab() {
  const [view, setView] = useState<"list" | "create">("list");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalCollected: 0, outstanding: 0, overdue: 0 });
  
  const companyId = getCookie("oa_company_id");
  const isDevAccount = companyId === "5341bfb2-8fce-4c7a-9a30-20e6aba60a8a";
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchInvoices = useCallback(async () => {
    const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching invoices:', error);
    } else {
      setInvoices(data || []);
      const totalCollected = data.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
      const outstanding = data.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);
      const overdue = data.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);
      setStats({ totalCollected, outstanding, overdue });
    }
  }, [supabase]);

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
  const companyId = getCookie("oa_company_id");
  const isDevAccount = companyId === "5341bfb2-8fce-4c7a-9a30-20e6aba60a8a";
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState<{ desc: string, qty: number, rate: number }[]>([{ desc: '', qty: 1, rate: 0 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((acc, item) => acc + (item.qty * item.rate), 0);
  const total = subtotal; // Tax removed for now, Stripe will handle it if needed

  const addItem = () => setItems([...items, { desc: '', qty: 1, rate: 0 }]);

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

    if (!customerName || !customerEmail || items.some(item => !item.desc || item.qty <= 0 || item.rate <= 0)) {
      setError('Please fill in all customer details and ensure all invoice items have a description, quantity, and rate.');
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
             <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> Line Items
            </h2>
            
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="Description (e.g. Spring Cleanup)"
                      value={item.desc}
                      onChange={(e) => updateItem(idx, 'desc', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                    />
                  </div>
                  <div className="w-24">
                    <input 
                      type="number" 
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => updateItem(idx, 'qty', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                    />
                  </div>
                  <div className="w-32 relative">
                    <span className="absolute left-3 top-2 text-gray-400">$</span>
                    <input 
                      type="number" 
                      placeholder="Rate"
                      value={item.rate || ""}
                      onChange={(e) => updateItem(idx, 'rate', Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                    />
                  </div>
                  <div className="w-24 pt-2 text-right font-medium text-gray-900">
                    ${(item.qty * item.rate).toFixed(2)}
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
