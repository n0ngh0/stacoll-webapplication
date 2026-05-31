import puppeteer from 'puppeteer';

export const exportController = {
  async generatePDF(htmlContent: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      const page = await browser.newPage();
      
      // Setting content. networkidle0 ensures that all resources (fonts, images) are loaded before generating PDF.
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Emulate screen media to ensure @media screen styles (like tailwind colors) are used instead of print media.
      await page.emulateMediaType('screen');

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' }
      });
      
      // Puppeteer returns Uint8Array, convert to Buffer
      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
};
