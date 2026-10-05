import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  
  // Wait for 2 seconds to let Clerk initialize
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Page loaded successfully');
  await browser.close();
})();
