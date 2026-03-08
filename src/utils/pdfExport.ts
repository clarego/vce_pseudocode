import jsPDF from 'jspdf';

export const exportToPDF = (content: string, filename: string, title: string = 'VCE Pseudocode') => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(title, 20, 20);

  doc.setFontSize(10);
  const lines = content.split('\n');
  let y = 35;
  const lineHeight = 7;
  const pageHeight = 280;

  lines.forEach((line, index) => {
    if (y > pageHeight) {
      doc.addPage();
      y = 20;
    }

    const displayLine = `${index + 1}. ${line}`;
    doc.text(displayLine, 20, y);
    y += lineHeight;
  });

  doc.save(`${filename}.pdf`);
};

export const downloadFile = (content: string, filename: string, extension: 'py' | 'js' | 'txt') => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
