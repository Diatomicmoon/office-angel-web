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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{companyName}</h1>
          <p className="text-gray-500 mt-1">Project Estimate</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-sm text-gray-500 font-medium">Prepared For</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{estimate.customer_name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium">Date</p>
                <p className="text-gray-900 mt-1">{new Date(estimate.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 py-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Line Items</h3>
              <div className="space-y-4">
                {estimate.estimate_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.description}</p>
                      <p className="text-sm text-gray-500">{item.quantity} x ${Number(item.rate).toFixed(2)}</p>
                    </div>
                    <p className="font-semibold text-gray-900">${Number(item.amount).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total Estimate</span>
                <span className="text-2xl font-bold text-gray-900">${Number(estimate.amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {estimate.status === 'approved' || success ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-green-900 mb-2">Estimate Approved!</h2>
            <p className="text-green-700">Thank you. We are preparing your invoice and next steps.</p>
          </div>
        ) : (
          <button
            onClick={handleApprove}
            disabled={approving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {approving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            {approving ? "Approving..." : "Approve & Sign"}
          </button>
        )}
      </div>
    </div>
  );
}
