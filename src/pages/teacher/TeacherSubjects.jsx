import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, Clock, Layers, FileText, 
  Bookmark, GraduationCap 
} from 'lucide-react';
import OfflineBanner from '../../utils/offlinebanner';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner, PageHeader, EmptyState } from '../../components/shared/TeacherComponents';
import { SHARED_STYLES, ANIMATION_DELAYS } from '../../utils/teacherConstants';

const TeacherSubjects = () => {
  const { user, API_BASE_URL, branding } = useAuth(); // Kinuha ang branding data
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Dynamic branding color mula sa admin settings
  const themeColor = branding?.theme_color || '#6366f1';

  const fetchSubjects = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setIsRetrying(true);

    try {
      const token = localStorage.getItem('sms_token') || '';
      const response = await axios.get(`${API_BASE_URL}/teacher/get_my_schedule.php?teacher_id=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === 'success') {
        setSubjects(response.data.data || []);
        setIsServerOffline(false);
      } else {
        throw new Error(response.data.message || 'Error fetching schedule');
      }
    } catch (error) {
      console.error('Fetch subjects error:', error);
      setIsServerOffline(true);
      setSubjects([]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsRetrying(false), 800);
    }
  };

  useEffect(() => {
    if (user?.id) fetchSubjects();
  }, [user?.id]);

  if (isLoading) return <LoadingSpinner message="Inihahanda ang iyong mga subjects..." />;

  return (
    /* ENABLED SCROLLING: Ginamit ang h-full at overflow-y-auto.
       BRANDED SCROLLBAR: Ginamit ang custom-scroll class.
    */
    <div className="w-full h-full overflow-y-auto custom-scroll pr-2 pb-10">
      {/* BRANDING ENGINE: Dito natin "ginagaya" ang scrollbar style 
          mula sa layout gamit ang dynamic themeColor.
      */}
      <style>{`
        ${SHARED_STYLES}
        .custom-scroll::-webkit-scrollbar { width: 8px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { 
          background-color: ${themeColor}; 
          border-radius: 20px; 
          border: 2px solid transparent; 
          background-clip: content-box; 
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover { 
          background-color: ${themeColor}; 
          opacity: 0.8; 
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="My Subjects"
          subtitle="Pamahalaan ang iyong teaching load, modules, at lesson plans para sa semester na ito."
          badge={`${subjects.length} Assigned Subjects`}
        />

        <OfflineBanner
          isServerOffline={isServerOffline}
          isRetrying={isRetrying}
          onRetry={fetchSubjects}
        />

        {/* SUBJECTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
          {subjects.length > 0 ? (
            subjects.map((subject, index) => (
              <SubjectCard
                key={subject.id || index}
                subject={subject}
                index={index}
                isOffline={isServerOffline}
                themeColor={themeColor} // Ipinasa ang kulay sa cards
              />
            ))
          ) : !isServerOffline ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white shadow-sm">
              <EmptyState
                icon={BookOpen}
                title="Walang Assigned na Subject"
                message="Kasalukuyang wala pang nakatalagang subjects sa iyong account."
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

/**
 * Branded Subject Card Component
 */
const SubjectCard = ({ subject, index, isOffline, themeColor }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`animate-stagger group relative flex flex-col bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 transform-gpu ${
        isOffline ? 'opacity-70 grayscale-[0.5] pointer-events-none' : 'hover:shadow-2xl hover:-translate-y-2 hover:bg-white'
      }`}
      style={{ animationDelay: `${ANIMATION_DELAYS.firstCard + index * ANIMATION_DELAYS.increment}ms` }}
    >
      {/* THEME BORDER: Lumalabas lang kapag hinover ang card */}
      <div 
        className="absolute left-0 top-8 bottom-8 w-1.5 transition-all duration-300 rounded-r-full" 
        style={{ backgroundColor: themeColor, opacity: isHovered ? 1 : 0.2 }}
      />

      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200/50">
          <GraduationCap size={12} className="text-slate-500" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
            {subject.grade_level || 'Grade'}
          </span>
        </div>
        {/* UNITS BADGE: Gamit ang theme color background */}
        <div 
          className="px-3 py-1.5 rounded-xl border font-black text-[10px] shadow-sm tracking-tight"
          style={{ 
            backgroundColor: `${themeColor}15`, 
            borderColor: `${themeColor}30`, 
            color: themeColor 
          }}
        >
          {subject.units} UNITS
        </div>
      </div>

      <div className="mb-6 flex-1 relative z-10">
        <h3 className="text-xl font-black text-slate-800 leading-tight tracking-tight mb-2 group-hover:text-slate-900 transition-colors">
          {subject.subject_description}
        </h3>
        <div className="flex items-center gap-2">
           <Bookmark size={14} style={{ color: themeColor }} className="shrink-0" />
           <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
             Section: {subject.section || 'TBA'}
           </span>
        </div>
      </div>

      <div className="bg-slate-50/60 rounded-2xl p-4 space-y-3 mb-6 border border-slate-100 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <Clock size={14} style={{ color: themeColor }} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Schedule</span>
            <span className="text-[11px] font-bold text-slate-700 truncate">
              {subject.schedule || 'No Schedule Set'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-auto relative z-10">
        {/* VIEW MODULES BUTTON: Nagbabago ang kulay base sa theme sa hover */}
        <button
          className="w-full py-3 rounded-xl text-[12px] font-black transition-all flex items-center justify-center gap-2 shadow-sm border"
          style={{ 
            backgroundColor: isHovered ? themeColor : '#ffffff', 
            color: isHovered ? '#ffffff' : '#475569',
            borderColor: isHovered ? themeColor : '#e2e8f0'
          }}
        >
          <Layers size={16} /> View Modules
        </button>
        <button
          className="w-full py-2.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-xl text-[11px] font-bold hover:bg-white hover:text-slate-700 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
        >
          <FileText size={14} /> Lesson Plan
        </button>
      </div>
    </div>
  );
};

export default TeacherSubjects;