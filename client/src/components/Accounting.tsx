import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { User, Sale, Expense } from '../App';
import { BookOpen, TrendingUp, TrendingDown } from 'lucide-react';

interface AccountingProps {
  currentUser: User;
}

interface Account {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
}

interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debit: { account: string; amount: number }[];
  credit: { account: string; amount: number }[];
  reference: string;
}

export default function Accounting({ currentUser }: AccountingProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    const savedSales = localStorage.getItem('sales');
    const savedExpenses = localStorage.getItem('expenses');

    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
  }, []);

  if (currentUser.subscriptionPlan !== 'business') {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-orange-600" />
          </div>
          <h2>Accounting Features</h2>
          <p className="text-gray-600 mt-2 mb-6">
            Upgrade to Business plan to access complete accounting features
          </p>
          <div className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700">
            Upgrade to Business Plan
          </div>
        </Card>
      </div>
    );
  }

  // Chart of Accounts
  const chartOfAccounts: Account[] = [
    // Assets
    { code: '1010', name: 'Cash', type: 'asset', balance: 0 },
    { code: '1020', name: 'Inventory', type: 'asset', balance: 0 },
    { code: '1030', name: 'Accounts Receivable', type: 'asset', balance: 0 },
    
    // Liabilities
    { code: '2010', name: 'Accounts Payable', type: 'liability', balance: 0 },
    { code: '2020', name: 'Notes Payable', type: 'liability', balance: 0 },
    
    // Equity
    { code: '3010', name: 'Owner\'s Capital', type: 'equity', balance: 0 },
    { code: '3020', name: 'Retained Earnings', type: 'equity', balance: 0 },
    
    // Revenue
    { code: '4010', name: 'Sales Revenue', type: 'revenue', balance: 0 },
    
    // Expenses
    { code: '5010', name: 'Cost of Goods Sold', type: 'expense', balance: 0 },
    { code: '5020', name: 'Operating Expenses', type: 'expense', balance: 0 },
    { code: '5030', name: 'Utilities Expense', type: 'expense', balance: 0 },
    { code: '5040', name: 'Rent Expense', type: 'expense', balance: 0 },
    { code: '5050', name: 'Salaries Expense', type: 'expense', balance: 0 },
  ];

  // Generate Journal Entries from transactions
  const journalEntries: JournalEntry[] = [];

  // Sales entries
  sales.forEach(sale => {
    const costOfGoods = sale.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
    
    journalEntries.push({
      id: `SALE-${sale.id}`,
      date: sale.date,
      description: `Sale - ${sale.items.map(i => i.productName).join(', ')}`,
      debit: [{ account: '1010 - Cash', amount: sale.total }],
      credit: [{ account: '4010 - Sales Revenue', amount: sale.total }],
      reference: `INV-${sale.id}`
    });

    journalEntries.push({
      id: `COGS-${sale.id}`,
      date: sale.date,
      description: `Cost of Goods Sold - ${sale.items.map(i => i.productName).join(', ')}`,
      debit: [{ account: '5010 - Cost of Goods Sold', amount: costOfGoods }],
      credit: [{ account: '1020 - Inventory', amount: costOfGoods }],
      reference: `INV-${sale.id}`
    });
  });

  // Expense entries
  expenses.forEach(expense => {
    const accountMap: { [key: string]: string } = {
      'Utilities': '5030 - Utilities Expense',
      'Rent': '5040 - Rent Expense',
      'Salaries': '5050 - Salaries Expense',
    };

    const expenseAccount = accountMap[expense.category] || '5020 - Operating Expenses';

    journalEntries.push({
      id: `EXP-${expense.id}`,
      date: expense.date,
      description: expense.description,
      debit: [{ account: expenseAccount, amount: expense.amount }],
      credit: [{ account: '1010 - Cash', amount: expense.amount }],
      reference: `EXP-${expense.id}`
    });
  });

  // Calculate account balances
  const accountBalances = new Map<string, number>();
  
  journalEntries.forEach(entry => {
    entry.debit.forEach(item => {
      const current = accountBalances.get(item.account) || 0;
      accountBalances.set(item.account, current + item.amount);
    });
    entry.credit.forEach(item => {
      const current = accountBalances.get(item.account) || 0;
      accountBalances.set(item.account, current - item.amount);
    });
  });

  // Calculate financial statements
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalCOGS = sales.reduce((sum, s) => 
    sum + s.items.reduce((itemSum, item) => itemSum + (item.cost * item.quantity), 0), 0
  );
  const grossProfit = totalRevenue - totalCOGS;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netIncome = grossProfit - totalExpenses;

  // Trial Balance
  const trialBalanceData = chartOfAccounts.map(account => {
    const fullAccountName = `${account.code} - ${account.name}`;
    const balance = accountBalances.get(fullAccountName) || 0;
    
    return {
      ...account,
      debitBalance: balance > 0 ? balance : 0,
      creditBalance: balance < 0 ? Math.abs(balance) : 0
    };
  });

  const totalDebits = trialBalanceData.reduce((sum, acc) => sum + acc.debitBalance, 0);
  const totalCredits = trialBalanceData.reduce((sum, acc) => sum + acc.creditBalance, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1>Accounting</h1>
        <p className="text-gray-600 mt-2">Complete accounting and financial management</p>
      </div>

      <Tabs defaultValue="journal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="journal">Journal Entries</TabsTrigger>
          <TabsTrigger value="chart">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="trial">Trial Balance</TabsTrigger>
          <TabsTrigger value="income">Income Statement</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
        </TabsList>

        {/* Journal Entries */}
        <TabsContent value="journal">
          <Card>
            <div className="p-6 border-b">
              <h3>Journal Entries</h3>
              <p className="text-gray-600 text-sm mt-1">Auto-generated from sales and expense transactions</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journalEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No journal entries yet. Record sales or expenses to see entries.
                    </TableCell>
                  </TableRow>
                ) : (
                  journalEntries.slice().reverse().map((entry) => (
                    <>
                      <TableRow key={`${entry.id}-debit`} className="border-b-0">
                        <TableCell rowSpan={2} className="align-top pt-4">
                          {new Date(entry.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell rowSpan={2} className="align-top pt-4">
                          <Badge variant="outline">{entry.reference}</Badge>
                        </TableCell>
                        <TableCell rowSpan={2} className="align-top pt-4">
                          {entry.description}
                        </TableCell>
                        <TableCell className="pt-4">{entry.debit[0].account}</TableCell>
                        <TableCell className="text-right pt-4">₱{entry.debit[0].amount.toFixed(2)}</TableCell>
                        <TableCell className="pt-4"></TableCell>
                      </TableRow>
                      <TableRow key={`${entry.id}-credit`}>
                        <TableCell className="pl-8 pb-4">{entry.credit[0].account}</TableCell>
                        <TableCell className="pb-4"></TableCell>
                        <TableCell className="text-right pb-4">₱{entry.credit[0].amount.toFixed(2)}</TableCell>
                      </TableRow>
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Chart of Accounts */}
        <TabsContent value="chart">
          <Card>
            <div className="p-6 border-b">
              <h3>Chart of Accounts</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chartOfAccounts.map((account) => {
                  const fullName = `${account.code} - ${account.name}`;
                  const balance = accountBalances.get(fullName) || 0;
                  
                  return (
                    <TableRow key={account.code}>
                      <TableCell>{account.code}</TableCell>
                      <TableCell>{account.name}</TableCell>
                      <TableCell>
                        <Badge variant={
                          account.type === 'revenue' ? 'default' :
                          account.type === 'expense' ? 'destructive' :
                          'outline'
                        }>
                          {account.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">₱{Math.abs(balance).toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Trial Balance */}
        <TabsContent value="trial">
          <Card>
            <div className="p-6 border-b">
              <h3>Trial Balance</h3>
              <p className="text-gray-600 text-sm mt-1">As of {new Date().toLocaleDateString()}</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trialBalanceData.filter(acc => acc.debitBalance > 0 || acc.creditBalance > 0).map((account) => (
                  <TableRow key={account.code}>
                    <TableCell>{account.code}</TableCell>
                    <TableCell>{account.name}</TableCell>
                    <TableCell className="text-right">
                      {account.debitBalance > 0 ? `₱${account.debitBalance.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {account.creditBalance > 0 ? `₱${account.creditBalance.toFixed(2)}` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell colSpan={2}><strong>Total</strong></TableCell>
                  <TableCell className="text-right"><strong>₱{totalDebits.toFixed(2)}</strong></TableCell>
                  <TableCell className="text-right"><strong>₱{totalCredits.toFixed(2)}</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Income Statement */}
        <TabsContent value="income">
          <Card className="p-6">
            <div className="text-center mb-6">
              <h2>Income Statement</h2>
              <p className="text-gray-600">For the period ending {new Date().toLocaleDateString()}</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <div className="flex justify-between py-2">
                  <span>Sales Revenue</span>
                  <span>₱{totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Less: Cost of Goods Sold</span>
                  <span className="text-red-600">₱{totalCOGS.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <strong>Gross Profit</strong>
                  <strong className="text-green-600">₱{grossProfit.toFixed(2)}</strong>
                </div>
              </div>

              <div>
                <div className="py-2">
                  <strong>Operating Expenses</strong>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Total Expenses</span>
                  <span className="text-red-600">₱{totalExpenses.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t-2 pt-4">
                <div className="flex justify-between py-2">
                  <strong className="text-lg">Net Income</strong>
                  <strong className={`text-lg ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₱{netIncome.toFixed(2)}
                  </strong>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mt-6">
                <div className="flex justify-between text-sm">
                  <span>Gross Profit Margin</span>
                  <span>{totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Net Profit Margin</span>
                  <span>{totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : 0}%</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Balance Sheet */}
        <TabsContent value="balance">
          <Card className="p-6">
            <div className="text-center mb-6">
              <h2>Balance Sheet</h2>
              <p className="text-gray-600">As of {new Date().toLocaleDateString()}</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              {/* Assets */}
              <div>
                <h3 className="mb-3">Assets</h3>
                {chartOfAccounts.filter(acc => acc.type === 'asset').map(account => {
                  const balance = accountBalances.get(`${account.code} - ${account.name}`) || 0;
                  return (
                    <div key={account.code} className="flex justify-between py-2 pl-4">
                      <span>{account.name}</span>
                      <span>₱{Math.abs(balance).toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between py-2 border-t mt-2">
                  <strong>Total Assets</strong>
                  <strong>₱{Array.from(accountBalances.entries())
                    .filter(([key]) => chartOfAccounts.find(acc => `${acc.code} - ${acc.name}` === key && acc.type === 'asset'))
                    .reduce((sum, [, val]) => sum + Math.abs(val), 0).toFixed(2)}</strong>
                </div>
              </div>

              {/* Liabilities */}
              <div>
                <h3 className="mb-3">Liabilities</h3>
                {chartOfAccounts.filter(acc => acc.type === 'liability').map(account => {
                  const balance = accountBalances.get(`${account.code} - ${account.name}`) || 0;
                  return (
                    <div key={account.code} className="flex justify-between py-2 pl-4">
                      <span>{account.name}</span>
                      <span>₱{Math.abs(balance).toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between py-2 border-t mt-2">
                  <strong>Total Liabilities</strong>
                  <strong>₱{Array.from(accountBalances.entries())
                    .filter(([key]) => chartOfAccounts.find(acc => `${acc.code} - ${acc.name}` === key && acc.type === 'liability'))
                    .reduce((sum, [, val]) => sum + Math.abs(val), 0).toFixed(2)}</strong>
                </div>
              </div>

              {/* Equity */}
              <div>
                <h3 className="mb-3">Owner's Equity</h3>
                <div className="flex justify-between py-2 pl-4">
                  <span>Retained Earnings (Net Income)</span>
                  <span className={netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>₱{netIncome.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t mt-2">
                  <strong>Total Equity</strong>
                  <strong>₱{netIncome.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
