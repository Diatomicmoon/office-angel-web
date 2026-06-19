"use client";
import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ShieldCheck, Upload, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";

export default function PermitWalletTab() {
  const [permits, setPermits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchPermits();
  }, []);

  const fetchPermits = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Grab company_id from users table if available, else omit filtering for now if unlinked
    const { data: userData } = await supabase.from('users').select('company_id').eq('id', user.id).single();
    if (userData && userData.company_id) setCompanyId(userData.company_id);

    const query = supabase.from('canvassing_permits').select('*').order('created_at', { ascending: false });
    if (userData?.company_id) {
        query.eq('company_id', userData.company_id);
    }
    
    const { data, error } = await query;
    if (data) setPermits(data);
    setLoading(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${companyId || 'general'}/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('canvassing_permits')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('canvassing_permits')
        .getPublicUrl(filePath);

      // We ask for basic details (in a real app we'd pop a modal, but let's default for quick demo)
      const title = prompt("Enter a title for this permit (e.g. City of Edina):") || "New Permit";
      
      const { error: dbError } = await supabase.from('canvassing_permits').insert({
        company_id: companyId,
        title: title,
        file_url: publicUrlData.publicUrl,
        expiration_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // Default +1 year
        status: 'active'
      });

      if (dbError) throw dbError;

      await fetchPermits();
    } catch (err: any) {
      alert(`Error uploading permit: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm("Are you sure you want to delete this permit?")) return;
    
    try {
      // Delete from DB
      await supabase.from('canvassing_permits').delete().eq('id', id);
      
      // Extract file path from URL and delete from storage
      const filePathMatches = fileUrl.match(/canvassing_permits\/(.+)$/);
      if (filePathMatches && filePathMatches[1]) {
        await supabase.storage.from('canvassing_permits').remove([filePathMatches[1]]);
      }

      setPermits(permits.filter(p => p.id !== id));
    } catch (err: any) {
      alert("Error deleting: " + err.message);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Digital Permit Wallet
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Upload and manage solicitation permits and badges for your door-to-door reps.
          </p>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*,application/pdf"
          className="hidden" 
        />
        <button 
          onClick={handleUploadClick}
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Upload Permit'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : permits.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
          <ShieldCheck className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900">No Permits Uploaded</h3>
          <p className="text-gray-500 mt-2">Upload your first city solicitation permit or badge to get started.</p>
          <button 
            onClick={handleUploadClick}
            className="mt-6 bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition"
          >
            Upload Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {permits.map((permit) => (
            <div key={permit.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition">
              <div className="h-48 bg-gray-100 flex items-center justify-center border-b border-gray-200 overflow-hidden relative group">
                {permit.file_url.includes('.pdf') ? (
                   <div className="flex flex-col items-center">
                     <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                     <span className="text-sm text-gray-500 font-medium">PDF Document</span>
                   </div>
                ) : (
                   <img src={permit.file_url} alt={permit.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                  <a href={permit.file_url} target="_blank" rel="noreferrer" className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 font-medium px-4 py-2 rounded-lg shadow-sm transform scale-95 group-hover:scale-100 transition-all">
                    View Full
                  </a>
                </div>
              </div>
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start">
                  <div className="pr-2">
                    <h3 className="font-semibold text-gray-900 truncate" title={permit.title}>{permit.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">Expires: {new Date(permit.expiration_date).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(permit.id, permit.file_url)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    new Date(permit.expiration_date) < new Date() ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {new Date(permit.expiration_date) < new Date() ? 'Expired' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
