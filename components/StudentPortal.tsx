
import React, { useMemo } from 'react';
import { Student, FeeRecord, PaymentStatus } from '../types';
import { 
  User, 
  GraduationCap, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  History,
  School
} from 'lucide-react';

interface StudentPortalProps {
  student: Student;
  fees: FeeRecord[];
}

const StudentPortal: React.FC<StudentPortalProps> = ({ student, fees }) => {
  const studentFees = useMemo(() => {
    return fees.filter(f => f.studentId === student.id)
      .sort((a, b) => {
        const dateA = new Date(`${a.month} 1, ${a.year}`);
        const dateB = new Date(`${b.month} 1, ${b.year}`);
        return dateB.getTime() - dateA.getTime();
      });
  }, [fees, student.id]);

  const stats = useMemo(() => {
    const totalPaid = studentFees.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalDue = studentFees.reduce((sum, f) => sum + (f.totalAmount - f.paidAmount), 0);
    const lastPayment = studentFees.find(f => f.paidAmount > 0)?.paymentDate;
    
    return { totalPaid, totalDue, lastPayment };
  }, [studentFees]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
            <User size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Welcome, {student.name}</h1>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">Student Portal • Roll No: {student.rollNumber}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal ID</p>
            <p className="text-slate-800 font-black">{student.portalId}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <School size={20} className="text-indigo-600" />
              School Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class & Section</p>
                  <p className="text-slate-800 font-bold">{student.grade} - {student.section}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Father's Name</p>
                  <p className="text-slate-800 font-bold">{student.fatherName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</p>
                  <p className="text-slate-800 font-bold">{student.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admission Date</p>
                  <p className="text-slate-800 font-bold">{student.admissionDate}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-200">
            <h2 className="text-lg font-black mb-6 flex items-center gap-2">
              <CreditCard size={20} />
              Fee Summary
            </h2>
            <div className="space-y-6">
              <div>
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Monthly Fee</p>
                <p className="text-3xl font-black">Rs. {student.monthlyFee.toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Total Paid</p>
                  <p className="text-xl font-black">Rs. {stats.totalPaid.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Total Dues</p>
                  <p className="text-xl font-black">Rs. {stats.totalDue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fee History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <History size={24} className="text-indigo-600" />
                Payment History
              </h2>
              <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {studentFees.length} Records Found
              </div>
            </div>

            <div className="space-y-4">
              {studentFees.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <Clock size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-400 font-bold">No fee records found yet.</p>
                </div>
              ) : (
                studentFees.map((fee) => (
                  <div key={fee.id} className="group p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                          fee.status === PaymentStatus.PAID ? 'bg-green-100 text-green-600' :
                          fee.status === PaymentStatus.PARTIAL ? 'bg-amber-100 text-amber-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {fee.status === PaymentStatus.PAID ? <CheckCircle2 size={24} /> :
                           fee.status === PaymentStatus.PARTIAL ? <Clock size={24} /> :
                           <AlertCircle size={24} />}
                        </div>
                        <div>
                          <h3 className="font-black text-slate-800">{fee.month} {fee.year}</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {fee.paymentDate ? `Paid on ${fee.paymentDate}` : 'Payment Pending'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                          <p className="font-black text-slate-800">Rs. {fee.totalAmount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid</p>
                          <p className="font-black text-green-600">Rs. {fee.paidAmount.toLocaleString()}</p>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            fee.status === PaymentStatus.PAID ? 'bg-green-600 text-white' :
                            fee.status === PaymentStatus.PARTIAL ? 'bg-amber-500 text-white' :
                            'bg-red-500 text-white'
                          }`}>
                            {fee.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
