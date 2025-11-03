import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User } from '../App';
import { Check, Star, Zap, Crown } from 'lucide-react';

interface SubscriptionProps {
  currentUser: User;
  onUpgrade: (plan: 'free' | 'pro' | 'business') => void;
}

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    icon: Star,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    features: [
      '50 inventory items',
      '1 staff account',
      'Basic sales tracking',
      'Local data backup',
      'Basic reports',
      'Email support'
    ],
    limitations: [
      'No cloud sync',
      'No accounting features',
      'Limited reports'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 199,
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    popular: true,
    features: [
      'Unlimited inventory items',
      '3 staff accounts',
      'Advanced sales tracking',
      'Cloud sync & backup',
      'Comprehensive reports',
      'Export to CSV/PDF',
      'BIR-ready forms',
      'Priority support'
    ],
    limitations: [
      'No accounting features'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    price: 399,
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    features: [
      'Everything in Pro, plus:',
      'Unlimited staff accounts',
      'Full accounting system',
      'Chart of accounts',
      'Journal entries',
      'Trial balance',
      'Income statement',
      'Balance sheet',
      'Complete BIR compliance',
      'Multi-location support',
      'Dedicated support',
      'Custom reporting'
    ],
    limitations: []
  }
];

const paymentMethods = [
  { name: 'GCash', logo: '💰', info: '0917-123-4567' },
  { name: 'Maya', logo: '💳', info: '0917-123-4567' },
  { name: 'Bank Transfer', logo: '🏦', info: 'BDO: 1234-5678-90' }
];

export default function Subscription({ currentUser, onUpgrade }: SubscriptionProps) {
  const handleUpgrade = (planId: 'free' | 'pro' | 'business') => {
    if (planId === currentUser.subscriptionPlan) {
      return;
    }

    // In real app, this would handle payment processing
    if (confirm(`Upgrade to ${planId.toUpperCase()} plan?`)) {
      onUpgrade(planId);
    }
  };

  return (
    <div className="p-8">
      <div className="text-center mb-12">
        <h1>Choose Your Plan</h1>
        <p className="text-gray-600 mt-2">
          Select the perfect plan for your sari-sari store business
        </p>
        <div className="mt-4">
          <Badge className="bg-green-100 text-green-700">
            Current Plan: {currentUser.subscriptionPlan.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentUser.subscriptionPlan === plan.id;
          const canUpgrade = 
            (currentUser.subscriptionPlan === 'free' && plan.id !== 'free') ||
            (currentUser.subscriptionPlan === 'pro' && plan.id === 'business');
          const canDowngrade = 
            (currentUser.subscriptionPlan === 'business' && plan.id !== 'business') ||
            (currentUser.subscriptionPlan === 'pro' && plan.id === 'free');

          return (
            <Card
              key={plan.id}
              className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                </div>
              )}

              <div className="p-6">
                <div className={`w-12 h-12 ${plan.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${plan.color}`} />
                </div>

                <h3 className="mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl">₱{plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>

                {isCurrentPlan && (
                  <Badge className="w-full bg-green-100 text-green-700 mb-4 justify-center">
                    Current Plan
                  </Badge>
                )}

                {!isCurrentPlan && canUpgrade && (
                  <Button
                    className="w-full mb-4 bg-green-600 hover:bg-green-700"
                    onClick={() => handleUpgrade(plan.id as 'free' | 'pro' | 'business')}
                  >
                    Upgrade to {plan.name}
                  </Button>
                )}

                {!isCurrentPlan && canDowngrade && (
                  <Button
                    variant="outline"
                    className="w-full mb-4"
                    onClick={() => handleUpgrade(plan.id as 'free' | 'pro' | 'business')}
                  >
                    Switch to {plan.name}
                  </Button>
                )}

                {!isCurrentPlan && !canUpgrade && !canDowngrade && (
                  <Button variant="outline" className="w-full mb-4" disabled>
                    {plan.id === 'free' ? 'Free Plan' : 'Select Plan'}
                  </Button>
                )}

                <div className="space-y-3">
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-3">Features:</p>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2 mb-2">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <Card className="mb-12">
        <div className="p-6 border-b">
          <h2>Feature Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">Feature</th>
                <th className="text-center p-4">Free</th>
                <th className="text-center p-4">Pro</th>
                <th className="text-center p-4">Business</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-4">Inventory Items</td>
                <td className="text-center p-4">50</td>
                <td className="text-center p-4 text-green-600">Unlimited</td>
                <td className="text-center p-4 text-green-600">Unlimited</td>
              </tr>
              <tr>
                <td className="p-4">Staff Accounts</td>
                <td className="text-center p-4">1</td>
                <td className="text-center p-4">3</td>
                <td className="text-center p-4 text-green-600">Unlimited</td>
              </tr>
              <tr>
                <td className="p-4">Sales & Expense Tracking</td>
                <td className="text-center p-4">✓</td>
                <td className="text-center p-4">✓</td>
                <td className="text-center p-4">✓</td>
              </tr>
              <tr>
                <td className="p-4">Cloud Sync & Backup</td>
                <td className="text-center p-4">-</td>
                <td className="text-center p-4 text-green-600">✓</td>
                <td className="text-center p-4 text-green-600">✓</td>
              </tr>
              <tr>
                <td className="p-4">Advanced Reports</td>
                <td className="text-center p-4">-</td>
                <td className="text-center p-4 text-green-600">✓</td>
                <td className="text-center p-4 text-green-600">✓</td>
              </tr>
              <tr>
                <td className="p-4">BIR-Ready Forms</td>
                <td className="text-center p-4">-</td>
                <td className="text-center p-4 text-green-600">✓</td>
                <td className="text-center p-4 text-green-600">✓</td>
              </tr>
              <tr>
                <td className="p-4">Full Accounting System</td>
                <td className="text-center p-4">-</td>
                <td className="text-center p-4">-</td>
                <td className="text-center p-4 text-green-600">✓</td>
              </tr>
              <tr>
                <td className="p-4">Chart of Accounts</td>
                <td className="text-center p-4">-</td>
                <td className="text-center p-4">-</td>
                <td className="text-center p-4 text-green-600">✓</td>
              </tr>
              <tr>
                <td className="p-4">Financial Statements</td>
                <td className="text-center p-4">-</td>
                <td className="text-center p-4">-</td>
                <td className="text-center p-4 text-green-600">✓</td>
              </tr>
              <tr>
                <td className="p-4">Multi-Location Support</td>
                <td className="text-center p-4">-</td>
                <td className="text-center p-4">-</td>
                <td className="text-center p-4 text-green-600">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payment Methods */}
      <Card className="p-8">
        <div className="text-center mb-8">
          <h2>Payment Methods</h2>
          <p className="text-gray-600 mt-2">We accept the following payment options</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {paymentMethods.map((method) => (
            <Card key={method.name} className="p-6 text-center border-2 hover:border-green-500 transition-colors">
              <div className="text-4xl mb-3">{method.logo}</div>
              <h3 className="mb-2">{method.name}</h3>
              <p className="text-gray-600 text-sm">{method.info}</p>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg max-w-3xl mx-auto">
          <h3 className="text-blue-900 mb-2">How to Subscribe</h3>
          <ol className="text-blue-700 space-y-2 list-decimal list-inside">
            <li>Choose your preferred plan above</li>
            <li>Send payment to any of our payment methods</li>
            <li>Send proof of payment with your email to support@sarisaripos.ph</li>
            <li>Your account will be upgraded within 24 hours</li>
          </ol>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg max-w-3xl mx-auto text-center">
          <p className="text-sm text-gray-600">
            Need help choosing a plan? Contact us at <strong>support@sarisaripos.ph</strong> or call <strong>0917-123-4567</strong>
          </p>
        </div>
      </Card>
    </div>
  );
}
