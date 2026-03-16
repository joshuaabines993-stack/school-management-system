import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Briefcase, 
  BookOpen, Clock, Award, WifiOff, ArrowLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Para sa back button

const TeacherProfile = () => {
  const [teacher, setTeacher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulated API Fetch: fetch(`/api/teachers/profile?id=${teacherId}`)
    setTimeout(() => {
      // Simulating a server offline scenario but loading cached data
      setIsServerOffline(true);
      
      // Default/Mock Data
      setTeacher({
        id: 'TCH-2024-089',
        firstName: 'Ricardo',
        lastName: 'Dalisay',
        role: 'Senior High School Teacher',
        department: 'Mathematics Department',
        email: 'r.dalisay@school.edu.ph',
        phone: '+63 917 123 4567',
        address: '123 Rizal St., Obando, Bulacan',
        status: 'Active',
        dateHired: 'June 2018',
        subjects: [
          { id: 1, code: 'MATH101', name: 'General Mathematics', section: 'Grade 11 - STEM A', schedule: 'MWF 8:00 AM - 9:30 AM' },
          { id: 2, code: 'MATH102', name: 'Pre-Calculus', section: 'Grade 11 - STEM B', schedule: 'TTH 10:00 AM - 11:30 AM' },
          { id: 3, code: 'STAT201', name: 'Statistics & Probability', section: 'Grade 12 - ABM A', schedule: 'MWF 1:00 PM - 2:30 PM' }
        ]
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in bg-transparent">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center space-x-4 mb-6">
        
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Teacher Profile</h2>
            <p className="text-sm text-slate-500">View and manage faculty information.</p>
          </div>
        </div>

        {/* Offline Warning Banner */}
        {isServerOffline && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
            <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
              <WifiOff size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-800 tracking-tight">Viewing Cached Profile</h4>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                The server is currently unreachable. You are viewing the default data.
              </p>
            </div>
          </div>
        )}

       {/* TOP SECTION: Basic Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Subtle Banner Background */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
          
          <div className="px-6 sm:px-10 pb-8">
            {/* Flex Container na may Negative Top Margin para humila pataas */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12 mb-2">
              
              {/* Avatar Box - Gumamit ng shrink-0 para hindi mapisat */}
              <div className="relative border-4 border-white rounded-2xl bg-white shadow-sm shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 text-3xl sm:text-4xl font-extrabold">
                  {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
                </div>
              </div>

              {/* Name, Role & Status Container */}
              <div className="flex-1 pb-1 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mt-2 sm:mt-0">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                    {teacher.firstName} {teacher.lastName}
                  </h1>
                  <p className="text-slate-500 font-medium mt-1.5 flex items-center gap-2 text-sm sm:text-base">
                    <Briefcase size={16} /> {teacher.role} • {teacher.department}
                  </p>
                </div>
                
                <div className="flex flex-col items-start sm:items-end gap-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wide">
                    {teacher.status}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Emp ID: {teacher.id}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Personal Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                Contact Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Email Address</p>
                    <p className="text-sm font-medium text-slate-800">{teacher.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Phone Number</p>
                    <p className="text-sm font-medium text-slate-800">{teacher.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Home Address</p>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">{teacher.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-4 border-t border-slate-100">
                  <Award size={18} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Date Hired</p>
                    <p className="text-sm font-medium text-slate-800">{teacher.dateHired}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Academic Load / LMS Integration */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-600" />
                  Current Teaching Load
                </h3>
                <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                  {teacher.subjects.length} Subjects
                </span>
              </div>

              <div className="space-y-3">
                {teacher.subjects.map((subject) => (
                  <div key={subject.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-colors group">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                            {subject.code}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">
                          {subject.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                          <User size={14} /> {subject.section}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-500 flex items-center justify-end gap-1.5 mt-1">
                          <Clock size={14} className="text-slate-400" />
                          {subject.schedule}
                        </p>
                      </div>
                    </div>
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

export default TeacherProfile;