import test from 'node:test';
import assert from 'node:assert/strict';

// Logical canvas dimension definitions
const CANVAS_WIDTH = 390;
const CANVAS_HEIGHT = 844;
const SAFETY_MARGIN = 8;
const MIN_ALLOWED_X = SAFETY_MARGIN;
const MAX_ALLOWED_X = CANVAS_WIDTH - SAFETY_MARGIN; // 382

// Restricted zones
const MOUTH_ZONE = {
  xMin: 150,
  xMax: 240,
  yMin: 220,
  yMax: 320
};

const THROW_COLUMN = {
  xMin: 135,
  xMax: 255,
  yMin: 450,
  yMax: 750
};

// Five required target viewports
const VIEWPORTS = [
  { name: '375x667 (iPhone SE)', width: 375, height: 667 },
  { name: '390x844 (iPhone 14/15)', width: 390, height: 844 },
  { name: '412x915 (Pixel 7)', width: 412, height: 915 },
  { name: '1024x768 (Desktop/Tablet Landscape)', width: 1024, height: 768 },
  { name: '1440x900 (Desktop Wide)', width: 1440, height: 900 }
];

// Definition of all interactive and UI elements in HUD
function getHUDElements() {
  return [
    {
      id: 'scoreCard',
      description: 'Score Card Top-Left',
      xMin: 16,
      xMax: 132,
      yMin: 16,
      yMax: 88
    },
    {
      id: 'pauseButton',
      description: 'Pause Button Top-Right',
      xMin: 348 - 26,
      xMax: 348 + 26,
      yMin: 42 - 26,
      yMax: 42 + 26
    },
    {
      id: 'lifeHeartsContainer',
      description: 'Life Hearts Pill Top-Right (Shifted to x=319)',
      xMin: 319 - 55,
      xMax: 319 + 55,
      yMin: 97 - 19,
      yMax: 97 + 19
    },
    {
      id: 'levelGoalBanner',
      description: 'Campaign Level Goal Banner Top-Center',
      xMin: 195 - 48,
      xMax: 195 + 48,
      yMin: 42 - 22,
      yMax: 42 + 18
    },
    {
      id: 'comboBanner',
      description: 'Combo Banner Top-Left',
      xMin: 65 - 50,
      xMax: 65 + 50,
      yMin: 126,
      yMax: 126 + 32
    },
    {
      id: 'powerUpBar',
      description: 'Power-Up Vertical Dock Right Edge (x=352, y=440..632)',
      xMin: 352 - 22,
      xMax: 352 + 22,
      yMin: 440 - 22,
      yMax: 632 + 22
    },
    {
      id: 'nextPreviewChip',
      description: 'NEXT Candy Chip Bottom-Right (x=330, y=785)',
      xMin: 330 - 34,
      xMax: 330 + 34,
      yMin: 785 - 34,
      yMax: 785 + 34
    },
    {
      id: 'firstThrowGuidance',
      description: 'Swipe-to-Feed Guidance Bottom-Left (x=60, y=760)',
      xMin: 60 - 35,
      xMax: 60 + 35,
      yMin: 760 - 32,
      yMax: 760 + 40
    }
  ];
}

function intersects(b1, b2) {
  return !(
    b1.xMax <= b2.xMin ||
    b1.xMin >= b2.xMax ||
    b1.yMax <= b2.yMin ||
    b1.yMin >= b2.yMax
  );
}

test('Layout Bounds Test: 390x844 Base Canvas Safety & Exclusion Verification', () => {
  const elements = getHUDElements();

  elements.forEach((elem) => {
    // 1. Margin check
    assert.ok(
      elem.xMin >= MIN_ALLOWED_X,
      `${elem.id} (${elem.description}) extends past left margin: xMin=${elem.xMin} < ${MIN_ALLOWED_X}`
    );
    assert.ok(
      elem.xMax <= MAX_ALLOWED_X,
      `${elem.id} (${elem.description}) extends past right margin: xMax=${elem.xMax} > ${MAX_ALLOWED_X}`
    );

    // 2. Mouth zone check
    const overlapsMouth = intersects(elem, MOUTH_ZONE);
    assert.equal(
      overlapsMouth,
      false,
      `${elem.id} (${elem.description}) overlaps mouth hitbox zone [150-240, 220-320]`
    );

    // 3. Central throw column check
    const overlapsThrow = intersects(elem, THROW_COLUMN);
    assert.equal(
      overlapsThrow,
      false,
      `${elem.id} (${elem.description}) sits inside central throw column [135-255, 450-750]`
    );
  });

  // 4. Non-overlap check between Score Card and Level Goal Banner
  const scoreCard = elements.find(e => e.id === 'scoreCard');
  const levelGoal = elements.find(e => e.id === 'levelGoalBanner');
  assert.equal(
    intersects(scoreCard, levelGoal),
    false,
    `ScoreCard (xMax=${scoreCard.xMax}) overlaps LevelGoalBanner (xMin=${levelGoal.xMin})`
  );
});

test('Layout Bounds Test: Scale.FIT Across All 5 Target Viewports', () => {
  const elements = getHUDElements();

  VIEWPORTS.forEach((vp) => {
    const scale = Math.min(vp.width / CANVAS_WIDTH, vp.height / CANVAS_HEIGHT);
    const offsetX = (vp.width - CANVAS_WIDTH * scale) / 2;
    const offsetY = (vp.height - CANVAS_HEIGHT * scale) / 2;

    const vpMouthZone = {
      xMin: offsetX + MOUTH_ZONE.xMin * scale,
      xMax: offsetX + MOUTH_ZONE.xMax * scale,
      yMin: offsetY + MOUTH_ZONE.yMin * scale,
      yMax: offsetY + MOUTH_ZONE.yMax * scale
    };

    const vpThrowColumn = {
      xMin: offsetX + THROW_COLUMN.xMin * scale,
      xMax: offsetX + THROW_COLUMN.xMax * scale,
      yMin: offsetY + THROW_COLUMN.yMin * scale,
      yMax: offsetY + THROW_COLUMN.yMax * scale
    };

    elements.forEach((elem) => {
      const vpElem = {
        xMin: offsetX + elem.xMin * scale,
        xMax: offsetX + elem.xMax * scale,
        yMin: offsetY + elem.yMin * scale,
        yMax: offsetY + elem.yMax * scale
      };

      // Check within viewport
      assert.ok(
        vpElem.xMin >= offsetX,
        `Viewport ${vp.name}: ${elem.id} left edge outside game canvas bounds`
      );
      assert.ok(
        vpElem.xMax <= offsetX + CANVAS_WIDTH * scale,
        `Viewport ${vp.name}: ${elem.id} right edge outside game canvas bounds`
      );

      // Check mouth zone non-overlap
      assert.equal(
        intersects(vpElem, vpMouthZone),
        false,
        `Viewport ${vp.name}: ${elem.id} overlaps scaled mouth zone`
      );

      // Check throw column non-overlap
      assert.equal(
        intersects(vpElem, vpThrowColumn),
        false,
        `Viewport ${vp.name}: ${elem.id} overlaps scaled throw column`
      );
    });
  });
});
