// Logical design tokens and dimensions for Gem Feeder
export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844;

export const COLORS = {
  ink: '#4B1F86',
  inkSoft: '#6B5A86',
  pink: '#D81B7A',
  pinkDark: '#9C0F56',
  yellow: '#FFD93D',
  yellowDark: '#D9AE00',
  lavender: '#F3E6FF',
  blush: '#FFE9F3',
  cream: '#FFF3D6',
  white: '#FFFFFF',
  shadow: '#E3D0F5',
  packetPurple: '#6B2FB3',
  packetDark: '#3E1675',
  heart: '#E8325F'
};

export const CANDIES = [
  { key: 'candy_red', name: 'Red', color: '#F0364B' },
  { key: 'candy_yellow', name: 'Yellow', color: '#FFD93D' },
  { key: 'candy_green', name: 'Green', color: '#38C964' },
  { key: 'candy_blue', name: 'Blue', color: '#3D8BFF' },
  { key: 'candy_purple', name: 'Purple', color: '#9B5DE5' },
  { key: 'candy_orange', name: 'Orange', color: '#FF8A2B' },
  { key: 'candy_pink', name: 'Pink', color: '#FF5CAA' },
  { key: 'candy_rainbow', name: 'Rainbow', color: '#E8325F' }
];

export const SCORING = {
  NORMAL_HIT: 10,
  PERFECT_HIT_BONUS: 5,
  COMBO_TIERS: [
    { min: 10, multiplier: 4 },
    { min: 5, multiplier: 3 },
    { min: 3, multiplier: 2 },
    { min: 0, multiplier: 1 }
  ],
  INITIAL_LIVES: 3
};

export const PHYSICS = {
  GRAVITY_Y: 750,
  MIN_DRAG_DISTANCE: 25,
  MAX_DRAG_DISTANCE: 180,
  MIN_VELOCITY: 700,
  MAX_VELOCITY: 960,
  VELOCITY_MULTIPLIER: 4.8,
  MAX_FLIGHT_TIME_MS: 3000
};
