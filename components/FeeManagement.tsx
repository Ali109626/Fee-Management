
import React from 'react';
import { 
  Calendar, 
  Search, 
  ArrowRight, 
  Wallet,
  History,
  Printer,
  AlertCircle,
  X,
  CreditCard,
  Info
} from 'lucide-react';
import { Student, FeeRecord, PaymentStatus, PaymentMethod } from '../types';
import { MONTHS, GRADE_FEES } from '../constants';

interface FeeManagementProps {
  students: Student[];
  fees: FeeRecord[];
  onAddFee: (fee: Omit<FeeRecord, 'id'>) => void;
  onUpdateFee: (id: string, updates: Partial<FeeRecord>) => void;
  onShowReceipt: (feeId: string) => void;
  searchTerm: string;
}

const FeeManagement: React.FC<FeeManagementProps> = ({ 
  students, fees, onAddFee, onUpdateFee, onShowReceipt, searchTerm 
}) => {
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [showPayModal, setShowPayModal] = React.useState(false);
  const [payTargetMonth, setPayTargetMonth] = React.useState<string>(MONTHS[new Date().getMonth()]);
  const [payAmount, setPayAmount] = React.useState<number>(0);
  const [payMethod, setPayMethod] = React.useState<PaymentMethod>(PaymentMethod.CASH);
  const [payRemarks, setPayRemarks] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.portalId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get cumulative stats for a student
  const getStudentStats = (studentId: string) => {
    const studentFees = fees.filter(f => f.studentId === studentId);
    const totalDue = studentFees.reduce((sum, f) => sum + f.totalAmount, 0);
    const totalPaid = studentFees.reduce((sum, f) => sum + f.paidAmount, 0);
    const balance = totalDue - totalPaid;
    return { totalDue, totalPaid, balance, count: studentFees.length };
  };

  // Logic to handle opening modal with context
  const handleOpenPayModal = (student: Student, month?: string) => {
    const targetMonth = month || MONTHS[new Date().getMonth()];
    const existingFee = fees.find(f => f.studentId === student.id && f.month === targetMonth);
    
    let remaining = student.monthlyFee || GRADE_FEES[student.grade] || 2500;
    
    if (existingFee) {
      remaining = existingFee.totalAmount - existingFee.paidAmount;
    }

    setSelectedStudent(student);
    setPayTargetMonth(targetMonth);
    setPayAmount(remaining > 0 ? remaining : 0);
    setPayRemarks('');
    setError(null);
    setShowPayModal(true);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const existingFee = fees.find(f => f.studentId === selectedStudent.id && f.month === payTargetMonth);
    const standardFee = selectedStudent.monthlyFee || GRADE_FEES[selectedStudent.grade] || 2500;

    if (existingFee) {
      const remainingForMonth = existingFee.totalAmount - existingFee.paidAmount;
      if (remainingForMonth <= 0) {
        setError("This month is already fully paid.");
        return;
      }

      if (payAmount > remainingForMonth) {
        setError(`Cannot pay more than remaining balance (Rs. ${remainingForMonth})`);
        return;
      }
      
      const newPaidAmount = existingFee.paidAmount + payAmount;
      const newStatus = newPaidAmount >= existingFee.totalAmount ? PaymentStatus.PAID : PaymentStatus.PARTIAL;
      
      await onUpdateFee(existingFee.id, {
        paidAmount: newPaidAmount,
        status: newStatus,
        remarks: payRemarks || existingFee.remarks,
        paymentDate: new Date().toISOString().split('T')[0]
      });
    } else {
      if (payAmount > standardFee) {
        setError(`Payment exceeds standard monthly fee (Rs. ${standardFee})`);
        return;
      }

      const status = payAmount >= standardFee ? PaymentStatus.PAID : payAmount > 0 ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID;
      
      await onAddFee({
        studentId: selectedStudent.id,
        month: payTargetMonth,
        year: new Date().getFullYear(),
        totalAmount: standardFee,
        paidAmount: payAmount,
        status,
        paymentDate: new Date().toISOString().split('T')[0],
        method: payMethod,
        remarks: payRemarks,
        receiptNumber: `RCP-${Math.floor(1000 + Math.random() * 9000)}`
      });
    }

    setShowPayModal(false);
  };

  // Helper to get specific month data for display
  const getMonthFeeData = (studentId: string, month: string) => {
    const fee = fees.find(f => f.studentId === studentId && f.month === month);
    const total = selectedStudent?.monthlyFee || 0;
    if (!fee) return { paid: 0, total, remaining: total, status: PaymentStatus.UNPAID };
    return { 
      paid: fee.paidAmount, 
      total: fee.totalAmount, 
      remaining: fee.totalAmount - fee.paidAmount,
      status: fee.status,
      id: fee.id
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Fee Management</h1>
          <p className="text-sm text-slate-500">Track collections and individual month balances.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Payment History</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Arrears</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                const stats = getStudentStats(student.id);
                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-100 shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate">{student.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{student.rollNumber}</p>
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter bg-indigo-50 px-1.5 py-0.5 rounded">
                              {student.portalId}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center -space-x-1.5">
                        {MONTHS.slice(0, 6).map((m) => {
                          const fee = fees.find(f => f.studentId === student.id && f.month === m);
                          let color = 'bg-slate-100';
                          if (fee) {
                            if (fee.status === PaymentStatus.PAID) color = 'bg-emerald-500';
                            else if (fee.status === PaymentStatus.PARTIAL) color = 'bg-amber-500';
                            else color = 'bg-red-500';
                          }
                          return (
                            <div 
                              key={m} 
                              title={`${m}: ${fee ? fee.status : 'No Record'}`}
                              className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white transition-transform hover:scale-110 cursor-help ${color}`}
                            >
                              {m.charAt(0)}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-black ${stats.balance > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                          Rs. {stats.balance.toLocaleString()}
                        </span>
                        {stats.balance > 0 && <span className="text-[9px] font-bold text-slate-400 uppercase">Pending</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenPayModal(student)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition-all shadow-sm"
                        >
                          Collect
                        </button>
                        <button 
                          onClick={() => setSelectedStudent(student)}
                          className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all border border-slate-100"
                        >
                          <History size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ledger Slide-over */}
      {selectedStudent && !showPayModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-end bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white h-[90vh] sm:h-full w-full max-w-xl rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-indigo-200">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-black text-slate-800 truncate">{selectedStudent.name}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedStudent.rollNumber} • {selectedStudent.grade}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                  <span className="text-[9px] font-black text-indigo-400 uppercase block mb-1">Due</span>
                  <p className="text-sm font-black text-indigo-700">Rs. {getStudentStats(selectedStudent.id).totalDue.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                  <span className="text-[9px] font-black text-emerald-400 uppercase block mb-1">Paid</span>
                  <p className="text-sm font-black text-emerald-700">Rs. {getStudentStats(selectedStudent.id).totalPaid.toLocaleString()}</p>
                </div>
                <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100">
                  <span className="text-[9px] font-black text-red-400 uppercase block mb-1">Balance</span>
                  <p className="text-sm font-black text-red-700">Rs. {getStudentStats(selectedStudent.id).balance.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} /> Monthly Billing Cycle
                </h3>
                <div className="space-y-2.5">
                  {MONTHS.map(month => {
                    const data = getMonthFeeData(selectedStudent.id, month);
                    return (
                      <div key={month} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-indigo-200 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-white shadow-sm ${
                            data.status === PaymentStatus.PAID ? 'bg-emerald-500' : 
                            data.status === PaymentStatus.PARTIAL ? 'bg-amber-500' : 'bg-slate-200'
                          }`} />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">{month}</span>
                            <span className="text-[9px] font-black uppercase text-slate-400">Total: Rs. {data.total.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs font-black text-slate-800">Paid: Rs. {data.paid.toLocaleString()}</p>
                            {data.remaining > 0 && (
                              <p className="text-[9px] font-bold text-red-500">Left: Rs. {data.remaining.toLocaleString()}</p>
                            )}
                          </div>
                          
                          {data.remaining > 0 ? (
                            <button 
                              onClick={() => handleOpenPayModal(selectedStudent, month)}
                              className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-tight hover:bg-indigo-700"
                            >
                              Pay Now
                            </button>
                          ) : (
                            <button 
                              onClick={() => data.id && onShowReceipt(data.id)}
                              className="p-2 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 hover:text-indigo-600"
                            >
                              <Printer size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Payment Modal */}
      {showPayModal && selectedStudent && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white rounded-t-[2.5rem] sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[95vh] animate-in slide-in-from-bottom duration-300">
            <div className="p-8 border-b border-slate-100 bg-indigo-50/20 relative shrink-0">
              <h3 className="text-xl font-black text-slate-800">Confirm Payment</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black uppercase">{payTargetMonth}</span>
                <span className="text-[11px] text-slate-500 font-bold">{selectedStudent.name}</span>
              </div>
              <button onClick={() => setShowPayModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-500">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleProcessPayment} className="p-8 space-y-6 overflow-y-auto">
              {/* Month Context Summary */}
              {(() => {
                const existing = fees.find(f => f.studentId === selectedStudent.id && f.month === payTargetMonth);
                const total = existing ? existing.totalAmount : (selectedStudent.monthlyFee || 0);
                const paid = existing ? existing.paidAmount : 0;
                const balance = total - paid;
                
                return (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
                      <span>Month Total</span>
                      <span className="text-slate-800">Rs. {total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black text-emerald-500 uppercase">
                      <span>Already Paid</span>
                      <span>Rs. {paid.toLocaleString()}</span>
                    </div>
                    <div className="h-[1px] bg-slate-200 my-1" />
                    <div className="flex justify-between items-center text-xs font-black text-red-500 uppercase">
                      <span>Remaining Balance</span>
                      <span>Rs. {balance.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Amount (Rs.)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">Rs.</div>
                  <input 
                    required
                    type="number"
                    value={payAmount}
                    onChange={e => setPayAmount(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-5 rounded-2xl border-2 border-indigo-100 bg-indigo-50/10 text-indigo-700 font-black text-2xl focus:border-indigo-500 outline-none transition-all placeholder-indigo-200"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                  <select 
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full px-4 py-4 rounded-xl border border-slate-200 text-sm font-bold bg-white outline-none focus:ring-2 focus:ring-indigo-500/10 appearance-none"
                  >
                    {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Month</label>
                  <select 
                    value={payTargetMonth}
                    onChange={e => setPayTargetMonth(e.target.value)}
                    className="w-full px-4 py-4 rounded-xl border border-slate-200 text-sm font-bold bg-white outline-none appearance-none"
                  >
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-600 animate-shake">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed">{error}</p>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 py-5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                >
                  Confirm Payment <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;
