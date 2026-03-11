import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // MOCK DATA: Sa Phase 2, ito ay manggagaling sa `api/student_info.php`
  const [studentData, setStudentData] = useState({
    classification: "Transferee", // Values: "New Student", "Transferee", "Continuing"
    yearLevel: "2nd Year",
    paymentStatus: "Unpaid", // Kapag "Unpaid", naka-lock ang LMS
    balance: "12,450.00",
    course: "BS Information Technology"
  });

  const schoolName = "Colegio de San Pascual Baylon";
  const schoolAcronym = "CSPB";

  const handleLogout = () => {
    if (window.confirm("Sigurado ka bang nais mong mag-logout sa CSPB Portal?")) {
      logout();
      navigate('/');
    }
  };

  // LMS Access Logic (Gatekeeper)
  const handleLMSAccess = () => {
    if (studentData.paymentStatus !== "Paid") {
      alert("🛑 ACCESS DENIED: Naka-lock ang iyong LMS Classroom. Mangyaring magbayad sa Cashier upang ma-activate ang iyong account.");
    } else {
      navigate('/lms');
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: '🏠', path: '/dashboard', locked: false },
    { name: 'LMS Classroom', icon: '📚', action: handleLMSAccess, locked: studentData.paymentStatus !== "Paid" },
    { name: 'Accounting', icon: '💳', path: '/accounting', locked: false },
    { name: 'Enrollment', icon: '📝', path: '/enrollment', locked: false },
    { name: 'Academic Grades', icon: '📊', path: '/grades', locked: false },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#001f3f] text-white transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-8 flex flex-col items-center border-b border-white/10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#001f3f] font-black text-xl border-4 border-yellow-500 mb-4 shadow-xl">
              {schoolAcronym}
            </div>
            <h2 className="text-center font-black text-[10px] uppercase tracking-widest leading-tight">{schoolName}</h2>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={item.action ? item.action : () => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-sm transition-all group
                  ${item.locked ? 'opacity-40 cursor-not-allowed grayscale' : 'hover:bg-yellow-500 hover:text-[#001f3f] text-slate-300'}
                `}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl">{item.icon}</span>
                  {item.name}
                </div>
                {item.locked && <span>🔒</span>}
              </button>
            ))}
          </nav>

          <div className="p-6 bg-black/20 border-t border-white/5">
            <button onClick={handleLogout} className="w-full py-3 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-red-600/30">
              Logout System
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 h-screen overflow-y-auto p-6 md:p-10 pb-32">
        <div className="max-w-6xl mx-auto">
          
          {/* Header & Classification Badge */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-yellow-500 text-[#001f3f] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  {studentData.classification}
                </span>
                <span className="bg-slate-200 text-slate-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  {studentData.yearLevel}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                Mabuhay, <span className="text-[#003366]">{user?.full_name?.split(' ')[0] || 'Student'}</span>!
              </h1>
              <p className="text-slate-500 font-bold mt-1 uppercase tracking-tighter">{studentData.course}</p>
            </div>

            {/* Payment Warning Indicator */}
            {studentData.paymentStatus !== "Paid" && (
              <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl flex items-center gap-4 animate-pulse">
                <div className="text-2xl">⚠️</div>
                <div>
                  <p className="text-[10px] font-black text-red-600 uppercase">System Status</p>
                  <p className="text-sm font-bold text-red-800 tracking-tight text-nowrap">LMS Access is Restricted</p>
                </div>
              </div>
            )}
          </div>

          {/* Stat Cards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
             <StatCard title="Account Type" value={studentData.classification} icon="🆔" color="border-l-yellow-500" />
             <StatCard title="Payment" value={studentData.paymentStatus} icon="💳" color={studentData.paymentStatus === "Paid" ? "border-l-green-500" : "border-l-red-500"} />
             <StatCard title="Current GWA" value="1.75" icon="📈" color="border-l-blue-500" />
             <StatCard title="Year Level" value={studentData.yearLevel} icon="🏫" color="border-l-slate-400" />
          </div>

          {/* LMS Lock Alert Box */}
          {studentData.paymentStatus !== "Paid" ? (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-[2.5rem] p-10 text-center shadow-inner mb-10">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-black text-slate-800 uppercase italic">LMS is Currently Locked</h2>
              <p className="text-slate-500 max-w-md mx-auto mt-2 font-medium">
                Hindi mo pa maaaring makita ang iyong mga subjects at lessons. Mangyaring bayaran ang balanse na 
                <span className="text-red-600 font-bold"> ₱{studentData.balance} </span> 
                upang ma-unlock ang iyong E-Learning account.
              </p>
              <button 
                onClick={() => navigate('/accounting')}
                className="mt-6 bg-[#003366] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase hover:bg-yellow-500 hover:text-[#003366] transition-all shadow-lg"
              >
                Pumunta sa Accounting
              </button>
            </div>
          ) : (
            /* Dashboard Content when Paid */
            <div className="bg-green-50 border-2 border-green-200 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-8 mb-10">
              <div className="text-6xl">🔓</div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-black text-green-900 uppercase">E-Learning Active</h2>
                <p className="text-green-700 font-medium">Lahat ng iyong subjects ay handa na para sa kasalukuyang semester.</p>
                <button onClick={() => navigate('/lms')} className="mt-4 bg-green-600 text-white px-8 py-3 rounded-xl font-bold">Open Classroom</button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* --- MOBILE BOTTOM NAV --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-around items-center z-50">
        {menuItems.slice(0, 4).map(item => (
          <button key={item.name} onClick={item.action ? item.action : () => navigate(item.path)} className="flex flex-col items-center">
            <span className="text-xl">{item.icon}</span>
            <span className="text-[8px] font-black uppercase text-slate-400">{item.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white p-5 rounded-2xl border-l-4 ${color} shadow-sm`}>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <div className="flex items-center justify-between">
      <span className="text-sm font-black text-slate-800">{value}</span>
      <span className="text-lg opacity-30">{icon}</span>
    </div>
  </div>
);

export default StudentDashboard;