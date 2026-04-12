'use client';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Lab } from './labData';

interface ReportData {
  lab: Lab;
  startTime: number;
  endTime: number;
  steps: any[];
  hintsUsed: number;
  xpEarned: number;
  username: string;
}

export const generateTechnicalReport = (data: ReportData) => {
  const doc = new jsPDF();
  const { lab, startTime, endTime, steps, hintsUsed, xpEarned, username } = data;
  const duration = Math.round((endTime - startTime) / 1000);

  // Styling
  const primaryColor = [16, 185, 129]; // Neon Green
  const bgColor = [10, 15, 20];
  
  // Header
  doc.setFillColor(...bgColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('courier', 'bold');
  doc.setFontSize(24);
  doc.text('ZERODAY LAB // AUDIT_REPORT', 15, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text(`SESSION_ID: ${Math.random().toString(36).substring(7).toUpperCase()}`, 15, 30);
  doc.text(`TARGET: ${lab.title.toUpperCase()}`, 130, 30);

  // Metadata Table
  (doc as any).autoTable({
    startY: 45,
    head: [['FIELD', 'DATA_VALUE']],
    body: [
      ['OPERATOR', username.toUpperCase()],
      ['CATEGORY', lab.category],
      ['SEVERITY', lab.severity],
      ['CVSS_SCORE', lab.cvss.toString()],
      ['DURATION', `${duration}s`],
      ['HINTS_ACCESSED', hintsUsed.toString()],
      ['XP_REWARDED', xpEarned.toString()],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], font: 'courier' },
    bodyStyles: { font: 'courier', textColor: [50, 50, 50] },
  });

  // Attack Steps
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('>>> EXPLOITATION_LOG', 15, (doc as any).lastAutoTable.finalY + 15);

  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['TIMESTAMP', 'ACTION', 'PAYLOAD', 'RESULT']],
    body: steps.map(s => [
      new Date(s.timestamp).toLocaleTimeString(),
      s.action.toUpperCase(),
      s.payload.length > 30 ? s.payload.substring(0, 30) + '...' : s.payload,
      s.result.toUpperCase()
    ]),
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], font: 'courier' },
    bodyStyles: { font: 'courier', fontSize: 8 },
  });

  // Technical Findings
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('>>> VULNERABILITY_SYNOPSIS', 15, finalY);
  
  doc.setFontSize(10);
  doc.text(`The ${lab.title} vulnerability identified in the target app allows for ${lab.description.toLowerCase()}`, 15, finalY + 10, { maxWidth: 180 });

  // Patch Information
  doc.setTextColor(...primaryColor);
  doc.text('>>> REMEDIATION_STRATEGY', 15, finalY + 30);
  doc.setTextColor(0, 0, 0);
  doc.setFont('courier', 'italic');
  doc.text('Recommended patch implementation:', 15, finalY + 35);
  doc.setFont('courier', 'normal');
  doc.text(lab.secureCode, 15, finalY + 45, { maxWidth: 180 });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`CONFIDENTIAL // ZERODAY LAB INTERNAL AUDIT // PAGE ${i}`, 105, 290, { align: 'center' });
  }

  doc.save(`ZeroDay_Audit_${lab.slug}_${Date.now()}.pdf`);
};
