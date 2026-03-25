import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  FolderOpen, 
  Trash2, 
  Layout, 
  ChevronLeft,
  Home,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useFloorPlanStore } from '../store/useFloorPlanStore';
import { useFurnitureStore } from '../store/useFurnitureStore';
import kashifLogo from '../KASHif logo-02.png';
import { useState, useEffect } from 'react';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { setRooms, setWalls } = useFloorPlanStore();
  const { setPlacedItems } = useFurnitureStore();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('shaqti_projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading projects', e);
      }
    }
  }, []);

  const handleLoadProject = (project: any) => {
    setRooms(project.rooms || []);
    setWalls(project.walls || []);
    setPlacedItems(project.placedItems || []);
    navigate('/');
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      localStorage.setItem('shaqti_projects', JSON.stringify(updated));
    }
  };

  const handleCreateNew = () => {
    setRooms([]);
    setWalls([]);
    setPlacedItems([]);
    navigate('/');
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-cairo">
      {/* Header */}
      <header className="h-20 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-gray-900/80">
        <div className="flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-800 to-blue-800 shadow-lg shadow-blue-900/20">
            <img src={kashifLogo} alt="الكاشف" className="h-8 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">مشاريعي</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">إدارة تصاميمك المحفوظة</p>
          </div>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-blue-500/25 active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          مشروع جديد
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {projects.length === 0 ? (
          <div className="h-[65vh] flex flex-col items-center justify-center text-center">
            <div className="w-32 h-32 bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl flex items-center justify-center mb-8 border border-gray-100 dark:border-gray-800">
              <FolderOpen size={56} className="text-blue-500 opacity-20" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">لا توجد مشاريع حتى الآن</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-10 leading-relaxed">
              لم تقم بحفظ أي تصاميم بعد. ابدأ رحلتك الإبداعية الآن وقم بتصميم شقتك المثالية.
            </p>
            <button
              onClick={handleCreateNew}
              className="px-10 py-4 bg-white dark:bg-gray-900 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-3xl font-black hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95"
            >
              ابدأ الرسم الآن
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
            {projects.map((project) => (
              <div 
                key={project.id}
                className="group relative bg-white dark:bg-gray-900 rounded-[32px] border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)] transition-all duration-500 hover:-translate-y-2"
              >
                {/* Thumbnail */}
                <div 
                  className="aspect-[16/10] w-full bg-gray-50 dark:bg-black/20 relative overflow-hidden cursor-pointer"
                  onClick={() => handleLoadProject(project)}
                >
                  {project.thumbnail ? (
                    <img src={project.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={project.name} />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-700">
                      <Layout size={64} strokeWidth={1} className="mb-2 opacity-50" />
                      <span className="text-xs font-bold uppercase tracking-widest opacity-30">No Preview</span>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors duration-500 flex items-center justify-center">
                     <div className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300">
                        <ArrowRight size={20} className="text-blue-600" />
                     </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 
                      className="text-xl font-bold text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 transition"
                      onClick={() => handleLoadProject(project)}
                    >
                      {project.name}
                    </h3>
                    <button 
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-90"
                      title="حذف المشروع"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex flex-col gap-1 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        <Clock size={12} />
                        تاريخ التعديل
                      </div>
                      <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate">
                        {formatDate(project.updatedAt)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        <Layout size={12} />
                        العناصر
                      </div>
                      <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                        {project.rooms?.length || 0} غرف / {project.placedItems?.length || 0} أثاث
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLoadProject(project)}
                    className="w-full py-4 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 group/btn"
                  >
                    فتح المشروع وتعديله
                    <ChevronLeft size={18} className="translate-x-0 group-hover/btn:-translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Navigation */}
      <footer className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
         <button 
           onClick={() => navigate('/')}
           className="mx-auto flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors group"
         >
           <Home size={18} />
           <span>العودة للوحة الرسم</span>
           <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700 group-hover:bg-blue-500 transition-colors" />
         </button>
      </footer>
    </div>
  );
}
