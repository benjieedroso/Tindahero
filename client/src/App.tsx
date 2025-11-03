import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Expenses from './components/Expenses';
import Accounting from './components/Accounting';
import Reports from './components/Reports';
import UsersManagement from './components/Users';
import Settings from './components/Settings';
import Login from './components/Login';
import Subscription from './components/Subscription';
import { LayoutDashboard, Package, DollarSign, Receipt, BookOpen, BarChart3, Users as UsersIcon, Settings as SettingsIcon, CreditCard } from 'lucide-react';

export type UserRole = 'owner' | 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subscriptionPlan: 'free' | 'pro' | 'business';
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  reorderPoint: number;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  cost: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  grossProfit: number;
  date: string;
  soldBy: string;
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  recordedBy: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setActiveTab('dashboard');
  };

  if (!currentUser) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  const canAccessAccounting = currentUser.subscriptionPlan === 'business';
  const canAccessReports = currentUser.subscriptionPlan !== 'free';
  const canManageUsers = currentUser.role === 'owner' || currentUser.role === 'admin';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'sales', label: 'Sales', icon: DollarSign },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'accounting', label: 'Accounting', icon: BookOpen, hidden: !canAccessAccounting },
    { id: 'reports', label: 'Reports', icon: BarChart3, hidden: !canAccessReports },
    { id: 'users', label: 'Users', icon: UsersIcon, hidden: !canManageUsers },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-green-600">🏪 Sari-Sari POS</h1>
          <p className="text-gray-500 text-sm mt-1">{currentUser.name}</p>
          <div className="mt-2 inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
            {currentUser.subscriptionPlan.toUpperCase()}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.filter(item => !item.hidden).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-green-50 text-green-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard currentUser={currentUser} />}
        {activeTab === 'inventory' && <Inventory currentUser={currentUser} />}
        {activeTab === 'sales' && <Sales currentUser={currentUser} />}
        {activeTab === 'expenses' && <Expenses currentUser={currentUser} />}
        {activeTab === 'accounting' && <Accounting currentUser={currentUser} />}
        {activeTab === 'reports' && <Reports currentUser={currentUser} />}
        {activeTab === 'users' && <UsersManagement currentUser={currentUser} />}
        {activeTab === 'subscription' && <Subscription currentUser={currentUser} onUpgrade={(plan) => {
          const updatedUser = { ...currentUser, subscriptionPlan: plan };
          setCurrentUser(updatedUser);
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }} />}
        {activeTab === 'settings' && <Settings currentUser={currentUser} />}
      </main>

      <Toaster />
    </div>
  );
}
