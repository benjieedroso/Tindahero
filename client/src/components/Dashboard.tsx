import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { User, Product, Sale, Expense } from '../App';
import { TrendingUp, TrendingDown, Package, DollarSign, Receipt, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  currentUser: User;
}

export default function Dashboard({ currentUser }: DashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    const savedSales = localStorage.getItem('sales');
    const savedExpenses = localStorage.getItem('expenses');

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
  }, []);

  // Calculate metrics
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= p.reorderPoint).length;
  
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.date.startsWith(today));
  const todayExpenses = expenses.filter(e => e.date.startsWith(today));
  
  const totalRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const totalGrossProfit = todaySales.reduce((sum, s) => sum + s.grossProfit, 0);
  const totalExpenses = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netIncome = totalGrossProfit - totalExpenses;

  // Last 7 days sales data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const salesChartData = last7Days.map(date => {
    const daySales = sales.filter(s => s.date.startsWith(date));
    const dayExpenses = expenses.filter(e => e.date.startsWith(date));
    const revenue = daySales.reduce((sum, s) => sum + s.total, 0);
    const profit = daySales.reduce((sum, s) => sum + s.grossProfit, 0) - dayExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue,
      profit
    };
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1>Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {currentUser.name}!</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm">Today's Revenue</p>
              <p className="text-green-600 mt-1">₱{totalRevenue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-green-600">Sales today</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm">Net Income</p>
              <p className={netIncome >= 0 ? 'text-green-600 mt-1' : 'text-red-600 mt-1'}>
                ₱{netIncome.toFixed(2)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {netIncome >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Profit - Expenses
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Products</p>
              <p className="mt-1">{totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            In inventory
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm">Low Stock Items</p>
              <p className={lowStockProducts > 0 ? 'text-orange-600 mt-1' : 'text-gray-900 mt-1'}>
                {lowStockProducts}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${lowStockProducts > 0 ? 'bg-orange-100' : 'bg-gray-100'}`}>
              <AlertTriangle className={`w-6 h-6 ${lowStockProducts > 0 ? 'text-orange-600' : 'text-gray-600'}`} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Need restock
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="mb-4">Last 7 Days Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `₱${Number(value).toFixed(2)}`} />
              <Bar dataKey="revenue" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4">Profit Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `₱${Number(value).toFixed(2)}`} />
              <Line type="monotone" dataKey="profit" stroke="#16a34a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts > 0 && (
        <Card className="p-6 border-orange-200 bg-orange-50">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0" />
            <div>
              <h3 className="text-orange-900">Low Stock Alert</h3>
              <p className="text-orange-700 mt-1">
                {lowStockProducts} product{lowStockProducts !== 1 ? 's' : ''} {lowStockProducts !== 1 ? 'are' : 'is'} running low on stock and need{lowStockProducts === 1 ? 's' : ''} restocking.
              </p>
              <div className="mt-4 space-y-2">
                {products.filter(p => p.stock <= p.reorderPoint).slice(0, 5).map(product => (
                  <div key={product.id} className="flex items-center justify-between text-sm">
                    <span className="text-orange-900">{product.name}</span>
                    <span className="text-orange-700">Stock: {product.stock} (Reorder at: {product.reorderPoint})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
