"use client";

import { BarChart3, TrendingUp, TrendingDown, Search, Filter, ShieldCheck, FileText, ArrowRight, Activity, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useState } from "react";

export default function PricingPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const materialData = [
    {
      id: 1,
      name: "12/2 NM-B Romex (250ft)",
      avgPrice: "$134.50",
      trend: "up",
      trendAmount: "+$4.20",
      suppliers: [
        { name: "Viking Electric", price: "$132.00", lastSeen: "Today" },
        { name: "Home Depot Pro", price: "$134.50", lastSeen: "2 days ago" },
        { name: "CED", price: "$137.00", lastSeen: "Last week" }
      ]
    },
    {
      id: 2,
      name: "Square D 200A 40-Space Panel (HOM)",
      avgPrice: "$189.00",
      trend: "stable",
      trendAmount: "$0.00",
      suppliers: [
        { name: "Home Depot Pro", price: "$189.00", lastSeen: "Today" },
        { name: "Menards", price: "$192.50", lastSeen: "3 days ago" },
        { name: "Viking Electric", price: "$188.50", lastSeen: "Last week" }
      ]
    },
    {
      id: 3,
      name: "3/4\" EMT Conduit (10ft)",
      avgPrice: "$7.45",
      trend: "down",
      trendAmount: "-$0.85",
      suppliers: [
        { name: "CED", price: "$6.90", lastSeen: "Yesterday" },
        { name: "Home Depot Pro", price: "$7.85", lastSeen: "4 days ago" },
        { name: "Viking Electric", price: "$7.60", lastSeen: "1 week ago" }
      ]
    },
    {
      id: 4,
      name: "20A Single Pole Breaker HOM",
      avgPrice: "$6.50",
      trend: "up",
      trendAmount: "+$0.25",
      suppliers: [
        { name: "Home Depot Pro", price: "$6.50", lastSeen: "Today" },
        { name: "Viking Electric", price: "$6.75", lastSeen: "2 weeks ago" }
      ]
    }
  ];

  const filteredMaterials = materialData.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col h-[calc(100vh-2rem)] overflow-y-auto space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Material Cost Engine</h1>
          <p className="text-gray-500 mt-2">Live wholesale price tracking powered by your ingested supply house receipts.</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <ShieldCheck size={18} /> OCR Price Sync Active
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Items Tracked</h3>
          <p className="text-3xl font-bold text-gray-900">1,482</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-gray-500">
            Across 4 local suppliers
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Largest Price Drop (30d)</h3>
          <p className="text-2xl font-bold text-gray-900 truncate">3/4" EMT Conduit</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-bold text-green-600">
            <TrendingDown size={14} /> Down 10.2%
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900 to-gray-900 p-6 rounded-xl border border-gray-800 shadow-sm text-white">
          <h3 className="text-sm font-medium text-indigo-200 mb-2">Estimated Monthly Savings</h3>
          <p className="text-3xl font-bold text-white">$420.50</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs font-medium text-indigo-100">
            <Activity size={14} /> By optimizing supplier purchasing
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col flex-1 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search materials (e.g., 'Romex', '200A Panel')" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <Filter size={16} /> Filter by Supplier
          </button>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4">Material Item</th>
                <th className="px-6 py-4">30-Day Trend</th>
                <th className="px-6 py-4 text-center">Best Local Price</th>
                <th className="px-6 py-4 text-center">Market Average</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMaterials.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <FileText size={12} /> Last spotted: {item.suppliers[0].lastSeen}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1.5 font-semibold ${
                      item.trend === 'up' ? 'text-red-600' : 
                      item.trend === 'down' ? 'text-green-600' : 
                      'text-gray-500'
                    }`}>
                      {item.trend === 'up' && <ArrowUpRight size={16} />}
                      {item.trend === 'down' && <ArrowDownRight size={16} />}
                      {item.trend === 'stable' && <TrendingUp size={16} className="text-gray-400" />}
                      {item.trendAmount}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-2 bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg">
                      <span className="font-black text-green-700">{item.suppliers.reduce((prev, curr) => (parseFloat(prev.price.replace('$', '')) < parseFloat(curr.price.replace('$', '')) ? prev : curr)).price}</span>
                      <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
                        {item.suppliers.reduce((prev, curr) => (parseFloat(prev.price.replace('$', '')) < parseFloat(curr.price.replace('$', '')) ? prev : curr)).name}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-gray-600">
                    {item.avgPrice}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 justify-end w-full">
                      View Receipts <ArrowRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No materials found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
          Prices are automatically extracted from your supply house invoices. Because wholesale pricing is private, Office Angel only uses your own verified receipts to generate these averages.
        </div>
      </div>
    </div>
  );
}