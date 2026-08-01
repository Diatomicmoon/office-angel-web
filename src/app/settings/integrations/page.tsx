"use client";

import React, { useState } from 'react';
import { 
  Globe, 
  Mail, 
  CreditCard, 
  Calendar, 
  PhoneCall, 
  Truck, 
  FileSpreadsheet, 
  CheckCircle2, 
  ChevronRight, 
  X
} from 'lucide-react';

type IntegrationStatus = 'connected' | 'disconnected' | 'pending';

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ElementType;
  status: IntegrationStatus;
  color: string;
}

const integrations: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'Financials',
    description: 'Process credit cards and get paid instantly on your invoices.',
    icon: CreditCard,
    status: 'disconnected',
    color: 'text-indigo-600 bg-indigo-50',
  },
  {
    id: 'qbo',
    name: 'QuickBooks Online',
    category: 'Financials',
    description: 'Sync your invoices, expenses, and automated P&L.',
    icon: FileSpreadsheet,
    status: 'disconnected',
    color: 'text-green-600 bg-green-50',
  },
  {
    id: 'website',
    name: 'Website Leads',
    category: 'Lead Gen',
    description: 'Drop a widget on your Squarespace/Wix/WordPress site to catch leads.',
    icon: Globe,
    status: 'disconnected',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    id: 'angi',
    name: 'Angi / HomeAdvisor',
    category: 'Lead Gen',
    description: 'Auto-forward leads to Hard Hat and instantly put them on your board.',
    icon: Mail,
    status: 'disconnected',
    color: 'text-red-600 bg-red-50',
  },
  {
    id: 'gcal',
    name: 'Google Calendar',
    category: 'Scheduling',
    description: 'Full 2-way sync for your dispatch board and personal calendar.',
    icon: Calendar,
    status: 'connected', // Showing one as connected for the demo UI
    color: 'text-yellow-600 bg-yellow-50',
  },
  {
    id: 'vapi',
    name: 'AI Voice Receptionist',
    category: 'Communications',
    description: 'Never miss a call. AI answers overflow calls and books appointments.',
    icon: PhoneCall,
    status: 'disconnected',
    color: 'text-purple-600 bg-purple-50',
  },
  {
    id: 'bouncie',
    name: 'Bouncie GPS',
    category: 'Fleet Tracking',
    description: 'Plug-in OBD-II trackers to see your trucks live on the dispatch map.',
    icon: Truck,
    status: 'disconnected',
    color: 'text-slate-600 bg-slate-50',
  }
];

export default function IntegrationsPage() {
  const [activeModal, setActiveModal] = useState<Integration | null>(null);
  const [wizardStep, setWizardStep] = useState(1);

  const openModal = (integration: Integration) => {
    setActiveModal(integration);
    setWizardStep(1);
  };

  const closeModal = () => {
    setActiveModal(null);
    setWizardStep(1);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">App Store & Integrations</h1>
        <p className="text-gray-500 mt-1">Connect your existing tools to Hard Hat Solutions. We'll walk you through it step-by-step.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((int) => (
          <div key={int.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${int.color}`}>
                  <int.icon className="w-6 h-6" />
                </div>
                {int.status === 'connected' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    Not Connected
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{int.name}</h3>
              <p className="text-sm text-gray-500 mt-2">{int.description}</p>
            </div>
            
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 mt-auto">
              {int.status === 'connected' ? (
                <button 
                  onClick={() => openModal(int)}
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg py-2 transition-colors"
                >
                  Manage Settings
                </button>
              ) : (
                <button 
                  onClick={() => openModal(int)}
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg py-2 transition-colors shadow-sm"
                >
                  Connect {int.name}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Connection Wizard Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${activeModal.color}`}>
                  <activeModal.icon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Connect {activeModal.name}</h2>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto">
              {activeModal.id === 'website' && (
                <div className="space-y-6">
                  {wizardStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <h3 className="text-md font-bold text-gray-900 mb-2">Step 1: Choose your website builder</h3>
                      <p className="text-sm text-gray-500 mb-4">Select the platform you use for your company website so we can give you the right instructions.</p>
                      <div className="grid grid-cols-2 gap-3">
                        {['Squarespace', 'Wix', 'WordPress', 'Other / Custom'].map(plat => (
                          <button key={plat} onClick={() => setWizardStep(2)} className="border border-gray-200 rounded-lg p-4 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors font-medium text-sm text-gray-700">
                            {plat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <h3 className="text-md font-bold text-gray-900 mb-2">Step 2: Copy this script</h3>
                      <p className="text-sm text-gray-500 mb-4">Paste this code into the "Header Code Injection" section of your website. It will automatically add a "Request Estimate" button to your site.</p>
                      
                      <div className="bg-gray-900 rounded-lg p-4 relative group">
                        <pre className="text-xs text-green-400 overflow-x-auto">
                          <code>{`<script src="https://hardhat-solutions.com/widget.js" data-company="comp_8x92a..."></script>`}</code>
                        </pre>
                        <button className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Copy</button>
                      </div>

                      <div className="mt-6 flex justify-between">
                        <button onClick={() => setWizardStep(1)} className="text-sm font-semibold text-gray-500 hover:text-gray-900">Back</button>
                        <button onClick={() => setWizardStep(3)} className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                          I've pasted it <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center py-6">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Globe className="w-8 h-8 animate-pulse" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Waiting for first lead...</h3>
                      <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">Go to your website and fill out the form yourself. This window will automatically close when we receive the test lead.</p>
                      
                      <div className="flex justify-center gap-3">
                        <button onClick={closeModal} className="text-sm font-semibold text-gray-500 hover:text-gray-900 px-4 py-2">Cancel</button>
                        <button onClick={closeModal} className="bg-gray-100 text-gray-900 border border-gray-200 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-200">
                          Skip for now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Placeholder for other integrations */}
              {activeModal.id !== 'website' && (
                <div className="text-center py-8">
                  <activeModal.icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Connection Wizard</h3>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                    This will guide the contractor through a simple OAuth flow or API key hand-holding process for {activeModal.name}.
                  </p>
                  <button onClick={closeModal} className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-semibold">
                    Close Demo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
