// Web Audio API Synthesized Ringtone Generator
// No external MP3 downloads required; works offline and cross-origin seamlessly.

let audioCtx: AudioContext | null = null;
let ringInterval: any = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a standard outgoing dial tone (440Hz + 480Hz dual tone).
 */
export function playOutgoingRing() {
  stopRingtone();
  try {
    const ctx = getAudioContext();

    const ring = () => {
      try {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.frequency.value = 440;
        osc2.frequency.value = 480;

        osc1.type = 'sine';
        osc2.type = 'sine';

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.8);
        osc2.stop(now + 1.8);
      } catch (e) {
        // Audio error silently handled
      }
    };

    ring();
    ringInterval = setInterval(ring, 4000);
  } catch (err) {
    console.warn('Outgoing ringtone could not start:', err);
  }
}

/**
 * Play a modern incoming melody ringtone.
 */
export function playIncomingRing() {
  stopRingtone();
  try {
    const ctx = getAudioContext();

    const melodyNotes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    const ring = () => {
      try {
        melodyNotes.forEach((freq, idx) => {
          const now = ctx.currentTime + idx * 0.18;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.35);
        });
      } catch (e) {
        // Audio error silently handled
      }
    };

    ring();
    ringInterval = setInterval(ring, 2200);
  } catch (err) {
    console.warn('Incoming ringtone could not start:', err);
  }
}

/**
 * Stop any currently playing ringtone immediately.
 */
export function stopRingtone() {
  if (ringInterval) {
    clearInterval(ringInterval);
    ringInterval = null;
  }
}
