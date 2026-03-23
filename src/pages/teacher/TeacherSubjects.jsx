import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Clock, Layers, Layout, WifiOff } from 'lucide-react';
import OfflineBanner from '../../utils/offlinebanner'; // Reusable Component

const TeacherSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false); // DAGDAG: Para sa Retry animation

  // INILABAS ANG FETCH FUNCTION PARA PWEDENG I-CALL NG RETRY BUTTON
  const fetchSubjects = async () => {
    setIsRetrying(true);
    try {
      const response = await fetch('http://localhost/sms-api/get_subjects.php');
      const data = await response.json();
      setSubjects(data);
      setIsServerOffline(false);
    } catch (error) {
      setIsServerOffline(true);
      // DUMMY DATA PARA SA SUBJECTS (LESSONS)
      setSubjects([
        { id: 1, name: 'Filipino 10', description: 'Panitikan at Gramatika', units: '3.0', schedule: 'MWF 8:00 AM', color: 'bg-orange-500' },
        { id: 2, name: 'English Composition', description: 'Academic Writing and Research', units: '3.0', schedule: 'TTH 10:30 AM', color: 'bg-blue-500' },
        { id: 3, name: 'General Mathematics', description: 'Logic and Problem Solving', units: '4.0', schedule: 'Fri 1:00 PM', color: 'bg-emerald-500' },
      ]);
    } finally {
      setTimeout(() => setIsRetrying(false), 800); // Fake delay para sa smooth UI transition
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    // ROOT CONTAINER - GLASSMORPHISM SETUP
    <div className="w-full h-full bg-transparent">
      
      {/* 1. GPU-OPTIMIZED CSS ANIMATION */}
      <style>{`
        @keyframes fadeInUpGPU {
          from { opacity: 0; transform: translate3d(0, 15px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .animate-stagger {
          animation: fadeInUpGPU 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          will-change: opacity, transform;
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* ========================================== */}
        {/* HEADER SECTION - GLASSMORPHISM */}
        {/* ========================================== */}
        <div 
          className="animate-stagger flex flex-col justify-center bg-white/40 backdrop-blur-md px-5 py-4 rounded-xl border border-white shadow-sm" 
          style={{ animationDelay: '0ms' }}
        >
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">My Subjects</h2>
          <p className="text-[11px] text-slate-600 font-medium mt-0.5">Ito ang mga subjects/lessons na itinalaga sa iyo ngayong semester.</p>
        </div>

        {/* ========================================== */}
        {/* REUSABLE OFFLINE BANNER */}
        {/* ========================================== */}
        <OfflineBanner 
          isServerOffline={isServerOffline} 
          isRetrying={isRetrying} 
          onRetry={fetchSubjects} 
        />

        {/* ========================================== */}
        {/* SUBJECT CARDS GRID */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {subjects.map((sub, index) => (
            <div 
              key={sub.id} 
              className="animate-stagger bg-white/40 backdrop-blur-md border border-white rounded-xl overflow-hidden flex shadow-sm hover:shadow-md hover:bg-white/60 transition-all duration-300 transform-gpu hover:-translate-y-1 group" 
              style={{ animationDelay: `${100 + (index * 50)}ms` }}
            >
              {/* Color Strip (Pimanipis para mas modern) */}
              <div className={`w-1.5 ${sub.color}`}></div>
              
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-base font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                    {sub.name}
                  </h3>
                  <span className="bg-white/60 border border-white text-slate-600 text-[9px] font-black px-2 py-1 rounded-md shadow-sm uppercase tracking-widest shrink-0">
                    {sub.units} UNITS
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-500 mb-4 leading-relaxed line-clamp-2">
                  {sub.description}
                </p>
                
                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-2 border-t border-white/50 pt-3 mt-auto">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                    <Clock size={12} className="text-indigo-500" /> 
                    <span className="truncate">{sub.schedule}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                    <Layers size={12} className="text-indigo-500" /> 
                    <span>4 Modules</span>
                  </div>
                </div>

                {/* Buttons - Adjusted to match Glassmorphism */}
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-all">
                    View Modules
                  </button>
                  <button className="flex-1 py-1.5 bg-white/60 backdrop-blur-sm border border-white text-slate-600 rounded-lg text-[10px] font-bold hover:bg-white hover:shadow-sm transition-all">
                    Lesson Plan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default TeacherSubjects;