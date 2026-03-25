import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FURNITURE_CATEGORY_LABELS,
  FURNITURE_CATEGORIES,
  type FurnitureCategory,
} from '../constants/furnitureCategories';
import { useFurnitureStore } from '../store/useFurnitureStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { X, Upload, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

type Step = 1 | 2 | 3;

const STEP_LABELS = ['رفع الصورة', 'معالجة الخلفية', 'تخصيص القطعة'];
const MISSING_KEY_MESSAGE = 'لم يتم إعداد مفتاح Remove.bg — يرجى إضافته من الإعدادات لإزالة الخلفية تلقائياً.';
const REMOVE_BG_FAILED_MESSAGE = 'فشلت إزالة الخلفية. يمكنك المتابعة بالصورة الأصلية أو المحاولة ثانية.';

const fileToDataUrl = (input: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('failed-to-read-file'));
    };
    reader.onerror = () => reject(new Error('failed-to-read-file'));
    reader.readAsDataURL(input);
  });

const loadImageElement = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('failed-to-load-image'));
    image.src = src;
  });

const optimizeImageForStorage = async (input: Blob) => {
  const source = await fileToDataUrl(input);
  const image = await loadImageElement(source);
  const scale = Math.min(1, 600 / image.width, 600 / image.height);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('canvas-context-unavailable');
  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/png');
};

const buildItemId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.floor(Math.random() * 1_000)}`;

export const UploadFurnitureModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const addToLibrary = useFurnitureStore((state) => state.addToLibrary);
  const removeBgKey = useSettingsStore((state) => state.removeBgKey);

  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState('');
  const [processedPreview, setProcessedPreview] = useState('');
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');
  const [name, setName] = useState('');
  const [realWidth, setRealWidth] = useState('1.5');
  const [realHeight, setRealHeight] = useState('0.8');
  const [category, setCategory] = useState<FurnitureCategory>('living room');

  const requestIdRef = useRef(0);

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    setStep(1);
    setFile(null);
    setOriginalPreview('');
    setProcessedPreview('');
    setProcessedBlob(null);
    setLoading(false);
    setSaving(false);
    setApiError('');
    setName('');
    setRealWidth('1.5');
    setRealHeight('0.8');
    setCategory('living room');
  }, []);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const requestBackgroundRemoval = useCallback(
    async (selectedFile: File, requestId: number) => {
      if (!removeBgKey) {
        setApiError(MISSING_KEY_MESSAGE);
        return;
      }

      setLoading(true);
      setApiError('');
      try {
        const formData = new FormData();
        formData.append('image_file', selectedFile);
        formData.append('size', 'auto');

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: { 'X-Api-Key': removeBgKey },
          body: formData,
        });

        if (!response.ok) throw new Error('فشل الطلب');

        const resultBlob = await response.blob();
        const optimizedResult = await optimizeImageForStorage(resultBlob);

        if (requestIdRef.current !== requestId) return;

        setProcessedBlob(resultBlob);
        setProcessedPreview(optimizedResult);
        setStep(2); // Jump to preview if successful
      } catch (error) {
        if (requestIdRef.current === requestId) setApiError(REMOVE_BG_FAILED_MESSAGE);
      } finally {
        if (requestIdRef.current === requestId) setLoading(false);
      }
    },
    [removeBgKey]
  );

  const handleFileSelection = useCallback(
    async (selected: File) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setFile(selected);
      setStep(2);
      setLoading(Boolean(removeBgKey));
      setApiError(removeBgKey ? '' : MISSING_KEY_MESSAGE);

      try {
        const optimizedOriginal = await optimizeImageForStorage(selected);
        if (requestIdRef.current !== requestId) return;
        setOriginalPreview(optimizedOriginal);
      } catch (error) {
        if (requestIdRef.current === requestId) setApiError('تعذر قراءة الصورة.');
        setLoading(false);
        return;
      }

      if (removeBgKey) void requestBackgroundRemoval(selected, requestId);
      else setLoading(false);
    },
    [removeBgKey, requestBackgroundRemoval]
  );

  const handleSubmit = async () => {
    const source = processedBlob ?? file;
    if (!source || saving) return;
    setSaving(true);
    try {
      const imageUrl = await optimizeImageForStorage(source);
      addToLibrary({
        id: buildItemId(),
        name: name.trim() || 'قطعة جديدة',
        category,
        imageUrl,
        realWidth: Number(realWidth) || 1,
        realHeight: Number(realHeight) || 1,
      });
      onSuccess?.();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in duration-300" onClick={onClose}>
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white dark:bg-gray-950 shadow-2xl ring-1 ring-black/5 dark:ring-white/10" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-8 py-6 bg-gray-50/50 dark:bg-gray-900/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">إضافة قطعة أثاث</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">اتبع الخطوات لتحويل صورتك إلى عنصر معماري</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Steps Progress */}
        <div className="px-8 pt-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -translate-y-1/2 z-0" />
            <div className="absolute top-1/2 left-0 h-0.5 bg-blue-600 transition-all duration-500 -translate-y-1/2 z-0" style={{ width: `${((step - 1) / 2) * 100}%` }} />
            
            {STEP_LABELS.map((label, i) => {
              const num = i + 1;
              const isActive = step >= num;
              const isCurrent = step === num;
              return (
                <div key={label} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/30' : 
                    isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {isActive ? <CheckCircle2 size={18} /> : num}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div 
              onDragOver={(e) => e.preventDefault()} 
              onDrop={(e) => { e.preventDefault(); handleFileSelection(e.dataTransfer.files[0]); }}
              className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem] bg-gray-50/50 dark:bg-gray-900/30 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all duration-300 group cursor-pointer"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 mb-6 group-hover:scale-110 transition-transform">
                <Upload size={40} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">ارفع صورة الأثاث</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs text-center">يفضل أن تكون الصورة من الأعلى (Top-down) لتبدو واقعية في المخطط</p>
              <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">الأصلية</p>
                  <div className="aspect-square rounded-3xl bg-gray-100 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800 flex items-center justify-center overflow-hidden">
                    {originalPreview ? <img src={originalPreview} className="max-h-full object-contain drop-shadow-lg" /> : <div className="animate-pulse w-full h-full bg-gray-200 dark:bg-gray-800 rounded-2xl" />}
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">بدون خلفية</p>
                  <div className="aspect-square rounded-3xl bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] bg-[size:10px_10px] p-4 border border-gray-200 dark:border-gray-800 flex items-center justify-center overflow-hidden relative">
                    {loading ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                        <span className="text-[10px] font-bold text-blue-600 animate-pulse">جاري المعالجة...</span>
                      </div>
                    ) : processedPreview ? (
                      <img src={processedPreview} className="max-h-full object-contain drop-shadow-xl animate-in zoom-in-50 duration-500" />
                    ) : (
                      <div className="text-center p-4">
                        <AlertCircle size={24} className="mx-auto text-amber-500 mb-2" />
                        <p className="text-[10px] text-gray-400 leading-relaxed font-medium">{apiError || 'بانتظار المعالجة'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                <AlertCircle size={16} />
                <p>إزالة الخلفية تجعل الأثاث يبدو احترافياً وتمنعه من تغطية تفاصيل الغرفة.</p>
              </div>

              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded-[2rem] border border-gray-100 dark:border-gray-800">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <ArrowRight size={18} /> رجوع
                </button>
                <div className="flex gap-3">
                  {!removeBgKey && (
                    <Link to="/settings" className="px-4 py-2 text-xs font-bold text-blue-600 hover:underline">إعداد المفتاح</Link>
                  )}
                  <button onClick={() => setStep(3)} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2">
                    متابعة <ArrowLeft size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-left duration-300">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">اسم القطعة</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً: كنبة جلد مودرن" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500/20 dark:text-white placeholder:text-gray-400" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">التصنيف</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as FurnitureCategory)} className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500/20 dark:text-white">
                    {FURNITURE_CATEGORIES.map(c => <option key={c} value={c}>{FURNITURE_CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">العرض (متر)</label>
                  <input type="number" step="0.1" value={realWidth} onChange={(e) => setRealWidth(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500/20 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">الطول (متر)</label>
                  <input type="number" step="0.1" value={realHeight} onChange={(e) => setRealHeight(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500/20 dark:text-white" />
                </div>
              </div>

              <button 
                onClick={handleSubmit} 
                disabled={saving}
                className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-bold text-lg shadow-2xl shadow-blue-500/30 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={24} />
                    <span>إضافة للمكتبة والبدء بالتصميم</span>
                  </>
                )}
              </button>
              
              <button onClick={() => setStep(2)} className="w-full py-2 text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                العودة للخطوة السابقة
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadFurnitureModal;
