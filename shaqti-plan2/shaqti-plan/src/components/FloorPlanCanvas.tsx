import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  Fragment,
} from 'react';
import { Circle, Image as KonvaImage, Layer, Line, Rect, Stage, Text, Transformer } from 'react-konva';
import type Konva from 'konva';
import {
  useFurnitureStore,
  type FurnitureItem,
  type PlacedFurniture,
} from '../store/useFurnitureStore';
import { useFloorPlanStore, type FloorPlanTool, type FloorRoom, type Wall } from '../store/useFloorPlanStore';
import { useSettingsStore } from '../store/useSettingsStore';

const GRID_SPACING = 10;
const METER_SPACING = 40;
const MIN_ROOM_SIZE = 40;
const RULER_SIZE = 30;
const WALL_THICKNESS = 10;
const ROOM_COLOR_PALETTE = ['#dbeafe', '#dcfce7', '#fef9c3', '#fce7f3', '#ede9fe', '#ffedd5'];

export type FloorPlanCanvasHandle = {
  exportToPng: () => string | null;
};

type DraftRoom = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type DraftWall = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type ContextMenuState = {
  x: number;
  y: number;
  type: 'furniture' | 'wall';
  targetId: string;
} | null;

type EditingRoomState = {
  id: string;
  value: string;
  left: number;
  top: number;
  width: number;
} | null;

const snapToGrid = (value: number) => Math.round(value / GRID_SPACING) * GRID_SPACING;

const SNAP_THRESHOLD = 8;
const snapToAlignment = (value: number, type: 'x' | 'y', rooms: FloorRoom[], excludeId?: string) => {
  for (const room of rooms) {
    if (room.id === excludeId) continue;
    
    const edges = type === 'x' 
      ? [room.x, room.x + room.width, room.x + room.width / 2]
      : [room.y, room.y + room.height, room.y + room.height / 2];
      
    for (const edge of edges) {
      if (Math.abs(value - edge) < SNAP_THRESHOLD) {
        return edge;
      }
    }
  }
  return snapToGrid(value);
};

const findRoomAtPoint = (x: number, y: number, rooms: FloorRoom[]) => {
  return rooms.find(
    (room) =>
      x >= room.x &&
      x <= room.x + room.width &&
      y >= room.y &&
      y <= room.y + room.height
  );
};

const useCanvasImage = (src: string) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) {
      setImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImage(img);
    img.onerror = () => setImage(null);
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return image;
};

const FurnitureNode = ({
  item,
  libraryItem,
  activeTool,
  onSelect,
  onDragEnd,
  onTransformEnd,
  onContextMenu,
  nodeRef,
  isDark,
}: {
  item: PlacedFurniture;
  libraryItem: FurnitureItem;
  isSelected?: boolean;
  activeTool?: FloorPlanTool;
  onSelect: () => void;
  onDragEnd: (item: PlacedFurniture, node: Konva.Image) => void;
  onTransformEnd: (item: PlacedFurniture, node: Konva.Image) => void;
  onContextMenu: (event: Konva.KonvaEventObject<PointerEvent>, item: PlacedFurniture) => void;
  nodeRef: (node: Konva.Image | null) => void;
  isDark: boolean;
}) => {
  const image = useCanvasImage(libraryItem.imageUrl);
  const baseWidth = libraryItem.realWidth * METER_SPACING;
  const baseHeight = libraryItem.realHeight * METER_SPACING;

  return (
    <>
      {image && (
        <KonvaImage
          ref={nodeRef}
          x={item.x}
          y={item.y}
          image={image}
          width={baseWidth}
          height={baseHeight}
          scaleX={item.scaleX}
          scaleY={item.scaleY}
          rotation={item.rotation}
          offsetX={baseWidth / 2}
          offsetY={baseHeight / 2}
          draggable={activeTool === 'select'}
          onClick={(event) => {
            event.cancelBubble = true;
            onSelect();
          }}
          onTap={onSelect}
          onDragStart={onSelect}
          onDragEnd={(event) => {
            const node = event.target as Konva.Image;
            onDragEnd(item, node);
          }}
          onTransformEnd={(event) => onTransformEnd(item, event.target as Konva.Image)}
          onContextMenu={(event) => onContextMenu(event, item)}
          visible={!item.isHidden} // Assuming we might add isHidden to furniture too
          listening={!item.isLocked} // Assuming we might add isLocked to furniture too
        />
      )}
      <Text
        x={item.x - baseWidth / 2}
        y={item.y + (baseHeight * item.scaleY) / 2 + 10}
        width={baseWidth}
        text={`${libraryItem.name}\n${(item.customWidth ?? libraryItem.realWidth).toFixed(1)}م × ${(item.customHeight ?? libraryItem.realHeight).toFixed(1)}م`}
        align="center"
        fontSize={12}
        lineHeight={1.4}
        fill={isDark ? '#e2e8f0' : '#334155'}
        listening={false}
        fontFamily="Cairo, system-ui"
      />
    </>
  );
};

const renderRoomLabel = (room: FloorRoom, showMeasurements: boolean) =>
  showMeasurements
    ? `${room.name}\n${(room.width / METER_SPACING).toFixed(1)}م × ${(room.height / METER_SPACING).toFixed(1)}م`
    : room.name;

const FloorPlanCanvas = forwardRef<FloorPlanCanvasHandle>((_, ref) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const selectedRoomNodeRef = useRef<Konva.Rect | null>(null);
  const previewRoomNodeRef = useRef<Konva.Rect | null>(null);
  const selectedFurnitureNodeRef = useRef<Konva.Image | null>(null);
  const roomTransformerRef = useRef<Konva.Transformer>(null);
  const furnitureTransformerRef = useRef<Konva.Transformer>(null);
  const isDrawingRef = useRef(false);
  const drawStartRef = useRef({ x: 0, y: 0 });
  const previewRectRef = useRef<DraftRoom>({ x: 0, y: 0, width: 0, height: 0 });
  const panPointerRef = useRef<{ x: number; y: number } | null>(null);
  const panStartRef = useRef({ x: 0, y: 0 });
  const roomDragStartRef = useRef<{ x: number; y: number } | null>(null);
  const stageScaleRef = useRef(1);
  const stagePositionRef = useRef({ x: 0, y: 0 });

  const zoomLevel = useFloorPlanStore((state) => state.zoomLevel);
  const theme = useSettingsStore((state) => state.theme);
  const isDark = theme === 'dark'; // Simplifying for now, system handling can be added if needed

  const colors = {
    gridMinor: isDark ? '#1e293b' : '#f1f5f9',
    gridMajor: isDark ? '#334155' : '#e2e8f0',
    rulerBg: isDark ? '#020617' : '#ffffff',
    rulerText: isDark ? '#475569' : '#94a3b8',
    rulerLine: isDark ? '#1e293b' : '#f1f5f9',
    canvasBg: isDark ? '#020617' : '#fcfcfd',
    selection: '#2563eb',
  };

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [draftWall, setDraftWall] = useState<DraftWall | null>(null);
  const [rulerPoints, setRulerPoints] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [pulseTick, setPulseTick] = useState(0);
  const [editingRoom, setEditingRoom] = useState<EditingRoomState>(null);

  const {
    rooms,
    walls,
    selectedRoomId,
    selectedWallId,
    selectRoom,
    selectWall,
    addRoom,
    addWall,
    deleteWall,
    updateRoom,
    activeTool,
    showMeasurements,
    showGrid,
    setZoom,
  } = useFloorPlanStore((state) => ({
    rooms: state.rooms,
    walls: state.walls,
    selectedRoomId: state.selectedRoomId,
    selectedWallId: state.selectedWallId,
    selectRoom: state.selectRoom,
    selectWall: state.selectWall,
    addRoom: state.addRoom,
    addWall: state.addWall,
    deleteWall: state.deleteWall,
    updateRoom: state.updateRoom,
    activeTool: state.activeTool,
    showMeasurements: state.showMeasurements,
    showGrid: state.showGrid,
    setZoom: state.setZoom,
    toggleRoomVisibility: state.toggleRoomVisibility,
    toggleRoomLock: state.toggleRoomLock,
  }));

  const {
    furnitureLibrary,
    placedItems,
    selectedFurnitureId,
    placeOnCanvas,
    updatePlaced,
    removePlaced,
    selectFurniture,
  } = useFurnitureStore((state) => ({
    furnitureLibrary: state.furnitureLibrary,
    placedItems: state.placedItems,
    selectedFurnitureId: state.selectedFurnitureId,
    placeOnCanvas: state.placeOnCanvas,
    updatePlaced: state.updatePlaced,
    removePlaced: state.removePlaced,
    selectFurniture: state.selectFurniture,
  }));

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId);
  const selectedWall = walls.find((wall) => wall.id === selectedWallId);
  const pulseStrength =
    selectedRoom || selectedWall ? (Math.sin((pulseTick / 16) * Math.PI * 2) + 1) / 2 : 0;

  const furnitureMap = useMemo(
    () => new Map(furnitureLibrary.map((item) => [item.id, item])),
    [furnitureLibrary]
  );

  useImperativeHandle(ref, () => ({
    exportToPng: () => stageRef.current?.toDataURL({ pixelRatio: 2 }) ?? null,
  }));

  useEffect(() => {
    stageScaleRef.current = zoomLevel;
  }, [zoomLevel]);

  useEffect(() => {
    stagePositionRef.current = position;
  }, [position]);

  useEffect(() => {
    if (!wrapperRef.current) {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: Math.max(0, entry.contentRect.width),
        height: Math.max(0, entry.contentRect.height),
      });
    });

    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        setSpacePressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!selectedRoom && !selectedWall) {
      setPulseTick(0);
      return undefined;
    }

    const interval = window.setInterval(() => {
      setPulseTick((value) => (value + 1) % 16);
    }, 90);

    return () => window.clearInterval(interval);
  }, [selectedRoom, selectedWall]);

  useEffect(() => {
    if (!roomTransformerRef.current) {
      return;
    }
    if (!selectedRoomId) {
      selectedRoomNodeRef.current = null;
    }
    roomTransformerRef.current.nodes(selectedRoomNodeRef.current ? [selectedRoomNodeRef.current] : []);
    roomTransformerRef.current.getLayer()?.batchDraw();
  }, [rooms, selectedRoomId]);

  useEffect(() => {
    if (!furnitureTransformerRef.current) {
      return;
    }
    if (!selectedFurnitureId) {
      selectedFurnitureNodeRef.current = null;
    }
    furnitureTransformerRef.current.nodes(
      selectedFurnitureNodeRef.current ? [selectedFurnitureNodeRef.current] : []
    );
    furnitureTransformerRef.current.getLayer()?.batchDraw();
  }, [placedItems, selectedFurnitureId]);

  useEffect(() => {
    if (activeTool !== 'draw-wall') {
      setDraftWall(null);
    }
  }, [activeTool]);

  useEffect(() => {
    if (!editingRoom) {
      return;
    }
    const room = rooms.find((entry) => entry.id === editingRoom.id);
    if (!room) {
      setEditingRoom(null);
      return;
    }
    setEditingRoom((current) =>
      current
        ? {
          ...current,
          left: RULER_SIZE + position.x + room.x * zoomLevel,
          top: RULER_SIZE + position.y + room.y * zoomLevel + room.height * zoomLevel * 0.35,
          width: Math.max(120, room.width * zoomLevel),
        }
        : current
    );
  }, [editingRoom?.id, position.x, position.y, rooms, zoomLevel]);

  const getCanvasPoint = (clientX: number, clientY: number) => {
    const container = wrapperRef.current;
    if (!container) {
      return null;
    }
    const rect = container.getBoundingClientRect();
    const relativeX = clientX - rect.left - RULER_SIZE;
    const relativeY = clientY - rect.top - RULER_SIZE;
    return {
      x: (relativeX - stagePositionRef.current.x) / stageScaleRef.current,
      y: (relativeY - stagePositionRef.current.y) / stageScaleRef.current,
    };
  };

  const clearSelection = () => {
    selectRoom(undefined);
    selectWall(undefined);
    selectFurniture(undefined);
    setContextMenu(null);
  };

  const beginRoomRename = (room: FloorRoom) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    setEditingRoom({
      id: room.id,
      value: room.name,
      left: RULER_SIZE + position.x + room.x * zoomLevel,
      top: RULER_SIZE + position.y + room.y * zoomLevel + room.height * zoomLevel * 0.35,
      width: Math.max(120, room.width * zoomLevel),
    });
  };

  const commitRoomRename = () => {
    if (!editingRoom) {
      return;
    }

    updateRoom(editingRoom.id, { name: editingRoom.value.trim() || 'غرفة بدون اسم' });
    setEditingRoom(null);
  };

  const hidePreviewRoom = () => {
    isDrawingRef.current = false;
    previewRectRef.current = { x: 0, y: 0, width: 0, height: 0 };
    if (previewRoomNodeRef.current) {
      previewRoomNodeRef.current.visible(false);
      previewRoomNodeRef.current.width(0);
      previewRoomNodeRef.current.height(0);
      previewRoomNodeRef.current.getLayer()?.batchDraw();
    }
  };

  const updatePreviewRoom = (draftRoom: DraftRoom) => {
    previewRectRef.current = draftRoom;
    if (previewRoomNodeRef.current) {
      previewRoomNodeRef.current.setAttrs({
        ...draftRoom,
        visible: true,
      });
      previewRoomNodeRef.current.getLayer()?.batchDraw();
    }
  };

  const getPointerFromEvent = (event: Konva.KonvaEventObject<PointerEvent>) => {
    const stage = event.target.getStage();
    if (!stage) {
      return null;
    }
    return stage.getRelativePointerPosition();
  };

  const commitWall = (wall: DraftWall) => {
    if (wall.x1 === wall.x2 && wall.y1 === wall.y2) {
      return;
    }

    const payload: Wall = {
      id:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.floor(Math.random() * 1_000)}`,
      x1: wall.x1,
      y1: wall.y1,
      x2: wall.x2,
      y2: wall.y2,
      thickness: WALL_THICKNESS,
    };

    addWall(payload);
  };

  const handleDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const furnitureId = event.dataTransfer.getData('furnitureId');
    const furniture = furnitureMap.get(furnitureId);
    if (!furniture) {
      return;
    }

    const point = getCanvasPoint(event.clientX, event.clientY);
    if (!point) {
      return;
    }

    placeOnCanvas({
      furnitureId,
      x: snapToGrid(point.x),
      y: snapToGrid(point.y),
      rotation: 0,
    });
    selectRoom(undefined);
    selectWall(undefined);
    setContextMenu(null);
  };

  const handleStageMouseDown = (event: Konva.KonvaEventObject<PointerEvent>) => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const pointer = stage.getPointerPosition();
    if (!pointer) {
      return;
    }

    if (event.evt.button === 1 || spacePressed) {
      setIsPanning(true);
      panPointerRef.current = pointer;
      panStartRef.current = stagePositionRef.current;
      setContextMenu(null);
      return;
    }

    const currentTool = useFloorPlanStore.getState().activeTool;
    const clickedEmptyCanvas =
      event.target === stage || event.target.getClassName() === 'Layer';

    if (currentTool === 'draw-room' && clickedEmptyCanvas) {
      const point = getPointerFromEvent(event);
      if (!point) {
        return;
      }
      isDrawingRef.current = true;
      drawStartRef.current = {
        x: point.x,
        y: point.y,
      };
      updatePreviewRoom({
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
      });
      clearSelection();
      return;
    }

    if (currentTool === 'draw-wall' && clickedEmptyCanvas) {
      const point = getPointerFromEvent(event);
      if (!point) {
        return;
      }

      const snappedPoint = { x: snapToGrid(point.x), y: snapToGrid(point.y) };
      clearSelection();

      if (!draftWall) {
        setDraftWall({
          x1: snappedPoint.x,
          y1: snappedPoint.y,
          x2: snappedPoint.x,
          y2: snappedPoint.y,
        });
      } else {
        const completedWall = {
          x1: draftWall.x1,
          y1: draftWall.y1,
          x2: snappedPoint.x,
          y2: snappedPoint.y,
        };
        commitWall(completedWall);
        setDraftWall(null);
      }
      return;
    }

    if (currentTool === 'ruler') {
      const point = getPointerFromEvent(event);
      if (!point) return;
      isDrawingRef.current = true;
      setRulerPoints({ x1: point.x, y1: point.y, x2: point.x, y2: point.y });
      return;
    }

    if (event.target === stage) {
      clearSelection();
    }
  };

  const handleStageMouseMove = (event: Konva.KonvaEventObject<PointerEvent>) => {
    if (isPanning) {
      const stage = stageRef.current;
      const pointer = stage?.getPointerPosition();
      if (!pointer || !panPointerRef.current) {
        return;
      }
      setPosition({
        x: panStartRef.current.x + (pointer.x - panPointerRef.current.x),
        y: panStartRef.current.y + (pointer.y - panPointerRef.current.y),
      });
      return;
    }

    const currentTool = useFloorPlanStore.getState().activeTool;

    if (currentTool === 'draw-room' && isDrawingRef.current) {
      const point = getPointerFromEvent(event);
      if (!point) {
        return;
      }
      const width = point.x - drawStartRef.current.x;
      const height = point.y - drawStartRef.current.y;
      const x = width < 0 ? drawStartRef.current.x + width : drawStartRef.current.x;
      const y = height < 0 ? drawStartRef.current.y + height : drawStartRef.current.y;
      updatePreviewRoom({
        x,
        y,
        width: Math.abs(width),
        height: Math.abs(height),
      });
      return;
    }

    if (currentTool === 'draw-wall' && draftWall) {
      const point = getPointerFromEvent(event);
      if (!point) {
        return;
      }
      setDraftWall({
        ...draftWall,
        x2: snapToGrid(point.x),
        y2: snapToGrid(point.y),
      });
    }
  };

  const handleStageMouseUp = (event: Konva.KonvaEventObject<PointerEvent>) => {
    if (isPanning) {
      setIsPanning(false);
      panPointerRef.current = null;
      return;
    }

    const currentTool = useFloorPlanStore.getState().activeTool;
    if (currentTool !== 'draw-room' || !isDrawingRef.current) {
      return;
    }

    const point = getPointerFromEvent(event);
    if (!point) {
      hidePreviewRoom();
      return;
    }

    const rawWidth = point.x - drawStartRef.current.x;
    const rawHeight = point.y - drawStartRef.current.y;
    const x = rawWidth < 0 ? drawStartRef.current.x + rawWidth : drawStartRef.current.x;
    const y = rawHeight < 0 ? drawStartRef.current.y + rawHeight : drawStartRef.current.y;
    const width = Math.abs(rawWidth);
    const height = Math.abs(rawHeight);

    if (width <= 20 || height <= 20) {
      hidePreviewRoom();
      return;
    }

    const snappedWidth = Math.max(MIN_ROOM_SIZE, snapToGrid(width));
    const snappedHeight = Math.max(MIN_ROOM_SIZE, snapToGrid(height));
    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);
    const roomCount = useFloorPlanStore.getState().rooms.length;
    const label = `${(snappedWidth / METER_SPACING).toFixed(1)}م × ${(snappedHeight / METER_SPACING).toFixed(1)}م`;
    const room: FloorRoom = {
      id:
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.floor(Math.random() * 1_000)}`,
      name: `غرفة ${roomCount + 1}`,
      label,
      x: snappedX,
      y: snappedY,
      width: snappedWidth,
      height: snappedHeight,
      color: ROOM_COLOR_PALETTE[roomCount % ROOM_COLOR_PALETTE.length],
    };
    addRoom(room);
    selectRoom(room.id);
    selectFurniture(undefined);
    hidePreviewRoom();
  };

  const handleWheel = (event: Konva.KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault();

    const point = getCanvasPoint(event.evt.clientX, event.evt.clientY);
    if (!point) {
      return;
    }

    const nextZoom = Math.min(
      3,
      Math.max(0.3, zoomLevel * (event.evt.deltaY < 0 ? 1.08 : 1 / 1.08))
    );

    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    setZoom(nextZoom);
    setPosition({
      x: event.evt.clientX - rect.left - RULER_SIZE - point.x * nextZoom,
      y: event.evt.clientY - rect.top - RULER_SIZE - point.y * nextZoom,
    });
  };

  const duplicateFurniture = (placedId: string) => {
    const placed = placedItems.find((item) => item.id === placedId);
    if (!placed) {
      return;
    }

    placeOnCanvas({
      furnitureId: placed.furnitureId,
      x: snapToGrid(placed.x + GRID_SPACING * 2),
      y: snapToGrid(placed.y + GRID_SPACING * 2),
      rotation: placed.rotation,
      scaleX: placed.scaleX,
      scaleY: placed.scaleY,
    });
    setContextMenu(null);
  };

  const worldWidth = size.width / Math.max(zoomLevel, 0.001);
  const worldHeight = size.height / Math.max(zoomLevel, 0.001);
  const worldLeft = -position.x / Math.max(zoomLevel, 0.001);
  const worldTop = -position.y / Math.max(zoomLevel, 0.001);
  const gridStartX = Math.floor((worldLeft - 400) / GRID_SPACING) * GRID_SPACING;
  const gridEndX = Math.ceil((worldLeft + worldWidth + 400) / GRID_SPACING) * GRID_SPACING;
  const gridStartY = Math.floor((worldTop - 400) / GRID_SPACING) * GRID_SPACING;
  const gridEndY = Math.ceil((worldTop + worldHeight + 400) / GRID_SPACING) * GRID_SPACING;

  const gridVertical: Array<{ x: number; stroke: string; opacity: number; dash?: number[] }> = [];
  const gridHorizontal: Array<{ y: number; stroke: string; opacity: number; dash?: number[] }> = [];

  for (let x = gridStartX; x <= gridEndX; x += GRID_SPACING) {
    const isMajor = x % (METER_SPACING) === 0;
    gridVertical.push({
      x,
      stroke: isMajor ? colors.gridMajor : colors.gridMinor,
      opacity: isMajor ? 1 : 0.5,
      dash: isMajor ? undefined : [1, 2],
    });
  }

  for (let y = gridStartY; y <= gridEndY; y += GRID_SPACING) {
    const isMajor = y % (METER_SPACING) === 0;
    gridHorizontal.push({
      y,
      stroke: isMajor ? colors.gridMajor : colors.gridMinor,
      opacity: isMajor ? 1 : 0.5,
      dash: isMajor ? undefined : [1, 2],
    });
  }

  const topRulerMarks: Array<{ x: number; label: string }> = [];
  const leftRulerMarks: Array<{ y: number; label: string }> = [];
  const meterStartX = Math.floor(worldLeft / METER_SPACING);
  const meterEndX = Math.ceil((worldLeft + worldWidth) / METER_SPACING);
  const meterStartY = Math.floor(worldTop / METER_SPACING);
  const meterEndY = Math.ceil((worldTop + worldHeight) / METER_SPACING);

  for (let meter = meterStartX; meter <= meterEndX; meter += 1) {
    topRulerMarks.push({ x: meter * METER_SPACING * zoomLevel + position.x, label: `${meter}م` });
  }

  for (let meter = meterStartY; meter <= meterEndY; meter += 1) {
    leftRulerMarks.push({ y: meter * METER_SPACING * zoomLevel + position.y, label: `${meter}م` });
  }

  return (
    <div className="relative h-[70vh] min-h-[520px] overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-950">
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <button
          type="button"
          className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-furniture-library'));
          }}
        >
          مكتبة الأثاث
        </button>
      </div>

      <div className="absolute inset-0" ref={wrapperRef}>
        {/* Removed old ruler divs */}
        <div
          className="absolute bottom-0 left-[30px] right-0 top-[30px]"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          {size.width > 0 && size.height > 0 && (
            <Stage
              ref={stageRef}
              width={Math.max(0, size.width - RULER_SIZE)}
              height={Math.max(0, size.height - RULER_SIZE)}
              x={position.x}
              y={position.y}
              scaleX={zoomLevel}
              scaleY={zoomLevel}
              onMouseDown={handleStageMouseDown}
              onMouseMove={handleStageMouseMove}
              onMouseUp={handleStageMouseUp}
              onWheel={handleWheel}
              onContextMenu={(event) => event.evt.preventDefault()}
            >
              {/* Top Ruler */}
              <Layer>
                <Rect x={0} y={0} width={4000} height={RULER_SIZE} fill={colors.rulerBg} />
                <Line points={[0, RULER_SIZE, 4000, RULER_SIZE]} stroke={colors.rulerLine} strokeWidth={1} />
                {Array.from({ length: 101 }).map((_, i) => (
                  <Fragment key={`ruler-h-${i}`}>
                    <Line
                      points={[
                        RULER_SIZE + i * METER_SPACING * zoomLevel + position.x,
                        RULER_SIZE - (i % 5 === 0 ? 15 : 8),
                        RULER_SIZE + i * METER_SPACING * zoomLevel + position.x,
                        RULER_SIZE,
                      ]}
                      stroke={colors.rulerText}
                      strokeWidth={1}
                    />
                    {i % 5 === 0 && (
                      <Text
                        x={RULER_SIZE + i * METER_SPACING * zoomLevel + position.x - 5}
                        y={5}
                        text={`${i}م`}
                        fontSize={10}
                        fill={colors.rulerText}
                      />
                    )}
                  </Fragment>
                ))}
              </Layer>

              {/* Left Ruler */}
              <Layer>
                <Rect x={0} y={0} width={RULER_SIZE} height={4000} fill={colors.rulerBg} />
                <Line points={[RULER_SIZE, 0, RULER_SIZE, 4000]} stroke={colors.rulerLine} strokeWidth={1} />
                {Array.from({ length: 101 }).map((_, i) => (
                  <Fragment key={`ruler-v-${i}`}>
                    <Line
                      points={[
                        RULER_SIZE - (i % 5 === 0 ? 15 : 8),
                        RULER_SIZE + i * METER_SPACING * zoomLevel + position.y,
                        RULER_SIZE,
                        RULER_SIZE + i * METER_SPACING * zoomLevel + position.y,
                      ]}
                      stroke={colors.rulerText}
                      strokeWidth={1}
                    />
                    {i % 5 === 0 && (
                      <Text
                        x={5}
                        y={RULER_SIZE + i * METER_SPACING * zoomLevel + position.y - 5}
                        text={`${i}م`}
                        fontSize={10}
                        fill={colors.rulerText}
                        rotation={-90}
                      />
                    )}
                  </Fragment>
                ))}
                {/* Corner square */}
                <Rect x={0} y={0} width={RULER_SIZE} height={RULER_SIZE} fill={colors.rulerBg} />
              </Layer>

              <Layer listening={false}>
                {/* Canvas Background */}
                <Rect
                  x={-5000}
                  y={-5000}
                  width={10000}
                  height={10000}
                  fill={colors.canvasBg}
                  listening={false}
                />
              </Layer>

              {/* Grid Layer */}
              {showGrid && (
                <Layer listening={false}>
                  {Array.from({ length: 201 }).map((_, i) => (
                    <Fragment key={`grid-h-${i}`}>
                      <Line
                        points={[0, i * METER_SPACING, 4000, i * METER_SPACING]}
                        stroke={colors.gridMajor}
                        strokeWidth={i % 5 === 0 ? 1 : 0.5}
                        listening={false}
                        opacity={0.1}
                      />
                      <Line
                        points={[i * METER_SPACING, 0, i * METER_SPACING, 4000]}
                        stroke={colors.gridMajor}
                        strokeWidth={i % 5 === 0 ? 1 : 0.5}
                        listening={false}
                        opacity={0.1}
                      />
                    </Fragment>
                  ))}
                  {gridVertical.map((line) => (
                    <Line
                      key={`v-${line.x}`}
                      points={[line.x, -20000, line.x, 20000]}
                      stroke={line.stroke}
                      strokeWidth={1}
                      opacity={line.opacity}
                    />
                  ))}
                  {gridHorizontal.map((line) => (
                    <Line
                      key={`h-${line.y}`}
                      points={[-20000, line.y, 20000, line.y]}
                      stroke={line.stroke}
                      strokeWidth={1}
                      opacity={line.opacity}
                    />
                  ))}
                </Layer>
              )}

              <Layer>
                {walls.map((wall) => (
                  <Line
                    key={wall.id}
                    points={[wall.x1, wall.y1, wall.x2, wall.y2]}
                    stroke="#374151"
                    strokeWidth={wall.thickness * 2}
                    lineCap="round"
                    lineJoin="round"
                    onClick={(lineEvent) => {
                      lineEvent.cancelBubble = true;
                      selectWall(wall.id);
                      selectFurniture(undefined);
                      setContextMenu(null);
                    }}
                    onTap={() => {
                      selectWall(wall.id);
                      selectFurniture(undefined);
                      setContextMenu(null);
                    }}
                    onContextMenu={(lineEvent) => {
                      lineEvent.evt.preventDefault();
                      lineEvent.cancelBubble = true;
                      selectWall(wall.id);
                      selectFurniture(undefined);
                      const rect = wrapperRef.current?.getBoundingClientRect();
                      if (!rect) {
                        return;
                      }
                      setContextMenu({
                        x: lineEvent.evt.clientX - rect.left,
                        y: lineEvent.evt.clientY - rect.top,
                        type: 'wall',
                        targetId: wall.id,
                      });
                    }}
                  />
                ))}
                {selectedWall && (
                  <Line
                    points={[selectedWall.x1, selectedWall.y1, selectedWall.x2, selectedWall.y2]}
                    stroke="#2563eb"
                    strokeWidth={selectedWall.thickness * 2 + 6}
                    lineCap="round"
                    lineJoin="round"
                    opacity={0.35 + pulseStrength * 0.3}
                    listening={false}
                  />
                )}
                {draftWall && (
                  <Line
                    points={[draftWall.x1, draftWall.y1, draftWall.x2, draftWall.y2]}
                    stroke="#6b7280"
                    strokeWidth={WALL_THICKNESS * 2}
                    dash={[10, 8]}
                    lineCap="round"
                    lineJoin="round"
                  />
                )}
              </Layer>

              <Layer>
                {rooms.map((room) => (
                  <Rect
                    key={room.id}
                    ref={(node) => {
                      if (room.id === selectedRoomId) {
                        selectedRoomNodeRef.current = node;
                      }
                    }}
                    x={room.x}
                    y={room.y}
                    width={room.width}
                    height={room.height}
                    fill={room.color || '#bfdbfe'}
                    stroke={room.strokeColor || '#3b82f6'}
                    strokeWidth={selectedRoomId === room.id ? 2.5 : 1.5}
                    cornerRadius={0}
                    draggable={activeTool === 'select' && !room.isLocked}
                    visible={!room.isHidden}
                    listening={!room.isHidden}
                    onClick={(event) => {
                      if (room.isLocked) return;
                      event.cancelBubble = true;
                      selectRoom(room.id);
                      selectFurniture(undefined);
                      setContextMenu(null);
                    }}
                    onDblClick={(event) => {
                      if (room.isLocked) return;
                      event.cancelBubble = true;
                      selectRoom(room.id);
                      selectFurniture(undefined);
                      beginRoomRename(room);
                    }}
                    onDragStart={(event) => {
                      if (room.isLocked) return;
                      roomDragStartRef.current = { x: event.target.x(), y: event.target.y() };
                      selectRoom(room.id);
                      selectFurniture(undefined);
                      setContextMenu(null);
                      useFloorPlanStore.getState().snapshot();
                    }}
                    onDragMove={(event) => {
                      const newX = event.target.x();
                      const newY = event.target.y();
                      const startPos = roomDragStartRef.current;
                      if (startPos) {
                        const deltaX = newX - startPos.x;
                        const deltaY = newY - startPos.y;
                        if (deltaX !== 0 || deltaY !== 0) {
                          const itemsToMove = placedItems.filter((item) => {
                            const libraryItem = furnitureMap.get(item.furnitureId);
                            if (!libraryItem) return false;
                            const itemWidthPx = (item.customWidth || libraryItem.realWidth) * 40 * (item.scaleX || 1);
                            const itemHeightPx = (item.customHeight || libraryItem.realHeight) * 40 * (item.scaleY || 1);
                            const itemCenterX = item.x + itemWidthPx / 2;
                            const itemCenterY = item.y + itemHeightPx / 2;
                            return (
                              itemCenterX >= startPos.x &&
                              itemCenterX <= startPos.x + room.width &&
                              itemCenterY >= startPos.y &&
                              itemCenterY <= startPos.y + room.height
                            );
                          });

                          itemsToMove.forEach((item) => {
                            updatePlaced(item.id, {
                              x: item.x + deltaX,
                              y: item.y + deltaY,
                            });
                          });
                          roomDragStartRef.current = { x: newX, y: newY };
                        }
                      }
                    }}
                    onDragEnd={(event) => {
                      const newX = snapToAlignment(event.target.x(), 'x', rooms, room.id);
                      const newY = snapToAlignment(event.target.y(), 'y', rooms, room.id);
                      updateRoom(room.id, {
                        x: newX,
                        y: newY,
                      });
                      event.target.x(newX);
                      event.target.y(newY);
                      roomDragStartRef.current = null;
                    }}
                    onTransformEnd={(event) => {
                      const node = event.target as Konva.Rect;
                      const newX = snapToAlignment(node.x(), 'x', rooms, room.id);
                      const newY = snapToAlignment(node.y(), 'y', rooms, room.id);
                      const width = Math.max(MIN_ROOM_SIZE, snapToGrid(node.width() * node.scaleX()));
                      const height = Math.max(MIN_ROOM_SIZE, snapToGrid(node.height() * node.scaleY()));
                      node.scaleX(1);
                      node.scaleY(1);
                      node.x(newX);
                      node.y(newY);
                      updateRoom(room.id, {
                        x: newX,
                        y: newY,
                        width,
                        height,
                      });
                    }}
                  />
                ))}

                {/* Render Room Openings */}
                {rooms.map((room) =>
                  (room.openings ?? []).map((opening) => {
                    let ox = room.x;
                    let oy = room.y;
                    let oWidth = 0;
                    let oHeight = 0;
                    const wallThick = 6;

                    if (opening.side === 'top') {
                      ox += opening.position;
                      oy -= wallThick / 2;
                      oWidth = opening.width;
                      oHeight = wallThick;
                    } else if (opening.side === 'bottom') {
                      ox += opening.position;
                      oy += room.height - wallThick / 2;
                      oWidth = opening.width;
                      oHeight = wallThick;
                    } else if (opening.side === 'left') {
                      ox -= wallThick / 2;
                      oy += opening.position;
                      oWidth = wallThick;
                      oHeight = opening.width;
                    } else if (opening.side === 'right') {
                      ox += room.width - wallThick / 2;
                      oy += opening.position;
                      oWidth = wallThick;
                      oHeight = opening.width;
                    }

                    return (
                      <Rect
                        key={opening.id}
                        x={ox}
                        y={oy}
                        width={oWidth}
                        height={oHeight}
                        fill={opening.type === 'door' ? '#ef4444' : '#3b82f6'}
                        stroke="white"
                        strokeWidth={1}
                        cornerRadius={opening.type === 'window' ? 0 : 2}
                        listening={false}
                        visible={!room.isHidden}
                      />
                    );
                  })
                )}

                {selectedRoom && (
                  <Rect
                    x={selectedRoom.x}
                    y={selectedRoom.y}
                    width={selectedRoom.width}
                    height={selectedRoom.height}
                    listening={false}
                    fillEnabled={false}
                    stroke="#2563eb"
                    strokeWidth={3 + pulseStrength * 3}
                    opacity={0.45 + pulseStrength * 0.4}
                    cornerRadius={0}
                    shadowColor="#3b82f6"
                    shadowBlur={12 + pulseStrength * 12}
                    shadowOpacity={0.45}
                  />
                )}

                <Rect
                  ref={previewRoomNodeRef}
                  visible={false}
                  fill="rgba(59,130,246,0.2)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dash={[5, 5]}
                />

                <Transformer
                  ref={roomTransformerRef}
                  rotateEnabled={false}
                  enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']}
                  keepRatio={false}
                  anchorSize={10}
                  anchorFill={isDark ? '#3b82f6' : '#2563eb'}
                  anchorStroke={isDark ? '#020617' : '#ffffff'}
                  borderStroke={isDark ? '#3b82f6' : '#2563eb'}
                  borderStrokeWidth={2}
                />
              </Layer>

              <Layer>
                {placedItems.map((placed) => {
                  const libraryItem = furnitureMap.get(placed.furnitureId);
                  if (!libraryItem) {
                    return null;
                  }

                  return (
                    <FurnitureNode
                      key={placed.id}
                      item={placed}
                      libraryItem={libraryItem}
                      isSelected={placed.id === selectedFurnitureId}
                      activeTool={activeTool}
                      isDark={isDark} // Pass isDark prop
                      nodeRef={(node) => {
                        if (placed.id === selectedFurnitureId) {
                          selectedFurnitureNodeRef.current = node;
                        }
                      }}
                      onSelect={() => {
                        selectFurniture(placed.id);
                        selectRoom(undefined);
                        setContextMenu(null);
                      }}
                      onDragEnd={(item, node) => {
                        const newX = snapToAlignment(node.x(), 'x', rooms);
                        const newY = snapToAlignment(node.y(), 'y', rooms);
                        const targetRoom = findRoomAtPoint(newX, newY, rooms);
                        updatePlaced(item.id, {
                          x: newX,
                          y: newY,
                          roomId: targetRoom?.id
                        });
                        node.x(newX);
                        node.y(newY);
                      }}
                      onTransformEnd={(item, node) => {
                        updatePlaced(item.id, {
                          x: snapToGrid(node.x()),
                          y: snapToGrid(node.y()),
                          rotation: Math.round(node.rotation() / 45) * 45,
                          scaleX: Number(node.scaleX().toFixed(2)),
                          scaleY: Number(node.scaleY().toFixed(2)),
                        });
                      }}
                      onContextMenu={(event, item) => {
                        event.evt.preventDefault();
                        event.cancelBubble = true;
                        selectFurniture(item.id);
                        selectRoom(undefined);
                        const rect = wrapperRef.current?.getBoundingClientRect();
                        if (!rect) {
                          return;
                        }
                        setContextMenu({
                          x: event.evt.clientX - rect.left,
                          y: event.evt.clientY - rect.top,
                          type: 'furniture',
                          targetId: item.id,
                        });
                      }}
                    />
                  );
                })}

                <Transformer
                  ref={furnitureTransformerRef}
                  rotateEnabled
                  enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']}
                  anchorSize={9}
                  anchorFill={isDark ? '#3b82f6' : '#2563eb'}
                  anchorStroke={isDark ? '#020617' : '#ffffff'}
                  borderStroke={isDark ? '#3b82f6' : '#2563eb'}
                  borderStrokeWidth={2}
                />
              </Layer>

              {/* Room labels layer - top level with background for readability */}
              <Layer listening={false}>
                {rooms.map((room) => {
                  const showLabel = room.width > 60 && room.height > 40;
                  if (!showLabel) return null;
                  const labelText = renderRoomLabel(room, showMeasurements);
                    return (
                      <Fragment key={`room-label-${room.id}`}>
                        {/* Architectural Badge Background */}
                        <Rect
                          x={room.x + room.width / 2 - 60}
                          y={room.y + room.height / 2 - 15}
                          width={120}
                          height={30}
                          fill={isDark ? '#1e293b' : '#ffffff'}
                          stroke={isDark ? '#3b82f6' : '#2563eb'}
                          strokeWidth={1}
                          cornerRadius={15}
                          opacity={0.9}
                          shadowColor="black"
                          shadowBlur={10}
                          shadowOpacity={0.1}
                        />
                        <Text
                          x={room.x}
                          y={room.y}
                          width={room.width}
                          height={room.height}
                          text={labelText}
                          align="center"
                          verticalAlign="middle"
                          fontSize={11}
                          fontStyle="bold"
                          fill={isDark ? '#e2e8f0' : '#1e293b'}
                          fontFamily="Cairo, system-ui"
                          visible={!room.isHidden}
                        />
                      </Fragment>
                    );
                })}
              </Layer>

              {/* Ruler Layer */}
              {rulerPoints && (
                <Layer listening={false}>
                  <Line
                    points={[rulerPoints.x1, rulerPoints.y1, rulerPoints.x2, rulerPoints.y2]}
                    stroke="#ef4444"
                    strokeWidth={2 / stageScaleRef.current}
                    dash={[4, 4]}
                  />
                  <Circle cx={rulerPoints.x1} cy={rulerPoints.y1} r={4 / stageScaleRef.current} fill="#ef4444" />
                  <Circle cx={rulerPoints.x2} cy={rulerPoints.y2} r={4 / stageScaleRef.current} fill="#ef4444" />
                  <Text
                    x={(rulerPoints.x1 + rulerPoints.x2) / 2}
                    y={(rulerPoints.y1 + rulerPoints.y2) / 2 - 20 / stageScaleRef.current}
                    text={`${(Math.sqrt(Math.pow(rulerPoints.x2 - rulerPoints.x1, 2) + Math.pow(rulerPoints.y2 - rulerPoints.y1, 2)) / METER_SPACING).toFixed(2)} م`}
                    fontSize={14 / stageScaleRef.current}
                    fill="#ef4444"
                    fontStyle="bold"
                    align="center"
                    shadowColor="white"
                    shadowBlur={2}
                    shadowOpacity={1}
                  />
                </Layer>
              )}
            </Stage>
          )}
        </div>
      </div>

      {editingRoom && (
        <input
          autoFocus
          value={editingRoom.value}
          onChange={(event) =>
            setEditingRoom((current) =>
              current ? { ...current, value: event.target.value } : current
            )
          }
          onBlur={commitRoomRename}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commitRoomRename();
            }
            if (event.key === 'Escape') {
              event.preventDefault();
              setEditingRoom(null);
            }
          }}
          className="absolute z-40 rounded-xl border border-blue-400 dark:border-blue-600 bg-white dark:bg-gray-900 px-3 py-2 text-center text-sm text-slate-700 dark:text-slate-200 shadow-lg outline-none ring-2 ring-blue-100 dark:ring-blue-900/30"
          style={{
            left: editingRoom.left,
            top: editingRoom.top,
            width: editingRoom.width,
            transform: 'translateY(-50%)',
          }}
        />
      )}

      {contextMenu && (
        <div
          className="absolute z-30 min-w-[140px] rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-2 shadow-2xl"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.type === 'furniture' ? (
            <>
              <button
                type="button"
                className="block w-full rounded-xl px-3 py-2 text-right text-sm text-slate-700 dark:text-gray-300 transition hover:bg-slate-100 dark:hover:bg-gray-900"
                onClick={() => {
                  removePlaced(contextMenu.targetId);
                  setContextMenu(null);
                }}
              >
                حذف
              </button>
              <button
                type="button"
                className="block w-full rounded-xl px-3 py-2 text-right text-sm text-slate-700 dark:text-gray-300 transition hover:bg-slate-100 dark:hover:bg-gray-900"
                onClick={() => duplicateFurniture(contextMenu.targetId)}
              >
                تكرار
              </button>
            </>
          ) : (
            <button
              type="button"
              className="block w-full rounded-xl px-3 py-2 text-right text-sm text-red-600 transition hover:bg-red-50"
              onClick={() => {
                deleteWall(contextMenu.targetId);
                setContextMenu(null);
              }}
            >
              حذف الجدار
            </button>
          )}
        </div>
      )}

      <div className="absolute bottom-4 right-4 z-20 rounded-2xl bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white">
        {Math.round(zoomLevel * 100)}%
      </div>
    </div>
  );
});

FloorPlanCanvas.displayName = 'FloorPlanCanvas';

export default FloorPlanCanvas;
