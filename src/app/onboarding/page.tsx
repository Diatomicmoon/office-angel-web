"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, PhoneForwarded, Bot, Headphones, ArrowRight, CheckCircle2, PhoneCall, Zap, ShieldCheck } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [aiMode, setAiMode] = useState<"answerer" | "copilot" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      const res = await fetch('/api/companies/mine', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: companyName,
        })
      });
      
      if (!res.ok) {
        console.error('Failed to save company setup');
      }

      const settingsRes = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ai_enabled: aiMode === 'answerer'
        })
      });

      if (!settingsRes.ok) {
        console.error('Failed to save AI settings');
      }
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Set up your workspace
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Let's get Hard Hat Solutions configured for your business.
        </p>

        {/* Progress Bar */}
        <div className="mt-8 flex justify-center items-center space-x-4">
          <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <div className={`w-12 h-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <div className={`w-12 h-1 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <div className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {/* STEP 1: Company Info */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-6">
                <Building2 className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900">What's your company called?</h3>
                <p className="text-sm text-gray-500 mt-1">This is how the AI will answer the phone.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Hard Hat Electric"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <button
                  onClick={() => setStep(2)}
                  disabled={!companyName.trim()}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed mt-6 transition-all"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: AI Mode Selection */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-6">
                <Bot className="w-10 h-10 text-purple-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900">Choose your AI Mode</h3>
                <p className="text-sm text-gray-500 mt-1">How do you want the AI to interact with your callers?</p>
              </div>

              <div className="space-y-4">
                <div 
                  onClick={() => setAiMode('answerer')}
                  className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${aiMode === 'answerer' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${aiMode === 'answerer' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <PhoneCall className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={`font-bold ${aiMode === 'answerer' ? 'text-blue-900' : 'text-gray-900'}`}>Full AI Answerer</h4>
                      <p className="text-sm text-gray-500 mt-1">The AI answers the phone, qualifies the lead, checks your calendar, and books the job directly.</p>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setAiMode('copilot')}
                  className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${aiMode === 'copilot' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${aiMode === 'copilot' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Headphones className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className={`font-bold ${aiMode === 'copilot' ? 'text-purple-900' : 'text-gray-900'}`}>Silent Co-Pilot (Live Listening)</h4>
                      <p className="text-sm text-gray-500 mt-1">You or a dispatcher answers the phone. The AI listens silently, extracts the address, and drafts the job ticket for you.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!aiMode}
                    className="w-2/3 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Phone Forwarding */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-6">
                <PhoneForwarded className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900">Activate the AI</h3>
                <p className="text-sm text-gray-500 mt-1">Follow these steps to wire up your business line.</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-600" /> Option 1: Conditional Forwarding (Recommended)
                </h4>
                <p className="text-sm text-gray-600 mb-3">If you miss a call or are busy, your carrier will forward it to the AI.</p>
                <div className="bg-white border border-gray-200 p-3 rounded-lg text-center shadow-sm">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-bold block mb-1">Dial this from your cell phone:</span>
                  <span className="text-xl font-mono font-bold text-gray-900">*71 612-324-5110</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">Dial *73 at any time to turn this off.</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-6">
                <h4 className="font-bold text-gray-900 mb-2">Option 2: Use as Dedicated Line</h4>
                <p className="text-sm text-gray-600">Put this number directly on your website, Google My Business, or truck wraps to route all leads straight to the AI.</p>
                <div className="mt-3 text-center">
                  <span className="text-lg font-mono font-bold text-blue-600">(612) 324-5110</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="w-2/3 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Saving Setup...' : <><CheckCircle2 className="w-5 h-5" /> Finish Setup</>}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}