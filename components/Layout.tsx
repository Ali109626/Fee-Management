
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  FileText, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  Search
} from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onLogout: () => void;
  schoolName: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  role, 
  setRole,
  searchTerm,
  setSearchTerm,
  onLogout,
  schoolName
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = React.useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 3).toUpperCase();
  };

  const navItems = role === 'Student' ? [
    { id: 'portal', label: 'My Portal', icon: LayoutDashboard },
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'fees', label: 'Fee Management', icon: Wallet },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const handleNavClick = (id: string) => {
    if (role === 'Student') return; // Student only has one tab
    setActiveTab(id);
    setIsSidebarOpen(false); 
  };

  return (
    <div className="min-h-screen flex bg-slate-50 relative">
      {/* Mobile Drawer Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Responsive Sidebar */}
      <aside className={`no-print fixed lg:sticky top-0 h-[100dvh] bg-white border-r border-slate-200 z-50 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72'} 
        lg:translate-x-0 ${isDesktopCollapsed ? 'lg:w-20' : 'lg:w-64'}`}>
        
        <div className="p-4 h-full flex flex-col overflow-y-auto scrollbar-hide">
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-green-200 shrink-0">
                {getInitials(schoolName)}
              </div>
              {(!isDesktopCollapsed || isSidebarOpen) && (
                <span className="font-bold text-sm tracking-tight text-slate-800 truncate">{schoolName}</span>
              )}
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                    isActive 
                      ? 'bg-green-50 text-green-700' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon size={22} className="shrink-0" />
                  {(!isDesktopCollapsed || isSidebarOpen) && <span className="font-medium text-sm">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className={`flex items-center gap-3 px-2 ${isDesktopCollapsed && !isSidebarOpen ? 'justify-center' : ''}`}>
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                <Users size={16} className="text-slate-500" />
              </div>
              {(!isDesktopCollapsed || isSidebarOpen) && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-900 truncate">{role}</span>
                  {role !== 'Student' && (
                    <select 
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="text-[10px] text-green-600 bg-transparent focus:outline-none cursor-pointer font-bold"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Accountant">Accountant</option>
                      <option value="Staff">Staff</option>
                    </select>
                  )}
                </div>
              )}
            </div>
            <button 
              onClick={onLogout}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all ${isDesktopCollapsed && !isSidebarOpen ? 'justify-center' : ''}`}
            >
              <LogOut size={22} className="shrink-0" />
              {(!isDesktopCollapsed || isSidebarOpen) && <span className="font-medium text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="no-print h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-lg lg:hidden text-slate-600 shrink-0"
            >
              <Menu size={22} />
            </button>
            <button 
              onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
              className="p-2 hover:bg-slate-100 rounded-lg hidden lg:block text-slate-400 shrink-0"
            >
              <Menu size={20} />
            </button>
            
            {role !== 'Student' && (
              <div className="relative flex-1 max-w-[160px] sm:max-w-xs md:max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-500 transition-all text-sm h-10"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 md:gap-3 ml-2 shrink-0">
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full relative hidden sm:block">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg lg:hidden transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm shrink-0 ${
              role === 'Student' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'
            }`}>
              {role === 'Student' ? 'S' : 'A'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
