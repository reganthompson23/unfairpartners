import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, ShoppingBag, User, Package, Shield } from 'lucide-react';
import ProductCatalog from './ProductCatalog';
import CartSidebar from './CartSidebar';
import { useCart } from '../contexts/CartContext';
import OrderHistory from './OrderHistory';
import AdminDashboard from './admin/AdminDashboard';

type View = 'products' | 'orders' | 'profile';
type Mode = 'customer' | 'admin';

export default function CustomerPortal() {
  const { signOut, profile } = useAuth();
  const { getTotalItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('products');
  const [mode, setMode] = useState<Mode>('customer');

  const isAdmin = profile?.is_admin === true;

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <img src="/heartbeatwhite2.png" alt="Logo" className="h-5" />
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentView('products')}
                  className={`text-sm font-medium transition-colors ${
                    currentView === 'products'
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Products
                </button>
                <button
                  onClick={() => setCurrentView('orders')}
                  className={`text-sm font-medium transition-colors ${
                    currentView === 'orders'
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  My Orders
                </button>
                <button
                  onClick={() => setCurrentView('profile')}
                  className={`text-sm font-medium transition-colors ${
                    currentView === 'profile'
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Profile
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin && (
                <div className="flex items-center bg-zinc-800 rounded-lg p-1">
                  <button
                    onClick={() => setMode('customer')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      mode === 'customer'
                        ? 'bg-white text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Partner
                  </button>
                  <button
                    onClick={() => setMode('admin')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      mode === 'admin'
                        ? 'bg-white text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </button>
                </div>
              )}

              {mode === 'customer' && (
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <ShoppingBag className="w-5 h-5 text-zinc-300" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black text-xs font-bold rounded-full flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mode === 'admin' ? (
          <AdminDashboard />
        ) : (
          <>
            {currentView === 'products' && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">FX-1 Range</h2>
                  <p className="text-zinc-400">Experience our premium wholesale collection, designed for partners who demand excellence</p>
                </div>
                <ProductCatalog />
              </>
            )}

            {currentView === 'orders' && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Order History</h2>
                  <p className="text-zinc-400">View your previous orders</p>
                </div>
                <OrderHistory />
              </>
            )}

            {currentView === 'profile' && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Profile</h2>
                  <p className="text-zinc-400">Your account information</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-2xl">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-zinc-500 mb-1">Company Name</label>
                      <p className="text-white font-medium">{profile?.company_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-500 mb-1">Contact Name</label>
                      <p className="text-white font-medium">{profile?.contact_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-500 mb-1">Email</label>
                      <p className="text-white font-medium">{profile?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-500 mb-1">Phone</label>
                      <p className="text-white font-medium">{profile?.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-500 mb-1">Address</label>
                      <p className="text-white font-medium">
                        {profile?.address}<br />
                        {profile?.city}, {profile?.state} {profile?.zip}
                      </p>
                    </div>
                    {profile?.tax_id && (
                      <div>
                        <label className="block text-sm text-zinc-500 mb-1">Tax ID</label>
                        <p className="text-white font-medium">{profile.tax_id}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
