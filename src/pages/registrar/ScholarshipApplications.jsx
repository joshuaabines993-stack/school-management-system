import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, RefreshCw, X, CheckCircle, XCircle, FileText, ExternalLink, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ScholarshipApplications = () => {
  const { branding } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [selectedApp, setSelectedApp] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [docLoading, setDocLoading] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);

  const API_BASE_URL = "http://localhost/sms-api/registrar";
  // I-adjust ito base sa kung saan niyo sinesave yung uploads
  const UPLOADS_URL = "http://localhost/sms-api/uploads/documents"; 

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/get_scholarship_applications.php`);
      if (Array.isArray(res.data)) setApplications(res.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const openReviewModal = async (app) => {
    setSelectedApp(app);
    setDocLoading(true);
    setDocuments([]);
    try {
      const res = await axios.get(`${API_BASE_URL}/get_student_documents.php?student_id=${app.student_id}`);
      if (Array.isArray(res.data)) setDocuments(res.data);
    } catch (error) { console.error(error); }
    finally { setDocLoading(false); }
  };

  const handleEvaluate = async (status) => {
    if (!selectedApp) return;
    
    const confirmMsg = status === 'Approved' 
      ? `Approve ${selectedApp.first_name}'s application?` 
      : `Reject ${selectedApp.first_name}'s application?`;
      
    if (!window.confirm(confirmMsg)) return;

    setEvalLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/evaluate_scholarship.php`, {
        id: selectedApp.id,
        status: status
      });

      if (res.data.success) {
        alert(res.data.message);
        setSelectedApp(null);
        fetchApplications();
      } else {
        alert("Error: " + res.data.message);
      }
    } catch (error) {
      alert("Server error evaluating application.");
    } finally {
      setEvalLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Approved') return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">Approved</span>;
    if (status === 'Rejected') return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100">Rejected</span>;
    return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">Pending Review</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Award className="text-blue-500" size={32} /> Scholarship Applications
          </h1>
          <p className="text-slate-500 font-medium">Verify documents and approve student grants.</p>
        </div>
        <button onClick={fetchApplications} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-blue-500 transition-all">
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-8">Student</th>
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scholarship Applied</th>
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Applied</th>
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="5" className="p-10 text-center font-bold text-slate-400">Loading applications...</td></tr>
            ) : applications.length === 0 ? (
              <tr><td colSpan="5" className="p-10 text-center text-slate-400 font-bold">No applications found.</td></tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-5 pl-8">
                    <p className="font-bold text-slate-800">{app.first_name} {app.last_name}</p>
                    <p className="text-[10px] font-mono text-slate-400 uppercase">ID: {app.student_id}</p>
                  </td>
                  <td className="p-5 font-bold text-slate-600">{app.scholarship_name}</td>
                  <td className="p-5 text-xs font-bold text-slate-500">{new Date(app.date_applied).toLocaleDateString()}</td>
                  <td className="p-5 text-center">{getStatusBadge(app.status)}</td>
                  <td className="p-5 text-center">
                    <button 
                      onClick={() => openReviewModal(app)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                    >
                      {app.status === 'Pending' ? 'Review Files' : 'View Details'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* REVIEW MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col animate-in zoom-in duration-200 max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-800 uppercase tracking-tight">Application Review</h3>
                <p className="text-sm font-bold text-blue-600">{selectedApp.scholarship_name}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-2 text-slate-400 hover:text-red-500"><X size={20}/></button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
              {/* Applicant Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Applicant Details</p>
                <p className="text-lg font-black text-slate-800">{selectedApp.first_name} {selectedApp.last_name}</p>
                <p className="text-sm font-mono text-slate-500">{selectedApp.student_id}</p>
              </div>

              {/* Documents Section */}
              <div>
                <h4 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-blue-500"/> Submitted Documents
                </h4>
                
                {docLoading ? (
                  <p className="text-sm text-slate-400 font-bold text-center p-4">Fetching documents...</p>
                ) : documents.length === 0 ? (
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3 text-amber-600">
                    <Clock size={20} className="shrink-0"/>
                    <p className="text-sm font-bold">This student has not uploaded any documents yet. You may want to wait before approving.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {documents.map(doc => (
                      <a 
                        key={doc.id}
                        href={`${UPLOADS_URL}/${doc.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                      >
                        <span className="text-xs font-bold text-slate-700 truncate pr-2">{doc.document_name}</span>
                        <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-500 shrink-0"/>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ACTION FOOTER (Only show if Pending) */}
            {selectedApp.status === 'Pending' ? (
              <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-[2.5rem] flex gap-3">
                <button 
                  onClick={() => handleEvaluate('Rejected')} 
                  disabled={evalLoading}
                  className="flex-1 py-3 font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all border border-red-100 flex justify-center items-center gap-2"
                >
                  <XCircle size={18}/> Reject
                </button>
                <button 
                  onClick={() => handleEvaluate('Approved')} 
                  disabled={evalLoading}
                  className="flex-1 py-3 font-black text-white rounded-xl shadow-lg bg-emerald-500 hover:bg-emerald-600 transition-all flex justify-center items-center gap-2"
                >
                  {evalLoading ? <RefreshCw size={18} className="animate-spin"/> : <><CheckCircle size={18}/> Approve Grant</>}
                </button>
              </div>
            ) : (
              <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-[2.5rem] flex justify-center">
                <p className="text-sm font-bold text-slate-500">
                  This application was already <span className={selectedApp.status === 'Approved' ? 'text-emerald-600' : 'text-red-500'}>{selectedApp.status}</span>.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScholarshipApplications;