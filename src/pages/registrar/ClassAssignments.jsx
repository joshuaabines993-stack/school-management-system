import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Layers, Plus, Search, BookOpen, Clock, 
  MapPin, Users, Edit, Trash2, X, CheckCircle, RefreshCw, AlertTriangle, Presentation
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DAYS_MAPPING = [
  { label: 'M', full: 'Monday' }, { label: 'T', full: 'Tuesday' },
  { label: 'W', full: 'Wednesday' }, { label: 'Th', full: 'Thursday' },
  { label: 'F', full: 'Friday' }, { label: 'S', full: 'Saturday' },
];

const ClassAssignments = () => {
  const { branding, token, API_BASE_URL } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Data States
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]); // ARCHITECT FIX: Para sa Dynamic Sections
  const [editId, setEditId] = useState(null);
  
  // Schedule States
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");

  const initialForm = {
    teacher_id: '',
    subject_id: '',
    section_id: '', // ARCHITECT FIX: Gagamit na tayo ng ID imbes na text
    grade_level: '', 
    room: '',
    schedule: '',
    school_year: '2026-2027',
  };
  const [formData, setFormData] = useState(initialForm);

  // --- FETCH DATA (Unified API) ---
  const fetchAssignmentData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/registrar/class_assign_data.php`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        setTeachers(res.data.teachers || []);
        setSubjects(res.data.subjects || []);
        setAssignments(res.data.assignments || []);
        setSections(res.data.sections || []); // Kunin ang mga gawa mong sections
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAssignmentData(); }, []);

  // --- HELPER: FORMAT TIME ---
  const formatTime12h = (time) => {
    if (!time) return '';
    let [h, m] = time.split(':');
    let ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  const updateScheduleString = useCallback((days, start, end) => {
    if (days.length === 0) {
      setFormData(prev => ({ ...prev, schedule: '' }));
      return;
    }
    const scheduleStr = `${days.join('')} ${formatTime12h(start)} - ${formatTime12h(end)}`;
    setFormData(prev => ({ ...prev, schedule: scheduleStr }));
  }, []);

  const toggleDay = (dayLabel) => {
    const newDays = selectedDays.includes(dayLabel)
      ? selectedDays.filter(d => d !== dayLabel)
      : [...selectedDays, dayLabel];
    setSelectedDays(newDays);
    updateScheduleString(newDays, startTime, endTime);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData(initialForm);
    setSelectedDays([]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    const endpoint = editId ? 'update_class_assign.php' : 'add_class_assign.php';
    try {
      const res = await axios.post(`${API_BASE_URL}/registrar/${endpoint}`, { ...formData, id: editId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        handleCloseModal();
        fetchAssignmentData();
      } else { alert(res.data.message); }
    } catch (error) { alert("Save failed."); }
    finally { setSaveLoading(true); setSaveLoading(false); }
  };

  const filteredAssignments = assignments.filter(a => 
    `${a.teacher_name} ${a.subject_name} ${a.section_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter uppercase">
            <Presentation className="text-blue-600" size={36} /> Class Assignments
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1 italic">Master Schedule & Room Allocation</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all active:scale-95">
          <Plus size={20} /> Create New Class
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input type="text" placeholder="Search by teacher, subject, or section..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-slate-700 shadow-sm" />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-10">Teacher & Load</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Target Section</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Schedule & Venue</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="4" className="p-20 text-center text-slate-300 font-black uppercase animate-pulse">Synchronizing Data...</td></tr>
            ) : filteredAssignments.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="p-6 pl-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-lg border-2 border-white shadow-sm">
                      {item.teacher_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm uppercase">{item.teacher_name}</p>
                      <p className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1 mt-1">
                        <BookOpen size={12}/> {item.subject_code}: {item.subject_name}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Users size={16}/></div>
                    <div>
                      <p className="font-black text-slate-700 text-sm uppercase">{item.section_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{item.grade_level}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className="space-y-2">
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 w-max">
                      <Clock size={12}/> {item.schedule}
                    </span>
                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2 tracking-widest">
                      <MapPin size={14} className="text-emerald-500"/> {item.room}
                    </p>
                  </div>
                </td>
                <td className="p-6 text-center">
                   <button className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <Edit size={18}/>
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <form onSubmit={handleSave} className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Assign Class Record</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Master Scheduling System</p>
              </div>
              <button type="button" onClick={handleCloseModal} className="p-3 bg-white text-slate-300 hover:text-red-500 rounded-2xl shadow-sm transition-all"><X size={20}/></button>
            </div>
            
            <div className="p-10 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-6">
                
                {/* TEACHER SELECT */}
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Teacher</label>
                  <select required value={formData.teacher_id} onChange={e=>setFormData({...formData, teacher_id: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-500">
                    <option value="">-- Select Faculty Member --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                </div>

                {/* SUBJECT SELECT WITH DYNAMIC FILTER */}
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Load</label>
                    <select 
                      required 
                      disabled={!formData.section_id} // Lock hangga't walang section
                      value={formData.subject_id} 
                      onChange={e=>setFormData({...formData, subject_id: e.target.value})} 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      <option value="">
                        {!formData.section_id ? '-- Select Section First --' : '-- Select Eligible Subject --'}
                      </option>
                      
                          {/* Debugging: This will print in your F12 console to show if subjects are actually loaded */}
                          {console.log("All Subjects:", subjects)}
                          {console.log("Current Section ID:", formData.section_id)}

                          {subjects.filter(sub => {
    const selectedSection = sections.find(sec => sec.id === parseInt(formData.section_id));
    if (!selectedSection) return false;

    // Kunin ang grade level at department
    const sectionLevel = (selectedSection.grade_level || "").toString().trim().toLowerCase();
    
    // DITO ANG FIX: Siguraduhin natin na may data ang subject field
    // Gagamit tayo ng fallback para hindi mag-crash
    const subjectLevel = (sub.grade_level_applicable || "").toString().trim().toLowerCase();

    // Debugging (Para makita mo sa console kung nagma-match sila)
    if(sectionLevel.includes("grade 6")) {
        console.log(`Checking Subject: ${sub.subject_code} | Sub Level: ${subjectLevel} | Target: ${sectionLevel}`);
    }

    // Matching Logic para sa Grade 1-10
    if (sectionLevel.includes('grade') && !sectionLevel.includes('11') && !sectionLevel.includes('12')) {
        // Kung ang subject code ay may "6" (katulad ng SCIENCE 6) OR match ang grade level field
        return subjectLevel === sectionLevel || sub.subject_code.includes(" 6");
    } 
    
    // College/SHS
    return parseInt(sub.program_id) === parseInt(selectedSection.program_id);
}).map(s => (
    <option key={s.id} value={s.id}>
        {s.subject_code} - {s.subject_description || s.name}
    </option>
))}
                    </select>
                    
                    {!formData.section_id && (
                      <p className="text-[9px] text-amber-600 font-bold mt-1 uppercase">
                        <AlertTriangle size={10} className="inline mr-1"/> Please select a target section to filter eligible subjects.
                      </p>
                    )}
                  </div>

                {/* DYNAMIC SECTION SELECT (ARCHITECT FIX) */}
                <div className="col-span-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Section</label>
                  <select required value={formData.section_id} onChange={e=>{
                    const selected = sections.find(sec => sec.id === parseInt(e.target.value));
                    setFormData({...formData, section_id: e.target.value, grade_level: selected?.grade_level || ''});
                  }} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-500">
                    <option value="">-- Select Section --</option>
                    {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.section_name} ({sec.grade_level})</option>)}
                  </select>
                </div>

                <div className="col-span-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room / Venue</label>
                  <input required type="text" placeholder="e.g. Rm 204" value={formData.room} onChange={e=>setFormData({...formData, room: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-500" />
                </div>

                {/* SCHEDULE BUILDER */}
                <div className="col-span-2 bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-4">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Schedule Configuration</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_MAPPING.map(day => (
                      <button key={day.label} type="button" onClick={() => toggleDay(day.label)} className={`w-12 h-12 rounded-xl font-black text-xs transition-all border ${selectedDays.includes(day.label) ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' : 'bg-white text-slate-400 border-slate-200'}`}>
                        {day.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <input type="time" value={startTime} onChange={(e) => {setStartTime(e.target.value); updateScheduleString(selectedDays, e.target.value, endTime);}} className="flex-1 p-3 bg-white border border-slate-200 rounded-xl font-bold" />
                    <input type="time" value={endTime} onChange={(e) => {setEndTime(e.target.value); updateScheduleString(selectedDays, startTime, e.target.value);}} className="flex-1 p-3 bg-white border border-slate-200 rounded-xl font-bold" />
                  </div>
                  <div className="p-3 bg-white rounded-xl text-center border-2 border-dashed border-blue-200">
                     <p className="text-xs font-black text-blue-600 uppercase tracking-tighter">Selected: {formData.schedule || 'None'}</p>
                  </div>
                </div>

              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={handleCloseModal} className="px-8 py-4 rounded-2xl font-black text-slate-400 uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
              <button type="submit" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">
                Confirm Assignment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ClassAssignments;