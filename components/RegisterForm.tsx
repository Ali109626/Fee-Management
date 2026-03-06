
import React, { useState } from 'react';
import { ShieldPlus, Mail, Lock, School, ArrowRight, UserCheck } from 'lucide-react';

interface RegisterFormProps {
  onRegister: (data: any) => void;
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onSwitchToLogin }) => {
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    // Simulate setup
    setTimeout(() => {
      onRegister({ schoolName, email, password });
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom duration-500">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
          
          <div className="p-8 pt-10 text-center bg-gradient-to-b from-indigo-50/50 to-white">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-indigo-200 mx-auto mb-6">
              APS
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Setup Admin Account</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Initialize your school management system</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 animate-shake text-xs font-bold">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">School Name</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <School size={18} />
                </div>
                <input 
                  required
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/30 text-slate-800 font-bold text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                  placeholder="Ali Public School"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/30 text-slate-800 font-bold text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                  placeholder="admin@school.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/30 text-slate-800 font-bold text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all"
                    placeholder="••••••"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <ShieldPlus size={18} />
                  </div>
                  <input 
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/30 text-slate-800 font-bold text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all"
                    placeholder="••••••"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserCheck size={18} /> Register & Continue <ArrowRight size={18} />
                </>
              )}
            </button>
            
            <div className="text-center pt-2">
              <button 
                type="button"
                onClick={onSwitchToLogin}
                className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
              >
                Already have an account? <span className="underline">Login Here</span>
              </button>
            </div>
          </form>

          <div className="px-8 pb-10 text-center">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Data is stored locally on this device.<br />
              Secure and private initialization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
