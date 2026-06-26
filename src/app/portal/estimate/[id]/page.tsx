"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2, DollarSign, Building2 } from "lucide-react";

export default function EstimatePortal() {
  const params = useParams();
  const id = params?.id as string;

  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/estimates/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setEstimate(data.estimate);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load estimate");
        setLoading(false);
      });
  }, [id]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      const res = await fetch(`/api/estimates/${id}`, { method: 'POST' });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      setSuccess(true);
      
      // If there's a payment link, redirect them to pay the deposit
      if (data.stripe_session_url) {
        setTimeout(() => {
          window.location.href = data.stripe_session_url;
        }, 1500);
      }
    } catch (err: any) {
      alert("Error approving estimate: " + err.message);
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !estimate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Estimate Not Found</h1>
          <p className="text-gray-500">{error || "This estimate may have been deleted or the link is invalid."}</p>
        </div>
      </div>
    );
  }

  const companyName = estimate.companies?.name || "Hard Hat Solutions";

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Document Container */}
        <div className="bg-white shadow-xl mb-6">
          
          {/* Header Section */}
          <div className="p-8 border-b border-gray-200 flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 bg-[#3E70A1] flex items-center justify-center text-white">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wider">{companyName}</h1>
                <p className="text-sm text-gray-500 mt-1">Estimates & Invoicing</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-[#3E70A1] uppercase tracking-tight">Estimate</h2>
              <p className="text-sm font-medium text-gray-500 mt-1">EST-{(estimate.id || "0000").substring(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className="p-8">
            {/* Two Column Info Section */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <div className="bg-[#3E70A1] text-white px-3 py-1.5 font-bold text-sm uppercase tracking-wider">
                    Client Information
                  </div>
                  <div className="border border-t-0 border-gray-200 p-4 bg-gray-50/50">
                    <p className="font-bold text-gray-900">{estimate.customer_name}</p>
                    {estimate.customer_phone && <p className="text-sm text-gray-600 mt-1">{estimate.customer_phone}</p>}
                    {estimate.customer_email && <p className="text-sm text-gray-600 mt-1">{estimate.customer_email}</p>}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <div className="bg-[#3E70A1] text-white px-3 py-1.5 font-bold text-sm uppercase tracking-wider">
                    Estimate Details
                  </div>
                  <div className="border border-t-0 border-gray-200 p-0">
                    <div className="flex border-b border-gray-200 text-sm">
                      <div className="w-1/2 p-2 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Date Issued:</div>
                      <div className="w-1/2 p-2 text-gray-900">{new Date(estimate.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex text-sm">
                      <div className="w-1/2 p-2 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">Valid Until:</div>
                      <div className="w-1/2 p-2 text-gray-900">
                        {new Date(new Date(estimate.created_at).getTime() + 30*24*60*60*1000).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#3E70A1] text-white text-sm">
                    <th className="p-3 text-left font-bold uppercase tracking-wider border border-[#3E70A1]">Item</th>
                    <th className="p-3 text-left font-bold uppercase tracking-wider border border-[#3E70A1]">Description</th>
                    <th className="p-3 text-center font-bold uppercase tracking-wider border border-[#3E70A1]">Qty</th>
                    <th className="p-3 text-right font-bold uppercase tracking-wider border border-[#3E70A1]">Rate</th>
                    <th className="p-3 text-right font-bold uppercase tracking-wider border border-[#3E70A1]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.estimate_items?.map((item: any, idx: number) => (
                    <tr key={item.id} className="text-sm border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3 text-gray-900 border-l border-gray-200">{idx + 1}</td>
                      <td className="p-3 font-medium text-gray-900 border-l border-gray-200">{item.description}</td>
                      <td className="p-3 text-center text-gray-700 border-l border-gray-200">{item.quantity}</td>
                      <td className="p-3 text-right text-gray-700 border-l border-gray-200">${Number(item.rate).toFixed(2)}</td>
                      <td className="p-3 text-right font-medium text-gray-900 border-l border-r border-gray-200">${Number(item.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                  {(!estimate.estimate_items || estimate.estimate_items.length === 0) && (
                    <tr className="border-b border-gray-200">
                      <td colSpan={5} className="p-8 text-center text-gray-500 border-l border-r border-gray-200">No items on this estimate</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Totals Section */}
              <div className="flex justify-end mt-4">
                <div className="w-full sm:w-1/2 md:w-1/3">
                  <div className="flex justify-between p-2 border-b border-gray-200 text-sm">
                    <span className="font-semibold text-gray-600">Subtotal</span>
                    <span className="text-gray-900">${Number(estimate.amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-[#3E70A1] text-white font-bold mt-2">
                    <span>Total Estimate</span>
                    <span>${Number(estimate.amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Notes */}
            <div className="text-sm text-gray-500 border-t border-gray-200 pt-6">
              <p className="mb-2"><strong>Note:</strong> This document is an estimate and not a final invoice. Prices are subject to change based on final scope of work and materials required.</p>
              <p>To proceed with this project, please approve and sign using the button below.</p>
            </div>
          </div>
        </div>

        {/* Approval Action */}
        {estimate.status === 'approved' || success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-green-900">Estimate Approved</h2>
              <p className="text-green-700 text-sm mt-1">Thank you! We are preparing your invoice and next steps.</p>
            </div>
          </div>
        ) : (
          <button
            onClick={handleApprove}
            disabled={approving}
            className="w-full bg-[#3E70A1] hover:bg-[#2c537a] text-white font-bold py-4 px-8 rounded-lg shadow-lg transition-all flex justify-center items-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            {approving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            {approving ? "Processing..." : "Approve Estimate"}
          </button>
        )}
      </div>
    </div>
  );
}
