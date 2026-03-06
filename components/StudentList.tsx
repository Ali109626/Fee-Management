
import React from 'react';
import { UserPlus, Edit2, Trash2, Phone, X, Settings2, Hash, Upload, MapPin, Camera, Eye } from 'lucide-react';
import { Student } from '../types';
import { GRADES, GRADE_FEES } from '../constants';

interface StudentListProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onUpdateStudent: (id: string, student: Omit<Student, 'id' | 'portalId'>) => void;
  onDeleteStudent: (id: string) => void;
  searchTerm: string;
}

const StudentList: React.FC<StudentListProps> = ({ 
  students, 
  onAddStudent, 
  onUpdateStudent, 
  onDeleteStudent, 
  searchTerm 
}) => {
  const [showModal, setShowModal] = React.useState(false);
  const [showViewModal, setShowViewModal] = React.useState(false);
  const [viewingStudent, setViewingStudent] = React.useState<Student | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  
  const getNumericRoll = (fullRoll: string) => {
    const parts = fullRoll.split('-');
    return parts.length > 1 ? parts[1] : fullRoll;
  };

  const getGradePrefix = (grade: string) => {
    const match = grade.match(/\d+/);
    return match ? `G${match[0]}` : grade.substring(0, 2).toUpperCase();
  };

  const initialFormData = {
    name: '', 
    fatherName: '', 
    phone: '', 
    address: '',
    image: '',
    grade: GRADES[0], 
    section: 'A', 
    rollNumber: '',
    admissionDate: new Date().toISOString().split('T')[0],
    monthlyFee: GRADE_FEES[GRADES[0]] || 0
  };

  const [formData, setFormData] = React.useState(initialFormData);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.portalId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    setFormData({
      name: student.name,
      fatherName: student.fatherName,
      phone: student.phone,
      address: student.address || '',
      image: student.image || '',
      grade: student.grade,
      section: student.section,
      rollNumber: getNumericRoll(student.rollNumber),
      admissionDate: student.admissionDate,
      monthlyFee: student.monthlyFee
    });
    setShowModal(true);
  };

  const handleView = (student: Student) => {
    setViewingStudent(student);
    setShowViewModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prefix = getGradePrefix(formData.grade);
    const finalData = {
      ...formData,
      rollNumber: `${prefix}-${formData.rollNumber}`
    };

    if (editingId) {
      onUpdateStudent(editingId, finalData);
    } else {
      onAddStudent(finalData);
    }
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleGradeChange = (grade: string) => {
    setFormData({
      ...formData,
      grade,
      monthlyFee: GRADE_FEES[grade] || 0
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Student Directory</h1>
          <p className="text-sm text-slate-500">Managing {students.length} pupil records.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-lg text-sm w-full sm:w-auto"
        >
          <UserPlus size={18} /> Add Student
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[650px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class & Roll</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Fee</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {student.image ? (
                        <img 
                          src={student.image} 
                          alt={student.name} 
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center font-black text-green-700 shrink-0 border border-green-100">
                          {student.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{student.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">S/O {student.fatherName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">{student.grade} - {student.section}</span>
                      <span className="text-[9px] font-black text-slate-400 mt-0.5 tracking-widest uppercase">
                        {student.rollNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black tracking-widest uppercase border border-indigo-100">
                      {student.portalId}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-black text-green-700">Rs. {student.monthlyFee?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleView(student)}
                        className="p-2 bg-slate-50 text-indigo-400 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => handleEdit(student)}
                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100 transition-all border border-slate-100"
                        title="Edit Profile"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => onDeleteStudent(student.id)}
                        className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100"
                        title="Delete Student"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">
                {editingId ? 'Edit Profile' : 'New Admission'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 p-2 rounded-xl hover:bg-white shadow-sm transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
              {/* Image Upload Section */}
              <div className="flex flex-col items-center justify-center pb-4 border-b border-slate-100 border-dashed">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-green-500">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Camera size={32} className="text-slate-300" />
                    )}
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Upload size={20} className="text-white" />
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                  {formData.image && (
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, image: ''})}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">Student Photograph</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-500 outline-none transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Father's Name</label>
                  <input required type="text" value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-500 outline-none transition-all text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade Selection</label>
                  <select value={formData.grade} onChange={e => handleGradeChange(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none transition-all font-bold text-slate-700 text-sm">
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Numeric Roll No</label>
                  <div className="relative flex">
                    <div className="px-3 py-3 bg-slate-100 border-y border-l border-slate-200 rounded-l-xl text-slate-500 font-black text-xs flex items-center">{getGradePrefix(formData.grade)}-</div>
                    <input required type="text" value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value.replace(/\D/g, '')})} className="flex-1 px-4 py-3 rounded-r-xl border border-slate-200 outline-none transition-all font-bold text-sm" placeholder="e.g. 02" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Fee (Rs)</label>
                  <input required type="number" value={formData.monthlyFee} onChange={e => setFormData({...formData, monthlyFee: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none transition-all font-black text-slate-800 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none transition-all text-sm" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Home Address</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3.5 text-slate-400" />
                    <textarea 
                      value={formData.address} 
                      onChange={e => setFormData({...formData, address: e.target.value})} 
                      className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-200 focus:border-green-500 outline-none transition-all text-sm min-h-[80px]"
                      placeholder="Enter student's complete home address..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-4 font-bold text-slate-400">Discard</button>
                <button type="submit" className="flex-1 py-4 rounded-xl bg-green-600 text-white font-black hover:bg-green-700 shadow-lg shadow-green-500/20 text-sm">
                  {editingId ? 'Save Updates' : 'Confirm Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showViewModal && viewingStudent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="relative h-32 bg-indigo-600">
              <button 
                onClick={() => setShowViewModal(false)} 
                className="absolute top-4 right-4 text-white/80 hover:text-white p-2 bg-white/10 rounded-xl backdrop-blur-md transition-all"
              >
                <X size={20} />
              </button>
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-xl">
                  <div className="w-full h-full rounded-[1.25rem] bg-slate-100 overflow-hidden flex items-center justify-center">
                    {viewingStudent.image ? (
                      <img src={viewingStudent.image} alt={viewingStudent.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Camera size={32} className="text-slate-300" />
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-16 pb-8 px-8 text-center">
              <h3 className="text-xl font-black text-slate-800">{viewingStudent.name}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                {viewingStudent.grade} • {viewingStudent.rollNumber}
              </p>
              
              <div className="mt-8 space-y-4 text-left">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Father's Name</p>
                  <p className="text-sm font-bold text-slate-700">{viewingStudent.fatherName}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Number</p>
                  <p className="text-sm font-bold text-slate-700">{viewingStudent.phone}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Home Address</p>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed">
                    {viewingStudent.address || 'No address provided'}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowViewModal(false)}
                className="w-full mt-8 py-4 bg-slate-800 text-white rounded-2xl font-black text-sm hover:bg-slate-900 transition-all shadow-lg"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
