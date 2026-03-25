import { useState } from 'react';
import { FileText, X, Download } from 'lucide-react';
import type { ProjectInfo } from '../utils/exportEngineeringPdf';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExport: (info: ProjectInfo) => void;
}

export default function EngineeringExportModal({ isOpen, onClose, onExport }: Props) {
  const [form, setForm] = useState<ProjectInfo>({
    projectName: '',
    ownerName: '',
    drawnBy: 'كاشف',
    date: new Date().toLocaleDateString('ar-EG'),
    scale: '1:100',
    notes: ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
        
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shadow-inner">
            <FileText size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">تصدير مخطط هندسي</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">بمقياس رسم حقيقي وإطار هندسي احترافي</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mr-1">اسم المشروع *</label>
              <input 
                type="text" 
                value={form.projectName}
                onChange={e => setForm({...form, projectName: e.target.value})}
                placeholder="مثال: شقة النزهة"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mr-1">اسم المالك</label>
              <input 
                type="text" 
                value={form.ownerName}
                onChange={e => setForm({...form, ownerName: e.target.value})}
                placeholder="مثال: أحمد محمد"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mr-1">رسم بواسطة</label>
              <input 
                type="text" 
                value={form.drawnBy}
                onChange={e => setForm({...form, drawnBy: e.target.value})}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mr-1">التاريخ</label>
              <input 
                type="text" 
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white"
              />
            </div>
          </div>

          {/* Scale selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mr-1">مقياس الرسم</label>
            <div className="flex gap-2">
              {(['1:50', '1:75', '1:100'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({...form, scale: s})}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200
                              ${form.scale === s 
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 grow' 
                                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:bg-blue-50/50'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mr-1">ملاحظات</label>
            <textarea 
              value={form.notes}
              onChange={e => setForm({...form, notes: e.target.value})}
              placeholder="أي ملاحظات إضافية تظهر في لوحة المشروع..."
              rows={2}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-2 flex gap-3">
          <button 
            onClick={() => onExport(form)}
            disabled={!form.projectName}
            className="flex-[2] bg-blue-600 text-white py-3.5 rounded-2xl text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
          >
            <Download size={18} />
            تصدير PDF هندسي
          </button>
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
