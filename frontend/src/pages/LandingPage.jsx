import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Package, Clock, ArrowRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function LandingPage() {
  const [stats, setStats] = useState({
    total_medicines: 0,
    expired_medicines: 0,
    near_expiry: 0
  });

  useEffect(() => {
    // Optionally fetch even if not logged in
    api.get('/alerts/summary')
      .then(res => setStats(res.data))
      .catch(err => console.error("Error fetching stats:", err));
  }, []);

  const features = [
    {
      title: "Expiry Tracking System",
      description: "Automatically categorize medicines by safe, expiring soon, and already expired status.",
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    },
    {
      title: "Inventory Management",
      description: "Manage medicines securely with batch quantity tracking and auto-discount application.",
      icon: Package,
      color: "text-brand-400",
      bg: "bg-brand-500/10"
    },
    {
      title: "Real-time Metrics",
      description: "Track the total health of your medical store via an interactive real-time dashboard.",
      icon: Activity,
      color: "text-green-400",
      bg: "bg-green-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-dark-900 overflow-hidden relative selection:bg-brand-500/30">
      {/* Background Gradients */}
      <div 
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          background: "linear-gradient(-45deg, #0f172a, #1e1b4b, #0a0f1e, #312e81)",
          backgroundSize: "400% 400%",
          animation: "bg-gradient 15s ease infinite"
        }}
      />
      
      {/* Navbar Minimal */}
      <nav className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-brand-500" />
          <span className="text-xl font-bold bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
            SupplySense
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">Sign In</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Smart Medical Store <br />
            <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">Management System</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
            The next generation of pharmacy inventory management. Streamlined tracking, expiry alerts, and automated billing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary px-8 py-4 text-lg w-full sm:w-auto">
              Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link to="/login" className="btn-secondary px-8 py-4 text-lg w-full sm:w-auto bg-dark-800/50 backdrop-blur-md">
              Login to Dashboard
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Live Stats Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 mb-24">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel p-8 rounded-3xl border border-dark-600/50 shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          <div>
            <div className="text-4xl font-extrabold text-white mb-2">{stats.total_medicines}</div>
            <div className="text-slate-400 font-medium">Medicines Available</div>
          </div>
          <div className="md:border-x border-dark-600/50">
            <div className="text-4xl font-extrabold text-amber-400 mb-2">{stats.near_expiry}</div>
            <div className="text-slate-400 font-medium">Near-Expiry Alerts</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-red-400 mb-2">{stats.expired_medicines}</div>
            <div className="text-slate-400 font-medium">Expired Inventory</div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Core Features</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Everything you need to run your pharmacy efficiently, securely, and smartly.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6 border border-dark-600/30 hover:bg-dark-800/50 transition-colors group"
            >
              <div className={`w-12 h-12 rounded-xl ${feat.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feat.icon className={`w-6 h-6 ${feat.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Simplistic Footer */}
      <footer className="relative z-10 border-t border-dark-700/50 p-6 text-center text-slate-500 text-sm bg-dark-900/50">
        &copy; 2026 SupplySense. All rights reserved. Built with Intelligence.
      </footer>
    </div>
  );
}
