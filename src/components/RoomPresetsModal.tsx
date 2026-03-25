import React from 'react';
import { X, Bed, Sofa, ChefHat, Bath, Briefcase, Trees, LayoutGrid, Plus } from 'lucide-react';

interface RoomPreset {
  id: string;
  name: string;
  label: string;
  width: number; // meters
  height: number; // meters
  color: string;
  strokeColor: string;
  icon: React.ReactNode;
}

const ROOM_PRESETS: RoomPreset[] = [
  {
    id: 'living-room',
    name: 'غرفة معيشة',
    label: 'Living Room',
    width: 6,
    height: 5,
    color: '#dbeafe',
    strokeColor: '#3b82f6',
    icon: <Sofa size={20} />,
  },
  {
    id: 'bedroom',
    name: 'غرفة نوم',
    label: 'Bedroom',
    width: 5,
    height: 4,
    color: '#dcfce7',
    strokeColor: '#22c55e',
    icon: <Bed size={20} />,
  },
  {
    id: 'kitchen',
    name: 'مطبخ',
    label: 'Kitchen',
    width: 4,
    height: 3,
    color: '#fef9c3',
    strokeColor: '#eab308',
    icon: <ChefHat size={20} />,
  },
  {
    id: 'bathroom',
    name: 'حمام',
    label: 'Bathroom',
    width: 3,
    height: 2.5,
    color: '#fce7f3',
    strokeColor: '#ec4899',
    icon: <Bath size={20} />,
  },
  {
    id: 'office',
    name: 'مكتب',
    label: 'Office',
    width: 4,
    height: 3.5,
    color: '#ede9fe',
    strokeColor: '#8b5cf6',
    icon: <Briefcase size={20} />,
  },
  {
    id: 'outdoor',
    name: 'شرفة/مساحة خارجية',
    label: 'Balcony',
    width: 4,
    height: 2,
    color: '#ffedd5',
    strokeColor: '#f97316',
    icon: <Trees size={20} />,
  },
];

interface RoomPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (preset: RoomPreset) => void;
}

export default function RoomPresetsModal({ isOpen, onClose, onSelect }: RoomPresetsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-2xl transition-all border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <LayoutGrid size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">قوالب الغرف الجاهزة</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">اختر نوع الغرفة لإضافتها فوراً بمقاسات قياسية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROOM_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelect(preset)}
                className="group relative flex flex-col gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 p-5 text-right transition-all hover:border-blue-500 hover:bg-blue-50/10 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 active:scale-[0.98]"
              >
                <div 
                  className="flex h-12 w-12 items-center justify-center rounded-xl transition-colors border shadow-sm"
                  style={{ backgroundColor: preset.color, borderColor: preset.strokeColor, color: preset.strokeColor }}
                >
                  {preset.icon}
                </div>
                
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {preset.name}
                  </h4>
                  <div className="mt-1 flex items-center justify-end gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <span>{preset.width}م × {preset.height}م</span>
                    <span className="opacity-30">•</span>
                    <span>{(preset.width * preset.height).toFixed(1)} م²</span>
                  </div>
                </div>

                <div className="absolute top-4 left-4 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Plus size={14} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
