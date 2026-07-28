"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign } from "lucide-react";

const data = [
  { name: "Jan", revenue: 14000, expenses: 8000 },
  { name: "Feb", revenue: 18000, expenses: 9500 },
  { name: "Mar", revenue: 22000, expenses: 10000 },
  { name: "Apr", revenue: 28000, expenses: 12000 },
  { name: "May", revenue: 35000, expenses: 14000 },
  { name: "Jun", revenue: 45000, expenses: 15000 },
  { name: "Jul", revenue: 68000, expenses: 18000 },
];

export default function AnimatedRevenueChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="col-span-1 sm:col-span-2 md:col-span-3 bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-lg hover:shadow-2xl hover:border-blue-200 transition-all duration-500 overflow-hidden relative group"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <DollarSign size={20} className="drop-shadow-sm" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Live Financial Pulse</h3>
          </div>
          <p className="text-gray-500 text-sm md:text-base">AI automatically reconciles Stripe income & OCR expenses.</p>
        </div>
        <div className="mt-4 md:mt-0 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full flex items-center gap-2 text-emerald-700 font-semibold shadow-sm text-sm">
          <TrendingUp size={16} /> +42% Profit Margin
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} 
              tickFormatter={(val) => `$${val / 1000}k`} 
            />
            <Tooltip
              contentStyle={{ 
                borderRadius: '16px', 
                border: '1px solid #e5e7eb', 
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                fontWeight: 600,
                color: '#1f2937'
              }}
              itemStyle={{ fontWeight: 700 }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="#ef4444"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorExpenses)"
              animationDuration={2500}
              animationEasing="ease-out"
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#3b82f6"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              animationDuration={2500}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
    </motion.div>
  );
}