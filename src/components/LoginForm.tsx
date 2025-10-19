import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LogIn } from 'lucide-react';

interface LoginFormProps {
  onToggleMode: () => void;
}

export default function LoginForm({ onToggleMode }: LoginFormProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (resetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}`,
        });
        if (error) throw error;
        setResetSent(true);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || (resetMode ? 'Failed to send reset email' : 'Failed to sign in'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <LogIn className="w-6 h-6 text-zinc-400" />
          <h2 className="text-2xl font-bold text-white">{resetMode ? 'Reset Password' : 'Unfair Partner Login'}</h2>
        </div>

        {resetSent ? (
          <div className="space-y-4">
            <div className="bg-green-950 border border-green-800 text-green-300 px-4 py-3 rounded-lg text-sm">
              Password reset email sent! Check your inbox for instructions.
            </div>
            <button
              onClick={() => {
                setResetMode(false);
                setResetSent(false);
                setEmail('');
              }}
              className="w-full bg-white text-black font-semibold py-2 px-4 rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Back to Login
            </button>
          </div>
        ) : (

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          {!resetMode && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-950 border border-red-800 text-red-300 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-2 px-4 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (resetMode ? 'Sending...' : 'Signing in...') : (resetMode ? 'Send Reset Email' : 'Sign In')}
          </button>

          {!resetMode && (
            <button
              type="button"
              onClick={() => setResetMode(true)}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Forgot password?
            </button>
          )}

          {resetMode && (
            <button
              type="button"
              onClick={() => setResetMode(false)}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Back to login
            </button>
          )}
        </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={onToggleMode}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Need an account? Apply for wholesale access
          </button>
        </div>
        <div className="mt-4 text-center">
          <a
            href="mailto:contact@unfairscooters.com"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            contact@unfairscooters.com
          </a>
        </div>
      </div>
    </div>
  );
}
