import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Banknote, X, Receipt, Hash, PhilippinePeso, Layers, History, CheckCircle2, Printer, Search, UserCircle } from 'lucide-react';

const PaymentDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allRecentPayments, setAllRecentPayments] = useState([]);
  const [studentName, setStudentName] = useState(''); 
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({ 
    studentId: '', amount: '', method: 'Cash', fee_category: 'Tuition' 
  });

  // 1. FETCH ALL DATA
  const fetchAllRecentPayments = async () => {
    try {
      const res = await axios.get('http://localhost/sms-api/cashier/get_payments.php');
      setAllRecentPayments(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchAllRecentPayments();
  }, []);

  // 2. REAL-TIME LOOKUP LOGIC
  useEffect(() => {
    const lookupStudent = async () => {
      if (formData.studentId.length > 2) { 
        setIsSearching(true);
        try {
          const res = await axios.get(`http://localhost/sms-api/cashier/get_student_name.php?id=${formData.studentId}`);
          if (res.data.status === "found") {
            setStudentName(res.data.name);
          } else {
            setStudentName('Student not found');
          }
        } catch (err) { setStudentName(''); }
        setIsSearching(false);
      } else {
        setStudentName('');
      }
    };

    const timeoutId = setTimeout(lookupStudent, 500); 
    return () => clearTimeout(timeoutId);
  }, [formData.studentId]);

  // 3. PRINT RECEIPT
  const handlePrint = (tx) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Receipt - ${tx.student}</title></head>
        <body style="font-family: 'Courier New', monospace; padding: 40px; width: 350px; border: 1px dashed #ccc;">
          <center>
            <h2 style="margin-bottom:0;">SCHOOL SYSTEM</h2>
            <p style="margin-top:0; font-size:12px;">OFFICIAL RECEIPT</p>
          </center>
          <hr/>
          <p><b>DATE:</b> ${tx.date || new Date().toLocaleDateString()}</p>
          <p><b>STUDENT ID:</b> ${tx.student}</p>
          <p><b>CATEGORY:</b> ${tx.type}</p>
          <p><b>METHOD:</b> ${tx.method}</p>
          <hr/>
          <h2 style="text-align: right;">TOTAL: ₱${Number(tx.amount).toLocaleString()}</h2>
          <hr/>
          <center><p style="font-size: 10px;">This serves as your official proof of payment.</p></center>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost/sms-api/cashier/process_payment.php', formData);
      if (res.status === 201 || res.status === 200) {
        alert("Payment Processed Successfully!");
        setIsModalOpen(false);
        setFormData({ studentId: '', amount: '', method: 'Cash', fee_category: 'Tuition' });
        fetchAllRecentPayments();
      }
    } catch (err) { alert("Error processing payment."); }
  };

  return (
    <div className="p-6 text-left space-y-10 max-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden shrink-0">
        <div className="relative z-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Process Payment</h1>
          <p className="text-blue-200 font-medium italic">Record and monitor all student transactions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 bg-white text-blue-800 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 shadow-xl flex items-center gap-3 border-b-4 border-blue-200"
        >
          <Banknote size={20} /> New Transaction
        </button>
      </div>

      {/* Scrollable Table */}
      <div className="flex-1 flex flex-col min-h-0 space-y-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-4">
          <History size={14} /> Transaction History
        </h2>
        <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm overflow-hidden flex flex-col flex-1">
          <div className="overflow-y-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b-2 border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                <tr>
                  <th className="p-5">Student ID</th>
                  <th className="p-5">Name</th> {/* BINALIK */}
                  <th className="p-5">Amount</th>
                  <th className="p-5">Category</th>
                  <th className="p-5 text-right">Method & Date</th> {/* PINAGSAMA PARA SA SPACE */}
                  <th className="p-5 text-center">Action</th> {/* PRINT BUTTON */}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allRecentPayments.length > 0 ? (
                  allRecentPayments.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                      {/* ID */}
                      <td className="p-5 text-xs font-mono font-bold text-slate-400">
                        {p.student}
                      </td>

                      {/* Name */}
                      <td className="p-5 text-sm font-bold text-slate-700">
                        {p.name || "Student Name"} {/* Dynamic if available */}
                      </td>

                      {/* Amount */}
                      <td className="p-5 text-sm font-black text-blue-600">
                        ₱{Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Category */}
                      <td className="p-5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">
                          {p.type}
                        </span>
                      </td>

                      {/* Method & Date */}
                      <td className="p-5 text-right">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-700 uppercase">{p.method}</span>
                          </div>
                          <span className="text-[9px] font-bold text-slate-300 uppercase italic">
                            {p.date || "Just now"}
                          </span>
                        </div>
                      </td>

                      {/* Print Action */}
                      <td className="p-5 text-center">
                        <button
                          onClick={() => handlePrint(p)}
                          className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                          title="Print Receipt"
                        >
                          <Printer size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="p-20 text-center text-slate-300 italic">No transactions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL WITH LOOKUP */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden border-4 border-white transform transition-all scale-100">
            <div className="p-8 bg-slate-50 border-b flex justify-between items-center text-left">
              <h2 className="font-black text-slate-800 uppercase flex items-center gap-3">
                <Receipt className="text-blue-600" /> Receive Payment
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={28} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6 text-left">
              {/* Student ID & Name Feedback Area */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Student ID</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-4 text-slate-300" size={18} />
                  <input required type="text" className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-2xl focus:border-blue-500 transition-all font-bold"
                    placeholder="Enter ID..." value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  />
                </div>
                
                {/* LOOKUP RESULT BOX */}
                {(studentName || isSearching) && (
                  <div className={`mt-2 p-4 rounded-2xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-2 ${
                    studentName.includes('not found') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {isSearching ? <Search className="animate-spin" size={16}/> : <UserCircle size={16}/>}
                    <span className="text-xs font-black uppercase tracking-tight">
                      {isSearching ? 'Verifying ID...' : studentName}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Amount</label>
                  <div className="relative">
                    <PhilippinePeso className="absolute left-4 top-4 text-slate-300" size={18} />
                    <input required type="number" className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-2xl focus:border-blue-500 transition-all font-black text-blue-600"
                      placeholder="0.00" value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                  <select className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-blue-500 font-bold"
                    value={formData.fee_category}
                    onChange={(e) => setFormData({ ...formData, fee_category: e.target.value })}
                  >
                    <option value="Tuition">Tuition</option>
                    <option value="Enrollment">Enrollment</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center block mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Cash', 'GCash', 'Card'].map(m => (
                    <button key={m} type="button" onClick={() => setFormData({ ...formData, method: m })}
                      className={`py-3 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${formData.method === m ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-400 border-slate-100'}`}
                    > {m} </button>
                  ))}
                </div>
              </div>

              <button 
                disabled={!studentName || studentName.includes('not found')}
                type="submit" 
                className={`w-full font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest transition-all mt-4 ${
                  !studentName || studentName.includes('not found') 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                }`}
              >
                Confirm & Post Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDashboard;