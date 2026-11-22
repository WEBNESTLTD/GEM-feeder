import { saveManager } from '../storage/SaveManager.js';

export const ACHIEVEMENTS = [
  { id: 'first_catch', title: 'First Sweet', desc: 'Feed the character your first candy', target: 1, reward: 20 },
  { id: 'perfect_aim', title: 'Bullseye Master', desc: 'Score 10 Perfect bullseye catches', target: 10, reward: 40 },
  { id: 'combo_master', title: 'Combo King', desc: 'Reach a 4x Combo streak', target: 1, reward: 50 },
  { id: 'world_explorer', title: 'World Explorer', desc: 'Unlock World 2: Sugar Mountain', target: 1, reward: 60 },
  { id: 'three_star_champion', title: 'Triple Star Star', desc: 'Earn 3 stars on 5 different levels', target: 5, reward: 75 },
  { id: 'power_expert', title: 'Power-Up Virtuoso', desc: 'Use 5 power-ups during gameplay', target: 5, reward: 50 },
  { id: 'candy_collector', title: 'Sweet Hoarder', desc: 'Accumulate 250 Candy Coins', target: 250, reward: 50 },
  { id: 'no_miss_ace', title: 'Perfectionist', desc: 'Complete a level without any missed catches', target: 1, reward: 70 },
  { id: 'arcade_legend', title: 'Arcade Legend', desc: 'Score over 1,000 points in Endless Mode', target: 1000, reward: 100 }
];

export class AchievementManager {
  constructor(options = {}) {
    this.saveManager = options.saveManager || saveManager;
  }

  getAchievements() {
    const saved = this.saveManager.getAchievements();
    return ACHIEVEMENTS.map(a => {
      const data = saved[a.id] || { progress: 0, unlocked: false, claimed: false };
      return {
        ...a,
        progress: data.progress || 0,
        unlocked: Boolean(data.unlocked),
        claimed: Boolean(data.claimed)
      };
    });
  }

  recordProgress(achId, amount = 1) {
    const list = this.getAchievements();
    const ach = list.find(a => a.id === achId);
    if (!ach || ach.unlocked) return null;

    const newProg = Math.min(ach.progress + amount, ach.target);
    const unlocked = newProg >= ach.target;

    this.saveManager.saveAchievement(achId, {
      progress: newProg,
      unlocked
    });

    if (unlocked) {
      return ach;
    }
    return null;
  }

  claimReward(achId) {
    const list = this.getAchievements();
    const ach = list.find(a => a.id === achId);
    if (!ach || !ach.unlocked || ach.claimed) return false;

    this.saveManager.saveAchievement(achId, {
      claimed: true
    });
    this.saveManager.addCoins(ach.reward);
    return true;
  }
}

export const achievementManager = new AchievementManager();
