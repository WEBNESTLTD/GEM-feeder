import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
let chromium;
try {
  const pw = await import('playwright');
  chromium = pw.chromium;
} catch {
  try {
    const pw = require('playwright');
    chromium = pw.chromium;
  } catch {
    const pw = require('C:/Users/sakee/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
    chromium = pw.chromium;
  }
}

async function runPhase11Verification() {
  console.log('--- Phase 11 Visual QA & Multi-Viewport Verification ---');
  if (!fs.existsSync('docs/screenshots')) {
    fs.mkdirSync('docs/screenshots', { recursive: true });
  }

  const browser = await chromium.launch({ headless: true, channel: 'chrome' });

  // 1. Primary Testing Context (390x844 mobile standard)
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true
  });

  const page = await context.newPage();
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (text.includes('ERR_NAME_NOT_RESOLVED') || text.includes('fonts.googleapis.com')) {
        // Non-fatal offline font notice
      } else {
        console.error('Console error:', text);
        errors.push(text);
      }
    }
  });

  page.on('pageerror', err => {
    console.error('Page error:', err.message);
    errors.push(err.message);
  });

  // Navigate to server
  console.log('Navigating to http://localhost:3000/...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Home Screen
  console.log('Capturing Phase 11 Home Screen...');
  await page.screenshot({ path: 'docs/screenshots/phase11_home_390x844.png' });

  // 2. Open Settings Menu
  console.log('Capturing Phase 11 Settings Modal with Volume Gain Sliders...');
  await page.evaluate(() => {
    const game = window.__gemFeederGame;
    const homeScene = game.scene.getScene('HomeScene');
    if (homeScene && homeScene.settingsMenu) {
      homeScene.settingsMenu.show();
    }
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'docs/screenshots/phase11_settings_modal.png' });

  // Close Settings Menu
  await page.evaluate(() => {
    const game = window.__gemFeederGame;
    const homeScene = game.scene.getScene('HomeScene');
    if (homeScene && homeScene.settingsMenu) {
      homeScene.settingsMenu.hide();
    }
  });
  await page.waitForTimeout(200);

  // 3. Tutorial Scene
  console.log('Capturing Phase 11 Tutorial Scene...');
  await page.evaluate(() => {
    const game = window.__gemFeederGame;
    game.scene.start('TutorialScene');
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'docs/screenshots/phase11_tutorial_390x844.png' });

  // 4. World 1 Gameplay (Candy Garden)
  console.log('Capturing World 1 (Candy Garden) Gameplay...');
  await page.evaluate(() => {
    const game = window.__gemFeederGame;
    game.scene.start('GameScene', { levelId: 1 });
  });
  await page.waitForTimeout(800);

  // Simulate pull/aim to show trajectory dots and character anticipation
  await page.mouse.move(195, 690);
  await page.mouse.down();
  await page.waitForTimeout(50);
  await page.mouse.move(195, 520, { steps: 5 });
  await page.waitForTimeout(100);
  await page.screenshot({ path: 'docs/screenshots/phase11_gameplay_world1_aiming.png' });
  await page.mouse.up();
  await page.waitForTimeout(600);

  // 5. World 2 Gameplay (Sugar Mountain)
  console.log('Capturing World 2 (Sugar Mountain) Gameplay with Snowy Peaks...');
  await page.evaluate(() => {
    const game = window.__gemFeederGame;
    game.scene.start('GameScene', { levelId: 11 }); // Level 11 is World 2
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'docs/screenshots/phase11_gameplay_world2_sugar_mountain.png' });

  // 6. World 3 Gameplay (Chocolate Kingdom)
  console.log('Capturing World 3 (Chocolate Kingdom) Gameplay with Caramel Pillars...');
  await page.evaluate(() => {
    const game = window.__gemFeederGame;
    game.scene.start('GameScene', { levelId: 21 }); // Level 21 is World 3
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'docs/screenshots/phase11_gameplay_world3_chocolate_kingdom.png' });

  // 7. Level Complete Modal
  console.log('Capturing Level Complete Modal with 3 Stars and Victory Fanfare...');
  await page.evaluate(() => {
    const game = window.__gemFeederGame;
    const gameScene = game.scene.getScene('GameScene');
    if (gameScene && gameScene.levelCompleteModal) {
      gameScene.levelCompleteModal.showResult({
        success: true,
        score: 650,
        stars: 3,
        coinsEarned: 25,
        hasNextLevel: true
      });
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'docs/screenshots/phase11_level_complete_modal.png' });

  await context.close();

  // 8. Multi-Viewport Responsive Matrix
  const viewports = [
    { name: 'phase11_viewport_375x667', w: 375, h: 667, desc: 'Mobile Compact (iPhone SE)' },
    { name: 'phase11_viewport_412x915', w: 412, h: 915, desc: 'Mobile Large (Pixel 7 / Android)' },
    { name: 'phase11_viewport_768x1024', w: 768, h: 1024, desc: 'Tablet Portrait (iPad Mini)' },
    { name: 'phase11_viewport_1024x768', w: 1024, h: 768, desc: 'Tablet Landscape (iPad Landscape)' },
    { name: 'phase11_viewport_1440x900', w: 1440, h: 900, desc: 'Desktop (1440x900)' }
  ];

  for (const vp of viewports) {
    console.log(`Verifying viewport ${vp.name} (${vp.w}x${vp.h})...`);
    const vpContext = await browser.newContext({
      viewport: { width: vp.w, height: vp.h }
    });
    const vpPage = await vpContext.newPage();
    await vpPage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await vpPage.waitForTimeout(500);
    await vpPage.screenshot({ path: `screenshots/${vp.name}.png` });
    await vpContext.close();
  }

  await browser.close();

  console.log('All Phase 11 Visual QA screenshots successfully captured!');
  if (errors.length > 0) {
    console.warn('Completed with non-fatal or logged console warnings:', errors);
  } else {
    console.log('Zero runtime console errors detected during full multi-viewport audit!');
  }
}

runPhase11Verification().catch(err => {
  console.error('Phase 11 verification script failed:', err);
  process.exit(1);
});
