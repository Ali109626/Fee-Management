
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
import { api } from './services/api';

const App: React.FC = () => {
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [role, setRole] = useState<UserRole>('Admin');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allFees, setAllFees] = useState<FeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Auth Check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await api.me();
        if (data) {
          setIsAuthenticated(true);
          setRole(data.role);
          if (data.role === 'Admin') {
            setCurrentAdmin(data.user);
          } else {
            setCurrentStudent(data.user);
            setActiveTab('portal');
          }
        }
      } catch (err) {
        console.error("Auth check failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        const adminId = role === 'Student' && currentStudent ? currentStudent.adminId : undefined;
        const [studentsData, feesData] = await Promise.all([
          api.getStudents(adminId),
          api.getFees(adminId)
        ]);
        setAllStudents(studentsData);
        setAllFees(feesData);
      };
      fetchData();
    }
  }, [isAuthenticated, role, currentStudent]);

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

  const handleRegister = async (adminData: Omit<Admin, 'id'>) => {
    try {
      const data = await api.register(adminData);
      setCurrentAdmin(data.user);
      setRole('Admin');
      setIsAuthenticated(true);
    } catch (err: any) {
      alert(err.message || "Registration failed");
    }
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
    await api.logout();
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
    const newStudent: Student = {
      ...studentData,
      id: `ST-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      adminId: currentAdmin.id,
      rollNumber: rollNum,
      portalId: `${prefix}-${rollNum}`
    };
    
    const savedStudent = await api.addStudent(newStudent);
    setAllStudents(prev => [...prev, savedStudent]);
    
    alert(`Student Added Successfully!\n\nStudent Portal ID: ${newStudent.portalId}\n\nPlease share this ID with the student for portal access.`);
  };

  const handleUpdateStudent = async (id: string, studentData: Omit<Student, 'id' | 'portalId' | 'adminId'>) => {
    if (!currentAdmin) return;
    const prefix = getInitials(currentAdmin.schoolName);
    const rollNum = studentData.rollNumber;
    const updatedData = {
      ...studentData,
      portalId: `${prefix}-${rollNum}`
    };

    const savedStudent = await api.updateStudent(id, updatedData);
    setAllStudents(prev => prev.map(s => s.id === id ? { ...s, ...savedStudent } : s));
  };

  const handleDeleteStudent = async (id: string) => {
    const isConfirmed = confirm('Are you sure you want to delete this student and all their fee records?');
    if (isConfirmed) {
      await api.deleteStudent(id);
      setAllStudents(prev => prev.filter(s => s.id !== id));
      setAllFees(prev => prev.filter(f => f.studentId !== id));
    }
  };

  const handleAddFee = async (feeData: Omit<FeeRecord, 'id' | 'adminId'>) => {
    if (!currentAdmin) return;
    const newFee: FeeRecord = {
      ...feeData,
      adminId: currentAdmin.id,
      id: `F-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    
    const savedFee = await api.addFee(newFee);
    setAllFees(prev => [...prev, savedFee]);
    if (savedFee.paidAmount > 0) {
      setActiveReceiptFeeId(savedFee.id);
    }
  };

  const handleUpdateFee = async (id: string, updates: Partial<FeeRecord>) => {
    await api.updateFee(id, updates);
    setAllFees(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const currentReceiptData = useMemo(() => {
    if (!activeReceiptFeeId) return null;
    const fee = allFees.find(f => f.id === activeReceiptFeeId);
    if (!fee) return null;
    const student = allStudents.find(s => s.id === fee.studentId);
    if (!student) return null;
    return { fee, student };
  }, [activeReceiptFeeId, allFees, allStudents]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Flow control
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
