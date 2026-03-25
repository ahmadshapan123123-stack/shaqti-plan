import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FloorRoom, Wall } from './useFloorPlanStore';
import type { PlacedFurniture } from './useFurnitureStore';

export type Project = {
  id: string;
  name: string;
  thumbnail?: string;  // base64 PNG snapshot
  createdAt: number;
  updatedAt: number;
  data: {
    rooms: FloorRoom[];
    walls: Wall[];
    placedItems: PlacedFurniture[];
  };
};

interface ProjectsState {
  projects: Project[];
  currentProjectId: string | null;
  saveCurrentProject: (
    name: string,
    rooms: FloorRoom[],
    walls: Wall[],
    placedItems: PlacedFurniture[],
    thumbnail?: string
  ) => void;
  loadProject: (id: string) => { rooms: FloorRoom[]; walls: Wall[]; placedItems: PlacedFurniture[] } | null;
  deleteProject: (id: string) => void;
  newProject: () => void;
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,

      saveCurrentProject: (name, rooms, walls, placedItems, thumbnail) => {
        const { currentProjectId, projects } = get();
        const existing = projects.find((p) => p.id === currentProjectId);

        if (existing) {
          set({
            projects: projects.map((p) =>
              p.id === currentProjectId
                ? {
                    ...p,
                    name,
                    thumbnail: thumbnail || p.thumbnail,
                    updatedAt: Date.now(),
                    data: { rooms, walls, placedItems },
                  }
                : p
            ),
          });
        } else {
          const newProject: Project = {
            id: crypto.randomUUID(),
            name,
            thumbnail,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            data: { rooms, walls, placedItems },
          };
          set({
            projects: [newProject, ...projects],
            currentProjectId: newProject.id,
          });
        }
      },

      loadProject: (id) => {
        const project = get().projects.find((p) => p.id === id);
        if (!project) return null;
        set({ currentProjectId: id });
        return project.data;
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
        }));
      },

      newProject: () => {
        set({ currentProjectId: null });
      },
    }),
    {
      name: 'shaqti-projects-store',
    }
  )
);
