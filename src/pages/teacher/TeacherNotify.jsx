import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, AlertCircle, Info, FileText, DollarSign, ShieldAlert, WifiOff } from 'lucide-react';

const TeacherNotify = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerOffline, setIsServerOffline] = useState(false);

  useEffect(() => {
    // STEP 1: KUNIN ANG CACHED DATA SA LOCAL STORAGE (Kung meron man)
    const cachedAnnouncements = localStorage.getItem('sms_teacher_announcements');
    
    if (cachedAnnouncements) {
      // Kung may naka-save na, ipakita agad para walang waiting time ang user
      setAnnouncements(JSON.parse(cachedAnnouncements));
      setIsLoading(false); 
    }

    // STEP 2: KUMUHA NG LATEST DATA SA PHP BACKEND
    // Pinalitan na natin ang setTimeout ng totoong fetch request
    fetch('http://localhost/sms_backend/api/get_announcements.php')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Server error');
        }
        return response.json();
      })
      .then((data) => {
        // STEP 3A: SUCCESS! Nakuha ang bagong data
        setAnnouncements(data);
        
        // I-save ang bagong data sa Local Storage para sa susunod na offline
        localStorage.setItem('sms_teacher_announcements', JSON.stringify(data));
        
        setIsServerOffline(false); // Siguraduhing nakatago ang offline banner
      })
      .catch((error) => {
        // STEP 3B: ERROR! (Patay ang XAMPP, Walang Internet, o Mali ang URL)
        console.error("Connection failed:", error);
        setIsServerOffline(true); // Ipalabas ang yellow warning banner

        // FALLBACK: Kung walang nakuha sa server AT walang laman ang cache, 
        // maglalagay tayo ng default dummy data para hindi blangko ang screen.
        if (!cachedAnnouncements) {
          setAnnouncements([
            {
              id: 1, department: 'Registrar', author: 'Maria Santos (Head Registrar)', date: 'March 16, 2026',
              title: 'Deadline for Encoding of Final Grades', 
              content: 'Please be reminded that the deadline for the encoding of Final Grades for the 2nd Semester is on Friday, March 20. The system will automatically lock the grading modules at exactly 11:59 PM.', type: 'urgent' 
            },
            {
              id: 2, department: 'Cashier', author: 'Accounting Office', date: 'March 14, 2026',
              title: 'Exam Clearances & Promissory Notes', 
              content: 'For the upcoming final examinations, please check the "Payment Status" of your students in the Class Management tab.', type: 'warning'
            },
            {
              id: 3, department: 'Admin', author: 'System Administrator', date: 'March 10, 2026',
              title: 'Scheduled System Maintenance', 
              content: 'The School Management System (SMS) will undergo routine maintenance this Saturday from 1:00 AM to 4:00 AM.', type: 'info'
            }
          ]);
        }
      })
      .finally(() => {
        setIsLoading(false); // Patigilin ang loading spinner
      });
  }, []);

  const getDepartmentStyle = (department) => {
    switch (department) {
      case 'Registrar':
        return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <FileText size={20} /> };
      case 'Cashier':
        return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: <DollarSign size={20} /> };
      case 'Admin':
        return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: <ShieldAlert size={20} /> };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', icon: <Megaphone size={20} /> };
    }
  };

  const getPriorityBadge = (type) => {
    if (type === 'urgent') return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase flex items-center gap-1"><AlertCircle size={12}/> Urgent</span>;
    if (type === 'warning') return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold uppercase">Notice</span>;
    return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">Info</span>;
  };

  return (
    <div className="w-full min-h-full p-4 md:p-8 animate-fade-in bg-gray-50/50">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-8 border-b border-gray-200 pb-6">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md w-fit">
            <Megaphone size={24} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Official Announcements</h2>
            <p className="text-gray-500 font-medium">Updates and memos from school administration.</p>
          </div>
        </div>

        {/* OFFLINE WARNING BANNER */}
        {isServerOffline && !isLoading && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
            <div className="bg-amber-100 p-2 rounded-lg text-amber-600 shrink-0">
              <WifiOff size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-800 tracking-tight">Viewing Cached Announcements</h4>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                The server is currently unreachable. You are viewing the offline data. New announcements might not be visible.
              </p>
            </div>
          </div>
        )}

        {/* Content Area */}
        {isLoading && !announcements.length ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {announcements.map((news) => {
              const deptStyle = getDepartmentStyle(news.department);
              
              return (
                <div key={news.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                  {/* Card Header */}
                  <div className={`px-6 py-3 flex flex-wrap justify-between items-center gap-2 border-b ${deptStyle.bg} ${deptStyle.border}`}>
                    <div className="flex items-center space-x-2">
                      <span className={`${deptStyle.color}`}>{deptStyle.icon}</span>
                      <span className={`font-bold uppercase tracking-widest text-xs ${deptStyle.color}`}>
                        {news.department} Dept
                      </span>
                    </div>
                    {getPriorityBadge(news.type)}
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight">{news.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-6 break-words">
                      {news.content}
                    </p>
                    
                    {/* Card Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-gray-400 font-semibold border-t pt-4">
                      <div className="flex items-center">
                        <Info size={14} className="mr-1.5 text-indigo-400" />
                        Posted by: <span className="ml-1 text-gray-600">{news.author}</span>
                      </div>
                      <div className="hidden sm:block text-gray-300">•</div>
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1.5 text-indigo-400" />
                        {news.date}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherNotify;