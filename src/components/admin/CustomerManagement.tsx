import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Building2, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'approved')
        .eq('is_admin', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-zinc-400">Loading customers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-950 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
        Error loading customers: {error}
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
        <Building2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Approved Customers</h3>
        <p className="text-zinc-400">
          Approved wholesale customers will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Approved Customers</h2>
          <p className="text-zinc-400 mt-1">{customers.length} active wholesale customers</p>
        </div>
      </div>

      <div className="grid gap-4">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {customer.company_name}
                </h3>
                <p className="text-zinc-400 text-sm">{customer.contact_name}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Calendar className="w-4 h-4" />
                Joined {new Date(customer.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-zinc-300">
                <Mail className="w-4 h-4 text-zinc-500" />
                <span>{customer.email}</span>
              </div>

              <div className="flex items-center gap-2 text-zinc-300">
                <Phone className="w-4 h-4 text-zinc-500" />
                <span>{customer.phone}</span>
              </div>

              <div className="flex items-start gap-2 text-zinc-300 md:col-span-2">
                <MapPin className="w-4 h-4 text-zinc-500 mt-0.5" />
                <span>
                  {customer.address}, {customer.city}, {customer.state} {customer.zip}
                </span>
              </div>

              {customer.tax_id && (
                <div className="text-zinc-300 md:col-span-2">
                  <span className="text-zinc-500">Tax ID:</span> {customer.tax_id}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
