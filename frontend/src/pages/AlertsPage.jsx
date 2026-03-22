import { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { ShieldAlert, AlertTriangle, TrendingDown, BellRing, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState({ expired: [], expiring_soon: [], low_stock: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/alerts')
      .then(r => setAlerts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalAlerts = alerts.expired.length + alerts.expiring_soon.length + alerts.low_stock.length;

  const renderSection = (title, items, icon, colorClass, borderClass, badgeType) => {
    const Icon = icon;
    return (
      <div className={`glass-panel rounded-2xl border-l-4 ${borderClass} overflow-hidden`}>
        <div className="p-4 bg-dark-800/80 border-b border-dark-600/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-dark-700 ${colorClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
          </div>
          <span className="bg-dark-900 border border-dark-600 text-slate-300 text-xs font-bold px-3 py-1 rounded-full">
            {items.length} items
          </span>
        </div>
        
        <div className="p-0 overflow-x-auto">
          {items.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500/50 mb-3" />
              <p className="text-slate-400 font-medium">All clear! No issues found here.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-800/30 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-dark-600/30">
                  <th className="py-3 px-6">Product Item</th>
                  <th className="py-3 px-6">Quantity</th>
                  <th className="py-3 px-6">Status / Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600/30">
                {items.map((item, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    key={item._id} className="hover:bg-dark-700/30 transition-colors"
                  >
                    <td className="py-3 px-6 text-sm font-medium text-slate-200">{item.product_name}</td>
                    <td className="py-3 px-6 text-sm text-slate-400">{item.quantity}</td>
                    <td className="py-3 px-6 text-sm">
                      <StatusBadge type={badgeType} value={badgeType === 'Expiring Soon' ? `Expires: ${new Date(item.expiry_date).toLocaleDateString()}` : null} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="w-8 h-8 rounded-full border-4 border-dark-600 border-t-brand-500 animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-600/50 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BellRing className="w-7 h-7 text-brand-500" /> Notifications & Alerts
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review items requiring immediate attention.</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          {totalAlerts} Total Alerts
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderSection('Critical: Expired', alerts.expired, ShieldAlert, 'text-red-500', 'border-red-500', 'Expired')}
        {renderSection('Warning: Expiring Soon', alerts.expiring_soon, AlertTriangle, 'text-yellow-500', 'border-yellow-500', 'Expiring Soon')}
        {renderSection('Notice: Low Stock', alerts.low_stock, TrendingDown, 'text-orange-500', 'border-orange-500', 'Low Stock')}
      </div>
    </div>
  );
}
