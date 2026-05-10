"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function Login() {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      router.refresh();
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative z-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl border border-gray-200 shadow-sm">

        {!showLogin ? (
          // === DEMO GATE ===
          <div className="text-center space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Office Angel</h1>
              <p className="text-gray-500 mt-2">
                Access is reserved for onboarded clients.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 space-y-4">
              <p className="text-gray-700 font-medium">
                Want to see Office Angel in action?
              </p>
              <p className="text-gray-500 text-sm">
                Book a free 30-minute demo and we&apos;ll walk you through everything — live, for your business.
              </p>
              <a
                href="https://calendly.com/zaki-office-angel/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors text-center"
              >
                Book a Free Demo →
              </a>
            </div>

            <button
              onClick={() => setShowLogin(true)}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
            >
              Already have an account? Sign in
            </button>
          </div>
        ) : (
          // === LOGIN FORM ===
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900">Office Angel</h1>
              <p className="text-gray-500 mt-2">Sign in to the Dispatch Dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="dispatcher@hardhat.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="••••••••"
                  required
                />
              </div>

              {errorMsg && (
                <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <button
              onClick={() => setShowLogin(false)}
              className="mt-6 w-full text-sm text-gray-400 hover:text-gray-600 transition-colors text-center"
            >
              ← Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
