"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, Users, CreditCard, PieChart, FileText, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function FinancialsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quickbooks/test")
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 h-[calc(100vh-2rem)] overflow-y-auto">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Financial Command</h1>
          <p className="text-gray-500 mt-2">Accounts Receivable, Profitability, and Cash Flow.</p>
        </div>
        <div className="flex gap-3 items-center">
          {data?.error ? (
             <div className="bg-red-50 text-red-800 text-xs font-bold px-3 py-1.5 rounded-md border border-red-200 flex items-center gap-2">
               <AlertCircle size={14} /> QuickBooks Error: {data.error.substring(0,30)}...
             </div>
          ) : (
             <div className="bg-green-50 text-green-800 text-xs font-bold px-3 py-1.5 rounded-md border border-green-200 flex items-center gap-2">
               <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div> Live Sync Active
             </div>
          )}
          <Link href="/settings" className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-all">
            Manage QuickBooks
          </Link>
        </div>
      </div>

      {loading ? (
         <div className="py-20 text-center text-gray-500">Loading financial data...</div>
      ) : (
        <>
          {/* Core KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-4">
                <h3 className="font-medium text-sm">Money Outstanding (A/R)</h3>
                <div className="bg-red-50 p-2 rounded-lg"><CreditCard size={18} className="text-red-600" /></div>
              </div>
              <p className="text-3xl font-bold text-gray-900">${(data.report?.accountsReceivable || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              <p className="text-sm text-red-600 font-medium mt-2 flex items-center gap-1">
                <TrendingUp size={14} /> {data.report?.openInvoicesCount || 0} Open Invoices
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-4">
                <h3 className="font-medium text-sm">Gross Profit</h3>
                <div className="bg-blue-50 p-2 rounded-lg"><DollarSign size={18} className="text-blue-600" /></div>
              </div>
              <p className="text-3xl font-bold text-gray-900">${(data.report?.grossProfit || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              <p className="text-sm text-gray-400 font-medium mt-2 flex items-center gap-1">Year to date</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-green-100 bg-green-50/30 shadow-sm">
              <div className="flex items-center justify-between text-green-700 mb-4">
                <h3 className="font-medium text-sm">Net Income</h3>
                <div className="bg-green-100 p-2 rounded-lg"><TrendingUp size={18} className="text-green-600" /></div>
              </div>
              <p className="text-3xl font-bold text-green-900">${(data.report?.netIncome || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              <p className="text-sm text-green-700 font-medium mt-2 flex items-center gap-1">After total expenses</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Profit by Crew Leaderboard */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users size={18} className="text-gray-500" /> Profitability by Crew
                </h2>
              </div>
              <div className="divide-y divide-gray-100 p-0">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500">
                    <tr>
                      <th className="px-6 py-3 font-medium">Crew / Technician</th>
                      <th className="px-6 py-3 font-medium">Revenue Built</th>
                      <th className="px-6 py-3 font-medium">Labor/Material Cost</th>
                      <th className="px-6 py-3 font-medium text-right">Profit Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.report?.profitByCrew?.map((crew: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">{crew.name}</td>
                        <td className="px-6 py-4 text-gray-600">${crew.revenue.toLocaleString()}</td>
                        <td className="px-6 py-4 text-red-500">${crew.cost.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${parseFloat(crew.margin) > 50 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {crew.margin}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expenses Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <PieChart size={18} className="text-gray-500" /> Expense Categories
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {data.report?.topExpenseCategories?.map((exp: any, idx: number) => {
                    // Quick calculation for the bar chart width relative to total expenses
                    const percentage = Math.round((exp.amount / (data.report.totalExpenses || 10000)) * 100);
                    return (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">{exp.name}</span>
                          <span className="text-sm font-semibold text-gray-900">${exp.amount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-red-400 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Link href="/receipts" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <FileText size={16} /> View all scanned receipts & bills →
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
