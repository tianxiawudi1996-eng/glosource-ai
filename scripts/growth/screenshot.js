/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require('puppeteer');
const path = require('path');

const DESKTOP = 'C:/Users/ddedi/Desktop';

async function main() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Screenshot 1: Hero + search form
  console.log('Taking screenshot 1...');
  await page.goto('https://glosourceai.com/en', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.screenshot({ path: path.join(DESKTOP, 'glosource-screenshot-1-hero.png'), fullPage: false });

  // Screenshot 2: Scroll down to show categories + tool
  await page.evaluate(() => window.scrollTo(0, 600));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(DESKTOP, 'glosource-screenshot-2-categories.png'), fullPage: false });

  // Screenshot 3: Pricing page
  console.log('Taking screenshot 3...');
  await page.goto('https://glosourceai.com/en/billing', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.screenshot({ path: path.join(DESKTOP, 'glosource-screenshot-3-pricing.png'), fullPage: false });

  await browser.close();
  console.log('Done! 3 screenshots saved to Desktop.');
}

main().catch(console.error);
