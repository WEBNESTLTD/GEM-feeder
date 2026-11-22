import { saveManager } from '../storage/SaveManager.js';

export const MISSION_TEMPLATES = [
  { id: 'm_throws', title: 'Candy Tosser', desc: 'Throw 10 candies in any mode', target: 10, reward: 25 },
  { id: 'm_perfects', title: 'Bullseye Artist', desc: 'Score 3 Perfect Catches', target: 3, reward: 30 },
  { id: 'm_score', title: 'Points Feast', desc: 'Earn 300 points in one session', target: 300, reward: 35 },
  { id: 'm_levels', title: 'World Hopper', desc: 'Complete 2 campaign levels', target: 2, reward: 40 },
  { id: 'm_combos', title: 'Streak Star', desc: 'Trigger a 3x Combo', target: 1, reward: 35 }
];

export class MissionManager {
  constructor(options = {}) {
    this.saveManager = options.saveManager || saveManager;
  }

  getTodayDateString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  getDailyMissions() {
    const saved = this.saveManager.getMissions();
    const today = this.getTodayDateString();

    if (saved && saved.date === today && Array.isArray(saved.list) && saved.list.length > 0) {
      return saved.list;
    }

    // Generate new missions for today
    const list = MISSION_TEMPLATES.slice(0, 3).map(tmpl => ({
      ...tmpl,
      progress: 0,
      completed: false,
      claimed: false
    }));

    this.saveManager.saveMissions({ date: today, list });
    return list;
  }

  recordEvent(eventType, count = 1) {
    const missions = this.getDailyMissions();
    let updated = false;

    for (const m of missions) {
      if (m.completed) continue;

      if (
        (eventType === 'throw' && m.id === 'm_throws') ||
        (eventType === 'perfect' && m.id === 'm_perfects') ||
        (eventType === 'score' && m.id === 'm_score') ||
        (eventType === 'level_complete' && m.id === 'm_levels') ||
        (eventType === 'combo_3x' && m.id === 'm_combos')
      ) {
        m.progress += count;
        if (m.progress >= m.target) {
          m.progress = m.target;
          m.completed = true;
        }
        updated = true;
      }
    }

    if (updated) {
      this.saveManager.saveMissions({ date: this.getTodayDateString(), list: missions });
    }
  }

  claimReward(missionId) {
    const missions = this.getDailyMissions();
    const mission = missions.find(m => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) {
      return { success: false };
    }

    mission.claimed = true;
    this.saveManager.addCoins(mission.reward);
    this.saveManager.saveMissions({ date: this.getTodayDateString(), list: missions });
    return { success: true, reward: mission.reward };
  }
}

export const missionManager = new MissionManager();
