import { useState, useEffect } from "react";
import { UserPlus, Shield, Trash2, Mail, Users, HardHat, Check } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function TeamTab() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("field_rep");
  const [companyId, setCompanyId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
    if (profile?.company_id) {
      setCompanyId(profile.company_id);
      const { data } = await supabase.from('profiles').select('*').eq('company_id', profile.company_id);
      if (data) setTeam(data);
    }
    setLoading(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app we'd trigger an Edge Function or Supabase Admin Auth invite
    alert(`Invite sent to ${inviteEmail} as ${inviteRole}!`);
    setShowInvite(false);
    setInviteEmail("");
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
      case 'owner': return <Shield className="w-4 h-4 text-purple-600" />;
      case 'sales': return <Users className="w-4 h-4 text-blue-600" />;
      default: return <HardHat className="w-4 h-4 text-orange-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Team Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage office staff, dispatchers, and field technicians.</p>
        </div>
        <button 
          onClick={() => setShowInvite(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition"
        >
          <UserPlus className="w-4 h-4" /> Invite Member
        </button>
      </div>

      {showInvite && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Invite New Team Member</h3>
          <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input required type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="tech@company.com" className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
            </div>
            <div className="w-full md:w-48">
              <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900 bg-white">
                <option value="admin">Admin / Dispatcher</option>
                <option value="sales">Sales Rep</option>
                <option value="field_rep">Field Technician</option>
              </select>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition w-full md:w-auto h-10">
              Send Invite
            </button>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading team...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-3">Member</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {team.map((member, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                        {member.first_name?.[0] || "U"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{member.first_name} {member.last_name}</p>
                        <p className="text-xs text-gray-500">{member.id.split('-')[0]}... (ID)</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 bg-gray-100 w-fit px-2.5 py-1 rounded-md">
                      {getRoleIcon(member.role)}
                      <span className="text-xs font-medium text-gray-700 capitalize">{member.role?.replace('_', ' ') || 'User'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-red-400 hover:text-red-600 transition p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {team.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No team members found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
