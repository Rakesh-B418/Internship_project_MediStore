import { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Layers, AlertTriangle, Clock, TrendingUp, Package, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/alerts').then(r => setAlerts(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const cards = alerts ? [
    { title: 'Total Medicines',  value: alerts.summary.total_products || 0, icon: Layers,        color: 'text-brand-400',   bg: 'bg-brand-500/10' },
    { title: 'Safe / Healthy',  value: alerts.summary.safe_count || 0,     icon: Package,       color: 'text-green-400',   bg: 'bg-green-500/10' },
    { title: 'Expiring Soon',   value: alerts.expiring_soon.length, icon: Clock,   color: 'text-yellow-400',  bg: 'bg-yellow-500/10' },
    { title: 'Already Expired', value: alerts.expired.length, icon: ShieldAlert,   color: 'text-red-400',     bg: 'bg-red-500/10' },
    { title: 'Low Stock Items', value: alerts.low_stock.length, icon: TrendingUp,  color: 'text-orange-400',  bg: 'bg-orange-500/10' },
  ] : [];

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="w-8 h-8 rounded-full border-4 border-dark-600 border-t-brand-500 animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor your inventory health and alerts in real-time.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="glass-card p-5 hover:-translate-y-1 transition-transform duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">{card.title}</p>
                <h3 className="text-3xl font-bold text-white mt-2">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expiring Soon Preview */}
        <div className="glass-card flex flex-col h-full">
          <div className="p-5 border-b border-dark-600/50 flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Expiring Soon (Next 30 Days)</h2>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-800/50 border-b border-dark-600/50">
                  <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Product</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Qty</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600/30">
                {alerts?.expiring_soon.slice(0, 5).map(item => (
                  <tr key={item._id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="py-3 px-5 text-sm font-medium text-slate-200">{item.product_name}</td>
                    <td className="py-3 px-5 text-sm text-slate-400">{item.quantity}</td>
                    <td className="py-3 px-5 text-sm text-yellow-400">{new Date(item.expiry_date).toLocaleDateString()}</td>
                  </tr>
                )) || <tr><td colSpan="3" className="p-5 text-center text-slate-500 text-sm">No items expiring soon.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expired Items Preview */}
        <div className="glass-card flex flex-col h-full">
          <div className="p-5 border-b border-dark-600/50 flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Critical: Already Expired</h2>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-800/50 border-b border-dark-600/50">
                  <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Product</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Qty</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600/30">
                {alerts?.expired.slice(0, 5).map(item => (
                  <tr key={item._id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="py-3 px-5 text-sm font-medium text-slate-200">{item.product_name}</td>
                    <td className="py-3 px-5 text-sm text-slate-400">{item.quantity}</td>
                    <td className="py-3 px-5 text-sm text-red-400"><StatusBadge type="Expired" /></td>
                  </tr>
                )) || <tr><td colSpan="3" className="p-5 text-center text-slate-500 text-sm">No expired items. Great job!</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Items Preview */}
        <div className="glass-card flex flex-col h-full">
          <div className="p-5 border-b border-dark-600/50 flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Low Stock Alerts</h2>
          </div>
          <div className="p-0 overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-800/50 border-b border-dark-600/50">
                  <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Product</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Qty</th>
                  <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600/30">
                {alerts?.low_stock.slice(0, 5).map(item => (
                  <tr key={item._id} className="hover:bg-dark-700/30 transition-colors">
                    <td className="py-3 px-5 text-sm font-medium text-slate-200">{item.product_name}</td>
                    <td className="py-3 px-5 text-sm text-slate-400">{item.quantity}</td>
                    <td className="py-3 px-5 text-sm text-orange-400"><StatusBadge type="Low Stock" /></td>
                  </tr>
                )) || <tr><td colSpan="3" className="p-5 text-center text-slate-500 text-sm">No low stock items.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
