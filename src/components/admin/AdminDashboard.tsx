import { useState } from 'react';
import { Users, Package, FileText, Building2 } from 'lucide-react';
import PendingApprovals from './PendingApprovals';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import CustomerManagement from './CustomerManagement';

type Tab = 'approvals' | 'customers' | 'products' | 'orders';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('approvals');

  const tabs = [
    { id: 'approvals' as Tab, label: 'Pending Approvals', icon: Users },
    { id: 'customers' as Tab, label: 'Customers', icon: Building2 },
    { id: 'products' as Tab, label: 'Products', icon: Package },
    { id: 'orders' as Tab, label: 'Orders', icon: FileText },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-zinc-400">Manage your wholesale portal</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-zinc-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div>
        {activeTab === 'approvals' && <PendingApprovals />}
        {activeTab === 'customers' && <CustomerManagement />}
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'orders' && <OrderManagement />}
      </div>
    </div>
  );
}
