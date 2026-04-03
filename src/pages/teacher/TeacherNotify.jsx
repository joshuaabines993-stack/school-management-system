import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Megaphone, Calendar, AlertCircle, Info, FileText, 
  DollarSign, ShieldAlert, User, Bell 
} from 'lucide-react';
import OfflineBanner from '../../utils/offlinebanner';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner, PageHeader, EmptyState } from '../../components/shared/TeacherComponents';
import { DEPARTMENT_STYLES, PRIORITY_TYPES, ANIMATION_DELAYS, SHARED_STYLES } from '../../utils/teacherConstants';

const TeacherNotify = () => {
  const { API_BASE_URL, branding } = useAuth(); // Kinuha ang branding para sa theme color
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const themeColor = branding?.theme_color || '#6366f1';

  const fetchAnnouncements = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setIsRetrying(true);

    const cachedAnnouncements = localStorage.getItem('sms_teacher_announcements');
    if (cachedAnnouncements) {
      try {
        setAnnouncements(JSON.parse(cachedAnnouncements));
        if (showLoading) setIsLoading(false);
      } catch (err) {
        console.warn('Cache parse error:', err);
      }
    }

    try {
      const token = localStorage.getItem('sms_token') || '';
      const response = await axios.get(`${API_BASE_URL}/teacher/get_announcements.php`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });

      if (response.data.status === 'success') {
        const data = response.data.data || [];
        setAnnouncements(data);
        localStorage.setItem('sms_teacher_announcements', JSON.stringify(data));
        setIsServerOffline(false);
      } else {
        throw new Error(response.data.message || 'Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      setIsServerOffline(true);
      if (!cachedAnnouncements) setAnnouncements([]);
    } finally {
      if (showLoading) setIsLoading(false);
      setTimeout(() => setIsRetrying(false), 800);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchAnnouncements(true);
  }, [fetchAnnouncements]);

  if (isLoading) return <LoadingSpinner message="Fetching announcements..." />;

  const iconMap = { FileText, DollarSign, ShieldAlert, Megaphone };

  return (
    /* SCROLLABLE CONTAINER WITH BRANDED SCROLLBAR */
    <div className="w-full h-full overflow-y-auto custom-scroll pr-2 pb-10">
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
        .custom-scroll::-webkit-scrollbar-thumb:hover { background-color: ${themeColor}; opacity: 0.8; }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* HEADER */}
        <PageHeader
          icon={<Bell size={24} />}
          title="Announcements"
          subtitle="Stay updated with the latest memos and notices from the school administration."
          badge={`${announcements.length} Recent Updates`}
        />

        {/* OFFLINE BANNER */}
        <div className="animate-stagger" style={{ animationDelay: ANIMATION_DELAYS.banner }}>
          <OfflineBanner
            isServerOffline={isServerOffline}
            isRetrying={isRetrying}
            onRetry={() => fetchAnnouncements(false)}
          />
        </div>

        {/* ANNOUNCEMENTS LIST */}
        <div className="space-y-5">
          {announcements.length > 0 ? (
            announcements.map((announcement, index) => (
              <AnnouncementCard
                key={announcement.id || index}
                announcement={announcement}
                index={index}
                iconMap={iconMap}
                themeColor={themeColor}
              />
            ))
          ) : !isServerOffline ? (
            <div className="py-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white shadow-sm">
              <EmptyState
                icon={Megaphone}
                title="All caught up!"
                message="No new announcements at this time. Check back later for updates."
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

/**
 * Enhanced Announcement Card
 */
const AnnouncementCard = ({ announcement, index, iconMap, themeColor }) => {
  const deptStyle = DEPARTMENT_STYLES[announcement.department] || DEPARTMENT_STYLES.default;
  const DepartmentIcon = iconMap[deptStyle.icon] || Megaphone;
  const priorityStyle = PRIORITY_TYPES[announcement.type] || PRIORITY_TYPES.general;

  return (
    <div
      className="animate-stagger group relative flex flex-col bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-white"
      style={{ animationDelay: `${ANIMATION_DELAYS.firstCard + index * ANIMATION_DELAYS.increment}ms` }}
    >
      {/* SIDE ACCENT LINE */}
      <div 
        className="absolute left-0 top-10 bottom-10 w-1.5 rounded-r-full transition-all duration-300"
        style={{ 
          backgroundColor: announcement.type === 'urgent' ? '#ef4444' : themeColor,
          opacity: 0.6
        }}
      />

      {/* CARD HEADER: Department & Priority */}
      <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100/50">
        <div className="flex items-center gap-3">
          <div 
            className={`p-2 rounded-xl border shadow-sm ${deptStyle.bg} ${deptStyle.border}`}
          >
            <DepartmentIcon size={16} className={deptStyle.color} />
          </div>
          <span className={`font-black uppercase tracking-widest text-[10px] ${deptStyle.color}`}>
            {announcement.department ? `${announcement.department} Department` : 'General Notice'}
          </span>
        </div>

        <PriorityBadge type={announcement.type} style={priorityStyle} />
      </div>

      {/* CONTENT AREA */}
      <div className="p-7">
        <h3 className="text-xl font-black text-slate-800 leading-tight tracking-tight mb-3 group-hover:text-slate-900 transition-colors">
          {announcement.title || 'Untitled Announcement'}
        </h3>
        <p className="text-[13px] leading-relaxed text-slate-600 mb-6 font-medium">
          {announcement.content || 'No description provided.'}
        </p>

        {/* METADATA FOOTER */}
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest pt-5 border-t border-slate-50">
          <div className="flex items-center gap-2 bg-slate-100/50 px-3 py-1.5 rounded-lg text-slate-500">
            <User size={12} style={{ color: themeColor }} />
            <span>Posted by: <span className="text-slate-800">{announcement.author || 'Admin'}</span></span>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100/50 px-3 py-1.5 rounded-lg text-slate-500">
            <Calendar size={12} style={{ color: themeColor }} />
            <span className="text-slate-800">{announcement.date || 'Today'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Branded Priority Badge
 */
const PriorityBadge = ({ type, style }) => {
  const isUrgent = type === 'urgent';
  
  return (
    <span
      className={`${style.style} border border-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5 ${
        isUrgent ? 'animate-pulse' : ''
      }`}
    >
      {isUrgent && <ShieldAlert size={12} className="text-red-600" />}
      {!isUrgent && <Info size={12} className="text-indigo-600" />}
      {style.label}
    </span>
  );
};

export default TeacherNotify;