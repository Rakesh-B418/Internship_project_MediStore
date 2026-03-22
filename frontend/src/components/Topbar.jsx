import { useState, useEffect, useRef } from 'react';
import { Search, BellRing, AlertTriangle, Clock, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Topbar() {
  const { username } = useAuth();
  const [alerts, setAlerts] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/alerts');
        setAlerts(res.data);
      } catch (err) {
        console.error('Failed to fetch alerts', err);
      }
    };
    fetchAlerts();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalAlerts = alerts ? alerts.summary.expired_count + alerts.summary.expiring_soon_count + alerts.summary.low_stock_count : 0;
  const displayAlerts = alerts ? [...alerts.expired, ...alerts.expiring_soon, ...alerts.low_stock].slice(0, 5) : [];

  return (
    <header className="h-16 px-6 glass-card border-x-0 border-t-0 rounded-none flex items-center justify-between sticky top-0 z-30">
      
      {/* Search Bar */}
      <div className="flex-1 max-w-md hidden sm:flex items-center relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3" />
        <input 
          type="text" 
          placeholder="Quick search anywhere..." 
          className="w-full bg-dark-900/50 border border-dark-600/50 rounded-full py-1.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-auto">
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-dark-700 transition-colors relative"
          >
            <BellRing className="w-5 h-5" />
            {totalAlerts > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-dark-800">
                {totalAlerts > 9 ? '9+' : totalAlerts}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl shadow-2xl border border-dark-600/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-dark-600/50 flex items-center justify-between bg-dark-800/50">
                <h3 className="font-semibold text-white">Notifications</h3>
                <span className="text-xs font-medium text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
                  {totalAlerts} New
                </span>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {displayAlerts.length > 0 ? (
                  displayAlerts.map((alert, idx) => (
                    <div key={alert._id || idx} className="p-4 border-b border-dark-600/30 hover:bg-dark-700/50 transition-colors cursor-default group">
                      <div className="flex gap-3">
                        <div className={`mt-0.5 shrink-0 ${alert.quantity < 10 ? 'text-orange-400' : 'text-red-400'}`}>
                          {alert.quantity < 10 ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{alert.product_name}</p>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {alert.quantity < 10 ? `Low stock! Only ${alert.quantity} remaining.` : `Attention! Item expires on ${alert.expiry_date}.`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <BellRing className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">You have no new notifications.</p>
                  </div>
                )}
              </div>
              
              {totalAlerts > 5 && (
                <div className="p-2 border-t border-dark-600/50 bg-dark-800/30 text-center">
                  <a href="/alerts" className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors">
                    View all alerts
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-dark-600/50 hidden sm:block"></div>

        <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-dark-700 border border-transparent hover:border-dark-600 transition-all">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <span className="text-sm font-bold text-white uppercase">{username?.[0] || 'U'}</span>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-semibold text-slate-200 leading-tight">{username}</span>
            <span className="text-xs text-slate-500 font-medium">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
}
