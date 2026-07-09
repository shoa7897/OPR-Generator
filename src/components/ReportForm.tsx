import React, { ChangeEvent, useState } from 'react';
import { ReportData } from '../types';
import { Upload, X, Plus, GripVertical } from 'lucide-react';
import { motion, Reorder } from 'motion/react';
import { DraggableList } from './DraggableList';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parse, isValid } from 'date-fns';
import { resizeImage } from '../utils/imageResize';

const safeParseDate = (dateStr: string) => {
  if (!dateStr) return null;
  const parsed = parse(dateStr, 'yyyy-MM-dd', new Date());
  return isValid(parsed) ? parsed : null;
};

interface Props {
  data: ReportData;
  setData: React.Dispatch<React.SetStateAction<ReportData>>;
}

export default function ReportForm({ data, setData }: Props) {
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setData(prev => ({ ...prev, [name]: checked }));
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      for (const file of files.slice(0, 3)) {
        try {
          const resizedDataUrl = await resizeImage(file, 400, 400, 0.9);
          setData(prev => ({ ...prev, logos: [...prev.logos, resizedDataUrl].slice(0, 3) }));
        } catch (error) {
          console.error("Error resizing logo", error);
        }
      }
    }
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      for (const file of files.slice(0, 5)) {
        try {
          const resizedDataUrl = await resizeImage(file, 800, 800, 0.85);
          setData(prev => ({ ...prev, photos: [...prev.photos, resizedDataUrl].slice(0, 5) }));
        } catch (error) {
          console.error("Error resizing photo", error);
        }
      }
    }
  };

  const removeLogo = (index: number) => {
    setData(prev => ({ ...prev, logos: prev.logos.filter((_, i) => i !== index) }));
  };

  const removePhoto = (index: number) => {
    setData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className="p-4 sm:p-6 space-y-6 pb-32"
    >
      
      {/* Theme Settings */}
      <motion.section 
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
        className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50"
      >
        <label className="block text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4 border-b pb-2">Theme Colors</label>
        
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Presets</label>
          <div className="flex flex-wrap gap-3">
            {[
              { name: 'Blue', primary: '#1e3a8a', secondary: '#3b82f6' },
              { name: 'Emerald', primary: '#064e3b', secondary: '#10b981' },
              { name: 'Rose', primary: '#881337', secondary: '#f43f5e' },
              { name: 'Amber', primary: '#78350f', secondary: '#f59e0b' },
              { name: 'Purple', primary: '#4c1d95', secondary: '#8b5cf6' },
              { name: 'Slate', primary: '#0f172a', secondary: '#64748b' },
            ].map((preset) => (
              <button
                key={preset.name}
                onClick={() => setData(prev => ({ ...prev, themeColor: preset.primary, secondaryColor: preset.secondary }))}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:bg-slate-900/50 transition-colors"
                type="button"
              >
                <span className="flex items-center gap-0.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }}></span>
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.secondary }}></span>
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Primary Custom</label>
            <div className="flex items-center gap-3">
              <input type="color" name="themeColor" value={data.themeColor} onChange={handleChange} className="h-10 w-10 rounded cursor-pointer border-0 p-0" />
              <input type="text" name="themeColor" value={data.themeColor} onChange={handleChange} className="w-full dark:text-white dark:placeholder-slate-500 text-sm p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Secondary Custom</label>
            <div className="flex items-center gap-3">
              <input type="color" name="secondaryColor" value={data.secondaryColor} onChange={handleChange} className="h-10 w-10 rounded cursor-pointer border-0 p-0" />
              <input type="text" name="secondaryColor" value={data.secondaryColor} onChange={handleChange} className="w-full dark:text-white dark:placeholder-slate-500 text-sm p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Layout Options */}
      <motion.section 
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
        className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50"
      >
        <label className="block text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4 border-b pb-2">Layout Options</label>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">General Layout</label>
             <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="showHeader" checked={data.showHeader !== false} onChange={handleCheckboxChange} className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Show Header</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="showFooter" checked={data.showFooter !== false} onChange={handleCheckboxChange} className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Show Footer</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="showDateStamp" checked={data.showDateStamp !== false} onChange={handleCheckboxChange} className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Show Date Stamp</span>
              </label>
             </div>
          </div>

          <div className="flex flex-col gap-3">
             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Content Sections</label>
             <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="showProgramDetails" checked={data.showProgramDetails !== false} onChange={handleCheckboxChange} className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Program Details</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="showObjektif" checked={data.showObjektif !== false} onChange={handleCheckboxChange} className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Objektif</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="showAktiviti" checked={data.showAktiviti !== false} onChange={handleCheckboxChange} className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Aktiviti</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="showImpak" checked={data.showImpak !== false} onChange={handleCheckboxChange} className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Impak</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="showCadangan" checked={data.showCadangan !== false} onChange={handleCheckboxChange} className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Cadangan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="showPhotos" checked={data.showPhotos !== false} onChange={handleCheckboxChange} className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Photos</span>
              </label>
             </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Body Text Font Size</span>
              <span>{data.fontSize || 12}px</span>
            </label>
            <input 
              type="range" 
              name="fontSize" 
              min="8" 
              max="16" 
              step="1"
              value={data.fontSize || 12} 
              onChange={(e) => setData(prev => ({ ...prev, fontSize: parseInt(e.target.value, 10) }))} 
              className="w-full dark:text-white dark:placeholder-slate-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </motion.section>

      {/* School Info */}
      <motion.section 
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
        className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50"
      >
        <label className="block text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4 border-b pb-2">School Identity</label>
        
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">School Name</label>
          <input type="text" name="schoolName" value={data.schoolName} onChange={handleChange} className="w-full dark:text-white dark:placeholder-slate-500 text-sm p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">School Logo (Max 3)</label>
          <div className="flex gap-3 flex-wrap">
            {data.logos.filter(Boolean).map((logo, idx) => (
              <div key={idx} className="relative w-20 h-20 border rounded-lg bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center group overflow-hidden shadow-sm">
                <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain p-1" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <button onClick={() => removeLogo(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md">
                  <X size={14} />
                </button>
              </div>
            ))}
            {data.logos.length < 3 && (
              <label className="w-20 h-20 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-center cursor-pointer hover:bg-slate-50 dark:bg-slate-900/50 hover:border-blue-400 transition-all flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-blue-500">
                <Plus size={24} />
                <span className="text-[9px] font-bold uppercase tracking-wider mt-1">Add Logo</span>
                <input type="file" accept="image/*" multiple onChange={handleLogoUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>
      </motion.section>

      {/* Program Details */}
      <motion.section 
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
        className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50"
      >
        <label className="block text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4 border-b pb-2">Program Details</label>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Program Title (Large)</label>
            <input type="text" name="programTitle" value={data.programTitle} onChange={handleChange} className="w-full dark:text-white dark:placeholder-slate-500 text-base sm:text-lg font-bold p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Date</label>
              <DatePicker
                selected={safeParseDate(data.tarikh)}
                onChange={(date: Date | null) => setData(prev => ({ ...prev, tarikh: date ? format(date, 'yyyy-MM-dd') : '' }))}
                dateFormat="dd/MM/yyyy"
                className="w-full dark:text-white dark:placeholder-slate-500 text-sm p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholderText="DD/MM/YYYY"
                popperClassName="z-50"
                withPortal
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Time</label>
              <input type="text" name="masa" value={data.masa} onChange={handleChange} className="w-full dark:text-white dark:placeholder-slate-500 text-sm p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Location</label>
              <input type="text" name="tempat" value={data.tempat} onChange={handleChange} className="w-full dark:text-white dark:placeholder-slate-500 text-sm p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Target Group</label>
              <input type="text" name="sasaran" value={data.sasaran} onChange={handleChange} className="w-full dark:text-white dark:placeholder-slate-500 text-sm p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Organized By</label>
            <input type="text" name="anjuran" value={data.anjuran} onChange={handleChange} className="w-full dark:text-white dark:placeholder-slate-500 text-sm p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
        </div>
      </motion.section>

      {/* Content Areas */}
      <motion.section 
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
        className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50"
      >
        <label className="block text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4 border-b pb-2">Report Content</label>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Program Objectives</label>
            <DraggableList value={data.objektif} onChange={(val) => setData(prev => ({ ...prev, objektif: val }))} placeholder="Enter objective..." />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Program Activities</label>
            <DraggableList value={data.aktiviti} onChange={(val) => setData(prev => ({ ...prev, aktiviti: val }))} placeholder="Enter activity..." />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Program Impact</label>
            <DraggableList value={data.impak} onChange={(val) => setData(prev => ({ ...prev, impak: val }))} placeholder="Enter impact..." />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Suggestions for Improvement</label>
            <DraggableList value={data.cadangan} onChange={(val) => setData(prev => ({ ...prev, cadangan: val }))} placeholder="Enter suggestion..." />
          </div>
        </div>
      </motion.section>

      {/* Photos */}
      <motion.section 
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
        className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50"
      >
        <label className="block text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4 border-b pb-2">Program Photos (Max 5)</label>
        
        <Reorder.Group 
          axis="y" 
          values={data.photos.filter(Boolean)} 
          onReorder={(newPhotos) => setData(prev => ({ ...prev, photos: newPhotos }))} 
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2"
        >
          {data.photos.filter(Boolean).map((photo, idx) => (
            <Reorder.Item 
              key={photo} 
              value={photo} 
              className="relative aspect-video bg-slate-200 rounded-lg group overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm cursor-grab active:cursor-grabbing"
            >
              <div className="absolute top-2 left-2 bg-slate-900/50 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm shadow-sm hover:bg-slate-900/80">
                <GripVertical size={16} />
              </div>
              <img src={photo} alt={`Program ${idx + 1}`} className="w-full h-full object-cover pointer-events-none" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <button onClick={() => removePhoto(idx)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10 hover:bg-red-600">
                <X size={16} />
              </button>
            </Reorder.Item>
          ))}
          {data.photos.length < 5 && (
            <div className="relative aspect-video">
              <label className="absolute inset-0 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:bg-slate-900/50 hover:border-blue-400 text-slate-400 dark:text-slate-500 hover:text-blue-500 transition-all">
                <Upload size={24} className="mb-2" />
                <span className="text-xs font-bold uppercase tracking-wider">Upload Photo</span>
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          )}
        </Reorder.Group>
      </motion.section>

      {/* Signature */}
      <motion.section 
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
        className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50"
      >
        <label className="block text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4 border-b pb-2">Signature (Prepared By)</label>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Name</label>
            <input type="text" name="preparedByName" value={data.preparedByName} onChange={handleChange} className="w-full dark:text-white dark:placeholder-slate-500 text-sm p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Role</label>
            <input type="text" name="preparedByRole" value={data.preparedByRole} onChange={handleChange} className="w-full dark:text-white dark:placeholder-slate-500 text-sm p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Date</label>
            <DatePicker
                selected={safeParseDate(data.preparedDate)}
                onChange={(date: Date | null) => setData(prev => ({ ...prev, preparedDate: date ? format(date, 'yyyy-MM-dd') : '' }))}
                dateFormat="dd/MM/yyyy"
                className="w-full dark:text-white dark:placeholder-slate-500 text-sm p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholderText="DD/MM/YYYY"
                popperClassName="z-50"
                withPortal
              />
          </div>
        </div>
      </motion.section>
      
    </motion.div>
  );
}
