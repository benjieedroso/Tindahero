import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, Product, Sale, SaleItem } from '../App';
import { Plus, Trash2, ShoppingCart, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SalesProps {
  currentUser: User;
}

export default function Sales({ currentUser }: SalesProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    const savedSales = localStorage.getItem('sales');
    
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedSales) setSales(JSON.parse(savedSales));
  }, []);

  const addToCart = () => {
    if (!selectedProductId) {
      toast.error('Please select a product');
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const qty = parseInt(quantity);
    if (qty <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (qty > product.stock) {
      toast.error(`Only ${product.stock} units available in stock`);
      return;
    }

    const existingItem = cart.find(item => item.productId === selectedProductId);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === selectedProductId
          ? { ...item, quantity: item.quantity + qty }
          : item
      ));
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        quantity: qty,
        price: product.price,
        cost: product.cost
      };
      setCart([...cart, newItem]);
    }

    setSelectedProductId('');
    setQuantity('1');
    toast.success('Added to cart');
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, newQty: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > product.stock) {
      toast.error(`Only ${product.stock} units available`);
      return;
    }

    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQty }
        : item
    ));
  };

  const completeSale = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    // Check stock availability
    for (const item of cart) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        toast.error(`Insufficient stock for ${item.productName}`);
        return;
      }
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const grossProfit = cart.reduce((sum, item) => sum + ((item.price - item.cost) * item.quantity), 0);

    const newSale: Sale = {
      id: Date.now().toString(),
      items: [...cart],
      total,
      grossProfit,
      date: new Date().toISOString(),
      soldBy: currentUser.name
    };

    // Update stock levels
    const updatedProducts = products.map(product => {
      const cartItem = cart.find(item => item.productId === product.id);
      if (cartItem) {
        return {
          ...product,
          stock: product.stock - cartItem.quantity
        };
      }
      return product;
    });

    // Save everything
    const newSales = [...sales, newSale];
    setSales(newSales);
    setProducts(updatedProducts);
    localStorage.setItem('sales', JSON.stringify(newSales));
    localStorage.setItem('products', JSON.stringify(updatedProducts));

    // Clear cart
    setCart([]);
    toast.success(`Sale completed! Total: ₱${total.toFixed(2)}`);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartProfit = cart.reduce((sum, item) => sum + ((item.price - item.cost) * item.quantity), 0);

  // Today's sales
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => s.date.startsWith(today));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1>Sales & POS</h1>
        <p className="text-gray-600 mt-2">Record new sales and manage transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* POS Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add to Cart */}
          <Card className="p-6">
            <h3 className="mb-4">Add Items</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="product">Product</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.filter(p => p.stock > 0).map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - ₱{product.price.toFixed(2)} (Stock: {product.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addToCart} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </Card>

          {/* Cart */}
          <Card className="p-6">
            <h3 className="mb-4">Current Cart</h3>
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Cart is empty. Add items to start a sale.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>₱{item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>₱{(item.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>

        {/* Summary & Actions */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Sale Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Items:</span>
                <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>₱{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Gross Profit:</span>
                <span>₱{cartProfit.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span>Total:</span>
                <span className="text-green-600">₱{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={completeSale}
              disabled={cart.length === 0}
              className="w-full mt-6 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Complete Sale
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4">Today's Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Transactions:</span>
                <span>{todaySales.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue:</span>
                <span>₱{todaySales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Gross Profit:</span>
                <span>₱{todaySales.reduce((sum, s) => sum + s.grossProfit, 0).toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Sales */}
      <Card className="mt-6">
        <div className="p-6 border-b">
          <h3>Recent Sales</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date/Time</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Profit</TableHead>
              <TableHead>Sold By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  No sales recorded yet
                </TableCell>
              </TableRow>
            ) : (
              sales.slice().reverse().slice(0, 10).map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    {new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString()}
                  </TableCell>
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
    </div>
  );
}
