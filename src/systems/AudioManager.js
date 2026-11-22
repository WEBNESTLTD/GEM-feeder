import { saveManager } from '../storage/SaveManager.js';

class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.bgmTimer = null;
    this.isPlayingBGM = false;
    this.bgmNoteIndex = 0;
  }

  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  isSoundEnabled() {
    return saveManager.getSoundEnabled();
  }

  isMusicEnabled() {
    return saveManager.getMusicEnabled();
  }

  playTone(freq, type = 'sine', duration = 0.1, gainLevel = 0.2, endFreq = null) {
    if (!this.isSoundEnabled()) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (endFreq !== null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 10), this.ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy catch
    }
  }

  playThrow() {
    // Whoosh pitch sweep
    this.playTone(320, 'sine', 0.18, 0.22, 650);
  }

  playHit() {
    // Pleasant high-pitch chime
    this.playTone(587.33, 'triangle', 0.12, 0.25);
    setTimeout(() => {
      this.playTone(880, 'sine', 0.22, 0.22);
    }, 70);
  }

  playPerfectHit() {
    // Sparkly celebratory chord
    this.playTone(523.25, 'triangle', 0.25, 0.25);
    setTimeout(() => this.playTone(659.25, 'triangle', 0.25, 0.25), 60);
    setTimeout(() => this.playTone(783.99, 'sine', 0.35, 0.28), 120);
    setTimeout(() => this.playTone(1046.50, 'sine', 0.45, 0.3), 180);
  }

  playMiss() {
    // Soft descending boop
    this.playTone(280, 'triangle', 0.25, 0.22, 110);
  }

  playCombo() {
    // Triumphant ascending fanfare
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.2, 0.24);
      }, idx * 75);
    });
  }

  isVibrationEnabled() {
    return saveManager.getVibrationEnabled();
  }

  triggerHaptic(pattern = 25) {
    if (!this.isVibrationEnabled()) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }

  playCrunch() {
    // Satisfying crunchy chew sound: filtered burst of textured noise/clicks
    if (!this.isSoundEnabled()) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      // Multi-tone micro bursts simulating munching
      [220, 310, 190].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.045);
        osc.frequency.exponentialRampToValueAtTime(70, t + idx * 0.045 + 0.04);
        gain.gain.setValueAtTime(0.22, t + idx * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.045 + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.045);
        osc.stop(t + idx * 0.045 + 0.045);
      });
    } catch {}
  }

  playLifeUp() {
    // Harmonious upward sparkly chime for heart restoration
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.2, 0.28);
      }, idx * 60);
    });
  }

  playGameOver() {
    const notes = [440, 415, 392, 349];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.3, 0.15, freq * 0.85);
      }, idx * 160);
    });
  }

  playButtonClick() {
    // Crisp UI click
    this.playTone(700, 'sine', 0.05, 0.15, 400);
  }

  playCoinCollect() {
    // Crisp cheerful coin chime
    this.playTone(987.77, 'sine', 0.08, 0.22);
    setTimeout(() => this.playTone(1318.51, 'sine', 0.16, 0.25), 50);
  }

  playStarEarn() {
    // Twinkling star sparkle
    this.playTone(880, 'triangle', 0.1, 0.2);
    setTimeout(() => this.playTone(1174.66, 'sine', 0.2, 0.25), 80);
  }

  playPowerUpActivate() {
    // Resonant power charge sweep
    this.playTone(280, 'sine', 0.25, 0.25, 880);
  }

  playLevelComplete() {
    // Joyful level victory fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.25, 0.28), idx * 100);
    });
  }

  playWorldUnlock() {
    // Grand royal world unlocked fanfare
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.35, 0.3), idx * 120);
    });
  }

  setComboLevel(level) {
    this.comboLevel = level || 1;
  }

  pauseBGM() {
    this.isBGMPaused = true;
  }

  resumeBGM() {
    this.isBGMPaused = false;
  }

  startBGM() {
    if (this.isPlayingBGM || !this.isMusicEnabled()) return;
    this.initContext();
    this.isPlayingBGM = true;
    this.isBGMPaused = false;
    this.comboLevel = 1;

    // Upbeat gentle casual pentatonic arpeggio sequence
    const melody = [
      523.25, 659.25, 783.99, 659.25,
      587.33, 698.46, 880.00, 698.46,
      523.25, 659.25, 783.99, 1046.50,
      880.00, 783.99, 659.25, 587.33
    ];

    // Harmonious bassline accompanying chords for Combo active
    const bassline = [
      261.63, 261.63, 329.63, 329.63,
      293.66, 293.66, 349.23, 349.23,
      261.63, 261.63, 392.00, 392.00,
      349.23, 349.23, 293.66, 293.66
    ];

    this.bgmTimer = setInterval(() => {
      if (!this.isPlayingBGM || this.isBGMPaused || !this.isMusicEnabled() || !this.ctx) return;
      const note = melody[this.bgmNoteIndex % melody.length];
      const bassNote = bassline[this.bgmNoteIndex % bassline.length];
      this.bgmNoteIndex++;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.24);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);

        // When Combo multiplier >= 2, play the bass/counter-melody layer!
        if (this.comboLevel >= 2) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          bassOsc.type = this.comboLevel >= 3 ? 'triangle' : 'sine';
          bassOsc.frequency.setValueAtTime(bassNote, this.ctx.currentTime);
          bassGain.gain.setValueAtTime(0.035, this.ctx.currentTime);
          bassGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.24);
          bassOsc.connect(bassGain);
          bassGain.connect(this.ctx.destination);
          bassOsc.start();
          bassOsc.stop(this.ctx.currentTime + 0.25);
        }
      } catch {}
    }, 280);
  }

  stopBGM() {
    this.isPlayingBGM = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  toggleSound() {
    const current = saveManager.getSoundEnabled();
    saveManager.setSoundEnabled(!current);
    if (!current) {
      this.initContext();
      this.playButtonClick();
    }
    return !current;
  }

  toggleMusic() {
    const current = saveManager.getMusicEnabled();
    const next = !current;
    saveManager.setMusicEnabled(next);
    if (next) {
      this.startBGM();
    } else {
      this.stopBGM();
    }
    return next;
  }
}

export const audioManager = new SoundSynthesizer();
