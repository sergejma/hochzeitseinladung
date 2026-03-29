import { chromium } from 'playwright';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto('http://localhost:8765', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000); // Wait for preloader + frame loading

  const totalHeight = await page.evaluate(() =>
    document.documentElement.scrollHeight - window.innerHeight
  );

  console.log(`Total scroll height: ${totalHeight}px`);

  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const scroll = Math.round((totalHeight * i) / steps);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scroll);
    await page.waitForTimeout(600);
    await page.screenshot({
      path: `${projectRoot}/screenshots/test-${String(i).padStart(2, '0')}.png`
    });
    console.log(`Screenshot ${i}/${steps} at scroll ${scroll}px`);
  }

  await browser.close();
  console.log('\nDone!');
}

run().catch(console.error);
