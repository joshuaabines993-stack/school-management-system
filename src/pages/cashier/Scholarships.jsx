import React from 'react';
import { Receipt, Plus, Award } from 'lucide-react';

const Scholarships = () => {
  const scholarships = [
    { id: 1, name: 'Academic Scholar (Full)', type: 'Internal', discount: '100% Tuition' },
    { id: 2, name: 'ESC Voucher', type: 'Government', discount: '₱9,000.00' },
    { id: 3, name: 'Varsity Discount', type: 'Special', discount: '50% Tuition' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Scholarship & Voucher Management</h1>
        <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
          <Plus size={18} /> Add New Grant
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scholarships.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <Award className="text-blue-500 mb-3" size={32} />
            <h3 className="font-bold text-slate-800">{s.name}</h3>
            <p className="text-sm text-slate-500">{s.type}</p>
            <div className="mt-4 pt-4 border-t border-slate-50">
              <span className="text-emerald-600 font-bold">{s.discount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Scholarships;