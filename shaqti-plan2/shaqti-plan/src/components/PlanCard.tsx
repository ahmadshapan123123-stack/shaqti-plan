import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { CalendarDays, GripVertical } from 'lucide-react';
import type { PlanningTask } from '../types/task';

const priorityStyles: Record<PlanningTask['priority'], string> = {
  high: 'border-rose-400/60 bg-rose-900/30',
  medium: 'border-amber-400/60 bg-amber-900/40',
  low: 'border-emerald-400/60 bg-emerald-900/30',
};

const priorityLabels: Record<PlanningTask['priority'], string> = {
  high: 'أولوية عالية',
  medium: 'أولوية متوسطة',
  low: 'أولوية منخفضة',
};

type PlanCardProps = {
  task: PlanningTask;
};

export const PlanCard = ({ task }: PlanCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-start gap-3 rounded-2xl border p-4 transition-colors ${priorityStyles[task.priority]} shadow-[0_4px_45px_-20px_rgba(15,23,42,0.9)]`}
    >
      <div className="mt-1">
        <GripVertical className="h-5 w-5 text-slate-300" />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">{task.title}</h3>
          <CalendarDays className="h-5 w-5 text-slate-200" />
        </div>
        <p className="text-sm text-slate-200">{task.description}</p>
        <div className="flex items-center justify-between text-xs font-medium uppercase text-slate-300">
          <span>{priorityLabels[task.priority]}</span>
          <span className="text-slate-100">{task.effort}</span>
        </div>
      </div>
    </article>
  );
};
