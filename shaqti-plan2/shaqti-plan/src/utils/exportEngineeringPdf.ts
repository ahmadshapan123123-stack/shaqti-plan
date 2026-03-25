import jsPDF from 'jspdf';
import { type FloorRoom } from '../store/useFloorPlanStore';

export interface ProjectInfo {
  projectName: string;
  ownerName: string;
  scale: '1:50' | '1:100' | '1:75';
  date: string;
  drawnBy: string;
  notes?: string;
}

export async function exportEngineeringPdf(
  rooms: FloorRoom[],
  canvasImageUrl: string,
  projectInfo: ProjectInfo,
  kashifLogoUrl: string
) {
  // A3 landscape for more space
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a3'
  });

  const pageW = 420; // A3 landscape width mm
  const pageH = 297; // A3 landscape height mm

  // ── TITLE BLOCK (bottom strip, 40mm height) ──
  const titleBlockY = pageH - 40;

  // Outer border of entire sheet
  pdf.setDrawColor(50, 50, 50);
  pdf.setLineWidth(0.8);
  pdf.rect(10, 10, pageW - 20, pageH - 20);

  // Title block background
  pdf.setFillColor(248, 250, 252);
  pdf.rect(10, titleBlockY, pageW - 20, 30, 'F');

  // Title block top border line
  pdf.setLineWidth(0.5);
  pdf.line(10, titleBlockY, pageW - 10, titleBlockY);

  // Vertical dividers in title block
  // Section 1: Logo (40mm)
  pdf.line(50, titleBlockY, 50, pageH - 10);
  // Section 2: Project info (100mm)
  pdf.line(150, titleBlockY, 150, pageH - 10);
  // Section 3: Drawing info (80mm)
  pdf.line(230, titleBlockY, 230, pageH - 10);
  // Section 4: Scale/Date (60mm)
  pdf.line(290, titleBlockY, 290, pageH - 10);
  // Section 5: Approval (remaining)

  // Helper to draw Arabic text using Canvas to overcome jsPDF font limitations
  const drawArabicText = (text: string, x: number, y: number, size: number, align: 'right' | 'left' | 'center' = 'right', color: string = '#1e293b', bold: boolean = false) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.font = `${bold ? 'bold ' : ''}${size * 4}px Cairo, Arial, sans-serif`;
    const metrics = ctx.measureText(text);
    canvas.width = metrics.width + 20;
    canvas.height = size * 6;
    
    ctx.font = `${bold ? 'bold ' : ''}${size * 4}px Cairo, Arial, sans-serif`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const imgData = canvas.toDataURL('image/png');
    const imgW = (canvas.width / 4) * (25.4 / 96) * 1.5; // Scale and convert to mm
    const imgH = (canvas.height / 4) * (25.4 / 96) * 1.5;
    
    let adjustedX = x;
    if (align === 'right') adjustedX = x - imgW;
    else if (align === 'center') adjustedX = x - imgW / 2;
    
    pdf.addImage(imgData, 'PNG', adjustedX, y - imgH / 2, imgW, imgH);
  };

  // Logo section
  try {
    pdf.addImage(kashifLogoUrl, 'PNG', 13, titleBlockY + 5, 34, 18);
  } catch(e) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(37, 99, 235);
    pdf.text('KASHIF', 20, titleBlockY + 16);
  }

  // Project info section
  drawArabicText('اسم المشروع', 148, titleBlockY + 6, 7, 'right', '#64748b');
  drawArabicText('اسم المالك', 148, titleBlockY + 14, 7, 'right', '#64748b');
  drawArabicText('ملاحظات', 148, titleBlockY + 22, 7, 'right', '#64748b');

  drawArabicText(projectInfo.projectName || 'مشروع جديد', 53, titleBlockY + 8, 9, 'left', '#1e293b', true);
  drawArabicText(projectInfo.ownerName || '---', 53, titleBlockY + 16, 9, 'left', '#1e293b');
  drawArabicText(projectInfo.notes || '---', 53, titleBlockY + 24, 9, 'left', '#1e293b');

  // Drawing info section
  drawArabicText('رسم بواسطة', 228, titleBlockY + 6, 7, 'right', '#64748b');
  drawArabicText('المقياس', 228, titleBlockY + 14, 7, 'right', '#64748b');
  drawArabicText('نوع المخطط', 228, titleBlockY + 22, 7, 'right', '#64748b');

  drawArabicText(projectInfo.drawnBy || 'كاشف', 153, titleBlockY + 8, 9, 'left', '#1e293b');
  pdf.setFontSize(9);
  pdf.text(projectInfo.scale, 153, titleBlockY + 16); // English text is fine
  drawArabicText('مخطط معماري - مسقط أفقي', 153, titleBlockY + 24, 9, 'left', '#1e293b');

  // Scale/Date section
  drawArabicText('التاريخ', 288, titleBlockY + 6, 7, 'right', '#64748b');
  drawArabicText('رقم اللوحة', 288, titleBlockY + 14, 7, 'right', '#64748b');

  pdf.text(projectInfo.date, 233, titleBlockY + 8);
  pdf.text('A-01', 233, titleBlockY + 16);

  // Approval section
  drawArabicText('اعتماد', 410, titleBlockY + 6, 7, 'right', '#64748b');
  drawArabicText('توقيع', 410, titleBlockY + 18, 7, 'right', '#64748b');
  pdf.setLineWidth(0.3);
  pdf.line(295, titleBlockY + 22, pageW - 13, titleBlockY + 22);

  // ── DRAWING AREA ──
  const drawAreaX = 10;
  const drawAreaY = 10;
  const drawAreaW = pageW - 20 - 60; // leave 60mm for room schedule
  const drawAreaH = titleBlockY - 10 - 5;

  // Vertical line separating drawing from room schedule
  pdf.setLineWidth(0.4);
  pdf.line(drawAreaX + drawAreaW, drawAreaY, 
           drawAreaX + drawAreaW, titleBlockY);

  // Floor plan image
  if (canvasImageUrl) {
    const imgX = drawAreaX + 5;
    const imgY = drawAreaY + 5;
    const imgW = drawAreaW - 10;
    const imgH = drawAreaH - 10;

    pdf.addImage(canvasImageUrl, 'PNG', imgX, imgY, imgW, imgH,
                 undefined, 'FAST');

    // Scale bar
    const scaleBarY = drawAreaY + drawAreaH - 8;
    const scaleNum = parseInt(projectInfo.scale.split(':')[1]);
    const barLengthMm = 20; // 20mm on paper
    const barLengthM = (barLengthMm * scaleNum) / 1000; // real meters

    pdf.setLineWidth(0.5);
    pdf.setDrawColor(30, 41, 59);
    pdf.line(imgX, scaleBarY, imgX + barLengthMm, scaleBarY);
    pdf.line(imgX, scaleBarY - 2, imgX, scaleBarY + 2);
    pdf.line(imgX + barLengthMm, scaleBarY - 2, 
             imgX + barLengthMm, scaleBarY + 2);

    pdf.setFontSize(7);
    pdf.setTextColor(30, 41, 59);
    pdf.text('0', imgX, scaleBarY - 3);
    pdf.text(`${barLengthM}م`, imgX + barLengthMm, scaleBarY - 3);

    // North arrow
    const northX = imgX + imgW - 15;
    const northY = imgY + 15;
    pdf.setLineWidth(0.5);
    pdf.line(northX, northY + 8, northX, northY - 8);
    pdf.line(northX, northY - 8, northX - 3, northY);
    pdf.line(northX, northY - 8, northX + 3, northY);
    pdf.setFontSize(7);
    pdf.text('N', northX - 1.5, northY - 10);
  }

  // ── ROOM SCHEDULE TABLE (right panel, 60mm wide) ──
  const tableX = drawAreaX + drawAreaW + 2;
  const tableW = 56;

  // Table header
  pdf.setFillColor(37, 99, 235);
  pdf.rect(tableX, drawAreaY, tableW, 8, 'F');
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('جدول الغرف', tableX + tableW / 2, drawAreaY + 5.5, 
           { align: 'center' });

  // Table column headers
  const colY = drawAreaY + 8;
  pdf.setFillColor(241, 245, 249);
  pdf.rect(tableX, colY, tableW, 7, 'F');
  pdf.setFontSize(6.5);
  pdf.setTextColor(71, 85, 105);
  pdf.setFont('helvetica', 'bold');
  pdf.text('الغرفة', tableX + tableW - 3, colY + 5, { align: 'right' });
  pdf.text('المساحة', tableX + 20, colY + 5, { align: 'center' });
  pdf.text('%', tableX + 8, colY + 5, { align: 'center' });

  pdf.setLineWidth(0.3);
  pdf.setDrawColor(226, 232, 240);
  pdf.line(tableX, colY + 7, tableX + tableW, colY + 7);
  pdf.line(tableX + 14, colY, tableX + 14, titleBlockY);
  pdf.line(tableX + 30, colY, tableX + 30, titleBlockY);

  // Calculate total area
  const totalArea = rooms.reduce((sum, r) => {
    return sum + (r.width / 40) * (r.height / 40);
  }, 0);

  // Room rows
  let rowY = colY + 7;
  const rowH = 9;

  rooms.forEach((room, index) => {
    const area = ((room.width / 40) * (room.height / 40)).toFixed(1);
    const pct = ((parseFloat(area) / totalArea) * 100).toFixed(0);

    // Alternating row color
    if (index % 2 === 0) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(tableX, rowY, tableW, rowH, 'F');
    }

    // Color indicator
    const hex = room.color || '#dbeafe';
    const rColors = parseInt(hex.slice(1,3), 16);
    const gColors = parseInt(hex.slice(3,5), 16);
    const bColors = parseInt(hex.slice(5,7), 16);
    pdf.setFillColor(rColors, gColors, bColors);
    pdf.rect(tableX + tableW - 4, rowY + 2, 3, 5, 'F');

    drawArabicText(room.name, tableX + tableW - 6, rowY + rowH/2, 6.5, 'right', '#1e293b');
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(30, 41, 59);
    pdf.text(`${area}m2`, tableX + 26, rowY + 6, { align: 'right' });
    pdf.text(`${pct}%`, tableX + 12, rowY + 6, { align: 'center' });

    pdf.setDrawColor(226, 232, 240);
    pdf.line(tableX, rowY + rowH, tableX + tableW, rowY + rowH);
    rowY += rowH;
  });

  // Total row
  pdf.setFillColor(37, 99, 235);
  pdf.rect(tableX, rowY, tableW, 9, 'F');
  drawArabicText('الإجمالي', tableX + tableW - 3, rowY + 4.5, 7.5, 'right', '#ffffff', true);
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text(`${totalArea.toFixed(1)}m2`, tableX + 26, rowY + 6.5, { align: 'right' });
  pdf.text('100%', tableX + 12, rowY + 6.5, { align: 'center' });

  // ── SHEET BORDER (final thick border) ──
  pdf.setDrawColor(30, 41, 59);
  pdf.setLineWidth(1.2);
  pdf.rect(8, 8, pageW - 16, pageH - 16);

  pdf.save(`${projectInfo.projectName || 'مخطط'}-${projectInfo.scale}.pdf`);
}
