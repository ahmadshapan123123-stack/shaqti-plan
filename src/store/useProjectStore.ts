import { create } from 'zustand';
import type { PlanningTask } from '../types/task';

const initialTasks: PlanningTask[] = [
  {
    id: 'analysis',
    title: 'تحليل الموقع',
    description: 'تجميع الملاحظات من أصحاب المصلحة وتحديد القيود التشغيلية.',
    priority: 'high',
    effort: '٣ أيام',
  },
  {
    id: 'design',
    title: 'تصميم الواجهات',
    description: 'حجز مكونات RTL واختبار انسيابية النص العربي والرموز.',
    priority: 'medium',
    effort: '٤ أيام',
  },
  {
    id: 'development',
    title: 'تطوير الواجهة والكانفس',
    description: 'رسم الكائنات باستخدام Konva وربط النماذج مع الحالة المركزية.',
    priority: 'high',
    effort: '٦ أيام',
  },
  {
    id: 'automation',
    title: 'آليات السحب والإفلات',
    description: 'تنفيذ إعادة ترتيب مرن باستخدام DnD Kit وحفظ الوضعية.',
    priority: 'medium',
    effort: '٣ أيام',
  },
  {
    id: 'launch',
    title: 'التحضير للإطلاق',
    description: 'إعداد تصدير الصور وحزمة رضا الزبائن والوثائق.',
    priority: 'low',
    effort: '٢ أيام',
  },
];

type ProjectState = {
  tasks: PlanningTask[];
  setTasks: (tasks: PlanningTask[]) => void;
};

export const useProjectStore = create<ProjectState>((set) => ({
  tasks: initialTasks,
  setTasks: (tasks) => set({ tasks }),
}));
