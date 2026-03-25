import { Stage, Layer, Rect } from 'react-konva';
import { useFloorPlanStore } from '../store/useFloorPlanStore';
import { useFurnitureStore } from '../store/useFurnitureStore';

interface MiniMapProps {
  width?: number;
  height?: number;
}

export default function MiniMap({ width = 180, height = 120 }: MiniMapProps) {
  const { rooms } = useFloorPlanStore();
  const { placedItems, furnitureLibrary } = useFurnitureStore();

  // Find the bounding box of all elements to center the mini-map
  const bounds = rooms.reduce(
    (acc, room) => ({
      minX: Math.min(acc.minX, room.x),
      minY: Math.min(acc.minY, room.y),
      maxX: Math.max(acc.maxX, room.x + room.width),
      maxY: Math.max(acc.maxY, room.y + room.height),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );

  const contentWidth = bounds.maxX - bounds.minX;
  const contentHeight = bounds.maxY - bounds.minY;
  
  // padding
  const padding = 20;
  const mapScale = Math.min(
    (width - padding) / (contentWidth || 1000),
    (height - padding) / (contentHeight || 800)
  );

  const offsetX = bounds.minX === Infinity ? 0 : -bounds.minX * mapScale + (width - contentWidth * mapScale) / 2;
  const offsetY = bounds.minY === Infinity ? 0 : -bounds.minY * mapScale + (height - contentHeight * mapScale) / 2;

  return (
    <div 
      className="absolute bottom-12 right-20 z-30 overflow-hidden rounded-[24px] border border-white/20 dark:border-gray-800/50 bg-white/40 dark:bg-gray-950/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-xl pointer-events-none group transition-all duration-500 hover:scale-105"
      style={{ width, height }}
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-none" />

      <div className="absolute top-2.5 left-4 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] drop-shadow-sm">
          Live Mini-Map
        </span>
      </div>
      
      <Stage width={width} height={height}>
        <Layer x={offsetX} y={offsetY} scaleX={mapScale} scaleY={mapScale}>
          {rooms.map((room) => (
            <Rect
              key={room.id}
              x={room.x}
              y={room.y}
              width={room.width}
              height={room.height}
              fill={room.color}
              stroke={room.strokeColor || '#3b82f6'}
              strokeWidth={1 / mapScale}
              opacity={0.4}
              cornerRadius={4 / mapScale}
            />
          ))}
          
          {placedItems.map((item) => {
            const libItem = furnitureLibrary.find(f => f.id === item.furnitureId);
            if (!libItem) return null;
            const w = (item.customWidth || libItem.realWidth) * 40;
            const h = (item.customHeight || libItem.realHeight) * 40;
            return (
              <Rect
                key={item.id}
                x={item.x - w/2}
                y={item.y - h/2}
                width={w}
                height={h}
                fill="#64748b"
                opacity={0.5}
                rotation={item.rotation}
                offsetX={w/2}
                offsetY={h/2}
                cornerRadius={2 / mapScale}
              />
            );
          })}
        </Layer>
      </Stage>
      
      {/* Decorative corners - Professional style */}
      <div className="absolute top-3 right-3 w-1.5 h-1.5 border-t-2 border-r-2 border-blue-500/40" />
      <div className="absolute bottom-3 left-3 w-1.5 h-1.5 border-b-2 border-l-2 border-blue-500/40" />
      
      {/* Scanning effect line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-scan" style={{ animation: 'scan 4s linear infinite' }} />
    </div>
  );
}
