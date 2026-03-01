import { jsPDF } from 'jspdf';
import type { ScheduleEntry } from '../components/SchedulePlanner';
import type { Weekday } from '../types';

const WEEKDAYS: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_LABELS: Record<Weekday, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
};

const START_HOUR = 8;
const END_HOUR = 20;

// Category → RGB colors matching the Tailwind classes in the app
const PDF_COLORS: Record<string, { bg: [number, number, number]; text: [number, number, number]; border: [number, number, number] }> = {
  basic:              { bg: [219, 234, 254], text: [30, 64, 175],  border: [147, 197, 253] },
  core:               { bg: [224, 231, 255], text: [55, 48, 163],  border: [165, 180, 252] },
  advanced:           { bg: [243, 232, 255], text: [107, 33, 168], border: [216, 180, 254] },
  seminar:            { bg: [254, 243, 199], text: [146, 64, 14],  border: [252, 211, 77] },
  'software-project': { bg: [220, 252, 231], text: [22, 101, 52],  border: [134, 239, 172] },
  'cs-cogpsy':        { bg: [204, 251, 241], text: [17, 94, 89],   border: [94, 234, 212] },
  'master-seminar':   { bg: [255, 228, 230], text: [159, 18, 57],  border: [253, 164, 175] },
  'master-thesis':    { bg: [254, 226, 226], text: [185, 28, 28],  border: [252, 165, 165] },
  tutoring:           { bg: [243, 244, 246], text: [31, 41, 55],   border: [209, 213, 219] },
  internship:         { bg: [255, 237, 213], text: [154, 52, 18],  border: [253, 186, 116] },
  other:              { bg: [241, 245, 249], text: [30, 41, 59],   border: [203, 213, 225] },
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function exportSchedulePDF(entries: ScheduleEntry[], semesterLabel: string): void {
  // A4 landscape
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = 297;
  const pageH = 210;

  const marginLeft = 10;
  const marginTop = 10;
  const marginRight = 10;
  const marginBottom = 10;

  const timeColW = 14;
  const headerH = 10;
  const titleH = 12;

  const gridLeft = marginLeft + timeColW;
  const gridTop = marginTop + titleH + headerH;
  const gridW = pageW - marginLeft - marginRight - timeColW;
  const gridH = pageH - marginTop - marginBottom - titleH - headerH;

  const colW = gridW / WEEKDAYS.length;
  const totalMinutes = (END_HOUR - START_HOUR) * 60;
  const pxPerMin = gridH / totalMinutes;

  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text(`Weekly Schedule — ${semesterLabel}`, marginLeft, marginTop + 8);

  // Day headers
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(75, 85, 99);
  for (let d = 0; d < WEEKDAYS.length; d++) {
    const x = gridLeft + d * colW;
    doc.text(DAY_LABELS[WEEKDAYS[d]], x + colW / 2, gridTop - 3, { align: 'center' });
  }

  // Time labels + horizontal grid lines
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175);

  for (let h = START_HOUR; h <= END_HOUR; h++) {
    const y = gridTop + (h - START_HOUR) * 60 * pxPerMin;
    const label = `${h.toString().padStart(2, '0')}:00`;
    doc.text(label, marginLeft + timeColW - 2, y + 1.5, { align: 'right' });

    // Grid line
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.2);
    doc.line(gridLeft, y, gridLeft + gridW, y);

    // Half-hour dashed line (except last)
    if (h < END_HOUR) {
      const yHalf = y + 30 * pxPerMin;
      doc.setDrawColor(243, 244, 246);
      doc.setLineWidth(0.1);
      doc.line(gridLeft, yHalf, gridLeft + gridW, yHalf);
    }
  }

  // Vertical column separators
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.2);
  for (let d = 0; d <= WEEKDAYS.length; d++) {
    const x = gridLeft + d * colW;
    doc.line(x, gridTop, x, gridTop + gridH);
  }

  // Border around grid
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.3);
  doc.rect(gridLeft, gridTop, gridW, gridH);

  // Compute overlap layout for PDF (same logic as SchedulePlanner)
  function pdfOverlaps(a: ScheduleEntry, b: ScheduleEntry): boolean {
    if (a.slot.day !== b.slot.day) return false;
    if (a.course.id === b.course.id) return false;
    const aS = timeToMinutes(a.slot.start), aE = timeToMinutes(a.slot.end);
    const bS = timeToMinutes(b.slot.start), bE = timeToMinutes(b.slot.end);
    return aS < bE && bS < aE;
  }

  type PdfLayout = { col: number; totalCols: number };
  const pdfLayoutMap = new Map<number, PdfLayout>();

  for (const day of WEEKDAYS) {
    const dayEntries = entries
      .map((e, i) => ({ e, i }))
      .filter(({ e }) => e.slot.day === day);

    const groups: number[][] = [];
    const visited = new Set<number>();
    for (const { i } of dayEntries) {
      if (visited.has(i)) continue;
      const group = [i];
      visited.add(i);
      let changed = true;
      while (changed) {
        changed = false;
        for (const { i: j } of dayEntries) {
          if (visited.has(j)) continue;
          for (const gi of group) {
            if (pdfOverlaps(entries[gi], entries[j])) {
              group.push(j);
              visited.add(j);
              changed = true;
              break;
            }
          }
        }
      }
      groups.push(group);
    }

    for (const group of groups) {
      if (group.length === 1) {
        pdfLayoutMap.set(group[0], { col: 0, totalCols: 1 });
        continue;
      }
      group.sort((a, b) => {
        const d = timeToMinutes(entries[a].slot.start) - timeToMinutes(entries[b].slot.start);
        return d !== 0 ? d : timeToMinutes(entries[b].slot.end) - timeToMinutes(entries[a].slot.end);
      });
      const cols: number[] = new Array(group.length).fill(-1);
      for (let gi = 0; gi < group.length; gi++) {
        const used = new Set<number>();
        for (let gj = 0; gj < gi; gj++) {
          if (pdfOverlaps(entries[group[gi]], entries[group[gj]])) used.add(cols[gj]);
        }
        let c = 0;
        while (used.has(c)) c++;
        cols[gi] = c;
      }
      const total = Math.max(...cols) + 1;
      for (let gi = 0; gi < group.length; gi++) {
        pdfLayoutMap.set(group[gi], { col: cols[gi], totalCols: total });
      }
    }
  }

  // Course blocks
  for (let idx = 0; idx < entries.length; idx++) {
    const entry = entries[idx];
    const dayIdx = WEEKDAYS.indexOf(entry.slot.day as Weekday);
    if (dayIdx < 0) continue;

    const layout = pdfLayoutMap.get(idx) ?? { col: 0, totalCols: 1 };
    const startMin = timeToMinutes(entry.slot.start) - START_HOUR * 60;
    const endMin = timeToMinutes(entry.slot.end) - START_HOUR * 60;

    const slotW = (colW - 1) / layout.totalCols;
    const x = gridLeft + dayIdx * colW + 0.5 + layout.col * slotW;
    const y = gridTop + startMin * pxPerMin;
    const w = slotW;
    const h = (endMin - startMin) * pxPerMin;

    const colors = PDF_COLORS[entry.course.category] ?? PDF_COLORS['other'];

    // Background
    doc.setFillColor(...colors.bg);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, 1, 1, 'FD');

    // Course name
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.text);

    const textX = x + 1.5;
    let textY = y + 3.5;

    // Truncate name to fit
    const maxChars = Math.floor(w / 1.8);
    const name = entry.course.name.length > maxChars
      ? entry.course.name.slice(0, maxChars - 1) + '…'
      : entry.course.name;
    doc.text(name, textX, textY);

    // Time
    if (h > 5) {
      textY += 3;
      doc.setFontSize(5.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`${entry.slot.start}–${entry.slot.end}`, textX, textY);
    }

    // Room
    if (h > 8 && entry.slot.room) {
      textY += 2.8;
      doc.setFontSize(5);
      doc.text(entry.slot.room, textX, textY);
    }

    // Instructor
    if (h > 11 && entry.course.instructor) {
      textY += 2.8;
      doc.setFontSize(5);
      doc.text(entry.course.instructor, textX, textY);
    }
  }

  // Footer
  doc.setFontSize(6);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(156, 163, 175);
  doc.text('Generated by LST Study Planner', marginLeft, pageH - marginBottom + 5);

  doc.save(`schedule-${semesterLabel.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}
