import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, X, Clock } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function PendingApprovals() {
  const [pendingUsers, setPendingUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingUsers(data || []);
    } catch (error) {
      console.error('Error fetching pending users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: approved ? 'approved' : 'rejected' })
        .eq('id', userId);

      if (error) throw error;

      setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status');
    }
  };

  if (loading) {
    return <div className="text-zinc-400">Loading pending approvals...</div>;
  }

  if (pendingUsers.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
        <Clock className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
        <p className="text-zinc-400">No pending approvals</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingUsers.map((user) => (
        <div
          key={user.id}
          className="bg-zinc-900 border border-zinc-800 rounded-lg p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {user.company_name}
              </h3>
              <p className="text-sm text-zinc-400">{user.contact_name}</p>
            </div>
            <span className="px-3 py-1 bg-amber-950 text-amber-400 text-xs font-medium rounded-full">
              Pending
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-zinc-500">Email:</span>
              <span className="text-white ml-2">{user.email}</span>
            </div>
            <div>
              <span className="text-zinc-500">Phone:</span>
              <span className="text-white ml-2">{user.phone}</span>
            </div>
            <div>
              <span className="text-zinc-500">Address:</span>
              <span className="text-white ml-2">
                {user.address}, {user.city}, {user.state} {user.zip}
              </span>
            </div>
            {user.tax_id && (
              <div>
                <span className="text-zinc-500">Tax ID:</span>
                <span className="text-white ml-2">{user.tax_id}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleApproval(user.id, true)}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => handleApproval(user.id, false)}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
