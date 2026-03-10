
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import FeeManagement from './components/FeeManagement';
import Reports from './components/Reports';
import Receipt from './components/Receipt';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import StudentPortal from './components/StudentPortal';
import { Student, FeeRecord, UserRole, Admin } from './types';
import { INITIAL_STUDENTS, INITIAL_FEES } from './constants';
import { auth, db, isFirebaseConfigured } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  query,
  where
} from 'firebase/firestore';
import { AlertCircle, Settings, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [role, setRole] = useState<UserRole>('Admin');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allFees, setAllFees] = useState<FeeRecord[]>([]);

  // Configuration check
  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden p-10 text-center">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-4">Firebase Setup Required</h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
            To use this application, you must configure your Firebase environment variables. 
            Please follow the setup instructions in the documentation.
          </p>
          
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-2xl p-6 text-left">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Settings size={14} /> Required Variables
              </h3>
              <ul className="text-xs font-bold text-slate-600 space-y-2">
                <li>• VITE_FIREBASE_API_KEY</li>
                <li>• VITE_FIREBASE_AUTH_DOMAIN</li>
                <li>• VITE_FIREBASE_PROJECT_ID</li>
                <li>• VITE_FIREBASE_STORAGE_BUCKET</li>
                <li>• VITE_FIREBASE_MESSAGING_SENDER_ID</li>
                <li>• VITE_FIREBASE_APP_ID</li>
              </ul>
            </div>
            
            <a 
              href="https://console.firebase.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              Open Firebase Console <ExternalLink size={16} />
            </a>
            
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-4">
              Set these in the "Settings" menu of AI Studio
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Auth State Listener
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch admin details from Firestore
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists()) {
          setCurrentAdmin({ id: user.uid, ...adminDoc.data() } as Admin);
          setIsAuthenticated(true);
          setRole('Admin');
        } else {
          // If admin doc doesn't exist but user is logged in (shouldn't happen normally)
          setIsAuthenticated(false);
          setCurrentAdmin(null);
        }
      } else {
        // Check if we are in Student mode (Student mode doesn't use Firebase Auth)
        if (role !== 'Student') {
          setIsAuthenticated(false);
          setCurrentAdmin(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [role]);

  // Firestore Listeners for Students and Fees
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    // Only listen if we have a context (Admin or Student)
    let adminIdToListen = '';
    if (role === 'Admin' && currentAdmin) {
      adminIdToListen = currentAdmin.id;
    } else if (role === 'Student' && currentStudent) {
      adminIdToListen = currentStudent.adminId;
    }

    if (!adminIdToListen) {
      setAllStudents([]);
      setAllFees([]);
      return;
    }

    const studentsQuery = query(collection(db, 'students'), where('adminId', '==', adminIdToListen));
    const feesQuery = query(collection(db, 'fees'), where('adminId', '==', adminIdToListen));

    const unsubStudents = onSnapshot(studentsQuery, (snapshot) => {
      const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
      setAllStudents(studentsData);
    });

    const unsubFees = onSnapshot(feesQuery, (snapshot) => {
      const feesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeeRecord));
      setAllFees(feesData);
    });

    return () => {
      unsubStudents();
      unsubFees();
    };
  }, [currentAdmin, currentStudent, role]);

  // Filtered data for the current admin
  const students = useMemo(() => {
    if (role === 'Student' && currentStudent) {
      return allStudents.filter(s => s.adminId === currentStudent.adminId);
    }
    if (!currentAdmin) return [];
    return allStudents.filter(s => s.adminId === currentAdmin.id);
  }, [allStudents, currentAdmin, role, currentStudent]);

  const fees = useMemo(() => {
    if (role === 'Student' && currentStudent) {
      return allFees.filter(f => f.adminId === currentStudent.adminId);
    }
    if (!currentAdmin) return [];
    return allFees.filter(f => f.adminId === currentAdmin.id);
  }, [allFees, currentAdmin, role, currentStudent]);

  const [activeReceiptFeeId, setActiveReceiptFeeId] = useState<string | null>(null);

  const handleRegister = (adminData: Admin) => {
    setCurrentAdmin(adminData);
    setRole('Admin');
    setIsAuthenticated(true);
  };

  const handleLogin = (success: boolean, userRole: UserRole = 'Admin', studentData: Student | null = null, adminData: Admin | null = null) => {
    setRole(userRole);
    if (userRole === 'Admin' && adminData) {
      setCurrentAdmin(adminData);
    }
    if (userRole === 'Student' && studentData) {
      setCurrentStudent(studentData);
      setActiveTab('portal');
    }
    setIsAuthenticated(success);
  };

  const handleLogout = async () => {
    if (role === 'Admin') {
      await signOut(auth);
    }
    setIsAuthenticated(false);
    setRole('Admin');
    setCurrentAdmin(null);
    setCurrentStudent(null);
    setActiveTab('dashboard');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 3).toUpperCase();
  };

  const handleAddStudent = async (studentData: Omit<Student, 'id' | 'portalId' | 'adminId'>) => {
    if (!currentAdmin) return;
    const rollNum = studentData.rollNumber || `R-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const prefix = getInitials(currentAdmin.schoolName);
    const id = `ST-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newStudent: Student = {
      ...studentData,
      id,
      adminId: currentAdmin.id,
      rollNumber: rollNum,
      portalId: `${prefix}-${rollNum}`
    };
    
    await setDoc(doc(db, 'students', id), newStudent);
    alert(`Student Added Successfully!\n\nStudent Portal ID: ${newStudent.portalId}\n\nPlease share this ID with the student for portal access.`);
  };

  const handleUpdateStudent = async (id: string, studentData: Omit<Student, 'id' | 'portalId' | 'adminId'>) => {
    if (!currentAdmin) return;
    const prefix = getInitials(currentAdmin.schoolName);
    const rollNum = studentData.rollNumber;
    const updates = {
      ...studentData,
      portalId: `${prefix}-${rollNum}`
    };
    await updateDoc(doc(db, 'students', id), updates);
  };

  const handleDeleteStudent = async (id: string) => {
    const isConfirmed = confirm('Are you sure you want to delete this student and all their fee records?');
    if (isConfirmed) {
      await deleteDoc(doc(db, 'students', id));
      // Delete associated fees
      const studentFees = allFees.filter(f => f.studentId === id);
      for (const fee of studentFees) {
        await deleteDoc(doc(db, 'fees', fee.id));
      }
    }
  };

  const handleAddFee = async (feeData: Omit<FeeRecord, 'id' | 'adminId'>) => {
    if (!currentAdmin) return;
    const id = `F-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newFee: FeeRecord = {
      ...feeData,
      adminId: currentAdmin.id,
      id
    };
    await setDoc(doc(db, 'fees', id), newFee);
    if (newFee.paidAmount > 0) {
      setActiveReceiptFeeId(newFee.id);
    }
  };

  const handleUpdateFee = async (id: string, updates: Partial<FeeRecord>) => {
    await updateDoc(doc(db, 'fees', id), updates);
  };

  const currentReceiptData = useMemo(() => {
    if (!activeReceiptFeeId) return null;
    const fee = allFees.find(f => f.id === activeReceiptFeeId);
    if (!fee) return null;
    const student = allStudents.find(s => s.id === fee.studentId);
    if (!student) return null;
    return { fee, student };
  }, [activeReceiptFeeId, allFees, allStudents]);

  // Flow control
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authMode === 'register') {
      return <RegisterForm onRegister={handleRegister} onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <LoginForm onLogin={handleLogin} onSwitchToRegister={() => setAuthMode('register')} />;
  }

  const renderContent = () => {
    if (role === 'Student' && currentStudent) {
      return <StudentPortal student={currentStudent} fees={fees} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard students={students} fees={fees} />;
      case 'students':
        return (
          <StudentList 
            students={students} 
            searchTerm={searchTerm} 
            onAddStudent={handleAddStudent} 
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        );
      case 'fees':
        return (
          <FeeManagement 
            students={students} 
            fees={fees} 
            searchTerm={searchTerm} 
            onAddFee={handleAddFee} 
            onUpdateFee={handleUpdateFee}
            onShowReceipt={(id) => setActiveReceiptFeeId(id)}
          />
        );
      case 'reports':
        return <Reports students={students} fees={fees} />;
      default:
        return <Dashboard students={students} fees={fees} />;
    }
  };

  return (
    <>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        role={role} 
        setRole={setRole}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onLogout={handleLogout}
        schoolName={currentAdmin?.schoolName || 'Ali Public School'}
      >
        {renderContent()}
      </Layout>

      {currentReceiptData && (
        <Receipt 
          fee={currentReceiptData.fee} 
          student={currentReceiptData.student} 
          onClose={() => setActiveReceiptFeeId(null)} 
          schoolName={currentAdmin?.schoolName || 'Ali Public School'}
        />
      )}
    </>
  );
};

export default App;
