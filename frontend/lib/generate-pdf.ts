export async function generateResumePDF(element: HTMLElement, filename: string): Promise<void> {
  // Dynamically import to avoid SSR issues
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  // Backup original getComputedStyle
  const originalGetComputedStyle = window.getComputedStyle;

  // Helper to convert lab/oklab/oklch colors to rgb fallback to prevent html2canvas crashes
  const sanitizeColor = (colorVal: string): string => {
    if (!colorVal) return colorVal;
    
    // Check for unsupported modern color functions
    if (colorVal.includes('lab') || colorVal.includes('lch')) {
      return 'rgb(31, 41, 55)'; // Safe dark gray fallback
    }
    return colorVal;
  };

  try {
    // Override getComputedStyle temporarily during html2canvas parsing
    window.getComputedStyle = function (elt: Element, pseudoElt?: string | null): CSSStyleDeclaration {
      const style = originalGetComputedStyle(elt, pseudoElt);
      return new Proxy(style, {
        get(target, prop) {
          const val = target[prop as keyof CSSStyleDeclaration];
          if (typeof val === 'string' && (val.includes('lab') || val.includes('lch'))) {
            return sanitizeColor(val);
          }
          if (typeof val === 'function') {
            return val.bind(target);
          }
          return val;
        }
      });
    };

    const canvas = await html2canvas(element, {
      scale: 2, // 2x resolution for crisp text
      useCORS: true, // allow cross-origin images
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  } finally {
    // Always restore the original getComputedStyle to avoid affecting the rest of the app
    window.getComputedStyle = originalGetComputedStyle;
  }
}
