import jsPDF from 'jspdf';
import type { FloorRoom } from '../store/useFloorPlanStore';

const pixelsToMeters = (value: number) => value / 40;

const roomArea = (room: FloorRoom) => pixelsToMeters(room.width) * pixelsToMeters(room.height);

export async function exportToPdf(canvasImageUrl: string, rooms: FloorRoom[]) {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const headerY = 12;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('مخطط الشقة - شقتي', pageWidth / 2, headerY, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(
    new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
    pageWidth / 2,
    headerY + 6,
    { align: 'center' }
  );

  const imageTop = 24;
  const imageWidth = pageWidth - margin * 2;
  const imageHeight = Math.min(110, pageHeight * 0.48);
  pdf.addImage(canvasImageUrl, 'PNG', margin, imageTop, imageWidth, imageHeight);

  const tableTop = imageTop + imageHeight + 10;
  const columnWidths = [78, 32, 32, 36];
  const headers = ['الغرفة', 'العرض', 'الطول', 'المساحة'];
  let currentX = margin;

  pdf.setDrawColor(203, 213, 225);
  pdf.setFillColor(248, 250, 252);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);

  headers.forEach((header, index) => {
    const width = columnWidths[index];
    pdf.rect(currentX, tableTop, width, 10, 'FD');
    pdf.text(header, currentX + width / 2, tableTop + 6.5, { align: 'center' });
    currentX += width;
  });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);

  rooms.forEach((room, index) => {
    const rowY = tableTop + 10 + index * 9;
    const values = [
      room.name,
      `${pixelsToMeters(room.width).toFixed(1)} م`,
      `${pixelsToMeters(room.height).toFixed(1)} م`,
      `${roomArea(room).toFixed(1)} م²`,
    ];

    let rowX = margin;
    values.forEach((value, valueIndex) => {
      const width = columnWidths[valueIndex];
      pdf.rect(rowX, rowY, width, 9);
      pdf.text(value, rowX + width / 2, rowY + 5.8, { align: 'center' });
      rowX += width;
    });
  });

  pdf.setFontSize(10);
  pdf.text('تم التصدير بواسطة شقتي', pageWidth / 2, pageHeight - 8, { align: 'center' });
  pdf.save('مخطط-شقتي.pdf');
}
