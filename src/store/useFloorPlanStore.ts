import { create } from 'zustand';
import { useFurnitureStore, type PlacedFurniture } from './useFurnitureStore';

export type Opening = {
  id: string;
  type: 'door' | 'window';
  side: 'top' | 'bottom' | 'left' | 'right';
  position: number; // offset in pixels from start of side
  width: number; // in pixels
};

export type FloorRoom = {
  id: string;
  name: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeColor?: string;
  openings?: Opening[];
  isHidden?: boolean;
  isLocked?: boolean;
};

export type Wall = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
};

const STORAGE_KEY = 'shaqti_floor_rooms';

type StoredFloorPlan = {
  rooms: FloorRoom[];
  walls: Wall[];
};

const loadFloorPlan = (): StoredFloorPlan => {
  if (typeof window === 'undefined') {
    return { rooms: [], walls: [] };
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return { rooms: [], walls: [] };
    }

    const parsed = JSON.parse(saved) as FloorRoom[] | Partial<StoredFloorPlan>;
    if (Array.isArray(parsed)) {
      return { rooms: parsed, walls: [] };
    }

    return {
      rooms: Array.isArray(parsed.rooms) ? (parsed.rooms as FloorRoom[]) : [],
      walls: Array.isArray(parsed.walls) ? (parsed.walls as Wall[]) : [],
    };
  } catch {
    return { rooms: [], walls: [] };
  }
};

export type FloorPlanTool = 'select' | 'draw-room' | 'draw-wall' | 'ruler';

export type Snapshot = {
  rooms: FloorRoom[];
  placedItems: PlacedFurniture[];
  walls: Wall[];
};

const cloneRooms = (rooms: FloorRoom[]) => rooms.map((room) => ({ ...room }));
const clonePlacedItems = (items: PlacedFurniture[]) => items.map((item) => ({ ...item }));
const cloneWalls = (walls: Wall[]) => walls.map((wall) => ({ ...wall }));

type FloorPlanState = {
  rooms: FloorRoom[];
  walls: Wall[];
  selectedRoomId?: string;
  selectedWallId?: string;
  activeTool: FloorPlanTool;
  zoomLevel: number;
  showMeasurements: boolean;
  showGrid: boolean;
  history: Snapshot[];
  future: Snapshot[];
  aptWidth: string;
  aptHeight: string;
  setAptDimensions: (width: string, height: string) => void;
  snapshot: () => void;
  replaceRooms: (rooms: FloorRoom[]) => void;
  replaceWalls: (walls: Wall[]) => void;
  setRooms: (rooms: FloorRoom[]) => void;
  setWalls: (walls: Wall[]) => void;
  addRoom: (room: FloorRoom) => void;
  updateRoom: (id: string, changes: Partial<FloorRoom>) => void;
  deleteRoom: (id: string) => void;
  addWall: (wall: Wall) => void;
  deleteWall: (id: string) => void;
  addOpening: (roomId: string, opening: Omit<Opening, 'id'>) => void;
  removeOpening: (roomId: string, openingId: string) => void;
  updateOpening: (roomId: string, openingId: string, changes: Partial<Opening>) => void;
  selectRoom: (id?: string) => void;
  selectWall: (id?: string) => void;
  setActiveTool: (tool: FloorPlanTool) => void;
  setZoom: (zoomLevel: number) => void;
  toggleMeasurements: () => void;
  toggleGrid: () => void;
  toggleRoomVisibility: (id: string) => void;
  toggleRoomLock: (id: string) => void;
  undo: () => void;
  redo: () => void;
};

const initialFloorPlan = loadFloorPlan();

export const useFloorPlanStore = create<FloorPlanState>((set, get) => ({
  rooms: initialFloorPlan.rooms,
  walls: initialFloorPlan.walls,
  selectedRoomId: undefined,
  selectedWallId: undefined,
  activeTool: 'select',
  zoomLevel: 1,
  showMeasurements: true,
  showGrid: true,
  history: [],
  future: [],
  aptWidth: '',
  aptHeight: '',
  setAptDimensions: (width, height) => set({ aptWidth: width, aptHeight: height }),
  snapshot: () => {
    const rooms = get().rooms;
    const walls = get().walls;
    const placedItems = useFurnitureStore.getState().placedItems;
    set((state) => ({
      history: [
        ...state.history.slice(-49),
        {
          rooms: cloneRooms(rooms),
          placedItems: clonePlacedItems(placedItems),
          walls: cloneWalls(walls),
        },
      ],
      future: [],
    }));
  },
  replaceRooms: (rooms) =>
    set({
      rooms: cloneRooms(rooms),
      selectedRoomId: undefined,
      selectedWallId: undefined,
      history: [],
      future: [],
    }),
  replaceWalls: (walls) =>
    set({
      walls: cloneWalls(walls),
      selectedWallId: undefined,
      history: [],
      future: [],
    }),
  addRoom: (room) => {
    get().snapshot();
    set((state) => ({
      rooms: [...state.rooms, room],
      selectedRoomId: room.id,
      selectedWallId: undefined,
    }));
  },
  updateRoom: (id, changes) => {
    get().snapshot();
    set((state) => ({
      rooms: state.rooms.map((room) => (room.id === id ? { ...room, ...changes } : room)),
    }));
  },
  deleteRoom: (id) => {
    get().snapshot();
    // Cascade delete furniture in this room
    useFurnitureStore.getState().removePlacedByRoomId(id);
    set((state) => ({
      rooms: state.rooms.filter((room) => room.id !== id),
      selectedRoomId: state.selectedRoomId === id ? undefined : state.selectedRoomId,
    }));
  },
  addWall: (wall) => {
    get().snapshot();
    set((state) => ({
      walls: [...state.walls, wall],
      selectedRoomId: undefined,
      selectedWallId: wall.id,
    }));
  },
  deleteWall: (id) => {
    get().snapshot();
    set((state) => ({
      walls: state.walls.filter((wall) => wall.id !== id),
      selectedWallId: state.selectedWallId === id ? undefined : state.selectedWallId,
    }));
  },
  addOpening: (roomId, opening) => {
    get().snapshot();
    const newOpening = {
      ...opening,
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.floor(Math.random() * 1_000)}`,
    };
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId
          ? { ...room, openings: [...(room.openings ?? []), newOpening] }
          : room
      ),
    }));
  },
  removeOpening: (roomId, openingId) => {
    get().snapshot();
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId
          ? { ...room, openings: (room.openings ?? []).filter((o) => o.id !== openingId) }
          : room
      ),
    }));
  },
  updateOpening: (roomId, openingId, changes) => {
    get().snapshot();
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId
          ? {
            ...room,
            openings: (room.openings ?? []).map((o) =>
              o.id === openingId ? { ...o, ...changes } : o
            ),
          }
          : room
      ),
    }));
  },
  selectRoom: (id) => set({ selectedRoomId: id, selectedWallId: undefined }),
  selectWall: (id) => set({ selectedWallId: id, selectedRoomId: undefined }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setZoom: (zoomLevel) => set({ zoomLevel: Math.min(3, Math.max(0.3, zoomLevel)) }),
  toggleMeasurements: () => set((state) => ({ showMeasurements: !state.showMeasurements })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setRooms: (rooms: FloorRoom[]) => set({ rooms: rooms.map(r => ({ ...r })) }),
  setWalls: (walls: Wall[]) => set({ walls: walls.map(w => ({ ...w })) }),
  toggleRoomVisibility: (id: string) => set((state) => ({
    rooms: state.rooms.map(r => r.id === id ? { ...r, isHidden: !r.isHidden } : r)
  })),
  toggleRoomLock: (id: string) => set((state) => ({
    rooms: state.rooms.map(r => r.id === id ? { ...r, isLocked: !r.isLocked } : r)
  })),
  undo: () => {
    const history = get().history;
    const future = get().future;
    const currentRooms = get().rooms;
    const currentWalls = get().walls;
    const currentPlacedItems = useFurnitureStore.getState().placedItems;

    if (history.length === 0) {
      return;
    }

    const previous = history[history.length - 1];
    const nextSelectedRoomId = previous.rooms.some((room) => room.id === get().selectedRoomId)
      ? get().selectedRoomId
      : undefined;
    const nextSelectedWallId = previous.walls.some((wall) => wall.id === get().selectedWallId)
      ? get().selectedWallId
      : undefined;
    const currentSelectedFurnitureId = useFurnitureStore.getState().selectedFurnitureId;
    const nextSelectedFurnitureId = previous.placedItems.some(
      (item) => item.id === currentSelectedFurnitureId
    )
      ? currentSelectedFurnitureId
      : undefined;

    useFurnitureStore.setState({
      placedItems: clonePlacedItems(previous.placedItems),
      selectedFurnitureId: nextSelectedFurnitureId,
      selectedItemId: nextSelectedFurnitureId,
    });

    set({
      rooms: cloneRooms(previous.rooms),
      walls: cloneWalls(previous.walls),
      selectedRoomId: nextSelectedRoomId,
      selectedWallId: nextSelectedWallId,
      history: history.slice(0, -1),
      future: [
        {
          rooms: cloneRooms(currentRooms),
          placedItems: clonePlacedItems(currentPlacedItems),
          walls: cloneWalls(currentWalls),
        },
        ...future,
      ],
    });
  },
  redo: () => {
    const history = get().history;
    const future = get().future;
    const currentRooms = get().rooms;
    const currentWalls = get().walls;
    const currentPlacedItems = useFurnitureStore.getState().placedItems;

    if (future.length === 0) {
      return;
    }

    const next = future[0];
    const nextSelectedRoomId = next.rooms.some((room) => room.id === get().selectedRoomId)
      ? get().selectedRoomId
      : undefined;
    const nextSelectedWallId = next.walls.some((wall) => wall.id === get().selectedWallId)
      ? get().selectedWallId
      : undefined;
    const currentSelectedFurnitureId = useFurnitureStore.getState().selectedFurnitureId;
    const nextSelectedFurnitureId = next.placedItems.some(
      (item) => item.id === currentSelectedFurnitureId
    )
      ? currentSelectedFurnitureId
      : undefined;

    useFurnitureStore.setState({
      placedItems: clonePlacedItems(next.placedItems),
      selectedFurnitureId: nextSelectedFurnitureId,
      selectedItemId: nextSelectedFurnitureId,
    });

    set({
      rooms: cloneRooms(next.rooms),
      walls: cloneWalls(next.walls),
      selectedRoomId: nextSelectedRoomId,
      selectedWallId: nextSelectedWallId,
      history: [
        ...history,
        {
          rooms: cloneRooms(currentRooms),
          placedItems: clonePlacedItems(currentPlacedItems),
          walls: cloneWalls(currentWalls),
        },
      ],
      future: future.slice(1),
    });
  },
}));

if (typeof window !== 'undefined') {
  useFloorPlanStore.subscribe((state) => {
    const payload: StoredFloorPlan = {
      rooms: state.rooms,
      walls: state.walls,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  });
}
