
import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, Eye, EyeOff, ShieldCheck, Users, GraduationCap } from 'lucide-react';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { UserRole, Student, Admin } from '../types';

interface LoginFormProps {
  onLogin: (success: boolean, role?: UserRole, studentData?: Student | null, adminData?: Admin | null) => void;
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToRegister }) => {
  const [loginType, setLoginType] = useState<UserRole>('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [portalId, setPortalId] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (loginType === 'Admin') {
        let adminData: Admin | null = null;

        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
          
          if (adminDoc.exists()) {
            adminData = { id: userCredential.user.uid, ...adminDoc.data() } as Admin;
          }
        } catch (authErr: any) {
          console.warn('Firebase Auth sign-in unavailable or failed, checking Firestore:', authErr?.code || authErr);
          
          // Check Firestore admins collection for matching email
          const adminsRef = collection(db, 'admins');
          const q = query(adminsRef, where('email', '==', email.trim().toLowerCase()));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const matchedDoc = querySnapshot.docs[0];
            const data = matchedDoc.data();
            if (data.password && data.password !== password) {
              setError('Invalid password. Please check your credentials.');
              setIsLoading(false);
              return;
            }
            adminData = { id: matchedDoc.id, ...data } as Admin;
          }
        }

        if (adminData) {
          onLogin(true, 'Admin', null, adminData);
        } else {
          setError('Admin record not found. Please register your school account first.');
          setIsLoading(false);
        }
      } else {
        // Student Login via Portal ID
        const studentsRef = collection(db, 'students');
        const q = query(studentsRef, where('portalId', '==', portalId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const studentData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Student;
          onLogin(true, 'Student', studentData);
        } else {
          setError('Invalid Portal ID. Please check and try again.');
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom duration-500">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="p-8 pt-10 text-center bg-gradient-to-b from-indigo-50/50 to-white">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-indigo-200 mx-auto mb-6">
              APS
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Welcome Back</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Sign in to Ali Public School Portal</p>
          </div>

          {/* Login Type Switcher */}
          <div className="px-8 flex p-1 bg-slate-100 rounded-2xl mx-8 mt-2">
            <button
              onClick={() => setLoginType('Admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${
                loginType === 'Admin' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users size={14} /> Admin
            </button>
            <button
              onClick={() => setLoginType('Student')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${
                loginType === 'Student' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <GraduationCap size={14} /> Student
            </button>
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
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input 
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/30 text-slate-800 font-bold text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                      placeholder="admin@aps.edu"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/30 text-slate-800 font-bold text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
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
                    onChange={(e) => setPortalId(e.target.value.toUpperCase())}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/30 text-slate-800 font-bold text-sm focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                    placeholder="APS-G5-101"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-bold mt-2 ml-1">Enter the Portal ID provided by your school administration.</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
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
                  className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  Don't have an account? <span className="text-indigo-600 font-black">Register School</span>
                </button>
              </div>
            )}
          </form>

          {/* Footer Info */}
          <div className="px-8 pb-10 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Proprietary Management Software<br />
              © 2024 Ali Public School Systems
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
