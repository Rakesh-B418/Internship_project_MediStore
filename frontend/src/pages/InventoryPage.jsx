import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Archive, Plus, ArrowUpDown, X, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('expiry_date');

  const [modalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product_id: '', quantity: '', expiry_date: '' });

  const fetchInventory = useCallback(() => {
    api.get('/inventory', { params: { sort_by: sortBy } })
      .then(r => setItems(r.data))
      .catch(err => toast.error('Failed to load inventory'))
      .finally(() => setLoading(false));
  }, [sortBy]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const openModal = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
      setForm({ product_id: '', quantity: '', expiry_date: '' });
      setModalOpen(true);
    } catch { toast.error("Failed to load product list"); }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory', form);
      toast.success('Stock added successfully');
      setModalOpen(false);
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Archive className="w-7 h-7 text-brand-500" /> Inventory Tracker
          </h1>
          <p className="text-slate-400 text-sm mt-1">Track stock levels, expiry dates, and auto-applied discounts.</p>
        </div>
        <button onClick={openModal} className="btn-primary shrink-0">
          <Plus className="w-5 h-5" /> Add Stock
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-dark-600/50 flex items-center justify-between bg-dark-800/50">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Sort by:</span>
            <select 
              className="bg-dark-900 border border-dark-600 rounded-lg text-sm text-slate-200 px-3 py-1.5 focus:outline-none focus:border-brand-500 transition-colors"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="expiry_date">Expiry Date</option>
              <option value="quantity">Quantity</option>
              <option value="product_name">Product Name</option>
              <option value="base_price">Price</option>
            </select>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            <span className="text-slate-200 font-medium">{items.length}</span> batches tracked
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-800/80 border-b border-dark-600/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-6 text-center">Batch Qty</th>
                <th className="py-4 px-6">Expiry Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Pricing Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600/30">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center"><div className="w-8 h-8 rounded-full border-4 border-dark-600 border-t-brand-500 animate-spin mx-auto"></div></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-slate-500">No inventory tracking records. Add some stock!</td></tr>
              ) : (
                items.map((item, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    key={item._id} className="hover:bg-dark-700/30 transition-colors"
                  >
                    <td className="py-3 px-6">
                      <div className="font-medium text-slate-200">{item.product_name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.category}</div>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-sm font-medium border ${item.quantity < 10 ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-dark-700 text-slate-300 border-dark-600'}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-sm text-slate-300">{new Date(item.expiry_date).toLocaleDateString()}</td>
                    <td className="py-3 px-6"><StatusBadge type={item.expiry_status} /></td>
                    <td className="py-3 px-6 text-right">
                      {item.discount_percentage > 0 ? (
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-accent-400 flex items-center gap-1"><Tag className="w-3 h-3"/> ₹{item.final_price?.toFixed(2) || '0.00'}</span>
                          <span className="text-xs text-slate-500 line-through">₹{item.base_price?.toFixed(2)}</span>
                          <span className="text-[10px] bg-accent-500/20 text-accent-400 px-1.5 rounded mt-1">-{item.discount_percentage}% OFF</span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-slate-300">₹{item.base_price?.toFixed(2) || '0.00'}</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel w-full max-w-lg rounded-2xl relative z-10 overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-dark-600/50 flex justify-between items-center bg-dark-800/80">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-brand-500" /> Receive Stock
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-dark-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddStock} className="p-6 space-y-4 bg-dark-900">
                <div>
                  <label className="label-text">Select Product</label>
                  <select required value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} className="input-field">
                    <option value="" disabled>-- Choose Product --</option>
                    {products.map(p => <option key={p._id} value={p._id}>{p.name} (₹{p.price.toFixed(2)})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Batch Quantity</label>
                    <input type="number" min="1" required value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="input-field" placeholder="100" />
                  </div>
                  <div>
                    <label className="label-text">Expiry Date (Batch)</label>
                    <input type="date" required value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} className="input-field [color-scheme:dark]" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-dark-600/50 mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Add Batch</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
