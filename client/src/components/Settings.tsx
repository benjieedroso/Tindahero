import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { User } from '../App';
import { Building2, User as UserIcon, Bell, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SettingsProps {
  currentUser: User;
}

export default function Settings({ currentUser }: SettingsProps) {
  const [storeName, setStoreName] = useState('My Sari-Sari Store');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [ownerName, setOwnerName] = useState(currentUser.name);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [dailyReports, setDailyReports] = useState(false);

  const handleSaveStoreInfo = () => {
    localStorage.setItem('storeInfo', JSON.stringify({
      name: storeName,
      address: storeAddress,
      phone: storePhone,
      owner: ownerName
    }));
    toast.success('Store information saved!');
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('notificationSettings', JSON.stringify({
      email: emailNotifications,
      lowStock: lowStockAlerts,
      daily: dailyReports
    }));
    toast.success('Notification settings saved!');
  };

  const handleExportData = () => {
    const data = {
      products: localStorage.getItem('products'),
      sales: localStorage.getItem('sales'),
      expenses: localStorage.getItem('expenses'),
      users: localStorage.getItem('users'),
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sarisari-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Data exported successfully!');
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.products) localStorage.setItem('products', data.products);
          if (data.sales) localStorage.setItem('sales', data.sales);
          if (data.expenses) localStorage.setItem('expenses', data.expenses);
          if (data.users) localStorage.setItem('users', data.users);
          toast.success('Data imported successfully! Please refresh the page.');
        } catch (error) {
          toast.error('Invalid backup file!');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearAllData = () => {
    if (confirm('⚠️ WARNING: This will delete ALL data including products, sales, expenses, and users. This action cannot be undone! Are you absolutely sure?')) {
      if (confirm('This is your last chance. Really delete everything?')) {
        localStorage.removeItem('products');
        localStorage.removeItem('sales');
        localStorage.removeItem('expenses');
        localStorage.removeItem('users');
        localStorage.removeItem('storeInfo');
        toast.success('All data cleared! Please refresh the page.');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1>Settings</h1>
        <p className="text-gray-600 mt-2">Manage your store settings and preferences</p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList>
          <TabsTrigger value="store">Store Info</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        {/* Store Information */}
        <TabsContent value="store">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3>Store Information</h3>
                <p className="text-gray-600 text-sm">Update your store details</p>
              </div>
            </div>

            <div className="max-w-2xl space-y-4">
              <div>
                <Label htmlFor="storeName">Store Name *</Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="My Sari-Sari Store"
                />
              </div>

              <div>
                <Label htmlFor="storeAddress">Store Address</Label>
                <Input
                  id="storeAddress"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="123 Main St, Barangay, City, Province"
                />
              </div>

              <div>
                <Label htmlFor="storePhone">Contact Number</Label>
                <Input
                  id="storePhone"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  placeholder="0917-123-4567"
                />
              </div>

              <div>
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                  id="ownerName"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Owner Name"
                />
              </div>

              <Button onClick={handleSaveStoreInfo} className="bg-green-600 hover:bg-green-700">
                Save Store Information
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3>Account Settings</h3>
                <p className="text-gray-600 text-sm">Manage your account details</p>
              </div>
            </div>

            <div className="max-w-2xl space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p>{currentUser.name}</p>
                  </div>
                  <Button size="sm" variant="outline">Edit</Button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p>{currentUser.email}</p>
                  </div>
                  <Button size="sm" variant="outline">Edit</Button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600">Password</p>
                    <p>••••••••</p>
                  </div>
                  <Button size="sm" variant="outline">Change</Button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600">Current Plan</p>
                    <p className="capitalize">{currentUser.subscriptionPlan} Plan</p>
                  </div>
                  <Button size="sm" variant="outline">Upgrade</Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3>Notification Preferences</h3>
                <p className="text-gray-600 text-sm">Choose what notifications you want to receive</p>
              </div>
            </div>

            <div className="max-w-2xl space-y-6">
              <div className="flex items-center justify-between py-4 border-b">
                <div>
                  <p>Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive important updates via email</p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between py-4 border-b">
                <div>
                  <p>Low Stock Alerts</p>
                  <p className="text-sm text-gray-600">Get notified when products are running low</p>
                </div>
                <Switch
                  checked={lowStockAlerts}
                  onCheckedChange={setLowStockAlerts}
                />
              </div>

              <div className="flex items-center justify-between py-4 border-b">
                <div>
                  <p>Daily Sales Reports</p>
                  <p className="text-sm text-gray-600">Receive daily summary of sales and performance</p>
                </div>
                <Switch
                  checked={dailyReports}
                  onCheckedChange={setDailyReports}
                />
              </div>

              <Button onClick={handleSaveNotifications} className="bg-green-600 hover:bg-green-700">
                Save Notification Settings
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Download className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3>Backup & Restore</h3>
                  <p className="text-gray-600 text-sm">Export or import your store data</p>
                </div>
              </div>

              <div className="max-w-2xl space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p>Export All Data</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Download a complete backup of your products, sales, expenses, and users
                      </p>
                    </div>
                    <Button onClick={handleExportData} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p>Import Data</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Restore data from a previous backup file
                      </p>
                    </div>
                    <Button onClick={handleImportData} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Import
                    </Button>
                  </div>
                </div>

                {currentUser.subscriptionPlan !== 'free' && (
                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-green-900">Cloud Backup</p>
                        <p className="text-sm text-green-700 mt-1">
                          Your data is automatically backed up to the cloud
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-green-600 text-white rounded text-sm">
                        Active
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 border-red-200 bg-red-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-200 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-red-900">Danger Zone</h3>
                  <p className="text-red-700 text-sm">Irreversible actions</p>
                </div>
              </div>

              <div className="max-w-2xl">
                <div className="p-4 border border-red-300 bg-white rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-red-900">Clear All Data</p>
                      <p className="text-sm text-red-700 mt-1">
                        ⚠️ This will permanently delete all products, sales, expenses, and users. This action cannot be undone!
                      </p>
                    </div>
                    <Button
                      onClick={handleClearAllData}
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
