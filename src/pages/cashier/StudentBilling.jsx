import React from 'react';
import { Search, FileText, AlertCircle } from 'lucide-react';

const StudentBilling = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Student Billing (SOA)</h1>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search Student Name or ID Number..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
          Generate Statement
        </button>
      </div>

      {/* Placeholder for Billing Info */}
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-20 flex flex-col items-center text-slate-400">
        <FileText size={48} className="mb-4 opacity-20" />
        <p className="font-medium">Search for a student to view billing breakdown.</p>
        <p className="text-sm">Tuition, Misc, and Lab fees will appear here.</p>
      </div>
    </div>
  );
};

export default StudentBilling;