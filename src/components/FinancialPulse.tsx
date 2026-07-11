"use client";

import { DollarSign } from "lucide-react";
import { useState, useEffect } from "react";

interface Balance {
  amount: number;
  currency: string;
}

interface StripeBalance {
  pending: Balance[];
  available: Balance[];
}

export default function FinancialPulse() {
  const [balance, setBalance] = useState<StripeBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBalance() {
      try {
        const response = await fetch("/api/stripe/balance");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: StripeBalance = await response.json();
        setBalance(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBalance();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 transform hover:-translate-y-2 group">
      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-[0_0_15px_rgba(22,163,74,0.5)]">
        <DollarSign size={24} />
      </div>
      <h3 className="text-lg md:text-xl font-bold mb-3">Financial Pulse</h3>
      {
        loading ? (
          <p className="text-gray-600 leading-relaxed text-sm md:text-base">Loading balance...</p>
        ) : error ? (
          <p className="text-red-500 leading-relaxed text-sm md:text-base">Error: {error}</p>
        ) : balance ? (
          <div className="text-gray-600 leading-relaxed text-sm md:text-base">
            <p><strong>Available:</strong> {balance.available.map(b => `${(b.amount / 100).toFixed(2)} ${b.currency.toUpperCase()}`).join(', ')}</p>
            <p><strong>Pending:</strong> {balance.pending.map(b => `${(b.amount / 100).toFixed(2)} ${b.currency.toUpperCase()}`).join(', ')}</p>
          </div>
        ) : (
          <p className="text-gray-600 leading-relaxed text-sm md:text-base">No financial data available.</p>
        )
      }
    </div>
  );
}
