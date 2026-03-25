import { Calculator, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useFloorPlanStore, type FloorRoom } from '../store/useFloorPlanStore';

const ROOM_STANDARDS: Record<string, { min: number; recommended: number }> = {
  'غرفة نوم رئيسية': { min: 12, recommended: 16 },
  'غرفة نوم':         { min: 9,  recommended: 12 },
  'غرفة معيشة':       { min: 15, recommended: 25 },
  'صالة':             { min: 10, recommended: 16 },
  'مطبخ':             { min: 6,  recommended: 10 },
  'حمام':             { min: 3,  recommended: 5  },
  'غرفة طعام':        { min: 8,  recommended: 12 },
  'مجلس':             { min: 16, recommended: 24 },
};

const getRecommendation = (roomName: string, area: number) => {
  const key = Object.keys(ROOM_STANDARDS).find(k => 
    roomName.includes(k) || k.includes(roomName)
  );
  if (!key) return null;
  const std = ROOM_STANDARDS[key];
  if (area < std.min) 
    return { type: 'error', msg: `أقل من الحد الأدنى (${std.min}م²)`, icon: <AlertCircle className="text-red-500" size={12} /> };
  if (area < std.recommended) 
    return { type: 'warning', msg: `أقل من المعيار الموصى به (${std.recommended}م²)`, icon: <Info className="text-amber-500" size={12} /> };
  return { type: 'success', msg: 'مطابق للمعايير الهندسية', icon: <CheckCircle2 className="text-emerald-500" size={12} /> };
};

export function AreaCalculator({ rooms }: { rooms: FloorRoom[] }) {
  const { aptWidth, aptHeight, setAptDimensions } = useFloorPlanStore();
  
  const totalArea = rooms.reduce((s, r) => 
    s + (r.width/40) * (r.height/40), 0);

  // Calculate suggested area based on rooms' bounding box
  const suggestedArea = (() => {
    if (rooms.length === 0) return 0;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    rooms.forEach(r => {
      minX = Math.min(minX, r.x);
      minY = Math.min(minY, r.y);
      maxX = Math.max(maxX, r.x + r.width);
      maxY = Math.max(maxY, r.y + r.height);
    });
    return ((maxX - minX) / 40) * ((maxY - minY) / 40);
  })();
  
  const totalBuildArea = (aptWidth && aptHeight) 
    ? parseFloat(aptWidth) * parseFloat(aptHeight) 
    : (suggestedArea > 0 ? suggestedArea : null);

  const usefulRatio = totalBuildArea && totalBuildArea > 0
    ? ((totalArea / totalBuildArea) * 100).toFixed(0)
    : null;

  const isInputTooSmall = totalBuildArea && totalArea > totalBuildArea + 0.1;

  return (
    <div className="flex flex-col gap-5 p-1 animate-in fade-in slide-in-from-left-4 duration-300" dir="rtl">
      
      {/* Header Info */}
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
          <Calculator size={18} />
        </div>
        <div>
          <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100">حاسبة المساحات الذكية</h3>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Area Analytics v1.0</p>
        </div>
      </div>

      {/* Total apt dimensions */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-100/50 dark:border-blue-800/30">
        <p className="text-xs text-blue-700 dark:text-blue-300 font-bold mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          أبعاد الشقة الكلية (للمقارنة)
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 group">
            <input type="number" placeholder="العرض م"
              value={aptWidth}
              onChange={e => setAptDimensions(e.target.value, aptHeight)}
              className={`w-full text-sm border ${isInputTooSmall ? 'border-red-300 dark:border-red-900' : 'border-blue-200/50 dark:border-blue-700/50'} rounded-xl px-3 py-2 text-center bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white`} />
          </div>
          <span className="text-gray-400 font-bold">×</span>
          <div className="flex-1 group">
            <input type="number" placeholder="الطول م"
              value={aptHeight}
              onChange={e => setAptDimensions(aptWidth, e.target.value)}
              className={`w-full text-sm border ${isInputTooSmall ? 'border-red-300 dark:border-red-900' : 'border-blue-200/50 dark:border-blue-700/50'} rounded-xl px-3 py-2 text-center bg-white/80 dark:bg-gray-800/80 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white`} />
          </div>
        </div>
        
        {suggestedArea > 0 && !aptWidth && !aptHeight && (
          <div className="mt-2 flex items-center justify-between bg-blue-500/5 dark:bg-blue-500/10 rounded-lg p-2 border border-blue-500/10 scale-in-center">
            <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold">المساحة المقترحة بناءً على الرسم: {suggestedArea.toFixed(1)} م²</span>
            <button 
              onClick={() => {
                const side = Math.sqrt(suggestedArea);
                setAptDimensions(side.toFixed(1), side.toFixed(1));
              }}
              className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-md hover:bg-blue-700 transition-colors font-bold"
            >
              استخدام
            </button>
          </div>
        )}

        {isInputTooSmall && (
          <p className="text-[10px] text-red-500 mt-2 text-center font-bold animate-pulse">⚠️ المساحة المدخلة أصغر من مجموع مساحات الغرف!</p>
        )}
        
        {!isInputTooSmall && (
          <p className="text-[10px] text-blue-400 dark:text-blue-500 mt-2 text-center font-medium">يستخدم لحساب نسبة المساحة المفيدة (الصافية)</p>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-3.5 text-center border border-gray-100 dark:border-gray-700 shadow-sm transition-transform hover:scale-[1.02]">
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {totalArea.toFixed(1)}
          </p>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">م² مساحة الغرف</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-3.5 text-center border border-gray-100 dark:border-gray-700 shadow-sm transition-transform hover:scale-[1.02]">
          <p className={`text-2xl font-black ${usefulRatio ? (parseInt(usefulRatio) > 75 ? 'text-emerald-500' : 'text-amber-500') : 'text-gray-300'}`}>
            {usefulRatio ? `${usefulRatio}%` : '--'}
          </p>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">كفاءة المساحة</p>
          <div className="absolute top-1 left-1 group cursor-help">
            <Info size={10} className="text-gray-300" />
            <div className="absolute bottom-full left-0 z-50 mb-2 w-32 hidden group-hover:block rounded bg-gray-800 p-2 text-[8px] text-white shadow-xl leading-snug">
              نسبة مساحة الغرف الصافية إلى إجمالي مساحة الشقة. النسبة المثالية &gt; 75%
            </div>
          </div>
        </div>
      </div>

      {totalBuildArea ? (
        <div className="bg-gray-900 dark:bg-black rounded-2xl p-4 text-center shadow-xl">
          <p className="text-xl font-black text-white">
            {totalBuildArea.toFixed(1)} م²
          </p>
          <p className="text-[10px] font-black text-gray-400 mt-0.5 uppercase tracking-widest">المساحة البنائية الإجمالية</p>
          <div className="h-px bg-white/10 my-3" />
          <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
            مساحة الجدران، الممرات، والخدمات: 
            <span className="text-blue-400 mr-1">{(totalBuildArea - totalArea).toFixed(1)} م²</span>
          </p>
        </div>
      ) : null}

      {/* Per-room breakdown */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">تحليل الغرف</p>
          <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800 mx-3" />
        </div>
        
        <div className="space-y-3">
          {rooms.map(room => {
            const area = ((room.width/40) * (room.height/40));
            const pct = ((area / totalArea) * 100).toFixed(0);
            const rec = getRecommendation(room.name, area);

            return (
              <div key={room.id}
                   className="group bg-white dark:bg-gray-800 rounded-2xl p-3.5 
                              border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all hover:border-blue-200 dark:hover:border-blue-900/50">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-4 h-4 rounded-md shadow-sm border border-black/5"
                       style={{ background: room.color }} />
                  <span className="text-sm font-bold text-gray-700 
                                   dark:text-gray-200 flex-1 truncate">
                    {room.name}
                  </span>
                  <span className="text-sm font-black text-gray-900 
                                   dark:text-white">
                    {area.toFixed(1)} <span className="text-[10px] font-bold">م²</span>
                  </span>
                </div>

                {/* Progress bar showing % of total room area */}
                <div className="relative h-1.5 bg-gray-50 dark:bg-gray-900 rounded-full overflow-hidden mb-2 shadow-inner">
                  <div className="h-full rounded-full transition-all duration-700 ease-out"
                       style={{ 
                         width: `${pct}%`,
                         background: room.color || '#3b82f6'
                       }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400">{pct}% من المساحة الصافية</span>
                  {rec && (
                    <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg font-black tracking-tight
                      ${rec.type === 'success' 
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : rec.type === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                      {rec.icon}
                      {rec.msg}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {rooms.length === 0 && (
            <div className="py-8 text-center text-gray-400">
              <Calculator size={32} className="mx-auto mb-2 opacity-10" />
              <p className="text-xs font-medium">ابدأ برسم الغرف لتحليل مساحتها</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
