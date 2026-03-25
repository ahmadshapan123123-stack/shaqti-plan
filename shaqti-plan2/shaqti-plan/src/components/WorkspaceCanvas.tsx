import { Layer, Rect, Stage, Text } from 'react-konva';
import { Fragment } from 'react';
import type { CanvasElement } from '../types/canvas';

const canvasElements: CanvasElement[] = [
  { id: 'zone-a', label: 'منطقة الفكرة', x: 30, y: 30, width: 180, height: 90, fill: '#fb923c' },
  { id: 'zone-b', label: 'منصة العرض', x: 250, y: 40, width: 150, height: 120, fill: '#38bdf8' },
  { id: 'zone-c', label: 'مسار التنفيذ', x: 50, y: 160, width: 320, height: 120, fill: '#a855f7' },
];

export const WorkspaceCanvas = () => {
  return (
    <div
      dir="ltr"
      className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/80 p-3 shadow-[0_25px_120px_-30px_rgba(15,23,42,0.9)]"
    >
      <Stage width={460} height={320}>
        <Layer>
          <Rect width={460} height={320} fill="rgba(15, 23, 42, 0.65)" cornerRadius={32} />
          {canvasElements.map((element) => (
            <Fragment key={element.id}>
              <Rect
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                fill={element.fill}
                cornerRadius={20}
                shadowBlur={20}
                shadowColor="#000"
              />
              <Text
                text={element.label}
                x={element.x + 12}
                y={element.y + 12}
                fontSize={18}
                fontFamily="Cairo, Inter, sans-serif"
                fill="#f8fafc"
              />
            </Fragment>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};
