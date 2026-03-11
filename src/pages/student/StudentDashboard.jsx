import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, logout, branding } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg w-full">
        <h1 className="text-3xl font-black text-slate-800 mb-4">
          Welcome to Student Portal!
        </h1>
        <p className="text-slate-500 mb-8">
          Mabuhay, <span className="font-bold text-blue-600">{user?.full_name || 'Student'}</span>! 
          Nandito ka na sa dashboard.
        </p>
        
        <button 
          onClick={handleLogout}
          className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default StudentDashboard;