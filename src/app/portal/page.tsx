'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerPortalLogin() {
  const [portalId, setPortalId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const router = useRouter();

  const handleAccessPortal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalId.trim()) return;

    setStatus('loading');
    
    // Skip auth and just push directly to the portal dashboard
    router.push(`/portal/${encodeURIComponent(portalId.trim())}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Customer Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your Portal ID or Job ID to access your live dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleAccessPortal}>
            <div>
              <label htmlFor="portalId" className="block text-sm font-medium text-gray-700">
                Portal ID / Job ID
              </label>
              <div className="mt-1">
                <input
                  id="portalId"
                  name="portalId"
                  type="text"
                  required
                  placeholder="e.g. 4829"
                  value={portalId}
                  onChange={(e) => setPortalId(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors"
              >
                {status === 'loading' ? 'Loading Portal...' : 'Access Portal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}