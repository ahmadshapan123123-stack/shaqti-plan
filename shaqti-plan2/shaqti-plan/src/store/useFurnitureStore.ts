import { create } from 'zustand';
import type { FurnitureCategory } from '../constants/furnitureCategories';
import { DEFAULT_FURNITURE_ITEMS } from '../data/furnitureData';
import { useFloorPlanStore } from './useFloorPlanStore';

export type FurnitureItem = {
  id: string;
  name: string;
  category: FurnitureCategory;
  imageUrl: string;
  realWidth: number;
  realHeight: number;
  realDepth?: number; // 3D height (floor to ceiling), optional for 2D furniture
};

export type PlacedFurniture = {
  id: string;
  furnitureId: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  customDepth?: number; // User can override the default height
  customWidth?: number; // User can override the default width
  customHeight?: number; // User can override the default height (2D)
  roomId?: string; // Link to room for layers
  isHidden?: boolean;
  isLocked?: boolean;
};

type PlacedFurnitureInput = Omit<PlacedFurniture, 'id' | 'scaleX' | 'scaleY'> & {
  id?: string;
  scaleX?: number;
  scaleY?: number;
};

// Minimum furniture dimensions in meters (5cm)
export const MIN_DIMENSION = 0.05;
export const GRID_SNAP = 40; // 40 pixels = 1 meter

const STORAGE_KEY = 'shaqti_furniture';
const LIBRARY_KEY = 'shaqti_furniture_library';
const SEEDED_KEY = 'shaqti_furniture_seeded';
const VERSION_KEY = 'shaqti_furniture_version';
const CURRENT_LIBRARY_VERSION = '3.0';

const cloneLibrary = (items: FurnitureItem[]) => items.map((item) => ({ ...item }));

const resetFurnitureStorageForVersion = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (window.localStorage.getItem(VERSION_KEY) === CURRENT_LIBRARY_VERSION) {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LIBRARY_KEY);
    window.localStorage.removeItem(SEEDED_KEY);
    window.localStorage.setItem(VERSION_KEY, CURRENT_LIBRARY_VERSION);
  } catch {
    // Ignore storage failures and fall back to runtime defaults.
  }
};

const loadPlacedFurniture = (): PlacedFurniture[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const cached = window.localStorage.getItem(STORAGE_KEY);
    return cached ? (JSON.parse(cached) as PlacedFurniture[]) : [];
  } catch {
    return [];
  }
};

const loadLibrary = (): FurnitureItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const serialized = window.localStorage.getItem(LIBRARY_KEY);
    return serialized ? (JSON.parse(serialized) as FurnitureItem[]) : [];
  } catch {
    return [];
  }
};

const loadSeededFlag = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return window.localStorage.getItem(SEEDED_KEY) === 'true';
  } catch {
    return false;
  }
};

resetFurnitureStorageForVersion();

type FurnitureState = {
  furnitureLibrary: FurnitureItem[];
  placedItems: PlacedFurniture[];
  isSeeded: boolean;
  selectedFurnitureId?: string;
  selectedItemId?: string;
  initializeLibrary: () => void;
  addToLibrary: (item: FurnitureItem) => void;
  replaceFurnitureLibrary: (items: FurnitureItem[]) => void;
  replacePlacedItems: (items: PlacedFurniture[]) => void;
  placeOnCanvas: (item: PlacedFurnitureInput) => void;
  updatePlaced: (id: string, changes: Partial<PlacedFurniture>) => void;
  updatePlacedDimensions: (id: string, changes: { customWidth?: number; customHeight?: number }) => void;
  removePlaced: (id: string) => void;
  removePlacedByRoomId: (roomId: string) => void;
  selectFurniture: (id?: string) => void;
  rotateSelected: (degrees: number) => void;
  setPlacedItems: (items: PlacedFurniture[]) => void;
};

const initialLibrary = loadLibrary();
const initialIsSeeded = loadSeededFlag() || initialLibrary.length > 0;

const createPlacedItem = (item: PlacedFurnitureInput): PlacedFurniture => ({
  id:
    item.id ??
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 1_000)}`),
  furnitureId: item.furnitureId,
  x: item.x,
  y: item.y,
  rotation: item.rotation,
  scaleX: item.scaleX ?? 1,
  scaleY: item.scaleY ?? 1,
});

export const useFurnitureStore = create<FurnitureState>((set, get) => ({
  furnitureLibrary: cloneLibrary(initialLibrary),
  placedItems: loadPlacedFurniture(),
  isSeeded: initialIsSeeded,
  selectedFurnitureId: undefined,
  selectedItemId: undefined,
  initializeLibrary: () => {
    if (get().isSeeded && get().furnitureLibrary.length > 0) {
      return;
    }

    set({
      furnitureLibrary: cloneLibrary(DEFAULT_FURNITURE_ITEMS),
      isSeeded: true,
      selectedFurnitureId: undefined,
      selectedItemId: undefined,
    });
  },
  addToLibrary: (item) =>
    set((state) => ({
      furnitureLibrary: [...state.furnitureLibrary, item],
      isSeeded: true,
    })),
  replaceFurnitureLibrary: (items) =>
    set({
      furnitureLibrary: cloneLibrary(items),
      isSeeded: true,
      selectedFurnitureId: undefined,
      selectedItemId: undefined,
    }),
  replacePlacedItems: (items) =>
    set({
      placedItems: items.map((item) => ({ ...item })),
      selectedFurnitureId: undefined,
      selectedItemId: undefined,
    }),
  placeOnCanvas: (item) => {
    useFloorPlanStore.getState().snapshot();
    set((state) => {
      const placedItem = createPlacedItem(item);
      return {
        placedItems: [...state.placedItems, placedItem],
        selectedFurnitureId: placedItem.id,
        selectedItemId: placedItem.id,
      };
    });
  },
  updatePlaced: (id, changes) => {
    useFloorPlanStore.getState().snapshot();
    set((state) => ({
      placedItems: state.placedItems.map((placed) =>
        placed.id === id ? { ...placed, ...changes } : placed
      ),
    }));
  },
  updatePlacedDimensions: (id, changes) => {
    const { placedItems, furnitureLibrary } = useFurnitureStore.getState();
    const placed = placedItems.find((p) => p.id === id);
    if (!placed) return;

    const furniture = furnitureLibrary.find((f) => f.id === placed.furnitureId);
    if (!furniture) return;

    // Calculate new scale based on dimension changes
    let newScaleX = placed.scaleX;
    let newScaleY = placed.scaleY;

    if (changes.customWidth !== undefined && changes.customWidth > 0) {
      // Scale relative to original
      const originalScale = placed.scaleX / (placed.customWidth || furniture.realWidth);
      newScaleX = changes.customWidth * originalScale;
    }

    if (changes.customHeight !== undefined && changes.customHeight > 0) {
      const originalScale = placed.scaleY / (placed.customHeight || furniture.realHeight);
      newScaleY = changes.customHeight * originalScale;
    }

    useFloorPlanStore.getState().snapshot();
    set((state) => ({
      placedItems: state.placedItems.map((p) =>
        p.id === id
          ? {
            ...p,
            customWidth: changes.customWidth,
            customHeight: changes.customHeight,
            scaleX: newScaleX,
            scaleY: newScaleY,
          }
          : p
      ),
    }));
  },
  removePlaced: (id) => {
    useFloorPlanStore.getState().snapshot();
    set((state) => ({
      placedItems: state.placedItems.filter((placed) => placed.id !== id),
      selectedFurnitureId: state.selectedFurnitureId === id ? undefined : state.selectedFurnitureId,
      selectedItemId: state.selectedItemId === id ? undefined : state.selectedItemId,
    }));
  },
  selectFurniture: (id) =>
    set({
      selectedFurnitureId: id,
      selectedItemId: id,
    }),
  rotateSelected: (degrees) => {
    const { selectedFurnitureId } = useFurnitureStore.getState();
    if (!selectedFurnitureId) {
      return;
    }
    useFloorPlanStore.getState().snapshot();
    set((state) => ({
      placedItems: state.placedItems.map((placed) =>
        placed.id === selectedFurnitureId
          ? { ...placed, rotation: (((placed.rotation + degrees) % 360) + 360) % 360 }
          : placed
      ),
    }));
  },
  removePlacedByRoomId: (roomId: string) => {
    set((state) => ({
      placedItems: state.placedItems.filter(item => item.roomId !== roomId)
    }));
  },
  setPlacedItems: (items: PlacedFurniture[]) => set({ placedItems: items.map(i => ({ ...i })) }),
}));

if (typeof window !== 'undefined') {
  useFurnitureStore.subscribe((state) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.placedItems));
    window.localStorage.setItem(LIBRARY_KEY, JSON.stringify(state.furnitureLibrary));
    window.localStorage.setItem(SEEDED_KEY, String(state.isSeeded));
    window.localStorage.setItem(VERSION_KEY, CURRENT_LIBRARY_VERSION);
  });
}
