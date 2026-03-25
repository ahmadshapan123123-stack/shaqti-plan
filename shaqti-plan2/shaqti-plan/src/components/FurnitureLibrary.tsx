import {
  Search,
  Upload,
  X,
  LayoutGrid,
  Bed,
  Lamp,
  Utensils,
  Home,
  Briefcase,
  Trees,
  Palmtree,
  DoorOpen
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  FURNITURE_CATEGORY_LABELS,
  FURNITURE_CATEGORIES,
} from '../constants/furnitureCategories';
import { useToast } from '../hooks/useToast';
import { useFurnitureStore, type FurnitureItem } from '../store/useFurnitureStore';
import UploadFurnitureModal from './UploadFurnitureModal';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  all: <LayoutGrid size={16} />,
  'living room': <Home size={16} />,
  bedroom: <Bed size={16} />,
  kitchen: <Utensils size={16} />,
  bathroom: <Lamp size={16} />,
  office: <Briefcase size={16} />,
  outdoor: <Trees size={16} />,
  decor: <Palmtree size={16} />,
  'doors windows': <DoorOpen size={16} />,
};

type Props = {
  open: boolean;
  onClose: () => void;
  onQuickPlace?: (itemId: string) => void;
};

export const FurnitureLibrary = ({ open, onClose, onQuickPlace }: Props) => {
  const furnitureLibrary = useFurnitureStore((state) => state.furnitureLibrary);
  const showToast = useToast((state) => state.showToast);
  const [activeCategory, setActiveCategory] = useState<'all' | FurnitureItem['category']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  // Group items by category to count them
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: furnitureLibrary.length };
    FURNITURE_CATEGORIES.forEach(cat => {
      counts[cat] = furnitureLibrary.filter(item => item.category === cat).length;
    });
    return counts;
  }, [furnitureLibrary]);

  const filteredFurniture = useMemo(() => {
    return furnitureLibrary.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, furnitureLibrary, searchTerm]);

  const CATEGORY_FILTERS: Array<{ key: 'all' | FurnitureItem['category']; label: string; icon: React.ReactNode }> = [
    { key: 'all', label: 'الكل', icon: CATEGORY_ICONS.all },
    ...FURNITURE_CATEGORIES.map((category) => ({
      key: category,
      label: FURNITURE_CATEGORY_LABELS[category],
      icon: CATEGORY_ICONS[category],
    })),
  ];

  if (!open) return null;

  return (
    <>
      <div role="dialog" aria-modal className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />

        {/* Modal Content */}
        <div className="relative flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white dark:bg-gray-950 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 animate-in fade-in zoom-in duration-300">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-8 py-4 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-md">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                مكتبة الأثاث
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">تصفح وأضف الأثاث لمشروعك</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 px-4 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 transition-all hover:bg-blue-100 dark:hover:bg-blue-800/50"
              >
                <Upload size={16} />
                <span className="hidden sm:inline">رفع أثاث</span>
              </button>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Categories */}
            <div className="w-64 flex-shrink-0 border-l border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 overflow-y-auto p-4 custom-scrollbar">
              <div className="space-y-1">
                {CATEGORY_FILTERS.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveCategory(filter.key)}
                    className={`
                      w-full flex items-center justify-between group rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200
                      ${activeCategory === filter.key
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 translate-x-1'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className={activeCategory === filter.key ? 'text-white' : 'text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform'}>
                        {filter.icon}
                      </span>
                      {filter.label}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeCategory === filter.key ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                      {categoryCounts[filter.key] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-950">
              {/* Toolbar */}
              <div className="border-b border-gray-100 dark:border-gray-800 p-4 sm:p-6 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="search"
                    placeholder="ابحث بالاسم أو النوع..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-2xl border-none bg-gray-100 dark:bg-gray-900 py-3 pr-12 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Grid Area */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredFurniture.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('furnitureId', item.id);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      className="group relative flex flex-col rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1"
                    >
                      <div className="aspect-square relative flex items-center justify-center rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 p-4 transition-colors group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/20">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="max-h-full max-w-full drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 dark:bg-black/10 backdrop-blur-[1px] rounded-2xl">
                          <button
                            onClick={() => onQuickPlace?.(item.id)}
                            className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                          >
                            إضافة سريعة
                          </button>
                        </div>
                      </div>

                      <div className="p-3">
                        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{item.name}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                            {item.realWidth}م × {item.realHeight}م
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            {FURNITURE_CATEGORY_LABELS[item.category as keyof typeof FURNITURE_CATEGORY_LABELS] || item.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredFurniture.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-20 w-20 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-4">
                      <Search size={32} className="text-gray-300 dark:text-gray-700" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-700 dark:text-gray-300">لم يتم العثور على نتائج</h4>
                    <p className="text-sm text-gray-400 mt-1">جرب البحث بكلمات مختلفة أو تغيير الفئة</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showUpload && (
        <UploadFurnitureModal
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false);
            showToast('تم إضافة الأثاث للمكتبة ✓', 'success');
          }}
        />
      )}
    </>
  );
};

export default FurnitureLibrary;
