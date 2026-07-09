"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "system" | "user" | "assistant", content: string }[]>([
    { role: "assistant", content: "Hi! I'm Sarah, your dedicated AI office assistant. I'm actively monitoring your phone lines, but you can text me here directly if you need me to schedule a job, look up a customer, or generate a quote." }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const newMsgs = [...messages, { role: "user" as const, content: input }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      // For now, this hits the Halo API or a dedicated chat endpoint. 
      // We will reuse /api/halo as the proxy to the OpenClaw agent for the demo.
      const res = await fetch("/api/halo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs.filter(m => m.role !== 'system') }),
      });
      const data = await res.json();
      
      if (data.message) {
        setMessages([...newMsgs, { role: "assistant", content: data.message.content }]);
      } else if (data.error) {
        setMessages([...newMsgs, { role: "system", content: `System Error: ${data.error}` }]);
      } else {
        setMessages([...newMsgs, { role: "system", content: "Received an empty response from the agent." }]);
      }
    } catch (err) {
      setMessages([...newMsgs, { role: "system", content: "Failed to connect to your dedicated agent." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Sarah (AI Employee)</h1>
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Online and monitoring phones
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
          <Sparkles size={14} className="text-blue-500" /> Powered by OpenClaw
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 custom-scrollbar"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%]`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mb-1">
                  <Bot size={16} />
                </div>
              )}
              
              <div className={`px-5 py-3.5 text-[15px] leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm shadow-sm' 
                  : m.role === 'system'
                    ? 'bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-mono'
                    : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-2xl rounded-bl-sm'
              }`}>
                {m.content}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0 mb-1">
                  <User size={16} />
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mb-1">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-gray-200 shadow-sm rounded-2xl rounded-bl-sm px-5 py-4 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-blue-500" />
                <span className="text-sm text-gray-500 font-medium">Sarah is typing...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
        <div className="max-w-4xl mx-auto relative flex items-end shadow-sm border border-gray-300 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 overflow-hidden bg-white">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Message your AI employee..."
            className="w-full pl-4 pr-14 py-4 max-h-32 bg-transparent border-none focus:ring-0 resize-none outline-none text-[15px]"
            rows={1}
            style={{ minHeight: '56px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-xl disabled:opacity-50 disabled:bg-gray-300 hover:bg-blue-700 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Sarah can access your jobs, customer history, and live dispatch board.
        </p>
      </div>
    </div>
  );
}