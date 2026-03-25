import { create } from 'zustand';
import type { FloorRoom, Wall } from './useFloorPlanStore';
import type { PlacedFurniture } from './useFurnitureStore';

// ─── Types ───────────────────────────────────────────────
export type Project = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  rooms: FloorRoom[];
  walls: Wall[];
  placedItems: PlacedFurniture[];
  thumbnail?: string;
};

type MultiProjectState = {
  projects: Project[];
  activeProjectId: string | null;
  loadProjects: (userId: string) => void;
  createProject: (userId: string, name: string) => string;
  deleteProject: (userId: string, projectId: string) => void;
  renameProject: (userId: string, projectId: string, name: string) => void;
  duplicateProject: (userId: string, projectId: string) => string;
  saveProjectData: (
    userId: string,
    projectId: string,
    data: { rooms: FloorRoom[]; walls: Wall[]; placedItems: PlacedFurniture[] },
    thumbnail?: string
  ) => void;
  setActiveProject: (projectId: string | null) => void;
  getProject: (projectId: string) => Project | undefined;
};

// ─── Helpers ─────────────────────────────────────────────
const getStorageKey = (userId: string) => `shaqti_projects_${userId}`;
const ACTIVE_KEY = 'shaqti_active_project';

const generateId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.floor(Math.random() * 100_000)}`;

const loadFromStorage = (userId: string): Project[] => {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    return raw ? (JSON.parse(raw) as Project[]) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (userId: string, projects: Project[]) => {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(projects));
};

// ─── Store ───────────────────────────────────────────────
export const useMultiProjectStore = create<MultiProjectState>((set, get) => ({
  projects: [],
  activeProjectId: localStorage.getItem(ACTIVE_KEY) || null,

  loadProjects: (userId) => {
    const projects = loadFromStorage(userId);
    set({ projects });
  },

  createProject: (userId, name) => {
    const newProject: Project = {
      id: generateId(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rooms: [],
      walls: [],
      placedItems: [],
    };
    const projects = [...get().projects, newProject];
    set({ projects });
    saveToStorage(userId, projects);
    return newProject.id;
  },

  deleteProject: (userId, projectId) => {
    const projects = get().projects.filter((p) => p.id !== projectId);
    set({
      projects,
      activeProjectId: get().activeProjectId === projectId ? null : get().activeProjectId,
    });
    saveToStorage(userId, projects);
    if (get().activeProjectId === projectId) {
      localStorage.removeItem(ACTIVE_KEY);
    }
  },

  renameProject: (userId, projectId, name) => {
    const projects = get().projects.map((p) =>
      p.id === projectId ? { ...p, name, updatedAt: new Date().toISOString() } : p
    );
    set({ projects });
    saveToStorage(userId, projects);
  },

  duplicateProject: (userId, projectId) => {
    const original = get().projects.find((p) => p.id === projectId);
    if (!original) return '';
    const newProject: Project = {
      ...original,
      id: generateId(),
      name: `${original.name} (نسخة)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rooms: original.rooms.map((r) => ({ ...r })),
      walls: original.walls.map((w) => ({ ...w })),
      placedItems: original.placedItems.map((p) => ({ ...p })),
    };
    const projects = [...get().projects, newProject];
    set({ projects });
    saveToStorage(userId, projects);
    return newProject.id;
  },

  saveProjectData: (userId, projectId, data, thumbnail) => {
    const projects = get().projects.map((p) =>
      p.id === projectId
        ? {
          ...p,
          rooms: data.rooms,
          walls: data.walls,
          placedItems: data.placedItems,
          updatedAt: new Date().toISOString(),
          ...(thumbnail !== undefined ? { thumbnail } : {}),
        }
        : p
    );
    set({ projects });
    saveToStorage(userId, projects);
  },

  setActiveProject: (projectId) => {
    set({ activeProjectId: projectId });
    if (projectId) {
      localStorage.setItem(ACTIVE_KEY, projectId);
    } else {
      localStorage.removeItem(ACTIVE_KEY);
    }
  },

  getProject: (projectId) => {
    return get().projects.find((p) => p.id === projectId);
  },
}));
