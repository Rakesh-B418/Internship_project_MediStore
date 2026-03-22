import { useState, useEffect } from 'react';
import api from '../services/api';
import { Settings, Save, Plus, Trash2, Store } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingStore, setSavingStore] = useState(false);

  // Store info state
  const [storeInfo, setStoreInfo] = useState({
    store_name: '',
    address: '',
    phone: '',
    email: '',
    gstin: '',
  });

  useEffect(() => {
    Promise.all([
      api.get('/settings/discount'),
      api.get('/settings/store-info'),
    ]).then(([discRes, storeRes]) => {
      setRules(discRes.data);
      setStoreInfo(storeRes.data);
    }).catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  // ── Discount rule handlers ────────────────────────────────────────────────

  const handleAddRule = () => setRules([...rules, { days: '', discount: '' }]);

  const handleRemoveRule = (index) => setRules(rules.filter((_, i) => i !== index));

  const handleChange = (index, field, value) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    setRules(newRules);
  };

  const handleSaveDiscount = async () => {
    if (rules.some(r => r.days === '' || r.discount === '')) {
      return toast.error('Please fill all fields');
    }
    const formatted = rules.map(r => ({
      days: parseInt(r.days, 10),
      discount: parseFloat(r.discount)
    })).sort((a, b) => a.days - b.days);

    setSaving(true);
    try {
      await api.put('/settings/discount', formatted);
      setRules(formatted);
      toast.success('Discount rules updated successfully');
    } catch {
      toast.error('Failed to save discount settings');
    } finally {
      setSaving(false);
    }
  };

  // ── Store info handlers ───────────────────────────────────────────────────

  const handleStoreChange = (field, value) => {
    setStoreInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveStoreInfo = async () => {
    setSavingStore(true);
    try {
      await api.put('/settings/store-info', storeInfo);
      // Cache in localStorage so BillingPage can use it instantly
      localStorage.setItem('store_info', JSON.stringify(storeInfo));
      toast.success('Store information saved');
    } catch {
      toast.error('Failed to save store information');
    } finally {
      setSavingStore(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* ── Page Header ── */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-brand-500/20 rounded-xl">
          <Settings className="w-6 h-6 text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Configure application behaviour, store details, and discount logic.</p>
        </div>
      </div>

      {/* ── Store Information Card ── */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-400/10 rounded-xl">
              <Store className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Store / Clinic Information</h2>
              <p className="text-xs text-slate-400 mt-0.5">Appears on printed invoices and bills.</p>
            </div>
          </div>
          <button
            onClick={handleSaveStoreInfo}
            disabled={savingStore}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" />
            {savingStore ? 'Saving...' : 'Save Info'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Store / Clinic Name *
            </label>
            <input
              type="text"
              value={storeInfo.store_name}
              onChange={e => handleStoreChange('store_name', e.target.value)}
              className="input-field w-full"
              placeholder="e.g. City Medical Pharmacy"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Phone Number
            </label>
            <input
              type="text"
              value={storeInfo.phone}
              onChange={e => handleStoreChange('phone', e.target.value)}
              className="input-field w-full"
              placeholder="e.g. +91-9876543210"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Address / Tagline
            </label>
            <input
              type="text"
              value={storeInfo.address}
              onChange={e => handleStoreChange('address', e.target.value)}
              className="input-field w-full"
              placeholder="e.g. 12 MG Road, Bengaluru – 560001"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
              Email Address
            </label>
            <input
              type="email"
              value={storeInfo.email}
              onChange={e => handleStoreChange('email', e.target.value)}
              className="input-field w-full"
              placeholder="e.g. store@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 block">
              GSTIN (optional)
            </label>
            <input
              type="text"
              value={storeInfo.gstin}
              onChange={e => handleStoreChange('gstin', e.target.value.toUpperCase())}
              className="input-field w-full font-mono"
              placeholder="e.g. 29ABCDE1234F1Z5"
              maxLength={15}
            />
          </div>
        </div>
      </div>

      {/* ── Discount Rules Card ── */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Dynamic Expiry Discounts</h2>
            <p className="text-sm text-slate-400 mt-1">
              Automatic discounts applied to items as they approach their expiry date.
              Rules are evaluated from lowest days to highest.
            </p>
          </div>
          <button
            onClick={handleSaveDiscount}
            disabled={saving}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Rules'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500 px-2">
            <div className="col-span-5">Days Remaining (≤)</div>
            <div className="col-span-6">Discount Percentage (%)</div>
            <div className="col-span-1 text-center">Del</div>
          </div>

          {rules.length === 0 && (
            <div className="text-center p-6 border border-dashed border-dark-600 rounded-xl text-slate-500">
              No discount rules configured.
            </div>
          )}

          {rules.map((rule, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-4 items-center group">
              <div className="col-span-5 relative">
                <input
                  type="number"
                  min="0"
                  value={rule.days}
                  onChange={(e) => handleChange(idx, 'days', e.target.value)}
                  className="input-field w-full pl-6"
                  placeholder="e.g. 5"
                />
                <span className="absolute left-3 top-2.5 text-slate-500 text-sm">≤</span>
              </div>
              <div className="col-span-6 relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={rule.discount}
                  onChange={(e) => handleChange(idx, 'discount', e.target.value)}
                  className="input-field w-full pr-8"
                  placeholder="e.g. 30"
                />
                <span className="absolute right-3 top-2.5 text-slate-500 text-sm">%</span>
              </div>
              <div className="col-span-1 flex justify-center">
                <button
                  onClick={() => handleRemoveRule(idx)}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddRule}
            className="mt-4 flex items-center gap-2 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors px-2 py-1"
          >
            <Plus className="w-4 h-4" /> Add Discount Rule
          </button>
        </div>
      </div>
    </div>
  );
}
