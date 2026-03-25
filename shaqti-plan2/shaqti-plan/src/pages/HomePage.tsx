import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Moon,
  Sun,
  LogOut,
  FolderOpen,
  Sofa,
  Building,
  Grid3x3,
  Share2,
  Square,
  Minus,
  ImagePlus,
  Ruler,
  Trash2,
  Undo2,
  Redo2,
  Download,
  Save,
  Settings,
  Home,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Pipette,
  Ban,
} from 'lucide-react';
import { useFloorPlanStore, type FloorRoom, type FloorPlanTool } from '../store/useFloorPlanStore';
import { useFurnitureStore } from '../store/useFurnitureStore';
import { useAuthStore } from '../store/useAuthStore';
import { useMultiProjectStore } from '../store/useMultiProjectStore';
import { useSettingsStore } from '../store/useSettingsStore';
import FloorPlanCanvas, { type FloorPlanCanvasHandle } from '../components/FloorPlanCanvas';
import FurnitureLibrary from '../components/FurnitureLibrary';
import UploadFurnitureModal from '../components/UploadFurnitureModal';
import { LayersPanel } from '../components/LayersPanel';
import RoomPresetsModal from '../components/RoomPresetsModal';
import MiniMap from '../components/MiniMap';
import Toast from '../components/Toast';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useToast } from '../hooks/useToast';
import { exportToPdf } from '../utils/exportPdf';
import { exportEngineeringPdf, type ProjectInfo } from '../utils/exportEngineeringPdf';
import EngineeringExportModal from '../components/EngineeringExportModal';
import { AreaCalculator } from '../components/AreaCalculator';
import ShareModal from '../components/ShareModal';
import kashifLogo from '../KASHif logo-02.png';

const ROOM_COLOR_PALETTE = ['#dbeafe', '#dcfce7', '#fef9c3', '#fce7f3', '#ede9fe', '#ffedd5'];
const ROOM_STROKE_PALETTE = ['#3b82f6', '#22c55e', '#eab308', '#ec4899', '#8b5cf6', '#f97316'];

const TOOLBAR_ITEMS: Array<{ tool: FloorPlanTool; icon: React.ReactNode; label: string; shortcut: string }> = [
  { tool: 'select', icon: <Square size={18} className="rotate-45" />, label: 'تحديد', shortcut: 'V' },
  { tool: 'draw-room', icon: <Square size={18} />, label: 'رسم غرفة', shortcut: 'R' },
  { tool: 'draw-wall', icon: <Minus size={18} />, label: 'رسم جدار', shortcut: 'W' },
  { tool: 'ruler', icon: <Ruler size={18} />, label: 'أداة القياس', shortcut: 'M' },
];

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function HomePage() {
  const navigate = useNavigate();
  const showToast = useToast((state) => state.showToast);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const activeProjectId = useMultiProjectStore((s) => s.activeProjectId);
  const saveProjectData = useMultiProjectStore((s) => s.saveProjectData);
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  // Floor plan store
  const {
    rooms,
    selectedRoomId,
    selectedWallId,
    activeTool,
    zoomLevel,
    showMeasurements,
    history,
    future,
    setActiveTool,
    updateRoom,
    deleteRoom,
    selectRoom,
    addRoom,
    addOpening,
    removeOpening,
    updateOpening,
    undo,
    redo,
    setZoom,
    toggleMeasurements,
    toggleGrid,
    showGrid,
  } = useFloorPlanStore();

  // Furniture store
  const {
    placedItems,
    selectedFurnitureId,
    selectedItemId,
    furnitureLibrary,
    removePlaced,
    updatePlacedDimensions,
    rotateSelected,
    initializeLibrary,
  } = useFurnitureStore();

  // Refs
  const canvasRef = useRef<FloorPlanCanvasHandle>(null);
  const canvasShellRef = useRef<HTMLDivElement>(null);
  const propertiesPanelRef = useRef<HTMLDivElement>(null);
  const selectedRoomSectionRef = useRef<HTMLDivElement>(null);

  // Local state
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [activePanel, setActivePanel] = useState<'properties' | 'layers' | 'calculator'>('properties');
  const [showFurnitureLibrary, setShowFurnitureLibrary] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEngineeringExport, setShowEngineeringExport] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showRoomPresetsModal, setShowRoomPresetsModal] = useState(false);
  const [projectName, setProjectName] = useState('مشروعي الجديد');
  const [autoSaveText, setAutoSaveText] = useState('');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isCanvasFocused, setCanvasFocused] = useState(false);

  // Selected objects
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const selectedWall = useFloorPlanStore((s) => s.walls.find((w) => w.id === selectedWallId));
  const selectedFurniture = placedItems.find(
    (p) => p.id === selectedFurnitureId || p.id === selectedItemId
  );
  const selectedFurnitureLibraryItem = selectedFurniture
    ? furnitureLibrary.find((f) => f.id === selectedFurniture?.furnitureId)
    : undefined;

  // Initialize furniture library
  useEffect(() => {
    initializeLibrary();
  }, [initializeLibrary]);

  // Keyboard shortcuts
  const deleteSelected = useCallback(() => {
    if (selectedRoomId) {
      deleteRoom(selectedRoomId);
    } else if (selectedFurnitureId) {
      removePlaced(selectedFurnitureId);
    }
  }, [selectedRoomId, selectedFurnitureId, deleteRoom, removePlaced]);

  const replaceRooms = useFloorPlanStore((state) => state.replaceRooms);
  const replaceWalls = useFloorPlanStore((state) => state.replaceWalls);
  const replacePlacedItems = useFurnitureStore((state) => state.replacePlacedItems);

  // Auto-save effect
  useEffect(() => {
    if (user && activeProjectId && (rooms.length > 0 || useFloorPlanStore.getState().walls.length > 0 || placedItems.length > 0)) {
      const timer = setTimeout(() => {
        saveProjectData(user.id, activeProjectId, {
          rooms,
          walls: useFloorPlanStore.getState().walls,
          placedItems,
        });
        console.log('Auto-saved project');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [rooms, placedItems, user, activeProjectId, saveProjectData]); // Added walls to dependency array

  // Restore project data on mount if needed
  useEffect(() => {
    if (user && activeProjectId && rooms.length === 0 && useFloorPlanStore.getState().walls.length === 0 && placedItems.length === 0) {
      const projects = JSON.parse(localStorage.getItem(`shaqti_projects_${user.id}`) || '[]');
      const activeProject = projects.find((p: any) => p.id === activeProjectId);
      if (activeProject) {
        replaceRooms(activeProject.rooms || []);
        replaceWalls(activeProject.walls || []);
        replacePlacedItems(activeProject.placedItems || []);
      }
    }
  }, [user, activeProjectId, rooms.length, placedItems.length, replaceRooms, replaceWalls, replacePlacedItems]); // Added walls to dependency array

  const handleSaveProject = async () => {
    try {
      // Capture canvas thumbnail
      let thumbnail = '';
      if (canvasRef.current?.exportToPng) {
        const png = canvasRef.current.exportToPng();
        if (png) thumbnail = png;
      }

      // Build project object
      const project = {
        id: Date.now().toString(),
        name: projectName,
        thumbnail,
        rooms: useFloorPlanStore.getState().rooms,
        placedItems: useFurnitureStore.getState().placedItems,
        walls: useFloorPlanStore.getState().walls || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Load existing projects from localStorage (as requested)
      const existing = JSON.parse(
        localStorage.getItem('shaqti_projects') || '[]'
      );

      // Check if project with same name exists → update it
      const existingIndex = existing.findIndex(
        (p: any) => p.name === projectName
      );

      if (existingIndex >= 0) {
        existing[existingIndex] = {
          ...project,
          id: existing[existingIndex].id,
          createdAt: existing[existingIndex].createdAt
        };
      } else {
        existing.unshift(project); // Add to beginning
      }

      // Keep max 20 projects
      const trimmed = existing.slice(0, 20);
      localStorage.setItem('shaqti_projects', JSON.stringify(trimmed));

      setShowSaveModal(false);
      showToast('تم حفظ المشروع بنجاح ✓', 'success');
    } catch (err) {
      showToast('حدث خطأ أثناء الحفظ', 'error');
    }
  };

  const saveProject = useCallback(() => {
    setShowSaveModal(true);
  }, []);

  useEffect(() => {
    const handleSave = () => {
      saveProject();
    };
    window.addEventListener('app:save', handleSave);
    return () => window.removeEventListener('app:save', handleSave);
  }, [saveProject]);

  useKeyboardShortcuts({
    enabled: true,
    saveProject,
  });

  // Canvas resize observer
  useEffect(() => {
    if (!canvasShellRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setCanvasWidth(Math.floor(width));
      setCanvasHeight(Math.floor(height));
    });

    observer.observe(canvasShellRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setLastSaveTime(now);
      setAutoSaveText(now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate total area
  const totalArea = rooms.reduce((sum, room) => {
    return sum + (room.width / 40) * (room.height / 40);
  }, 0).toFixed(1);

  const zoomPercentage = Math.round(zoomLevel * 100);

  // Handlers
  const handleIncreaseZoom = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[currentIndex + 1]);
    } else if (currentIndex === -1) {
      setZoom(1);
    }
  };

  const handleDecreaseZoom = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
    if (currentIndex > 0) {
      setZoom(ZOOM_LEVELS[currentIndex - 1]);
    } else if (currentIndex === -1) {
      setZoom(1);
    }
  };

  const handleResetZoom = () => setZoom(1);

  const loadSampleApartment = () => {
    const sampleRooms: FloorRoom[] = [
      { id: 'room-1', name: 'غرفة المعيشة', label: 'Living Room', x: 40, y: 40, width: 200, height: 160, color: '#dbeafe', strokeColor: '#3b82f6' },
      { id: 'room-2', name: 'غرفة النوم', label: 'Bedroom', x: 260, y: 40, width: 160, height: 160, color: '#dcfce7', strokeColor: '#22c55e' },
      { id: 'room-3', name: 'المطبخ', label: 'Kitchen', x: 40, y: 220, width: 160, height: 120, color: '#fef9c3', strokeColor: '#eab308' },
    ];

    sampleRooms.forEach(room => addRoom(room));
    showToast('تم تحميل نموذج الشقة', 'success');
  };

  const handleSelectRoomPreset = (preset: any) => {
    const id = `room-${Date.now()}`;
    const x = canvasWidth / 2 - (preset.width * 40) / 2;
    const y = canvasHeight / 2 - (preset.height * 40) / 2;

    addRoom({
      id,
      name: preset.name,
      label: preset.label,
      x,
      y,
      width: preset.width * 40,
      height: preset.height * 40,
      color: preset.color,
      strokeColor: preset.strokeColor,
    });

    setShowRoomPresetsModal(false);
    selectRoom(id);
    showToast(`تم إضافة ${preset.name}`, 'success');
  };

  const handleExportPng = () => {
    const dataUrl = canvasRef.current?.exportToPng();
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = 'floor-plan.png';
      link.href = dataUrl;
      link.click();
      showToast('تم تصدير PNG', 'success');
    }
    setShowExportMenu(false);
  };

  const handleExportPdf = () => {
    const dataUrl = canvasRef.current?.exportToPng();
    if (dataUrl) {
      exportToPdf(dataUrl, rooms);
    }
    setShowExportMenu(false);
  };

  const handleExportJson = () => {
    const data = { rooms, placedItems, walls: useFloorPlanStore.getState().walls };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'floor-plan-backup.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    showToast('تم تصدير نسخة احتياطية', 'success');
    setShowExportMenu(false);
  };

  const handleEngineeringExport = async (info: ProjectInfo) => {
    const canvasImg = await canvasRef.current?.exportToPng();
    await exportEngineeringPdf(
      rooms, 
      canvasImg || '', 
      info, 
      kashifLogo
    );
    setShowEngineeringExport(false);
    showToast('تم تصدير المخطط الهندسي ✓', 'success');
  };

  const handleRotate = () => {
    if (selectedFurnitureId) {
      rotateSelected(45);
    }
  };

  const handleDuplicate = () => {
    if (selectedFurniture && selectedFurnitureLibraryItem) {
      // Use placeOnCanvas to create a duplicate
      useFurnitureStore.getState().placeOnCanvas({
        furnitureId: selectedFurniture.furnitureId,
        x: selectedFurniture.x + 40,
        y: selectedFurniture.y + 40,
        rotation: selectedFurniture.rotation,
        customWidth: selectedFurniture.customWidth,
        customHeight: selectedFurniture.customHeight,
      });
      showToast('تم تكرار القطعة', 'success');
    }
  };

  const handleWidthChange = (value: number) => {
    if (selectedFurnitureId) {
      updatePlacedDimensions(selectedFurnitureId, { customWidth: value });
    }
  };

  const handleHeightChange = (value: number) => {
    if (selectedFurnitureId) {
      updatePlacedDimensions(selectedFurnitureId, { customHeight: value });
    }
  };

  // Tool labels
  const getToolLabel = (tool: FloorPlanTool) => {
    switch (tool) {
      case 'select': return 'تحديد';
      case 'draw-room': return 'رسم غرفة';
      case 'draw-wall': return 'رسم جدار';
      case 'ruler': return 'أداة القياس';
      default: return tool;
    }
  };

  return (
    <div dir="rtl" className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* ==================== NAVBAR ==================== */}
      <header className="fixed inset-x-0 top-0 z-40 h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex h-full items-center justify-between px-4">
          {/* Right Section (RTL) */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gray-800 to-blue-800">
              <img src={kashifLogo} alt="الكاشف" className="h-6 w-auto object-contain" />
            </div>
            <div className="h-5 w-px bg-gray-200 dark:bg-gray-600" />
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              <FolderOpen size={14} />
              مشاريعي
            </button>
            {user && (
              <span className="text-xs text-gray-400 dark:text-gray-500">مرحباً، {user.name}</span>
            )}
          </div>

          {/* Center - Active Tool */}
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-blue-50 dark:bg-blue-900/40 px-4 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700">
              {getToolLabel(activeTool)}
            </div>
          </div>

          {/* Left Section */}
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={history.length === 0}
              className="btn-press flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={redo}
              disabled={future.length === 0}
              className="btn-press flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
            >
              <Redo2 size={18} />
            </button>

            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Share button */}
            <button 
              onClick={() => setShowShareModal(true)}
              className="btn-press flex h-8 items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 px-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-all font-cairo"
            >
              <Share2 size={15} />
              <span>مشاركة</span>
            </button>

            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

            {/* Export dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="btn-press flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm text-gray-600 hover:bg-gray-100"
              >
                <Download size={16} />
                <span>تصدير</span>
              </button>

              {showExportMenu && (
                <div className="absolute left-0 top-full mt-1 w-40 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 shadow-lg">
                  <button
                    onClick={handleExportPng}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    PNG
                  </button>
                  <button
                    onClick={handleExportPdf}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    PDF عادي
                  </button>
                  <button
                    onClick={() => {
                      setShowEngineeringExport(true);
                      setShowExportMenu(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-blue-600 font-bold hover:bg-blue-50 transition-colors"
                  >
                    📐 تصدير هندسي (PDF)
                  </button>
                  <button
                    onClick={handleExportJson}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    نسخة احتياطية
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowSaveModal(true)}
              className="btn-press flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Save size={16} />
              <span>حفظ</span>
            </button>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="btn-press flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => navigate('/settings')}
              className="btn-press flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Settings size={18} />
            </button>

            <button
              onClick={() => { logout(); navigate('/login', { replace: true }); }}
              className="btn-press flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500"
              title="تسجيل الخروج"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="mt-14 flex flex-1 overflow-hidden">

        {/* ==================== TOOLBAR ==================== */}
        <aside className="w-14 flex flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex flex-col items-center gap-1 p-2">
            {/* Group 1: Tools */}
            {TOOLBAR_ITEMS.map((item) => (
              <button
                key={item.tool}
                onClick={() => setActiveTool(item.tool)}
                className={`btn-press group relative flex h-9 w-9 items-center justify-center rounded-lg ${activeTool === item.tool
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
                title={`${item.label} (${item.shortcut})`}
              >
                {item.icon}
                {/* Tooltip */}
                <div className="absolute left-full top-1/2 z-50 ml-2 hidden -translate-y-1/2 items-center gap-1 rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:flex">
                  <span>{item.label}</span>
                  <span className="text-gray-400">({item.shortcut})</span>
                </div>
              </button>
            ))}

            <button
              onClick={() => setShowRoomPresetsModal(true)}
              className="btn-press group relative flex h-9 w-9 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 ring-1 ring-blue-100 mt-1"
              title="قوالب الغرف"
            >
              <Building size={18} />
              <div className="absolute left-full top-1/2 z-50 ml-2 hidden -translate-y-1/2 items-center gap-1 rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:flex">
                <span>قوالب الغرف</span>
              </div>
            </button>

            <div className="my-1 h-px w-8 bg-gray-200" />

            {/* Group 2: Furniture */}
            <button
              onClick={() => setShowFurnitureLibrary(true)}
              className="btn-press group relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50"
              title="مكتبة الأثاث"
            >
              <Sofa size={18} />
              <div className="absolute left-full top-1/2 z-50 ml-2 hidden -translate-y-1/2 items-center gap-1 rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:flex">
                <span>مكتبة الأثاث</span>
              </div>
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-press group relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50"
              title="رفع أثاث"
            >
              <ImagePlus size={18} />
              <div className="absolute left-full top-1/2 z-50 ml-2 hidden -translate-y-1/2 items-center gap-1 rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:flex">
                <span>رفع أثاث</span>
              </div>
            </button>

            <div className="my-1 h-px w-8 bg-gray-200" />

            {/* Group 3: Actions */}
            <button
              onClick={toggleMeasurements}
              className={`btn-press group relative flex h-9 w-9 items-center justify-center rounded-lg ${showMeasurements ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                }`}
              title="إظهار القياسات"
            >
              <Ruler size={18} />
              <div className="absolute left-full top-1/2 z-50 ml-2 hidden -translate-y-1/2 items-center gap-1 rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:flex">
                <span>إظهار القياسات</span>
              </div>
            </button>

            <button
              onClick={toggleGrid}
              className={`btn-press group relative flex h-9 w-9 items-center justify-center rounded-lg ${showGrid ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                }`}
              title="إظهار الشبكة"
            >
              <Grid3x3 size={18} />
              <div className="absolute left-full top-1/2 z-50 ml-2 hidden -translate-y-1/2 items-center gap-1 rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:flex">
                <span>إظهار الشبكة</span>
              </div>
            </button>

            <button
              onClick={deleteSelected}
              className="btn-press group relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50 hover:text-red-500"
              title="حذف المحدد"
            >
              <Trash2 size={18} />
              <div className="absolute left-full top-1/2 z-50 ml-2 hidden -translate-y-1/2 items-center gap-1 rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:flex">
                <span>حذف المحدد</span>
                <span className="text-gray-400">(Del)</span>
              </div>
            </button>
          </div>
        </aside>

        {/* ==================== CANVAS AREA ==================== */}
        <main className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-950">
          <div
            ref={canvasShellRef}
            className="relative h-full w-full"
            tabIndex={0}
            onMouseDownCapture={() => canvasShellRef.current?.focus()}
            onFocus={() => setCanvasFocused(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setCanvasFocused(false);
              }
            }}
          >
            {rooms.length === 0 && activeTool === 'select' && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50/95 dark:bg-slate-950/95 text-center px-4">
                <div className="mb-6 rounded-full bg-blue-50 dark:bg-blue-900/20 p-8">
                  <Square className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="mb-3 text-2xl font-bold text-gray-800 dark:text-gray-100">ابدأ بتصميم شقتك</h2>
                <p className="mb-8 max-w-sm text-gray-500 dark:text-gray-400">
                  اختر أداة رسم الغرفة من شريط الأدوات أو انقر على الزر أدناه للبدء فوراً
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => {
                      setActiveTool('draw-room');
                      canvasShellRef.current?.focus();
                    }}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:bg-blue-700 hover:scale-105 active:scale-95"
                  >
                    <Plus size={18} />
                    ابدأ الرسم الآن
                  </button>
                  <button
                    onClick={loadSampleApartment}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-8 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <FolderOpen size={18} />
                    تحميل نموذج عينة
                  </button>
                </div>
              </div>
            )}

            <div
              className={`relative h-full w-full bg-gray-50 dark:bg-gray-950 p-4 outline-none ${isCanvasFocused ? 'ring-2 ring-inset ring-blue-500/20' : ''
                }`}
            >
              <FloorPlanCanvas ref={canvasRef} />
            </div>
          </div>
        </main>

        {/* ==================== SIDE PANEL ==================== */}
        <aside className="w-64 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950">
          {/* Tab Switcher */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 shrink-0">
            <button
              onClick={() => setActivePanel('properties')}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activePanel === 'properties'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
            >
              الخصائص
            </button>
            <button
              onClick={() => setActivePanel('layers')}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activePanel === 'layers'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
            >
              الطبقات
            </button>
            <button
              onClick={() => setActivePanel('calculator')}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activePanel === 'calculator'
                ? 'text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
            >
              الحاسبة
            </button>
          </div>

          {/* Panel Content */}
          <div ref={propertiesPanelRef} className="flex-1 overflow-y-auto p-4">
            {activePanel === 'layers' ? (
              <LayersPanel
                onSelectRoom={() => setActivePanel('properties')}
                onSelectFurniture={() => setActivePanel('properties')}
              />
            ) : activePanel === 'calculator' ? (
              <AreaCalculator rooms={rooms} />
            ) : (
              <>
                {/* Section Header */}
                <h2 className="mb-4 px-1 text-sm font-semibold text-gray-700 dark:text-gray-300">الخصائص</h2>

                {/* Empty State */}
                {!selectedRoom && !selectedWall && !selectedFurniture && (
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
                    <Home className="h-12 w-12 text-gray-200 dark:text-gray-800" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">لا يوجد تحديد</p>
                    <p className="text-xs text-gray-300 dark:text-gray-600">اختر غرفة أو أثاثاً لعرض خصائصه</p>
                  </div>
                )}

                {/* Room Properties */}
                {selectedRoom && (
                  <div ref={selectedRoomSectionRef} className="space-y-4">
                    {/* Room Name */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">اسم الغرفة</label>
                      <input
                        type="text"
                        value={selectedRoom.name}
                        onChange={(e) => updateRoom(selectedRoom.id, { name: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:ring-1 focus:ring-blue-500 outline-none transition"
                      />
                    </div>

                    {/* Dimensions */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-600">الأبعاد (متر)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="mb-1 block text-[11px] text-gray-500">العرض (م)</label>
                          <input
                            type="number"
                            min="0.5"
                            max="50"
                            step="0.1"
                            value={Number((selectedRoom.width / 40).toFixed(2))}
                            onChange={(e) => {
                              const meters = parseFloat(e.target.value);
                              if (!isNaN(meters) && meters >= 0.1) {
                                useFloorPlanStore.getState().snapshot();
                                updateRoom(selectedRoom.id, {
                                  width: Math.round(meters * 40),
                                });
                              }
                            }}
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] text-gray-500">الارتفاع (م)</label>
                          <input
                            type="number"
                            min="0.1"
                            max="50"
                            step="0.1"
                            value={Number((selectedRoom.height / 40).toFixed(2))}
                            onChange={(e) => {
                              const meters = parseFloat(e.target.value);
                              if (!isNaN(meters) && meters >= 0.1) {
                                useFloorPlanStore.getState().snapshot();
                                updateRoom(selectedRoom.id, {
                                  height: Math.round(meters * 40),
                                });
                              }
                            }}
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Colors */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">لون التعبئة</label>
                      <div className="flex flex-wrap gap-1.5">
                        {/* Transparency Option */}
                        <button
                          onClick={() => updateRoom(selectedRoom.id, { color: 'transparent' })}
                          className={`h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all ${selectedRoom.color === 'transparent' ? 'border-blue-500 scale-110 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                          title="شفاف (بلا لون)"
                        >
                          <Ban size={12} className="text-gray-400" />
                        </button>

                        {ROOM_COLOR_PALETTE.map((color) => (
                          <button
                            key={color}
                            onClick={() => updateRoom(selectedRoom.id, { color })}
                            className={`h-6 w-6 rounded-md border-2 transition-all ${selectedRoom.color === color ? 'border-blue-500 scale-110 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                              }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}

                        {/* Custom Color Picker */}
                        <div className="relative h-6 w-6">
                          <button
                            className="h-6 w-6 rounded-md border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-blue-400 transition-all bg-white dark:bg-gray-800"
                            title="لون مخصص"
                            onClick={() => document.getElementById('room-fill-picker')?.click()}
                          >
                            <Pipette size={12} className="text-blue-500" />
                          </button>
                          <input
                            id="room-fill-picker"
                            type="color"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            value={selectedRoom.color?.startsWith('#') ? selectedRoom.color : '#ffffff'}
                            onChange={(e) => updateRoom(selectedRoom.id, { color: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">لون الحدود</label>
                      <div className="flex flex-wrap gap-1.5">
                        {/* Transparency Option for Stroke */}
                        <button
                          onClick={() => updateRoom(selectedRoom.id, { strokeColor: 'transparent' })}
                          className={`h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all ${selectedRoom.strokeColor === 'transparent' ? 'border-blue-500 scale-110 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                          title="حدود شفافة"
                        >
                          <Ban size={12} className="text-gray-400" />
                        </button>

                        {ROOM_STROKE_PALETTE.map((color) => (
                          <button
                            key={color}
                            onClick={() => updateRoom(selectedRoom.id, { strokeColor: color })}
                            className={`h-6 w-6 rounded-md border-2 transition-all ${selectedRoom.strokeColor === color ? 'border-blue-500 scale-110 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                              }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}

                        {/* Custom Stroke Picker */}
                        <div className="relative h-6 w-6">
                          <button
                            className="h-6 w-6 rounded-md border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-blue-400 transition-all bg-white dark:bg-gray-800"
                            title="لون حدود مخصص"
                            onClick={() => document.getElementById('room-stroke-picker')?.click()}
                          >
                            <Pipette size={12} className="text-blue-500" />
                          </button>
                          <input
                            id="room-stroke-picker"
                            type="color"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            value={selectedRoom.strokeColor?.startsWith('#') ? selectedRoom.strokeColor : '#000000'}
                            onChange={(e) => updateRoom(selectedRoom.id, { strokeColor: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Openings Section */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">الفتحات (أبواب/نوافذ)</label>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => addOpening(selectedRoom.id, { type: 'door', side: 'top', position: 20, width: 40 })}
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded text-[10px] font-bold border border-red-100"
                          >
                            + باب
                          </button>
                          <button
                            type="button"
                            onClick={() => addOpening(selectedRoom.id, { type: 'window', side: 'top', position: 80, width: 60 })}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded text-[10px] font-bold border border-blue-100"
                          >
                            + شباك
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {(selectedRoom.openings ?? []).map((opening) => (
                          <div key={opening.id} className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                {opening.type === 'door' ? '🚪 باب' : '🪟 شباك'} -
                                {opening.side === 'top' ? 'أعلى' : opening.side === 'bottom' ? 'أسفل' : opening.side === 'left' ? 'يسار' : 'يمين'}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeOpening(selectedRoom.id, opening.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] text-gray-400 dark:text-gray-500 mb-1">الموضع</label>
                                <input
                                  type="range"
                                  min="0"
                                  max={(opening.side === 'top' || opening.side === 'bottom' ? selectedRoom.width : selectedRoom.height) - opening.width}
                                  value={opening.position}
                                  onChange={(e) => updateOpening(selectedRoom.id, opening.id, { position: parseInt(e.target.value) })}
                                  className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-gray-400 dark:text-gray-500 mb-1">الجانب</label>
                                <select
                                  value={opening.side}
                                  onChange={(e) => updateOpening(selectedRoom.id, opening.id, { side: e.target.value as any })}
                                  className="w-full text-[10px] border-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded shadow-sm focus:ring-1 focus:ring-blue-500 py-1"
                                >
                                  <option value="top">أعلى</option>
                                  <option value="bottom">أسفل</option>
                                  <option value="left">يسار</option>
                                  <option value="right">يمين</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <label className="text-[9px] text-gray-400">العرض:</label>
                              <input
                                type="number"
                                step="0.05"
                                min="0.1"
                                max="5"
                                value={opening.width / 40}
                                onChange={(e) => updateOpening(selectedRoom.id, opening.id, { width: Math.round(parseFloat(e.target.value) * 40) || 20 })}
                                className="w-16 text-[10px] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-1"
                              />
                              <span className="text-[9px] text-gray-400">متر</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delete Room */}
                    <button
                      type="button"
                      onClick={() => deleteRoom(selectedRoom.id)}
                      className="btn-press w-full rounded-lg border border-danger/30 px-3 py-2 text-sm font-medium text-danger transition hover:bg-danger/5 mt-4"
                    >
                      حذف الغرفة
                    </button>
                  </div>
                )}

                {/* Furniture Properties */}
                {selectedFurniture && selectedFurnitureLibraryItem && (
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">اسم القطعة</label>
                      <input
                        readOnly
                        value={selectedFurnitureLibraryItem.name}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm text-gray-500 dark:text-gray-400"
                      />
                    </div>

                    {/* Dimensions */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">الأبعاد (متر)</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="mb-1 block text-[11px] text-gray-500 dark:text-gray-600">العرض</label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const currentWidth = selectedFurniture.customWidth ?? selectedFurnitureLibraryItem.realWidth;
                                handleWidthChange(Math.max(0.1, Number((currentWidth - 0.1).toFixed(2))));
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="0.1"
                              max="10"
                              step="0.05"
                              value={Number((selectedFurniture.customWidth ?? selectedFurnitureLibraryItem.realWidth).toFixed(2))}
                              onChange={(e) => handleWidthChange(parseFloat(e.target.value) || 0.1)}
                              className="min-w-0 flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-2 text-center text-sm text-gray-800 dark:text-gray-100"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const currentWidth = selectedFurniture.customWidth ?? selectedFurnitureLibraryItem.realWidth;
                                handleWidthChange(Math.min(10, Number((currentWidth + 0.1).toFixed(2))));
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] text-gray-500 dark:text-gray-600">الارتفاع</label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const currentHeight = selectedFurniture.customHeight ?? selectedFurnitureLibraryItem.realHeight;
                                handleHeightChange(Math.max(0.1, Number((currentHeight - 0.1).toFixed(2))));
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="0.1"
                              max="10"
                              step="0.05"
                              value={Number((selectedFurniture.customHeight ?? selectedFurnitureLibraryItem.realHeight).toFixed(2))}
                              onChange={(e) => handleHeightChange(parseFloat(e.target.value) || 0.1)}
                              className="min-w-0 flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-2 text-center text-sm text-gray-800 dark:text-gray-100"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const currentHeight = selectedFurniture.customHeight ?? selectedFurnitureLibraryItem.realHeight;
                                handleHeightChange(Math.min(10, Number((currentHeight + 0.1).toFixed(2))));
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rotation */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-600">الدوران</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {selectedFurniture.rotation}°
                        </span>
                        <button
                          type="button"
                          onClick={handleRotate}
                          className="btn-press flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                        >
                          <RotateCw size={12} />
                          تدوير 45°
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleDuplicate}
                        className="btn-press flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        تكرار
                      </button>
                      <button
                        type="button"
                        onClick={() => removePlaced(selectedFurniture.id)}
                        className="btn-press flex-1 rounded-lg border border-red-200 dark:border-red-900 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </aside>
      </div>

      {/* ==================== STATUS BAR ==================== */}
      <footer className="fixed inset-x-0 bottom-0 z-40 flex h-8 items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <span>الغرف: {rooms.length}</span>
          <span>المساحة الكلية: {totalArea} م²</span>
          {lastSaveTime && (
            <span className="text-gray-400 dark:text-gray-600 border-r border-gray-200 dark:border-gray-700 pr-4">
              آخر حفظ: {autoSaveText}
            </span>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleDecreaseZoom}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ZoomOut size={12} />
          </button>
          <button
            onClick={handleResetZoom}
            className="min-w-[40px] px-1 text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {zoomPercentage}%
          </button>
          <button
            onClick={handleIncreaseZoom}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ZoomIn size={12} />
          </button>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-4">
          <button
            onClick={toggleGrid}
            className={`flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-medium transition-colors ${showGrid
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            title="إظهار/إخفاء الشبكة"
          >
            <Grid3x3 size={12} />
            <span>الشبكة</span>
          </button>
          <button
            onClick={toggleMeasurements}
            className={`flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-medium transition-colors ${showMeasurements
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            title="إظهار/إخفاء القياسات"
          >
            <Ruler size={12} />
            <span>القياسات</span>
          </button>
        </div>

        <div className="text-gray-400 dark:text-gray-600">
          © {new Date().getFullYear()} الكاشف
        </div>
      </footer>

      {/* ==================== MODALS ==================== */}
      <FurnitureLibrary
        open={showFurnitureLibrary}
        onClose={() => setShowFurnitureLibrary(false)}
        onQuickPlace={(itemId) => {
          const center = { x: 400, y: 300 }; // Default center
          useFurnitureStore.getState().placeOnCanvas({
            furnitureId: itemId,
            x: center.x,
            y: center.y,
            rotation: 0,
          });
          setShowFurnitureLibrary(false);
          setActiveTool('select');
          showToast('تم إضافة قطعة الأثاث', 'success');
        }}
      />

      <UploadFurnitureModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          setShowUploadModal(false);
          showToast('تم رفع الأثاث بنجاح', 'success');
        }}
      />

      <EngineeringExportModal
        isOpen={showEngineeringExport}
        onClose={() => setShowEngineeringExport(false)}
        onExport={handleEngineeringExport}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        rooms={rooms}
        placedItems={placedItems}
        projectName={projectName}
        canvasRef={canvasRef}
      />

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSaveModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-7 w-full max-w-sm border border-gray-100 dark:border-gray-700 scale-in-center">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              حفظ المشروع
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium">
              أدخل اسماً لمشروعك للعودة إليه لاحقاً بسهولة
            </p>

            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">
              اسم المشروع
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="مثال: شقة النزهة"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all mb-6"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveProject()}
            />

            <div className="flex gap-3">
              <button
                onClick={handleSaveProject}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
              >
                حفظ المشروع
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <RoomPresetsModal
        isOpen={showRoomPresetsModal}
        onClose={() => setShowRoomPresetsModal(false)}
        onSelect={handleSelectRoomPreset}
      />

      <MiniMap />

      <Toast />
    </div>
  );
}
