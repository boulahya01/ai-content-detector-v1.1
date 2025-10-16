import { jsPDF } from 'jspdf';
import { utils, writeFile } from 'xlsx';

interface ExportOptions {
  title: string;
  data: any[];
  columns: { key: string; label: string }[];
}

export const exportData = {
  toCSV: ({ title, data, columns }: ExportOptions) => {
    const worksheet = utils.json_to_sheet(
      data.map(item => 
        Object.fromEntries(columns.map(col => [col.label, item[col.key]]))
      )
    );
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Data');
    writeFile(workbook, `${title}-${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  toPDF: ({ title, data, columns }: ExportOptions) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);

    // Add timestamp
    const timestamp = new Date().toLocaleString();
    doc.text(`Generated: ${timestamp}`, 14, 25);

    // Create table
    const tableData = data.map(item => 
      columns.map(col => item[col.key]?.toString() || '')
    );
    
    doc.autoTable({
      head: [columns.map(col => col.label)],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] }
    });

    // Save the PDF
    doc.save(`${title}-${new Date().toISOString().split('T')[0]}.pdf`);
  }
};