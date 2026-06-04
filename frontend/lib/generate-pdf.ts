import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function generateResumePDF(element: HTMLElement, filename: string): Promise<void> {
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) throw new Error('Could not create iframe document');

    // Clone all styles from the current document
    const styleElements = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
    let styles = '';
    for (const el of styleElements) {
      styles += el.outerHTML + '\n';
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          ${styles}
          <style>
            @page { size: A4 portrait; margin: 0; }
            body { 
              margin: 0; 
              background: white;
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
            }
          </style>
        </head>
        <body class="bg-white">
          ${element.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    // Give some time for fonts and images to load in the iframe
    return new Promise((resolve) => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        // Cleanup after print dialog is closed
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          resolve();
        }, 1000);
      }, 500);
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
