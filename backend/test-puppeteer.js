import puppeteer from 'puppeteer';
puppeteer.launch({ headless: true }).then(browser => {
  console.log('Puppeteer launched successfully!');
  return browser.close();
}).catch(err => {
  console.error('Puppeteer launch failed:', err);
});
