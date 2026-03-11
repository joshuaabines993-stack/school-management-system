import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, BookOpen, CreditCard, Lock, Unlock, 
  LogOut, GraduationCap, Calendar as CalendarIcon, 
  CheckCircle2, Bell, Megaphone, FileText, Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [branding, setBranding] = useState({
    school_name: 'School Portal',
    theme_color: '#001f3f',
    school_logo: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Kunin ang Branding mula sa branding.php
        const brandRes = await axios.get('http://localhost/sms-api/branding.php');
        if (brandRes.data) setBranding(brandRes.data);

        // 2. Kunin ang Student Info mula sa get_students.php
        const studentRes = await axios.get('http://localhost/sms-api/get_students.php');
        const myData = studentRes.data.find(s => s.email === user.email);
        if (myData) setStudentData(myData);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.email) fetchData();
  }, [user.email]);

  const isLocked = !studentData || studentData.enrollment_status === 'Pending';

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-slate-400">LOADING SYSTEM...</div>;

  return (
    // Flex row para ang sidebar ay nasa gilid at main content sa kanan
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* --- SIDEBAR (Fixed to Left) --- */}
      <aside 
        style={{ backgroundColor: branding.theme_color }} 
        className="w-72 text-white flex flex-col border-r-4 border-yellow-500 shadow-2xl shrink-0 z-20"
      >
        <div className="p-8 text-center border-b border-white/5">
          {/* LOGO: Ginagamit ang URL mula sa branding.php */}
          <div className="w-20 h-20 bg-white rounded-3xl mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-yellow-500 shadow-xl">
            {branding.school_logo ? (
              <img src={branding.school_logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-800 font-black text-2xl italic">LOGO</span>
            )}
          </div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 leading-tight">
            {branding.school_name}
          </h2>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <SidebarBtn icon={<User size={18}/>} label="Dashboard" active />
          <SidebarBtn 
            icon={isLocked ? <Lock size={18}/> : <BookOpen size={18}/>} 
            label="LMS Classroom" 
            onClick={() => !isLocked && navigate('/lms')}
            disabled={isLocked}
          />
          <SidebarBtn icon={<CreditCard size={18}/>} label="Accounting" onClick={() => navigate('/accounting')} />
        </nav>

        <div className="p-6 border-t border-white/5">
          <button onClick={logout} className="w-full p-4 bg-white/5 text-white/60 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3">
            <LogOut size={16} /> Logout System
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT (Scrollable on Right) --- */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8 md:p-12">
          
          {/* HEADER (Top Info gaya ng nasa screenshot mo) */}
          <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-2 mb-4">
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
              STUDENT ID: {studentData?.student_id || '2026-0004'}
            </p>
          </header>

          {/* DASHBOARD GRID CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              {/* ANNOUNCEMENT */}
              <div className="bg-indigo-600 text-white p-5 rounded-[2rem] flex items-center gap-5 shadow-xl overflow-hidden">
                <Megaphone size={24} className="shrink-0 animate-pulse" />
                <marquee className="font-black text-sm uppercase tracking-widest italic">
                  Welcome to {branding.school_name} portal! Please ensure your account is verified to access the LMS modules.
                </marquee>
              </div>

              {/* RECORD SUMMARY */}
              <section className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
                <h3 className="font-black text-slate-400 mb-8 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                   <CheckCircle2 size={14}/> Student Record Overview
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                   <InfoItem label="School Year" value={studentData?.school_year} />
                   <InfoItem label="Payment Plan" value={studentData?.payment_plan} />
                   <InfoItem label="Prev School" value={studentData?.prev_school} />
                   <InfoItem label="LRN Number" value={studentData?.lrn} />
                </div>
              </section>
            </div>

            {/* SIDE CARDS */}
            <div className="space-y-8">
               {/* LOCK STATUS */}
               <div className={`p-8 rounded-[2.5rem] border-4 transition-all ${isLocked ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 leading-none">Account Status</p>
                 <div className="flex items-center gap-4">
                    <div className={`${isLocked ? 'bg-red-500' : 'bg-emerald-500'} text-white p-4 rounded-3xl shadow-lg`}>
                       {isLocked ? <Lock size={28}/> : <Unlock size={28}/>}
                    </div>
                    <div>
                       <p className={`font-black text-2xl leading-none ${isLocked ? 'text-red-700' : 'text-emerald-700'}`}>
                          {isLocked ? 'LOCKED' : 'ACTIVE'}
                       </p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{studentData?.enrollment_status || 'Pending'}</p>
                    </div>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

// HELPER COMPONENTS
const SidebarBtn = ({ icon, label, active, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${active ? 'bg-yellow-500 text-[#001f3f] shadow-lg' : disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 text-slate-300'}`}>
    {icon} {label}
  </button>
);

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">{label}</p>
    <p className="text-sm font-black text-slate-800">{value || '---'}</p>
  </div>
);

export default StudentDashboard;