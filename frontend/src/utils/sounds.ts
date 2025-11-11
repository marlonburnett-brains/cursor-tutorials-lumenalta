/**
 * Sound Effects Utility
 * 
 * Provides simple sound effects using Web Audio API.
 * All sound effects are optional and fail gracefully if not supported.
 */

let audioContext: AudioContext | null = null;

/**
 * Initialize Audio Context (lazy initialization)
 */
function getAudioContext(): AudioContext | null {
  try {
    if (!audioContext && typeof window !== 'undefined') {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
  } catch (error) {
    console.warn('Web Audio API not supported:', error);
    return null;
  }
}

/**
 * Play a simple "success" beep sound
 * Uses oscillator to generate a pleasant tone
 */
export function playSuccessSound(): void {
  try {
    const context = getAudioContext();
    if (!context) return;

    // Create oscillator for tone
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Set frequency (A note, 440 Hz)
    oscillator.frequency.setValueAtTime(440, context.currentTime);
    
    // Set volume (quiet)
    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);

    // Play for 100ms
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.1);
  } catch (error) {
    // Silently fail - sound effects are optional
    console.debug('Failed to play sound:', error);
  }
}

/**
 * Play a simple "click" sound
 */
export function playClickSound(): void {
  try {
    const context = getAudioContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    // Higher frequency for click
    oscillator.frequency.setValueAtTime(800, context.currentTime);
    
    // Shorter, quieter sound
    gainNode.gain.setValueAtTime(0.05, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.05);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.05);
  } catch (error) {
    console.debug('Failed to play sound:', error);
  }
}

