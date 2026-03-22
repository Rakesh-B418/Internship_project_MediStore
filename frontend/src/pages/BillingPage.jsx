import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import InvoicePrintModal from '../components/InvoicePrintModal';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function BillingPage() {
  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [taxPercent, setTaxPercent] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastBill, setLastBill] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [storeInfo, setStoreInfo] = useState({});

  // Fetch store info for invoice header
  useEffect(() => {
    const saved = localStorage.getItem('store_info');
    if (saved) {
      try { setStoreInfo(JSON.parse(saved)); } catch { /* ignore */ }
    }
    api.get('/settings/store-info').then(res => {
      setStoreInfo(res.data);
      localStorage.setItem('store_info', JSON.stringify(res.data));
    }).catch(() => {});
  }, []);

  const fetchInventory = useCallback(() => {
    api.get('/inventory?sort_by=product_name')
      .then(res => setInventory(res.data.filter(item => item.quantity > 0 && item.expiry_status !== 'Expired')))
      .catch(() => toast.error('Failed to load inventory for billing'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  // ── Cart operations ──────────────────────────────────────────────────────────

  const addToCart = (item) => {
    const existing = cart.find(c => c._id === item._id);
    if (existing) {
      if (existing.cartQuantity >= item.quantity) return toast.error('Not enough stock available');
      setCart(cart.map(c => c._id === item._id ? { ...c, cartQuantity: c.cartQuantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, cartQuantity: 1 }]);
    }
  };

  const updateCartQuantity = (id, delta) => {
    const item = cart.find(c => c._id === id);
    if (!item) return;
    const newQty = item.cartQuantity + delta;
    if (newQty <= 0) { setCart(cart.filter(c => c._id !== id)); return; }
    if (newQty > item.quantity) return toast.error('Exceeds available stock');
    setCart(cart.map(c => c._id === id ? { ...c, cartQuantity: newQty } : c));
  };

  const removeFromCart = (id) => setCart(cart.filter(c => c._id !== id));

  // ── Totals ───────────────────────────────────────────────────────────────────

  const subtotal = cart.reduce((t, i) => t + i.final_price * i.cartQuantity, 0);
  const taxAmount = subtotal * (taxPercent / 100);
  const discountAmount = subtotal * (discountPercent / 100);
  const grandTotal = subtotal + taxAmount - discountAmount;

  // ── Checkout ─────────────────────────────────────────────────────────────────

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckingOut(true);
    const payload = {
      items: cart.map(c => ({ inventory_id: c._id, quantity: c.cartQuantity })),
      customer_name: customerName,
      tax_percent: taxPercent,
      discount_percent: discountPercent,
    };
    try {
      const res = await api.post('/billing/checkout', payload);
      toast.success('Checkout successful!');
      setLastBill(res.data.bill);
      setShowReceipt(true);
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Checkout failed.');
    } finally {
      setCheckingOut(false);
    }
  };

  const resetBilling = () => {
    setCart([]);
    setCustomerName('');
    setTaxPercent(0);
    setDiscountPercent(0);
    setShowReceipt(false);
    setLastBill(null);
  };

  const filteredInventory = inventory.filter(item =>
    item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center h-full">
      <div className="w-8 h-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
    </div>
  );

  return (
    <>
      {/* Invoice print modal */}
      {showInvoice && lastBill && (
        <InvoicePrintModal
          bill={lastBill}
          storeInfo={storeInfo}
          onClose={() => setShowInvoice(false)}
        />
      )}

      <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">

        {/* ── LEFT: Inventory Selection ── */}
        <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-dark-600/50">
            <h2 className="text-xl font-bold text-white mb-4">Products &amp; Inventory</h2>
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredInventory.length === 0 && (
              <div className="text-center text-slate-500 py-10">No items found</div>
            )}
            {filteredInventory.map(item => (
              <div key={item._id} className="flex items-center justify-between p-3 rounded-xl bg-dark-700/50 border border-dark-600 hover:border-brand-500/50 transition-colors">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">{item.product_name}</h3>
                  <p className="text-xs text-slate-400">
                    Exp: {new Date(item.expiry_date).toLocaleDateString()} &bull; Stock: {item.quantity}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-accent-400">₹{item.final_price.toFixed(2)}</span>
                    {item.discount_percentage > 0 && (
                      <span className="text-xs text-slate-500 line-through">₹{item.base_price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => addToCart(item)}
                  className="p-2 rounded-lg bg-brand-500/20 text-brand-400 hover:bg-brand-500 hover:text-white transition-all"
                  title="Add to Cart"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Cart / Bill ── */}
        <div className="w-full lg:w-96 glass-panel rounded-2xl flex flex-col shadow-2xl relative overflow-hidden">
          {showReceipt ? (
            /* ── Success View ── */
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-400 mb-2" />
              <h2 className="text-2xl font-bold text-white">Payment Success!</h2>
              <p className="text-sm text-slate-400">Inventory has been updated and bill saved.</p>
              <div className="w-full h-px bg-dark-600/50 my-4" />
              <p className="text-3xl font-extrabold text-accent-400 mb-2">
                ₹{grandTotal.toFixed(2)}
              </p>
              {customerName && (
                <p className="text-sm text-slate-400">Customer: <span className="text-white font-medium">{customerName}</span></p>
              )}
              <div className="flex w-full gap-3 mt-4">
                <button
                  onClick={() => setShowInvoice(true)}
                  className="flex-1 py-2 px-4 rounded-xl border border-brand-500 text-brand-400 hover:bg-brand-500/10 flex justify-center items-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4" /> View Invoice
                </button>
                <button onClick={resetBilling} className="flex-1 btn-primary py-2 px-4">
                  New Bill
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Header */}
              <div className="p-4 border-b border-dark-600/50 flex justify-between items-center bg-dark-800/80">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-brand-400" />
                  <h2 className="text-lg font-bold text-white">Current Bill</h2>
                </div>
                <span className="bg-dark-700 text-slate-300 text-xs px-2 py-1 rounded-md">{cart.length} items</span>
              </div>

              {/* Customer Name */}
              <div className="px-4 pt-3">
                <input
                  type="text"
                  placeholder="Customer name (optional)"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="input-field w-full text-sm"
                />
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3 opacity-50">
                    <ShoppingCart className="w-12 h-12" />
                    <p>Cart is empty</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item._id} className="flex flex-col space-y-2 pb-3 border-b border-dark-600/30 last:border-0">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold text-slate-200 line-clamp-1 flex-1 mr-2">{item.product_name}</span>
                        <span className="text-sm font-bold text-slate-200">₹{(item.final_price * item.cartQuantity).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-400">@ ₹{item.final_price.toFixed(2)}/ea</p>
                        <div className="flex items-center gap-3 bg-dark-800 rounded-lg p-1 border border-dark-600">
                          <button onClick={() => updateCartQuantity(item._id, -1)} className="p-1 hover:text-brand-400 transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.cartQuantity}</span>
                          <button onClick={() => updateCartQuantity(item._id, 1)} className="p-1 hover:text-brand-400 transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                          <div className="w-px h-4 bg-dark-600 mx-1" />
                          <button onClick={() => removeFromCart(item._id)} className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals & Checkout */}
              <div className="p-4 border-t border-dark-600/50 bg-dark-800/80 space-y-2">
                {/* Tax & Discount inputs */}
                <div className="grid grid-cols-2 gap-2 mb-1">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Tax (%)</label>
                    <input
                      type="number"
                      min="0" max="100"
                      value={taxPercent}
                      onChange={e => setTaxPercent(Math.max(0, Number(e.target.value)))}
                      className="input-field w-full text-sm py-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Discount (%)</label>
                    <input
                      type="number"
                      min="0" max="100"
                      value={discountPercent}
                      onChange={e => setDiscountPercent(Math.max(0, Number(e.target.value)))}
                      className="input-field w-full text-sm py-1.5"
                    />
                  </div>
                </div>

                <div className="flex justify-between text-sm text-slate-400">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {taxPercent > 0 && (
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Tax ({taxPercent}%)</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {discountPercent > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Discount ({discountPercent}%)</span>
                    <span>- ₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-dark-600/50">
                  <span className="text-lg font-bold text-white">Total</span>
                  <span className="text-2xl font-extrabold text-accent-400">₹{grandTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || checkingOut}
                  className="w-full btn-primary py-3 text-lg mt-2 relative overflow-hidden group"
                >
                  <span className="relative z-10">{checkingOut ? 'Processing...' : 'Checkout Now'}</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
