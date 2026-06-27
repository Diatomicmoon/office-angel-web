"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X, Send, Loader2 } from "lucide-react";

export function HaloWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hiddenRoutes = ["/", "/login", "/pricing", "/about", "/signup-secret", "/privacy-policy", "/terms", "/canvassing", "/field-app"];
  const isHiddenPage = hiddenRoutes.includes(pathname) || pathname?.startsWith("/portal") || pathname?.startsWith("/onboarding");

  // Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isHiddenPage) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) setTimeout(() => document.getElementById("halo-input")?.focus(), 50);
          return !prev;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isHiddenPage]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (isHiddenPage) return null;

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const newMsgs = [...messages, { role: "user", content: input }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/halo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs }),
      });
      const data = await res.json();
      
      if (data.message) {
        setMessages([...newMsgs, { role: "assistant", content: data.message.content }]);
      } else if (data.error) {
        setMessages([...newMsgs, { role: "assistant", content: `System Error: ${data.error}` }]);
      } else {
        setMessages([...newMsgs, { role: "assistant", content: "Sorry, I received an empty response. Please try again." }]);
      }
    } catch (err) {
      setMessages([...newMsgs, { role: "assistant", content: "Sorry, I ran into a system error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setTimeout(() => document.getElementById("halo-input")?.focus(), 50); }}
          className="fixed bottom-6 right-6 h-14 w-14 bg-gray-900 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-gray-800 transition-transform hover:scale-105 z-50"
        >
          <Sparkles size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden animate-slide-in">
          
          {/* Header */}
          <div className="bg-gray-900 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Sparkles size={18} className="text-blue-400" />
              <span className="font-semibold">Halo Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="h-[400px] overflow-y-auto p-5 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-3 opacity-60">
                <Sparkles size={32} />
                <p className="text-sm">Hi! Try asking:<br/>"Where is Steve right now?" or<br/>"Did the permit clear for Minnetonka?"</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-tl-sm'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                  <span className="text-xs text-gray-500">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
              <input
                id="halo-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask Halo... (Cmd+K)"
                className="w-full pl-4 pr-12 py-3 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl text-sm transition-all"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="absolute right-2 p-1.5 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
