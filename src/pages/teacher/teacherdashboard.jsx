import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Clock, AlertCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getActiveSchoolYear } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner, StatCard, PageHeader, ClassDetailsModal, TaskDetailsModal } from '../../components/shared/TeacherComponents';
import { SHARED_STYLES, STAT_CARD_COLORS } from '../../utils/teacherConstants';

const MOCK_TASKS = [
  { id: 1, title: 'Prepare Syllabus', due: 'Today', status: 'Pending' },
  { id: 2, title: 'Submit Midterm Grades', due: 'Tomorrow', status: 'Urgent' },
  { id: 3, title: 'Faculty Meeting', due: 'Friday', status: 'Scheduled' },
  { id: 4, title: 'Upload Lecture Notes', due: 'Today', status: 'Urgent' },
  { id: 5, title: 'Review Lab Reports', due: 'Monday', status: 'Pending' },
  { id: 6, title: 'Finalize Quiz Questions', due: 'Today', status: 'Urgent' },
  { id: 7, title: 'Input Attendance Records', due: 'Daily', status: 'Scheduled' },
];

const TeacherDashboard = () => {
  const { syStart, syEnd, semester } = getActiveSchoolYear();
  // INI-EXTRACT ANG BRANDING
  const { user, API_BASE_URL, branding } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ classes: 0, students: 0, nextSchedule: '--', pendingGrading: 0 });
  const [schedules, setSchedules] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // KUNIN ANG THEME COLOR
  const themeColor = branding?.theme_color || '#2563eb';

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        const token = localStorage.getItem('sms_token');
        const response = await axios.get(`${API_BASE_URL}/teacher/get_sections.php?teacher_id=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.status === 'success') {
          const data = response.data.data || [];
          setSchedules(data);
          setStats({
            classes: data.length,
            students: response.data.total_overall_students || 0,
            nextSchedule: data[0]?.schedule || '--',
            pendingGrading: 0,
          });
        }
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };
    fetchData();
  }, [user?.id, API_BASE_URL]);

  if (isLoading) return <LoadingSpinner />;

  return (
    // HYBRID WRAPPER: Walang h-full sa mobile para hindi mapisa, at lg:overflow-hidden sa desktop
    <div className="flex flex-col lg:h-full lg:overflow-hidden pb-8 lg:pb-0">

      {selectedClass && <ClassDetailsModal class={selectedClass} onClose={() => setSelectedClass(null)} navigate={navigate} />}
      {selectedTask && <TaskDetailsModal task={selectedTask} onClose={() => setSelectedTask(null)} />}

      {/* HEADER & STATS */}
      <div className="shrink-0 space-y-6 mb-6">
        <PageHeader title="Overview" subtitle={`Magandang araw! ${user?.full_name?.split(' ')[0]}.`} badge={`SY ${syStart}-${syEnd} | ${semester}`} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard icon={<BookOpen size={20} />} label="My Classes" value={stats.classes} color={STAT_CARD_COLORS.classes.color} bg={STAT_CARD_COLORS.classes.bg} />
          <StatCard icon={<Users size={20} />} label="Total Students" value={stats.students} color={STAT_CARD_COLORS.students.color} bg={STAT_CARD_COLORS.students.bg} />
          <StatCard icon={<Clock size={20} />} label="Next Class" value={stats.nextSchedule} color={STAT_CARD_COLORS.schedule.color} bg={STAT_CARD_COLORS.schedule.bg} />
          <StatCard icon={<AlertCircle size={20} />} label="Pending Grades" value={stats.pendingGrading} color={STAT_CARD_COLORS.grading.color} bg={STAT_CARD_COLORS.grading.bg} isHighlight />
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:min-h-0">
        
        {/* CLASSES SECTION (min-h-[400px] on mobile allows proper internal scrolling) */}
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white flex flex-col overflow-hidden shadow-sm min-h-[400px] lg:min-h-0 lg:h-full">
          <div className="px-6 py-5 border-b border-white/50 bg-white/30 shrink-0 flex justify-between items-center">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
               <Clock className="w-4 h-4 text-indigo-500" /> Assigned Classes
            </h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">{schedules.length} Active</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scroll p-4 lg:p-6 space-y-3">
             {schedules.map(sched => (
               <div key={sched.id} className="flex items-center justify-between p-4 bg-white/70 rounded-2xl border border-white hover:bg-white hover:shadow-md transition-all group cursor-pointer" onClick={() => setSelectedClass(sched)}>
                 <div className="truncate pr-4 flex-1">
                   <h4 className="font-black text-slate-800 text-sm truncate">{sched.subject}</h4>
                   <p className="text-xs font-bold text-slate-500 uppercase mt-0.5">{sched.level} • {sched.section_name}</p>
                 </div>
                 <div className="flex items-center gap-4 shrink-0">
                   <span className="hidden md:block text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">{sched.schedule}</span>
                 </div>
               </div>
             ))}
             {schedules.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center opacity-50">
                 <BookOpen size={48} className="mb-3 text-slate-400" />
                 <p className="font-bold text-slate-500">No assigned classes yet.</p>
               </div>
             )}
          </div>
        </div>

        {/* TASKS SECTION */}
        <div className="lg:col-span-1 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white flex flex-col overflow-hidden shadow-sm min-h-[400px] lg:min-h-0 lg:h-full">
          <div className="px-6 py-5 border-b border-white/50 bg-white/30 shrink-0 flex items-center gap-2">
             <AlertCircle className="w-4 h-4 text-orange-500" />
             <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Tasks & Reminders</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scroll p-4 lg:p-6 space-y-3">
            {MOCK_TASKS.map(task => (
              <div key={task.id} onClick={() => setSelectedTask(task)} className="p-4 bg-white/70 rounded-2xl border border-white hover:bg-white hover:shadow-md transition-all cursor-pointer group flex items-start gap-3">
                <div className={`p-2 rounded-xl mt-0.5 ${task.status === 'Urgent' ? 'bg-red-100 text-red-500' : 'bg-orange-100 text-orange-500'}`}>
                  <Zap size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{task.title}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Due {task.due}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;