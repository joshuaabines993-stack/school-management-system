import React, { useState, useEffect } from 'react';
import { BookOpen, Users, AlertCircle, Clock, WifiOff } from 'lucide-react';
import { getActiveSchoolYear } from '../../utils/dateUtils'; // Panatilihin natin ito base sa structure mo

const TeacherDashboard = () => {
  const { syStart, syEnd, semester } = getActiveSchoolYear();
  const [stats, setStats] = useState({ classes: 0, students: 0, pendingGrading: 0 });
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pinalitan natin ang "error" ng standardized server offline state
  const [isServerOffline, setIsServerOffline] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // STEP 1: KUNIN ANG CACHED DATA SA LOCAL STORAGE
      const cachedStats = localStorage.getItem('sms_teacher_stats');
      const cachedSchedules = localStorage.getItem('sms_teacher_schedules');

      if (cachedStats && cachedSchedules) {
        setStats(JSON.parse(cachedStats));
        setSchedules(JSON.parse(cachedSchedules));
        setIsLoading(false); // Ipakita agad sa screen ang last saved data
      }

      // STEP 2: KUMUHA NG FRESH DATA SA PHP SERVER
      try {
        const response = await fetch('http://localhost/sms_backend/api/get_teacher_dashboard.php?teacher_id=1');
        
        if (!response.ok) {
          throw new Error('Server error');
        }
        
        const data = await response.json();
        
        // STEP 3A: UPDATE STATE AT CACHE KUNG SUCCESSFUL
        setStats(data.stats);
        setSchedules(data.schedules);
        
        localStorage.setItem('sms_teacher_stats', JSON.stringify(data.stats));
        localStorage.setItem('sms_teacher_schedules', JSON.stringify(data.schedules));
        
        setIsServerOffline(false); // Itago ang offline banner kung may connection na ulit
        
      } catch (error) {
        // STEP 3B: ERROR! OFFLINE ANG SERVER
        console.error("Connection failed:", error);
        setIsServerOffline(true);
        
        // FALLBACK: Kung walang nakasave sa cache, mag-load ng mock data
        if (!cachedStats || !cachedSchedules) {
          setStats({ classes: 4, students: 120, pendingGrading: 8 });
          setSchedules([
            { id: 1, subject: 'Math 101', time: '08:00 AM - 09:30 AM', room: 'Room A' },
            { id: 2, subject: 'Science 202', time: '10:00 AM - 11:30 AM', room: 'Lab 1' }
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading && !stats.classes) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-transparent">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-base md:text-lg font-semibold text-indigo-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 md:p-8 animate-fade-in bg-transparent">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6 md:mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Overview</h2>
          </div>
          
          {/* Dynamic School Year Badge */}
          <span className="text-xs md:text-sm font-bold text-black bg-gray-50 px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-sm border border-indigo-100 whitespace-nowrap">
            SY {syStart}-{syEnd} | {semester}
          </span>
        </div>

        {/* OFFLINE WARNING BANNER (Standardized) */}
        {isServerOffline && (
          <div className="mb-6 md:mb-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
            <div className="bg-amber-100 p-2 rounded-lg text-amber-600 shrink-0">
              <WifiOff size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-800 tracking-tight">Viewing Cached Dashboard</h4>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                The server is currently unreachable. You are viewing the offline data. Live student counts and schedules might be outdated.
              </p>
            </div>
          </div>
        )}
        
        {/* Analytics Cards with Icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 hover:shadow-md transition duration-200 flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Classes</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.classes}</p>
            </div>
            <div className="p-3 md:p-4 bg-blue-50 rounded-xl text-blue-500">
              <BookOpen className="w-6 h-6 md:w-7 md:h-7" />
            </div>
          </div>
          
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-emerald-500 hover:shadow-md transition duration-200 flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Total Students</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">{stats.students}</p>
            </div>
            <div className="p-3 md:p-4 bg-emerald-50 rounded-xl text-emerald-500">
              <Users className="w-6 h-6 md:w-7 md:h-7" />
            </div>
          </div>
          
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500 hover:shadow-md transition duration-200 flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Pending Grading</p>
              <p className="text-2xl md:text-3xl font-bold text-red-600">{stats.pendingGrading}</p>
            </div>
            <div className="p-3 md:p-4 bg-red-50 rounded-xl text-red-500">
              <AlertCircle className="w-6 h-6 md:w-7 md:h-7" />
            </div>
          </div>
        </div>

        {/* Class Schedule Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 md:p-6 border-b border-gray-100 bg-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="text-indigo-600 w-5 h-5" />
              <h3 className="text-base md:text-lg font-bold text-gray-800">Today's Schedule</h3>
            </div>
            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              {schedules.length} Classes
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 border-b border-gray-200">Subject</th>
                  <th className="p-4 border-b border-gray-200">Time</th>
                  <th className="p-4 border-b border-gray-200">Room/Link</th>
                  <th className="p-4 border-b border-gray-200 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 bg-white text-xs md:text-sm">
                {schedules.length > 0 ? (
                  schedules.map(sched => (
                    <tr key={sched.id} className="hover:bg-indigo-50/50 transition-colors duration-150 group">
                      <td className="p-4 border-b border-gray-50 font-semibold text-gray-900">
                        {sched.subject}
                      </td>
                      <td className="p-4 border-b border-gray-50 text-gray-600">
                        {sched.time}
                      </td>
                      <td className="p-4 border-b border-gray-50">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-[10px] md:text-sm font-medium border border-gray-200">
                          {sched.room}
                        </span>
                      </td>
                      <td className="p-4 border-b border-gray-50 text-right">
                        <button className="bg-white border border-indigo-200 text-indigo-600 px-4 py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                          Enter Class
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-10 text-center text-gray-500">
                      <div className="flex flex-col items-center space-y-2">
                        <BookOpen className="w-10 h-10 text-gray-300" />
                        <p className="italic text-sm">No schedule for today. Enjoy your free time!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;