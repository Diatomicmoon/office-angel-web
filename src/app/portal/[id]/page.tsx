import { MapPin, Phone, MessageSquare, Star, Wrench, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export default async function CustomerPortalDashboard({ params }: { params: any }) {
  // Safe init for Next.js build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // In Next.js 15, params is a Promise. Let's await it just in case.
  const resolvedParams = await Promise.resolve(params);
  const rawId = Array.isArray(resolvedParams?.id) ? resolvedParams.id[0] : resolvedParams?.id;
  const id = rawId ? rawId.toLowerCase() : null;

  if (!id || id === 'favicon.ico') {
    return <div>Invalid ID</div>;
  }

  // Check if it's a valid UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let job = null;
  
  if (isUuid) {
    const { data } = await supabase
      .from('jobs')
      .select('*, customers(*), companies(*)')
      .eq('id', id)
      .single();
    job = data;
  } else {
    // If it's a short ID (like 1B6971), let's see if there's a job starting with it.
    // Or if it was a call_logs ID that was passed, let's see if we can find the job linked to it.
    let { data: matchingJob } = await supabase
      .from('jobs')
      .select('*, customers(*), companies(*)')
      .ilike('id', id + '%')
      .limit(1)
      .single();
      
    if (!matchingJob) {
      // Fallback: Check if they passed a call log short ID instead of a Job short ID.
      const { data: callLog } = await supabase
        .from('call_logs')
        .select('meta')
        .ilike('id', id + '%')
        .limit(1)
        .single();
        
      if (callLog?.meta?.structured?.job_id) {
         const { data: linkedJob } = await supabase
           .from('jobs')
           .select('*, customers(*), companies(*)')
           .eq('id', callLog.meta.structured.job_id)
           .single();
         matchingJob = linkedJob;
      }
    }
    
    job = matchingJob;
  }

  if (!job) {
    return (
       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
         <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <Wrench className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Job Not Found</h2>
            <p className="text-gray-500">We couldn't find a job matching this ID. It may have been removed or the link is invalid.</p>
         </div>
       </div>
    );
  }

  const companyName = job.companies?.name || 'Service Company';
  const displayId = job.id.substring(0, 6).toUpperCase();
  const address = job.address || job.customers?.address || 'Address not provided';
  const issue = job.title || 'General Service Request';
  
  const status = String(job.status || 'Scheduled').toLowerCase();
  
  // Mock tech info for now
  const techName = "Mike Johnson";
  
  let progress = 33;
  let statusTitle = "Your Pro is on the way!";
  let statusSub = "Estimated Arrival: 2:45 PM (12 mins)";
  
  if (status.includes('working') || status.includes('progress') || status.includes('site')) {
    progress = 66;
    statusTitle = "Your Pro is on site!";
    statusSub = "Work is currently in progress.";
  } else if (status.includes('done') || status.includes('completed')) {
    progress = 100;
    statusTitle = "Job Completed!";
    statusSub = "Thank you for choosing us.";
  } else if (status.includes('scheduled')) {
    progress = 10;
    statusTitle = "Job Scheduled";
    if (job.scheduled_start) {
        const d = new Date(job.scheduled_start);
        statusSub = `See you on ${d.toLocaleDateString()} at ${d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } else {
        statusSub = "We will see you soon.";
    }
  } else {
     progress = 5;
     statusTitle = "Request Received";
     statusSub = "We are reviewing your job request.";
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wrench className="text-white w-4 h-4" />
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">{companyName}</span>
        </div>
        <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Job #{displayId}
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6 mt-4">
        
        {/* Live Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-blue-600 p-6 text-white text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-3 backdrop-blur-sm">
              <MapPin className={`w-8 h-8 text-white ${progress === 33 ? 'animate-bounce' : ''}`} />
            </div>
            <h2 className="text-2xl font-bold mb-1">{statusTitle}</h2>
            <p className="text-blue-100 font-medium">{statusSub}</p>
          </div>
          
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80" 
                alt="Technician" 
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shadow-sm"
              />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{techName}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium text-gray-900">4.9</span>
                  <span>(128 jobs)</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-green-500" /> Background Checked
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <a href={`tel:${job.companies?.phone_number || ''}`} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-200 transition">
                  <Phone className="w-4 h-4" />
                </a>
                <a href={`sms:${job.companies?.phone_number || ''}`} className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-100 transition">
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative pt-2">
              <div className="flex mb-2 items-center justify-between">
                <div className={`text-xs font-semibold uppercase tracking-wide ${progress >= 33 ? 'text-blue-600' : 'text-gray-400'}`}>En Route</div>
                <div className={`text-xs font-semibold uppercase tracking-wide ${progress >= 66 ? 'text-blue-600' : 'text-gray-400'}`}>Working</div>
                <div className={`text-xs font-semibold uppercase tracking-wide ${progress >= 100 ? 'text-blue-600' : 'text-gray-400'}`}>Done</div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-100 relative">
                <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500 absolute left-0 top-0 bottom-0"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Service Details</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Wrench className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Issue Reported</p>
                <p className="text-sm text-gray-600">{issue}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Service Address</p>
                <p className="text-sm text-gray-600">{address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Example: Invoice Ready */}
        {progress === 100 && (
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-sm border border-gray-800 p-6 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <FileText className="w-24 h-24" />
             </div>
             <h3 className="font-bold text-lg mb-1 relative z-10">Invoice Ready</h3>
             <p className="text-gray-300 text-sm mb-4 relative z-10">Your final invoice is ready for payment.</p>
             <button className="bg-white text-gray-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition w-full flex items-center justify-between relative z-10">
               Pay Invoice <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        )}

      </div>
    </div>
  );
}
