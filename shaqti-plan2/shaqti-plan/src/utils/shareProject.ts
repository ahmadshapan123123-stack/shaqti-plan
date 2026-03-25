import { type FloorRoom } from '../store/useFloorPlanStore';
import { type PlacedFurniture } from '../store/useFurnitureStore';

export function encodeProjectToUrl(
  rooms: FloorRoom[],
  placedItems: PlacedFurniture[],
  projectName: string,
  canvasImageUrl: string
): string {
  const data = {
    v: '1.2',
    n: projectName,
    r: rooms.map(r => ({
      i: r.id,
      n: r.name,
      x: r.x,
      y: r.y,
      w: r.width,
      h: r.height,
      c: r.color,
      s: r.strokeColor,
      o: r.openings?.map(o => ({
        t: o.type,
        s: o.side,
        p: o.position,
        w: o.width
      }))
    })),
    p: placedItems.map(p => ({
      f: p.furnitureId,
      x: p.x,
      y: p.y,
      r: p.rotation,
      w: p.customWidth,
      h: p.customHeight
    })),
    t: canvasImageUrl.substring(0, 1000), // Only include a tiny part or better, handle externally
    a: new Date().toISOString(),
  };

  try {
    const json = JSON.stringify(data);
    // Use btoa + encodeURIComponent for a safer base64 encoding of UTF-8 strings
    const compressed = btoa(unescape(encodeURIComponent(json)));
    
    const baseUrl = window.location.origin;
    return `${baseUrl}/review?data=${compressed}`;
  } catch (e) {
    console.error('Encoding failed', e);
    return '';
  }
}

export function decodeProjectFromUrl(): any | null {
  const params = new URLSearchParams(window.location.search);
  const data = params.get('data');
  if (!data) return null;
  
  try {
    const json = decodeURIComponent(escape(atob(data)));
    return JSON.parse(json);
  } catch (e) {
    console.error('Decoding failed', e);
    return null;
  }
}
