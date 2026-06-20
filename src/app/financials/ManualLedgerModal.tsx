import { useState } from "react";
import { X, DollarSign, User, FileText, Calendar, PlusCircle } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function ManualLedgerModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [client, setClient] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: userData } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();

    const { error } = await supabase.from('manual_transactions').insert({
      company_id: userData?.company_id || null,
      type,
      amount: parseFloat(amount),
      date,
      client_name: client,
      description
    });

    setLoading(false);
    if (!error) onSuccess();
    else alert("Error saving transaction.");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" /> Log Transaction
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button type="button" onClick={() => setType("income")} className={`flex-1 py-2 text-sm font-medium rounded-md transition \${type === 'income' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>
              Income
            </button>
            <button type="button" onClick={() => setType("expense")} className={`flex-1 py-2 text-sm font-medium rounded-md transition \${type === 'expense' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500'}`}>
              Expense
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input required type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name (Optional)</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input type="text" value={client} onChange={(e) => setClient(e.target.value)} placeholder="e.g. John Smith" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <input required type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Spring Cleanup" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition flex justify-center items-center">
            {loading ? "Saving..." : "Save Transaction"}
          </button>
        </form>
      </div>
    </div>
  );
}
