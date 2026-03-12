import React, { useState } from 'react';
import axios from 'axios';
import { 
  Wallet, Search, Receipt, Banknote, History, CheckCircle2, X, CreditCard 
} from 'lucide-react';

const PaymentDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    method: 'Cash',
    category: 'Tuition'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost/sms-api/cashier/process_payment.php', formData);

      if (response.status === 201 || response.data.message.includes("successfully")) {
        alert("Payment Saved Successfully!");

        // 1. Isara ang modal
        setIsModalOpen(false);

        // 2. I-clear ang form para sa susunod na transaction
        setFormData({
          studentId: '',
          amount: '',
          method: 'Cash',
          category: 'Tuition'
        });

        // 3. (Optional) Dito natin pwedeng tawagin yung function 
        // para i-refresh ang table para makita agad yung bagong bayad.
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save payment.");
    }
  };

  return (
    <div className="p-6">
      {/* Header with Quick Action */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Payment Processing</h1>
          <p className="text-slate-500 text-sm">Manage student transactions and financial records.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Banknote size={20} /> New Payment
        </button>
      </div>

      {/* --- MODAL START --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-black text-slate-800 uppercase tracking-wide">Receive Payment</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Student ID / Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 2023-0001"
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount to Pay</label>
                  <input 
                    type="number" 
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0.00"
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fee Category</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option>Tuition</option>
                    <option>Miscellaneous</option>
                    <option>Uniform</option>
                    <option>Books</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Cash', 'GCash', 'Card'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData({...formData, method: m})}
                      className={`p-2 text-sm font-bold rounded-lg border transition-all ${
                        formData.method === m 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-800 text-white font-black py-4 rounded-xl mt-4 hover:bg-slate-900 transition-all uppercase tracking-widest shadow-xl shadow-slate-200"
              >
                Confirm Transaction
              </button>
            </form>
          </div>
        </div>
      )}
      {/* --- MODAL END --- */}

      {/* Dito mo ilalagay yung existing table mo ng recent transactions */}
      <div className="mt-8">
         <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Live Transaction Log</p>
         {/* ... ang table code mo dati ... */}
      </div>
    </div>
  );
};

export default PaymentDashboard;