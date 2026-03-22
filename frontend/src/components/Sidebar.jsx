import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Archive, 
  BellRing, 
  PieChart, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Settings,
  ShoppingBag
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products',  icon: Package,         label: 'Medicines' },
  { to: '/billing',   icon: ShoppingBag,     label: 'Billing / POS' },
  { to: '/inventory', icon: Archive,         label: 'Inventory' },
  { to: '/alerts',    icon: BellRing,       label: 'Alerts' },
  { to: '/analytics', icon: PieChart,        label: 'Analytics' },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
];

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 250 : 80 }}
      className="hidden md:flex flex-col bg-dark-800 border-r border-dark-600/50 min-h-screen fixed top-0 left-0 z-40 transition-all duration-300 shadow-xl"
    >
      {/* Brand */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-dark-600/50">
        <div className={`flex items-center overflow-hidden transition-all ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
          <ShieldCheck className="w-8 h-8 text-brand-500 mr-2 shrink-0" />
          <span className="text-xl font-bold bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent tracking-wide">
            SupplySense
          </span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg bg-dark-700/50 text-slate-400 hover:text-white hover:bg-dark-600 transition-colors shrink-0 mx-auto"
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ShieldCheck className="w-6 h-6 text-brand-500" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        <div className={`text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3 ${!isOpen && 'hidden'}`}>
          Main Menu
        </div>
        
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              relative flex items-center p-3 rounded-xl transition-all duration-200 group
              ${isActive 
                ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-inner' 
                : 'text-slate-400 hover:bg-dark-700 hover:text-white border border-transparent'}
            `}
            title={!isOpen ? label : ''}
          >
            <Icon className={`w-5 h-5 shrink-0 ${isOpen ? 'mr-3' : 'mx-auto'}`} />
            <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
              {label}
            </span>
          </NavLink>
        ))}
      </div>

      {/* User Section & Logout */}
      <div className="p-3 border-t border-dark-600/50">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full p-3 rounded-xl transition-colors duration-200 group text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20`}
          title={!isOpen ? "Logout" : ""}
        >
          <LogOut className={`w-5 h-5 shrink-0 ${isOpen ? 'mr-3' : 'mx-auto'}`} />
          <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
            Logout
          </span>
        </button>
      </div>
    </motion.aside>
  );
}
