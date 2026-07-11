const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'projects', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const importReplacement = `import { Search, MapPin, Phone, FolderOpen, AlertCircle, PlusCircle, ChevronRight, User, Plus, X } from "lucide-react";`;
content = content.replace(/import { Search[\s\S]*?} from "lucide-react";/, importReplacement);

const stateAdditions = `
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ first_name: "", last_name: "", phone_number: "", email: "", address: "" });
  const [creating, setCreating] = useState(false);
`;

content = content.replace(/const \[q, setQ\] = useState\(""\);/, `const [q, setQ] = useState("");\n${stateAdditions}`);

const headerReplacement = `<div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Customer Archive</h1>
          <p className="text-gray-500 mt-2">Full history, site notes, and lifetime value for every customer.</p>
        </div>
        <div className="flex gap-3 items-center">
          <button 
            onClick={() => setShowNewModal(true)} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            <Plus size={16} /> New Customer
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search name, phone, address..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black w-48 md:w-72"
            />
          </div>
        </div>
      </div>`;

content = content.replace(/<div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4 mb-6">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, headerReplacement);


const modalHTML = `
      {/* New Customer Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-gray-900">New Customer</h2>
              <button onClick={() => setShowNewModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4 text-left">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">First Name</label>
                  <input value={newCustomer.first_name} onChange={e => setNewCustomer(p => ({...p, first_name: e.target.value}))} placeholder="John" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Name</label>
                  <input value={newCustomer.last_name} onChange={e => setNewCustomer(p => ({...p, last_name: e.target.value}))} placeholder="Doe" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone Number</label>
                <input value={newCustomer.phone_number} onChange={e => setNewCustomer(p => ({...p, phone_number: e.target.value}))} placeholder="(555) 555-5555" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</label>
                <input value={newCustomer.address} onChange={e => setNewCustomer(p => ({...p, address: e.target.value}))} placeholder="123 Main St..." className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div className="p-5 border-t flex gap-3">
              <button onClick={() => setShowNewModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button
                disabled={!newCustomer.first_name.trim() || creating}
                onClick={async () => {
                  setCreating(true);
                  try {
                    const res = await fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newCustomer) });
                    const json = await res.json();
                    if (json.customer) {
                      setCustomers(prev => [json.customer, ...prev]);
                      setShowNewModal(false);
                      setNewCustomer({ first_name: "", last_name: "", phone_number: "", email: "", address: "" });
                    }
                  } catch(e) { console.error(e); } finally { setCreating(false); }
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-bold disabled:opacity-50"
              >
                {creating ? "Saving..." : "Add Customer"}
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(/<div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col h-\[calc\(100dvh-3\.5rem\)\] md:h-\[calc\(100vh-2rem\)\]">/, `<div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-2rem)]">\n${modalHTML}`);


fs.writeFileSync(filePath, content);
console.log("Patched successfully");
