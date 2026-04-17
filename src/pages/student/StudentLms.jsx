import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, Video, FileText, GraduationCap, 
  Lock, Unlock, Loader2, ArrowLeft, PlayCircle, 
  ClipboardList, MessageSquare, Info, MoreVertical,
  HelpCircle, CheckCircle2, ShieldCheck, BarChart3,
  Calendar, Clock, Bell, Wallet, Activity, ArrowRight,
  MonitorPlay, Timer
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentLms = () => {
  const { user, branding, API_BASE_URL } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); 
  const [modules, setModules] = useState([]); 

  // --- MOCK DATA FOR LMS ANALYTICS & SCHEDULING ---
  const lmsAnalytics = {
    totalHours: 28.5,
    sessions: 42,
    completionRate: 85
  };

  const scheduleToday = [
    { time: "08:00 AM - 09:30 AM", subject: "CORE-MATH", room: "Room 101", type: "Lecture" },
    { time: "10:00 AM - 11:30 AM", subject: "APPLIED-ECON", room: "Online Zoom", type: "Virtual" },
  ];

  const pendingTasks = [
    { title: "Chapter 1 Quiz", subject: "CORE-MATH", due: "Today, 11:59 PM" },
    { title: "Reaction Paper", subject: "APPLIED-ECON", due: "Tomorrow, 08:00 AM" }
  ];

  const getStudentDetails = (data) => {
    const grade = (data.grade_level || "").toString().toUpperCase();
    const gNum = parseInt(grade.replace(/\D/g, ''));
    const isCollege = grade.includes('YEAR') || gNum > 12 || grade.includes('COLLEGE');
    const isSHS = gNum === 11 || gNum === 12;

    let dept = data.department_name || "Basic Education";
    let displayMain = data.section || "TBA"; 
    let majorDisplay = data.major || "N/A";

    if (isCollege) {
        dept = data.department_name || "College";
        displayMain = data.program_code || "N/A"; 
    } else if (isSHS) {
        dept = data.department_name || "Senior High School";
        displayMain = data.program_code ? `${data.program_code} - ${data.section}` : data.section;
    } else {
        if (grade.includes('KINDER') || (gNum >= 1 && gNum <= 6)) dept = "Elementary";
        if (gNum >= 7 && gNum <= 10) dept = "Junior High School";
        displayMain = data.section || "TBA";
    }

    return { dept, displayMain, major: majorDisplay, isCollege, programDesc: data.program_description || "" };
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/student/get_students.php`);
      const studentList = response.data.students || [];
      const billingItems = response.data.billing_items || []; 
      const myData = studentList.find(s => s.email === user.email);
      
      if (myData) {
        // --- 1. CALCULATE OVERALL PAYMENT STATUS ---
        const totalAmount = parseFloat(myData.total_amount || 0);
        const totalPaidOverall = parseFloat(myData.paid_amount || 0);
        const isPaidFull = totalPaidOverall >= (totalAmount - 1); 
        const isPartial = totalPaidOverall > 0 && totalPaidOverall < totalAmount;
        myData.computedPaymentStatus = isPaidFull ? 'Fully Paid' : isPartial ? 'Partial Payment' : 'Unpaid';
        myData.remainingBalance = Math.max(0, totalAmount - totalPaidOverall);

        // --- 2. IMPROVED TUITION SEARCH ---
        const tuitionItem = billingItems.find(item => 
            item.billing_id === myData.billing_id && 
            (item.item_name.toLowerCase().includes("tuition") || item.item_name.toLowerCase().includes("tf"))
        );

        const totalTuitionPrice = tuitionItem ? parseFloat(tuitionItem.amount) : (totalAmount * 0.7); 
        const actualTuitionPaid = tuitionItem ? parseFloat(tuitionItem.paid_amount) : totalPaidOverall;
        const tuitionThreshold = totalTuitionPrice * 0.5; 

        // --- 3. THE SMART GATEKEEPER ---
        const isValidStatus = ["Enrolled", "Assessed"].includes((myData.enrollment_status || "").trim());
        const hasPaidThreshold = actualTuitionPaid >= (tuitionThreshold - 1);
        const isOfficiallyPaid = myData.computedPaymentStatus === 'Partial Payment' || myData.computedPaymentStatus === 'Fully Paid';

        if (isValidStatus && (hasPaidThreshold || isOfficiallyPaid)) {
          myData.isLmsLocked = false;
          myData.neededForUnlock = 0;
          try {
              const moduleResponse = await axios.get(`${API_BASE_URL}/student/get_lms_content.php`, {
                  params: { section_id: myData.section_id }
              });
              setModules(moduleResponse.data.modules || []);
          } catch (modErr) {
              console.error("Error loading modules:", modErr);
          }
        } else {
          myData.isLmsLocked = true;
          myData.neededForUnlock = Math.max(0, tuitionThreshold - actualTuitionPaid);
        }

        myData.displayTuition = totalTuitionPrice; 
        myData.actualTuitionPaid = actualTuitionPaid;

        const details = getStudentDetails(myData);
        myData.dynamicDept = details.dept;
        myData.formattedMain = details.displayMain; 
        myData.major = details.major;
        myData.isCollege = details.isCollege;
        myData.programDesc = details.programDesc;
        
        setStudentData(myData);
      }
    } catch (err) {
      console.error("Critical Error fetching LMS data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchData();
  }, [user.email]);

  const safeThemeColor = branding?.theme_color?.startsWith('#') ? branding.theme_color : '#6366f1';
  const today = new Date();

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center font-sans font-black animate-pulse text-slate-400 uppercase tracking-widest gap-4 bg-slate-50/50">
      <Loader2 className="animate-spin text-indigo-500" size={40} />
      Entering Classroom...
    </div>
  );

  // ==========================================
  // LOCKED STATE (Modern & Soft)
  // ==========================================
  if (studentData?.isLmsLocked) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50/50 font-sans">
        <div className="max-w-lg w-full bg-white p-10 md:p-12 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center animate-in zoom-in-95 duration-500 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-800"></div>
          
          <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-800 mx-auto mb-8 border border-slate-100 shadow-sm">
            <Lock size={32} />
          </div>
          
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-3">LMS Access Restricted</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-8 text-sm">
            Hello, <span className="font-bold text-slate-700">{studentData?.first_name}</span>. Your access to the Learning Management System is currently locked. 
            A minimum of 50% tuition payment is required to unlock your courses.
          </p>
          
          <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 text-left space-y-3 mb-8">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-widest">Tuition Basis</span>
                <span className="font-black text-slate-700">₱{studentData?.displayTuition?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-widest">Amount Paid</span>
                <span className="font-black text-emerald-600">₱{studentData?.actualTuitionPaid?.toLocaleString()}</span>
              </div>
              <div className="w-full h-px bg-slate-200 my-2"></div>
              {studentData?.neededForUnlock > 0 && (
                 <div className="flex justify-between items-center text-xs bg-red-50 p-3 rounded-xl border border-red-100">
                 <span className="font-bold text-red-600 uppercase tracking-widest flex items-center gap-1"><Info size={12}/> Required to Unlock</span>
                 <span className="font-black text-red-600 text-sm">₱{studentData.neededForUnlock.toLocaleString()}</span>
               </div>
              )}
          </div>

          <button onClick={() => navigate('/student/dashboard')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
            <ArrowLeft size={14} /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // INNER CATEGORY VIEW (Modules, Videos, etc.)
  // ==========================================
  const renderClassroomView = (title, icon, color, category, typeIcon) => {
    const filteredModules = modules.filter(m => m.type === category);
    return (
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 animate-in slide-in-from-right duration-500 font-sans bg-slate-50/50 min-h-screen">
        <button onClick={() => setViewMode('grid')} className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] tracking-widest mb-6 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-max">
          <ArrowLeft size={14} /> Back to LMS Hub
        </button>
        
        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div style={{ backgroundColor: color }} className="h-40 md:h-56 relative p-8 md:p-10 flex flex-col justify-end text-white">
            <div className="absolute top-0 right-0 p-8 opacity-20 transition-transform duration-700 hover:scale-110">{icon}</div>
            <div className="z-10">
              <span className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 inline-block backdrop-blur-sm">
                 {studentData?.dynamicDept}
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none drop-shadow-md">{title}</h2>
              <p className="text-white/90 font-bold text-sm mt-2 opacity-90">
                  {studentData?.formattedMain} {studentData?.isCollege && `(${studentData?.major})`}
              </p>
            </div>
          </div>
          
          <div className="p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.length > 0 ? (
                filteredModules.map((mod) => (
                  <div key={mod.id} className="p-6 border border-slate-100 rounded-[1.5rem] hover:shadow-xl hover:border-slate-200 cursor-pointer transition-all bg-white group flex flex-col justify-between min-h-[160px]">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                        <div style={{ backgroundColor: color }} className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
                            {typeIcon}
                        </div>
                        <MoreVertical size={18} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                        </div>
                        <h3 className="text-base font-black text-slate-800 tracking-tight leading-snug line-clamp-2">{mod.title}</h3>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {mod.subject_name}
                        </p>
                        <p className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                            {new Date(mod.created_at).toLocaleDateString()}
                        </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-100 rounded-[2rem]">
                  {icon}
                  <p className="font-bold uppercase tracking-widest text-[10px] mt-4">No {title} uploaded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (viewMode === 'modules') return renderClassroomView("Learning Modules", <BookOpen size={100}/>, safeThemeColor, "Module", <FileText size={18}/>);
  if (viewMode === 'lectures') return renderClassroomView("Video Lectures", <Video size={100}/>, "#6366f1", "Video", <PlayCircle size={18}/>);
  if (viewMode === 'quizzes') return renderClassroomView("Assessments", <ClipboardList size={100}/>, "#f43f5e", "Quiz", <CheckCircle2 size={18}/>);
  if (viewMode === 'discussion') return renderClassroomView("Discussions", <MessageSquare size={100}/>, "#0ea5e9", "Discussion", <HelpCircle size={18}/>);

  // ==========================================
  // MAIN LMS DASHBOARD (The "Classroom")
  // ==========================================
  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 w-full space-y-6 animate-in fade-in duration-500 font-sans bg-slate-50/50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <button onClick={() => navigate('/student/dashboard')} className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors">
             <ArrowLeft size={14}/> Exit to Lobby
          </button>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <MonitorPlay className="text-indigo-600" size={32}/> Digital Classroom
          </h1>
        </div>
        <div className="flex gap-2 items-center bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Online & Synced</span>
        </div>
      </div>

      {/* KPI ROW (LMS Analytics & Balance) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         
         {/* KPI 1: Study Time */}
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[1.2rem] flex items-center justify-center shrink-0">
               <Timer size={24}/>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Study Time</p>
               <h3 className="text-2xl font-black text-slate-800 leading-none mt-1">{lmsAnalytics.totalHours} <span className="text-sm text-slate-400">hrs</span></h3>
            </div>
         </div>

         {/* KPI 2: Sessions */}
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-[1.2rem] flex items-center justify-center shrink-0">
               <Activity size={24}/>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">LMS Logins</p>
               <h3 className="text-2xl font-black text-slate-800 leading-none mt-1">{lmsAnalytics.sessions} <span className="text-sm text-slate-400">sessions</span></h3>
            </div>
         </div>

         {/* KPI 3: Completion */}
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-5">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-[1.2rem] flex items-center justify-center shrink-0">
               <CheckCircle2 size={24}/>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Task Completion</p>
               <h3 className="text-2xl font-black text-slate-800 leading-none mt-1">{lmsAnalytics.completionRate}%</h3>
            </div>
         </div>

         {/* KPI 4: Financial Reminder (Subtle) */}
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between group cursor-pointer hover:border-slate-200 transition-colors" onClick={() => navigate('/student/accounting')}>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><Wallet size={12}/> Balance</p>
               <h3 className="text-xl font-black text-slate-800 leading-none mt-1 tracking-tight">₱{studentData?.remainingBalance?.toLocaleString()}</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
               <ArrowRight size={14}/>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT MAIN: Course Categories */}
        <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div onClick={() => setViewMode('modules')}><LMSCard icon={<BookOpen size={28} />} title="Learning Modules" desc="Readings and PDFs." count={`${modules.filter(m => m.type === 'Module').length} Items`} color={safeThemeColor} /></div>
          <div onClick={() => setViewMode('lectures')}><LMSCard icon={<PlayCircle size={28} />} title="Video Lectures" desc="Watch recorded lessons." count={`${modules.filter(m => m.type === 'Video').length} Clips`} color="#6366f1" /></div>
          <div onClick={() => setViewMode('quizzes')}><LMSCard icon={<ClipboardList size={28} />} title="Assessments" desc="Quizzes and Exams." count={`${modules.filter(m => m.type === 'Quiz').length} Tasks`} color="#f43f5e" /></div>
          <div onClick={() => setViewMode('discussion')}><LMSCard icon={<MessageSquare size={28} />} title="Discussions" desc="Interact with class." count="Active" color="#0ea5e9" /></div>
        </div>

        {/* RIGHT SIDEBAR: Academic Actions */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Today's Schedule (LMS Version) */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 text-sm">
               <Calendar size={16} className="text-indigo-500"/> Scheduled Classes Today
            </h3>
            <div className="space-y-4">
              {scheduleToday.map((sched, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 leading-tight">{sched.subject}</h4>
                    <p className="text-xs text-slate-500 font-medium">{sched.time} • {sched.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
               <ClipboardList size={80}/>
            </div>
            <div className="relative z-10">
               <h3 className="font-black text-white/90 mb-6 flex items-center gap-2 text-sm">
                  <CheckCircle2 size={16} className="text-yellow-400"/> Action Required
               </h3>
               <div className="space-y-4">
                  {pendingTasks.map((task, i) => (
                    <div key={i} className="p-4 rounded-[1.5rem] bg-white/10 border border-white/5 hover:bg-white/20 transition-colors cursor-pointer">
                       <div className="flex justify-between items-start mb-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400">{task.subject}</span>
                       </div>
                       <h4 className="font-bold text-sm leading-tight mb-2">{task.title}</h4>
                       <span className="inline-block px-2.5 py-1 bg-black/30 rounded-md text-[9px] font-bold text-white/70 uppercase">Due: {task.due}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const LMSCard = ({ icon, title, desc, count, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group h-full flex flex-col justify-between relative overflow-hidden">
    <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-125 transition-transform duration-700 pointer-events-none">
       {icon}
    </div>
    <div className="relative z-10">
      <div style={{ backgroundColor: color }} className="w-14 h-14 rounded-[1.2rem] flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 transition-transform">
         {icon}
      </div>
      <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-2">{title}</h3>
      <p className="text-slate-500 text-xs font-bold leading-relaxed">{desc}</p>
    </div>
    <div className="mt-8 relative z-10">
       <span className="text-[10px] font-black bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl uppercase tracking-widest group-hover:bg-slate-900 group-hover:text-white transition-colors border border-slate-100">{count}</span>
    </div>
  </div>
);

export default StudentLms;