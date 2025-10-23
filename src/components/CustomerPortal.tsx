import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, ShoppingBag, User, Package, Shield, Info } from 'lucide-react';
import ProductCatalog from './ProductCatalog';
import CartSidebar from './CartSidebar';
import { useCart } from '../contexts/CartContext';
import OrderHistory from './OrderHistory';
import AdminDashboard from './admin/AdminDashboard';

type View = 'products' | 'orders' | 'profile' | 'information';
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
                  Ordering
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
                  onClick={() => setCurrentView('information')}
                  className={`text-sm font-medium transition-colors ${
                    currentView === 'information'
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Information
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
                  <p className="text-zinc-400">Welcome to the rebirth of Unfair. Our debut FX-1 range is available to order now. All stock is on a first come first serve basis.</p>
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

            {currentView === 'information' && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Partner Information</h2>
                  <p className="text-zinc-400">Important details about our partnership and ordering process</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 max-w-4xl">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-zinc-400" />
                        Inventory
                      </h3>
                      <p className="text-zinc-400 leading-relaxed">
                        Our FX-1 range represents a highly anticipated debut collection in limited initial production. 
                        Each piece is crafted to meet the elevated standards scooter riders have come to expect. 
                        Due to the limited nature of this first production run, all inventory is allocated on a 
                        first-come, first-served basis. Your stock allocation is secured the moment you submit your order, 
                        ensuring you receive priority access to this sought-after range.
                      </p>
                    </div>

                    <div className="border-t border-zinc-800 pt-8">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Package className="w-5 h-5 text-zinc-400" />
                        Ordering
                      </h3>
                      <p className="text-zinc-400 leading-relaxed">
                       Orders can be submitted through our wholesale portal 24/7. Once your order is placed, our team will calculate shipping costs based on your location and our most cost-effective warehouse to ship from, then prepare your official commercial invoice and send it within the following days for payment before processing.
                      </p>
                    </div>

                    <div className="border-t border-zinc-800 pt-8">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-zinc-400" />
                        Billing
                      </h3>
                      <p className="text-zinc-400 leading-relaxed">
                        All orders must be paid in full prior to shipment via direct bank transfer in USD only. 
                        Your commercial invoice will include the complete order total, calculated shipping costs, and direct transfer details (bank account information). 
                        Once payment is received and confirmed, your order will be processed and prepared for dispatch.
                      </p>
                    </div>

                    <div className="border-t border-zinc-800 pt-8">
                      <div className="bg-zinc-800 rounded-lg p-6">
                        <h4 className="text-white font-semibold mb-2">Need Help?</h4>
                        <p className="text-zinc-400 text-sm mb-3">
                          Our wholesale support team is here to assist you with any questions about ordering, 
                          billing, or shipping.
                        </p>
                        <p className="text-zinc-300 text-sm">
                          <span className="font-semibold">Email:</span> contact@unfairscooters.com
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
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
                        {profile?.city}, {profile?.state} {profile?.zip}<br />
                        {profile?.country}
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
