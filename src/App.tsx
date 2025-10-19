import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import PendingApproval from './components/PendingApproval';
import CustomerPortal from './components/CustomerPortal';
import AdminDashboard from './components/admin/AdminDashboard';

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <header className="bg-zinc-900 border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-20">
              <img
                src="/heartbeatwhite2 copy.png"
                alt="Logo"
                className="h-6"
              />
            </div>
          </div>
        </header>
        <div className="w-full relative">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-auto"
          >
            <source src="https://cdn.shopify.com/videos/c/o/v/2bf96931e7274a33a763721424b98afe.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <img
              src="/unfairpartner.png"
              alt="Become an Unfair Partner"
              className="max-w-[50%] h-auto"
            />
          </div>
        </div>
        <div className="flex items-center justify-center p-4 flex-grow">
          {showLogin ? (
            <LoginForm onToggleMode={() => setShowLogin(false)} />
          ) : (
            <RegisterForm onToggleMode={() => setShowLogin(true)} />
          )}
        </div>
        <footer className="bg-zinc-900 border-t border-zinc-800 py-8">
          <div className="flex justify-center items-center">
            <img
              src="/unfairu.png"
              alt="Unfair"
              className="h-8"
            />
          </div>
        </footer>
      </div>
    );
  }

  if (profile.status === 'pending') {
    return <PendingApproval />;
  }

  if (profile.status === 'rejected') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Application Rejected</h2>
          <p className="text-zinc-400 mb-6">
            Unfortunately, your wholesale application has been rejected.
            Please contact us if you have any questions.
          </p>
          <button
            onClick={signOut}
            className="w-full bg-white text-black font-semibold py-2 px-4 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (profile.is_admin) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <nav className="bg-zinc-900 border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-white">Wholesale Portal - Admin</h1>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdminDashboard />
        </main>
      </div>
    );
  }

  return <CustomerPortal />;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
