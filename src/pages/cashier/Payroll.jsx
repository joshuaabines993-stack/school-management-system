import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Banknote, Users, Calendar, History, Search, Plus, UserPlus, Briefcase, Wallet, X, Edit2, Trash2, Printer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Payroll = () => {
  const { API_BASE_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('Employees');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialForm = {
    id: '',
    employee_id: '',
    first_name: '',
    last_name: '',
    position: '',
    department: '',
    basic_salary: '',
    status: 'Active'
  };

  const [formData, setFormData] = useState(initialForm);

  // --- FETCH EMPLOYEES ---
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/cashier/get_employees.php`);
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  // --- SAVE / UPDATE EMPLOYEE ---
  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    try {
      const endpoint = formData.id ? 'update_employee.php' : 'add_employee.php';
      const res = await axios.post(`${API_BASE_URL}/cashier/${endpoint}`, formData);
      if (res.data.status === 'success') {
        setIsModalOpen(false);
        setFormData(initialForm);
        fetchEmployees();
      }
    } catch (err) {
      alert("Error saving employee");
    }
  };

  // 1. Dagdag na States sa taas
  const [periods, setPeriods] = useState([]);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [periodData, setPeriodData] = useState({ period_name: '', start_date: '', end_date: '' });

  // 2. Fetch Periods function
  const fetchPeriods = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/cashier/get_periods.php`);
      setPeriods(res.data);
    } catch (err) { console.error("Error fetching periods"); }
  };

  // 3. Add to useEffect
  useEffect(() => {
    fetchEmployees();
    fetchPeriods();
  }, []);

  // 4. Handle Create Period
  const handleCreatePeriod = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/cashier/add_period.php`, periodData);
      if (res.data.status === 'success') {
        setIsPeriodModalOpen(false);
        setPeriodData({ period_name: '', start_date: '', end_date: '' });
        fetchPeriods();
      }
    } catch (err) { alert("Error creating period"); }
  };

  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [payrollEntries, setPayrollEntries] = useState([]);

  const handleStartProcess = async (period) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/cashier/process_payroll_init.php?period_id=${period.id}`);
      if (res.data.status === 'success') {
        setPayrollEntries(res.data.entries);
        setSelectedPeriod(period); // Dito mag-u-switch ang view natin
      }
    } catch (err) {
      alert("Error initializing payroll");
    } finally {
      setLoading(false);
    }
  };

  // Function para sa real-time    ng inputs sa table
  const updateEntry = (index, field, value) => {
    const newEntries = [...payrollEntries];

    // Gawing whole number ang value (kung hindi net_pay)
    // Gagamit tayo ng Math.max(0, ...) para walang negative values
    const numericValue = value === '' ? 0 : Math.max(0, parseInt(value));

    newEntries[index][field] = numericValue;

    // Computation ng Net Pay
    const basicSalary = parseFloat(newEntries[index].basic_salary) || 0;
    const dailyRate = basicSalary / 22; // Assumption: 22 working days
    const hourlyRate = dailyRate / 8;

    const basePay = dailyRate * newEntries[index].days_worked;
    const otPay = (hourlyRate * 1.25) * newEntries[index].overtime_hours;
    // Sample penalty: (Daily Rate / 8 / 60) * late minutes
    const lateDeduction = (hourlyRate / 60) * newEntries[index].late_minutes;

    const total = (basePay + otPay) - lateDeduction;

    // Net pay lang ang may decimal
    newEntries[index].net_pay = Math.max(0, total).toFixed(2);

    setPayrollEntries(newEntries);
  };

  const handleSavePayroll = async (status) => {
    if (status === 'Paid' && !window.confirm("Are you sure? This will lock the payroll data for this period.")) return;

    setLoading(true);
    try {
      const payload = {
        period_id: selectedPeriod.id,
        entries: payrollEntries,
        final_status: status
      };

      const res = await axios.post(`${API_BASE_URL}/cashier/save_payroll.php`, payload);

      // Dito natin sisiguraduhin na may fallback message
      const serverMessage = res.data.message || (status === 'Paid' ? "Payroll Finalized!" : "Draft Saved!");

      if (res.data.status === 'success') {
        alert(serverMessage);
        if (status === 'Paid') {
          setSelectedPeriod(null);
          fetchPeriods();
        }
      } else {
        alert("Error: " + (res.data.message || "Unknown error occurred."));
      }
    } catch (err) {
      console.error(err);
      alert("System Error: Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const [completedPeriods, setCompletedPeriods] = useState([]);
  const [viewingHistory, setViewingHistory] = useState(null); // Para sa drill-down view

  // Fetch list ng tapos na cutoffs
  const fetchCompletedPeriods = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/cashier/get_completed_periods.php`);
      // I-force natin na maging array ang data. Kung hindi array, gawin itong empty array.
      setCompletedPeriods(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching history");
      setCompletedPeriods([]); // Fallback
    }
  };

  // Fetch specific employee records para sa isang tapos na cutoff
  const handleViewHistory = async (period) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/cashier/get_completed_payroll.php?period_id=${period.id}`);
      if (res.data.status === 'success') {
        setPayrollEntries(res.data.entries);
        setViewingHistory(period);
      }
    } catch (err) { alert("Error loading history data"); }
    finally { setLoading(false); }
  };

  // I-trigger ang fetch kapag lumipat sa Completed tab
  useEffect(() => {
    if (activeTab === 'Completed') {
      fetchCompletedPeriods();
      setViewingHistory(null); // Reset view
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'Completed') {
      fetchCompletedPeriods();
      setViewingHistory(null);
      setPayrollEntries([]); // I-clear ang entries para iwas conflict sa ibang tabs
    }
  }, [activeTab]);

  const printIndividualPayslip = (entry, period) => {
    const printWindow = window.open('', '_blank');

    // Dito natin bubuuin ang itsura ng Payslip (HTML/CSS)
    printWindow.document.write(`
    <html>
      <head>
        <title>Payslip - ${entry.full_name}</title>
        <style>
          body { font-family: sans-serif; padding: 40px; color: #333; }
          .payslip-card { border: 2px solid #eee; padding: 30px; border-radius: 20px; max-width: 500px; margin: auto; }
          .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
          .label { font-weight: bold; color: #666; text-transform: uppercase; font-size: 12px; }
          .value { font-weight: 800; }
          .total-row { margin-top: 20px; padding-top: 15px; border-top: 2px dashed #eee; }
          .net-pay { font-size: 24px; color: #059669; font-weight: 900; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="payslip-card">
          <div class="header">
            <h2 style="margin:0; italic">PAYROLL <span style="color:#3b82f6">PRO</span></h2>
            <p style="font-size:10px; color:#999; margin:5px 0 uppercase">${period.period_name}</p>
          </div>
          
          <div class="row">
            <span class="label">Employee Name:</span>
            <span class="value">${entry.full_name}</span>
          </div>
          <div class="row">
            <span class="label">Position:</span>
            <span class="value">${entry.position}</span>
          </div>
          <div class="row">
            <span class="label">Period:</span>
            <span class="value">${period.start_date} - ${period.end_date}</span>
          </div>
          
          <div class="total-row">
            <div class="row">
              <span class="label">Days Worked:</span>
              <span class="value">${entry.days_worked}</span>
            </div>
            <div class="row">
              <span class="label">OT Hours:</span>
              <span class="value">${entry.ot_hours}</span>
            </div>
            <div class="row">
              <span class="label">Late Minutes:</span>
              <span class="value">${entry.late_minutes}</span>
            </div>
          </div>

          <div class="total-row" style="text-align: right;">
            <div class="label">Net Take Home Pay:</div>
            <div class="net-pay">₱${parseFloat(entry.net_pay).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>

          <div class="footer">
            Generated on ${new Date().toLocaleDateString()}<br>
            CONFIDENTIAL DOCUMENT
          </div>
        </div>
        <script>window.print(); window.close();</script>
      </body>
    </html>
  `);
    printWindow.document.close();
  };

  return (
    <div className="p-6 space-y-6 text-left max-w-7xl mx-auto">

      {/* 1. HEADER & TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-8 rounded-[3rem] shadow-2xl overflow-hidden relative">
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
            <Banknote size={32} className="text-blue-500" /> Payroll <span className="text-blue-500">Pro</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1 ml-1">Personnel & Salary Management</p>
        </div>

        <div className="flex bg-slate-800/50 p-2 rounded-3xl backdrop-blur-md border border-slate-700/50">
          {['Employees', 'Periods', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 2. EMPLOYEES TAB CONTENT */}
      {activeTab === 'Employees' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="relative w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search staff..."
                className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-none font-bold text-xs outline-none focus:ring-2 ring-blue-500/20 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => { setFormData(initialForm); setIsModalOpen(true); }}
              className="bg-blue-600 text-white p-4 rounded-2xl flex items-center gap-3 hover:bg-black transition-all shadow-lg shadow-blue-100"
            >
              <UserPlus size={18} />
              <span className="text-[10px] font-black uppercase">Add Employee</span>
            </button>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                  <th className="p-6 text-left">Employee Name</th>
                  <th className="p-6 text-left">Position</th>
                  <th className="p-6 text-center">Basic Salary</th>
                  <th className="p-6 text-center">Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {employees.filter(emp => `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(search.toLowerCase())).map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6">
                      <div className="font-black text-slate-800 uppercase italic text-sm">{emp.first_name} {emp.last_name}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">ID: {emp.employee_id}</div>
                    </td>

                    {/* POSITION & DEPARTMENT COLUMN */}
                    <td className="p-6">
                      <div className="font-bold text-slate-600 text-xs uppercase">{emp.position}</div>
                      <div className="text-[9px] text-blue-500 font-black uppercase italic tracking-tighter">{emp.department}</div>
                    </td>

                    <td className="p-6 text-center font-black text-slate-700 text-xs">
                      ₱{parseFloat(emp.basic_salary).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-6 text-center">
                      <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase ${emp.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button onClick={() => { setFormData(emp); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Periods' && !selectedPeriod && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-700 uppercase italic">Active Cutoff Periods</h3>
            <button
              onClick={() => setIsPeriodModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-black transition-all flex items-center gap-2"
            >
              <Plus size={18} /> Create New Cutoff
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {periods.filter(p => p.status !== 'Completed').map((p) => (
              <div key={p.id} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border-b-4 border-b-blue-500 group">
                <div className="p-3 bg-blue-50 w-fit rounded-2xl text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Calendar size={24} />
                </div>
                <h4 className="font-black text-slate-800 uppercase text-sm italic">{p.period_name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-tighter">
                  {p.start_date} — {p.end_date}
                </p>

                <button
                  onClick={() => handleStartProcess(p)}
                  className="mt-8 w-full py-4 bg-slate-50 text-blue-600 rounded-2xl font-black text-[10px] uppercase italic hover:bg-blue-600 hover:text-white transition-all"
                >
                  Process Payroll →
                </button>
              </div>
            ))}
          </div>
        </div>
      )
      }

      {activeTab === 'Completed' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {!viewingHistory ? (
            // LIST OF COMPLETED PERIODS
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(completedPeriods) && completedPeriods.length > 0 ? (
                completedPeriods.map((p) => (
                  <div key={p.id} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all border-l-4 border-l-emerald-500">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                        <History size={24} />
                      </div>
                      <span className="text-[8px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase">Completed</span>
                    </div>
                    <h4 className="font-black text-slate-800 uppercase text-sm italic">{p.period_name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">
                      {p.start_date} — {p.end_date}
                    </p>
                    <button
                      onClick={() => handleViewHistory(p)}
                      className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase italic hover:bg-emerald-600 transition-all"
                    >
                      View Report
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No completed records found</p>
                </div>
              )}
            </div>
          ) : (
            // DRILL-DOWN REPORT VIEW
            <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
              <div className="flex items-center justify-between bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl">
                <div>
                  <button onClick={() => setViewingHistory(null)} className="text-emerald-200 hover:text-white text-[10px] font-black uppercase mb-2 flex items-center gap-1">
                    ← Back to History
                  </button>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">{viewingHistory.period_name}</h2>
                </div>
                <button onClick={() => window.print()} className="bg-white/20 px-6 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-white/30 transition-all">
                  Print Report
                </button>
              </div>

              <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                      <th className="p-6 text-left">Staff Name</th>
                      <th className="p-6 text-center">Days</th>
                      <th className="p-6 text-center">OT</th>
                      <th className="p-6 text-center">Late</th>
                      <th className="p-6 text-right">Final Pay</th>
                      <th className="p-6 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {/* Dagdagan ng (payrollEntries || []) para hindi mag-error kung null */}
                    {(payrollEntries || []).map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50/50">
                        <td className="p-6">
                          <div className="font-black text-slate-800 uppercase italic text-sm">{entry.full_name}</div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase">{entry.position}</div>
                        </td>
                        <td className="p-6 text-center font-bold text-slate-600 text-xs">{entry.days_worked}</td>
                        <td className="p-6 text-center font-bold text-slate-600 text-xs">{entry.ot_hours}</td>
                        <td className="p-6 text-center font-bold text-slate-600 text-xs">{entry.late_minutes}</td>
                        <td className="p-6 text-right font-black text-emerald-600">
                          ₱{parseFloat(entry.net_pay || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-6 text-center">
                          <button
                            onClick={() => printIndividualPayslip(entry, viewingHistory)}
                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Print Payslip"
                          >
                            <Printer size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. MODAL FOR ADD/EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">{formData.id ? 'Edit Employee' : 'New Employee'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveEmployee} className="p-8 space-y-4">
              <input required placeholder="Employee ID" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-xs" value={formData.employee_id} onChange={e => setFormData({ ...formData, employee_id: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="First Name" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-xs" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                <input required placeholder="Last Name" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-xs" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
              </div>
              <input required placeholder="Position" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-xs" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} />
              <input
                required
                placeholder="Department"
                className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-xs"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
              />
              <input required type="number" placeholder="Basic Salary" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-xs" value={formData.basic_salary} onChange={e => setFormData({ ...formData, basic_salary: e.target.value })} />
              <select className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-xs outline-none" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg hover:bg-black transition-all">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* PERIOD MODAL */}
      {isPeriodModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase italic tracking-tighter">New Cutoff</h2>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Set payroll duration</p>
              </div>
              <button onClick={() => setIsPeriodModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePeriod} className="p-8 space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Period Description</label>
                <input
                  required
                  placeholder="e.g. April 1-15, 2024 Payroll"
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-xs mt-1 outline-none focus:ring-2 ring-blue-500/20"
                  value={periodData.period_name}
                  onChange={e => setPeriodData({ ...periodData, period_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Start Date</label>
                  <input
                    required
                    type="date"
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-xs mt-1 outline-none focus:ring-2 ring-blue-500/20"
                    value={periodData.start_date}
                    onChange={e => setPeriodData({ ...periodData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">End Date</label>
                  <input
                    required
                    type="date"
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-xs mt-1 outline-none focus:ring-2 ring-blue-500/20"
                    value={periodData.end_date}
                    onChange={e => setPeriodData({ ...periodData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-blue-200 hover:bg-black transition-all mt-4"
              >
                Confirm & Create Period
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'Periods' && selectedPeriod && (
        <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-500">
          <div className="flex items-center justify-between bg-slate-900 p-8 rounded-[2.5rem] text-white">
            <div>
              <button onClick={() => setSelectedPeriod(null)} className="text-slate-400 hover:text-white text-[10px] font-black uppercase mb-2 flex items-center gap-1">
                ← Back to Periods
              </button>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">{selectedPeriod.period_name}</h2>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => handleSavePayroll('Pending')}
                className="bg-slate-800 px-6 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-700 transition-all"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleSavePayroll('Paid')}
                className="bg-blue-600 px-6 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
              >
                Finalize & Pay
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                  <th className="p-6 text-left">Employee</th>
                  <th className="p-6 text-center">Days Worked</th>
                  <th className="p-6 text-center">OT Hours</th>
                  <th className="p-6 text-center">Late (Min)</th>
                  <th className="p-6 text-right">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payrollEntries.map((entry, idx) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50">
                    <td className="p-6">
                      <div className="font-black text-slate-800 uppercase italic text-sm">{entry.first_name} {entry.last_name}</div>
                      <div className="text-[9px] text-blue-500 font-bold uppercase">{entry.position}</div>
                    </td>
                    <td className="p-6 text-center">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        className="w-20 p-2 bg-slate-100 rounded-lg text-center font-bold text-xs outline-none focus:ring-2 ring-blue-500/20"
                        value={entry.days_worked}
                        onChange={(e) => updateEntry(idx, 'days_worked', e.target.value)}
                      />
                    </td>
                    <td className="p-6 text-center">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        className="w-20 p-2 bg-slate-100 rounded-lg text-center font-bold text-xs outline-none focus:ring-2 ring-blue-500/20"
                        value={entry.overtime_hours}
                        onChange={(e) => updateEntry(idx, 'overtime_hours', e.target.value)}
                      />
                    </td>
                    <td className="p-6 text-center">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        className="w-20 p-2 bg-slate-100 rounded-lg text-center font-bold text-xs outline-none focus:ring-2 ring-blue-500/20"
                        value={entry.late_minutes}
                        onChange={(e) => updateEntry(idx, 'late_minutes', e.target.value)}
                      />
                    </td>
                    <td className="p-6 text-right font-black text-slate-800">
                      ₱{parseFloat(entry.net_pay).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default Payroll;