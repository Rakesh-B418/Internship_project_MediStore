import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.username.trim() || !credentials.password.trim()) {
      return toast.error("Username and password are required.");
    }
    if (credentials.password.length < 6) {
      return toast.error("Password must be at least 6 characters long.");
    }
    
    setLoading(true);
    try {
      await login(credentials);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden p-4"
      style={{
        background: "linear-gradient(-45deg, #0f172a, #1e1b4b, #0a0f1e, #312e81)",
        backgroundSize: "400% 400%",
        animation: "bg-gradient 15s ease infinite"
      }}
    >
      
      {/* Animated Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md z-10">
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4 h-32 relative">
             <svg viewBox="0 0 200 200" className="w-32 h-32">
                 {/* Body / Head */}
                 <circle cx="100" cy="100" r="80" fill="#1e293b" stroke="#818cf8" strokeWidth="8" />
                 {/* Eyes */}
                 <motion.g animate={{ x: isPasswordFocused ? -10 : 0 }}>
                     <circle cx="70" cy="80" r="10" fill="#f8fafc" />
                     <circle cx="130" cy="80" r="10" fill="#f8fafc" />
                     <motion.circle cx="70" cy="80" r="4" fill="#0f172a" animate={{ cx: isPasswordFocused ? 66 : 70 }} />
                     <motion.circle cx="130" cy="80" r="4" fill="#0f172a" animate={{ cx: isPasswordFocused ? 126 : 130 }} />
                 </motion.g>
                 {/* Hands Covering Eyes */}
                 <AnimatePresence>
                   {isPasswordFocused && (
                     <motion.g initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
                       <rect x="50" y="65" width="100" height="30" rx="15" fill="#818cf8" />
                     </motion.g>
                   )}
                 </AnimatePresence>
                 {/* Mouth */}
                 <motion.path 
                    d={isPasswordFocused ? "M 80 130 Q 100 120 120 130" : "M 80 120 Q 100 140 120 120"} 
                    stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" fill="none" 
                 />
             </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 mt-2">Sign in to manage your medical store</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <div>
                <label className="label-text">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={credentials.username}
                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    className="input-field pl-10"
                    placeholder="admin"
                  />
                </div>
              </div>

              <div>
                <label className="label-text">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    className="input-field pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-dark-900" />
                <span className="text-sm text-slate-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-brand-400 hover:text-brand-300">Forgot password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-lg mt-4 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
              Create one
            </Link>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-8">
          Smart Inventory & Expiry Management System &copy; 2026
        </p>
      </div>
    </div>
  );
}
