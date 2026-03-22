import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { PackageSearch, Plus, Search, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', price: '' });
  const [editId, setEditId] = useState(null);

  const fetchProducts = useCallback(() => {
    api.get('/products', { params: { search } })
      .then(r => setProducts(r.data))
      .catch(err => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => { setForm({ name: '', category: '', price: '' }); setEditId(null); setModal('add'); };
  const openEdit = (p) => { setForm({ name: p.name, category: p.category, price: p.price }); setEditId(p._id); setModal('edit'); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal === 'add') {
        await api.post('/products', form);
        toast.success('Product added successfully');
      } else {
        await api.put(`/products/${editId}`, form);
        toast.success('Product updated');
      }
      setModal(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <PackageSearch className="w-7 h-7 text-brand-500" /> Medicines Catalog
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage all your medicine templates here.</p>
        </div>
        <button onClick={openAdd} className="btn-primary shrink-0">
          <Plus className="w-5 h-5" /> Add New Product
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-dark-600/50 flex items-center justify-between bg-dark-800/50">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Search medicines by name or category..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 h-10 py-0"
            />
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Showing <span className="text-slate-200 font-medium">{products.length}</span> medicines
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-800/80 border-b border-dark-600/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6 w-1/3">Name</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Base Price</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-600/30">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center"><div className="w-8 h-8 rounded-full border-4 border-dark-600 border-t-brand-500 animate-spin mx-auto"></div></td></tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-slate-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                products.map((p, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    key={p._id} className="hover:bg-dark-700/30 transition-colors group"
                  >
                    <td className="py-3 px-6 text-sm font-medium text-slate-200">{p.name}</td>
                    <td className="py-3 px-6 text-sm text-slate-400">
                      <span className="px-2.5 py-1 rounded-md bg-dark-700 border border-dark-600 text-xs">{p.category}</span>
                    </td>
                    <td className="py-3 px-6 text-sm text-slate-300 font-medium">₹{p.price.toFixed(2)}</td>
                    <td className="py-3 px-6 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 transition-colors inline-block" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors inline-block" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={() => setModal(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel w-full max-w-lg rounded-2xl relative z-10 overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-dark-600/50 flex justify-between items-center bg-dark-800/80">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {modal === 'add' ? <Plus className="w-5 h-5 text-brand-500" /> : <Edit2 className="w-5 h-5 text-brand-500" />}
                  {modal === 'add' ? 'Add New Product' : 'Edit Product'}
                </h2>
                <button onClick={() => setModal(null)} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-dark-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-dark-900">
                <div>
                  <label className="label-text">Product Name</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder="e.g. Organic Milk" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Category</label>
                    <input type="text" required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field" placeholder="e.g. Dairy" />
                  </div>
                  <div>
                    <label className="label-text">Base Price (₹)</label>
                    <input type="number" step="0.01" min="0" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input-field" placeholder="0.00" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-dark-600/50 mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{modal === 'add' ? 'Add Product' : 'Save Changes'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
