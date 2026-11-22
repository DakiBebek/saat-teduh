/**
 * Peaceful Prayer Ambient Synthesizer
 * Menggunakan Web Audio API untuk menghasilkan musik instrumental saat teduh
 * yang lembut, damai, dan meditatif tanpa memerlukan file audio eksternal.
 */

class AmbientPlayer {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.timerId = null;
    this.chordStep = 0;
    this.volume = 0.35;

    // Progresi akor meditatif (F, C/E, Dm, Bb) - frekuensi nada dalam Hz
    this.chords = [
      // F Major (F3, A3, C4, E4 - Fmaj7 warm pad)
      [174.61, 220.00, 261.63, 329.63],
      // C Major (E3, G3, C4, D4 - Cadd9)
      [164.81, 196.00, 261.63, 293.66],
      // D Minor (D3, F3, A3, C4 - Dm7)
      [146.83, 174.61, 220.00, 261.63],
      // Bb Major (Bb2, D3, F3, A3 - Bbmaj7)
      [116.54, 146.83, 174.61, 220.00]
    ];
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playChord(frequencies, duration = 6.5) {
    if (!this.ctx || !this.isPlaying) return;

    const now = this.ctx.currentTime;

    frequencies.forEach((freq, idx) => {
      // Dua osilator per nada untuk efek detune chorus hangat
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 1.002, now); // subtle detune

      // Low pass filter untuk nada hangat dan tenang
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500 + idx * 80, now);
      filter.frequency.exponentialRampToValueAtTime(350, now + duration);

      // Envelope: lambat masuk (fade in) dan lembut memudar (fade out)
      const peakGain = 0.08 / frequencies.length;
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(peakGain, now + 2.0);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration + 0.5);
      osc2.stop(now + duration + 0.5);
    });

    // Sesekali tambahkan nada petikan lembut seperti lonceng doa (gentle bell chime)
    if (Math.random() > 0.3) {
      this.playBellChime(frequencies[frequencies.length - 1] * 2, now + 1.2);
    }
  }

  playBellChime(freq, time) {
    if (!this.ctx || !this.isPlaying) return;

    const osc = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    bellGain.gain.setValueAtTime(0.0001, time);
    bellGain.gain.exponentialRampToValueAtTime(0.025, time + 0.05);
    bellGain.gain.exponentialRampToValueAtTime(0.00001, time + 4.0);

    osc.connect(bellGain);
    bellGain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 4.1);
  }

  start() {
    this.initContext();
    this.isPlaying = true;

    const step = () => {
      if (!this.isPlaying) return;
      const currentChord = this.chords[this.chordStep % this.chords.length];
      this.playChord(currentChord, 6.0);
      this.chordStep++;
      this.timerId = setTimeout(step, 5500);
    };

    step();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }
}

window.ambientPlayer = new AmbientPlayer();
