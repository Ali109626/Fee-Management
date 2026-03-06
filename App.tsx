
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
import { Student, FeeRecord, UserRole } from './types';
import { INITIAL_STUDENTS, INITIAL_FEES } from './constants';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('aps_auth_status') === 'true';
  });

  const [adminExists, setAdminExists] = useState<boolean>(() => {
    return localStorage.getItem('aps_admin_user') !== null;
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
  const [authMode, setAuthMode] = useState<'login' | 'register'>(adminExists ? 'login' : 'register');
  
  const STORAGE_KEY_STUDENTS = 'aps_v1_students_stable';
  const STORAGE_KEY_FEES = 'aps_v1_fees_stable';

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (saved === null) return INITIAL_STUDENTS;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_STUDENTS;
    }
  });
  
  const [fees, setFees] = useState<FeeRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FEES);
    if (saved === null) return INITIAL_FEES;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_FEES;
    }
  });

  const [activeReceiptFeeId, setActiveReceiptFeeId] = useState<string | null>(null);

  useEffect(() => {
    // Migration: Ensure all students have a portalId
    const needsMigration = students.some(s => !s.portalId);
    if (needsMigration) {
      setStudents(prev => prev.map(s => {
        if (!s.portalId) {
          return { ...s, portalId: `APS-${s.rollNumber}` };
        }
        return s;
      }));
    }
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FEES, JSON.stringify(fees));
  }, [fees]);

  useEffect(() => {
    localStorage.setItem('aps_auth_status', isAuthenticated.toString());
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('aps_user_role', role);
  }, [role]);

  useEffect(() => {
    if (currentStudent) {
      localStorage.setItem('aps_current_student', JSON.stringify(currentStudent));
    } else {
      localStorage.removeItem('aps_current_student');
    }
  }, [currentStudent]);

  const handleRegister = (adminData: any) => {
    localStorage.setItem('aps_admin_user', JSON.stringify(adminData));
    setAdminExists(true);
    setIsAuthenticated(true);
  };

  const handleLogin = (success: boolean, userRole: UserRole = 'Admin', studentData: Student | null = null) => {
    setRole(userRole);
    if (userRole === 'Student' && studentData) {
      setCurrentStudent(studentData);
      setActiveTab('portal');
    }
    setIsAuthenticated(success);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole('Admin');
    setCurrentStudent(null);
    localStorage.setItem('aps_auth_status', 'false');
    localStorage.removeItem('aps_user_role');
    localStorage.removeItem('aps_current_student');
    setActiveTab('dashboard');
  };

  const handleAddStudent = (studentData: Omit<Student, 'id' | 'portalId'>) => {
    const rollNum = studentData.rollNumber || `R-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const newStudent: Student = {
      ...studentData,
      id: `ST-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      rollNumber: rollNum,
      portalId: `APS-${rollNum}`
    };
    setStudents(prev => [...prev, newStudent]);
    
    // Show a notification or alert with the new Portal ID
    alert(`Student Added Successfully!\n\nStudent Portal ID: ${newStudent.portalId}\n\nPlease share this ID with the student for portal access.`);
  };

  const handleUpdateStudent = (id: string, studentData: Omit<Student, 'id' | 'portalId'>) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        const rollNum = studentData.rollNumber || s.rollNumber;
        return { 
          ...studentData, 
          id, 
          rollNumber: rollNum,
          portalId: `APS-${rollNum}` 
        };
      }
      return s;
    }));
  };

  const handleDeleteStudent = (id: string) => {
    const isConfirmed = confirm('Are you sure you want to delete this student and all their fee records?');
    if (isConfirmed) {
      setStudents(prev => prev.filter(s => s.id !== id));
      setFees(prev => prev.filter(f => f.studentId !== id));
    }
  };

  const handleAddFee = (feeData: Omit<FeeRecord, 'id'>) => {
    const newFee: FeeRecord = {
      ...feeData,
      id: `F-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    setFees(prev => [...prev, newFee]);
    if (newFee.paidAmount > 0) {
      setActiveReceiptFeeId(newFee.id);
    }
  };

  const handleUpdateFee = (id: string, updates: Partial<FeeRecord>) => {
    setFees(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const currentReceiptData = useMemo(() => {
    if (!activeReceiptFeeId) return null;
    const fee = fees.find(f => f.id === activeReceiptFeeId);
    if (!fee) return null;
    const student = students.find(s => s.id === fee.studentId);
    if (!student) return null;
    return { fee, student };
  }, [activeReceiptFeeId, fees, students]);

  // Flow control
  if (!isAuthenticated) {
    if (authMode === 'register') {
      return <RegisterForm onRegister={handleRegister} onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <LoginForm onLogin={handleLogin} onSwitchToRegister={() => setAuthMode('register')} students={students} />;
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
      >
        {renderContent()}
      </Layout>

      {currentReceiptData && (
        <Receipt 
          fee={currentReceiptData.fee} 
          student={currentReceiptData.student} 
          onClose={() => setActiveReceiptFeeId(null)} 
        />
      )}
    </>
  );
};

export default App;
