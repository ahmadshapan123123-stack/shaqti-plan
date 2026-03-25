export const FURNITURE_CATEGORIES = ['living room', 'bedroom', 'kitchen', 'bathroom', 'office', 'outdoor', 'decor', 'doors windows'] as const;
export type FurnitureCategory = (typeof FURNITURE_CATEGORIES)[number];

export const FURNITURE_CATEGORY_LABELS: Record<FurnitureCategory, string> = {
  'living room': 'غرفة المعيشة',
  bedroom: 'غرفة النوم',
  kitchen: 'المطبخ',
  bathroom: 'الحمام',
  office: 'المكتب',
  outdoor: 'مساحات خارجية',
  decor: 'ديكور ونباتات',
  'doors windows': 'أبواب ونوافذ',
};
