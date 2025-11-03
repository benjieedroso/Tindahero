import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { User, UserRole } from '../App';
import { Plus, Edit, Trash2, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface UsersProps {
  currentUser: User;
}

interface AppUser extends User {
  password?: string;
  createdAt: string;
}

export default function Users({ currentUser }: UsersProps) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff' as UserRole
  });

  useEffect(() => {
    const saved = localStorage.getItem('users');
    if (saved) {
      setUsers(JSON.parse(saved));
    } else {
      // Initialize with current user
      const initialUsers: AppUser[] = [{
        ...currentUser,
        createdAt: new Date().toISOString()
      }];
      setUsers(initialUsers);
      localStorage.setItem('users', JSON.stringify(initialUsers));
    }
  }, []);

  const saveUsers = (newUsers: AppUser[]) => {
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
  };

  const canAddUser = () => {
    if (currentUser.subscriptionPlan === 'free') {
      return users.length < 2; // 1 owner + 1 staff
    } else if (currentUser.subscriptionPlan === 'pro') {
      return users.length < 4; // 1 owner + 3 staff
    }
    return true; // Business plan has unlimited
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canAddUser() && !editingUser) {
      const limit = currentUser.subscriptionPlan === 'free' ? '1 staff' : '3 staff';
      toast.error(`Your ${currentUser.subscriptionPlan} plan is limited to ${limit}. Upgrade to add more!`);
      return;
    }

    if (editingUser) {
      const updated = users.map(u =>
        u.id === editingUser.id
          ? {
              ...u,
              name: formData.name,
              email: formData.email,
              role: formData.role,
              ...(formData.password && { password: formData.password })
            }
          : u
      );
      saveUsers(updated);
      toast.success('User updated successfully!');
    } else {
      const newUser: AppUser = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        subscriptionPlan: currentUser.subscriptionPlan,
        password: formData.password,
        createdAt: new Date().toISOString()
      };
      saveUsers([...users, newUser]);
      toast.success('User added successfully!');
    }

    resetForm();
    setIsAddDialogOpen(false);
    setEditingUser(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'staff'
    });
  };

  const handleEdit = (user: AppUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (id === currentUser.id) {
      toast.error('Cannot delete your own account!');
      return;
    }

    if (confirm('Are you sure you want to delete this user?')) {
      saveUsers(users.filter(u => u.id !== id));
      toast.success('User deleted successfully!');
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-700';
      case 'admin':
        return 'bg-blue-100 text-blue-700';
      case 'staff':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const userLimit = currentUser.subscriptionPlan === 'free' ? '1 staff' :
                    currentUser.subscriptionPlan === 'pro' ? '3 staff' :
                    'Unlimited';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>User Management</h1>
          <p className="text-gray-600 mt-2">
            {currentUser.subscriptionPlan !== 'business' && (
              <span className="text-orange-600">
                {currentUser.subscriptionPlan.toUpperCase()} Plan: {users.length - 1}/{userLimit}
              </span>
            )}
            {currentUser.subscriptionPlan === 'business' && (
              <span>{users.length} users</span>
            )}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            resetForm();
            setEditingUser(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">
                  Password {editingUser && '(leave blank to keep current)'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                />
              </div>

              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner (Full Access)</SelectItem>
                    <SelectItem value="admin">Admin (Manage Users)</SelectItem>
                    <SelectItem value="staff">Staff / Cashier (Limited Access)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-2">
                  {formData.role === 'owner' && 'Full access to all features'}
                  {formData.role === 'admin' && 'Can manage users and settings'}
                  {formData.role === 'staff' && 'Can only record sales, limited reports access'}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                  setEditingUser(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingUser ? 'Update' : 'Add'} User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plan Limits Info */}
      {currentUser.subscriptionPlan !== 'business' && (
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <UsersIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-900">
                <strong>{currentUser.subscriptionPlan === 'free' ? 'Free Plan' : 'Pro Plan'} User Limits</strong>
              </p>
              <p className="text-blue-700 text-sm mt-1">
                {currentUser.subscriptionPlan === 'free' 
                  ? 'Your free plan allows 1 owner + 1 staff member. Upgrade to Pro for 3 staff or Business for unlimited users.'
                  : 'Your Pro plan allows 1 owner + 3 staff members. Upgrade to Business for unlimited users and full accounting features.'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div>{user.name}</div>
                      {user.id === currentUser.id && (
                        <Badge variant="outline" className="text-xs mt-1">You</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {user.role === 'owner' && 'All features'}
                      {user.role === 'admin' && 'Manage users, reports'}
                      {user.role === 'staff' && 'Sales, basic reports'}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(user.id)}
                        disabled={user.id === currentUser.id}
                        className="text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Permission Reference */}
      <Card className="p-6 mt-6">
        <h3 className="mb-4">Role Permissions Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-purple-100 text-purple-700">Owner</Badge>
            </div>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Full system access</li>
              <li>Manage all users</li>
              <li>Change subscription</li>
              <li>Access all reports</li>
              <li>Accounting features</li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-100 text-blue-700">Admin</Badge>
            </div>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Manage users</li>
              <li>Access reports</li>
              <li>Manage inventory</li>
              <li>Record sales & expenses</li>
              <li>View accounting</li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-gray-100 text-gray-700">Staff</Badge>
            </div>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Record sales (POS)</li>
              <li>View inventory</li>
              <li>Basic reports only</li>
              <li>No user management</li>
              <li>No settings access</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
