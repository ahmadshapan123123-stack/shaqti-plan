import { useEffect } from 'react';
import { useFloorPlanStore } from '../store/useFloorPlanStore';
import { useFurnitureStore } from '../store/useFurnitureStore';

type UseKeyboardShortcutsOptions = {
  enabled: boolean;
  saveProject: () => void;
};

export const useKeyboardShortcuts = ({
  enabled,
  saveProject,
}: UseKeyboardShortcutsOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      // CRITICAL: Skip if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      const tag = target.tagName;
      const isEditable = target.isContentEditable;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || isEditable) return;

      const ctrl = e.ctrlKey || e.metaKey;

      // Undo/Redo
      if (ctrl && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        useFloorPlanStore.getState().undo();
        return;
      }
      if ((ctrl && e.shiftKey && e.key.toUpperCase() === 'Z') || 
          (ctrl && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        useFloorPlanStore.getState().redo();
        return;
      }

      // Save
      if (ctrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        // trigger save event for HomePage to handle
        window.dispatchEvent(new CustomEvent('app:save'));
        return;
      }

      // Tool shortcuts (no modifier)
      if (!ctrl && !e.altKey) {
        switch(e.key.toLowerCase()) {
          case 'v': 
            e.preventDefault();
            useFloorPlanStore.getState().setActiveTool('select');
            break;
          case 'r':
            e.preventDefault();
            const selFurniture = useFurnitureStore.getState().selectedItemId;
            if (selFurniture) {
              useFurnitureStore.getState().rotateSelected(45);
            } else {
              useFloorPlanStore.getState().setActiveTool('draw-room');
            }
            break;
          case 'w':
            e.preventDefault();
            useFloorPlanStore.getState().setActiveTool('draw-wall');
            break;
          case 'escape':
            e.preventDefault();
            useFloorPlanStore.getState().selectRoom(undefined);
            useFloorPlanStore.getState().selectWall(undefined);
            useFurnitureStore.getState().selectFurniture(undefined);
            break;
          case 'delete':
          case 'backspace':
            e.preventDefault();
            const roomId = useFloorPlanStore.getState().selectedRoomId;
            const itemId = useFurnitureStore.getState().selectedItemId;
            if (itemId) {
              useFurnitureStore.getState().removePlaced(itemId);
            } else if (roomId) {
              useFloorPlanStore.getState().deleteRoom(roomId);
            }
            break;
        }
      }
    };

    // MUST be on window, not div
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, saveProject]);
};
