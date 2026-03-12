import React from 'react';
import { History, Download, Filter } from 'lucide-react';

const CollectionReports = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Collection Reports</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 rounded-lg text-sm font-medium">
            <Filter size={16} /> Filter Date
          </button>
          <button className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900">
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50">
          <h3 className="font-bold text-slate-700">Daily Transaction Summary</h3>
        </div>
        <div className="p-12 text-center text-slate-400">
          <History size={40} className="mx-auto mb-4 opacity-20" />
          <p>No reports generated for the selected period.</p>
        </div>
      </div>
    </div>
  );
};

export default CollectionReports;