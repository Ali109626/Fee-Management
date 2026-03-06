
import React from 'react';
import { FileDown, Search, Banknote, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';
import { Student, FeeRecord, PaymentStatus } from '../types';
import { MONTHS, GRADES } from '../constants';

interface ReportsProps {
  students: Student[];
  fees: FeeRecord[];
}

interface StudentLedger {
  student: Student;
  paidMonths: string[];
  pendingMonths: { month: string; amount: number; remarks?: string }[];
  totalDue: number;
  totalPaid: number;
  balance: number;
}

const Reports: React.FC<ReportsProps> = ({ students, fees }) => {
  const [filterGrade, setFilterGrade] = React.useState('All');
  const [reportSearch, setReportSearch] = React.useState('');

  const studentLedgers: StudentLedger[] = React.useMemo(() => {
    return students
      .filter(s => {
        const gradeMatch = filterGrade === 'All' || s.grade === filterGrade;
        const searchMatch = reportSearch === '' || 
          s.name.toLowerCase().includes(reportSearch.toLowerCase()) ||
          s.rollNumber.includes(reportSearch);
        return gradeMatch && searchMatch;
      })
      .map(student => {
        const studentFees = fees.filter(f => f.studentId === student.id);
        const paidMonths = studentFees
          .filter(f => f.status === PaymentStatus.PAID)
          .map(f => f.month);
        
        const pendingMonths = studentFees
          .filter(f => f.status !== PaymentStatus.PAID)
          .map(f => ({
            month: f.month,
            amount: f.totalAmount - f.paidAmount,
            remarks: f.remarks
          }));

        const totalDue = studentFees.reduce((sum, f) => sum + f.totalAmount, 0);
        const totalPaid = studentFees.reduce((sum, f) => sum + f.paidAmount, 0);
        const balance = totalDue - totalPaid;

        return {
          student,
          paidMonths,
          pendingMonths,
          totalDue,
          totalPaid,
          balance
        };
      })
      .sort((a, b) => b.balance - a.balance);
  }, [students, fees, filterGrade, reportSearch]);

  const totalOutstanding = studentLedgers.reduce((sum, l) => sum + l.balance, 0);
  const totalCollected = studentLedgers.reduce((sum, l) => sum + l.totalPaid, 0);

  const handleExportCSV = () => {
    const headers = ['Roll No', 'Name', 'Grade', 'Paid Months', 'Pending Months', 'Total Due', 'Total Paid', 'Remaining Balance'];
    const rows = studentLedgers.map(l => [
      `"${l.student.rollNumber}"`,
      `"${l.student.name}"`,
      `"${l.student.grade}"`,
      `"${l.paidMonths.join(', ')}"`,
      `"${l.pendingMonths.map(p => `${p.month} (Rs. ${p.amount})`).join(', ')}"`,
      l.totalDue,
      l.totalPaid,
      l.balance
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `APS_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Financial Reports</h1>
          <p className="text-sm text-slate-500">Summary of collections and arrears.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none shadow-sm appearance-none"
            >
              <option value="All">All Grades</option>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <button 
            onClick={handleExportCSV}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-800 transition-all shadow-md"
          >
            <FileDown size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Outstanding</span>
            <h3 className="text-xl font-black text-red-500">Rs. {totalOutstanding.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
            <AlertCircle size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Collected</span>
            <h3 className="text-xl font-black text-emerald-600">Rs. {totalCollected.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
            <Banknote size={20} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 gap-3">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Active Ledger</h3>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter by name..." 
              value={reportSearch}
              onChange={(e) => setReportSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none bg-white" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {studentLedgers.map((ledger) => (
                <tr key={ledger.student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800 truncate">{ledger.student.name}</p>
                    <p className="text-[10px] font-bold text-indigo-500">{ledger.student.rollNumber}</p>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {ledger.paidMonths.length > 0 ? (
                        ledger.paidMonths.slice(0, 3).map(m => (
                          <span key={m} className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase">
                            {m.substring(0, 3)}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-300">None</span>
                      )}
                      {ledger.paidMonths.length > 3 && <span className="text-[8px] text-slate-400">+{ledger.paidMonths.length - 3}</span>}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {ledger.pendingMonths.length > 0 ? (
                        ledger.pendingMonths.slice(0, 2).map(p => (
                          <span key={p.month} className="px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 text-[8px] font-black uppercase">
                            {p.month.substring(0, 3)}
                          </span>
                        ))
                      ) : (
                        <CheckCircle2 size={14} className="text-indigo-400" />
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-black ${ledger.balance > 0 ? 'text-red-500' : 'text-slate-800'}`}>
                      Rs. {ledger.balance.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
