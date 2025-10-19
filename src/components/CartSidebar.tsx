import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { X, Trash2, ShoppingBag, Check } from 'lucide-react';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalAmount } = useCart();
  const { user, profile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmitOrder = async () => {
    if (!user || !profile || items.length === 0) return;

    setSubmitting(true);

    try {
      const { data: orderNumberData, error: orderNumberError } = await supabase
        .rpc('generate_order_number');

      if (orderNumberError) throw orderNumberError;

      const totalAmount = getTotalAmount();

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumberData,
          total_amount: totalAmount,
          notes: notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: `${item.product.name} - ${item.variant.name}`,
        product_sku: item.variant.sku,
        quantity: item.quantity,
        unit_price: item.variant.wholesale_price,
        subtotal: item.variant.wholesale_price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderSubmitted(true);
      clearCart();
      setNotes('');

      setTimeout(() => {
        setOrderSubmitted(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 z-50 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {orderSubmitted ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-950 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Order Submitted!</h3>
              <p className="text-zinc-400">
                Your wholesale order has been received and will be processed shortly.
              </p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center text-zinc-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Your cart is empty</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {items.map((item) => (
                <div
                  key={item.variant.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-3"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <h3 className="text-white font-medium text-sm">{item.product.name}</h3>
                      <span className="text-zinc-500">·</span>
                      <p className="text-xs text-zinc-400">{item.variant.name}</p>
                      <span className="text-zinc-500">·</span>
                      <p className="text-xs text-zinc-400">
                        ${item.variant.wholesale_price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-white font-semibold text-sm">
                        ${(item.variant.wholesale_price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.variant.id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                      className="w-6 h-6 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors text-zinc-400 text-sm"
                    >
                      -
                    </button>
                    <span className="text-white font-medium text-sm w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                      className="w-6 h-6 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors text-zinc-400 text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <label htmlFor="notes" className="block text-sm font-medium text-zinc-300 mb-2">
                  Order Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                  placeholder="Add any special instructions or notes..."
                />
              </div>
            </div>

            <div className="border-t border-zinc-800 p-6 space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span className="text-zinc-400">Total:</span>
                <span className="text-white font-bold text-2xl">
                  ${getTotalAmount().toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={submitting}
                className="w-full bg-white text-black font-bold py-3 px-4 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting Order...' : 'Submit Order'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
