export type PriorityLevel = 'low' | 'medium' | 'high';

export interface PlanningTask {
  id: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  effort: string;
}
