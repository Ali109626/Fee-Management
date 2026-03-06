
import React from 'react';
import { 
  Users, 
  Wallet, 
  AlertCircle, 
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Student, FeeRecord, PaymentStatus, DashboardStats } from '../types';
import { getFinancialInsights } from '../services/geminiService';

interface DashboardProps {
  students: Student[];
  fees: FeeRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ students, fees }) => {
  const [aiInsights, setAiInsights] = React.useState<string | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = React.useState(false);

  const stats: DashboardStats = React.useMemo(() => {
    const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalPending = fees.reduce((sum, f) => sum + (f.totalAmount - f.paidAmount), 0);
    const pendingCount = fees.filter(f => f.status !== PaymentStatus.PAID).length;

    return {
      totalStudents: students.length,
      totalCollected,
      totalPending,
      pendingCount
    };
  }, [students, fees]);

  const chartData = [
    { name: 'Jan', collected: 40000, pending: 24000 },
    { name: 'Feb', collected: 30000, pending: 13980 },
    { name: 'Mar', collected: 20000, pending: 98000 },
    { name: 'Apr', collected: 27800, pending: 39080 },
    { name: 'May', collected: 18900, pending: 48000 },
    { name: 'Jun', collected: 23900, pending: 38000 },
  ];

  const pieData = [
    { name: 'Paid', value: fees.filter(f => f.status === PaymentStatus.PAID).length },
    { name: 'Partial', value: fees.filter(f => f.status === PaymentStatus.PARTIAL).length },
    { name: 'Unpaid', value: fees.filter(f => f.status === PaymentStatus.UNPAID).length },
  ];

  const COLORS = ['#2563eb', '#f59e0b', '#ef4444'];

  const handleGetInsights = async () => {
    setIsLoadingInsights(true);
    const insights = await getFinancialInsights(students, fees);
    setAiInsights(insights);
    setIsLoadingInsights(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Branch Stats</h1>
          <p className="text-sm text-slate-500">Real-time performance overview.</p>
        </div>
        <button 
          onClick={handleGetInsights}
          disabled={isLoadingInsights}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 text-sm w-full md:w-auto"
        >
          <Sparkles size={18} />
          {isLoadingInsights ? 'Analyzing...' : 'AI Insights'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Students" value={stats.totalStudents.toString()} icon={Users} color="blue" />
        <StatCard label="Collected" value={`Rs. ${stats.totalCollected.toLocaleString()}`} icon={Wallet} color="green" />
        <StatCard label="Outstanding" value={`Rs. ${stats.totalPending.toLocaleString()}`} icon={AlertCircle} color="amber" />
        <StatCard label="Health" value={`${Math.round((stats.totalCollected / (stats.totalCollected + stats.totalPending || 1)) * 100)}%`} icon={TrendingUp} color="indigo" />
      </div>

      {aiInsights && (
        <div className="bg-white border-l-4 border-indigo-500 rounded-2xl p-5 md:p-6 shadow-sm animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 mb-3 text-indigo-700 font-black text-xs uppercase tracking-widest">
            <Sparkles size={16} /> Assistant Report
          </div>
          <div className="text-sm text-slate-600 whitespace-pre-line leading-relaxed italic">
            {aiInsights}
          </div>
          <button onClick={() => setAiInsights(null)} className="mt-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="font-black text-slate-800 mb-6 text-sm uppercase tracking-widest">Revenue Flow</h3>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px'}}
                />
                <Bar dataKey="collected" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-black text-slate-800 mb-6 text-sm uppercase tracking-widest">Status</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold">{item.name}</span>
                <span className="font-black text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{label: string, value: string, icon: any, color: string}> = ({ label, value, icon: Icon, color }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center mb-4`}>
        <Icon size={20} />
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
      <h4 className="text-xl font-black text-slate-800 mt-1">{value}</h4>
    </div>
  );
};

export default Dashboard;
