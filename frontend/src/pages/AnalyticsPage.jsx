import { useState, useEffect } from 'react';
import api from '../services/api';
import { PieChart as PieChartIcon, TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-800/90 backdrop-blur border border-dark-600 p-3 rounded-lg shadow-xl">
        <p className="text-slate-200 font-semibold mb-1">{label}</p>
        <p className="text-brand-400 text-sm font-medium">Sold: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="w-8 h-8 rounded-full border-4 border-dark-600 border-t-brand-500 animate-spin"></div>
    </div>
  );

  const pieData = [
    { name: 'Healthy Value', value: 15000, color: '#22c55e' }, // Placeholder for ratio demonstration
    { name: 'Expiry Loss', value: data?.expiry_loss?.total_loss || 0, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-dark-600/50 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <PieChartIcon className="w-7 h-7 text-brand-500" /> Sales & Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-1">Data-driven insights to optimize your inventory.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Loss Metric Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="text-slate-400 font-medium tracking-wide">Financial Expiry Loss</h3>
          </div>
          <p className="text-4xl font-extrabold text-white mt-2">₹{(data?.expiry_loss?.total_loss || 0).toFixed(2)}</p>
          <p className="text-sm text-red-400 mt-2 font-medium">Value of heavily discounted/expired stock</p>
        </motion.div>

        {/* Expiry Loss Breakdown Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-2xl md:col-span-2 flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest self-start mb-4">Inventory Value Ratio</h3>
          <div className="w-full h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} itemStyle={{ color: '#e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Most Sold Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6 rounded-2xl md:col-span-3">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-bold text-white">Top Performing Products</h3>
          </div>
          <div className="w-full h-[300px]">
            {data?.most_sold?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.most_sold} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="product_name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.2 }} />
                  <Bar dataKey="total_sold" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">Not enough sales data available.</div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
