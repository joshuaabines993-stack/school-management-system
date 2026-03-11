import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, BookOpen, CreditCard, Lock, Unlock, 
  LogOut, GraduationCap, Calendar, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  
  // --- BRANDING STATE ---
  const [branding, setBranding] = useState({
    school_name: 'School Portal',
    theme_color: '#001f3f', // Default Navy Blue
    school_logo: ''
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Fetch Branding Settings mula sa branding.php 
        const brandRes = await axios.get('http://localhost/sms-api/branding.php');
        if (brandRes.data) {
          setBranding(brandRes.data);
        }

        // 2. Fetch Student Info mula sa get_students.php
        const studentRes = await axios.get('http://localhost/sms-api/get_students.php');
        const myData = studentRes.data.find(s => s.email === user.email);
        if (myData) setStudentData(myData);

      } catch (error) {
        console.error("Error loading portal data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.email) fetchAllData();
  }, [user.email]);

  const isLocked = !studentData || studentData.enrollment_status === 'Pending';

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse">LOADING...</div>;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* --- DYNAMIC SIDEBAR (Uses theme_color) --- */}
      <aside 
        style={{ backgroundColor: branding.theme_color }} 
        className="w-72 text-white flex flex-col border-r-4 border-yellow-500 shadow-2xl z-20 transition-colors duration-500"
      >
        <div className="p-8 text-center border-b border-white/5">
          {/* DYNAMIC LOGO mula sa database  */}
          <div className="w-20 h-20 bg-white rounded-3xl mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-yellow-500 shadow-xl">
            {branding.school_logo ? (
              <img src={branding.school_logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#001f3f] font-black text-2xl">CSPB</span>
            )}
          </div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 leading-tight">
            {branding.school_name}
          </h2>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <MenuBtn icon={<User size={18}/>} label="Dashboard" active />
          <MenuBtn 
            icon={isLocked ? <Lock size={18}/> : <BookOpen size={18}/>} 
            label="LMS Classroom" 
            onClick={() => !isLocked && navigate('/lms')}
            disabled={isLocked}
          />
          <MenuBtn icon={<CreditCard size={18}/>} label="Accounting" onClick={() => navigate('/accounting')} />
        </nav>

        <div className="p-6 border-t border-white/5 text-center">
          <p className="text-[8px] font-bold opacity-40 mb-4 uppercase tracking-widest">Powered by SMS v1.0</p>
          <button 
            onClick={logout} 
            className="w-full p-4 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-red-500 hover:border-red-500 transition-all flex items-center justify-center gap-3"
          >
            <LogOut size={16} /> Logout System
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto bg-white/50 relative">
        <div className="max-w-6xl mx-auto p-8 md:p-12">
          
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-yellow-500 text-[#001f3f] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                {studentData?.enrollment_type || 'CONTINUING'}
              </span>
              <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                {studentData?.grade_level || 'GRADE 12'}
              </span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-1">
              Mabuhay, <span style={{ color: branding.theme_color }}>{studentData?.first_name || 'Joshua'}!</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.3em]">
              Student ID: {studentData?.student_id || '2026-0004'}
            </p>
          </header>

          {/* Account Restriction Alert */}
          {isLocked && (
            <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[2.5rem] mb-10 flex items-center gap-8 shadow-sm">
              <div className="bg-red-500 text-white p-5 rounded-3xl shadow-lg">
                <Lock size={32} />
              </div>
              <div>
                <h3 className="text-red-600 font-black uppercase text-[10px] tracking-widest mb-1">Account Restriction</h3>
                <h2 className="text-xl font-black text-slate-800 leading-tight italic">Naka-lock ang iyong E-Learning Access</h2>
                <p className="text-slate-500 text-sm mt-1 font-medium max-w-xl">
                  Ang iyong portal ay kasalukuyang nasa <b>{studentData?.enrollment_status || 'Pending'}</b> status.
                </p>
              </div>
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard label="Classification" value={studentData?.enrollment_type} icon={<GraduationCap size={24}/>} color={branding.theme_color} />
            <StatCard label="Current Year" value={studentData?.grade_level} icon={<Calendar size={24}/>} color={branding.theme_color} />
            <StatCard label="Portal Status" value={studentData?.enrollment_status === 'Verified' ? 'Active' : 'Pending'} icon={<CheckCircle2 size={24}/>} color={branding.theme_color} />
          </div>

          {/* Record Section */}
          <section className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
             <h3 className="font-black text-slate-400 mb-8 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                <CheckCircle2 size={14}/> Student Record Overview
             </h3>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                <InfoGroup label="School Year" value={studentData?.school_year} />
                <InfoGroup label="Payment Plan" value={studentData?.payment_plan} />
                <InfoGroup label="Previous School" value={studentData?.prev_school} />
                <InfoGroup label="LRN Number" value={studentData?.lrn} />
             </div>
          </section>
        </div>
      </main>
    </div>
  );
};

// COMPONENT HELPERS
const MenuBtn = ({ icon, label, active, onClick, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all
    ${active ? 'bg-yellow-500 text-[#001f3f] shadow-lg' : 
    disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 text-slate-300'}`}
  >
    {icon} {label}
  </button>
);

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center group hover:border-slate-300 transition-all">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p style={{ color: color }} className="text-xl font-black">{value || '---'}</p>
    </div>
    <div className="text-slate-200 group-hover:scale-110 transition-transform">
      {icon}
    </div>
  </div>
);

const InfoGroup = ({ label, value }) => (
  <div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">{label}</p>
    <p className="text-sm font-black text-slate-800">{value || 'NOT PROVIDED'}</p>
  </div>
);

export default StudentDashboard;