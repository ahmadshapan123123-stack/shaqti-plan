import { useEffect, useState } from 'react';
import { decodeProjectFromUrl } from '../utils/shareProject';
import kashifLogo from '../KASHif logo-02.png';
import { Home, Ruler, Layout, Clock, Download, AlertCircle } from 'lucide-react';

export default function ReviewPage() {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = decodeProjectFromUrl();
    if (raw) {
      // Map short keys back for internal use
      const data = {
        name: raw.n,
        rooms: raw.r?.map((r: any) => ({
          id: r.i,
          name: r.n,
          x: r.x, y: r.y,
          width: r.w, height: r.h,
          color: r.c, strokeColor: r.s,
          openings: r.o?.map((o: any) => ({ type: o.t, side: o.s, position: o.p, width: o.w }))
        })),
        placedItems: raw.p?.map((p: any) => ({
          furnitureId: p.f,
          x: p.x, y: p.y,
          rotation: p.r,
          customWidth: p.w, customHeight: p.h
        })),
        thumbnail: raw.t,
        sharedAt: raw.a
      };
      setProject(data);
    }
    setLoading(false);
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 font-bold animate-pulse">جاري تحميل المخطط...</p>
      </div>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-md w-full text-center p-8 bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl">
        <AlertCircle size={64} className="text-red-400 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-2">رابط غير صالح</h2>
        <p className="text-gray-400 mb-8">عذراً، الرابط الذي تحاول الوصول إليه ناقص أو منتهي الصلاحية.</p>
        <button onClick={() => window.location.href = '/'} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all">
          العودة للرئيسية
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-cairo" dir="rtl">
      
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-gray-800 to-blue-800 shadow-lg">
            <img src={kashifLogo} className="h-6 w-auto object-contain" alt="Kashif Logo" />
          </div>
          <div>
            <h1 className="font-black text-gray-800 dark:text-white text-sm">{project.name}</h1>
            <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1.5 capitalize">
              <Clock size={10} />
              {formatDate(project.sharedAt)} — نسخة مراجعة
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 bg-gray-900 dark:bg-gray-800 text-white px-5 py-2 rounded-xl text-xs font-black hover:bg-black transition-all shadow-xl shadow-black/10"
          >
            <Download size={14} />
            تصدير PDF
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Floor Plan Display (2/3 width) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden relative group">
            <div className="p-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layout size={18} className="text-blue-600" />
                <h2 className="font-black text-gray-800 dark:text-white text-sm">المخطط المعماري</h2>
              </div>
              <span className="text-[10px] font-black px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-800/50 uppercase tracking-widest">Architectural View</span>
            </div>
            
            <div className="bg-slate-50 dark:bg-black/20 p-8 min-h-[400px] flex items-center justify-center">
              {project.thumbnail ? (
                <img 
                  src={project.thumbnail} 
                  className="max-w-full h-auto object-contain shadow-2xl rounded-lg bg-white"
                  alt="Floor Plan" 
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-300">
                  <Layout size={48} strokeWidth={1} />
                  <p className="text-xs font-bold">لا تتوفر معاينة للمخطط</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 text-center border-t border-gray-100 dark:border-gray-800">
               <p className="text-[10px] text-gray-400 font-bold">© تم التصميم بواسطة "شقتي بلان" - جميع الحقوق محفوظة</p>
            </div>
          </div>
        </div>

        {/* Data & Analytics Panel (1/3 width) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Stats */}
          <div className="bg-blue-600 dark:bg-blue-700 rounded-[32px] p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">صافي المساحة</p>
                <div className="flex items-end gap-2">
                   <h3 className="text-4xl font-black">
                     {project.rooms?.reduce((s: any, r: any) => s + (r.width/40)*(r.height/40), 0).toFixed(1)}
                   </h3>
                   <span className="text-sm font-bold mb-1 opacity-80">م²</span>
                </div>
             </div>
             <Ruler size={100} className="absolute -bottom-6 -right-6 opacity-10 rotate-12" />
          </div>

          {/* Room List Details */}
          <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="font-black text-gray-800 dark:text-white mb-6 flex items-center gap-2 text-sm">
              <Home size={16} className="text-blue-500" />
              تفاصيل الغرف والجناح
            </h3>
            
            <div className="space-y-3">
              {project.rooms?.map((room: any) => (
                <div key={room.id}
                     className="p-4 rounded-2xl border border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:border-blue-100 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-md shadow-sm"
                         style={{ background: room.color }} />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 flex-1 truncate">
                      {room.name}
                    </span>
                    <span className="text-sm font-black text-gray-900 dark:text-white">
                      {((room.width/40)*(room.height/40)).toFixed(1)} <span className="text-[10px]">م²</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] font-bold text-gray-400">
                        {(room.width/40).toFixed(1)}م × {(room.height/40).toFixed(1)}م
                      </p>
                      <div className="w-8 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                         <div className="h-full bg-blue-500" style={{ width: '60%' }} />
                      </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-3xl p-6 text-center">
             <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                <AlertCircle size={20} className="text-emerald-500" />
             </div>
             <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mb-1">هل لديك ملاحظات؟</p>
             <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70 leading-relaxed">يرجى التواصل مع المصمم مباشرة لمناقشة التعديلات المطلوبة على المخطط.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
