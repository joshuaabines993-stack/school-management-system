import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// Optional: Import icons from a library like lucide-react or heroicons
// import { BookOpen, CreditCard, User, ClipboardList, LogOut } from 'lucide-react';

const StudentDashboard = () => {
  const { user, logout, branding } = useAuth();
  const navigate = useNavigate();

  // Architecture Note: This data would eventually come from your PHP RESTful API [cite: 8, 19]
  const studentData = {
    enrollmentStatus: "Enrolled",
    paymentStatus: "Paid", // If "Unpaid", LMS access should be restricted 
    currentGPA: "1.25"
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation / Header */}
      <nav className="bg-white shadow-sm border-b px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Dynamic Branding: Implementation of Phase 3 [cite: 27] */}
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            {branding?.logoInitial || 'S'}
          </div>
          <h2 className="text-xl font-bold text-slate-800">SMS Portal</h2>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-medium transition-colors"
        >
          <span>Log Out</span>
        </button>
      </nav>

      <main className="p-8 max-w-7xl mx-auto w-full">
        {/* Welcome Section */}
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 mb-2">
            Mabuhay, {user?.full_name || 'Student'}! 👋
          </h1>
          <p className="text-slate-500">Welcome back to your academic overview.</p>
        </header>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Enrollment Status" value={studentData.enrollmentStatus} color="text-green-600" />
          <StatCard title="Payment Status" value={studentData.paymentStatus} color="text-blue-600" />
          <StatCard title="Current GWA" value={studentData.currentGPA} color="text-purple-600" />
        </div>

        {/* Module Selection Grid - Connecting the Core Functionalities  */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MenuCard 
            title="LMS" 
            desc="Access modules & assignments" 
            icon="📚" 
            onClick={() => navigate('/lms')}
            disabled={studentData.paymentStatus !== "Paid"} // Logic from Phase 2 [cite: 23]
          />
          <MenuCard 
            title="Enrollment" 
            desc="Register for new subjects" 
            icon="📝" 
            onClick={() => navigate('/enrollment')} 
          />
          <MenuCard 
            title="Grades & Schedule" 
            desc="View academic records" 
            icon="📊" 
            onClick={() => navigate('/records')} 
          />
          <MenuCard 
            title="Financials" 
            desc="Pay tuition & view balance" 
            icon="💳" 
            onClick={() => navigate('/billing')} 
          />
        </div>
      </main>
    </div>
  );
};

// Sub-component for Stats
const StatCard = ({ title, value, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</p>
    <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
  </div>
);

// Sub-component for Navigation Cards
const MenuCard = ({ title, desc, icon, onClick, disabled = false }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`group p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-left flex flex-col gap-4 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}
  >
    <div className="text-4xl">{icon}</div>
    <div>
      <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-sm text-slate-500">{disabled ? "Access locked (Check payment)" : desc}</p>
    </div>
  </button>
);

export default StudentDashboard;