"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  // Top-level supabase client handles this

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setMsg("Error: " + error.message);
    } else {
      setMsg("Success! Account created. You can now go to /login");
    }
  };

  return (
    <div className="p-10 max-w-sm mx-auto mt-20 bg-white shadow rounded-lg text-black border relative z-50">
      <h1 className="text-xl font-bold mb-4">Secret Admin Creator</h1>
      <form onSubmit={handleSignup} className="space-y-4">
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)}
          className="border border-gray-300 p-2 w-full rounded"
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          className="border border-gray-300 p-2 w-full rounded"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded w-full">Create Account</button>
      </form>
      {msg && <p className="mt-4 text-sm font-medium text-green-600">{msg}</p>}
    </div>
  );
}
