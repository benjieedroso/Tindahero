import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { User, Product, Sale, Expense } from '../App';
import { Download, FileText, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportsProps {
  currentUser: User;
}

export default function Reports({ currentUser }: ReportsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    const savedSales = localStorage.getItem('sales');
    const savedExpenses = localStorage.getItem('expenses');

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
  }, []);

  if (currentUser.subscriptionPlan === 'free') {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-orange-600" />
          </div>
          <h2>Reports & Analytics</h2>
          <p className="text-gray-600 mt-2 mb-6">
            Upgrade to Pro or Business plan to access detailed reports
          </p>
          <div className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700">
            Upgrade to Pro Plan
          </div>
        </Card>
      </div>
    );
  }

  // Calculate metrics based on period
  const getDateRange = () => {
    const now = new Date();
    let start: Date;
    
    if (reportPeriod === 'daily') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (reportPeriod === 'monthly') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      start = new Date(now.getFullYear(), 0, 1);
    }
    
    return { start, end: now };
  };

  const { start, end } = getDateRange();
  const filteredSales = sales.filter(s => {
    const saleDate = new Date(s.date);
    return saleDate >= start && saleDate <= end;
  });
  
  const filteredExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate >= start && expenseDate <= end;
  });

  // Sales Summary
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalProfit = filteredSales.reduce((sum, s) => sum + s.grossProfit, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netIncome = totalProfit - totalExpenses;

  // Top Products
  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const existing = productSales.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
      } else {
        productSales.set(item.productId, {
          name: item.productName,
          quantity: item.quantity,
          revenue: item.price * item.quantity
        });
      }
    });
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Sales by category
  const categorySales = new Map<string, number>();
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const current = categorySales.get(product.category) || 0;
        categorySales.set(product.category, current + (item.price * item.quantity));
      }
    });
  });

  const categoryData = Array.from(categorySales.entries()).map(([category, revenue]) => ({
    category,
    revenue
  }));

  // Expense by category
  const expenseByCategory = new Map<string, number>();
  filteredExpenses.forEach(expense => {
    const current = expenseByCategory.get(expense.category) || 0;
    expenseByCategory.set(expense.category, current + expense.amount);
  });

  const expenseCategoryData = Array.from(expenseByCategory.entries()).map(([category, amount]) => ({
    category,
    amount
  }));

  // Inventory valuation (FIFO)
  const inventoryValue = products.reduce((sum, p) => sum + (p.cost * p.stock), 0);

  const COLORS = ['#16a34a', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const downloadCSV = (data: any[], filename: string) => {
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive business insights and reports</p>
        </div>
        <Select value={reportPeriod} onValueChange={(value: any) => setReportPeriod(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Today</SelectItem>
            <SelectItem value="monthly">This Month</SelectItem>
            <SelectItem value="yearly">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Total Revenue</p>
          <p className="text-green-600 mt-1">₱{totalRevenue.toFixed(2)}</p>
          <p className="text-gray-500 text-xs mt-1">{filteredSales.length} transactions</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Gross Profit</p>
          <p className="text-green-600 mt-1">₱{totalProfit.toFixed(2)}</p>
          <p className="text-gray-500 text-xs mt-1">
            {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}% margin
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Total Expenses</p>
          <p className="text-red-600 mt-1">₱{totalExpenses.toFixed(2)}</p>
          <p className="text-gray-500 text-xs mt-1">{filteredExpenses.length} expenses</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm">Net Income</p>
          <p className={`mt-1 ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₱{netIncome.toFixed(2)}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            {totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : 0}% margin
          </p>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="profit">Profit & Loss</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
          <TabsTrigger value="bir">BIR Forms</TabsTrigger>
        </TabsList>

        {/* Sales Report */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3>Sales by Category</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadCSV(categoryData, 'sales-by-category')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
              </div>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="revenue"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.category}: ₱${entry.revenue.toFixed(0)}`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₱${Number(value).toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No sales data available
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3>Top 10 Products</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadCSV(topProducts, 'top-products')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
              </div>
              {topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => `₱${Number(value).toFixed(2)}`} />
                    <Bar dataKey="revenue" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No sales data available
                </div>
              )}
            </Card>
          </div>

          <Card>
            <div className="p-6 border-b flex items-center justify-between">
              <h3>Detailed Sales Transactions</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadCSV(
                  filteredSales.map(s => ({
                    date: new Date(s.date).toLocaleDateString(),
                    items: s.items.map(i => `${i.productName} (${i.quantity})`).join('; '),
                    total: s.total,
                    profit: s.grossProfit,
                    soldBy: s.soldBy
                  })),
                  'sales-transactions'
                )}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Sold By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                      No sales in this period
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.slice().reverse().map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {sale.items.map(item => `${item.productName} (${item.quantity})`).join(', ')}
                      </TableCell>
                      <TableCell>₱{sale.total.toFixed(2)}</TableCell>
                      <TableCell className="text-green-600">₱{sale.grossProfit.toFixed(2)}</TableCell>
                      <TableCell>{sale.soldBy}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Profit & Loss */}
        <TabsContent value="profit">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2>Profit & Loss Statement</h2>
                <p className="text-gray-600">
                  {reportPeriod === 'daily' ? 'Today' : reportPeriod === 'monthly' ? 'This Month' : 'This Year'}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  const data = [{
                    'Total Revenue': totalRevenue,
                    'Cost of Goods Sold': filteredSales.reduce((sum, s) => 
                      sum + s.items.reduce((itemSum, item) => itemSum + (item.cost * item.quantity), 0), 0),
                    'Gross Profit': totalProfit,
                    'Operating Expenses': totalExpenses,
                    'Net Income': netIncome
                  }];
                  downloadCSV(data, 'profit-loss-statement');
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF/CSV
              </Button>
            </div>

            <div className="max-w-2xl space-y-6">
              <div>
                <div className="flex justify-between py-3 border-b">
                  <span>Total Revenue</span>
                  <span className="text-green-600">₱{totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span>Less: Cost of Goods Sold</span>
                  <span className="text-red-600">
                    ₱{filteredSales.reduce((sum, s) => 
                      sum + s.items.reduce((itemSum, item) => itemSum + (item.cost * item.quantity), 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <strong>Gross Profit</strong>
                  <strong className="text-green-600">₱{totalProfit.toFixed(2)}</strong>
                </div>
              </div>

              <div>
                <div className="py-3">
                  <strong>Operating Expenses by Category</strong>
                </div>
                {expenseCategoryData.map(item => (
                  <div key={item.category} className="flex justify-between py-2 pl-4">
                    <span>{item.category}</span>
                    <span className="text-red-600">₱{item.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-3 border-t">
                  <strong>Total Operating Expenses</strong>
                  <strong className="text-red-600">₱{totalExpenses.toFixed(2)}</strong>
                </div>
              </div>

              <div className="border-t-2 pt-4">
                <div className="flex justify-between py-3">
                  <strong className="text-lg">Net Income</strong>
                  <strong className={`text-lg ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₱{netIncome.toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Inventory Report */}
        <TabsContent value="inventory">
          <Card>
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3>Inventory Valuation Report</h3>
                <p className="text-gray-600 text-sm mt-1">FIFO Method - As of {new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-sm">Total Inventory Value</p>
                <p className="text-green-600 mt-1">₱{inventoryValue.toFixed(2)}</p>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Total Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>₱{product.cost.toFixed(2)}</TableCell>
                    <TableCell>₱{(product.cost * product.stock).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell colSpan={4}><strong>Total Inventory Value</strong></TableCell>
                  <TableCell><strong>₱{inventoryValue.toFixed(2)}</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* BIR Forms */}
        <TabsContent value="bir">
          <Card className="p-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="mb-2">BIR-Ready Reports</h2>
              <p className="text-gray-600 mb-8">
                Download reports formatted for Bureau of Internal Revenue (BIR) compliance
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col items-start"
                  onClick={() => {
                    const data = filteredSales.map(s => ({
                      Date: new Date(s.date).toLocaleDateString(),
                      Invoice: `INV-${s.id}`,
                      Amount: s.total,
                      VAT: (s.total * 0.12).toFixed(2),
                      NetSales: (s.total / 1.12).toFixed(2)
                    }));
                    downloadCSV(data, 'BIR-Sales-Summary');
                  }}
                >
                  <div>Sales Summary (BIR Format)</div>
                  <div className="text-sm text-gray-500 mt-1">For quarterly BIR filing</div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col items-start"
                  onClick={() => {
                    const data = [{
                      Period: reportPeriod === 'daily' ? 'Daily' : reportPeriod === 'monthly' ? 'Monthly' : 'Yearly',
                      GrossSales: totalRevenue,
                      VAT: (totalRevenue * 0.12).toFixed(2),
                      NetSales: (totalRevenue / 1.12).toFixed(2),
                      Expenses: totalExpenses,
                      NetIncome: netIncome
                    }];
                    downloadCSV(data, 'BIR-Income-Statement');
                  }}
                >
                  <div>Income Statement (BIR Format)</div>
                  <div className="text-sm text-gray-500 mt-1">Annual tax return</div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col items-start"
                  onClick={() => {
                    const data = filteredExpenses.map(e => ({
                      Date: new Date(e.date).toLocaleDateString(),
                      Description: e.description,
                      Category: e.category,
                      Amount: e.amount
                    }));
                    downloadCSV(data, 'BIR-Expense-Report');
                  }}
                >
                  <div>Expense Report (BIR Format)</div>
                  <div className="text-sm text-gray-500 mt-1">Deductible expenses</div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col items-start"
                  onClick={() => {
                    const data = products.map(p => ({
                      Product: p.name,
                      SKU: p.sku,
                      Stock: p.stock,
                      UnitCost: p.cost,
                      TotalValue: p.cost * p.stock
                    }));
                    downloadCSV(data, 'BIR-Inventory-Report');
                  }}
                >
                  <div>Inventory Report (BIR Format)</div>
                  <div className="text-sm text-gray-500 mt-1">Year-end inventory</div>
                </Button>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Note: Please consult with a licensed accountant or BIR representative to ensure compliance with current tax regulations.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
