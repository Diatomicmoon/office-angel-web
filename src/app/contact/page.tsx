"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '', smsConsent: false });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Contact Us
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Want to see Hard Hat Solutions in action? Reach out to our team to book a demo.
          </p>
        </div>
        
        {status === 'success' ? (
          <div className="rounded-md bg-green-50 p-4 mt-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Request submitted successfully! We'll be in touch shortly.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="mb-4">
                <label htmlFor="name" className="sr-only">Full Name</label>
                <input 
                  id="name" 
                  name="name" 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                  placeholder="Full Name" 
                />
              </div>
              <div className="mb-4">
                <label htmlFor="phone" className="sr-only">Phone Number</label>
                <input 
                  id="phone" 
                  name="phone" 
                  type="tel" 
                  required 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                  placeholder="Phone Number" 
                />
              </div>
              <div className="mb-4">
                <label htmlFor="message" className="sr-only">Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows={4} 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                  placeholder="How can we help?"
                ></textarea>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input 
                  id="sms-consent" 
                  name="sms-consent" 
                  type="checkbox" 
                  checked={formData.smsConsent}
                  onChange={(e) => setFormData({...formData, smsConsent: e.target.checked})}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" 
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="sms-consent" className="font-medium text-gray-700">SMS Opt-In Consent (Optional)</label>
                <p className="text-gray-500 text-xs mt-1">
                  By checking this box, you agree to receive SMS text messages from Hard Hat Solutions. I understand that consent is not a condition of purchase. Message and data rates may apply. Reply STOP to opt out. View our <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                </p>
              </div>
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-600 text-center">Something went wrong. Please try again.</p>
            )}

            <div>
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {status === 'loading' ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
        
        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
