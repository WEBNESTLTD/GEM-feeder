// Level Configuration for 30 Playable Levels across 3 Worlds

export const WORLDS = {
  world_1: {
    id: 'world_1',
    name: 'Candy Garden',
    description: 'A vibrant pastel paradise filled with beginner sweet treats.',
    bgTheme: 'garden',
    bgColor: '#FDF8F5',
    accentColor: '#38C964',
    levelRange: [1, 10],
    requiredStarsToUnlock: 0
  },
  world_2: {
    id: 'world_2',
    name: 'Sugar Mountain',
    description: 'Chilly candy peaks where the winds make your targets sway.',
    bgTheme: 'mountain',
    bgColor: '#EBF4FF',
    accentColor: '#3D8BFF',
    levelRange: [11, 20],
    requiredStarsToUnlock: 15
  },
  world_3: {
    id: 'world_3',
    name: 'Chocolate Kingdom',
    description: 'The ultimate royal challenge with floating obstacles and high combos.',
    bgTheme: 'kingdom',
    bgColor: '#FFF5EB',
    accentColor: '#FFD93D',
    levelRange: [21, 30],
    requiredStarsToUnlock: 35
  }
};

// Generates balanced levels dynamically with increasing targets and mechanics
export function generateLevels() {
  const levels = {};

  for (let i = 1; i <= 30; i++) {
    let worldId = 'world_1';
    let worldLevel = i;
    let difficulty = 'Easy';
    let targetScore = 50 + (i * 25);
    let starThresholds = [
      targetScore,
      Math.round(targetScore * 1.4),
      Math.round(targetScore * 1.85)
    ];
    let obstacles = false;
    let swaySpeed = 0;
    let maxCandies = Math.max(10, Math.round(targetScore / 15) + 3);
    let specialObjective = null;

    if (i <= 10) {
      worldId = 'world_1';
      worldLevel = i;
      difficulty = i <= 5 ? 'Beginner' : 'Easy';
      specialObjective = i % 3 === 0 ? 'Achieve a 2x Combo' : null;
    } else if (i <= 20) {
      worldId = 'world_2';
      worldLevel = i - 10;
      difficulty = i <= 15 ? 'Medium' : 'Challenging';
      targetScore = 300 + ((i - 10) * 40);
      starThresholds = [targetScore, Math.round(targetScore * 1.35), Math.round(targetScore * 1.75)];
      swaySpeed = 0.0018 + (i - 10) * 0.0003;
      maxCandies = Math.max(12, Math.round(targetScore / 18) + 4);
      specialObjective = i % 2 === 0 ? 'Score at least 2 Perfect Catches' : 'Achieve a 3x Combo';
    } else {
      worldId = 'world_3';
      worldLevel = i - 20;
      difficulty = i <= 25 ? 'Hard' : 'Expert';
      targetScore = 750 + ((i - 20) * 60);
      starThresholds = [targetScore, Math.round(targetScore * 1.3), Math.round(targetScore * 1.65)];
      swaySpeed = 0.0028;
      obstacles = true;
      maxCandies = Math.max(14, Math.round(targetScore / 22) + 5);
      specialObjective = i === 30 ? 'Achieve a 4x Combo & 1,500 Points' : 'Score at least 3 Perfect Catches';
    }

    levels[i] = {
      levelId: i,
      worldId,
      worldLevel,
      difficulty,
      targetScore,
      starThresholds,
      maxCandies,
      swaySpeed,
      obstacles,
      specialObjective,
      coinReward: 15 + (i * 2)
    };
  }

  return levels;
}

export const LEVELS = generateLevels();
