
import React, { useEffect } from 'react';
import { Download, Printer, X, CheckCircle2, ArrowLeft, Share2 } from 'lucide-react';
import { Student, FeeRecord } from '../types';

interface ReceiptProps {
  fee: FeeRecord;
  student: Student;
  onClose: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ fee, student, onClose }) => {
  // Add ESC key listener to close the receipt
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handlePrint = () => {
    // Small timeout ensures any active focus or mobile keyboard issues are resolved before printing
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleShare = async () => {
    const shareText = `Fee Receipt: ${fee.receiptNumber}\nStudent: ${student.name}\nMonth: ${fee.month} ${fee.year}\nAmount Paid: Rs. ${fee.paidAmount}\nRemaining Balance: Rs. ${fee.totalAmount - fee.paidAmount}\nThank you, Ali Public School.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Fee Receipt - Ali Public School',
          text: shareText,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Receipt details copied to clipboard!');
    }
  };

  return (
    <>
      {/* Modal UI - Hidden during print */}
      <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-0 sm:p-4 no-print overflow-hidden">
        <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col h-full sm:h-auto max-h-full sm:max-h-[95vh]">
          
          {/* Action Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button 
                onClick={onClose}
                className="flex items-center justify-center p-2 hover:bg-slate-200 rounded-xl text-slate-600 transition-all"
                title="Go back"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="hidden sm:block h-6 w-[1px] bg-slate-300 mx-1"></div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="font-black text-xs text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 size={14} /> Received
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-bold hidden sm:inline">#{fee.receiptNumber}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              {navigator.share && (
                <button 
                  onClick={handleShare}
                  className="p-2 sm:p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-2 px-3 sm:px-4"
                >
                  <Share2 size={18} />
                  <span className="text-xs font-black uppercase tracking-tight hidden sm:inline">Share</span>
                </button>
              )}
              <button 
                onClick={handlePrint} 
                className="p-2 sm:p-2.5 bg-green-600 hover:bg-green-700 rounded-xl text-white transition-all flex items-center gap-2 px-3 sm:px-4 shadow-lg shadow-green-500/20"
              >
                <Printer size={18} />
                <span className="text-xs font-black uppercase tracking-tight">Print</span>
              </button>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 sm:hidden"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="overflow-y-auto flex-1 bg-slate-100/30 p-4 sm:p-10 flex items-start justify-center">
            <div className="bg-white shadow-xl border border-slate-200 p-6 sm:p-10 w-full max-w-lg rounded-2xl relative">
              {/* Receipt Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-[100px] -z-10 opacity-50" />
              
              <div className="flex justify-between items-start mb-10 border-b border-dashed border-slate-200 pb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-green-200">
                    A
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Ali Public School</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Fee Receipt</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Receipt No</p>
                  <p className="text-sm font-mono font-black text-green-600">{fee.receiptNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="space-y-1">
                  <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Student</h3>
                  <p className="font-black text-slate-800 text-sm leading-tight">{student.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold">Roll: {student.rollNumber}</p>
                  <p className="text-[10px] text-slate-500 font-bold">{student.grade} - {student.section}</p>
                </div>
                <div className="text-right space-y-1">
                  <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Billing Period</h3>
                  <p className="font-black text-slate-800 text-sm">{fee.month} {fee.year}</p>
                  <p className="text-[10px] text-slate-500 font-bold">Date: {fee.paymentDate}</p>
                  <p className="text-[10px] text-slate-500 font-bold italic">via {fee.method || 'Cash'}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-slate-500">Monthly Tuition Fee</span>
                  <span className="text-sm font-black text-slate-800">Rs. {fee.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-4 text-emerald-600">
                  <span className="text-xs font-bold">Amount Paid</span>
                  <span className="text-sm font-black">Rs. {fee.paidAmount.toLocaleString()}</span>
                </div>
                <div className="h-[1px] bg-slate-200 my-4 border-t border-dashed" />
                <div className="flex justify-between items-center text-slate-900">
                  <span className="text-xs font-black uppercase tracking-widest">Remaining Balance</span>
                  <span className="text-lg font-black text-red-500">Rs. {(fee.totalAmount - fee.paidAmount).toLocaleString()}</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold italic">Thank you for choosing Ali Public School for your child's education.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actual Print-Only Version - Optimized for Mobile Browsers */}
      <div className="print-only fixed inset-0 bg-white text-black p-0 m-0">
        <div className="p-10 border-4 border-double border-slate-200 h-full flex flex-col">
          <div className="flex justify-between items-start mb-10 border-b-2 border-slate-100 pb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-black flex items-center justify-center text-white text-4xl font-black">
                A
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tighter uppercase">Ali Public School</h1>
                <p className="text-sm font-bold text-slate-600">Yazman Road, Bahawalpur, Pakistan</p>
                <p className="text-xs text-slate-500">Contact: 0323-1756420 • Computer Generated</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-black uppercase tracking-widest text-slate-400">Payment Voucher</h2>
              <div className="mt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase">Receipt No</p>
                <p className="text-2xl font-mono font-black">{fee.receiptNumber}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-16 mb-10">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase border-b-2 pb-1">Student Details</h3>
              <div className="grid grid-cols-2 text-xs gap-y-1">
                <span className="text-slate-500">Name:</span>
                <span className="font-black">{student.name}</span>
                <span className="text-slate-500">Roll/ID:</span>
                <span className="font-black">{student.rollNumber}</span>
                <span className="text-slate-500">Class:</span>
                <span className="font-black">{student.grade} - {student.section}</span>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase border-b-2 pb-1">Transaction Details</h3>
              <div className="grid grid-cols-2 text-xs gap-y-1">
                <span className="text-slate-500">Month:</span>
                <span className="font-black">{fee.month} {fee.year}</span>
                <span className="text-slate-500">Paid Date:</span>
                <span className="font-black">{fee.paymentDate}</span>
                <span className="text-slate-500">Method:</span>
                <span className="font-black uppercase">{fee.method || 'Cash'}</span>
              </div>
            </div>
          </div>

          <table className="w-full mb-10 border-2 border-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-4 px-6 text-left text-[10px] font-black uppercase">Service Description</th>
                <th className="py-4 px-6 text-right text-[10px] font-black uppercase">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t-2 border-slate-100">
                <td className="py-6 px-6">
                  <p className="font-black text-lg">Monthly School Fee</p>
                  <p className="text-[10px] text-slate-500 italic">Tuition and academic services for {fee.month}</p>
                </td>
                <td className="py-6 px-6 text-right font-black text-xl">Rs. {fee.totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end mb-16">
            <div className="w-72 space-y-3">
              <div className="flex justify-between text-slate-500 text-sm">
                <span>Monthly Bill:</span>
                <span className="font-bold">Rs. {fee.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-black text-base font-black bg-slate-50 p-3">
                <span>Amount Paid:</span>
                <span>Rs. {fee.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t-2 border-black pt-3 text-xl font-black">
                <span>Arrears:</span>
                <span className="text-red-600">Rs. {(fee.totalAmount - fee.paidAmount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-auto flex justify-between items-end border-t-2 border-slate-100 pt-8">
            <p className="text-[9px] text-slate-400 uppercase font-black">Generated on: {new Date().toLocaleString()}</p>
            <div className="text-center">
              <div className="w-56 border-b border-black mb-2"></div>
              <p className="text-[9px] font-black uppercase tracking-widest">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Receipt;
