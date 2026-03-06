
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

const App: React.FC = () => {
  const STORAGE_KEY_ADMINS = 'aps_v1_admins';
  const STORAGE_KEY_STUDENTS = 'aps_v1_students_stable';
  const STORAGE_KEY_FEES = 'aps_v1_fees_stable';

  const [admins, setAdmins] = useState<Admin[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ADMINS);
    return saved ? JSON.parse(saved) : [];
  });

  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(() => {
    const saved = localStorage.getItem('aps_current_admin');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('aps_auth_status') === 'true';
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('aps_user_role') as UserRole) || 'Admin';
  });
  const [currentStudent, setCurrentStudent] = useState<Student | null>(() => {
    const saved = localStorage.getItem('aps_current_student');
    return saved ? JSON.parse(saved) : null;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  const [allStudents, setAllStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (saved === null) return INITIAL_STUDENTS.map(s => ({ ...s, adminId: 'default-admin' }));
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_STUDENTS.map(s => ({ ...s, adminId: 'default-admin' }));
    }
  });
  
  const [allFees, setAllFees] = useState<FeeRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FEES);
    if (saved === null) return INITIAL_FEES.map(f => ({ ...f, adminId: 'default-admin' }));
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_FEES.map(f => ({ ...f, adminId: 'default-admin' }));
    }
  });

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(admins));
  }, [admins]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(allStudents));
  }, [allStudents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FEES, JSON.stringify(allFees));
  }, [allFees]);

  useEffect(() => {
    localStorage.setItem('aps_auth_status', isAuthenticated.toString());
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('aps_user_role', role);
  }, [role]);

  useEffect(() => {
    if (currentAdmin) {
      localStorage.setItem('aps_current_admin', JSON.stringify(currentAdmin));
    } else {
      localStorage.removeItem('aps_current_admin');
    }
  }, [currentAdmin]);

  useEffect(() => {
    if (currentStudent) {
      localStorage.setItem('aps_current_student', JSON.stringify(currentStudent));
    } else {
      localStorage.removeItem('aps_current_student');
    }
  }, [currentStudent]);

  const handleRegister = (adminData: Omit<Admin, 'id'>) => {
    const newAdmin: Admin = {
      ...adminData,
      id: `ADM-${Date.now()}`
    };
    setAdmins(prev => [...prev, newAdmin]);
    setCurrentAdmin(newAdmin);
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole('Admin');
    setCurrentAdmin(null);
    setCurrentStudent(null);
    localStorage.setItem('aps_auth_status', 'false');
    localStorage.removeItem('aps_user_role');
    localStorage.removeItem('aps_current_admin');
    localStorage.removeItem('aps_current_student');
    setActiveTab('dashboard');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 3).toUpperCase();
  };

  const handleAddStudent = (studentData: Omit<Student, 'id' | 'portalId' | 'adminId'>) => {
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
    setAllStudents(prev => [...prev, newStudent]);
    
    alert(`Student Added Successfully!\n\nStudent Portal ID: ${newStudent.portalId}\n\nPlease share this ID with the student for portal access.`);
  };

  const handleUpdateStudent = (id: string, studentData: Omit<Student, 'id' | 'portalId' | 'adminId'>) => {
    if (!currentAdmin) return;
    const prefix = getInitials(currentAdmin.schoolName);
    setAllStudents(prev => prev.map(s => {
      if (s.id === id) {
        const rollNum = studentData.rollNumber || s.rollNumber;
        return { 
          ...s,
          ...studentData, 
          id, 
          rollNumber: rollNum,
          portalId: `${prefix}-${rollNum}` 
        };
      }
      return s;
    }));
  };

  const handleDeleteStudent = (id: string) => {
    const isConfirmed = confirm('Are you sure you want to delete this student and all their fee records?');
    if (isConfirmed) {
      setAllStudents(prev => prev.filter(s => s.id !== id));
      setAllFees(prev => prev.filter(f => f.studentId !== id));
    }
  };

  const handleAddFee = (feeData: Omit<FeeRecord, 'id' | 'adminId'>) => {
    if (!currentAdmin) return;
    const newFee: FeeRecord = {
      ...feeData,
      adminId: currentAdmin.id,
      id: `F-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    setAllFees(prev => [...prev, newFee]);
    if (newFee.paidAmount > 0) {
      setActiveReceiptFeeId(newFee.id);
    }
  };

  const handleUpdateFee = (id: string, updates: Partial<FeeRecord>) => {
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

  // Flow control
  if (!isAuthenticated) {
    if (authMode === 'register') {
      return <RegisterForm onRegister={handleRegister} onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <LoginForm onLogin={handleLogin} onSwitchToRegister={() => setAuthMode('register')} students={allStudents} admins={admins} />;
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
