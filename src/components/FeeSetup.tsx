
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Settings2, DollarSign, Tag, Info } from 'lucide-react';
import { FeeType } from '../types';

interface FeeSetupProps {
  feeTypes: FeeType[];
  onAddFeeType: (feeType: Omit<FeeType, 'id' | 'adminId'>) => void;
  onUpdateFeeType: (id: string, feeType: Partial<FeeType>) => void;
  onDeleteFeeType: (id: string) => void;
}

const FeeSetup: React.FC<FeeSetupProps> = ({ 
  feeTypes, 
  onAddFeeType, 
  onUpdateFeeType, 
  onDeleteFeeType 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialFormData = {
    name: '',
    amount: '' as unknown as number,
    category: 'One-time' as 'Monthly' | 'One-time',
    description: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleEdit = (feeType: FeeType) => {
    setEditingId(feeType.id);
    setFormData({
      name: feeType.name,
      amount: feeType.amount,
      category: feeType.category,
      description: feeType.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      amount: Number(formData.amount) || 0
    };
    if (editingId) {
      onUpdateFeeType(editingId, submissionData);
    } else {
      onAddFeeType(submissionData);
    }
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Fee Configuration</h1>
          <p className="text-sm text-slate-500">Define different types of charges and fees.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg text-sm w-full sm:w-auto"
        >
          <Plus size={18} /> Add Fee Type
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feeTypes.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Settings2 size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No Fee Types Defined</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
              Start by adding fee types like Books Fee, Exam Fee, or Fines.
            </p>
          </div>
        ) : (
          feeTypes.map((feeType) => (
            <div key={feeType.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${feeType.category === 'Monthly' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                  <DollarSign size={20} />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(feeType)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => onDeleteFeeType(feeType.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <h3 className="font-black text-slate-800 text-lg mb-1">{feeType.name}</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                  feeType.category === 'Monthly' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {feeType.category}
                </span>
              </div>
              
              {feeType.description && (
                <p className="text-xs text-slate-500 mb-6 line-clamp-2">{feeType.description}</p>
              )}
              
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Standard Amount</span>
                <span className="text-xl font-black text-slate-800">Rs. {feeType.amount.toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">
                {editingId ? 'Edit Fee Type' : 'New Fee Type'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 p-2 hover:bg-slate-50 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Tag size={12} /> Fee Name
                </label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Books Fee, Exam Fee"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all text-sm font-bold" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={12} /> Amount (PKR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rs.</span>
                    <input 
                      required 
                      type="number" 
                      value={formData.amount} 
                      onChange={e => setFormData({...formData, amount: e.target.value as any})} 
                      placeholder="Enter amount"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all text-sm font-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Settings2 size={12} /> Category
                  </label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value as any})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none transition-all font-bold text-slate-700 text-sm"
                  >
                    <option value="One-time">One-time</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Info size={12} /> Description (Optional)
                </label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Briefly describe what this fee covers..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all text-sm min-h-[100px]" 
                />
              </div>
              
              <div className="flex items-center gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-4 font-bold text-slate-400">Cancel</button>
                <button type="submit" className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 text-sm">
                  {editingId ? 'Save Changes' : 'Create Fee Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeSetup;
