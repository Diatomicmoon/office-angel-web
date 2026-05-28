"use client";

import { useState, useEffect } from "react";
import { Truck, Search, Plus, Trash2, Send, Save, Package, Settings, FileText, CheckCircle2 } from "lucide-react";

type MaterialItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  notes: string;
};

type PresetKit = {
  id: string;
  name: string;
  items: Omit<MaterialItem, 'id'>[];
};

const DEFAULT_KITS: PresetKit[] = [
  {
    id: "kit-1",
    name: "200A Overhead Service",
    items: [
      { name: "200A Meter Socket (Milbank)", quantity: 1, unit: "ea", notes: "" },
      { name: "200A 40-Space Panel (Square D QO)", quantity: 1, unit: "ea", notes: "With main breaker" },
      { name: "2\" Rigid Conduit", quantity: 10, unit: "ft", notes: "For mast" },
      { name: "2\" Weatherhead", quantity: 1, unit: "ea", notes: "" },
      { name: "4/0 SE Cable", quantity: 25, unit: "ft", notes: "Aluminum" },
      { name: "Ground Rods (5/8\" x 8')", quantity: 2, unit: "ea", notes: "Copper clad" },
      { name: "#6 Bare Solid Copper", quantity: 20, unit: "ft", notes: "Grounding wire" }
    ]
  },
  {
    id: "kit-2",
    name: "EV Charger Install (Tesla)",
    items: [
      { name: "Tesla Wall Connector (Gen 3)", quantity: 1, unit: "ea", notes: "" },
      { name: "60A 2-Pole Breaker", quantity: 1, unit: "ea", notes: "Match existing panel brand" },
      { name: "6/2 NM-B (Romex)", quantity: 50, unit: "ft", notes: "" },
      { name: "3/4\" PVC Conduit", quantity: 20, unit: "ft", notes: "If exterior run needed" },
      { name: "3/4\" PVC Fittings (LB, MA)", quantity: 4, unit: "ea", notes: "" }
    ]
  }
];

export default function SupplyRunnerPage() {
  const [items, setItems] = useState<MaterialItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [supplierEmail, setSupplierEmail] = useState("orders@ced-twincities.com");
  const [sent, setSent] = useState(false);
  const [kits, setKits] = useState<PresetKit[]>(DEFAULT_KITS);

  // Load from local storage for demo persistence
  useEffect(() => {
    const saved = localStorage.getItem("supplyRunnerItems");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  const saveToStorage = (newItems: MaterialItem[]) => {
    setItems(newItems);
    localStorage.setItem("supplyRunnerItems", JSON.stringify(newItems));
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    const newItem: MaterialItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItemName,
      quantity: newItemQty,
      unit: "ea",
      notes: ""
    };
    saveToStorage([...items, newItem]);
    setNewItemName("");
    setNewItemQty(1);
  };

  const removeItem = (id: string) => {
    saveToStorage(items.filter(item => item.id !== id));
  };

  const updateItemQty = (id: string, qty: number) => {
    saveToStorage(items.map(item => item.id === id ? { ...item, quantity: Math.max(1, qty) } : item));
  };

  const loadKit = (kit: PresetKit) => {
    const newItems = kit.items.map(item => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9)
    }));
    saveToStorage([...items, ...newItems]);
  };

  const sendOrder = () => {
    setSent(true);
    // In a real app, this hits an API to send SendGrid/Resend email.
    // For now we simulate success and open mailto as fallback.
    const body = items.map(i => `${i.quantity} ${i.unit} - ${i.name} ${i.notes ? '('+i.notes+')' : ''}`).join('%0D%0A');
    window.location.href = `mailto:${supplierEmail}?subject=Material Order - Hardhat Holdings LLC&body=Please prep the following order for Will Call:%0D%0A%0D%0A${body}%0D%0A%0D%0AThank you,%0D%0AOffice Angel Automations`;
    
    setTimeout(() => {
      setItems([]);
      localStorage.removeItem("supplyRunnerItems");
      setSent(false);
    }, 3000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-2rem)] overflow-y-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Truck className="text-blue-600 h-8 w-8" />
            Supply Runner
          </h1>
          <p className="text-muted-foreground mt-2">
            Build material lists, load preset kits, and auto-dispatch POs to your wholesale house.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white border rounded-lg px-4 py-2 shadow-sm">
          <FileText className="text-gray-400 h-5 w-5" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium uppercase">Active Supplier</span>
            <input 
              type="email" 
              value={supplierEmail} 
              onChange={e => setSupplierEmail(e.target.value)}
              className="text-sm font-semibold border-none focus:ring-0 p-0 h-5 w-48"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Kit Presets */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-purple-600" />
              Material Kits
            </h2>
            <p className="text-sm text-gray-500 mb-4">Quick-load standard job materials into your cart to avoid re-typing.</p>
            
            <div className="space-y-3">
              {kits.map((kit) => (
                <div key={kit.id} className="border border-gray-100 rounded-lg p-3 hover:border-purple-200 hover:bg-purple-50 transition-colors group cursor-pointer" onClick={() => loadKit(kit)}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">{kit.name}</span>
                    <button className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">{kit.items.length} items</span>
                </div>
              ))}
            </div>
            
            <button className="mt-4 w-full border border-dashed border-gray-300 text-gray-500 rounded-lg py-2 text-sm font-medium hover:bg-gray-50 hover:text-gray-700 transition-colors">
              + Create New Preset Kit
            </button>
          </div>
        </div>

        {/* Right Column: Current List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Current Pull List</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
                {items.length} Items
              </span>
            </div>
            
            <div className="p-5 border-b">
              <form onSubmit={e => { e.preventDefault(); addItem(); }} className="flex gap-3">
                <input 
                  type="number" 
                  min="1" 
                  value={newItemQty} 
                  onChange={e => setNewItemQty(parseInt(e.target.value) || 1)}
                  className="w-20 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input 
                  type="text" 
                  placeholder="e.g. 500ft spool 12/2 Romex" 
                  value={newItemName} 
                  onChange={e => setNewItemName(e.target.value)}
                  className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  disabled={!newItemName.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                  <Search className="h-12 w-12 text-gray-200" />
                  <p>Your pull list is empty.</p>
                  <p className="text-sm">Add items above or load a Material Kit.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 bg-white border rounded-md">
                          <button onClick={() => updateItemQty(item.id, item.quantity - 1)} className="px-2 py-1 text-gray-500 hover:bg-gray-100">-</button>
                          <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                          <button onClick={() => updateItemQty(item.id, item.quantity + 1)} className="px-2 py-1 text-gray-500 hover:bg-gray-100">+</button>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.notes && <p className="text-xs text-gray-500">{item.notes}</p>}
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-5 border-t bg-gray-50">
              <button 
                onClick={sendOrder}
                disabled={items.length === 0 || sent}
                className={`w-full py-3 rounded-lg font-bold text-lg flex justify-center items-center gap-2 transition-all shadow-sm
                  ${sent 
                    ? 'bg-green-500 text-white' 
                    : items.length > 0 
                      ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {sent ? (
                  <>
                    <CheckCircle2 className="h-6 w-6" />
                    Order Sent to Supplier!
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Email PO to Wholesale
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
