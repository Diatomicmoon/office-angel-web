"use client";

import { useState, useEffect, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { Mic, Square } from "lucide-react";

export function VapiCallButton() {
  const vapiRef = useRef<any>(null);
  const [callStatus, setCallStatus] = useState<"inactive" | "loading" | "active">("inactive");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    // Mic/WebRTC requires a secure context on mobile (HTTPS), except for localhost.
    if (typeof window !== "undefined") {
      const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      if (!window.isSecureContext && !isLocalhost) {
        setErrorMsg("Mic requires HTTPS. Open this page over https (or use localhost on your laptop). ");
      }
    }

    if (!publicKey || !assistantId) {
      setErrorMsg("Missing Vapi env vars (NEXT_PUBLIC_VAPI_PUBLIC_KEY / NEXT_PUBLIC_VAPI_ASSISTANT_ID). Check .env.local / Vercel env.");
      return;
    }

    const vapiInstance = new Vapi(publicKey);
    
    vapiInstance.on("call-start", () => {
      setCallStatus("active");
      setErrorMsg("");
    });

    vapiInstance.on("call-end", () => {
      setCallStatus("inactive");
    });

    vapiInstance.on("error", (e: any) => {
      const details = e?.message || e?.error || (typeof e === "string" ? e : "");
      console.error("Vapi Error:", e);

      // Common failure mode: in-app browsers + non-HTTPS mobile pages can't access mic.
      setErrorMsg(details ? `Vapi error: ${details}` : "Mic/Audio blocked. Open in Safari/Chrome and make sure you're on HTTPS.");
      setCallStatus("inactive");
    });

    vapiRef.current = vapiInstance;

    return () => {
      try { vapiInstance.stop(); } catch {}
    };
  }, []);

  const startCall = async () => {
    try {
      if (typeof window !== "undefined") {
        const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        if (!window.isSecureContext && !isLocalhost) {
          setErrorMsg("Mic requires HTTPS. You're on an insecure URL (likely an IP). Use an https tunnel or run on localhost.");
          return;
        }
      }
      setCallStatus("loading");
      setErrorMsg("");
      await vapiRef.current.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!);
    } catch (err) {
      console.error(err);
      const msg = (err as any)?.message || "Error starting call.";
      setErrorMsg(msg);
      setCallStatus("inactive");
    }
  };

  const stopCall = () => {
    vapiRef.current?.stop();
  };

  if (callStatus === "active") {
    return (
      <button 
        onClick={stopCall}
        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm animate-pulse"
      >
        <Square size={18} fill="currentColor" /> End Call
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <button 
        onClick={startCall}
        disabled={callStatus === "loading"}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
      >
        <Mic size={18} /> {callStatus === "loading" ? "Connecting..." : "Test AI Voice"}
      </button>
      {errorMsg && <p className="text-xs text-red-500 font-bold mt-1 absolute -bottom-5">{errorMsg}</p>}
    </div>
  );
}
