/**
 * Web Audio API synthesize chimes for real-time order alerts.
 * Pure synthetic tones — zero external media files or network dependencies.
 */

let sharedAudioContext: AudioContext | null = null;
let lastChimeTime = 0;

function getAudioContext(): AudioContext | null {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
      sharedAudioContext = new AudioContextClass();
    }
    if (sharedAudioContext.state === 'suspended') {
      sharedAudioContext.resume().catch(() => {});
    }
    return sharedAudioContext;
  } catch {
    return null;
  }
}

/**
 * Play a crystal-clear notification chime for incoming orders.
 * WhatsApp: Energetic, higher two-tone sequence (659Hz E5 -> 987Hz B5)
 * Web Store: Warm, majestic chord sequence (523Hz C5 -> 784Hz G5)
 */
export function playOrderAlertChime(source: 'whatsapp' | 'web' = 'web'): void {
  try {
    // Check if user has muted sound
    const isMuted = localStorage.getItem('indima_admin_order_sound_muted') === 'true';
    if (isMuted) return;

    // Debounce duplicate chimes within 600ms
    const nowMs = Date.now();
    if (nowMs - lastChimeTime < 600) return;
    lastChimeTime = nowMs;

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const isWhatsApp = source === 'whatsapp';

    const freq1 = isWhatsApp ? 659.25 : 523.25; // E5 or C5
    const freq2 = isWhatsApp ? 987.77 : 783.99; // B5 or G5

    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq1, now);
    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.linearRampToValueAtTime(0.28, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.36);

    // Tone 2 (Upper harmonic chime)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq2, now + 0.12);
    gain2.gain.setValueAtTime(0.0001, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.32, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.66);
  } catch (e) {
    console.debug('Audio alert skipped:', e);
  }
}
