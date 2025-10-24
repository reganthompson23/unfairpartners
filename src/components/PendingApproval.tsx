import { Clock, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function PendingApproval() {
  const { signOut, profile } = useAuth();

  return (
    <div className="h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-amber-950 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Pending Approval</h2>

          <p className="text-zinc-400 mb-6">
            Thank you for applying, <span className="text-white font-medium">{profile?.company_name}</span>.
            Your wholesale account application is currently under review. We'll notify you via email once your account has been approved.
          </p>

          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-zinc-300 mb-2">Application Details</h3>
            <div className="space-y-1 text-sm text-zinc-400">
              <p><span className="text-zinc-500">Email:</span> {profile?.email}</p>
              <p><span className="text-zinc-500">Company:</span> {profile?.company_name}</p>
              <p><span className="text-zinc-500">Contact:</span> {profile?.contact_name}</p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="flex items-center justify-center gap-2 w-full bg-zinc-800 text-white py-2 px-4 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
