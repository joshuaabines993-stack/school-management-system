import React from 'react';
import { BookOpen, Users, Clock, AlertCircle, Zap, ChevronRight, X } from 'lucide-react'; // Idinagdag ang mga kailangang icons
import { LOADING_SPINNER } from '../../utils/teacherConstants';

/**
 * Reusable LoadingSpinner component
 */
export const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className={LOADING_SPINNER.containerClass}>
    <div className={LOADING_SPINNER.spinnerWrapperClass}>
      <div className={LOADING_SPINNER.spinnerClass} />
      <div className={LOADING_SPINNER.textClass}>{message}</div>
    </div>
  </div>
);

/**
 * Reusable EmptyState component
 */
export const EmptyState = ({ icon: Icon, title, message }) => (
  <div className="py-12 flex flex-col items-center justify-center text-slate-500 opacity-60">
    {Icon && <Icon size={36} className="mb-3 text-slate-400" />}
    <h3 className="text-sm font-bold text-slate-600">{title}</h3>
    {message && <p className="text-xs font-medium text-slate-500 mt-1 text-center max-w-sm">{message}</p>}
  </div>
);

/**
 * Reusable Header component for each page section
 */
export const PageHeader = ({ icon: Icon, title, subtitle, action, badge }) => (
  <div className="animate-stagger flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/40 backdrop-blur-md px-5 py-4 rounded-xl border border-white shadow-sm" style={{ animationDelay: '0ms' }}>
    <div className="flex items-center gap-3 flex-1">
      {Icon && <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm shadow-indigo-500/20">{Icon}</div>}
      <div className="flex-1">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">{title}</h2>
        {subtitle && <p className="text-[11px] text-slate-600 font-medium mt-1.5">{subtitle}</p>}
      </div>
    </div>
    <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 flex-wrap sm:flex-nowrap">
      {badge && (
        <span className="text-[11px] font-bold text-slate-700 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-white/80 shrink-0">
          {badge}
        </span>
      )}
      {action}
    </div>
  </div>
);

/**
 * Reusable StatCard component
 */
export const StatCard = ({ icon: Icon, label, value, color, bg, animationDelay = 0, isHighlight = false }) => (
  <div 
    className="animate-stagger bg-white/40 backdrop-blur-md p-4 rounded-xl shadow-sm border border-white flex items-center gap-3 group cursor-default" 
    style={{ animationDelay: `${animationDelay}ms` }}
  >
    <div className={`p-2.5 rounded-lg ${bg} ${color} shrink-0 shadow-inner border border-white/50 group-hover:scale-105 transition-transform duration-300 transform-gpu`}>
      {Icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5 truncate">{label}</p>
      <p className={`text-xl font-black tracking-tight truncate ${isHighlight && value > 0 ? 'text-red-600' : 'text-slate-800'}`}>
        {value}
      </p>
    </div>
  </div>
);

/**
 * Reusable Card wrapper
 */
export const Card = ({ children, className = '', animationDelay = 0 }) => (
  <div 
    className={`animate-stagger bg-white/40 backdrop-blur-md rounded-xl shadow-sm border border-white ${className}`}
    style={{ animationDelay: `${animationDelay}ms` }}
  >
    {children}
  </div>
);

/**
 * Reusable CardHeader
 */
export const CardHeader = ({ title, icon: Icon, action }) => (
  <div className="px-5 py-3.5 border-b border-white/60 bg-white/20 flex items-center justify-between shrink-0">
    <div className="flex items-center space-x-2">
      {Icon && <Icon className="w-4 h-4 text-indigo-600" />}
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
    </div>
    {action}
  </div>
);

/**
 * Reusable Class Details Modal
 */
export const ClassDetailsModal = ({ class: selectedClass, onClose, navigate }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform-gpu scale-100">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <BookOpen size={18} />
          </div>
          <h3 className="font-bold text-slate-800">Class Details</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Subject</p>
          <p className="text-base font-bold text-slate-800">{selectedClass.subject}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Section</p>
            <p className="text-sm font-bold text-slate-800">{selectedClass.section_name || 'TBA'}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Students</p>
            <p className="text-sm font-bold text-slate-800">{selectedClass.student_count || 0}</p>
          </div>
        </div>
      </div>
      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
        >
          Close
        </button>
        <button
          onClick={() => navigate(`/teacher/grades/${selectedClass.id}`)}
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
        >
          Manage Grades <ChevronRight size={14} />
        </button>
      </div>
    </div>
  </div>
);

/**
 * Reusable Task Details Modal
 */
export const TaskDetailsModal = ({ task, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform-gpu scale-100">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-orange-50/50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
            <Zap size={18} />
          </div>
          <h3 className="font-bold text-slate-800">Task Details</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Task Title</p>
          <p className="text-base font-bold text-slate-800">{task.title}</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Description</p>
          <p className="text-sm font-medium text-slate-700">{task.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Due Date</p>
            <p className="text-sm font-bold text-slate-800">{task.due}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Status</p>
            <p className={`text-sm font-bold ${task.status === 'Urgent' ? 'text-red-600' : 'text-orange-600'}`}>
              {task.status}
            </p>
          </div>
        </div>
      </div>
      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-xs font-bold text-white bg-orange-500 rounded-lg shadow-sm hover:bg-orange-600 transition-colors"
        >
          Mark as Read
        </button>
      </div>
    </div>
  </div>
);

/**
 * Reusable Badge component
 */
export const Badge = ({ text, variant = 'default', icon: Icon }) => {
  const variants = {
    success: 'bg-emerald-100/60 text-emerald-700 border-white',
    error: 'bg-red-100/60 text-red-700 border-white',
    warning: 'bg-amber-100/80 text-amber-700 border-white',
    info: 'bg-blue-100/80 text-blue-700 border-white',
    default: 'bg-white/60 text-slate-500 border-white',
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm backdrop-blur-sm border flex items-center gap-1 ${variants[variant]}`}>
      {Icon && <Icon size={12} />}
      {text}
    </span>
  );
};

/**
 * Reusable InfoItem
 */
export const InfoItem = ({ icon: Icon, label, value, isMissing = false }) => (
  <div className="flex items-start gap-3">
    <div className="p-1.5 bg-indigo-100/50 rounded-md text-indigo-500 shrink-0">
      {Icon}
    </div>
    <div>
      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5">{label}</p>
      <p className={`text-xs font-bold ${isMissing ? 'text-slate-400 italic' : 'text-slate-800'}`}>
        {value || 'Not provided'}
      </p>
    </div>
  </div>
);

export default {
  LoadingSpinner,
  EmptyState,
  PageHeader,
  StatCard,
  Card,
  CardHeader,
  ClassDetailsModal,
  TaskDetailsModal,
  Badge,
  InfoItem,
};