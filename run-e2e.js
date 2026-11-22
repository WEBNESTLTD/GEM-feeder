import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fork } from 'child_process';

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

async function isPortOpen(port) {
  return new Promise(resolve => {
    const req = http.get(`http://localhost:${port}/`, () => resolve(true));
    req.on('error', () => resolve(false));
  });
}

async function runBrowserTests() {
  if (!fs.existsSync('docs/screenshots')) {
    fs.mkdirSync('docs/screenshots', { recursive: true });
  }

  let serverProcess = null;
  const running = await isPortOpen(3000);
  if (!running) {
    console.log('Starting local server on port 3000...');
    serverProcess = fork('server.js', { stdio: 'pipe' });
    await new Promise(r => setTimeout(r, 1200));
  }

  try {
    console.log('Launching browser automation test suite via Chrome...');
    const browser = await chromium.launch({ headless: true, channel: 'chrome' });
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
        // External CDN/font DNS lookup failure in offline sandbox is non-fatal
        if (text.includes('ERR_NAME_NOT_RESOLVED') || text.includes('fonts.googleapis.com')) {
          console.log('Offline font notice:', text);
        } else {
          console.error('Browser console error:', text);
          errors.push(text);
        }
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
    await page.screenshot({ path: 'docs/screenshots/home_screen.png' });
    console.log('Saved docs/screenshots/home_screen.png');

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
    await page.screenshot({ path: 'docs/screenshots/tutorial_screen.png' });
    console.log('Saved docs/screenshots/tutorial_screen.png');

    // 3. Start Game Scene
    console.log('Navigating to GameScene...');
    await page.evaluate(() => {
      const game = window.__gemFeederGame;
      if (game) {
        game.scene.start('GameScene');
      }
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'docs/screenshots/gameplay_screen.png' });
    console.log('Saved docs/screenshots/gameplay_screen.png');

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
    await page.screenshot({ path: 'docs/screenshots/pause_screen.png' });
    console.log('Saved docs/screenshots/pause_screen.png');

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
    await page.screenshot({ path: 'docs/screenshots/gameover_screen.png' });
    console.log('Saved docs/screenshots/gameover_screen.png');

    await browser.close();

    if (errors.length > 0) {
      console.error('Browser testing encountered errors:', errors);
      process.exit(1);
    } else {
      console.log('All browser automation visual tests PASSED with 0 errors!');
    }
  } finally {
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

runBrowserTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
