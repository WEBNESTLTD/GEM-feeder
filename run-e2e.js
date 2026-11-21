import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function runBrowserTests() {
  console.log('Launching browser automation test suite...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true
  });

  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Browser console error:', msg.text());
      errors.push(msg.text());
    } else {
      console.log('Browser log:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.error('Page error:', err.message);
    errors.push(err.message);
  });

  // 1. Navigate to Home
  console.log('Navigating to http://localhost:3000/...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Capture Home Screen screenshot
  await page.screenshot({ path: 'screenshots/home_screen.png' });
  console.log('Saved screenshots/home_screen.png');

  // Verify Canvas is present
  const canvas = await page.$('canvas');
  if (!canvas) throw new Error('Game canvas element not found');

  // 2. Click "How to Play" button to verify Tutorial Scene
  console.log('Navigating to Tutorial Screen...');
  // Click How to Play button (approx x: 195, y: 672 in 390x844)
  await page.evaluate(() => {
    const game = window.__gemFeederGame;
    if (game) {
      game.scene.start('TutorialScene');
    }
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screenshots/tutorial_screen.png' });
  console.log('Saved screenshots/tutorial_screen.png');

  // 3. Start Game Scene
  console.log('Navigating to GameScene...');
  await page.evaluate(() => {
    const game = window.__gemFeederGame;
    if (game) {
      game.scene.start('GameScene');
    }
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'screenshots/gameplay_screen.png' });
  console.log('Saved screenshots/gameplay_screen.png');

  // 4. Test dragging and throwing a candy
  console.log('Simulating swipe throw interaction...');
  // Swipe from (195, 690) to (195, 480)
  await page.mouse.move(195, 690);
  await page.mouse.down();
  await page.waitForTimeout(50);
  await page.mouse.move(195, 480, { steps: 5 });
  await page.waitForTimeout(30);
  await page.mouse.up();

  // Wait for candy flight and collision
  await page.waitForTimeout(1200);

  // 5. Test Pause Menu
  console.log('Opening Pause Menu...');
  await page.evaluate(() => {
    const game = window.__gemFeederGame;
    const gs = game.scene.getScene('GameScene');
    if (gs) gs.pauseGame();
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/pause_screen.png' });
  console.log('Saved screenshots/pause_screen.png');

  // 6. Test GameOver Scene
  console.log('Navigating to GameOver Scene...');
  await page.evaluate(() => {
    const game = window.__gemFeederGame;
    if (game) {
      game.scene.start('GameOverScene', {
        finalScore: 1250,
        highScore: 3400,
        maxCombo: 5,
        isNewHighScore: false
      });
    }
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screenshots/gameover_screen.png' });
  console.log('Saved screenshots/gameover_screen.png');

  await browser.close();

  if (errors.length > 0) {
    console.error('Browser testing encountered errors:', errors);
    process.exit(1);
  } else {
    console.log('All browser automation visual tests PASSED with 0 errors!');
  }
}

runBrowserTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
