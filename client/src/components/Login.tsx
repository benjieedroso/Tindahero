import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { User } from '../App';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock login - in real app, this would authenticate with backend
    const mockUser: User = {
      id: '1',
      name: email.split('@')[0] || 'Owner',
      email: email,
      role: 'owner',
      subscriptionPlan: 'free'
    };

    onLogin(mockUser);
  };

  const handleDemoLogin = (plan: 'free' | 'pro' | 'business') => {
    const mockUser: User = {
      id: '1',
      name: 'Demo User',
      email: `demo@${plan}.com`,
      role: 'owner',
      subscriptionPlan: plan
    };
    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏪</div>
          <h1 className="text-green-600 mb-2">Sari-Sari Store POS</h1>
          <p className="text-gray-600">Complete Business Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
            Login
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-sm text-center mb-3">Quick Demo Login:</p>
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleDemoLogin('free')}
            >
              Demo - Free Plan
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleDemoLogin('pro')}
            >
              Demo - Pro Plan
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleDemoLogin('business')}
            >
              Demo - Business Plan
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
