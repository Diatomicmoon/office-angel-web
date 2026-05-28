"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Company = {
  id: string;
  name: string;
  phone_number?: string;
};

export default function SelectCompany() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/companies/mine")
      .then((r) => r.json())
      .then((json) => {
        setCompanies(json.companies || []);
        setError(json.error ? String(json.error) : "");
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load companies");
        setLoading(false);
      });
  }, []);

  const choose = (id: string) => {
    // Persist tenant selection for server routes.
    document.cookie = `oa_company_id=${id}; Path=/; SameSite=Lax`;
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white p-4 md:p-8 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Select Company</h1>
        <p className="text-gray-500 mt-2">Choose which company you’re working in.</p>

        {loading ? (
          <div className="mt-6 text-sm text-gray-500">Loading…</div>
        ) : error ? (
          <div className="mt-6 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg">{error}</div>
        ) : companies.length === 0 ? (
          <div className="mt-6 text-sm text-gray-600">No companies found for your account.</div>
        ) : (
          <div className="mt-6 space-y-3">
            {companies.map((c) => (
              <button
                key={c.id}
                onClick={() => choose(c.id)}
                className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="font-semibold text-gray-900">{c.name}</div>
                {c.phone_number ? <div className="text-xs text-gray-500 mt-1">{c.phone_number}</div> : null}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
