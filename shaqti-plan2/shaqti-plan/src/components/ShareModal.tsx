import { useState } from 'react';
import { Share2, X, Link, Loader2, CheckCircle2, Copy } from 'lucide-react';
import { encodeProjectToUrl } from '../utils/shareProject';
import { useToast } from '../hooks/useToast';
import type { FloorRoom } from '../store/useFloorPlanStore';
import type { PlacedFurniture } from '../store/useFurnitureStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  rooms: FloorRoom[];
  placedItems: PlacedFurniture[];
  projectName: string;
  canvasRef: any;
}

export default function ShareModal({ isOpen, onClose, rooms, placedItems, projectName, canvasRef }: Props) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const showToast = useToast(s => s.showToast);

  const generateLink = async () => {
    setGenerating(true);
    try {
      let thumbnail = '';
      if (canvasRef?.current?.exportToPng) {
        thumbnail = await canvasRef.current.exportToPng();
      }
      const url = encodeProjectToUrl(rooms, placedItems, projectName, thumbnail || '');
      setShareUrl(url);
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('تم نسخ الرابط ✓', 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-[32px] shadow-2xl w-full max-w-md p-8 overflow-hidden border border-gray-100 dark:border-gray-700">
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shadow-inner">
            <Share2 size={28} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-black text-xl text-gray-800 dark:text-white">
              مشاركة التصميم
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              رابط مخصص لمراجعة العميل (للقراءة فقط)
            </p>
          </div>
        </div>

        {/* Features list */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: <CheckCircle2 size={14} className="text-emerald-500" /> , text: 'عرض المخطط بوضوح' },
            { icon: <CheckCircle2 size={14} className="text-emerald-500" /> , text: 'تحليل الغرف والمساحات' },
            { icon: <CheckCircle2 size={14} className="text-emerald-500" /> , text: 'لا يتطلب تسجيل دخول' },
            { icon: <CheckCircle2 size={14} className="text-emerald-500" /> , text: 'حماية المخطط من التعديل' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
              {f.icon}
              <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">
                {f.text}
              </span>
            </div>
          ))}
        </div>

        {!shareUrl ? (
          <button
            onClick={generateLink}
            disabled={generating}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl
                       font-black hover:bg-emerald-700 flex items-center 
                       justify-center gap-2 disabled:opacity-50 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
          >
            {generating ? (
              <><Loader2 size={20} className="animate-spin" /> جاري إنشاء الرابط...</>
            ) : (
              <><Link size={20} /> إنشاء الرابط الآن</>
            )}
          </button>
        ) : (
          <div className="animate-in zoom-in-95 duration-300">
            <div className="flex gap-2 p-1.5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-inner">
              <div className="flex-1 px-3 py-3 overflow-hidden text-xs font-mono text-gray-400 truncate dir-ltr">
                {shareUrl}
              </div>
              <button onClick={copyLink}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl
                           text-sm font-black hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-90 transition-all flex items-center gap-2">
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copied ? 'تم!' : 'نسخ'}
              </button>
            </div>
            <button
              onClick={generateLink}
              className="w-full mt-4 text-[10px] text-gray-400 hover:text-blue-500 
                         font-bold flex items-center justify-center gap-1 transition-colors">
              <Link size={10} /> إعادة توليد الرابط
            </button>
          </div>
        )}

        <button onClick={onClose}
          className="absolute top-6 left-6 p-2 rounded-xl text-gray-300 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
