import { useState } from 'react';
import { ChevronDown, ChevronLeft, Layers, X, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { useFloorPlanStore } from '../store/useFloorPlanStore';
import { useFurnitureStore, type PlacedFurniture } from '../store/useFurnitureStore';

interface LayersPanelProps {
    onSelectRoom?: (roomId: string) => void;
    onSelectFurniture?: (furnitureId: string) => void;
}

export function LayersPanel({ onSelectRoom, onSelectFurniture }: LayersPanelProps) {
    const { rooms, selectedRoomId, selectRoom, toggleRoomVisibility, toggleRoomLock } = useFloorPlanStore();
    const {
        placedItems,
        furnitureLibrary,
        selectedItemId,
        removePlaced,
        selectFurniture,
    } = useFurnitureStore();

    const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({});

    // Get furniture items whose CENTER is inside a room
    const getFurnitureInRoom = (room: typeof rooms[0]): PlacedFurniture[] => {
        return placedItems.filter(item => {
            // Get the furniture data to calculate real dimensions
            const furnitureData = furnitureLibrary.find(f => f.id === item.furnitureId);
            if (!furnitureData) return false;

            const itemRealWidth = item.customWidth || furnitureData.realWidth;
            const itemRealHeight = item.customHeight || furnitureData.realHeight;

            // Convert real dimensions to pixels (40px = 1 meter)
            const itemPixelWidth = itemRealWidth * 40;
            const itemPixelHeight = itemRealHeight * 40;

            const itemCenterX = item.x + itemPixelWidth / 2;
            const itemCenterY = item.y + itemPixelHeight / 2;
            return (
                itemCenterX >= room.x &&
                itemCenterX <= room.x + room.width &&
                itemCenterY >= room.y &&
                itemCenterY <= room.y + room.height
            );
        });
    };

    // Get unassigned furniture (not inside any room)
    const getUnassignedFurniture = (): PlacedFurniture[] => {
        const assignedIds = new Set(
            rooms.flatMap(room => getFurnitureInRoom(room).map(f => f.id))
        );
        return placedItems.filter(item => !assignedIds.has(item.id));
    };

    const toggleExpand = (roomId: string) => {
        setExpandedRooms(prev => ({ ...prev, [roomId]: !prev[roomId] }));
    };

    const toggleVisibility = (roomId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        toggleRoomVisibility(roomId);
    };

    const toggleLock = (roomId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        toggleRoomLock(roomId);
    };

    const handleRoomClick = (roomId: string) => {
        selectRoom(roomId);
        onSelectRoom?.(roomId);
    };

    const handleFurnitureClick = (itemId: string) => {
        selectFurniture(itemId);
        onSelectFurniture?.(itemId);
    };

    return (
        <div className="flex flex-col h-full">

            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-2.5 
                      border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 shrink-0">
                <div className="flex items-center gap-2">
                    <Layers size={14} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        الطبقات
                    </span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-800 
                         px-2 py-0.5 rounded-full">
                    {rooms.length} غرفة
                </span>
            </div>

            {/* Layers List */}
            <div className="flex-1 overflow-y-auto">

                {rooms.length === 0 && (
                    <div className="p-6 text-center">
                        <Layers size={24} className="text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 dark:text-gray-500">لا توجد غرف بعد</p>
                    </div>
                )}

                {rooms.map((room) => {
                    const furnitureInRoom = getFurnitureInRoom(room);
                    const isExpanded = expandedRooms[room.id] ?? true;
                    const isSelected = selectedRoomId === room.id;

                    return (
                        <div key={room.id}>

                            {/* Room Row */}
                            <div
                                className={`
                  flex items-center gap-1.5 px-3 py-2 cursor-pointer
                  border-r-2 transition-colors group
                  ${isSelected
                                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500'
                                        : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                  ${room.isHidden ? 'opacity-40' : ''}
                `}
                                onClick={() => handleRoomClick(room.id)}
                            >
                                {/* Expand arrow */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleExpand(room.id); }}
                                    className="w-4 h-4 flex items-center justify-center 
                             text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 shrink-0"
                                >
                                    {furnitureInRoom.length > 0 ? (
                                        isExpanded
                                            ? <ChevronDown size={12} />
                                            : <ChevronLeft size={12} />
                                    ) : (
                                        <span className="w-3" />
                                    )}
                                </button>

                                {/* Room color dot */}
                                <div
                                    className="w-3 h-3 rounded-sm shrink-0 border border-black/10 dark:border-white/10"
                                    style={{ background: room.color }}
                                />

                                {/* Room name */}
                                <span className={`
                  flex-1 text-sm truncate
                  ${isSelected ? 'text-blue-700 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}
                `}>
                                    {room.name}
                                </span>

                                {/* Furniture count */}
                                {furnitureInRoom.length > 0 && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 
                                   px-1.5 py-0.5 rounded-full shrink-0">
                                        {furnitureInRoom.length}
                                    </span>
                                )}

                                {/* Lock toggle */}
                                <button
                                    onClick={(e) => toggleLock(room.id, e)}
                                    className={`
                                        opacity-0 group-hover:opacity-100 
                                        w-5 h-5 flex items-center justify-center
                                        transition-opacity shrink-0 mr-1
                                        ${room.isLocked ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'}
                                    `}
                                    title={room.isLocked ? 'إلغاء القفل' : 'قفل الغرفة'}
                                >
                                    {room.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                                </button>

                                {/* Visibility toggle (show on hover) */}
                                <button
                                    onClick={(e) => toggleVisibility(room.id, e)}
                                    className="opacity-0 group-hover:opacity-100 
                             w-5 h-5 flex items-center justify-center
                             text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
                             transition-opacity shrink-0"
                                >
                                    {room.isHidden
                                        ? <EyeOff size={12} />
                                        : <Eye size={12} />}
                                </button>
                            </div>

                            {/* Furniture items inside room */}
                            {isExpanded && furnitureInRoom.map((placedItem) => {
                                const furnitureData = furnitureLibrary.find(
                                    f => f.id === placedItem.furnitureId
                                );
                                const isSelectedFurniture = selectedItemId === placedItem.id;

                                // Get real dimensions
                                const realWidth = placedItem.customWidth || furnitureData?.realWidth || 1;
                                const realHeight = placedItem.customHeight || furnitureData?.realHeight || 1;

                                return (
                                    <div
                                        key={placedItem.id}
                                        className={`
                      flex items-center gap-2 px-3 py-1.5 pl-9
                      cursor-pointer group transition-colors
                      ${isSelectedFurniture
                                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}
                    `}
                                        onClick={() => handleFurnitureClick(placedItem.id)}
                                    >
                                        {/* Furniture thumbnail */}
                                        {furnitureData?.imageUrl ? (
                                            <img
                                                src={furnitureData.imageUrl}
                                                className="w-5 h-5 object-contain rounded shrink-0 
                                   bg-gray-100 dark:bg-gray-800"
                                                alt={furnitureData.name}
                                            />
                                        ) : (
                                            <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700 shrink-0" />
                                        )}

                                        {/* Furniture name */}
                                        <span className={`
                      flex-1 text-xs truncate
                      ${isSelectedFurniture
                                                ? 'text-blue-600 dark:text-blue-400 font-medium'
                                                : 'text-gray-600 dark:text-gray-400'}
                    `}>
                                            {furnitureData?.name ?? 'أثاث'}
                                        </span>

                                        {/* Dimensions */}
                                        <span className="text-xs text-gray-300 dark:text-gray-600 shrink-0 
                                     group-hover:hidden">
                                            {realWidth}×{realHeight}م
                                        </span>

                                        {/* Delete button (show on hover) */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removePlaced(placedItem.id);
                                            }}
                                            className="hidden group-hover:flex items-center justify-center
                                 w-4 h-4 rounded text-red-400 
                                 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 shrink-0"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                );
                            })}

                        </div>
                    );
                })}

                {/* Unassigned furniture section */}
                {getUnassignedFurniture().length > 0 && (
                    <div className="border-t border-dashed border-gray-200 dark:border-gray-700 mt-1">
                        <div className="px-3 py-1.5">
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                خارج الغرف ({getUnassignedFurniture().length})
                            </span>
                        </div>
                        {getUnassignedFurniture().map(placedItem => {
                            const furnitureData = furnitureLibrary.find(
                                f => f.id === placedItem.furnitureId
                            );
                            return (
                                <div
                                    key={placedItem.id}
                                    className="flex items-center gap-2 px-3 py-1.5 pl-7
                             hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer group"
                                    onClick={() => handleFurnitureClick(placedItem.id)}
                                >
                                    <div className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-700 shrink-0 
                                   flex items-center justify-center">
                                        {furnitureData?.imageUrl && (
                                            <img
                                                src={furnitureData.imageUrl}
                                                className="w-4 h-4 object-contain"
                                                alt={furnitureData.name}
                                            />
                                        )}
                                    </div>
                                    <span className="flex-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {furnitureData?.name ?? 'أثاث'}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removePlaced(placedItem.id);
                                        }}
                                        className="hidden group-hover:flex w-4 h-4 items-center 
                               justify-center text-red-400 hover:text-red-600"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </div>
    );
}