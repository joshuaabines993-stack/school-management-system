import React, { useRef } from 'react';
import { X, Upload, User } from 'lucide-react';

const ProfileModal = ({
  isOpen,
  onClose,
  branding,
  teacherData, // Kung student ito, palitan lang ng studentData o gawing userData
  editForm,
  setEditForm,
  previewUrl,
  handleFileChange,
  handleUpdateProfile,
  API_BASE_URL
}) => {
  // Reference para ma-click ang hidden file input
  const fileInputRef = useRef(null);

  // Kung hindi open ang modal, huwag i-render ang HTML para makatipid sa memory
  if (!isOpen) return null;

  return (
    // BACKDROP: Yung madilim na background sa likod ng modal
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      
      {/* MODAL CONTAINER */}
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative transform transition-all"
        onClick={(e) => e.stopPropagation()} // Para hindi mag-close pag kinlik ang loob ng modal
      >
        
        {/* MODAL HEADER */}
        <div 
          style={{ backgroundColor: branding?.theme_color || '#001f3f' }}
          className="px-6 py-4 flex justify-between items-center text-white"
        >
          <h3 className="font-black tracking-wider uppercase text-sm">Edit Profile</h3>
          <button 
            onClick={onClose} 
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY (FORM) */}
        <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
          
          {/* PROFILE IMAGE SECTION */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative w-24 h-24 rounded-full border-4 border-slate-100 shadow-md overflow-hidden bg-slate-100 flex items-center justify-center">
              {/* Kung may preview (bagong upload), ipakita iyon. Kung wala, ipakita ang galing sa database. */}
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : teacherData?.profile_image ? (
                <img src={`${API_BASE_URL}/uploads/profiles/${teacherData.profile_image}`} alt="Current" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-slate-400" />
              )}
            </div>
            
            {/* HIDDEN FILE INPUT & CUSTOM BUTTON */}
            <input 
              type="file" 
              accept="image/*"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-full hover:bg-slate-200 transition-colors"
            >
              <Upload size={14} /> Change Photo
            </button>
          </div>

          {/* INPUT FIELDS */}
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input 
                type="email" 
                required
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="teacher@school.edu"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Contact Number
              </label>
              <input 
                type="text" 
                value={editForm.contact_no}
                onChange={(e) => setEditForm({ ...editForm, contact_no: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="09123456789"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Home Address
              </label>
              <textarea 
                rows="2"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Enter complete address"
              ></textarea>
            </div>
          </div>

          {/* MODAL FOOTER / ACTIONS */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{ backgroundColor: branding?.theme_color || '#001f3f' }}
              className="px-5 py-2 text-sm font-bold text-white rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all"
            >
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProfileModal;