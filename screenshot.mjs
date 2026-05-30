import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { spawn } from 'child_process';
import { setTimeout as wait } from 'timers/promises';

mkdirSync('./screenshots', { recursive: true });

// Start dev server
console.log('Starting dev server…');
const server = spawn('npm', ['run', 'dev'], {
  cwd: process.cwd(),
  shell: true,
  stdio: 'pipe',
});

// Poll until server responds
let up = false;
for (let i = 0; i < 20; i++) {
  await wait(1500);
  try {
    const r = await fetch('http://localhost:4321/');
    if (r.ok) { up = true; break; }
  } catch {}
}
if (!up) { server.kill(); throw new Error('Dev server did not start'); }
console.log('Server ready.');

const browser = await chromium.launch();

// Desktop
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

// Mobile
const mob = await browser.newPage();
await mob.setViewportSize({ width: 390, height: 844 });

// Force all reveal elements visible before screenshotting
const revealAll = () => document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));

const goTo = async (pg, url) => {
  await pg.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
  await pg.evaluate(revealAll);
  await wait(300);
};

const shot = async (pg, name, scrollY = 0) => {
  if (scrollY !== null) await pg.evaluate((y) => window.scrollTo(0, y), scrollY);
  await wait(200);
  await pg.screenshot({ path: `./screenshots/${name}.png` });
  console.log(`  ✓ ${name}`);
};

// HOME — capture in sections (viewport shots so reveals are in-frame)
await goTo(page, 'http://localhost:4321/');
await shot(page, '01-home-hero',      0);
await shot(page, '02-home-services',  800);
await shot(page, '03-home-why',       1900);
await shot(page, '04-home-offers',    2800);
await shot(page, '05-home-work',      3400);
await shot(page, '06-home-reviews',   4400);
await shot(page, '07-home-faq',       5600);

// OTHER PAGES — full page with reveals forced
await goTo(page, 'http://localhost:4321/contact');
await page.screenshot({ path: './screenshots/08-contact.png', fullPage: true });
console.log('  ✓ 08-contact');

await goTo(page, 'http://localhost:4321/services');
await page.screenshot({ path: './screenshots/09-services.png', fullPage: true });
console.log('  ✓ 09-services');

await goTo(page, 'http://localhost:4321/services/modular-kitchen');
await page.screenshot({ path: './screenshots/10-kitchen.png', fullPage: true });
console.log('  ✓ 10-kitchen');

await goTo(page, 'http://localhost:4321/our-work');
await page.screenshot({ path: './screenshots/11-our-work.png', fullPage: true });
console.log('  ✓ 11-our-work');

await goTo(page, 'http://localhost:4321/about');
await page.screenshot({ path: './screenshots/12-about.png', fullPage: true });
console.log('  ✓ 12-about');

await goTo(page, 'http://localhost:4321/blog');
await page.screenshot({ path: './screenshots/13-blog.png', fullPage: true });
console.log('  ✓ 13-blog');

// MOBILE
await mob.goto('http://localhost:4321/', { waitUntil: 'networkidle', timeout: 20000 });
await mob.evaluate(revealAll); await wait(200);
await mob.screenshot({ path: './screenshots/14-mobile-hero.png' });
console.log('  ✓ 14-mobile-hero');

await mob.evaluate((y) => window.scrollTo(0, y), 900);
await wait(200);
await mob.screenshot({ path: './screenshots/15-mobile-services.png' });
console.log('  ✓ 15-mobile-services');

await mob.goto('http://localhost:4321/contact', { waitUntil: 'networkidle', timeout: 20000 });
await mob.evaluate(revealAll); await wait(200);
await mob.screenshot({ path: './screenshots/16-mobile-contact.png' });
console.log('  ✓ 16-mobile-contact');

await browser.close();
server.kill();
console.log('\nAll done — screenshots in ./screenshots/');
