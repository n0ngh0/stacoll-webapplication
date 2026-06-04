import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function generateResumePDF(element: HTMLElement, filename: string): Promise<void> {
  try {
    // Generate canvas from element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    // Create image from canvas
    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF (A4 size)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    // Calculate height to maintain aspect ratio
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Download the PDF
    pdf.save(filename);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
