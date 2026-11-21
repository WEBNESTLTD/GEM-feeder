const STORAGE_KEY = 'gem_feeder_save_v1';

export class SaveManager {
  constructor(options = {}) {
    this.storage = options.storage || (typeof window !== 'undefined' ? window.localStorage : null);
    this.state = this.load();
  }

  load() {
    if (!this.storage) {
      return { highScore: 0, soundEnabled: true, musicEnabled: true, vibrationEnabled: true, reducedMotion: false };
    }

    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (!raw) {
        return { highScore: 0, soundEnabled: true, musicEnabled: true, vibrationEnabled: true, reducedMotion: false };
      }
      const parsed = JSON.parse(raw);
      return {
        highScore: Number(parsed.highScore) || 0,
        soundEnabled: parsed.soundEnabled !== false,
        musicEnabled: parsed.musicEnabled !== false,
        vibrationEnabled: parsed.vibrationEnabled !== false,
        reducedMotion: Boolean(parsed.reducedMotion)
      };
    } catch {
      return { highScore: 0, soundEnabled: true, musicEnabled: true, vibrationEnabled: true, reducedMotion: false };
    }
  }

  save() {
    if (!this.storage) return;
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (err) {
      console.warn('Failed to save to storage:', err);
    }
  }

  getHighScore() {
    return this.state.highScore;
  }

  saveHighScore(score) {
    if (score > this.state.highScore) {
      this.state.highScore = score;
      this.save();
      return true;
    }
    return false;
  }

  getSoundEnabled() {
    return this.state.soundEnabled;
  }

  setSoundEnabled(enabled) {
    this.state.soundEnabled = Boolean(enabled);
    this.save();
  }

  getMusicEnabled() {
    return this.state.musicEnabled;
  }

  setMusicEnabled(enabled) {
    this.state.musicEnabled = Boolean(enabled);
    this.save();
  }

  getVibrationEnabled() {
    return this.state.vibrationEnabled;
  }

  setVibrationEnabled(enabled) {
    this.state.vibrationEnabled = Boolean(enabled);
    this.save();
  }

  getReducedMotion() {
    return this.state.reducedMotion;
  }

  setReducedMotion(enabled) {
    this.state.reducedMotion = Boolean(enabled);
    this.save();
  }
}

export const saveManager = new SaveManager();
