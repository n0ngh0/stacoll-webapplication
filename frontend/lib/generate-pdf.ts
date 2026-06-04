export async function generateResumePDF(element: HTMLElement, filename: string): Promise<void> {
  try {
    // 1. Gather all styles from the current document head
    const styleElements = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
    let styles = '';
    for (const el of styleElements) {
      if (el.tagName.toLowerCase() === 'style') {
        styles += el.outerHTML + '\n';
      } else if (el.tagName.toLowerCase() === 'link') {
        const href = (el as HTMLLinkElement).href;
        try {
          const res = await fetch(href);
          const cssText = await res.text();
          styles += `<style>${cssText}</style>\n`;
        } catch (e) {
          console.error("Failed to fetch CSS:", href);
          styles += el.outerHTML + '\n';
        }
      }
    }

    // 2. Build complete HTML string for Puppeteer
    const htmlString = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <base href="${window.location.origin}">
          ${styles}
          <style>
             /* Reset margins and ensure white background for the PDF */
             body { 
               margin: 0; 
               padding: 0; 
               background: white; 
               -webkit-print-color-adjust: exact; 
               print-color-adjust: exact;
             }
             /* Ensure the resume container takes full width but respects its internal constraints */
             .resume-container {
               width: 100%;
               max-width: 100%;
             }
          </style>
        </head>
        <body class="bg-white">
          <div class="resume-container">
            ${element.outerHTML}
          </div>
        </body>
      </html>
    `;

    const { apiFetch } = await import("./api/client");
    const response = await apiFetch("/export/pdf", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: htmlString,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to generate PDF on server');
    }
    
    // 4. Download file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
