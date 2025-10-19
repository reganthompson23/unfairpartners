import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return;

    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;

      setOrderItems((prev) => ({ ...prev, [orderId]: data || [] }));
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      fetchOrderItems(orderId);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-950 text-blue-400';
      case 'processing':
        return 'bg-amber-950 text-amber-400';
      case 'completed':
        return 'bg-green-950 text-green-400';
      case 'cancelled':
        return 'bg-red-950 text-red-400';
      default:
        return 'bg-zinc-800 text-zinc-400';
    }
  };

  if (loading) {
    return <div className="text-zinc-400">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
        <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
        <p className="text-zinc-400">No orders yet. Start shopping to place your first order!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const isExpanded = expandedOrder === order.id;
        const items = orderItems[order.id] || [];

        return (
          <div
            key={order.id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {order.order_number}
                    </h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500">
                    Placed on {new Date(order.created_at).toLocaleDateString()} at{' '}
                    {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    ${order.total_amount.toFixed(2)}
                  </p>
                </div>
              </div>

              {order.notes && (
                <div className="bg-zinc-800 border border-zinc-700 rounded p-3 mb-4">
                  <p className="text-sm text-zinc-400">
                    <span className="text-zinc-500 font-medium">Order Notes:</span> {order.notes}
                  </p>
                </div>
              )}

              <button
                onClick={() => toggleOrderExpansion(order.id)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide Items
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    View Items
                  </>
                )}
              </button>

              {isExpanded && items.length > 0 && (
                <div className="border-t border-zinc-800 mt-4 pt-4">
                  <h4 className="text-sm font-semibold text-zinc-300 mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-zinc-800 rounded p-3"
                      >
                        <div>
                          <p className="text-white font-medium">{item.product_name}</p>
                          <p className="text-xs text-zinc-500">SKU: {item.product_sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white">
                            {item.quantity} × ${item.unit_price.toFixed(2)}
                          </p>
                          <p className="text-sm text-zinc-400 font-medium">
                            ${item.subtotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
