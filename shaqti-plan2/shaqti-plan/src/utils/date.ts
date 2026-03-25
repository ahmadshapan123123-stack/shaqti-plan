export const formatArabicDate = (date: Date) =>
  new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date);
