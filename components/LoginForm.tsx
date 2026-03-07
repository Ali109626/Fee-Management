
import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, Eye, EyeOff, ShieldCheck, GraduationCap, UserCircle } from 'lucide-react';
import { Student, UserRole, Admin } from '../types';
import { api } from '../services/api';

interface LoginFormProps {
  onLogin: (success: boolean, role?: UserRole, student?: Student | null, admin?: Admin | null) => void;
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToRegister }) => {
  const [loginType, setLoginType] = useState<'Admin' | 'Student'>('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [portalId, setPortalId] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  React.useEffect(() => {
    fetch('/api/health')
      .then(res => res.ok ? setServerStatus('online') : setServerStatus('offline'))
      .catch(() => setServerStatus('offline'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await api.login({ email, password, portalId, loginType });
      onLogin(true, data.role, data.role === 'Student' ? data.user : null, data.role === 'Admin' ? data.user : null);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom duration-500">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="p-8 pt-10 text-center bg-gradient-to-b from-slate-50 to-white">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl mx-auto mb-6 transition-colors ${
              loginType === 'Admin' ? 'bg-green-600 shadow-green-200' : 'bg-indigo-600 shadow-indigo-200'
            }`}>
              SMS
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {loginType === 'Admin' ? 'Admin Portal' : 'Student Portal'}
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-1">
              {loginType === 'Admin' ? 'Sign in to manage your school' : 'Enter your ID to access your records'}
            </p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                serverStatus === 'online' ? 'bg-green-500' : 
                serverStatus === 'offline' ? 'bg-red-500' : 'bg-slate-300 animate-pulse'
              }`} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Server: {serverStatus}
              </span>
            </div>
          </div>

          {/* Login Type Toggle */}
          <div className="px-8 pb-2">
            <div className="flex p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => { setLoginType('Admin'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  loginType === 'Admin' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <UserCircle size={16} /> Admin
              </button>
              <button
                type="button"
                onClick={() => { setLoginType('Student'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  loginType === 'Student' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <GraduationCap size={16} /> Student
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 animate-shake">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="text-xs font-bold leading-relaxed">{error}</p>
              </div>
            )}

            {loginType === 'Admin' ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input 
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/30 text-slate-800 font-bold text-sm focus:border-green-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                      placeholder="admin@school.edu"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/30 text-slate-800 font-bold text-sm focus:border-green-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Portal ID</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <GraduationCap size={18} />
                  </div>
                  <input 
                    required
                    type="text"
                    value={portalId}
                    onChange={(e) => setPortalId(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/30 text-slate-800 font-bold text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                    placeholder="SCHOOL-ID-101"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium ml-1">Ask your school administrator for your unique Portal ID.</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 text-white rounded-2xl text-sm font-black shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 ${
                loginType === 'Admin' ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck size={18} /> {loginType === 'Admin' ? 'Secure Login' : 'Access Portal'}
                </>
              )}
            </button>
            
            {loginType === 'Admin' && (
              <div className="text-center pt-2">
                <button 
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-xs font-bold text-slate-400 hover:text-green-600 transition-colors"
                >
                  Don't have an account? <span className="underline">Register Now</span>
                </button>
              </div>
            )}
          </form>

          <div className="px-8 pb-10 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Proprietary Management Software<br />
              © 2024 School Management Systems
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
