import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User, BookOpen, CreditCard, Lock, Unlock,
  Calendar as CalendarIcon, ChevronRight, Bell, Clock, ArrowUpRight, 
  GraduationCap, LogOut, CheckCircle2, Megaphone, Wallet,
  Info, Eye, Menu, X, Printer, Activity, CheckCircle, ChevronLeft, CalendarDays,
  Loader2, BellOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, branding, API_BASE_URL } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  
  const [billingItems, setBillingItems] = useState([]); 
  const [allBillingItems, setAllBillingItems] = useState([]);
  
  const [viewModal, setViewModal] = useState({ open: false, type: '' });
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // --- MOCK SCHEDULE & TASKS ---
  const scheduleToday = [
    { time: "08:00 AM - 09:30 AM", subject: "CORE-MATH", description: "General Mathematics", room: "Room 101", color: "bg-purple-100 text-purple-600" },
    { time: "10:00 AM - 11:30 AM", subject: "APPLIED-ECON", description: "Applied Economics", room: "Room 102", color: "bg-blue-100 text-blue-600" },
    { time: "01:00 PM - 02:30 PM", subject: "CORE-PE", description: "Physical Education", room: "Gymnasium", color: "bg-emerald-100 text-emerald-600" },
  ];

  const pendingTasks = [
    { title: "Chapter 1 Quiz", subject: "CORE-MATH", due: "Today, 11:59 PM" },
    { title: "Reaction Paper", subject: "APPLIED-ECON", due: "Tomorrow, 08:00 AM" }
  ];

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/student/get_students.php`);
      const studentsArray = res.data.students;
      const allItems = res.data.billing_items;

      if (studentsArray && Array.isArray(studentsArray)) {
        const myData = studentsArray.find(s => s.email === user.email);
        if (myData) {
          const total = parseFloat(myData.total_amount || 0);
          const paid = parseFloat(myData.paid_amount || 0);
          
          const rawItems = allItems.filter(item => parseInt(item.billing_id) === parseInt(myData.billing_id));
          setAllBillingItems(rawItems);

          let currentPaidPool = paid;
          const remainingItems = rawItems.map(item => {
            let itemAmount = parseFloat(item.amount);
            if (currentPaidPool > 0) {
              if (currentPaidPool >= itemAmount) {
                currentPaidPool -= itemAmount;
                return null;
              } else {
                const newAmount = itemAmount - currentPaidPool;
                currentPaidPool = 0;
                return { ...item, amount: newAmount };
              }
            }
            return item;
          }).filter(item => item !== null);

          setStudentData(myData);
          setBillingItems(remainingItems);
        }
      }

      try {
        const annRes = await axios.get(`${API_BASE_URL}/notifications/get_student_announcements.php?student_id=${user.id}`);
        if (annRes.data.success) {
          setAnnouncements(annRes.data.data);
        } else {
          setAnnouncements([]);
        }
      } catch (annErr) {
        setAnnouncements([]);
      } finally {
        setLoadingAnnouncements(false);
      }

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchData();
  }, [user.email]);

  const handlePrint = () => window.print();

  // --- CALCULATION LOGIC ---
  const totalAmount = parseFloat(studentData?.total_amount || 0);
  const paidAmount = parseFloat(studentData?.paid_amount || 0);
  const remainingBalance = Math.max(0, totalAmount - paidAmount);

  const isPaid = paidAmount >= totalAmount && totalAmount > 0;
  
  const tuitionItem = allBillingItems.find(item => item.item_name.toLowerCase().includes('tuition'));
  const actualTuitionPaid = tuitionItem ? parseFloat(tuitionItem.paid_amount || 0) : 0;
  const tuitionAmount = tuitionItem ? parseFloat(tuitionItem.amount || 0) : 0;
  const tuitionThreshold = tuitionAmount * 0.5;

  const isLmsActive = isPaid || (tuitionAmount > 0 && actualTuitionPaid >= tuitionThreshold);
  const safeThemeColor = branding?.theme_color?.startsWith('#') ? branding.theme_color : '#6366f1'; // Defaulting to an Indigo/Purple vibe matching the reference

  const today = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center font-black animate-pulse text-slate-400 uppercase tracking-widest gap-4 bg-slate-50/50">
      <Loader2 className="animate-spin text-indigo-500" size={40} />
      Loading Academic Dashboard...
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 w-full space-y-6 animate-in fade-in duration-500 font-sans bg-slate-50/50 min-h-screen print:p-0 print:m-0 print:bg-white">
      
      {/* ========================================================
          1. TOP HEADER
          ======================================================== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 print:hidden mb-2">
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
            {today.toLocaleDateString('en-US', dateOptions)}
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
            Welcome back, <span style={{ color: safeThemeColor }}>{studentData?.first_name}! 👋</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsProfileOpen(true)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm">
            <User size={14} /> My Profile
          </button>
        </div>
      </div>

      {/* ========================================================
          2. KPI CARDS ROW (Learning Hours, LMS, Balance)
          ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        
        {/* Card A: LMS Gateway */}
        <div className={`p-6 rounded-[2rem] border transition-all ${
            isLmsActive ? 'bg-white border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${isLmsActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
              {isLmsActive ? <BookOpen size={20} /> : <Lock size={20} />}
            </div>
            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${isLmsActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {isLmsActive ? 'Unlocked' : 'Locked'}
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-1">LMS Classroom</h3>
          <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-2">
            {isLmsActive ? "Access your learning modules and assignments." : `Pay ₱${tuitionThreshold.toLocaleString()} to unlock LMS features.`}
          </p>
          <button 
            onClick={() => isLmsActive ? navigate('/student/lms') : navigate('/student/accounting')}
            className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
              isLmsActive ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200' : 'bg-slate-800 hover:bg-slate-900 text-white'
            }`}
          >
            {isLmsActive ? 'Enter LMS' : 'Go to Accounting'} <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Card B: Learning Hours (Aesthetic Mockup like reference) */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Activity size={16} className="text-blue-500"/> Learning Activity
            </h3>
            <span className="text-[10px] font-bold text-slate-400">This Week</span>
          </div>
          <div className="flex items-end gap-2 h-16 w-full mt-2">
             {/* Mock Bars */}
             {['Mo','Tu','We','Th','Fr','Sa','Su'].map((day, i) => {
               const height = [40, 70, 45, 90, 60, 20, 10][i];
               const isToday = day === today.toLocaleDateString('en-US', {weekday: 'short'}).substring(0,2);
               return (
                 <div key={day} className="flex flex-col items-center flex-1 gap-2 group">
                   <div className="w-full bg-slate-100 rounded-md flex items-end justify-center h-full overflow-hidden relative">
                      {isToday && <div className="absolute -top-6 bg-slate-800 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">4h</div>}
                      <div className={`w-full rounded-md transition-all ${isToday ? 'bg-indigo-500' : 'bg-indigo-200 hover:bg-indigo-300'}`} style={{height: `${height}%`}}></div>
                   </div>
                   <span className={`text-[9px] font-bold ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>{day}</span>
                 </div>
               )
             })}
          </div>
        </div>

        {/* Card C: Tuition / Balance */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
              <Wallet size={20} />
            </div>
            <button onClick={() => setViewModal({ open: true, type: 'Billing Statement' })} className="text-[10px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
               View Statement
            </button>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-4">Remaining Balance</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight mt-1">
              ₱{remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

      </div>

      {/* ========================================================
          3. MAIN CONTENT GRID
          ======================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 print:hidden">
        
        {/* LEFT COLUMN: Announcements & Progress (8 cols) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Announcements Section */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Megaphone size={18} className="text-indigo-500"/> Bulletin & Announcements
              </h2>
              <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-lg uppercase tracking-widest">Updates</span>
            </div>
            
            <div className="space-y-4">
               {loadingAnnouncements ? (
                  <div className="py-8 text-center text-slate-400"><Loader2 className="animate-spin inline mr-2" size={16}/> Fetching...</div>
               ) : announcements.length > 0 ? (
                  announcements.slice(0, 3).map((notif, i) => (
                    <div key={i} className="flex gap-4 p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow bg-slate-50/50 hover:bg-white group">
                      <div className={`w-2 h-full rounded-full shrink-0 ${
                         notif.type === 'Urgent Alert' ? 'bg-red-500' : notif.type === 'Task Reminder' ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                           <h4 className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{notif.title}</h4>
                           <span className="text-[10px] font-bold text-slate-400">{notif.date_posted}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{notif.message}</p>
                      </div>
                    </div>
                  ))
               ) : (
                  <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                     <BellOff size={32} className="mx-auto text-slate-300 mb-2"/>
                     <p className="text-xs font-bold text-slate-400">No new announcements at the moment.</p>
                  </div>
               )}
            </div>
          </div>

          {/* Today's Classes List (Aesthetic Version) */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-500"/> Today's Classes
              </h2>
              <div className="flex gap-1">
                 <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"><ChevronLeft size={14}/></button>
                 <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"><ChevronRight size={14}/></button>
              </div>
            </div>

            <div className="space-y-4">
              {scheduleToday.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No classes for today.</p>
              ) : (
                scheduleToday.map((sched, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 ${sched.color}`}>
                         <span className="text-[10px] font-black uppercase tracking-wider">{sched.subject.split('-')[0]}</span>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-sm">{sched.description}</h4>
                        <p className="text-[11px] font-bold text-slate-500 mt-0.5">{sched.subject} • {sched.room}</p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 shadow-sm">
                        {sched.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Calendar & Tasks (4 cols) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Aesthetic Calendar Widget */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
             <div className="flex justify-between items-center mb-6">
                <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><ChevronLeft size={16}/></button>
                <h3 className="font-black text-slate-800 text-sm">{today.toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}</h3>
                <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><ChevronRight size={16}/></button>
             </div>
             
             {/* Calendar Grid Mockup */}
             <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-[10px] font-black text-slate-400">{d}</div>)}
             </div>
             <div className="grid grid-cols-7 gap-1 text-center">
                {/* Blank spaces for 1st day offset (Mock for visual) */}
                <div className="p-2 text-transparent">0</div>
                <div className="p-2 text-transparent">0</div>
                <div className="p-2 text-transparent">0</div>
                {Array.from({length: 28}, (_, i) => i + 1).map(day => (
                  <div key={day} className={`p-2 text-xs font-bold rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                     day === today.getDate() ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
                  }`}>
                    {day}
                  </div>
                ))}
             </div>
             <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span> 3 Events This Month
             </div>
          </div>

          {/* Pending Tasks Widget */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2 text-sm">
               <CheckCircle size={16} className="text-emerald-500"/> Pending Tasks
            </h3>
            <div className="space-y-3">
               {pendingTasks.map((task, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div>
                       <h4 className="text-xs font-black text-slate-800">{task.title}</h4>
                       <p className="text-[10px] font-bold text-slate-400 mt-0.5">{task.subject}</p>
                    </div>
                    <div className="text-right">
                       <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                          {task.due.split(',')[0]}
                       </span>
                    </div>
                 </div>
               ))}
               <button className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors mt-2">
                  View All Tasks
               </button>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================
          MODALS (Kept original logic, just styled to match)
          ======================================================== */}
          
      {/* BILLING MODAL */}
      {viewModal.open && studentData && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-start justify-center p-4 pt-10 backdrop-blur-sm print:p-0 print:bg-white">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden print:shadow-none print:max-h-full print:rounded-none animate-in zoom-in-95 duration-200">
            {/* Same billing modal content as before but hidden slightly for brevity */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white print:hidden">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><CreditCard size={24}/></div>
                <h3 className="font-black text-slate-800 tracking-tight">Student Billing Statement</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-lg">
                   <Printer size={18} /> Print to PDF
                </button>
                <button onClick={() => setViewModal({ open: false, type: '' })} className="p-2.5 bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><X size={20}/></button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1 print:overflow-visible font-sans">
              <div className="flex items-start justify-between mb-8 border-b-4 border-slate-900 pb-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-[2rem] bg-slate-100 overflow-hidden border border-slate-200 shadow-sm">
                    {studentData.profile_image ? (
                      <img src={`${API_BASE_URL}/uploads/profiles/${studentData.profile_image}`} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-slate-400 font-black text-4xl">{studentData.first_name?.charAt(0)}</div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 uppercase leading-tight">{branding?.school_name}</h1>
                    <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">Office of the Finance</p>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none mb-2">{studentData.first_name} {studentData.last_name}</h2>
                    <p className="font-mono text-sm font-bold text-slate-500">ID: {studentData.student_id} • ₱ {remainingBalance.toLocaleString()} Balance</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Particulars</th>
                      <th className="py-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingItems.map((item, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-4 font-bold text-slate-700 uppercase text-xs">{item.item_name}</td>
                        <td className="py-4 text-right font-black text-slate-900">₱ {parseFloat(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bg-slate-900 text-white p-6 rounded-[2rem] flex justify-between items-center mt-4 print:bg-slate-100 print:text-slate-900">
                   <p className="font-black uppercase text-[10px] tracking-widest opacity-70">Grand Total Balance</p>
                   <p className="text-3xl font-black">₱ {remainingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE MODAL (Styled to match) */}
      {isProfileOpen && studentData && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-start justify-center p-4 pt-10 backdrop-blur-sm print:p-0 print:bg-white">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden print:shadow-none print:max-h-full print:rounded-none animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white print:hidden">
                <h3 className="font-black text-slate-800 tracking-tight flex items-center gap-2"><User size={20} className="text-indigo-600"/> Student Profile</h3>
                <button onClick={() => setIsProfileOpen(false)} className="p-2 bg-slate-100 text-slate-400 hover:bg-slate-200 rounded-xl transition-colors"><X size={18}/></button>
             </div>
             <div className="p-8">
                <div className="flex items-center gap-6 mb-8">
                   <div className="w-24 h-24 rounded-[2rem] bg-slate-100 overflow-hidden border border-slate-200 shadow-sm">
                      {studentData.profile_image ? <img src={`${API_BASE_URL}/uploads/profiles/${studentData.profile_image}`} className="w-full h-full object-cover" alt="Profile" /> : <div className="flex items-center justify-center w-full h-full text-slate-400 font-black text-3xl">{studentData.first_name?.charAt(0)}</div>}
                   </div>
                   <div>
                      <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{studentData.first_name} {studentData.last_name}</h2>
                      <p className="text-sm font-bold text-slate-500 mb-2">{studentData.student_id} • {studentData.grade_level}</p>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-lg">{studentData.enrollment_status}</span>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-[2rem]">
                   <InfoItem label="Program / Track" value={studentData.program_code || 'K-12 Basic Education'} />
                   <InfoItem label="Email Address" value={studentData.email} />
                   <InfoItem label="LRN Number" value={studentData.lrn} />
                   <InfoItem label="School Year" value={studentData.school_year} />
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-bold text-slate-800">{value || '---'}</p>
  </div>
);

export default StudentDashboard;