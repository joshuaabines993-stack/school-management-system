import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Megaphone, Calendar, Info, FileText,
  DollarSign, ShieldAlert, User, Bell, ArrowRight
} from 'lucide-react';
import OfflineBanner from '../../utils/offlinebanner';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, EmptyState } from '../../components/shared/TeacherComponents';
import { DEPARTMENT_STYLES, PRIORITY_TYPES, ANIMATION_DELAYS, SHARED_STYLES } from '../../components/shared/teacherConstants';
import ReadNotificationModal from '../../components/shared/ReadNotificationModal';

// 🟢 MODERNIZED SKELETON LOADER
const AnnouncementSkeleton = ({ themeColor }) => (
  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-7 mb-5">
    <style>{`@keyframes notifSkPulse { 0% { background-color: ${themeColor}15; } 50% { background-color: ${themeColor}25; } 100% { background-color: ${themeColor}15; } } .notif-sk { animation: notifSkPulse 1.6s ease-in-out infinite; border-radius: 6px; }`}</style>
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3"><div className="notif-sk" style={{ width: '40px', height: '40px', borderRadius: '1rem' }} /><div className="notif-sk" style={{ width: '120px', height: '14px' }} /></div>
      <div className="notif-sk" style={{ width: '80px', height: '30px', borderRadius: '1rem' }} />
    </div>
    <div className="notif-sk" style={{ width: '70%', height: '24px', marginBottom: '1rem' }} />
    <div className="space-y-2 mb-6"><div className="notif-sk" style={{ width: '100%', height: '14px' }} /><div className="notif-sk" style={{ width: '90%', height: '14px' }} /><div className="notif-sk" style={{ width: '80%', height: '14px' }} /></div>
    <div className="flex gap-3 pt-4 border-t border-slate-50"><div className="notif-sk" style={{ width: '140px', height: '30px', borderRadius: '0.75rem' }} /><div className="notif-sk" style={{ width: '120px', height: '30px', borderRadius: '0.75rem' }} /></div>
  </div>
);

const TeacherNotify = () => {
  const { user, API_BASE_URL, branding } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const [selectedNotif, setSelectedNotif] = useState(null);

  // 🟢 DYNAMIC BRANDING COLOR
  const themeColor = branding?.theme_color || '#2563eb';

  const fetchAnnouncements = useCallback(async (showLoading = true) => {
    if (!user?.id) return;
    if (showLoading) setIsLoading(true);
    setIsRetrying(true);

    try {
      const token = localStorage.getItem('sms_token') || '';
      const response = await axios.get(`${API_BASE_URL}/teacher/get_announcements.php`, {
        params: { user_id: user.id, role: user.role || 'teacher', fetch_type: 'general' },
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      
      if (response.data.status === 'success') {
        // 🟢 FILTER: TANGGALIN ANG TASK REMINDERS
        const rawNotifs = response.data.data || [];
        const filteredNotifs = rawNotifs.filter(notif => notif.type !== 'Task Reminder');
        
        setAnnouncements(filteredNotifs);
        setIsServerOffline(false);
      } else {
        throw new Error(response.data.message || 'Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      setIsServerOffline(true);
    } finally {
      if (showLoading) setIsLoading(false);
      setTimeout(() => setIsRetrying(false), 800);
    }
  }, [user?.id, user?.role, API_BASE_URL]);

  useEffect(() => { fetchAnnouncements(true); }, [fetchAnnouncements]);

  const iconMap = { FileText, DollarSign, ShieldAlert, Megaphone };

  const handleOpenModal = (announcement) => {
    setSelectedNotif({
      id: announcement.id,
      type: announcement.type || 'Announcement',
      title: announcement.title || 'Untitled Announcement',
      message: announcement.message || 'No description provided.',
      sender: announcement.sender_name || announcement.sender_role || 'Admin',
      sender_role: announcement.sender_role ? announcement.sender_role.toLowerCase() : '',
      time: announcement.created_at ? new Date(announcement.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently',
      attachment: announcement.attachment,
      reaction: announcement.reaction
    });
  };

  // Callback para ma-update ang list kung sakaling nag-react sila sa Modal
  const handleUpdateReaction = (notifId, newReaction) => {
    setAnnouncements(prev => prev.map(n => n.id === notifId ? { ...n, reaction: newReaction } : n));
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scroll pr-2 pb-10 relative">
      <style>{`${SHARED_STYLES} .custom-scroll::-webkit-scrollbar { width: 8px; } .custom-scroll::-webkit-scrollbar-track { background: transparent; } .custom-scroll::-webkit-scrollbar-thumb { background-color: ${themeColor}; border-radius: 20px; border: 2px solid transparent; background-clip: content-box; } .custom-scroll::-webkit-scrollbar-thumb:hover { background-color: ${themeColor}; opacity: 0.8; }`}</style>
      
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <PageHeader icon={<Bell size={24} />} title="Announcements" subtitle="Stay updated with the latest memos and notices from the school administration." badge={`${announcements.length} Recent Updates`} themeColor={themeColor} />
        
        <div className="animate-stagger" style={{ animationDelay: ANIMATION_DELAYS.banner }}>
          <OfflineBanner isServerOffline={isServerOffline} isRetrying={isRetrying} onRetry={() => fetchAnnouncements(false)} />
        </div>
        
        <div className="space-y-5">
          {isLoading ? ([1, 2, 3].map(n => <AnnouncementSkeleton key={n} themeColor={themeColor} />)) : announcements.length > 0 ? (
            announcements.map((announcement, index) => (
              <AnnouncementCard 
                key={announcement.id || index} 
                announcement={announcement} 
                index={index} 
                iconMap={iconMap} 
                themeColor={themeColor} 
                onClick={() => handleOpenModal(announcement)} 
              />
            ))
          ) : !isServerOffline ? (
            <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm"><EmptyState icon={Megaphone} title="All caught up!" message="No new general announcements at this time." /></div>
          ) : null}
        </div>
      </div>

      {/* 🟢 IDINAGDAG ANG MODAL DITO PARA GUMANA ANG ONCLICK */}
      <ReadNotificationModal 
        isOpen={!!selectedNotif} 
        onClose={() => setSelectedNotif(null)} 
        notification={selectedNotif} 
        onReactionUpdate={handleUpdateReaction}
      />
    </div>
  );
};

// 🟢 REVAMPED UI/UX ANNOUNCEMENT CARD
const AnnouncementCard = ({ announcement, index, iconMap, themeColor, onClick }) => {
  const roleStr = (announcement.sender_role || 'general').toLowerCase();
  const deptStyle = DEPARTMENT_STYLES[roleStr] || DEPARTMENT_STYLES.default;
  const DepartmentIcon = iconMap[deptStyle.icon] || Megaphone;
  const isUrgent = announcement.type === 'Urgent Alert';
  const priorityStyle = isUrgent ? PRIORITY_TYPES.urgent : PRIORITY_TYPES.general;
  const formattedDate = announcement.created_at ? new Date(announcement.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently';

  return (
    <div 
      onClick={onClick}
      className={`group relative bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl cursor-pointer overflow-hidden transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in-up ${index % 2 === 0 ? 'animation-delay-200' : 'animation-delay-300'}`}
      style={{ '--hover-color': themeColor }}
    >
      {/* 🟢 DYNAMIC BRAND COLOR ACCENT ON HOVER */}
      <div className="absolute top-0 left-0 w-full h-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, ${themeColor}, transparent)` }} />
      
      {isUrgent && <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-bl-full blur-2xl pointer-events-none" />}

      <div className="p-6 sm:p-8">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3.5">
            <div className={`p-2.5 rounded-2xl shadow-sm ${deptStyle.bg} ${deptStyle.border}`}>
              <DepartmentIcon size={20} className={deptStyle.color} />
            </div>
            <div>
              <p className={`font-black uppercase tracking-widest text-[10px] ${deptStyle.color} mb-0.5`}>
                {announcement.sender_role ? `${announcement.sender_role} Office` : 'General Notice'}
              </p>
              <p className="text-xs font-bold text-slate-500">
                From: <span className="text-slate-800">{announcement.sender_name || announcement.sender_role || 'Admin'}</span>
              </p>
            </div>
          </div>
          <PriorityBadge label={announcement.type || 'Announcement'} isUrgent={isUrgent} style={priorityStyle} />
        </div>

        {/* CONTENT */}
        <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight tracking-tight mb-3 group-hover:text-[var(--hover-color)] transition-colors line-clamp-2">
          {announcement.title || 'Untitled Announcement'}
        </h3>
        <p className="text-sm leading-relaxed text-slate-600 mb-6 font-medium whitespace-pre-wrap line-clamp-3">
          {announcement.message || 'No description provided.'}
        </p>

        {/* FOOTER */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
            <Calendar size={14} style={{ color: themeColor }} />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-[var(--hover-color)] transition-colors">
            Read Memo <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

const PriorityBadge = ({ label, isUrgent, style }) => (
  <span className={`${style.style} border border-white px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5 ${isUrgent ? 'animate-pulse' : ''}`}>
    {isUrgent && <ShieldAlert size={14} className="text-red-600" />}
    {!isUrgent && <Info size={14} className="text-indigo-600" />}
    {label}
  </span>
);

export default TeacherNotify;