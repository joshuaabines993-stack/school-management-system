import React, { useState, useCallback, useEffect } from 'react';
import { 
  Save, ArrowLeft, CheckCircle, Calculator, 
  GraduationCap, ClipboardCheck, Users 
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import OfflineBanner from '../../utils/offlinebanner';
import { LoadingSpinner, Card, Badge } from '../../components/shared/TeacherComponents';
import { SHARED_STYLES, ANIMATION_DELAYS } from '../../utils/teacherConstants';
import {
  getTeacherLevel,
  calculateFinalGrade,
  getGradeStatus,
  getGradingCategories,
  prepareGradesPayload,
  getDummyStudentData,
} from '../../utils/gradingUtils';

const GradeManagement = () => {
  const { classId } = useParams();
  const { user, API_BASE_URL, branding } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState(null); // Fix para sa Header Title
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const themeColor = branding?.theme_color || '#6366f1';
  const teacherLevel = getTeacherLevel(user?.role);
  const categories = getGradingCategories(teacherLevel);

  /**
   * Fetch Class Metadata and Student Grades
   * Aligned with get_class_grades.php and sms_db schema
   */
  const fetchData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setIsLoading(true);
    setIsRetrying(true);

    try {
      const token = localStorage.getItem('sms_token') || '';
      
      // Sabay na kukunin ang grades at metadata para sa subject title
      const [gradesRes, metaRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/teacher/get_class_grades.php`, {
          params: { class_id: classId },
          headers: { Authorization: `Bearer ${token}` },
        }),
        // Gagamitin natin ang endpoint na ito para makuha ang Subject at Section info
        axios.get(`${API_BASE_URL}/teacher/get_my_schedule.php?teacher_id=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      // Handle Student Grades
      if (gradesRes.data.status === 'success') {
        setStudents(gradesRes.data.data || []);
        setIsServerOffline(false);
      }

      // Handle Header Metadata (Subject Name and Section)
      if (metaRes.data.status === 'success') {
        const currentClass = metaRes.data.data.find(c => c.id == classId);
        if (currentClass) setClassInfo(currentClass);
      }

    } catch (error) {
      console.error('Fetch error:', error);
      setIsServerOffline(true);
      setStudents(getDummyStudentData(teacherLevel));
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsRetrying(false), 800);
    }
  }, [classId, teacherLevel, API_BASE_URL, user?.id]);

  useEffect(() => {
    if (user?.id) fetchData(true);
  }, [user?.id, fetchData]);

  const handleInputChange = (id, field, value) => {
    setStudents(prev =>
      prev.map(s => s.id === id ? { ...s, [field]: parseFloat(value) || 0 } : s)
    );
  };

  /**
   * Save Grades - Aligned with save_grades.php
   */
  const saveAllGrades = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('sms_token') || '';
      const payload = {
        class_id: parseInt(classId),
        students: students
      };

      const res = await axios.post(`${API_BASE_URL}/teacher/save_grades.php`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.data.status === 'success') {
        setStatusMsg({ type: 'success', text: 'Grades synced to database!' });
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Sync failed. Check connection.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  if (isLoading) return <LoadingSpinner message="Opening Gradebook..." />;

  return (
    /* PAGE SCROLLING ENABLED */
    <div className="w-full h-full overflow-y-auto custom-scroll pr-2 pb-10">
      <style>{`
        ${SHARED_STYLES}
        .header-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: ${themeColor}; border-radius: 10px; }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER SECTION - Aligned with Subject Info */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/70 backdrop-blur-xl px-6 py-5 rounded-[2rem] border border-white shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-white hover:bg-slate-50 rounded-2xl border border-slate-100 shadow-sm transition-all text-slate-600 active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="header-jakarta text-2xl font-black text-slate-800 tracking-tight">
                {classInfo?.subject_description || "Grade Management"}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-500 border border-white">
                   <GraduationCap size={12} style={{ color: themeColor }} /> {classInfo?.grade_level || 'Grade Level'}
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-500 border border-white">
                   <ClipboardCheck size={12} style={{ color: themeColor }} /> Section: {classInfo?.section || 'TBA'}
                </div>
                <Badge text={`${teacherLevel} System`} variant="info" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all shadow-sm">
              <Calculator size={16} /> Analysis
            </button>
            <button
              onClick={saveAllGrades}
              disabled={isSaving || isServerOffline}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 text-white rounded-2xl font-black text-xs shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: themeColor }}
            >
              {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </div>

        <OfflineBanner isServerOffline={isServerOffline} isRetrying={isRetrying} onRetry={() => fetchData(false)} />

        {statusMsg && (
          <div className={`p-4 rounded-2xl border flex items-center gap-3 shadow-sm backdrop-blur-md animate-stagger ${
            statusMsg.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700' : 'bg-red-50/90 border-red-200 text-red-700'
          }`}>
            <CheckCircle size={18} />
            <span className="text-xs font-black uppercase tracking-tight">{statusMsg.text}</span>
          </div>
        )}

        {/* GRADEBOOK TABLE CARD */}
        <Card className="overflow-hidden bg-white/70 backdrop-blur-xl border-white rounded-[2rem] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 sticky top-0 z-20">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    <div className="flex items-center gap-2">
                      <Users size={14} style={{ color: themeColor }} /> Student Name
                    </div>
                  </th>
                  {categories.map(cat => (
                    <th key={cat.key} className="px-4 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat.label}</span>
                        <span className="text-[9px] font-bold text-indigo-500 mt-0.5">{cat.percentage}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Grade</th>
                  <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((student) => {
                  const final = calculateFinalGrade(student, teacherLevel);
                  const status = getGradeStatus(final, teacherLevel);

                  return (
                    <tr key={student.id} className="hover:bg-white/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm" style={{ backgroundColor: themeColor }}>
                            {student.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm">{student.name}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{student.student_number}</span>
                          </div>
                        </div>
                      </td>

                      {categories.map(cat => (
                        <td key={cat.key} className="px-4 py-4">
                          <input
                            type="number"
                            step={teacherLevel === 'COLLEGE' ? '0.25' : '1'}
                            value={student[cat.key] || 0}
                            onChange={e => handleInputChange(student.id, cat.key, e.target.value)}
                            className="w-16 mx-auto block p-2.5 bg-slate-100/50 border border-transparent rounded-xl text-center font-black text-xs focus:bg-white focus:ring-2 outline-none transition-all"
                            style={{ focusRingColor: themeColor }}
                          />
                        </td>
                      ))}

                      <td className="px-6 py-4 text-center">
                        <span className="header-jakarta text-base font-black text-slate-800">{final}</span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          status === 'Passed' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {status}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GradeManagement;